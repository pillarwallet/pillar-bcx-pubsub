#!/usr/bin/env node
const amqp = require('amqplib/callback_api');
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices.js');
const bcx = require('./services/bcx.js');
const gethConnect = require('./services/gethConnect.js');
const processTx = require('./services/processTx.js');
const colors = require('colors');
const accounts = require('./services/accounts.js');
const gethSubscribe = require('./services/gethSubscribe');
const abiDecoder = require('abi-decoder');
require('dotenv').config();

const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PWD;
const serverIP = process.env.SERVER;
const dbName = process.env.DBNAME;
const mongoUrl = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}`;


exports.init = function () {
  return new Promise((resolve, reject) => {
    try {
      gethConnect.gethConnectDisplay()
        .then((web3) => {
          /* CONNECT TO DATABASE */
          console.log(mongoUrl);
          dbServices.dbConnectDisplayAccounts(mongoUrl)
            .then((dbCollections) => {
              dbServices.initDB(accounts.accountsArray, accounts.contractsArray)
                .then(() => {
                  dbServices.initDBTxHistory()
                    .then(() => {
                      dbServices.initDBERC20SmartContracts()
                        .then(() => {
                          resolve({ web3, dbCollections });
                        }).catch((e) => { reject(e); });
                    }).catch((e) => { reject(e); });
                }).catch((e) => { reject(e); });
            }).catch((e) => { reject(e); });
        }).catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  });
};

exports.checkTxPool = function (web3, dbCollections) {
  // At connection time: Check for pending Tx in TX pool which are not in DB
  // and would not be added in TX History by dbServices.updateTxHistory
  return new Promise((resole, reject) => {
    try {
      logger.info(colors.yellow.bold('UPDATING PENDING TX IN DATABASE...\n'));
      bcx.getPendingTxArray(web3)
        .then((pendingTxArray) => {
          // CHECK IF TX ALREADY IN DB
          const unknownPendingTxArray = [];
          dbCollections.transactions.listDbZeroConfTx()
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
		            processTx.processNewPendingTxArray(web3, unknownPendingTxArray, dbCollections, abiDecoder, null, null, null, 0, false)
                .then((nbTxFound) => {
                  logger.info(colors.yellow.bold(`DONE UPDATING PENDING TX IN DATABASE\n--> ${nbTxFound} transactions found\n`));
                }).catch((e) => { reject(e); });
            }).catch((e) => { reject(e); });
        }).catch((e) => { reject(e); });
    } catch (err) { reject(err); }
  });
};


exports.updateTxHistory = function (web3, dbCollections) {
  // Update tx History at connection time
  bcx.getLastBlockNumber(web3)
    .then((blockNumber) => {
      logger.info(colors.red.bold(`LAST BLOCK NUMBER = ${blockNumber}\n`));
      dbServices.updateTxHistory(web3, bcx, processTx, dbCollections, abiDecoder, blockNumber);
    });
};

exports.dlERC20SmartContracts = function (web3, startBlock, endBlock, dbCollections, nbERC20Found, logs = false) {
  return new Promise(((resolve, reject) => {
    try {
      if (startBlock > endBlock) {
        resolve(nbERC20Found);
      } else {
        if (logs) {
          // logger.info(colors.blue(`LOOKING FOR NEW ERC20 SMART CONTRACTS : BLOCK # ${startBlock}/${endBlock}\n`));
        }
        web3.eth.getBlock(startBlock, false)
          .then((result) => {
            bcx.getBlockSmartContractsAddressesArray(web3, result.transactions, [], 0)
              .then((smartContractsAddressesArray) => {
                this.processSmartContractsAddressesArray(web3, dbCollections, smartContractsAddressesArray, 0, 0)
                  .then((nbFound) => {
                    nbERC20Found += nbFound;
                    dbCollections.assets.updateERC20SmartContractsHistoryHeight(startBlock)
                      .then(() => {
                        resolve(this.dlERC20SmartContracts(
                          web3, startBlock + 1,
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
};

exports.processSmartContractsAddressesArray = function (
  web3, dbCollections,
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
                          ERC20SmartContract = {
                            protocol: 'Ethereum',
                            name,
                            symbol,
                            decimals,
                            contractAddress: smartContractsAddressesArray[index],
                          };
                          dbCollections.assets.addContract(ERC20SmartContract)
                            .then(() => {
                              // gethSubscribe.subscribeERC20SmartContract(web3, bcx, dbCollections, processTx, channel, queue, rmqServices, ERC20SmartContract);
                              // HERE SEND IPC NOTIFICATION TO PUB-MASTER FOR ERC20 ~SMA~RT CONTRACT SUBSCRIPTION
                              logger.info(`Notifying master about a new smart contract: ${JSON.stringify(ERC20SmartContract)}`);
                              process.send({
                                type: 'accounts',
                                message: ERC20SmartContract,
                              });

                              resolve(this.processSmartContractsAddressesArray(web3, dbCollections, smartContractsAddressesArray, index + 1, nbERC20Found));
                            })
                            .catch((e) => { reject(e); });
                        } else {
                          logger.info(colors.magenta('-->discarded (invalid name, symbol or decimals)\n'));
                          resolve(this.processSmartContractsAddressesArray(web3, dbCollections, smartContractsAddressesArray, index + 1, nbERC20Found));
                        }
                      } else {
                        resolve(this.processSmartContractsAddressesArray(web3, dbCollections, smartContractsAddressesArray, index + 1, nbERC20Found));
                      }
                    })
                    .catch(() => {
                      resolve(this.processSmartContractsAddressesArray(web3, dbCollections, smartContractsAddressesArray, index + 1, nbERC20Found));
                    });
                })
                .catch(() => {
                  resolve(this.processSmartContractsAddressesArray(web3, dbCollections, smartContractsAddressesArray, index + 1, nbERC20Found));
                });
            })
            .catch(() => {
              resolve(this.processSmartContractsAddressesArray(web3, dbCollections, smartContractsAddressesArray, index + 1, nbERC20Found));
            });
        } catch (e) {
          resolve(this.processSmartContractsAddressesArray(web3, dbCollections, smartContractsAddressesArray, index + 1, nbERC20Found));
        }
      }
    } catch (e) { reject(e); }
  }));
};

