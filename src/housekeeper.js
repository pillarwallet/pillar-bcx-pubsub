#!/usr/bin/env node
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices.js');
const bcx = require('./services/bcx.js');
const gethConnect = require('./services/gethConnect.js');
const processTx = require('./services/processTx.js');
const colors = require('colors');
const notif = require('./services/notifications.js');
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
          dbServices.dbConnectDisplayAccounts(mongoUrl)
            .then((dbCollections) => {
              resolve({ web3, dbCollections });
            });
        });
    } catch (e) { reject(e); }
  });
};

exports.checkTxPool = function (web3, dbCollections) {
  // At connection time: Check for pending Tx in TX pool which are not in DB and would not be added in TX History by dbServices.updateTxHistory
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
          processTx.processNewPendingTxArray(web3, unknownPendingTxArray, dbCollections, abiDecoder, notif, channel, 0)
            .then((nbTxFound) => {
              logger.info(colors.yellow.bold(`DONE UPDATING PENDING TX IN DATABASE\n--> ${nbTxFound} transactions found\n`));
            });
        });
    });
};

exports.updateTxHistory = function (web3, dbCollections) {
  // Update tx History at connection time
  const blockNumber = bcx.getLastBlockNumber(web3);
  dbServices.updateTxHistory(web3, bcx, processTx, dbCollections, abiDecoder, notif, blockNumber + 1);
};

this.init()
  .then((result) => {
    this.checkTxPool(result.web3, result.dbCollections);
    this.updateTxHistory(result.web3, result.dbCollections);
  });
