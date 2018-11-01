#!/usr/bin/env node
/** @module publisher.js */
'use strict';
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://ab9bcca15a4e44aa917794a0b9d4f4c3@sentry.io/1289773' });
require('dotenv').config();
const bluebird = require('bluebird');
const logger = require('./utils/logger');
const ethService = require('./services/ethService.js');
const rmqServices = require('./services/rmqServices.js');
const hashMaps = require('./utils/hashMaps.js');
const redis = require('redis');
const CronJob = require('cron').CronJob;
let client = redis.createClient();;
bluebird.promisifyAll(redis);
let latestId = '';
let runId = 0;
let MAX_WALLETS = 500000;
let processCnt = 0;
let LAST_BLOCK_NUMBER = 0;
const memwatch = require('memwatch-next');
const sizeof = require('sizeof');

/**
 * Function that subscribes to redis related connection errors.
 */
client.on("error", function (err) {
  logger.error("Publisher failed with REDIS client error: " + err);
});

/**
 * Subscribing to memory leak stats
 */
memwatch.on('stats',function(stats) {
  logger.info('Publisher: GARBAGE COLLECTION: ' + JSON.stringify(stats));
  logger.info('Size of hashmaps:  Assets= ' + hashMaps.assets.keys().length + 
              ', PendingTx= ' + hashMaps.pendingTx.keys().length + ', PendingAssets= ' + hashMaps.pendingAssets.keys().length);
  logger.info('Hashmap size: Assets= ' + sizeof.sizeof(hashMaps.assets,true) + 
              ', PendingTx= ' + sizeof.sizeof(hashMaps.pendingTx,true) + ', PendingAssets= ' + sizeof.sizeof(hashMaps.pendingAssets,true));
});

/**
 * Function for reporting unhandled promise rejections.
 * @param {any} reason - reason for failure/stack trace
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('***********************************************');
  logger.error('ERROR: Unhandled Rejection at PUBLISHER:', JSON.stringify(reason));
  logger.error('***********************************************');
});

/**
 * Function handling IPC notification that are received from the master
 * @param {any} message - The IPC message that sent from the master
 * There are 4 types of IPC messages that the publisher can receive from the master, these are
 * accounts - This is a notification of a newly registered wallets/accounts that the master sends in to publisher to monitor
 * assets - This is a set of new assets/smart contracts which the publisher should add to its internal monitoring list
 * config - This a configuration setting that determine the maximum number of wallets/accounts that a publisher to monitor.
 */
process.on('message', async (data) => {
  try {
    const { message } = data;
    logger.info(`Publisher has received message from master: ${data.type}`);
    
    if (data.type === 'accounts') {
      logger.info(`Publisher received accounts: ${message.length} to monitor.`);
      for (let i = 0; i < message.length; i++) {
        const obj = message[i];
        if(obj !== undefined) {
          if(!(await client.existsAsync(obj.walletId.toLowerCase()))) {
            client.set(obj.walletId.toLowerCase(),obj.pillarId,redis.print);
            logger.info(`Publisher received notification to monitor: ${obj.walletId.toLowerCase()} for pillarId: ${obj.pillarId} , accountsSize: ${hashMaps.accounts.keys().length}`);
            latestId = obj.id;
            client.set('latestId',obj.id,redis.print);
          }
        }
      }
    } else if (data.type === 'assets') {
      logger.info('Publisher initializing assets.');
      // add the new asset to the assets hashmap
      for (let i = 0; i < message.length; i++) {
        const obj = message[i];
        if(obj !== undefined) {
          hashMaps.assets.set(obj.contractAddress.toLowerCase(), obj);
          logger.info(`Publisher received notification to monitor a new asset: ${obj.contractAddress.toLowerCase()}, assetsSize: ${hashMaps.assets.keys().length}`);
          ethService.subscribeTransferEvents(obj.contractAddress);
        }
      }
    } else if(data.type == 'config') {
      MAX_WALLETS = message;
    }
  }catch(e) {
    logger.error('Publisher: Error occured in publisher: ' + e);
  }
});

