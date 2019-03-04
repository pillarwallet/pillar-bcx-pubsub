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

#!/usr/bin/env node */

/** @module housekeeper.js */
require('./utils/diagnostics');
require('dotenv').config();
const redis = require('redis');

const client = redis.createClient();
const time = require('unix-timestamp');
const abiDecoder = require('abi-decoder');
const ERC20ABI = require('./abi/ERC20ABI');
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices');
const fs = require('fs');
const abiPath = `${require('app-root-path')}/src/abi/`;

const LOOK_BACK_BLOCKS = 50;
const ethService = require('./services/ethService');

const protocol = 'Ethereum';
const MAX_TOTAL_TRANSACTIONS = process.env.MAX_TOTAL_TRANSACTIONS
  ? process.env.MAX_TOTAL_TRANSACTIONS
  : 100;
const { CronJob } = require('cron');

let entry = {};
let startBlock;

/**
 * Function that subscribes to redis related connection errors.
 */
client.on('error', err => {
  logger.error(`Housekeeper failed with REDIS client error: ${err}`);
});

/**
 * commonon logger function that prints out memory footprint of the process
 */
function logMemoryUsage() {
  const mem = process.memoryUsage();
  const rss = Math.round((mem.rss * 10.0) / (1024 * 1024 * 10.0), 2);
  const heap = Math.round((mem.heapUsed * 10.0) / (1024 * 1024 * 10.0), 2);
  const total = Math.round((mem.heapTotal * 10.0) / (1024 * 1024 * 10.0), 2);
  const external = Math.round((mem.external * 10.0) / (1024 * 1024 * 10.0), 2);
  logger.info(
    '*****************************************************************************************************************************',
  );
  logger.info(
    `Housekeeper - PID: ${
      process.pid
    }, RSS: ${rss} MB, HEAP: ${heap} MB, EXTERNAL: ${external} MB, TOTAL AVAILABLE: ${total} MB`,
  );
  logger.info(
    '*****************************************************************************************************************************',
  );
}
module.exports.logMemoryUsage = logMemoryUsage;

async function connectDb() {
  return new Promise(async resolve => {
    if (
      dbServices.mongoose !== undefined &&
      dbServices.dbCollections !== undefined &&
      dbServices.mongoose.connection.readyState !== 0
    ) {
      resolve();
    } else {
      dbServices.dbConnect().then(() => {
        resolve();
      });
    }
  });
}

/**
 * Check the transactions pool and update pending transactions.
 */
