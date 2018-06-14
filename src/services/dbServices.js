const colors = require('colors');
const logger = require('../utils/logger.js');
require('dotenv').config();
const mongoose = require('mongoose');

module.exports.mongoose = mongoose;
const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PWD;
const serverIP = process.env.SERVER;
const dbName = process.env.DBNAME;
const mongoUrl = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}`;
let dbCollections;

function dbConnect($arg = { useMongoClient: true }) {
  return new Promise(((resolve, reject) => {
    try {
      // Setting up listeners
      module.exports.mongoose.connection.on('error', () => {
        logger.info(colors.red.bold("ERROR: Couldn't establish connection to database :(\n"));
        reject(new Error("ERROR: Couldn't establish connection to database"));
      });

      module.exports.mongoose.connection.on('open', () => {
        logger.info(colors.green.bold('Established connection to database!\n'));
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
	                logger.info(colors.cyan.bold.underline('MONITORED ACCOUNTS:\n'));
	                let i = 0;
	                accountsArray.forEach((item) => {
		                if (item.addresses[0] && i <= 10) {
			                logger.info(colors.cyan(`ACCOUNT # ${i}:\n PUBLIC ADDRESS = ${item.addresses[0].address}\n`));
		                }
		                i += 1;
	                });
	                if (i > 10) {
		                logger.info('. . .\n');
	                }
	                logger.info(colors.cyan.bold.underline('MONITORED SMART CONTRACTS:\n'));
	                i = 0;
	                assetsArray.forEach((item) => {
		                if (item.contractAddress !== 'contractAddress') {
			                logger.info(colors.cyan(`SMART CONTRACT # ${i}\n${item.name} : SYMBOL = ${item.symbol}    ADDRESS = ${item.contractAddress}\n`));
		                }
		                i += 1;
                  });
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
        if (idFrom !== undefined && idFrom !== '') {
          // fetch accounts registered after a given Id
          dbCollections.accounts.listRecent(idFrom)
            .then((ethAddressesArray) => {
              if (ethAddressesArray.length > 0) {
                logger.info(colors.cyan.bold.underline('NEW ACCOUNTS FOUND:\n'));
                let i = 0;
                // console.log(JSON.stringify(ethAddressesArray));
                ethAddressesArray.forEach((item) => {
                  logger.info(colors.cyan(`ACCOUNT # ${i}:\n PUBLIC ADDRESS = ${JSON.stringify(item.addresses)}\n`));
                  i += 1;
                });
              } else {
                logger.info(colors.cyan.bold.underline('NO NEW ACCOUNTS:\n'));
              }
              resolve(ethAddressesArray);
            })
            .catch((e) => { reject(e); });
        } else {
          dbCollections.accounts.listAll()
            .then((ethAddressesArray) => {
              logger.info(colors.cyan.bold.underline('FETCHING ALL ADDRESSES:\n'));
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
  url,
  idFrom,
  $arg = { useMongoClient: true },
) {
  return new Promise(((resolve, reject) => {
    // code to fetch list of contracts/assets to monitor
    module.exports.dbConnect(url, $arg)
      .then(() => {
        if (idFrom !== undefined && idFrom !== '') {
          // fetch accounts registered after a given Id
          dbCollections.assets.listRecent(idFrom)
            .then((assetsArray) => {
              resolve(assetsArray);
            })
            .catch((e) => { reject(e); });
        } else {
          dbCollections.assets.listAll()
            .then((assetsArray) => {
              resolve(assetsArray);
            })
            .catch((e) => { reject(e); });
        }
      });
  }));
}
module.exports.contractsToMonitor = contractsToMonitor;

function initDB(accountsArray, assetsArray) {
  return new Promise(((resolve, reject) => {
    try {
      logger.info(colors.yellow.bold('INITIALIZING DATABASE ADDRESSES COLLECTIONS...\n'));
      if (accountsArray.length === 0 && assetsArray.length === 0) {
        logger.info(colors.yellow.bold('DONE\n'));
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
      logger.info(colors.yellow.bold('INITIALIZING TX HISTORY DATABASE ...\n'));
      const txHistory = require('../controllers/transactions_ctrl.js');
      txHistory.findTxHistoryHeight()
        .then((result) => {
          if (result === 'NO_TX_HSTORY_HEIGHT') {
            txHistory.addZeroTxHistoryHeight()
              .then(() => {
                logger.info(colors.yellow('-->Highest Block Number for ERC20 Tx History: 0\n'));
                logger.info(colors.yellow.bold('TX HISTORY DATABASE INITIALIZED\n'));
                resolve();
              }).catch((e) => { reject(e); });
          } else {
            logger.info(colors.yellow(`-->Highest Block Number for Tx History: ${result}\n`));
            logger.info(colors.yellow.bold('TX HISTORY DATABASE INITIALIZED\n'));
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
      logger.info(colors.yellow.bold('INITIALIZING ERC20 SMART CONTRACTS DATABASE...\n'));
      const smartContracts = require('../controllers/assets_ctrl.js');
      smartContracts.findERC20SmartContractsHistoryHeight()
        .then((result) => {
          if (result === 'NO_ERC20_CONTRACTS_HISTORY_HEIGHT') {
            smartContracts.addZeroSmartContractsCreationHistoryHeight()
              .then((zeroHeight) => {
                logger.info(colors.yellow(`-->Highest Block Number for ERC20 Smart Contracts:${zeroHeight}\n`));
                logger.info(colors.yellow.bold('ERC20 SMART CONTRACTS DATABASE INITIALIZED\n'));
                resolve();
              })
              .catch((e) => { reject(e); });
          } else {
            logger.info(colors.yellow(`-->Highest Block Number for ERC20 Smart Contracts: ${result}\n`));
            logger.info(colors.yellow.bold('ERC20 SMART CONTRACTS DATABASE INITIALIZED\n'));
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
                  logger.info(colors.red.bold('DATABASE IS NOW EMPTY\n'));
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
          logger.info(colors.red.bold('DATABASE TRANSACTION HISTORY IS NOW EMPTY\n'));
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
          logger.info(colors.red.bold('SMART CONTRACTS DATABASE IS NOW EMPTY\n'));
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

