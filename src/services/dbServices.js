/** @module dbServices.js */
const logger = require('../utils/logger.js');
require('dotenv').config();
const mongoose = require('mongoose');
module.exports.mongoose = mongoose;
const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PWD;
const serverIP = process.env.SERVER;
const dbName = process.env.DBNAME;
const mongoUrl = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}?w=majority`;
const accounts = require('../controllers/accounts_ctrl.js');
const assets = require('../controllers/assets_ctrl.js');
const transactions = require('../controllers/transactions_ctrl.js');
const gasinfo = require('../controllers/gasinfo_ctrl.js');
let dbCollections;

function dbConnect($arg = { useMongoClient: true }) {
    return new Promise(((resolve, reject) => {
      try {
        // Connect to database
        module.exports.mongoose.connect(mongoUrl, $arg);

        // Setting up listeners
        module.exports.mongoose.connection.on('error', () => {
          logger.error(("ERROR: Couldn't establish connection to database :("));
          reject(new Error("ERROR: Couldn't establish connection to database"));
        });
  
        module.exports.mongoose.connection.on('open', () => {
          logger.debug(('Established connection to database!'));
          dbCollections = { accounts, assets, transactions, gasinfo };
          module.exports.dbCollections = dbCollections;
          resolve();
        });
      } catch (e) { reject(e); }
    }));
}
module.exports.dbConnect = dbConnect;

function recentAccounts(idFrom, protocol, $arg = { useMongoClient: true }) {
    return new Promise(((resolve, reject) => {
      try {
        if (dbCollections) {
          if ((typeof idFrom !== undefined) && idFrom !== '') {
            // fetch accounts registered after a given Id
            dbCollections.accounts.listRecent(idFrom)
              .then((ethAddressesArray) => {
                if(ethAddressesArray.length > 0) {
                  logger.debug(`FOUND ${ethAddressesArray.length} NEW ACCOUNTS:`);
                }
                resolve(ethAddressesArray);
              })
              .catch((e) => { reject(e); });
          } else {
            dbCollections.accounts.listAll()
              .then((ethAddressesArray) => {
                logger.debug('Total accounts found to monitor: ' + ethAddressesArray.length);
                resolve(ethAddressesArray);
              })
              .catch((e) => { reject(e); });
          }
        } else {
           module.exports.dbConnect()
            .then(() => {
              resolve(module.exports.recentAccounts());
            })
            .catch((e) => { reject(e); });
        }
      } catch (e) { reject(e); }
    }));
}
module.exports.recentAccounts = recentAccounts;

function contractsToMonitor(idFrom, $arg = { useMongoClient: true }) {
    return new Promise(((resolve, reject) => {
      // code to fetch list of contracts/assets to monitor
      if (dbCollections) {
        if ((typeof idFrom !== undefined) && idFrom !== '') {
          // fetch accounts registered after a given Id
          dbCollections.assets.listRecent(idFrom)
            .then((assetsArray) => {
              if(assetsArray.length > 0) {
                logger.info('dbServices.contractsToMonitor(): Found ' + assetsArray.length + ' new assets to monitor.');
              } else {
                logger.info('dbServices.contractsToMonitor(): No assets available for monitoring');
              }
              resolve(assetsArray);
            })
            .catch((e) => { reject(e); });
        } else {
          logger.info('dbServices.contractsToMonitor(): Fetching all assets from the database.')
          dbCollections.assets.listAll()
            .then((assetsArray) => {
              logger.info('dbServices.contractsToMonitor(): Found ' + assetsArray.length + ' in the database');
              resolve(assetsArray);
            })
            .catch((e) => { reject(e); });
        }
      } else {
         module.exports.dbConnect()
          .then(() => {
            resolve(module.exports.contractsToMonitor());
          })
          .catch((e) => { reject(e); });
      }
    }));
}
module.exports.contractsToMonitor = contractsToMonitor;

function getTxHistory(address1, fromtmstmp, address2, asset) {
    return new Promise(((resolve, reject) => {
      try {
          if(dbCollections) {
                dbCollections.transactions.getTxHistory(address1.toUpperCase(), fromtmstmp, address2.toUpperCase(), asset)
                .then((txHistory) => {
                    resolve(txHistory);
                });
                } else {
                 module.exports.dbConnect().then(() => {
                    resolve(module.exports.getTxHistory(address1, fromtmstmp, address2, asset));
                });
            }
        } catch (e) { reject(e); }
    }));
}
module.exports.getTxHistory = getTxHistory;
  
function listAssets(protocol) {
    logger.debug('dbServices.listAssets(): for protocol: ' + protocol);
    return new Promise(((resolve, reject) => {
      try {
            if(dbCollections) {
                dbCollections.assets.listAssets(protocol).then((result) => {
                    logger.debug('dbServices.listAssets(): Found ' + result.length + ' assets.');
                    resolve(result);
                });
            } else {
                 module.exports.dbConnect().then(() => {
                    resolve(module.exports.listAssets(protocol));
                });
            }
        } catch (e) { 
            logger.error('dbServices.listAssets(): failed with error: ' + e);
            reject(e); 
        }
    }));  
}
module.exports.listAssets = listAssets;
  
function listPendingTx(address, asset) {
    return new Promise(((resolve, reject) => {
      try {
        if(dbCollections) {
            dbCollections.transactions.listPending()
            .then((pendingTxArray) => {
                const addressAssetPendingTxArray = [];
                pendingTxArray.forEach((item) => {
                if (
                    item.asset === asset
                    && (
                    item.to.toUpperCase() === address.toUpperCase()
                    ||
                    item.from.toUpperCase() === address.toUpperCase()
                    )
                ) {
                    addressAssetPendingTxArray.push(item);
                }
                });
                resolve(addressAssetPendingTxArray);
            });
        } else {
             module.exports.dbConnect().then(() => {
                resolve(module.exports.listPendingTx(address, asset));
            });
        }
      } catch (e) { reject(e); }
    }));
}
module.exports.listPendingTx = listPendingTx;
  
function listPending(protocol) {
    logger.debug('dbServices.listPending(): for protocol: ' + protocol);
    return new Promise(((resolve, reject) => {
      try {
        if(dbCollections) {
            dbCollections.transactions.listPending(protocol).then((pendingTxArray) => {
                logger.debug('dbServices.listPending(): Found ' + pendingTxArray.length + ' transactions.');
                resolve(pendingTxArray);
            });
        } else {
             module.exports.dbConnect().then(() => {
                resolve(module.exports.listPending(protocol));
            });
        }
      } catch (e) { 
        logger.error('dbServices.listPending(): failed with error: ' + e);
        reject(e); 
      }
    }));  
}
module.exports.listPending = listPending;
  
function findMaxBlock(protocol,asset = null) {
    logger.debug('dbServices.findMaxBlock(): for protocol: ' + protocol);
    return new Promise(((resolve, reject) => {
      try {
        if(dbCollections) {
            if(asset == null) {
            dbCollections.transactions.findMaxBlock(protocol).then((maxBlock) => {
                if(maxBlock !== 'undefined') {
                    logger.debug('dbServices.findMaxBlock(): maxBlock = ' + maxBlock);
                } else {
                    maxBlock = 0;
                }
                resolve(maxBlock);
            });
            } else {
            dbCollections.transactions.findMaxBlock(protocol,asset).then((maxBlock) => {
                if(maxBlock !== 'undefined') {
                    logger.debug('dbServices.findMaxBlock(): maxBlock = ' + maxBlock);
                } else {
                    maxBlock = 0;
                }
                resolve(maxBlock);
            });
            }
        } else {
             module.exports.dbConnect().then(() => {
                resolve(module.exports.findMaxBlock(protocol,asset));
            });
        }
      } catch (e) { reject(e); }
    }));  
}
module.exports.findMaxBlock = findMaxBlock;
  
function addTransactionStats(record) {
    try {
      logger.debug('dbServices.addTransactionStats() adding transaction statistics');
      if(dbCollections) {
        dbCollections.gasinfo.add(record);
      } else {
           module.exports.dbConnect().then(() => {
            module.exports.addTransactionStats(record);
          });
      }
      logger.debug('dbServices.addTransactionStats() successfully added');
    }catch(e) {
      logger.error('dbServices.addTransactionStats failed with error ' + e);
    }
}
module.exports.addTransactionStats = addTransactionStats;