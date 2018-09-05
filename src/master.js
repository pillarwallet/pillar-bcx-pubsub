#!/usr/bin/env node
/** @module master.js */
const logger = require('./utils/logger');
const fork = require('child_process').fork;
const fs = require('fs');
const heapdump = require('heapdump');
const memwatch = require('memwatch-next');
const fname = `logs/master-heapdump.log`;
let hd;
const hashMaps = require('./utils/hashMaps.js');
const optionDefinitions = [
  { name: 'protocol', alias: 'p', type: String },
  { name: 'maxWallets', type: Number },
];
const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions, {partial: true});
const dbServices = require('./services/dbServices');
let protocol = 'Ethereum';
let maxWalletsPerPub = 500000;
exports.housekeeper;
exports.pubs = [];
exports.subs = [];
exports.index = 0;

/**
 * Dump the heap for analyses
 */
process.on('exit', (code) => {
  logger.info('Master exited with code: ' + code);
  heapdump.writeSnapshot((err, fname ) => {
    logger.info('Heap dump written to', fname);
  });
});

/**
 * subscribe to memory leak events
 */
memwatch.on('leak',function(info) {
  logger.info('Master: MEMORY LEAK: ' + JSON.stringify(info));
  logger.info('Size of hashmaps: Accounts= ' + hashMaps.accounts.count() + ', Assets= ' + hashMaps.assets.count() + 
              ', PendingTx= ' + hashMaps.pendingTx.count() + ', PendingAssets= ' + hashMaps.pendingAssets.count());
  heapdump.writeSnapshot((err, fname ) => {
    logger.info('Heap dump written to', fname);
  });
});

memwatch.on('stats',function(stats) {
  logger.info('Master: GARBAGE COLLECTION: ' + JSON.stringify(stats));
  logger.info('Size of hashmaps: Accounts= ' + hashMaps.accounts.count() + ', Assets= ' + hashMaps.assets.count() + 
              ', PendingTx= ' + hashMaps.pendingTx.count() + ', PendingAssets= ' + hashMaps.pendingAssets.count());
});

/**
 * Function to dump heap statistics to the log file every 1 hour
 */
exports.logHeap = function() {
  var diff = hd.end();
  logger.info('Master Heap Diff : ' + JSON.stringify(diff));
  logger.info('Size of hashmaps: Accounts= ' + hashMaps.accounts.count() + ', Assets= ' + hashMaps.assets.count() + 
              ', PendingTx= ' + hashMaps.pendingTx.count() + ', PendingAssets= ' + hashMaps.pendingAssets.count());
  hd = null;
  hd = new memwatch.HeapDiff();
};

/**
 * Function that initializes the master after validating command line arguments.
 * @param {any} options - List of command line arguments
 */
exports.init = function (options) {
  try {
    logger.info('Started executing master.init()');
    // validating input parameters
    if (options.protocol !== undefined) {
      protocol = options.protocol;
    }
    logger.info(`master.init(): Initializing master for ${protocol}`);

    if (options.maxWallets == undefined || options.maxWallets <= 0) {
      throw ({ message: 'Invalid configuration parameter maxWallets' });
    } else {
      logger.info(`master.init(): A new publisher will be spawned for every ${options.maxWallets} wallets..`);
      maxWalletsPerPub = options.maxWallets;
    }
    dbServices.dbConnect().then(() => {
      this.launch();
    });
    hd = new memwatch.HeapDiff();

    setInterval(() => {this.logHeap();},6000000);

  } catch (err) {
    logger.error(`master.init() failed: ${err.message}`);
  } finally {
    logger.info('Exited master.init()');
  }
};

/**
 * Function that spawns housekeeper, publisher and subscriber.
 */
