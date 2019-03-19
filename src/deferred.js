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

/** @module deferred.js */
require('./utils/diagnostics');
const dbServices = require('./services/dbServices');
const ethService = require('./services/ethService');
const logger = require('./utils/logger');
const { CronJob } = require('cron');
const config = require('./config');

const TIME_BETWEEN_GET_TRANSACTIONS = config.get(
  'housekeeper.getTransWaitInterval',
);

const protocol = 'Ethereum';

function generateList(number) {
  let counter = number;
  const list = [];
  while (counter > 0) {
    list.push(counter);
    counter -= 500;
  }
  list.push(0);
  return list;
}


process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at: ' + reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});

module.exports.generateList = generateList;

function decimalToHexString(number) {
  let counter = number;
  if (counter < 0) {
    counter = 0xffffffff + counter + 1;
  }
  return `0x${counter.toString(16).toUpperCase()}`;
}

module.exports.decimalToHexString = decimalToHexString;

function saveTransactions(transactions) {
  return dbServices.dbCollections.historicTransactions.addMultipleTx(
    transactions,
  );
}

function setDeferredDone(acc, result) {
  acc.status = 'deferred_done';
  result.save(err => {
    if (err) {
      logger.error(`accounts.addAddress DB controller ERROR: ${err}`);
    } else {
      logger.info(`accounts.addAddress ${acc.address} saved ok`);
    }
  });
}

function getTransactions(
  listOfTrans,
  i,
  acc,
  result,
  totalTrans,
  transListCnt,
) {
  setTimeout(() => {
    let transListCount = transListCnt;
    const toBlock = decimalToHexString(listOfTrans[i + 1]);
    let fromBlock;
    if (i === 0) {
      fromBlock = decimalToHexString(listOfTrans[i]);
    } else {
      fromBlock = decimalToHexString(listOfTrans[i] + 1);
    }
    logger.info(
      `deferred.getTransactions: started processing for wallet ${
        acc.address
      } and i ${i} fromBlock ${fromBlock} toBlock ${toBlock} transListCount ${transListCount}`,
    );
    ethService
      .getAllTransactionsForWallet(acc.address, toBlock, fromBlock)
      .then(transactions => {
        if (transactions && transactions.length > 0) {
          const totalTransactions = transactions.length;
          if (totalTransactions > 0) {
            transListCount += totalTransactions;
          }
          saveTransactions(transactions).then(() => {
            logger.debug(
              'deferred.saveDefferedTransactions dbServices.dbCollections.historicTransactions successfully added',
            );
            if (toBlock === '0x0') {
              logger.info(
                `finished,reached 0x0 block transListCount ${transListCount} totalTrans  ${totalTrans}`,
              );
              setDeferredDone(acc, result);
            } else {
              getTransactions(
                listOfTrans,
                i + 1,
                acc,
                result,
                totalTrans,
                transListCount,
              );
            }
            logger.debug(
              `deferred.getTransactions: started processing for wallet ${
                acc.address
              } and recovered ${totalTransactions} fromBlock ${fromBlock} toBlock ${toBlock} length transList ${transListCount} total trans ${totalTrans}`,
            );
          });
        } else if (toBlock === '0x0') {
          logger.info(
            `finished,reached 0x0 block transListCount ${transListCount} totalTrans  ${totalTrans}`,
          );
          setDeferredDone(acc, result);
        } else {
          getTransactions(
            listOfTrans,
            i + 1,
            acc,
            result,
            totalTrans,
            transListCount,
          );
        }
      });
    }, TIME_BETWEEN_GET_TRANSACTIONS)
}

async function saveDefferedTransactions() {
  try {
    dbServices.dbConnect().then(async () => {
      dbServices.dbCollections.accounts
        .findByStatus('deferred', protocol)
        .then(result => {
          if (result) {
            result.addresses.forEach(acc => {
              if (acc.status === 'deferred') {
                ethService
                  .getTransactionCountForWallet(acc.address)
                  .then(totalTrans => {
                    ethService.getLastBlockNumber().then(lastBlock => {
                      logger.debug(`lastblock is ${lastBlock}`);
                      logger.debug(`totaltransacions is ${totalTrans}`);
                      const listOfTrans = generateList(lastBlock);
                      logger.debug(`list of trans ${listOfTrans.length}`);
                      getTransactions(
                        listOfTrans,
                        0,
                        acc,
                        result,
                        totalTrans,
                        0,
                      );
                    });
                  });
              }
            });
          }
        });
    });
  } catch (e) {
    logger.error(`deferred.saveDefferedTransactions failed with error ${e}`);
  }
}

module.exports.saveDefferedTransactions = saveDefferedTransactions;

async function launch() {
  try {
    logger.info('Started executing deferred.launch()');
    logger.info(
      'starting a cron to run saveDefferedTransactions each 20 minutes',
    );
    const job = new CronJob('*/20 * * * *', () => {
      module.exports.saveDefferedTransactions();
    });
    job.start();
    module.exports.saveDefferedTransactions();
  } catch (e) {
    logger.error(`deferred.launch() failed: ${e.message}`);
  }
}

module.exports.launch = launch;

this.launch();
