#!/usr/bin/env node
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices.js');
const bcx = require('./services/bcx.js');
const gethConnect = require('./services/gethConnect.js');
const processTx = require('./services/processTx.js');
const colors = require('colors');
const accounts = require('./services/accounts.js');
const ERC20ABI = require('./services/ERC20ABI');

const logs = false;

process.on('message', (data) => {
  logger.info('Housekeeper has received message from master........');
  const message = data.message;
  if (data.type === 'accounts') {
    for (let i = 0; i < message.length; i++) {
      const obj = message[i];
      logger.info(`Housekeeper received notification to monitor :${obj.pillarId.toLowerCase()} for pillarId: ${obj.pillarId}`);
      module.exports.recoverWallet(obj.pillarId.toLowerCase(), 15);
    }
  }
});

exports.init = function () {
  return new Promise((resolve, reject) => {
    try {
      gethConnect.gethConnectDisplay()
        .then(() => {
          /* CONNECT TO DATABASE */
          dbServices.dbConnectDisplayAccounts()
            .then(() => {
              dbServices.initDB(accounts.accountsArray, accounts.contractsArray)
                .then(() => {
                  dbServices.initDBTxHistory()
                    .then(() => {
                      dbServices.initDBERC20SmartContracts()
                        .then(() => {
                          resolve();
                        }).catch((e) => { reject(e); });
                    }).catch((e) => { reject(e); });
                }).catch((e) => { reject(e); });
            }).catch((e) => { reject(e); });
        }).catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  });
};

exports.recoverWallet = function (recoverAddress, nbBlocks) {
  return new Promise((resolve, reject) => {
    try {
      bcx.getPendingTxArray() // SEND MSG TO PRODUCTION SEGMENT
        .then((pendingTxArray) => {
          // CHECK IF TX ALREADY IN DB
          const unknownPendingTxArray = [];
          dbServices.dbCollections.transactions.listDbZeroConfTx()
            .then((dbPendingTxArray) => {
              pendingTxArray.forEach((pendingTx) => {
                let isDbPendingTx = false;
                dbPendingTxArray.forEach((dbPendingTx) => {
                  if (pendingTx.hash === dbPendingTx.txHash) {
                    isDbPendingTx = true;
                  }
                });
                if (isDbPendingTx === false) {
                  unknownPendingTxArray.push(pendingTx);
                }
              });
              processTx.processNewPendingTxArray(unknownPendingTxArray, 0, false, recoverAddress)
                .then((nbPendingTxFound) => {
                  console.log(`DONE RECOVERING PENDING TX FOR NEW ACCOUNT ${recoverAddress}\n--> ${nbPendingTxFound} transactions found\n`);
                  bcx.getLastBlockNumber()
                    .then((lastBlockNb) => {
                      module.exports.dlTxHistory(lastBlockNb - nbBlocks, lastBlockNb, 0, false, recoverAddress) // SEND MSG TO PRODUCTION SEGMENT
                        .then((nbMinedTxFound) => {
                          console.log(`DONE RECOVERING MINED TX FOR NEW ACCOUNT ${recoverAddress}\n--> ${nbMinedTxFound} transactions found\n`);
                          resolve();
                        })
                        .catch((e) => {
                          reject(e);
                        });
                    })
                    .catch((e) => {
                      reject(e);
                    });
                })
                .catch((e) => {
                  reject(e);
                });
            })
            .catch((e) => {
              reject(e);
            });
        })
        .catch((e) => {
          reject(e);
        });
    } catch (err) {
      reject(err);
    }
  });
};


exports.checkTxPool = function () {
  // At connection time: Check for pending Tx in TX pool which are not in DB
  // and would not be added in TX History by dbServices.updateTxHistory
  return new Promise((resolve, reject) => {
    try {
      logger.info(colors.yellow.bold('UPDATING PENDING TX IN DATABASE...\n'));
      bcx.getPendingTxArray()
        .then((pendingTxArray) => {
          // CHECK IF TX ALREADY IN DB
          const unknownPendingTxArray = [];
          dbServices.dbCollections.transactions.listDbZeroConfTx()
            .then((dbPendingTxArray) => {
              pendingTxArray.forEach((pendingTx) => {
                let isDbPendingTx = false;
                dbPendingTxArray.forEach((dbPendingTx) => {
                  if (pendingTx === dbPendingTx) {
                    isDbPendingTx = true;
                  }
                });
                if (isDbPendingTx === false) {
                  unknownPendingTxArray.push(pendingTx);
                }
              });
              processTx.processNewPendingTxArray(unknownPendingTxArray, 0, false)
                .then((nbTxFound) => {
                  logger.info(colors.yellow.bold(`DONE UPDATING PENDING TX IN DATABASE\n--> ${nbTxFound} transactions found\n`));
                  resolve();
                }).catch((e) => { reject(e); });
            }).catch((e) => { reject(e); });
        }).catch((e) => { reject(e); });
    } catch (err) { reject(err); }
  });
};


exports.updateTxHistory = function () {
  return new Promise(((resolve, reject) => {
    try {
      bcx.getLastBlockNumber()
        .then((maxBlock) => {
          logger.info(colors.red.bold(`LAST BLOCK NUMBER = ${maxBlock}\n`));
          dbServices.dbCollections.transactions.findTxHistoryHeight()
            .then((startBlock) => {
              logger.info(colors.red.bold(`UPDATING TRANSACTIONS HISTORY FROM ETHEREUM NODE... BACK TO BLOCK # ${startBlock}\n`));
              this.dlTxHistory(startBlock, maxBlock, 0, logs)
                .then((nbTxFound) => {
                  logger.info(colors.red.bold('TRANSACTIONS HISTORY UPDATED SUCCESSFULLY!\n'));
                  logger.info(colors.red(`-->${nbTxFound} transactions found\n`));
                  resolve();
                })
                .catch((e) => {
                  reject(e);
                });
            })
            .catch((e) => {
              reject(e);
            });
        });
    } catch (e) { reject(e); }
  }));
};

exports.dlTxHistory = function (startBlock, maxBlock, nbTx, logs = false, recoverAddress = null) {
  return new Promise(((resolve, reject) => {
    try {
      if (startBlock > maxBlock) {
        resolve(nbTx);
      } else {
        if (logs) {
          logger.info(colors.red(`DOWNLOADING TX HISTORY FOR BLOCK # ${startBlock}\n`));
        }
        bcx.getBlockTx(startBlock)
          .then((txArray) => {
            module.exports.processTxHistory(txArray, 0, 0, recoverAddress)
              .then((nbBlockTx) => {
                nbTx += nbBlockTx;
                dbServices.dbCollections.transactions.listHistory()
                  .then((historyTxArray) => {
                    processTx.checkPendingTx(historyTxArray, maxBlock, false, recoverAddress)
                      .then(() => {
                        dbServices.dbCollections.transactions.updateTxHistoryHeight(startBlock)
                          .then(() => {
                            resolve(this.dlTxHistory(startBlock + 1, maxBlock, nbTx, logs, recoverAddress));
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
};

exports.processTxHistory = function (txArray, nbTx, index, recoverAddress = null) {
  return new Promise(((resolve, reject) => {
    try {
      if (index === txArray.length) {
        resolve(nbTx);
      } else {
        processTx.newPendingTx(txArray[index], false, recoverAddress)
          .then((pillarWalletTx) => {
            if (pillarWalletTx) {
              nbTx += 1;
            }
            resolve(this.processTxHistory(txArray, nbTx, index + 1, recoverAddress));
          });
      }
    } catch (e) { reject(e); }
  }));
};

exports.dlERC20SmartContracts = function (startBlock, endBlock, nbERC20Found, logs = false) {
  return new Promise(((resolve, reject) => {
    try {
      if (startBlock > endBlock) {
        resolve(nbERC20Found);
      } else {
        if (logs) {
          logger.info(colors.blue(`LOOKING FOR NEW ERC20 SMART CONTRACTS : BLOCK # ${startBlock}/${endBlock}\n`));
        }
        gethConnect.web3.eth.getBlock(startBlock, false)
          .then((result) => {
            bcx.getBlockSmartContractsAddressesArray(result.transactions, [], 0)
              .then((smartContractsAddressesArray) => {
                this.processSmartContractsAddressesArray(smartContractsAddressesArray, 0, 0)
                  .then((nbFound) => {
                    nbERC20Found += nbFound;
                    dbServices.dbCollections.assets.updateERC20SmartContractsHistoryHeight(startBlock)
                      .then(() => {
                        resolve(this.dlERC20SmartContracts(startBlock + 1, endBlock, nbERC20Found, logs));
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
};

exports.processSmartContractsAddressesArray = function (smartContractsAddressesArray, index, nbERC20Found) {
  return new Promise(((resolve, reject) => {
    try {
      if (index >= smartContractsAddressesArray.length) {
        resolve(nbERC20Found);
      } else {
        try {
          let ERC20SmartContract
            = new gethConnect.web3.eth.Contract(ERC20ABI, smartContractsAddressesArray[index]);
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
                          ERC20SmartContract = {
                            protocol: 'Ethereum',
                            name,
                            symbol,
                            decimals,
                            contractAddress: smartContractsAddressesArray[index],
                          };
                          dbServices.dbCollections.assets.addContract(ERC20SmartContract)
                            .then(() => {
                              logger.info(`Notifying master about a new smart contract: ${JSON.stringify(ERC20SmartContract)}`);
                              // SEND IPC NOTIFICATION TO PUB-MASTER FOR
                              // ERC20 SMART CONTRACT SUBSCRIPTION
                              process.send({
                                type: 'accounts',
                                message: ERC20SmartContract,
                              });
                              resolve(this.processSmartContractsAddressesArray(smartContractsAddressesArray, index + 1, nbERC20Found));
                            })
                            .catch((e) => { reject(e); });
                        } else {
                          logger.info(colors.magenta('-->discarded (invalid name, symbol or decimals)\n'));
                          resolve(this.processSmartContractsAddressesArray(smartContractsAddressesArray, index + 1, nbERC20Found));
                        }
                      } else {
                        resolve(this.processSmartContractsAddressesArray(smartContractsAddressesArray, index + 1, nbERC20Found));
                      }
                    })
                    .catch(() => {
                      resolve(this.processSmartContractsAddressesArray(smartContractsAddressesArray, index + 1, nbERC20Found));
                    });
                })
                .catch(() => {
                  resolve(this.processSmartContractsAddressesArray(smartContractsAddressesArray, index + 1, nbERC20Found));
                });
            })
            .catch(() => {
              resolve(this.processSmartContractsAddressesArray(smartContractsAddressesArray, index + 1, nbERC20Found));
            });
        } catch (e) {
          resolve(this.processSmartContractsAddressesArray(smartContractsAddressesArray, index + 1, nbERC20Found));
        }
      }
    } catch (e) { reject(e); }
  }));
};

exports.updateERC20SmartContracts = function () {
  return new Promise(((resolve, reject) => {
    try {
      bcx.getLastBlockNumber()
        .then((maxBlock) => {
          logger.info(colors.blue.bold(`LAST BLOCK NUMBER = ${maxBlock}\n`));
          dbServices.dbCollections.assets.findERC20SmartContractsHistoryHeight()
            .then((startBlock) => {
              logger.info(colors.blue.bold(`UPDATING ERC20 SMART CONTRACTS DB FROM ETHEREUM NODE... BACK TO BLOCK # ${startBlock}\n`));
              this.dlERC20SmartContracts(startBlock, maxBlock, 0, logs)
                .then((nbERC20Found) => {
                  logger.info(colors.blue.bold('ERC20 SMART CONTRACTS DB UPDATED SUCCESSFULLY!\n'));
                  logger.info(colors.blue(`-->${nbERC20Found} ERC20 smart contracts found\n`));
                  resolve();
                })
                .catch((e) => { reject(e); });
            })
            .catch((e) => { reject(e); });
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
};

exports.checkNewERC20SmartContracts = function () {
  // CHECKS FOR NEW ERC20 SMART CONTRACTS PUBLISHED @ EACH NEW BLOCK
  const subscribePromise = new Promise((resolve, reject) => {
    try {
      gethConnect.web3.eth.subscribe('newBlockHeaders', (err, res) => {})
        .on('data', (blockHeader) => {
          if (blockHeader != null) {
            logger.info(colors.gray(`NEW BLOCK MINED : # ${blockHeader.number} Hash = ${blockHeader.hash}\n`));
            // NOW, @ EACH NEW BLOCK MINED
            // Check for newly created ERC20 smart contracts
            this.dlERC20SmartContracts(blockHeader.number, blockHeader.number, logs)
              .then(() => {
                dbServices.dbCollections.assets.updateERC20SmartContractsHistoryHeight(blockHeader.number)
                  .then(() => {
                    // logger.info(colors.green.bold('Highest Block Number for ERC20 Smart Contracts: '+blockHeader.number+'\n'))
                  });
              });
          }
        })
        .on('endSubscribeBlockHeaders', () => { // Used for testing only
          logger.info('END BLOCK HEADERS SUBSCRIBTION\n');
          resolve();
        });
      logger.info(colors.green.bold('Subscribed to Block Headers\n'));
    } catch (e) { reject(e); }
  });
  return (subscribePromise);
};

this.init()
  .then(() => {
    this.checkTxPool(); // CHECKS TX POOL FOR TRANSACTIONS AND STORES THEM IN DB
    this.updateTxHistory(); // CHECKS BLOCKCHAIN FOR TRANSACTIONS AND STORES THEM IN DB
    this.updateERC20SmartContracts(); // CHECKS BLOCKCHAIN FOR ERC20 SMART CONTRACTS AND STORES THEM IN DB
    this.checkNewERC20SmartContracts();
    // CHECKS FOR NEW ERC20 SMART CONTRACTS @ EACH NEW BLOCK, AND STORES THEM IN DB
  })
  .catch((e) => { logger.error(e); });

