#!/usr/bin/env node
/** ************************************************************************************ */
/*  Pub-Sub master that is used to spawn new instances of publishers and subscribers  */
/** ************************************************************************************ */
const logger = require('./utils/logger');
const fork = require('child_process').fork;
const fs = require('fs');

const optionDefinitions = [
  { name: 'protocol', alias: 'p', type: String },
  /*
  { name: 'minPort', type: Number },
  { name: 'maxPort', type: Number },
  */
  { name: 'maxWallets', type: Number },
];
const commandLineArgs = require('command-line-args');

const options = commandLineArgs(optionDefinitions, {partial: true});

const dbServices = require('./services/dbServices');

// protocol has to be setup during init, we will have one master per protocol
let protocol = 'Ethereum';
let maxWalletsPerPub = 500000;

exports.housekeeper;
exports.pubs = [];
exports.subs = [];
exports.index = 0;

exports.init = function (options) {
  try {
    logger.info('Started executing master.init()');
    // validating input parameters
    if (options.protocol !== undefined) {
      protocol = options.protocol;
    }
    logger.info(`master.init(): Initializing master for ${protocol}`);
    /*
    if ((options.minPort !== undefined) && (options.maxPort !== undefined) && (options.minPort >= 5500) && (options.minPort < options.maxPort)) {
      currentPort = options.minPort;
    } else {
      throw ({ message: 'Invalid configuration parameters minPort, maxPort' });
    }
    */

    if (options.maxWallets == undefined || options.maxWallets <= 0) {
      throw ({ message: 'Invalid configuration parameter maxWallets' });
    } else {
      logger.info(`master.init(): A new publisher will be spawned for every ${options.maxWallets} wallets..`);
      maxWalletsPerPub = options.maxWallets;
    }
    this.launch();
  } catch (err) {
    logger.error(`master.init() failed: ${err.message}`);
  } finally {
    logger.info('Exited master.init()');
  }
};

exports.launch = function () {
  try {
    logger.info('Started executing master.launch()');
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
    });

    // handle events associated with the publisher child processes.
    exports.pubs[exports.index].on('message', (data) => {
      logger.info(`Master received message : ${JSON.stringify(data)} from publisher`);
      if(data.type == 'assets.request') {
        //send list of assets to the publisher
        logger.info('Master Sending list of assets to monitor to each publisher');
        dbServices.contractsToMonitor('')
          .then((assets) => {
            logger.info(assets.length + ' assets identified to be monitored');
            exports.pubs[exports.index].send({ type: 'assets', message: assets});
          });
      }
      if (data.type === 'wallet.request') {
        logger.info(`Master Received ${data.type} - ${data.message} from publisher: ${exports.index}`);
        exports.notify(data.message, exports.pubs[exports.index - 1]);
      }
      if (data.type === 'queue.full') {
        logger.info(`Master Received ${data.message} from publisher: ${exports.index}`);
        // fork new publisher-subscriber process pairs
        this.launch();
      }
    });

    exports.pubs[exports.index].on('close', (data) => {
      const pubId = (exports.index - 1);

      if (data !== undefined) {
        logger.info(`Publisher: ${pubId} closed: ${data}`);
        exports.pubs[pubId] = fork(`${__dirname}/publisher.js`);
        // send the cached set of wallet addresses
        logger.info(`Restarted publisher ${pubId}`);
        fs.readFile(`./cache/pub_${pubId}`, 'utf8', (err, data) => {
          if (err) {
            logger.error(`Error reading from file: ${err}`);
          }
          logger.info(`Data from cache: ${data}`);
          if (data !== '') {
            const message = JSON.parse(data);
            logger.info(`sending message: ${JSON.stringify(message)} to publisher: ${pubId}`);
            exports.pubs[pubId].send({ type: 'accounts', message });
          }
        });
      }
    });

    // handle events related to the subscriber child processes
    exports.subs[exports.index].on('close', (data) => {
      const subId = (exports.index - 1);

      if (data !== undefined) {
        // restart the failed subscriber process
        logger.info(`Subscriber: ${subId} closed: ${data}`);
        exports.subs[subId] = fork(`${__dirname}/subscriber.js`);
      }
    });
    
    exports.index++;
  } catch (err) {
    // throw err;
    logger.error(err.mesasage);
  } finally {
    logger.info('Exited master.launch()');
  }
};

exports.notify = function (idFrom, socket) {
  try {
    logger.info('Started executing master.notify()');

    // read the wallet address model and bring up multiple publishers
    dbServices.recentAccounts(idFrom).then((theWallets) => {
      logger.info('Master.notify(): received new wallets to monitor: ' + JSON.stringify(theWallets));
      if (theWallets !== undefined) {
        const message = [];
        for (let i = 0; i < theWallets.length; i++) {
	        var theWallet = theWallets[i];
	        logger.debug('Wallet: ' + theWallets[i]);
          for (let j = 0; j < theWallet.addresses.length; j++) {
	          var theAddress = theWallet.addresses[j];
            logger.debug('The address protocol: ' + theAddress.protocol.trim());
            logger.debug('Protocol: ' + protocol);
            logger.debug('Match? : ' + (theAddress.protocol.trim() === protocol));
            if (theAddress.protocol.trim() === protocol) {
              logger.info('master.notify() - notifying the publisher of a new wallet: ' + theWallet.addresses[j].address + '/pillarId: ' + theWallet.pillarId);
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
    })
    .catch(err => {
      throw(err)
    });
  } catch (err) {
    logger.error(`master.notify() failed: ${err}`);
  } finally {
    logger.info('Exited master.notify()');
  }
};
this.init(options);