exports.updateERC20SmartContracts = function (web3, dbCollections) {
  return new Promise(((resolve, reject) => {
    try {
      bcx.getLastBlockNumber(web3)
        .then((maxBlock) => {
          logger.info(colors.blue.bold(`LAST BLOCK NUMBER = ${maxBlock}\n`));
          dbCollections.assets.findERC20SmartContractsHistoryHeight()
            .then((startBlock) => {
              logger.info(colors.blue.bold(`UPDATING ERC20 SMART CONTRACTS DB FROM ETHEREUM NODE... BACK TO BLOCK # ${startBlock}\n`));
              this.dlERC20SmartContracts(web3, startBlock, maxBlock, dbCollections, 0, true)
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

exports.checkNewERC20SmartContracts = function (web3, dbCollections) {
  // CHECKS FOR NEW ERC20 SMART CONTRACTS PUBLISHED @ EACH NEW BLOCK
  const subscribePromise = new Promise((resolve, reject) => {
    // let nbBlocksReceived = -1;
    web3.eth.subscribe('newBlockHeaders', (err, res) => {})
      .on('data', (blockHeader) => {
        if (blockHeader != null) {
          //  nbBlocksReceived++;
          logger.info(colors.gray(`NEW BLOCK MINED : # ${blockHeader.number} Hash = ${blockHeader.hash}\n`));
          // NOW, @ EACH NEW BLOCK MINED:
          // Check for newly created ERC20 smart contracts
          dbServices.dlERC20SmartContracts(web3, gethSubscribe, bcx, processTx, blockHeader.number, blockHeader.number, dbCollections, false)
            .then(() => {
              // Update
              dbCollections.assets.updateERC20SmartContractsHistoryHeight(blockHeader.number)
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
  });
  return (subscribePromise);
};

this.init()
  .then((result) => {
    this.checkTxPool(result.web3, result.dbCollections); // CHECKS TX POOL FOR TRANSACTIONS AND STORES THEM IN DB
    this.updateTxHistory(result.web3, result.dbCollections); // CHECKS BLOCKCHAIN FOR TRANSACTIONS AND STORES THEM IN DB
    this.updateERC20SmartContracts(result.web3, result.dbCollections); // CHECKS BLOCKCHAIN FOR ERC20 SMART CONTRACTS AND STORES THEM IN DB
    this.checkNewERC20SmartContracts(result.web3, result.dbCollections);
    // CHECKS FOR NEW ERC20 SMART CONTRACTS @ EACH NEW BLOCK, AND STORES THEM IN DB
  });

