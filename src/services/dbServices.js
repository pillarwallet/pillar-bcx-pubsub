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
/** @module dbServices.js */
const logger = require('../utils/logger.js');
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
module.exports.mongoose = mongoose;
const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PWD;
const serverIP = process.env.SERVER;
const dbName = process.env.DBNAME;
const mongoUrl = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}?w=majority`;
const accounts = require('../controllers/accounts_ctrl.js');
const assets = require('../controllers/assets_ctrl.js');
const transactions = require('../controllers/transactions_ctrl.js');
const historicTransactions = require('../controllers/historic_transactions_ctrl.js');
const gasinfo = require('../controllers/gasinfo_ctrl.js');

let dbCollections;

function dbConnect() {
  const $arg = {
    useNewUrlParser: true,
    keepAlive: true,
    keepAliveInitialDelay: 30000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    reconnectTries: 2,
    reconnectInterval: 500,
    poolSize: 1,
  };
  return new Promise((resolve, reject) => {
    try {
      // Connect to database
      module.exports.mongoose.connect(
        mongoUrl,
        $arg,
      );

      // Setting up listeners
      module.exports.mongoose.connection.on('error', err => {
        logger.error(
          `ERROR: Couldn't establish connection to database : ${err}`,
        );
        reject(new Error("ERROR: Couldn't establish connection to database"));
      });

      module.exports.mongoose.connection.on('open', () => {
        logger.debug('Established connection to database!');
        dbCollections = {
          accounts,
          assets,
          transactions,
          gasinfo,
          historicTransactions,
        };
        module.exports.dbCollections = dbCollections;
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.dbConnect = dbConnect;

function accountDetails(address) {
  return new Promise((resolve, reject) => {
    try {
      if (dbCollections) {
        dbCollections.accounts
          .findByEthAddress(address)
          .then(accountsRes => {
            if (accountsRes !== undefined) {
              logger.debug(`Account details ${accountsRes.length}`);
            }
            resolve(accountsRes);
          })
          .catch(e => {
            reject(e);
          });
      }
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.accountDetails = accountDetails;

function recentAccounts(idFrom) {
  return new Promise((resolve, reject) => {
    try {
      if (dbCollections) {
        if (idFrom !== undefined && idFrom !== '') {
          // fetch accounts registered after a given Id
          dbCollections.accounts
            .listRecent(idFrom)
            .then(ethAddressesArray => {
              if (ethAddressesArray.length > 0) {
                logger.debug(`FOUND ${ethAddressesArray.length} NEW ACCOUNTS:`);
              }
              resolve(ethAddressesArray);
            })
            .catch(e => {
              reject(e);
            });
        } else {
          dbCollections.accounts
            .listAll()
            .then(ethAddressesArray => {
              logger.debug(
                `Total accounts found to monitor: ${ethAddressesArray.length}`,
              );
              resolve(ethAddressesArray);
            })
            .catch(e => {
              reject(e);
            });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.recentAccounts = recentAccounts;

function contractsToMonitor(idFrom) {
  return new Promise((resolve, reject) => {
    // code to fetch list of contracts/assets to monitor
    if (dbCollections) {
      if (idFrom !== undefined && idFrom !== '') {
        // fetch accounts registered after a given Id
        dbCollections.assets
          .listRecent(idFrom)
          .then(assetsArray => {
            if (assetsArray.length > 0) {
              logger.debug(
                `dbServices.contractsToMonitor(): Found ${
                  assetsArray.length
                } new assets to monitor.`,
              );
            } else {
              logger.debug(
                'dbServices.contractsToMonitor(): No assets available for monitoring',
              );
            }
            resolve(assetsArray);
          })
          .catch(e => {
            reject(e);
          });
      } else {
        logger.debug(
          'dbServices.contractsToMonitor(): Fetching all assets from the database.',
        );
        dbCollections.assets
          .listAll()
          .then(assetsArray => {
            logger.debug(
              `dbServices.contractsToMonitor(): Found ${
                assetsArray.length
              } in the database`,
            );
            resolve(assetsArray);
          })
          .catch(e => {
            reject(e);
          });
      }
    }
  });
}
module.exports.contractsToMonitor = contractsToMonitor;

function getTxHistory(address1, fromtmstmp, address2, asset) {
  return new Promise((resolve, reject) => {
    try {
      if (dbCollections) {
        dbCollections.transactions
          .getTxHistory(
            address1.toUpperCase(),
            fromtmstmp,
            address2.toUpperCase(),
            asset,
          )
          .then(txHistory => {
            resolve(txHistory);
          });
      }
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.getTxHistory = getTxHistory;

function listAssets(protocol) {
  logger.debug(`dbServices.listAssets(): for protocol: ${protocol}`);
  return new Promise((resolve, reject) => {
    try {
      if (dbCollections) {
        dbCollections.assets.listAssets(protocol).then(result => {
          logger.debug(
            `dbServices.listAssets(): Found ${result.length} assets.`,
          );
          resolve(result);
        });
      }
    } catch (e) {
      logger.error(`dbServices.listAssets(): failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.listAssets = listAssets;

function listPendingTx(address, asset) {
  return new Promise((resolve, reject) => {
    try {
      if (dbCollections) {
        dbCollections.transactions.listPending().then(pendingTxArray => {
          const addressAssetPendingTxArray = [];
          pendingTxArray.forEach(item => {
            if (
              item.asset === asset &&
              (item.to.toUpperCase() === address.toUpperCase() ||
                item.from.toUpperCase() === address.toUpperCase())
            ) {
              addressAssetPendingTxArray.push(item);
            }
          });
          resolve(addressAssetPendingTxArray);
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.listPendingTx = listPendingTx;

function listPending(protocol) {
  logger.debug(`dbServices.listPending(): for protocol: ${protocol}`);
  return new Promise((resolve, reject) => {
    try {
      if (dbCollections) {
        dbCollections.transactions
          .listPending(protocol)
          .then(pendingTxArray => {
            logger.debug(
              `dbServices.listPending(): Found ${
                pendingTxArray.length
              } transactions.`,
            );
            resolve(pendingTxArray);
          });
      }
    } catch (e) {
      logger.error(`dbServices.listPending(): failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.listPending = listPending;

function findMaxBlock(protocol, asset = null) {
  logger.debug(`dbServices.findMaxBlock(): for protocol: ${protocol}`);
  return new Promise((resolve, reject) => {
    try {
      if (dbCollections) {
        if (asset === null) {
          dbCollections.transactions.findMaxBlock(protocol).then(maxBlock => {
            if (maxBlock !== undefined && maxBlock !== null) {
              logger.debug(`dbServices.findMaxBlock(): maxBlock = ${maxBlock}`);
            } else {
              resolve(0);
              return;
            }
            resolve(maxBlock);
          });
        } else {
          dbCollections.transactions
            .findMaxBlock(protocol, asset)
            .then(maxBlock => {
              if (maxBlock !== undefined && maxBlock !== null) {
                logger.debug(
                  `dbServices.findMaxBlock(): maxBlock = ${maxBlock}`,
                );
              } else {
                resolve(0);
                return;
              }
              resolve(maxBlock);
            });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.findMaxBlock = findMaxBlock;

function addTransactionStats(record) {
  try {
    logger.debug(
      'dbServices.addTransactionStats() adding transaction statistics',
    );
    if (dbCollections) {
      dbCollections.gasinfo.add(record);
    }
    logger.debug('dbServices.addTransactionStats() successfully added');
  } catch (e) {
    logger.error(`dbServices.addTransactionStats failed with error ${e}`);
  }
}
module.exports.addTransactionStats = addTransactionStats;

function getAsset(asset) {
  logger.debug(`dbServices.getAsset - Fetching details of asset - ${asset}`);
  return new Promise((resolve, reject) => {
    try {
      if (dbCollections) {
        dbCollections.assets.findByAddress(asset).then(result => {
          resolve(result);
        });
      }
    } catch (e) {
      logger.error(`dbServices.getAsset failed with error - ${e}`);
      reject(e);
    }
  });
}
module.exports.getAsset = getAsset;
