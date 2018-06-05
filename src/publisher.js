#!/usr/bin/env node 
/** ************************************************************************************ */
/*  Publisher                                                                          */
/** ************************************************************************************ */
const amqp = require('amqplib/callback_api');
const ipc = require('node-ipc');
const logger = require('./utils/logger');
const mongoose = require('mongoose');
const ethAddresses = require('./models/accounts_model').Accounts;
const gethConnect = require('./services/gethConnect.js');
const dbServices = require('./services/dbServices.js');
const bcx = require('./services/bcx.js');
const gethSubscribe = require('./services/gethSubscribe.js');
const notif = require('./services/notifications.js');
const processTx = require('./services/processTx.js');
const abiDecoder = require('abi-decoder');
require('dotenv').config();

const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PWD;
const serverIP = process.env.SERVER;
const dbName = process.env.DBNAME;
const mongoUrl = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}`;

var HashMap = require('hashmap');
var wallets;
//starting point
var latestId = '5b0eabed715078cbab42df87';

process.on('message',(data) => {
  console.log('Publisher received message: ' + JSON.stringify(data));
  var message = data.message;
  for(var i=0;i<message.length;i++) {
    var obj = message[i];
    logger.info('Publisher received notification to monitor :' + obj.walletId + ' for pillarId: ' + obj.pillarId);
    wallets.set(obj.walletId,obj.pillarId);
    latestId = obj.id;
  }
});

exports.initIPC = function () {
  try {
    logger.info('Started executing publisher.initIPC()');

    wallets = new HashMap();

    setInterval(function() {
      exports.poll()
    },5000);
  } catch(err) {
    logger.error('Publisher.init() failed: ',err.message);
    throw err;
  } finally {
    logger.info('Exited publisher.initIPC()');
  }
};

exports.poll = function() {
  logger.info('Requesting new wallet :');

  process.send({
    type: 'wallet.request',
    message : latestId
  });
};

exports.initBCXMQ = function () {
  try {
    logger.info('Started executing publisher.initMQ()');
    amqp.connect('amqp://localhost', (err, conn) => {
      conn.createChannel((err, ch) => {
        const q = 'bcx-pubsub';
        const msg = 'Initialized BCX pubsub message queue!';

        ch.assertQueue(q, { durable: false });
        // Note: on Node 6 Buffer.from(msg) should be used
        ch.sendToQueue(q, Buffer.from(msg));
        console.log(' [x] Sent %s', msg);
      });
    });
  } catch (err) {
    logger.error('Publisher.configure() failed: ', err.message);
  } finally {
    logger.info('Exited publisher.initMQ()');
  }
};

exports.initCWBMQ = function () {
  try {
    logger.info('Started executing publisher.initMQ()');
    amqp.connect('amqp://localhost', (err, conn) => {
      conn.createChannel((err, ch) => {
        const q = 'bcx-notifications';
        const msg = 'Initialized CORE WALLET BACKEND message queue for BCX notifications!';

        ch.assertQueue(q, { durable: false });
        // Note: on Node 6 Buffer.from(msg) should be used
        ch.sendToQueue(q, Buffer.from(msg));
        console.log(' [x] Sent %s', msg);
      });
      // setTimeout(() => { conn.close(); process.exit(0); }, 500);
    });
  } catch (err) {
    logger.error('Publisher.configure() failed: ', err.message);
  } finally {
    logger.info('Exited publisher.initMQ()');
  }
};

exports.initSubscriptions = function (channel, queue) {
  /* CONNECT TO GETH NODE */
  gethConnect.gethConnectDisplay()
    .then((web3) => {
      /* CONNECT TO DATABASE --> NEED TO REPLACE THIS WITH HASHTABLE */
      dbServices.dbConnectDisplayAccounts(mongoUrl)
        .then((dbCollections) => {
          /* SUBSCRIBE TO GETH NODE EVENTS */
          gethSubscribe.subscribePendingTx(web3, bcx, processTx, dbCollections, abiDecoder, channel, queue);
          gethSubscribe.subscribeBlockHeaders(
            web3, gethSubscribe, bcx, processTx, dbServices,
            dbCollections, abiDecoder, channel, queue,
          );
          gethSubscribe.subscribeAllDBERC20SmartContracts(web3, bcx, processTx, dbCollections, channel, queue);
        });
    });
};

exports.walletReceived = function () {

};

this.initIPC();
//this.initMQ();
//this.initSubscriptions();
