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

exports.init = () => {
  return new Promise((resolve, reject) => {
    /* CONNECT TO DATABASE */
    gethConnect.gethConnectDisplay()
      .then(() => dbServices.dbConnectDisplayAccounts())
      .then(() => dbServices.initDB(accounts.accountsArray, accounts.contractsArray))
      .then(() => dbServices.initDBTxHistory())
      .then(() => dbServices.initDBERC20SmartContracts())
      .then(() => resolve())
      .catch(e => reject(e));
  });
};

exports.checkTxPool = () => {
  // At connection time: Check for pending Tx in TX pool which are not in DB
  // and would not be added in TX History by dbServices.updateTxHistory
  return new Promise((resolve, reject) => {
    logger.info(colors.yellow.bold('UPDATING PENDING TX IN DATABASE...\n'));
    let pendingTxArray = [];

    bcx.getPendingTxArray()
      .then((arr) => {
        pendingTxArray = arr;
        // CHECK IF TX ALREADY IN DB
        return dbServices.dbCollections.transactions.listDbZeroConfTx();
      })
      .then((dbPendingTxArray) => {
        const unknownPendingTxArray = [];
        pendingTxArray.forEach((pendingTx) => {
          let isDbPendingTx = false;
          dbPendingTxArray.forEach((dbPendingTx) => {
            if (pendingTx === dbPendingTx) {
              isDbPendingTx = true;
            }
          });
          if (!isDbPendingTx) {
            unknownPendingTxArray.push(pendingTx);
          }
        });
        return processTx.processNewPendingTxArray(unknownPendingTxArray, 0, false);
      })
      .then((nbTxFound) => {
        logger.info(colors.yellow.bold(`DONE UPDATING PENDING TX IN DATABASE\n--> ${nbTxFound} transactions found\n`));
        resolve();
      })
      .catch(e => reject(e));
  });
};

exports.updateTxHistory = () => {
  return new Promise((resolve, reject) => {
    let maxBlock;
    bcx.getLastBlockNumber()
      .then((mb) => {
        maxBlock = mb;
        logger.info(colors.red.bold(`LAST BLOCK NUMBER = ${maxBlock}\n`));
        return dbServices.dbCollections.transactions.findTxHistoryHeight();
      })
      .then((startBlock) => {
        logger.info(colors.red.bold(`UPDATING TRANSACTIONS HISTORY FROM ETHEREUM NODE... BACK TO BLOCK # ${startBlock}\n`));
        return this.dlTxHistory(startBlock, maxBlock, 0, logs);
      })
      .then((nbTxFound) => {
        logger.info(colors.red.bold('TRANSACTIONS HISTORY UPDATED SUCCESSFULLY!\n'));
        logger.info(colors.red(`-->${nbTxFound} transactions found\n`));
        resolve();
      })
      .catch(e => reject(e));
  });
};

exports.dlTxHistory = (startBlock, maxBlock, nbTx, logs = false) => {
  return new Promise(((resolve, reject) => {
    if (startBlock > maxBlock) {
      return resolve(nbTx);
    }

    if (logs) {
      logger.info(colors.red(`DOWNLOADING TX HISTORY FOR BLOCK # ${startBlock}\n`));
    }

    let txCount = nbTx;

    bcx.getBlockTx(startBlock)
      .then(txArray => module.exports.processTxHistory(txArray, 0, 0))
      .then((nbBlockTx) => {
        txCount += nbBlockTx;
        return dbServices.dbCollections.transactions.listHistory();
      })
      .then(historyTxArray => processTx.checkPendingTx(historyTxArray, maxBlock, false))
      .then(() => dbServices.dbCollections.transactions.updateTxHistoryHeight(startBlock))
      .then(() => resolve(this.dlTxHistory(startBlock + 1, maxBlock, txCount, logs)))
      .catch(e => reject(e));
  }));
};

exports.processTxHistory = (txArray, nbTx, index) => {
  return new Promise(((resolve, reject) => {
    try {
      if (index === txArray.length) {
        resolve(nbTx);
      } else {
        processTx.newPendingTx(txArray[index], false)
          .then((pillarWalletTx) => {
            if (pillarWalletTx) {
              nbTx += 1;
            }
            resolve(this.processTxHistory(txArray, nbTx, index + 1));
          });
      }
    } catch (e) {
      reject(e);
    }
  }));
};

exports.dlERC20SmartContracts = (startBlock, endBlock, nbERC20Found, logs = false) =>
  new Promise(((resolve, reject) => {
    if (startBlock > endBlock) {
      return resolve(nbERC20Found);
    }
    if (logs) {
      logger.info(colors.blue(`LOOKING FOR NEW ERC20 SMART CONTRACTS : BLOCK # ${startBlock}/${endBlock}\n`));
    }

    let erc20Count = 0;

    gethConnect.web3.eth.getBlock(startBlock, false)
      .then(result => bcx.getBlockSmartContractsAddressesArray(result.transactions, [], 0))
      .then(smartContractsAddressesArray =>
        this.processSmartContractsAddressesArray(smartContractsAddressesArray, 0, 0))
      .then((nbFound) => {
        erc20Count = nbERC20Found + nbFound;
        return dbServices.dbCollections.assets.updateERC20SmartContractsHistoryHeight(startBlock);
      })
      .then(() => {
        resolve(this.dlERC20SmartContracts(
          startBlock + 1,
          endBlock,
          erc20Count,
          logs
        ));
      })
      .catch(e => reject(e));
  }));

exports.processSmartContractsAddressesArray = (smartContractsAddressesArray, index, nbERC20Found) => {
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
                            .catch((e) => {
                              reject(e);
                            });
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
    } catch (e) {
      reject(e);
    }
  }));
};

exports.updateERC20SmartContracts = () => {
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
    } catch (e) {
      reject(e);
    }
  }));
};

exports.checkNewERC20SmartContracts = () => {
  // CHECKS FOR NEW ERC20 SMART CONTRACTS PUBLISHED @ EACH NEW BLOCK
  const subscribePromise = new Promise((resolve, reject) => {
    try {
      gethConnect.web3.eth.subscribe('newBlockHeaders', (err, res) => {
      })
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
    } catch (e) {
      reject(e);
    }
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
  .catch((e) => {
    logger.error(e);
  });
