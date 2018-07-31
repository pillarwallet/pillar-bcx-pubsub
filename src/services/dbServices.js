const colors = require('colors');
const logger = require('../utils/logger.js');
require('dotenv').config();
const mongoose = require('mongoose');

module.exports.mongoose = mongoose;
const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PWD;
const serverIP = process.env.SERVER;
const dbName = process.env.DBNAME;
const mongoUrl = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}?w=majority`;
let dbCollections;

function dbConnect($arg = { useMongoClient: true }) {
  return new Promise(((resolve, reject) => {
    try {
      // Setting up listeners
      module.exports.mongoose.connection.on('error', () => {
        logger.error(("ERROR: Couldn't establish connection to database :("));
        reject(new Error("ERROR: Couldn't establish connection to database"));
      });

      module.exports.mongoose.connection.on('open', () => {
        logger.info(('Established connection to database!'));
        dbCollections = { accounts, assets, transactions };
        module.exports.dbCollections = dbCollections;
        resolve();
        // resolve({ accounts, assets, transactions });
      });

      // Import DB controllers
      const accounts = require('../controllers/accounts_ctrl.js');
      const assets = require('../controllers/assets_ctrl.js');
      const transactions = require('../controllers/transactions_ctrl.js');

      // Connect to database
      module.exports.mongoose.connect(mongoUrl, $arg);
    } catch (e) { reject(e); }
  }));
}
module.exports.dbConnect = dbConnect;

function dbConnectDisplayAccounts($arg = { useMongoClient: true }) {
  return new Promise(((resolve, reject) => {
    try {
      module.exports.dbConnect($arg)
        .then(() => {
          // Display accounts
          dbCollections.accounts.listAll()
            .then((accountsArray) => {
              dbCollections.assets.listAll()
                .then((assetsArray) => {
                  resolve();
                })
                .catch((e) => { reject(e); });
            })
            .catch((e) => { reject(e); });
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.dbConnectDisplayAccounts = dbConnectDisplayAccounts;

function recentAccounts(
  idFrom,
  protocol,
  $arg = { useMongoClient: true },
) {
  return new Promise(((resolve, reject) => {
    try {
      if (dbCollections) {
        if ((typeof idFrom !== undefined) && idFrom !== '') {
          // fetch accounts registered after a given Id
          dbCollections.accounts.listRecent(idFrom)
            .then((ethAddressesArray) => {
              if(ethAddressesArray.length > 0) {
                logger.info((`FOUND ${ethAddressesArray.length} NEW ACCOUNTS:`));
              }
              resolve(ethAddressesArray);
            })
            .catch((e) => { reject(e); });
        } else {
          dbCollections.accounts.listAll()
            .then((ethAddressesArray) => {
		          logger.info('Total accounts found to monitor: ' + ethAddressesArray.length);
              if(ethAddressesArray.length > 0) {
                logger.info(('Fetching ' + ethAddressesArray.length + ' addresses.'));
                //logger.info("Addresses: " + JSON.stringify(ethAddressesArray));
              }
	            resolve(ethAddressesArray);
            })
            .catch((e) => { reject(e); });
        }
      } else {
        module.exports.dbConnect($arg)
          .then(() => {
            resolve(module.exports.recentAccounts());
          })
          .catch((e) => { reject(e); });
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.recentAccounts = recentAccounts;

function contractsToMonitor(
  idFrom,
  $arg = { useMongoClient: true },
) {
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
      module.exports.dbConnect($arg)
        .then(() => {
          resolve(module.exports.contractsToMonitor());
        })
        .catch((e) => { reject(e); });
    }
  }));
}
module.exports.contractsToMonitor = contractsToMonitor;

function initDB(accountsArray, assetsArray) {
  return new Promise(((resolve, reject) => {
    try {
      logger.info('INITIALIZING DATABASE ADDRESSES COLLECTIONS.');
      if (accountsArray.length === 0 && assetsArray.length === 0) {
        logger.info('DONE');
        resolve();
      } else if (accountsArray.length === 0) {
        const smartContracts = require('../controllers/assets_ctrl.js');
        smartContracts.findByAddress(assetsArray[0].address)
          .then((result) => {
            if (result.length === 0) {
              smartContracts.addContract(
                assetsArray[0].address, assetsArray[0].name,
                assetsArray[0].ticker, assetsArray[0].decimals,
                'Ethereum',
              );
            }
          }).catch((e) => { reject(e); });

        assetsArray.splice(0, 1);
        resolve(initDB(accountsArray, assetsArray));
      } else {
        const ethAddresses = require('../controllers/accounts_ctrl.js');
        ethAddresses.findByAddress(accountsArray[0].publicAddress)
          .then((result) => {
            if (result.length === 0) {
              ethAddresses.addAddress(accountsArray[0].walletID, accountsArray[0].publicAddress, accountsArray[0].FCMIID);
            }
          }).catch((e) => { reject(e); });
        accountsArray.splice(0, 1);
        resolve(initDB(accountsArray, assetsArray));
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.initDB = initDB;

function initDBTxHistory() {
  return new Promise(((resolve, reject) => {
    try {
      logger.info('INITIALIZING TX HISTORY DATABASE ...');
      const txHistory = require('../controllers/transactions_ctrl.js');
      txHistory.findTxHistoryHeight()
        .then((result) => {
          if (result === 'NO_TX_HSTORY_HEIGHT') {
            txHistory.addZeroTxHistoryHeight()
              .then(() => {
                logger.info('-->Highest Block Number for ERC20 Tx History: 0');
                logger.info('TX HISTORY DATABASE INITIALIZED');
                resolve();
              }).catch((e) => { reject(e); });
          } else {
            logger.info(`-->Highest Block Number for Tx History: ${result}`);
            logger.info('TX HISTORY DATABASE INITIALIZED');
            resolve();
          }
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.initDBTxHistory = initDBTxHistory;

function resetDBTxHistory() {
  return new Promise(((resolve, reject) => {
    module.exports.emptyDBTxHistory()
      .then(() => {
        module.exports.initDBTxHistory()
          .then(() => {
            resolve();
          })
          .catch((e) => { reject(e); });
      })
      .catch((e) => { reject(e); });
  }));
}
module.exports.resetDBTxHistory = resetDBTxHistory;

function initDBERC20SmartContracts() {
  return new Promise(((resolve, reject) => {
    try {
      logger.info('INITIALIZING ERC20 SMART CONTRACTS DATABASE...');
      const smartContracts = require('../controllers/assets_ctrl.js');
      smartContracts.findERC20SmartContractsHistoryHeight()
        .then((result) => {
          if (result === 'NO_ERC20_CONTRACTS_HISTORY_HEIGHT') {
            smartContracts.addZeroSmartContractsCreationHistoryHeight()
              .then((zeroHeight) => {
                logger.info(`-->Highest Block Number for ERC20 Smart Contracts:${zeroHeight}`);
                logger.info('ERC20 SMART CONTRACTS DATABASE INITIALIZED');
                resolve();
              })
              .catch((e) => { reject(e); });
          } else {
            logger.info(`-->Highest Block Number for ERC20 Smart Contracts: ${result}`);
            logger.info('ERC20 SMART CONTRACTS DATABASE INITIALIZED');
            resolve();
          }
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.initDBERC20SmartContracts = initDBERC20SmartContracts;

function resetDBERC20SmartContracts() {
  return new Promise(((resolve, reject) => {
    module.exports.emptyDBERC20SmartContracts()
      .then(() => {
        module.exports.initDBERC20SmartContracts()
          .then(() => {
            resolve();
          })
          .catch((e) => { reject(e); });
      })
      .catch((e) => { reject(e); });
  }));
}
module.exports.resetDBERC20SmartContracts = resetDBERC20SmartContracts;

function emptyDB() {
  return new Promise(((resolve, reject) => {
    try {
      const accounts = require('../controllers/accounts_ctrl.js');
      accounts.emptyCollection()
        .then(() => {
          const assets = require('../controllers/assets_ctrl.js');
          assets.emptyCollection()
            .then(() => {
              const transactions = require('../controllers/transactions_ctrl.js');
              transactions.emptyCollection()
                .then(() => {
                  logger.info(('DATABASE IS NOW EMPTY'));
                  resolve();
                })
                .catch((e) => { reject(e); });
            })
            .catch((e) => { reject(e); });
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.emptyDB = emptyDB;

function emptyDBTxHistory() {
  return new Promise(((resolve, reject) => {
    try {
      const transactions = require('../controllers/transactions_ctrl.js');
	    transactions.emptyCollection()
        .then(() => {
          logger.info('DATABASE TRANSACTION HISTORY IS NOW EMPTY');
          resolve();
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.emptyDBTxHistory = emptyDBTxHistory;

function emptyDBERC20SmartContracts() {
  return new Promise(((resolve, reject) => {
    try {
      const assets = require('../controllers/assets_ctrl.js');
      assets.emptyCollection()
        .then(() => {
          logger.info('SMART CONTRACTS DATABASE IS NOW EMPTY');
          resolve();
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.emptyDBERC20SmartContracts = emptyDBERC20SmartContracts;

function getTxHistory(address1, fromtmstmp, address2, asset) {
  return new Promise(((resolve, reject) => {
    try {
      const transactions = require('../controllers/transactions_ctrl.js');
      logger.info('DB SERVICES GET TX HISTORY');
      transactions.getTxHistory(address1.toUpperCase(), fromtmstmp, address2.toUpperCase(), asset)
        .then((txHistory) => {
          resolve(txHistory);
        });
    } catch (e) { reject(e); }
  }));
}
module.exports.getTxHistory = getTxHistory;

function listPendingTx(address, asset) {
  return new Promise(((resolve, reject) => {
    try {
      const transactions = require('../controllers/transactions_ctrl.js');
      transactions.listPending()
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
    } catch (e) { reject(e); }
  }));
}
module.exports.listPendingTx = listPendingTx;

function listPending(protocol) {
  return new Promise(((resolve, reject) => {
    try {
      const transactions = require('../controllers/transactions_ctrl.js');
      transactions.listPending(protocol)
        .then((pendingTxArray) => {
          resolve(pendingTxArray);
        });
    } catch (e) { reject(e); }
  }));  
}
module.exports.listPending = listPending;

function findMaxBlock(protocol) {
  logger.debug('dbServices.findMaxBlock(): for protocol: ' + protocol);
  return new Promise(((resolve, reject) => {
    try {
      const transactions = require('../controllers/transactions_ctrl.js');
      transactions.findMaxBlock(protocol)
        .then((maxBlock) => {
          logger.debug('dbServices.findMaxBlock(): maxBlock = ' + maxBlock);
          resolve(maxBlock);
        });
    } catch (e) { reject(e); }
  }));  
}
module.exports.findMaxBlock = findMaxBlock;