exports.launch = function () {
  try {
    logger.info('Started executing master.launch()');

    if (!fs.existsSync('./cache')){
      fs.mkdirSync('./cache');
    }
    // start the first program pair of publisher and subscribers
    exports.housekeeper = fork(`${__dirname}/housekeeper.js`);
    exports.pubs[exports.index] = fork(`${__dirname}/publisher.js`);
    exports.subs[exports.index] = fork(`${__dirname}/subscriber.js`);
    fs.createWriteStream(`./cache/pub_${exports.index}`, { flags: 'w' });

    // handle events associated with the housekeeper child process.
    exports.housekeeper.on('message', (data) => {
      logger.info(`Housekeeper has sent a message: ${data}`);
      // broadcast the message to all publishers
      if (data.type === 'assets') {
        for (let i = 0; i < exports.pubs.length; i++) {
          exports.pubs[i++].send({ type: 'assets', message: data.message });
        }
      }
    });

    exports.housekeeper.on('close', (data) => {
      if (data !== undefined) {
        logger.info(`Housekeeper closed: ${data}`);
        exports.housekeeper = fork(`${__dirname}/housekeeper.js`);
      }
      
      heapdump.writeSnapshot((err, fname ) => {
        logger.info('Heap dump written to', fname);
      });
    });

    // handle events associated with the publisher child processes.
    exports.pubs[exports.index].on('message', (data) => {
      try {
        logger.info(`Master received message : ${JSON.stringify(data)} from publisher`);

        if(data.type === 'assets.request') {
          //send list of assets to publisher
          logger.info('Master Sending list of assets to monitor to each publisher');

          dbServices.contractsToMonitor('').then((assets) => {
            logger.info(assets.length + ' assets identified to be monitored');
            exports.pubs[exports.index - 1].send({ type: 'assets', message: assets});
          });
        }
        if (data.type === 'wallet.request') {
          logger.info(`Master Received ${data.type} - ${data.message} from publisher: ${exports.index}`);
          exports.notify(data.message, exports.pubs[exports.index - 1]);
          //notify the same message to the housekeeper to perform catchup services for the new wallet
          exports.notify(data.message,exports.housekeeper);
        }
        if (data.type === 'queue.full') {
          logger.info(`Master Received ${data.message} from publisher: ${exports.index}`);
          // fork new publisher-subscriber process pairs
          this.launch();
        }
      } catch(e) {
        logger.error('Master.launch() failed: ' + e);
      }
    });

    exports.pubs[exports.index].on('exit', (code,signal) => {
      const pubId = (exports.index - 1);
      logger.error(`Master: error occurred Publisher: ${pubId} closed with code: ${code}, signal: ${signal}`);
      /*
      if (code !== 0) {
        exports.pubs[pubId] = fork(`${__dirname}/publisher.js`);
        // send the cached set of wallet addresses
        logger.info(`Restarted publisher ${pubId}`);
        fs.readFile(`./cache/pub_${pubId}`, 'utf8', (err, data) => {
          if (err) {
            logger.error(`Error reading from file: ${err}`);
          }
          logger.info(`Data from cache: ${data}`);
          if (data !== '') {
            const message = data;
            logger.info(`sending message: ${JSON.stringify(message)} to publisher: ${pubId}`);
            exports.pubs[pubId].send({ type: 'accounts', message });
          }
        });
      }
      */
      heapdump.writeSnapshot((err, fname ) => {
        logger.info('Heap dump written to', fname);
      });
    });

    // handle events related to the subscriber child processes
    exports.subs[exports.index].on('exit', (code,signal) => {
      const subId = (exports.index - 1);
      /*
      if (code !== 0) {
        // restart the failed subscriber process
        logger.info(`Subscriber: ${subId} closed with code: ${code}, signal: ${signal}`);
        exports.subs[subId] = fork(`${__dirname}/subscriber.js`);
      }
      */
      heapdump.writeSnapshot((err, fname ) => {
        logger.info('Heap dump written to', fname);
      });
    });

    exports.index++;
  } catch (err) {
    logger.error('Master.launch(): exited with error ' + err);
  } finally {
    logger.info('Exited master.launch()');
  }
};

/**
 * function to notify the publisher of any new wallets added to database
 * @param {String} idFrom - The last known pillarId corresponding to a wallet.
 * @param {any} socket - Reference to the process id corresponding to the publisher
 */
exports.notify = function (idFrom, socket) {
  try {
    logger.info('Started executing master.notify()');

    // read the wallet address model and bring up multiple publishers
    dbServices.recentAccounts(idFrom).then((theWallets) => {
      if (theWallets !== undefined) {
        const message = [];
        for (let i = 0; i < theWallets.length; i++) {
	        var theWallet = theWallets[i];
	        //logger.debug('Wallet: ' + theWallets[i]);
          for (let j = 0; j < theWallet.addresses.length; j++) {
	          var theAddress = theWallet.addresses[j];
            if (theAddress.protocol.trim() === protocol) {
              message.push({ id: theWallet._id, walletId: theWallet.addresses[j].address, pillarId: theWallet.pillarId });
            } else {
		          logger.debug('Protocol doesnt match, ignoring,....');
	          }
          }
        }
        if (message.length > 0) {
          logger.info(`master.notify(): Sending IPC notification to monitor ${message.length} wallets.`);
          socket.send({ type: 'accounts', message: message });
          fs.appendFile(`./cache/pub_${exports.index - 1}`, JSON.stringify(message), (err) => {
            if (err) {
              throw ({ message: 'Caching of wallets failed!' });
            }
          });
        }
      }
    });
  } catch (err) {
    logger.error(`master.notify() failed: ${err}`);
  } finally {
    logger.info('Exited master.notify()');
  }
};
this.init(options);
