const colors = require('colors');
const logger = require('../utils/logger.js');

const ERC20ABI = require('./ERC20ABI.json');
const mongoose = require('mongoose');

module.exports.mongoose = mongoose;

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
        resolve({ ethAddresses, smartContracts, ethTransactions });
      });

      // Import DB controllers
      const ethAddresses = require('../controllers/accounts_ctrl.js');
      const smartContracts = require('../controllers/assets_ctrl.js');
      const ethTransactions = require('../controllers/transactions_ctrl.js');

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
        .then((dbCollections) => {
          // Display accounts
          dbCollections.ethAddresses.listAll()
            .then((ethAddressesArray) => {
              dbCollections.smartContracts.listAll()
                .then((smartContractsAddressesArray) => {
                  logger.info(colors.cyan.bold.underline('MONITORED ACCOUNTS:\n'));
                  let i = 0;
                  ethAddressesArray.forEach((item) => {
                    logger.info(colors.cyan(`ACCOUNT # ${i}:\n PUBLIC ADDRESS = ${item.addresses[0].address}\n`));
                    i += 1;
                  });
                  logger.info(colors.cyan.bold.underline('MONITORED SMART CONTRACTS:\n'));
                  i = 0;
                  smartContractsAddressesArray.forEach((item) => {
                    if (item.address !== 'address') {
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

function dlTxHistory(
  web3, bcx, processTx, dbCollections, abiDecoder,
  notif, channel, queue, startBlock, maxBlock, nbTx, checkAddress = null,
) {
  return new Promise(((resolve, reject) => {
    try {
      if (startBlock > maxBlock) {
        resolve(nbTx);
      } else {
        logger.info(colors.red(`DOWNLOADING TX HISTORY FOR BLOCK # ${startBlock}\n`));
        bcx.getBlockTx(web3, startBlock)
          .then((txArray) => {
            module.exports.processTxHistory(
              web3, processTx, txArray, dbCollections,
              abiDecoder, notif, channel, queue, 0, 0, null,
            )
              .then((nbBlockTx) => {
                nbTx += nbBlockTx;
                dbCollections.ethTransactions.listHistory()
                  .then((historyTxArray) => {
                    processTx.checkPendingTx(web3, bcx, dbCollections, historyTxArray, maxBlock, notif, false)
                      .then(() => {
                        dbCollections.ethTransactions.updateTxHistoryHeight(startBlock)
                          .then(() => {
                            resolve(dlTxHistory(
                              web3, bcx, processTx, dbCollections, abiDecoder,
                              notif, channel, queue, startBlock + 1, maxBlock, nbTx, checkAddress,
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
  web3, processTx, txArray, dbCollections, abiDecoder,
  notif, channel, queue, nbTx, index, checkAddress = null,
) {
  return new Promise(((resolve, reject) => {
    try {
      if (index === txArray.length) {
        resolve(nbTx);
      } else {
        processTx.newPendingTx(
          web3, txArray[index], dbCollections, abiDecoder,
          notif, channel, queue, false, true, checkAddress,
        )
          .then((pillarWalletTx) => {
            if (pillarWalletTx) {
              nbTx += 1;
            }
            resolve(processTxHistory(
              web3, processTx, txArray, dbCollections, abiDecoder,
              notif, channel, queue, nbTx, index + 1, checkAddress,
            ));
          });
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.processTxHistory = processTxHistory;

function updateTxHistory(web3, bcx, processTx, dbCollections, abiDecoder, notif, channel, queue, maxBlock) {
  return new Promise(((resolve, reject) => {
    try {
      dbCollections.ethTransactions.findTxHistoryHeight()
        .then((startBlock) => {
          logger.info(colors.red.bold(`UPDATING TRANSACTIONS HISTORY FROM ETHEREUM NODE... BACK TO BLOCK # ${startBlock}\n`));
          this.dlTxHistory(
            web3, bcx, processTx, dbCollections, abiDecoder,
            notif, channel, queue, startBlock, maxBlock, 0,
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

function initDB(accountsArray, contractsArray) {
  return new Promise(((resolve, reject) => {
    try {
      logger.info(colors.yellow.bold('INITIALIZING DATABASE ADDRESSES COLLECTIONS...\n'));
      if (accountsArray.length === 0 && contractsArray.length === 0) {
        logger.info(colors.yellow.bold('DONE\n'));
        resolve();
      } else if (accountsArray.length === 0) {
        const smartContracts = require('../controllers/assets_ctrl.js');
        smartContracts.findByAddress(contractsArray[0].address)
          .then((result) => {
            if (result.length === 0) {
              smartContracts.addContract(
                contractsArray[0].address, contractsArray[0].name,
                contractsArray[0].ticker, contractsArray[0].decimals,
                'Ethereum',
              );
            }
          }).catch((e) => { reject(e); });

        contractsArray.splice(0, 1);
        resolve(initDB(accountsArray, contractsArray));
      } else {
        const ethAddresses = require('../controllers/accounts_ctrl.js');
        ethAddresses.findByAddress(accountsArray[0].publicAddress)
          .then((result) => {
            if (result.length === 0) {
              ethAddresses.addAddress(accountsArray[0].walletID, accountsArray[0].publicAddress, accountsArray[0].FCMIID);
            }
          }).catch((e) => { reject(e); });
        accountsArray.splice(0, 1);
        resolve(initDB(accountsArray, contractsArray));
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
      const ethAddresses = require('../controllers/accounts_ctrl.js');
      ethAddresses.emptyCollection()
        .then(() => {
          const smartContracts = require('../controllers/assets_ctrl.js');
          smartContracts.emptyCollection()
            .then(() => {
              const ethTransactions = require('../controllers/transactions_ctrl.js');
              ethTransactions.emptyCollection()
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
      const ethTransactions = require('../controllers/transactions_ctrl.js');
      ethTransactions.emptyCollection()
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
      const smartContracts = require('../controllers/assets_ctrl.js');
      smartContracts.emptyCollection()
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
      const ethTransactions = require('../controllers/transactions_ctrl.js');
      logger.info('DB SERVICES GET TX HISTORY');
      ethTransactions.getTxHistory(address1.toUpperCase(), fromtmstmp, address2.toUpperCase(), asset)
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
      const ethTransactions = require('../controllers/transactions_ctrl.js');
      ethTransactions.listPending()
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


function dlERC20SmartContracts(
  web3, gethSubscribe, bcx, processTx, notif, startBlock,
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
                  web3, gethSubscribe, bcx, processTx, notif,
                  dbCollections, smartContractsAddressesArray, 0, 0,
                )
                  .then((nbFound) => {
                    nbERC20Found += nbFound;
                    dbCollections.smartContracts.updateERC20SmartContractsHistoryHeight(startBlock)
                      .then(() => {
                        resolve(dlERC20SmartContracts(
                          web3, gethSubscribe, bcx, processTx, notif, startBlock + 1,
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
  web3, gethSubscribe, bcx, processTx, notif, dbCollections,
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
                          dbCollections.smartContracts.addContract(smartContractsAddressesArray[index], name, symbol, decimals)
                            .then(() => {
                              ERC20SmartContract = {
                                address: smartContractsAddressesArray[index],
                                ticker: symbol,
                                decimals,
                              };
                              gethSubscribe.subscribeERC20SmartContract(web3, bcx, dbCollections, processTx, notif, ERC20SmartContract);
                              resolve(processSmartContractsAddressesArray(
                                web3, gethSubscribe, bcx, processTx, notif, dbCollections,
                                smartContractsAddressesArray, index + 1, nbERC20Found,
                              ));
                            })
                            .catch((e) => { reject(e); });
                        } else {
                          logger.info(colors.magenta('-->discarded (invalid name, symbol or decimals)\n'));
                          resolve(processSmartContractsAddressesArray(
                            web3, gethSubscribe, bcx, processTx, notif, dbCollections,
                            smartContractsAddressesArray, index + 1, nbERC20Found,
                          ));
                        }
                      } else {
                        resolve(processSmartContractsAddressesArray(
                          web3, gethSubscribe, bcx, processTx, notif, dbCollections,
                          smartContractsAddressesArray, index + 1, nbERC20Found,
                        ));
                      }
                    })
                    .catch(() => {
                      resolve(processSmartContractsAddressesArray(
                        web3, gethSubscribe, bcx, processTx, notif, dbCollections,
                        smartContractsAddressesArray, index + 1, nbERC20Found,
                      ));
                    });
                })
                .catch(() => {
                  resolve(processSmartContractsAddressesArray(
                    web3, gethSubscribe, bcx, processTx, notif, dbCollections,
                    smartContractsAddressesArray, index + 1, nbERC20Found,
                  ));
                });
            })
            .catch(() => {
              resolve(processSmartContractsAddressesArray(
                web3, gethSubscribe, bcx, processTx, notif, dbCollections,
                smartContractsAddressesArray, index + 1, nbERC20Found,
              ));
            });
        } catch (e) {
          resolve(processSmartContractsAddressesArray(
            web3, gethSubscribe, bcx, processTx, notif, dbCollections,
            smartContractsAddressesArray, index + 1, nbERC20Found,
          ));
        }
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.processSmartContractsAddressesArray = processSmartContractsAddressesArray;

function updateERC20SmartContracts(web3, gethSubscribe, bcx, processTx, notif, dbCollections, channel, queue, maxBlock) {
  return new Promise(((resolve, reject) => {
    try {
      dbCollections.smartContracts.findERC20SmartContractsHistoryHeight()
        .then((startBlock) => {
          logger.info(colors.blue.bold(`UPDATING ERC20 SMART CONTRACTS DB FROM ETHEREUM NODE... BACK TO BLOCK # ${startBlock}\n`));
          module.exports.dlERC20SmartContracts(
            web3, gethSubscribe, bcx, processTx, notif,
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
