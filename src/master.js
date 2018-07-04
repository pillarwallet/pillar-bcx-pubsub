#!/usr/bin/env node
/** ************************************************************************************ */
/*  Pub-Sub master that is used to spawn new instances of publishers and subscribers  */
/** ************************************************************************************ */
const logger = require('./utils/logger');
const { fork } = require('child_process');
const fs = require('fs');
const commandLineArgs = require('command-line-args');

const OPTION_DEFINITIONS = [
  { name: 'protocol',
    alias: 'p',
    type: String },
  /*
  { name: 'minPort', type: Number },
  { name: 'maxPort', type: Number },
  */
  { name: 'maxWallets', type: Number },
];

const OPTIONS = commandLineArgs(OPTION_DEFINITIONS, { partial: true });
const DB_SERVICES = require('./services/dbServices');

// protocol has to be setup during init, we will have one master per protocol
let PROTOCOL = 'Ethereum';

exports.housekeeper = {};
exports.pubs = [];
exports.subs = [];
exports.index = 0;

exports.init = (options) => {
  try {
    logger.info('Started executing master.init()');
    // validating input parameters
    if (typeof options.protocol !== 'undefined') {
      PROTOCOL = options.protocol;
    }
    logger.info(`master.init(): Initializing master for ${PROTOCOL}`);
    /*
    if ((options.minPort !== undefined) && (options.maxPort !== undefined)
    && (options.minPort >= 5500) && (options.minPort < options.maxPort)) {
      currentPort = options.minPort;
    } else {
      throw ({ message: 'Invalid configuration parameters minPort, maxPort' });
    }
    */
    if (typeof options.maxWallets === 'undefined' || options.maxWallets <= 0) {
      throw new Error('Invalid configuration parameter maxWallets');
    } else {
      logger.info(`master.init(): A new publisher will be spawned for every ${options.maxWallets} wallets..`);
    }
    this.launch();
  } catch (err) {
    logger.error(`master.init() failed: ${err.message}`);
  } finally {
    logger.info('Exited master.init()');
  }
};

exports.launch = () => {
  try {
    logger.info('Started executing master.launch()');
    // Start the first program pair of publisher and subscribers
    exports.housekeeper = fork(`${__dirname}/housekeeper.js`);
    exports.pubs[exports.index] = fork(`${__dirname}/publisher.js`);
    exports.subs[exports.index] = fork(`${__dirname}/subscriber.js`);
    fs.createWriteStream(`./cache/pub_${exports.index}`, { flags: 'w' });

    // Handle events associated with the housekeeper child process.
    exports.housekeeper.on('message', (data) => {
      logger.info(`Housekeeper has sent a message: ${data}`);
      // Broadcast the message to all publishers.
      if (data.type === 'assets') {
        for (let i = 0; i < exports.pubs.length; i++) {
          const index = i + 1;
          exports.pubs[index].send({ type: 'assets', message: data.message });
        }
      }
    });

    exports.housekeeper.on('close', (data) => {
      if (typeof data !== 'undefined') {
        logger.info(`Housekeeper closed: ${data}`);
        exports.housekeeper = fork(`${__dirname}/housekeeper.js`);
      }
    });

    // Handle events associated with the publisher child processes.
    exports.pubs[exports.index].on('message', (data) => {
      logger.info(`Master received message : ${JSON.stringify(data)} from publisher`);
      if (data.type === 'assets.request') {
        // Send list of assets to the publisher.
        logger.info('Master Sending list of assets to monitor to each publisher');
        DB_SERVICES.contractsToMonitor('')
          .then((assets) => {
            logger.info(`${assets.length} assets identified to be monitored`);
            exports.pubs[exports.index].send({ type: 'assets', message: assets });
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

      if (typeof data !== 'undefined') {
        logger.info(`Publisher: ${pubId} closed: ${data}`);
        exports.pubs[pubId] = fork(`${__dirname}/publisher.js`);
        // send the cached set of wallet addresses
        logger.info(`Restarted publisher ${pubId}`);
        fs.readFile(`./cache/pub_${pubId}`, 'utf8', (err, fileData) => {
          if (err) {
            logger.error(`Error reading from file: ${err}`);
          }
          logger.info(`Data from cache: ${fileData}`);
          if (fileData !== '') {
            const message = JSON.parse(fileData);
            logger.info(`sending message: ${JSON.stringify(message)} to publisher: ${pubId}`);
            exports.pubs[pubId].send({ type: 'accounts', message });
          }
        });
      }
    });

    // handle events related to the subscriber child processes
    exports.subs[exports.index].on('close', (data) => {
      const subId = (exports.index - 1);

      if (typeof data !== 'undefined') {
        // restart the failed subscriber process
        logger.info(`Subscriber: ${subId} closed: ${data}`);
        exports.subs[subId] = fork(`${__dirname}/subscriber.js`);
      }
    });

    exports.index += 1;
  } catch (err) {
    // throw err;
    logger.error(err.mesasage);
  } finally {
    logger.info('Exited master.launch()');
  }
};

exports.notify = (idFrom, socket) => {
  try {
    logger.info('Started executing master.notify()');

    // read the wallet address model and bring up multiple publishers
    DB_SERVICES.recentAccounts(idFrom).then((theWallets) => {
      if (typeof theWallets !== 'undefined') {
        const message = [];
        for (let i = 0; i < theWallets.length; i++) {
          for (let j = 0; j < theWallets[i].addresses.length; j++) {
            if (theWallets[i].addresses[j].protocol === PROTOCOL) {
              message.push({
                id: theWallets[i]._id,
                walletId: theWallets[i].addresses[j].address,
                pillarId: theWallets[i].pillarId
              });
            }
          }
        }
        if (message.length > 0) {
          logger.info(`master.notify(): Sending IPC notification to monitor ${message.length} wallets.`);
          socket.send({ type: 'accounts', message });
          fs.appendFile(`./cache/pub_${exports.index - 1}`, JSON.stringify(message), (err) => {
            if (err) {
              throw ({ message: 'Caching of wallets failed!' });
            }
          });
        }
      }
    })
      .catch((err) => {
        throw (err);
      });
  } catch (err) {
    logger.error(`master.notify() failed: ${err}`);
  } finally {
    logger.info('Exited master.notify()');
  }
};
this.init(OPTIONS);