/**
 * Function that initializes inter process communication queue
 */
module.exports.initIPC = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info('Started executing publisher.initIPC()');

      if(process.argv[2] === undefined) {
        throw ({ message: 'Invalid runId parameter.' });
      } else {
        runId = process.argv[2];
      }

      //check if latestId key exists in redis, if not set an empty value
      if((await client.existsAsync('latestId'))) {
        logger.info('Publisher fetching last processed id from redis server');
        latestId = await client.getAsync('latestId');
      } else {
        logger.info('First run of the process, initializing last process id on redis');
        client.set('latestId','',redis.print);
      }
      logger.info(`Publisher identified last process id from redis to be : ${latestId}`);

      //request master for a list of assets to be monitored
      process.send({ type: 'assets.request' });
      setTimeout(() => {
        logger.info('Publisher Initializing RMQ.');
        rmqServices.initPubSubMQ().then((err)=> {
          if(!err) {
            module.exports.initSubscriptions();
          } else {
            logger.error('ERROR: Publisher failed to initialize the RMQ pubsub queue!');
          }
        });
      }, 100);
  
      logger.info('Publisher starting a cron to poll master for new wallets every 5 seconds');
      const job = new CronJob('*/5 * * * * *',() => {
        module.exports.poll();
      });
      job.start();
    } catch (err) {
      logger.error('Publisher.init() failed: ', err.message);
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
module.exports.poll = function () {
  processCnt++;
  if(processCnt === 12) {
    processCnt = 0;
    if(hashMaps.LATEST_BLOCK_NUMBER <= LAST_BLOCK_NUMBER) {
      logger.error('####GETH DOWN?? NO SYNC FOR PAST 1 MINUTE####');
    }
  }
  if (hashMaps.assets.count() === 0) {
    process.send({ type: 'assets.request' });
  }
  const mem = process.memoryUsage();
  var rss = Math.round((mem.rss*10.0) / (1024*1024*10.0),2);
  var heap = Math.round((mem.heapUsed*10.0) / (1024*1024*10.0),2);
  var total = Math.round((mem.heapTotal*10.0) / (1024*1024*10.0),2);
  var external = Math.round((mem.external*10.0) / (1024*1024*10.0),2);
  // request new wallets
  logger.info('Size of hashmaps: Assets= ' + hashMaps.assets.keys().length + 
              ', PendingTx= ' + hashMaps.pendingTx.keys().length + ', PendingAssets= ' + hashMaps.pendingAssets.keys().length);
  logger.info('Hashmap size: Assets= ' + sizeof.sizeof(hashMaps.assets,true) + 
              ', PendingTx= ' + sizeof.sizeof(hashMaps.pendingTx,true) + ', PendingAssets= ' + sizeof.sizeof(hashMaps.pendingAssets,true));             
  logger.info(`Publisher - PID: ${process.pid}, RSS: ${rss} MB, HEAP: ${heap} MB, EXTERNAL: ${external} MB, TOTAL AVAILABLE: ${total} MB`);
  logger.info(`LAST PROCESSED BLOCK= ${LAST_BLOCK_NUMBER}, LATEST BLOCK NUMBER= ${hashMaps.LATEST_BLOCK_NUMBER}`);
  process.send({ type: 'wallet.request', message: latestId });
  LAST_BLOCK_NUMBER = hashMaps.LATEST_BLOCK_NUMBER;
};

/**
 * Function that initializes the geth subscriptions
 */
module.exports.initSubscriptions = function () {
  logger.info('Publisher subscribing to geth websocket events...');
  //subscribe to pending transactions
  ethService.subscribePendingTxn();
  //subscribe to block headers
  ethService.subscribeBlockHeaders();
  if (hashMaps.assets.count() > 0) {
    //subscribe to transfer events of each monitored smart contract
    const smartContractsArray = hashMaps.assets.values();
    smartContractsArray.forEach((ERC20SmartContract) => {
      ethService.subscribeTransferEvents(ERC20SmartContract.contractAddress);
    });
  }
  logger.info('Publisher completed websocket subscriptions.');
};

this.initIPC();