async function checkTxPool() {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info('Housekeeper.checkTxPool(): Checking txpool');
      await dbServices.listPending(protocol).then(pendingTxArray => {
        logger.debug(
          `Housekeeper.checkTxPool(): Number of pending transactions in DB: ${
            pendingTxArray.length
          }`,
        );
        pendingTxArray.forEach(item => {
          // recheck the status of the transaction
          ethService.getTxReceipt(item.txHash).then(receipt => {
            if (receipt !== null) {
              logger.debug(
                `Housekeeper.checkTxPool(): checking status of txn : ${
                  receipt.transactionHash
                }`,
              );
              // update the status of the transaction
              let status;
              if (receipt.status === '0x1') {
                status = 'confirmed';
              } else {
                status = 'failed';
              }
              const { gasUsed } = receipt;
              const entryTxn = {
                txHash: item.txHash,
                status,
                gasUsed,
                blockNumber: receipt.blockNumber,
              };
              dbServices.dbCollections.transactions
                .updateTx(entryTxn)
                .then(() => {
                  logger.info(
                    `Housekeeper.checkTxPool(): Transaction updated: ${
                      entryTxn.txHash
                    }`,
                  );
                });
            }
          });
        });
      });
      resolve();
    } catch (e) {
      logger.error(`Housekeeper.checkTxPool(): Failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.checkTxPool = checkTxPool;

async function recoverTransactions(startingBlock, endBlock, walletId) {
  const transactions = [];
  for (let i = startingBlock; i >= endBlock; i--) {
    ethService.getBlockTx(i).then(txns => {
      txns.transactions.forEach(async txn => {
        if (
          txn.from.toLowerCase() === walletId ||
          (txn.to !== null && txn.to.toLowerCase() === walletId)
        ) {
          const receipt = await ethService.getTxReceipt(txn.hash);
          transactions.push(receipt);
        }
      });
    });
  }
  return transactions;
}
module.exports.recoverTransactions = recoverTransactions;

async function processTxn(transaction, wallet, pillarId) {
  const tmstmp = await ethService.getBlockTx(transaction.blockNumber);
  let asset;
  let status;
  let value;
  let to;
  let contractAddress;
  if (transaction.action.input !== '0x') {
    const theAsset = await dbServices.getAsset(transaction.action.to);
    ({ contractAddress } = theAsset);
    if (theAsset !== undefined) {
      asset = theAsset.symbol;
      if (fs.existsSync(`${abiPath + asset}.json`)) {
        const theAbi = require(`${abiPath + asset}.json`);
        abiDecoder.addABI(theAbi);
      } else {
        abiDecoder.addABI(ERC20ABI);
      }
    } else {
      abiDecoder.addABI(ERC20ABI);
    }
    const data = abiDecoder.decodeMethod(transaction.action.input);
    if (typeof data !== 'undefined' && transaction.action.input !== '0x') {
      if (data.name === 'transfer') {
        // smart contract call hence the asset must be the token name
        to = data.params[0].value;
        [, { value }] = data.params;
      } else {
        ({ to } = transaction.action);
        ({ value } = transaction.action);
      }
    } else {
      ({ to } = transaction.action);
      ({ value } = transaction.action);
    }
  } else {
    asset = 'ETH';
    value = parseInt(transaction.action.value, 16);
    ({ to } = transaction.action);
    contractAddress = null;
  }
  if (transaction.error === 'Reverted') {
    status = 'failed';
  } else {
    status = 'confirmed';
  }
  const entryTxn = {
    protocol,
    pillarId,
    toAddress: to,
    fromAddress: transaction.action.from,
    txHash: transaction.transactionHash,
    asset,
    contractAddress,
    timestamp: tmstmp.timestamp,
    value,
    blockNumber: transaction.blockNumber,
    status,
    gasUsed: transaction.result.gasUsed,
  };
  logger.info(`Housekeeper.recoverAll - Recovered transactions - ${entryTxn}`);
  dbServices.dbCollections.transactions.addTx(entryTxn);
}

/**
 *
 * @param {string} walletId - the wallet address of the account whose transactions have to be recovered
 * @param {string} pillarId - the pillar id of the wallet being recovered.
 */
async function recoverAll(wallet, pillarId) {
  try {
    logger.info(
      `Housekeeper.recoverAll(${wallet}) - started recovering transactions`,
    );
    const totalTransactions = await ethService.getTransactionCountForWallet(
      wallet,
    );
    logger.info(
      `Housekeeper.recoverAll - Found ${totalTransactions} transactions for wallet - ${wallet}`,
    );
    let index = 0;
    if (totalTransactions < MAX_TOTAL_TRANSACTIONS) {
      const transactions = await ethService.getAllTransactionsForWallet(wallet);
      transactions.forEach(async transaction => {
        index += 1;
        processTxn(transaction, wallet, pillarId);

        if (index === totalTransactions) {
          logger.info(
            `Housekeeper.recoverAll: completed processing for wallet ${wallet} and recovered ${totalTransactions}`,
          );
        }
      });
    } else {
      dbServices.dbCollections.accounts
        .findByAddress(wallet, protocol)
        .then(result => {
          if (result) {
            result.addresses.forEach(acc => {
              if (acc.address === wallet) {
                logger.debug(
                  `Housekeeper.recoverAll: matched address ${acc.address}`,
                );
                acc.status = 'deferred';
                result.save(err => {
                  if (err) {
                    logger.info(
                      `accounts.addAddress DB controller ERROR: ${err}`,
                    );
                  }
                });
              }
            });
          }
        });
    }
  } catch (e) {
    logger.error(`Housekeeper.recoverAll() - Recover wallets failed with ${e}`);
  }
}
module.exports.recoverAll = recoverAll;

/**
 * Function to process the newly registered wallets
 * @param {string} lastId - Last processed wallet Id
 */
function processData(lastId) {
  try {
    connectDb().then(async () => {
      // Update pending transactions in the db
      await this.checkTxPool();
      // fetch new registrations since last run
      logger.info(`Housekeeper fetching new registrations after ID: ${lastId}`);
      await dbServices.recentAccounts(lastId).then(async accounts => {
        logger.info(
          `Housekeeper found accounts: ${accounts.length} wallets to process.`,
        );
        if (accounts === null || accounts.length === 0) {
          entry.status = 'completed';
          entry.endTime = time.now();
          client.set('housekeeper', JSON.stringify(entry), redis.print);
          logger.info(
            `Housekeeper.processData() - Completed processing ${
              accounts.length
            } records.`,
          );
          this.logMemoryUsage();
        } else {
          const promises = [];
          accounts.forEach(account => {
            account.addresses.forEach(acc => {
              if (acc.protocol === protocol) {
                // promises.push(this.recoverWallet(acc.address,account.pillarId,LOOK_BACK_BLOCKS));
                // promises.push(this.recoverAssetEvents(acc.address,account.pillarId));
                promises.push(this.recoverAll(acc.address, account.pillarId));
              }
            });
            entry.lastId = account._id;
          });
          Promise.all(promises).then(() => {
            entry.status = 'completed';
            entry.endTime = time.now();
            client.set('housekeeper', JSON.stringify(entry), redis.print);
            logger.info(
              `Housekeeper.processData() - Completed processing ${
                accounts.length
              } records.`,
            );
            this.logMemoryUsage();
          });
        }
      });
    });
  } catch (e) {
    logger.error(`Housekeeper.processData(${lastId}): Failed with error ${e}`);
  }
}
module.exports.processData = processData;

/**
 * Function that start housekeeper cron
 */

async function cronInit() {
  const job = new CronJob('*/5 * * * * *', () => {
    module.exports.init();
  });
  job.start();
  module.exports.init();
}

module.exports.cronInit = cronInit;
/**
 * Function that reads from the REDIS server to determine the configuration parameters.
 */

async function launch() {
  try {
    client.get('housekeeper', async (err, configStr) => {
      logger.info(
        `Housekeeper: Configuration fetched from REDIS = ${configStr}`,
      );
      if (err || configStr === null || configStr === false) {
        this.cronInit();
      } else {
        const config = JSON.parse(configStr);
        // check the config parameters to check the status of last run
        logger.info(`Housekeeper previous runs status: ${config.status}`);
        if (config.status !== 'completed') {
          logger.error(
            'HOUSKEEPER FAILED!! PREVIOUS PROCESS IS STILL RUNNING!!',
          );
          entry = config;
        } else {
          // the previous run was successful so start process
          this.cronInit();
        }
      }
    });
  } catch (e) {
    logger.error(`deferred.launch() failed: ${e.message}`);
  }
}

module.exports.launch = launch;

async function init() {
  logger.info(`Housekeeper(PID: ${process.pid}) started processing.`);
  this.logMemoryUsage();

  logger.info('starting a cron to run init each 5 minutes');
  try {
    startBlock = await ethService.getLastBlockNumber();
    entry.blockNumber = startBlock - LOOK_BACK_BLOCKS;
    logger.info(`Latest blocknumber: ${startBlock}`);
    // read REDIS server to fetch config parameters for the current run.
    client.get('housekeeper', async (err, configStr) => {
      logger.info(
        `Housekeeper: Configuration fetched from REDIS = ${configStr}`,
      );
      if (err || configStr === null || configStr === false) {
        // the very first run of housekeeper so add the entry to redis server
        entry.pid = process.pid;
        entry.lastId = '';
        entry.startTime = time.now();
        entry.endTime = 0;
        entry.blockNumber = 0;
        entry.status = 'pending';
        client.set('housekeeper', JSON.stringify(entry), redis.print);
        this.processData('');
      } else {
        const config = JSON.parse(configStr);
        // check the config parameters to check the status of last run
        logger.info(`Housekeeper previous runs status: ${config.status}`);
        if (config.status !== 'completed') {
          logger.error(
            'HOUSKEEPER FAILED!! PREVIOUS PROCESS IS STILL RUNNING!!',
          );
          entry = config;
        } else {
          // the previous run was successful so start process

          logger.info(
            `Housekeeper processing records since last record: ${
              config.lastId
            }`,
          );
          entry.lastId = config.lastId;
          entry.pid = process.pid;
          entry.startTime = time.now();
          entry.blockNumber = 0;
          entry.status = 'pending';
          client.set('housekeeper', JSON.stringify(entry), redis.print);
          this.processData(config.lastId);
        }
      }
    });
    logger.info('Started executing deferred.launch()');
  } catch (e) {
    logger.error(`Housekeeper failed with error: ${e}`);
    entry.status = 'failed';
    entry.endTime = time.now();
    client.set('housekeeper', JSON.stringify(entry), redis.print);
    // process.exit(0);
  }
}
module.exports.init = init;

this.launch();
