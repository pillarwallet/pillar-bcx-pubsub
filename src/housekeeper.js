#!/usr/bin/env node
const amqp = require('amqplib/callback_api');
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices.js');
const bcx = require('./services/bcx.js');
const gethConnect = require('./services/gethConnect.js');
const processTx = require('./services/processTx.js');
const colors = require('colors');
const notif = require('./services/notifications.js');
const accounts = require('./services/accounts.js');
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
          console.log(mongoUrl)
          dbServices.dbConnectDisplayAccounts(mongoUrl)
            .then((dbCollections) => {
	            dbServices.initDB(accounts.accountsArray, accounts.contractsArray)
              .then(() => {
                dbServices.initDBTxHistory()
                .then(() => {
	                resolve({ web3, dbCollections });
                })
              })
            });
        });
    } catch (e) { reject(e); }
  });
};

exports.initMQ = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.info('Started executing publisher.initMQ()');

      amqp.connect('amqp://localhost', (err, conn) => {
        conn.createChannel((err, ch) => {
          const q = 'bcx-pubsub';
          const msg = 'Initialized BCX housekeeper message queue!';

          ch.assertQueue(q, { durable: false });
          // Note: on Node 6 Buffer.from(msg) should be used
          ch.sendToQueue(q, Buffer.from(msg));
          console.log(' [x] Sent %s', msg);
          resolve({ ch, q });
        });
        // setTimeout(() => { conn.close(); process.exit(0); }, 500);
      });
    } catch (err) {
      logger.error('Publisher.configure() failed: ', err.message);
      reject();
    }// finally {
     // logger.info('Exited publisher.initMQ()');
    // }
  });
};


exports.checkTxPool = function (web3, dbCollections, channel, queue) {
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
          processTx.processNewPendingTxArray(web3, unknownPendingTxArray, dbCollections, abiDecoder, notif, channel, queue, 0)
            .then((nbTxFound) => {
              logger.info(colors.yellow.bold(`DONE UPDATING PENDING TX IN DATABASE\n--> ${nbTxFound} transactions found\n`));
            });
        });
    });
};

exports.updateTxHistory = function (web3, dbCollections, channel, queue) {
  // Update tx History at connection time
  bcx.getLastBlockNumber(web3)
    .then((blockNumber) => {
	  logger.info(colors.green.bold(`LAST BLOCK NUMBER = ${blockNumber}\n`));
	  dbServices.updateTxHistory(web3, bcx, processTx, dbCollections, abiDecoder, notif, channel, queue, blockNumber);
    });
};

this.initMQ()
.then((mqParams) => {
    const channel = '';//mqParams.ch;
    const queue = '';//mqParams.q;
    this.init()
      .then((result) => {
        this.checkTxPool(result.web3, result.dbCollections, channel, queue);
        this.updateTxHistory(result.web3, result.dbCollections, channel, queue);
      });
});

