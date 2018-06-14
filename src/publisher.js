#!/usr/bin/env node
/** ************************************************************************************ */
/*  Publisher                                                                          */
/** ************************************************************************************ */
const logger = require('./utils/logger');
const gethConnect = require('./services/gethConnect.js');
const dbServices = require('./services/dbServices.js');
const gethSubscribe = require('./services/gethSubscribe.js');
const rmqServices = require('./services/rmqServices.js');


const HashMap = require('hashmap');

var accounts;
var assets;
var latestId;

process.on('message',(data) => {
  logger.info('Publisher has received message from master........');
  const message = data.message;
  if (data.type === 'accounts') {
    for (let i = 0; i < message.length; i++) {
      const obj = message[i];
      logger.info('Publisher received notification to monitor :' + obj.walletId + ' for pillarId: ' + obj.pillarId);
      accounts.set(obj.walletId, obj.pillarId);
      latestId = obj.id;
    }
  } else if (data.type === 'assets') {
    //add the new asset to the assets hashmap
    logger.info('Publisher received notification to monitor a new asset: ' + message.contractAddress);
    assets.set(message.contractAddress, message);
  }
});

exports.initIPC = function () {
  try {
    logger.info('Started executing publisher.initIPC()');

    accounts = new HashMap();
    assets = new HashMap();

    setInterval(() => {
      exports.poll();
    },5000);
    
    rmqServices.initMQ()
      .then(() => {
        this.initSubscriptions();
      })
    .catch((e) => { logger.error(e); });
  } catch (err) {
    logger.error('Publisher.init() failed: ', err.message);
    throw err;
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
          gethSubscribe.subscribePendingTx(accounts, assets);
          gethSubscribe.subscribeBlockHeaders();
          gethSubscribe.subscribeAllDBERC20SmartContracts(accounts, assets);
        })
        .catch((e) => { logger.error(e); });
    })
    .catch((e) => { logger.error(e); });
};

this.initIPC();

