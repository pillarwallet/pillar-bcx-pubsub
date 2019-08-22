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
*/


require('./utils/diagnostics');
require('dotenv').config();
const logger = require('./utils/logger');
const ethService = require('./services/ethService.js');
const rmqServices = require('./services/rmqServices.js');
const hashMaps = require('./utils/hashMaps.js');
const fs = require('fs');
const redisService = require('./services/redisService')

const GETH_STATUS_FILE = '/tmp/geth_status';
const { CronJob } = require('cron');
let latestId = '';
let processCnt = 0;
let gethCheck = 0;
let LAST_BLOCK_NUMBER = 0;
const sizeof = require('sizeof');

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at: ' + reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});

/**
 * Connecting to Redis
 */
let client;
try {
  client = redisService.connectRedis()
  logger.info("publisher successfully connected to Redis server")
  client.on('error', err => {
    logger.error(`publisher failed with REDIS client error: ${err}`);
  });
} catch (e) { logger.error(e) }



/**
 * Function handling IPC notification that are received from the master
 * @param {any} message - The IPC message that sent from the master
 * There are 4 types of IPC messages that the publisher can receive from the master, these are
 * accounts - This is a notification of a newly registered wallets/accounts that the master sends in to publisher to monitor
 * assets - This is a set of new assets/smart contracts which the publisher should add to its internal monitoring list
 * config - This a configuration setting that determine the maximum number of wallets/accounts that a publisher to monitor.
 */
module.exports.publisherOnMessage = function() {
  process.on('message', async data => {
    try {
      const { message } = data;
      logger.debug(`Publisher has received message from master: ${data.type}`);

      if (data.type === 'accounts') {
        logger.info(
          `Publisher received accounts: ${message.length} to monitor.`,
        );
        for (let i = 0; i < message.length; i++) {
          const obj = message[i];
          if (obj !== undefined) {
            client.existsAsync(obj.walletId.toLowerCase()).then(exists => {
              logger.debug(
                `Wallet : ${obj.walletId} exists in redis? : ${exists}`,
              );
              client.getAsync('latestId').then(latestIdRedis => {
                latestId = latestIdRedis;
                if (!exists || obj.id > latestId) {
                  client.setAsync('latestId', obj.id).then(() => {
                    latestId = obj.id;
                  });
                }
                if (!exists) {
                  client
                    .setAsync(obj.walletId.toLowerCase(), obj.pillarId)
                    .then(() => {
                      logger.info(
                        `Publisher received notification to monitor: ${obj.walletId.toLowerCase()} for pillarId: ${
                          obj.pillarId
                        } , accountsSize: ${hashMaps.accounts.keys().length}`,
                      );

                      logger.debug(`Updated redis with latestId: ${latestId}`);
                    });
                }
              });
            });
          }
        }
      } else if (data.type === 'assets') {
        logger.info('Publisher initializing assets.');
        // add the new asset to the assets hashmap
        for (let i = 0; i < message.length; i++) {
          const obj = message[i];
          if (obj !== undefined) {
            hashMaps.assets.set(obj.contractAddress.toLowerCase(), obj);
            logger.info(
              `Publisher received notification to monitor a new asset: ${obj.contractAddress.toLowerCase()}`,
            );
            if(obj.category !== 'Collectible') {
              ethService.subscribeTransferEvents(obj);
            }
          }
        }
      }
    } catch (e) {
      logger.error(`Publisher: Error occured in publisher: ${e}`);
    }
  });
};

/**
 * Function that initializes inter process communication queue
 */
module.exports.initIPC = function() {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info('Started executing publisher.initIPC()');

      // check if latestId key exists in redis, if not set an empty value
      if (await client.existsAsync('latestId')) {
        logger.info('Publisher fetching last processed id from redis server');
        latestId = await client.getAsync('latestId');
      } else {
        logger.info(
          'First run of the process, initializing last process id on redis',
        );
        await client.setAsync('latestId', '');
      }
      logger.info(
        `Publisher identified last process id from redis to be : ${latestId}`,
      );

      // request master for a list of assets to be monitored
      process.send({ type: 'assets.request' });
      setTimeout(() => {
        logger.info('Publisher Initializing RMQ.');
        rmqServices.initPubSubMQ().then(err => {
          if (!err) {
            module.exports.initSubscriptions();
          } else {
            logger.error(
              'ERROR: Publisher failed to initialize the RMQ pubsub queue!',
            );
          }
        });
      }, 100);

      logger.info(
        'Publisher starting a cron to poll master for new wallets every 5 seconds',
      );
      const job = new CronJob('*/5 * * * * *', () => {
        module.exports.poll();
      });
      job.start();

      // reset subscription every 24hrs
      const subsJob = new CronJob('53 23 * * *', async () => {
        logger.info(
          'Publisher: Clearing and resubscribing to all geth websocket connections',
        );
        module.exports.initSubscriptions();
      });
      subsJob.start();
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
module.exports.poll = function() {
  processCnt += 1;
  if (processCnt === 12) {
    processCnt = 0;
    gethCheck += 1;
    if (hashMaps.LATEST_BLOCK_NUMBER <= LAST_BLOCK_NUMBER) {
      logger.error('####GETH DOWN?? NO SYNC FOR PAST 1 MINUTE####');
    }
  }
  // Check the geth status every 1 hour and resubscribe incase the WS is stale
  if (gethCheck === 60) {
    gethCheck = 0;
    if (fs.existsSync(GETH_STATUS_FILE)) {
      logger.error(
        'Publisher: Websocket connection stale, resubscribing to websocket events!',
      );
      fs.unlink(GETH_STATUS_FILE, () => {
        logger.info(
          `Publisher: Delete geth status file at: ${GETH_STATUS_FILE}`,
        );
        module.exports.initSubscriptions();
      });
    }
  }
  if (hashMaps.assets.count() === 0) {
    process.send({ type: 'assets.request' });
  }
  // request new wallets
  logger.info(
    `Size of hashmaps: Assets= ${hashMaps.assets.keys().length}, PendingTx= ${
      hashMaps.pendingTx.keys().length
    }, PendingAssets= ${hashMaps.pendingAssets.keys().length}`,
  );
  logger.info(
    `Hashmap size: Assets= ${sizeof.sizeof(
      hashMaps.assets,
      true,
    )}, PendingTx= ${sizeof.sizeof(
      hashMaps.pendingTx,
      true,
    )}, PendingAssets= ${sizeof.sizeof(hashMaps.pendingAssets, true)}`,
  );
  logger.info(
    `LAST PROCESSED BLOCK= ${LAST_BLOCK_NUMBER}, LATEST BLOCK NUMBER= ${
      hashMaps.LATEST_BLOCK_NUMBER
    }`,
  );
  process.send({ type: 'wallet.request', message: latestId });
  LAST_BLOCK_NUMBER = hashMaps.LATEST_BLOCK_NUMBER;
};

/**
 * Function that initializes the geth subscriptions
 */
module.exports.initSubscriptions = function() {
  logger.info('Publisher subscribing to geth websocket events...');
  // subscribe to pending transactions
  ethService.subscribePendingTxn();
  // subscribe to block headers
  ethService.subscribeBlockHeaders();
  if (hashMaps.assets.count() > 0) {
    // subscribe to transfer events of each monitored smart contract
    const smartContractsArray = hashMaps.assets.values();
    smartContractsArray.forEach(ERC20SmartContract => {
      ethService.subscribeTransferEvents(ERC20SmartContract);
    });
  }
  logger.info('Publisher completed websocket subscriptions.');
};

this.initIPC();
this.publisherOnMessage();
