/*
Copyright (C) 2019 Stiftung Pillar Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

#!/usr/bin/env node*/
/** @module master.js */
const diagnostics = require('./utils/diagnostics');

const logger = require('./utils/logger');
const fork = require('child_process').fork;

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
  }
};

/**
 * Function that spawns housekeeper, publisher and subscriber.
 */
module.exports.launch = function () {
  try {
    logger.info('Started executing master.launch()');

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
            logger.info(`${assets.length} assets identified to be monitored`);
            module.exports.pubs[module.exports.index - 1].send({ type: 'assets', message: assets});
          });
        }
        if (data.type === 'wallet.request') {
          logger.info(`Master Received ${data.type} - ${data.message} from publisher: ${module.exports.index}`);
          dbServices.recentAccounts(data.message).then((theWallets) => {
            if (theWallets !== undefined) {
              logger.info(`Master found ${theWallets.length} new accounts`);
              const message = [];
              var i = 0;
              var cnt = theWallets.length;
              theWallets.forEach((theWallet) => {
                i++;
                var addresses = theWallet.addresses.filter((address) => {
                  if(address.protocol === 'Ethereum') {
                    return address;
                  }
                });
                logger.info(`Filtered message: ${JSON.stringify(addresses)}`);
                addresses.forEach((address) => {
                  message.push({ id: theWallet._id, walletId: address.address, pillarId: theWallet.pillarId });
                });
                if(i === cnt) {
                  logger.info(`Master found ${message.length} relevant new wallets`);
                  module.exports.notify(message, module.exports.pubs[module.exports.index - 1]);
                }
              });
            }
          });
        }
      } catch(e) {
        logger.error(`Master.launch() failed: ${e.message}`);
      }
    });

    module.exports.pubs[module.exports.index].on('close', (data) => {
      const pubId = (module.exports.index - 1);
      logger.error(`Master: error occurred Publisher: ${pubId} (PID: ${module.exports.pubs[pubId].pid}) closed with code: ${data}`);
    });

    // handle events related to the subscriber child processes
    module.exports.subs[module.exports.index].on('close', (data) => {
      const subId = (module.exports.index - 1);
      logger.error(`Master: error occurred Subscriber: ${subId} (PID: ${module.exports.subs[subId].pid}) closed with code: ${data}`);
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
    logger.info(`Message: ${JSON.stringify(message)}`);
    if (message.length > 0) {
      logger.info('master.notify(): Sending IPC notification to monitor wallets.');
      socket.send({ type: 'accounts', message: message });
    } else {
      logger.debug('Master nothing to notify to publisher or housekeeper');
    }

  } catch (err) {
    logger.error(`master.notify() failed: ${err}`);
  }
};

this.init(options);
