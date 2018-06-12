const colors = require('colors');
const logger = require('../utils/logger.js');

const ERC20ABI = require('./ERC20ABI.json');
const mongoose = require('mongoose');

module.exports.mongoose = mongoose;

let dbCollections;

function dbConnect(url, $arg = { useMongoClient: true }) {
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
        resolve();
        // resolve({ accounts, assets, transactions });
      });

      // Import DB controllers
      const accounts = require('../controllers/accounts_ctrl.js');
      const assets = require('../controllers/assets_ctrl.js');
      const transactions = require('../controllers/transactions_ctrl.js');

	    // Connect to database
	    module.exports.mongoose.connect(url, $arg);
    } catch (e) { reject(e); }
  }));
}
module.exports.dbConnect = dbConnect;

function dbConnectDisplayAccounts(url, $arg = { useMongoClient: true }) {
  return new Promise(((resolve, reject) => {
    try {
      module.exports.dbConnect(url, $arg)
        .then(() => {
        // .then((dbCollections) => {
          // Display accounts
          dbCollections.accounts.listAll()
            .then((accountsArray) => {
              dbCollections.assets.listAll()
                .then((assetsArray) => {
                  logger.info(colors.cyan.bold.underline('MONITORED ACCOUNTS:\n'));
                  let i = 0;
                  accountsArray.forEach((item) => {
                    logger.info(colors.cyan(`ACCOUNT # ${i}:\n PUBLIC ADDRESS = ${item.addresses[0].address}\n`));
                    i += 1;
                  });
                  logger.info(colors.cyan.bold.underline('MONITORED SMART CONTRACTS:\n'));
                  i = 0;
                  assetsArray.forEach((item) => {
                    if (item.contractAddress !== 'contractAddress') {
                      logger.info(colors.cyan(`SMART CONTRACT # ${i}\n${item.name} : SYMBOL = ${item.symbol}    ADDRESS = ${item.contractAddress}\n`));
                    }
                    i += 1;
                  });
                  resolve(dbCollections);
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
  url,
  idFrom,
  protocol,
  $arg = { useMongoClient: true },
) {
  return new Promise(((resolve, reject) => {
    try {
      module.exports.dbConnect(url, $arg)
        .then((dbCollections) => {
          if(idFrom !== undefined && idFrom !== '') {
            // fetch accounts registered after a given Id
            dbCollections.accounts.listRecent(idFrom)
              .then((ethAddressesArray) => {
                logger.info(colors.cyan.bold.underline('NEW ACCOUNTS:\n'));
                let i = 0;
                //console.log(JSON.stringify(ethAddressesArray));
                ethAddressesArray.forEach((item) => {
                  logger.info(colors.cyan(`ACCOUNT # ${i}:\n PUBLIC ADDRESS = ${JSON.stringify(item.addresses)}\n`));
                  i += 1;
                });
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
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.recentAccounts = recentAccounts;

function dlTxHistory(
  web3, bcx, processTx, dbCollections, abiDecoder, startBlock, maxBlock, nbTx, checkAddress = null,
) {
  return new Promise(((resolve, reject) => {
    try {
      if (startBlock > maxBlock) {
        resolve(nbTx);
      } else {
        // logger.info(colors.red(`DOWNLOADING TX HISTORY FOR BLOCK # ${startBlock}\n`));
        bcx.getBlockTx(web3, startBlock)
          .then((txArray) => {
            module.exports.processTxHistory(
              web3, processTx, txArray, dbCollections,
              abiDecoder, 0, 0, null,
            )
              .then((nbBlockTx) => {
                nbTx += nbBlockTx;
                dbCollections.transactions.listHistory()
                  .then((historyTxArray) => {
                    processTx.checkPendingTx(web3, bcx, dbCollections, historyTxArray, maxBlock, null, null, null, false)
                      .then(() => {
                        dbCollections.transactions.updateTxHistoryHeight(startBlock)
                          .then(() => {
                            resolve(dlTxHistory(
                              web3, bcx, processTx, dbCollections, abiDecoder, startBlock + 1, maxBlock, nbTx, checkAddress,
                            ));
                          })
                          .catch((e) => { reject(e); });
                      })
                      .catch((e) => { reject(e); });
                  })
                  .catch((e) => { reject(e); });
              })
              .catch((e) => { reject(e); });
          })
          .catch((e) => { reject(e); });
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.dlTxHistory = dlTxHistory;

function processTxHistory(
  web3, processTx, txArray, dbCollections, abiDecoder, nbTx, index, checkAddress = null,
) {
  return new Promise(((resolve, reject) => {
    try {
      if (index === txArray.length) {
        resolve(nbTx);
      } else {
        processTx.newPendingTx(
          web3, txArray[index], dbCollections, abiDecoder, null, null, null, false, checkAddress,
        )
          .then((pillarWalletTx) => {
            if (pillarWalletTx) {
              nbTx += 1;
            }
            resolve(processTxHistory(
              web3, processTx, txArray, dbCollections, abiDecoder, nbTx, index + 1, checkAddress,
            ));
          });
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.processTxHistory = processTxHistory;

function updateTxHistory(web3, bcx, processTx, dbCollections, abiDecoder, maxBlock) {
  return new Promise(((resolve, reject) => {
    try {
      dbCollections.transactions.findTxHistoryHeight()
        .then((startBlock) => {
          logger.info(colors.red.bold(`UPDATING TRANSACTIONS HISTORY FROM ETHEREUM NODE... BACK TO BLOCK # ${startBlock}\n`));
          this.dlTxHistory(
            web3, bcx, processTx, dbCollections, abiDecoder, startBlock, maxBlock, 0,
          )
            .then((nbTxFound) => {
              logger.info(colors.red.bold('TRANSACTIONS HISTORY UPDATED SUCCESSFULLY!\n'));
              logger.info(colors.red(`-->${nbTxFound} transactions found\n`));
              resolve();
            })
            .catch((e) => { reject(e); });
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.updateTxHistory = updateTxHistory;

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

/*
function dlERC20SmartContracts(
  web3, gethSubscribe, bcx, processTx, startBlock,
  endBlock, dbCollections, nbERC20Found, logs = false,
) {
  return new Promise(((resolve, reject) => {
    try {
      if (startBlock > endBlock) {
        resolve(nbERC20Found);
      } else {
        if (logs) {
          logger.info(colors.blue(`LOOKING FOR NEW ERC20 SMART CONTRACTS : BLOCK # ${startBlock}/${endBlock}\n`));
        }
        web3.eth.getBlock(startBlock, false)
          .then((result) => {
            bcx.getBlockSmartContractsAddressesArray(web3, result.transactions, [], 0)
              .then((smartContractsAddressesArray) => {
                module.exports.processSmartContractsAddressesArray(
                  web3, gethSubscribe, bcx, processTx,
                  dbCollections, smartContractsAddressesArray, 0, 0,
                )
                  .then((nbFound) => {
                    nbERC20Found += nbFound;
                    dbCollections.assets.updateERC20SmartContractsHistoryHeight(startBlock)
                      .then(() => {
                        resolve(dlERC20SmartContracts(
                          web3, gethSubscribe, bcx, processTx, startBlock + 1,
                          endBlock, dbCollections, nbERC20Found, logs,
                        ));
                      })
                      .catch((e) => { reject(e); });
                  })
                  .catch((e) => { reject(e); });
              })
              .catch((e) => { reject(e); });
          })
          .catch((e) => { reject(e); });
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.dlERC20SmartContracts = dlERC20SmartContracts;

function processSmartContractsAddressesArray(
  web3, gethSubscribe, bcx, processTx, dbCollections,
  smartContractsAddressesArray, index, nbERC20Found,
) {
  return new Promise(((resolve, reject) => {
    try {
      if (index >= smartContractsAddressesArray.length) {
        resolve(nbERC20Found);
      } else {
        try {
          let ERC20SmartContract
            = new web3.eth.Contract(ERC20ABI, smartContractsAddressesArray[index]);
          ERC20SmartContract.methods.decimals().call()
            .then((result) => {
              const decimals = result;
              // logger.info('DECIMALS : '+decimals)
              ERC20SmartContract.methods.name().call()
                .then((result2) => {
                  const name = result2;
                  // logger.info('NAME : '+name)
                  ERC20SmartContract.methods.symbol().call()
                    .then((result3) => {
                      const symbol = result3;
                      // logger.info('SYMBOL : '+symbol)
                      if (decimals !== undefined && name !== undefined && symbol !== undefined) {
                        logger.info(colors.magenta.bold(`NEW ERC20 SMART CONTRACT FOUND: ${name}, symbol = ${symbol}, decimals = ${decimals}\n`));
                        if (name.length > 0 && symbol.length > 0 && decimals.length > 0) {
                          nbERC20Found += 1;
                          dbCollections.assets.addContract(smartContractsAddressesArray[index], name, symbol, decimals)
                            .then(() => {
                              ERC20SmartContract = {
                                address: smartContractsAddressesArray[index],
                                ticker: symbol,
                                decimals,
                              };
                              // gethSubscribe.subscribeERC20SmartContract(web3, bcx, dbCollections, processTx, channel, queue, rmqServices, ERC20SmartContract);
                              // HERE SEND IPC NOTIFICATION TO PUB-MASTER FOR ERC20 ~SMA~RT CONTRACT SUBSCRIPTION
                              resolve(processSmartContractsAddressesArray(
                                web3, gethSubscribe, bcx, processTx, dbCollections,
                                smartContractsAddressesArray, index + 1, nbERC20Found,
                              ));
                            })
                            .catch((e) => { reject(e); });
                        } else {
                          logger.info(colors.magenta('-->discarded (invalid name, symbol or decimals)\n'));
                          resolve(processSmartContractsAddressesArray(
                            web3, gethSubscribe, bcx, processTx, dbCollections,
                            smartContractsAddressesArray, index + 1, nbERC20Found,
                          ));
                        }
                      } else {
                        resolve(processSmartContractsAddressesArray(
                          web3, gethSubscribe, bcx, processTx, dbCollections,
                          smartContractsAddressesArray, index + 1, nbERC20Found,
                        ));
                      }
                    })
                    .catch(() => {
                      resolve(processSmartContractsAddressesArray(
                        web3, gethSubscribe, bcx, processTx, dbCollections,
                        smartContractsAddressesArray, index + 1, nbERC20Found,
                      ));
                    });
                })
                .catch(() => {
                  resolve(processSmartContractsAddressesArray(
                    web3, gethSubscribe, bcx, processTx, dbCollections,
                    smartContractsAddressesArray, index + 1, nbERC20Found,
                  ));
                });
            })
            .catch(() => {
              resolve(processSmartContractsAddressesArray(
                web3, gethSubscribe, bcx, processTx, dbCollections,
                smartContractsAddressesArray, index + 1, nbERC20Found,
              ));
            });
        } catch (e) {
          resolve(processSmartContractsAddressesArray(
            web3, gethSubscribe, bcx, processTx, dbCollections,
            smartContractsAddressesArray, index + 1, nbERC20Found,
          ));
        }
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.processSmartContractsAddressesArray = processSmartContractsAddressesArray;

function updateERC20SmartContracts(web3, gethSubscribe, bcx, processTx, dbCollections, maxBlock) {
  return new Promise(((resolve, reject) => {
    try {
      dbCollections.assets.findERC20SmartContractsHistoryHeight()
        .then((startBlock) => {
          logger.info(colors.blue.bold(`UPDATING ERC20 SMART CONTRACTS DB FROM ETHEREUM NODE... BACK TO BLOCK # ${startBlock}\n`));
          module.exports.dlERC20SmartContracts(
            web3, gethSubscribe, bcx, processTx,
            startBlock, maxBlock, dbCollections, 0, true,
          )
            .then((nbERC20Found) => {
              logger.info(colors.blue.bold('ERC20 SMART CONTRACTS DB UPDATED SUCCESSFULLY!\n'));
              logger.info(colors.blue(`-->${nbERC20Found} ERC20 smart contracts found\n`));
              resolve();
            })
            .catch((e) => { reject(e); });
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.updateERC20SmartContracts = updateERC20SmartContracts;
*/

function contractsToMonitor(
  url,
  idFrom,
  $arg = { useMongoClient: true }
) {
  return new Promise(((resolve, reject) => {
    //code to fetch list of contracts/assets to monitor
    module.exports.dbConnect(url, $arg)
    .then((dbCollections) => {
      if(idFrom !== undefined && idFrom !== '') {
        // fetch accounts registered after a given Id
        dbCollections.assets.listRecent(idFrom)
        .then((assetsArray) => {
          resolve(assetsArray);
        })
        .catch((e) => { reject(e);})
      } else {
        dbCollections.assets.listAll()
        .then((assetsArray) => {
          resolve(assetsArray);
        })
        .catch((e) => { reject(e);});
      }
    });
  }));
}
module.exports.contractsToMonitor = contractsToMonitor;