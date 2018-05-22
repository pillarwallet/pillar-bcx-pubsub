#!/usr/bin/env node
/***************************************************************************************/
/*  Pub-Sub Manager that is used to spawn new instances of publishers and subscribers  */
/***************************************************************************************/
const ipc = require('node-ipc');
const logger = require('./utils/managerLogger');
const mongoose = require('mongoose');
const spawn = require('child_process').spawn;
const ethAddresses = require('../models/ethAddresses_model');
require('dotenv').config();
const maxWalletsPerPub = 500000;
var latestId;

exports.init = function init() {
    try {
        logger.info('Started executing manager.init()');

        //read the wallet address model and bring up multiple publishers

        //start of an ipc server which will be used to notify any new publisher of new registrations
        ipc.config.id = 'bcx-manager';
        ipc.config.retry = 1500;
        ipc.serveNet(
            process.env.SERVER_ADDRESS,
            process.env.SERVER_PORT,
            start()
        );
        ipc.server.start();
    } catch(err) {
        logger.error(err.mesasage);
    } finally {
        logger.info('Exited manager.init()');
    }
};

exports.start = function() {
    try {
        logger.info('Started executing manager.start()');

        ipc.server.on(
            'wallet.request',
            function(data,socket) {
                ipc.log('Received wallet.request from ', (data.id));
                logger.info('Received ' +  (data.message) + ' from ' + (data.id));
                notify();
            }
        );

        ipc.server.on(
            'queue.full',
            function(data,socket) {
                ipc.log('Received queue.full from ', (data.id));
                logger.info('Received ' + (data.message) + ' from ' + (data.id));
                //launch a new publisher
                launch();
            }  
        );

    }catch(err) {
        logger.error(err.mesasage);
    } finally {
        logger.info('Exited manager.start()');
    }
};

exports.notify = function() {
    try {
        logger.info('Started executing manager.notify()');

        //read the wallet address model and bring up multiple publishers
        var latest = ethAddresses.find().sort({$natural: -1}).limit(1);
        if(latest > latestId) {
            var theWallets = ethAddresses.find({_id : {$gt: latestId}});
            ipc.server.emit(
                socket,
                'wallet.receive',
                theWallets
            );
        }
    } catch(err) {
        logger.error(err.mesasage);
    } finally {
        logger.info('Exited manager.notify()');
    }
};

exports.launch = function() {
    try {
        logger.info('Started executing manager.launch()');

        //launch a new set of pub-sub with new range of wallet addresses
        //TODO
    } catch(err) {
        logger.error(err.mesasage);
    } finally {
        logger.info('Exited manager.launch()');
    }
};
