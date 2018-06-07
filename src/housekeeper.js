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
          dbCollections.ethTransactions.listDbZeroConfTx()
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

exports.updateERC20SmartContracts = function (web3, dbCollections) {
  // Update ERC20 Smart Contracts collection at connection time
  bcx.getLastBlockNumber(web3)
    .then((blockNumber) => {
      logger.info(colors.blue.bold(`LAST BLOCK NUMBER = ${blockNumber}\n`));
      dbServices.updateERC20SmartContracts(web3, gethSubscribe, bcx, processTx, dbCollections, blockNumber);
    });
};


this.init()
  .then((result) => {
    this.checkTxPool(result.web3, result.dbCollections); // CHECKS TX POOL FOR TRANSACTIONS AND STORES THEM IN DB
    this.updateTxHistory(result.web3, result.dbCollections); // CHECKS BLOCKCHAIN FOR TRANSACTIONS AND STORES THEM IN DB
    this.updateERC20SmartContracts(result.web3, result.dbCollections); // CHECKS BLOCKCHAIN FOR ERC20 SMART CONTRACTS AND STORES THEM IN DB
    gethSubscribe.checkNewERC20SmartContracts(result.web3, gethSubscribe, bcx, processTx, dbServices, result.dbCollections);
    // CHECKS FOR NEW ERC20 SMART CONTRACTS @ EACH NEW BLOCK, AND STORES THEM IN DB
  });

