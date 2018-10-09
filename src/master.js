#!/usr/bin/env node
/** @module master.js */
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://ab9bcca15a4e44aa917794a0b9d4f4c3@sentry.io/1289773' });

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
module.exports.pubs = [];
module.exports.subs = [];
module.exports.index = 0;


/**
 * Subscribe to unhandled promise rejection events in order fix any such errors
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('***************************************************************');
  logger.error('ERROR: Unhandled Rejection at MASTER:', JSON.stringify(reason));
  logger.error('***************************************************************');
});

/**
 * Handle REDIS client connection errors
 */
client.on("error", function (err) {
  logger.error("Master failed with REDIS client error: " + err);
});

/**
 * commonon logger function that prints out memory footprint of the process
 */
module.exports.logMemoryUsage = function (){
  const mem = process.memoryUsage();
  var rss = Math.round((mem.rss*10.0) / (1024*1024*10.0),2);
  var heap = Math.round((mem.heapUsed*10.0) / (1024*1024*10.0),2);
  var total = Math.round((mem.heapTotal*10.0) / (1024*1024*10.0),2);
  var external = Math.round((mem.external*10.0) / (1024*1024*10.0),2);
  logger.info('*****************************************************************************************************************************');
  logger.info(`Master - PID: ${process.pid}, RSS: ${rss} MB, HEAP: ${heap} MB, EXTERNAL: ${external} MB, TOTAL AVAILABLE: ${total} MB`);
  logger.info('*****************************************************************************************************************************');
};

/**
 * Function that initializes the master after validating command line arguments.
 * @param {any} options - List of command line arguments
 */
module.exports.init = function (options) {
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
module.exports.launch = function () {
  try {
    logger.info('Started executing master.launch()');

    // start the first program pair of publisher and subscribers
    client.del(`pub_${module.exports.index}`); // clears out the previous cache file during a fresh start

    module.exports.pubs[module.exports.index] = fork(`${__dirname}/publisher.js`,[`${module.exports.index}`]);
    //notify the publisher the maximum wallets to monitor
    module.exports.pubs[module.exports.index].send({type: 'config', message: maxWalletsPerPub});

    module.exports.subs[module.exports.index] = fork(`${__dirname}/subscriber.js`,[`${module.exports.index}`]);
    logger.info(`Master has launched Publisher (PID: ${module.exports.pubs[module.exports.index].pid}) and Subscriber (PID: ${module.exports.subs[module.exports.index].pid}) processes.`);

    // handle events associated with the publisher child processes.
    module.exports.pubs[module.exports.index].on('message', (data) => {
      try {
        logger.info(`Master received message : ${JSON.stringify(data)} from publisher`);

        if(data.type === 'assets.request') {
          //send list of assets to publisher
          logger.info('Master Sending list of assets to monitor to each publisher');

          dbServices.contractsToMonitor('').then((assets) => {
            logger.info(assets.length + ' assets identified to be monitored');
            module.exports.pubs[module.exports.index - 1].send({ type: 'assets', message: assets});
          });
        }
        if (data.type === 'wallet.request') {
          logger.info(`Master Received ${data.type} - ${data.message} from publisher: ${module.exports.index}`);
          // read the wallet address model and bring up multiple publishers
          dbServices.recentAccounts(data.message).then((theWallets) => {
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
              return message;
            } else {
              return;              
            }
          }).then((message) => {
            module.exports.notify(message, module.exports.pubs[module.exports.index - 1]);
            //notify the same message to the housekeeper to perform catchup services for the new wallet
            logger.info('Master notifying Housekeeper to monitor new wallet registrations');
            module.exports.notify(message,module.exports.housekeeper);
            module.exports.logMemoryUsage();
          });
        }
        if (data.type === 'queue.full') {
          logger.info(`Master Received ${data.message} from publisher: ${module.exports.index}`);
          // fork new publisher-subscriber process pairs
          this.launch();
        }
      } catch(e) {
        logger.error('Master.launch() failed: ' + e);
      }
    });

    module.exports.pubs[module.exports.index].on('close', (data) => {
      const pubId = (module.exports.index - 1);
      logger.error(`Master: error occurred Publisher: ${pubId} (PID: ${module.exports.pubs[pubId].pid}) closed with code: ${data}`);
    });

    // handle events related to the subscriber child processes
    module.exports.subs[module.exports.index].on('close', (data) => {
      const subId = (module.exports.index - 1);
      logger.error(`Master: error occurred Publisher: ${subId} (PID: ${module.exports.subs[subId].pid}) closed with code: ${data}`);
    });

    module.exports.index++;
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
module.exports.notify = function(message,socket) {
  try {
    logger.info('Started executing master.notify()');

    if (message.length > 0) {
      logger.info(`master.notify(): Sending IPC notification to monitor ${message.length} wallets.`);
      socket.send({ type: 'accounts', message: message });
    } else {
      logger.debug('Master nothing to notify to publisher or housekeeper');
    }

  } catch (err) {
    logger.error(`master.notify() failed: ${err}`);
  } finally {
    logger.info('Exited master.notify()');
  }
};

this.init(options);
