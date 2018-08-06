#!/usr/bin/env node
/** @module publisher.js */
require('dotenv').config();
const logger = require('./utils/logger');
const ethService = require('./services/ethService.js');
const rmqServices = require('./services/rmqServices.js');
const hashMaps = require('./utils/hashMaps.js');
let latestId = '';

/**
 * Function handling IPC notification that are received from the master
 * @param {any} message - The IPC message that sent from the master
 */
process.on('message', (data) => {
  try {
    logger.info(`Publisher has received message from master: ${data.type}`);
    const { message } = data;

    if (data.type === 'accounts') {
      for (let i = 0; i < message.length; i++) {
        const obj = message[i];
        logger.info(`Publisher received notification to monitor :${obj.walletId.toLowerCase()} for pillarId: ${obj.pillarId}`);
        hashMaps.accounts.set(obj.walletId.toLowerCase(), obj.pillarId);
        latestId = obj.id;
      }
    } else if (data.type === 'assets') {
      logger.info('Publisher initializing assets.');
      // add the new asset to the assets hashmap
      for (let i = 0; i < message.length; i++) {
        const obj = message[i];
        logger.info(`Publisher received notification to monitor a new asset: ${obj.contractAddress.toLowerCase()}`);
        hashMaps.assets.set(obj.contractAddress.toLowerCase(), obj);
        ethService.subscribeTransferEvents(obj.contractAddress);
      }
    }
  }catch(e) {
    logger.error('Publisher: Error occured in publisher: ' + e);
  }
});

/**
 * Function that initializes inter process communication queue
 */
exports.initIPC = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.info('Started executing publisher.initIPC()');
      logger.info('Publisher requesting master a list of assets to monitor');
      process.send({ type: 'assets.request' });

    logger.info('Publisher initializing the RMQ');
    setTimeout(() => {
      logger.info('Publisher Initializing RMQ.');
      rmqServices.initPubSubMQ()
      exports.initSubscriptions();
    }, 100);

      logger.info('Publisher polling master for new wallets every 5 seconds');
      setInterval(() => {
        exports.poll();
      }, 5000);
    } catch (err) {
      logger.error('Publisher.init() failed: ', err.message);
      // throw err;
      reject(err);
    } finally {
      logger.info('Exited publisher.initIPC()');
      resolve();
    }
  });
};

/**
 * Function that continuosly polls master for new wallets/assets.
 */
exports.poll = function () {
  // logger.info('Requesting new wallet :');
  if (hashMaps.assets.count() === 0) {
    process.send({ type: 'assets.request' });
  }
  // request new wallets
  process.send({ type: 'wallet.request', message: latestId });
};

/**
 * Function that initializes the geth subscriptions
 */
exports.initSubscriptions = function () {
  logger.info('Publisher subscribing to geth websocket events...');
  //subscribe to pending transactions
  ethService.subscribePendingTxn();
  //subscribe to block headers
  ethService.subscribeBlockHeaders();
  if (hashMaps.assets.count() > 0) {
    //subscribe to transfer events of each monitored smart contract
    const smartContractsArray = hashMaps.assets.values();
    smartContractsArray.forEach((ERC20SmartContract) => {
      ethService.subscribeTransferEvents(ERC20SmartContract);
    });
  }
  logger.info('Publisher completed websocket subscriptions.');
};

this.initIPC();

