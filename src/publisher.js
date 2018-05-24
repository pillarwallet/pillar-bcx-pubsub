#!/usr/bin/env node
/***************************************************************************************/
/*  Publisher                                                                          */
/***************************************************************************************/
const amqp = require('amqplib/callback_api');
const ipc = require('node-ipc');
const logger = require('./utils/logger');
const mongoose = require('mongoose');
const ethAddresses = require('../src/models/accounts_model').Accounts;
var manager;
require('dotenv').config();


exports.init = function() {
  try {
    logger.info('Started executing publisher.init()');
    
    ipc.config.id = 'publisher'+process.pid;
    ipc.config.retry = 1500;
    ipc.config.maxRetries = 10;

    ipc.connectToNet(
      'manager',
      process.env.SERVER_ADDRESS,
      process.env.SERVER_PORT,
      function() {
        ipc.of.manager.on(
          'connect',
          function() {
            ipc.log('## connected to manager ##', ipc.config.delay);
            exports.poll();
          }
        );
    
        ipc.of.manager.on(
          'disconnect',
          function() {
            ipc.log('disconnected from manager');
            //clean up task
          }
        );
    
        ipc.of.manager.on(
          'wallet.receive',
          function(data) {
            logger.info('Received ',data);
          }
        );

        exports.manager = ipc.of.manager;
      }
    );
    setTimeout(function() {
      exports.poll()
    },500);
  } catch(err) {
    logger.error('Publisher.init() failed: ',err.message);
    throw err;
  } finally {
    logger.info('Exited publisher.init()');
  }
};

exports.poll = function() {
    logger.info('Requesting new wallet ');
    exports.manager.emit(
      'wallet.request',
      {
        id : ipc.config.id,
        message : 'wallet.request'
      }
    );
};

exports.configure = function() {
  try {
    logger.info('Started executing publisher.configure()');
    

    //CODE FOR GETH SUBSCRIPTION
    var dbControllers;
    var dbModels;
    
    amqp.connect('amqp://localhost', function(err, conn) {
      conn.createChannel(function(err, ch) {
        var q = 'hello';
        var msg = 'Hello!';
    
        ch.assertQueue(q, {durable: false});
        // Note: on Node 6 Buffer.from(msg) should be used
        ch.sendToQueue(q, new Buffer(msg));
        console.log(" [x] Sent %s", msg);
      });
      setTimeout(function() { conn.close(); process.exit(0) }, 500);
    });

  } catch(err) {
    logger.error('Publisher.configure() failed: ',err.message);
  } finally {
    logger.info('Exited publisher.configure()');
  }
};

exports.walletReceived = function() {

};

this.init();