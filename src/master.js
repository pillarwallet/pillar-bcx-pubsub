#!/usr/bin/env node
/** @module master.js */
const logger = require('./utils/logger');
const fork = require('child_process').fork;
const fs = require('fs');
const redis = require('redis');
let client = redis.createClient();

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

process.on('unhandledRejection', (reason, promise) => {
  logger.error('***********************************************');
  logger.error('ERROR: Unhandled Rejection at MASTER:', reason.stack || reason);
  logger.error('***********************************************');
});

/**
 * Handle REDIS client connection errors
 */
client.on("error", function (err) {
  logger.error("Master failed with REDIS client error: " + err);
});

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

    // start the first program pair of publisher and subscribers
    client.del(`pub_${exports.index}`); // clears out the previous cache file during a fresh start

    exports.housekeeper = fork(`${__dirname}/housekeeper.js`);
    exports.pubs[exports.index] = fork(`${__dirname}/publisher.js`,[`${exports.index}`]);
    exports.subs[exports.index] = fork(`${__dirname}/subscriber.js`,[`${exports.index}`]);
    logger.info(`Master has launched Houskeeper (PID: ${exports.housekeeper.pid}), Publisher (PID: ${exports.pubs[exports.index].pid}) and Subscriber (PID: ${exports.subs[exports.index].pid}) processes.`);

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
      logger.error(`Master: error occurred Housekeeper (PID: ${exports.housekeeper.pid})) closed with code: ${data}`);
      //COMMENTING OUT THE AUTO RESTART
      /*
      if (data !== undefined) {
        logger.info(`Master: error occurred Housekeeper closed with exit code: ${data}`);
        exports.housekeeper = fork(`${__dirname}/housekeeper.js`);
      }
      */
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

    exports.pubs[exports.index].on('close', (data) => {
      const pubId = (exports.index - 1);
      logger.error(`Master: error occurred Publisher: ${pubId} (PID: ${exports.pubs[pubId].pid}) closed with code: ${data}`);
      
      //COMMENTING OUT THE AUTO RESTART
      /*
      if (data !== undefined) {
        exports.pubs[pubId] = fork(`${__dirname}/publisher.js`,[`${exports.index}`]);
        // send the cached set of wallet addresses
        logger.info(`Restarted publisher ${pubId} (PID: ${exports.pubs[pubId].pid})`);

        //read the wallets from redis and pass on to server
        client.get(`pub_${pubId}`).then((res) => {
          logger.info(`Master: restarted the publisher with the following accounts ${res}`);
          exports.pubs[pubId].send({ type: 'accounts', message:res });
        });
      }
      */
    });

    // handle events related to the subscriber child processes
    exports.subs[exports.index].on('close', (data) => {
      const subId = (exports.index - 1);
      logger.error(`Master: error occurred Publisher: ${subId} (PID: ${exports.subs[subId].pid}) closed with code: ${data}`);
      //COMMENTING OUT THE AUTO RESTART
      /*
      if (data !== undefined) {
        // restart the failed subscriber process
        logger.info(`Master: error occurred Subscriber: ${subId} (PID: ${exports.subs[subId].pid})  closed with code: ${data}`);
        exports.subs[subId] = fork(`${__dirname}/subscriber.js`,[`${exports.index}`]);
        logger.info(`Restarted subscriber ${subId} (PID: ${exports.subs[subId].pid})`);
      }
      */
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
