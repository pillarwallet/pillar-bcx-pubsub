#!/usr/bin/env node
/** ************************************************************************************ */
/*  Publisher                                                                          */
/** ************************************************************************************ */
require('dotenv').config();
const logger = require('./utils/logger');
const gethConnect = require('./services/gethConnect.js');
const dbServices = require('./services/dbServices.js');
const gethSubscribe = require('./services/gethSubscribe.js');
const rmqServices = require('./services/rmqServices.js');
const hashMaps = require('./utils/hashMaps.js');

let latestId = '';

process.on('message', (data) => {
  logger.info('Publisher has received message from master........');
  const message = data.message;
  if (data.type === 'accounts') {
    for (let i = 0; i < message.length; i++) {
      const obj = message[i];
      logger.info(`Publisher received notification to monitor :${obj.walletId.toLowerCase()} for pillarId: ${obj.pillarId}`);
      hashMaps.accounts.set(obj.walletId.toLowerCase(), obj.pillarId);
      latestId = obj.id;
    }
  } else if (data.type === 'assets') {
    // add the new asset to the assets hashmap
    for(let i = 0; i < message.length; i++) {
      const obj = message[i];
      logger.info(`Publisher received notification to monitor a new asset: ${obj.contractAddress.toLowerCase()}`);
      hashMaps.assets.set(obj.contractAddress.toLowerCase(), obj);
    }
  }
});

exports.initIPC = function () {
  try {
    logger.info('Started executing publisher.initIPC()');

    logger.info('Publisher requesting master a list of assets to monitor');

    process.send({
      type: 'assets.request',
      message: '',
    });

    logger.info('Publisher initializing the RMQ');
    setTimeout(() => {
      logger.info('Initializing RMQ.');
      rmqServices.initPubSubMQ()
        .then(() => {
          exports.initSubscriptions();
        });
    }, 100);

    logger.info('Publisher polling master for new wallets every 5 seconds');
    setInterval(() => {
      exports.poll();
    }, 5000);
  } catch (err) {
    logger.error('Publisher.init() failed: ', err.message);
    // throw err;
  } finally {
    logger.info('Exited publisher.initIPC()');
  }
};

exports.poll = function () {
  // logger.info('Requesting new wallet :');
  process.send({
    type: 'wallet.request',
    message: latestId,
  });
};


exports.initSubscriptions = function () {
  /* CONNECT TO GETH NODE */
  gethConnect.gethConnectDisplay()
    .then(() => {
      /* CONNECT TO DATABASE --> NEED TO REPLACE THIS WITH HASHTABLE */
      dbServices.dbConnectDisplayAccounts()
        .then(() => {
          /* SUBSCRIBE TO GETH NODE EVENTS */
          gethSubscribe.subscribePendingTx();
          gethSubscribe.subscribeBlockHeaders();
        })
        .catch((e) => { logger.error(e); });
    })
    .catch((e) => { logger.error(e); });
};

this.initIPC();

