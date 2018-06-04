#!/usr/bin/env node
/***************************************************************************************/
/*  Pub-Sub Manager that is used to spawn new instances of publishers and subscribers  */
/***************************************************************************************/
const ipc = require('node-ipc');
const logger = require('./utils/logger');
const mongoose = require('mongoose');
const fork = require('child_process').fork;
//const ethAddresses = require('./models/accounts_model').Accounts;
const dbServices = require('./services/dbServices');
require('dotenv').config();
const maxWalletsPerPub = 500000;
const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PWD;
const serverIP = process.env.SERVER;
const dbName = process.env.DBNAME;
const mongoUrl = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}`;
//protocol has to be setup during init, we will have one manager per protocol
const protocol = 'Ethereum';

exports.init = function() {
    try {
        logger.info('Started executing manager.init()');

        //read the wallet address model and bring up multiple publishers

        //start of an ipc server which will be used to notify any new publisher of new registrations
        ipc.config.id = 'manager';
        ipc.config.retry = 1500;
        ipc.config.networkPort = process.env.SERVER_PORT;
        ipc.config.networkHost = process.env.SERVER_ADDRESS;
        ipc.serveNet(
            process.env.SERVER_ADDRESS,
            process.env.SERVER_PORT,
            function() {
                ipc.server.on(
                    'wallet.request',
                    function(data,socket) {
                        ipc.log('Received wallet.request from ', (data.id));
                        logger.info('Received ' +  (data.message) + ' from ' + (data.id));
                        exports.notify(data.message,socket);
                    }
                );
        
                ipc.server.on(
                    'queue.full',
                    function(data,socket) {
                        ipc.log('Received queue.full from ', (data.id));
                        logger.info('Received ' + (data.message) + ' from ' + (data.id));
                        //launch a new publisher
                        this.launch();
                    }  
                );
            }
        );
        ipc.server.start();
        //console.log(JSON.stringify(ipc));
    } catch(err) {
        logger.error('Manager.init() failed: ', err.mesasage);
        throw err;
    } finally {
        logger.info('Exited manager.init()');
    }
};

exports.notify = async function(idFrom,socket) {
    try {
        logger.info('Started executing manager.notify()');

        //read the wallet address model and bring up multiple publishers
        var theWallets = await dbServices.recentAccounts(mongoUrl,idFrom);
        console.log('Fetched data from: ',theWallets);
        if(theWallets !== undefined) {
            var message = [];
            for(var i=0;i<theWallets.length;i++) {
                for(var j=0;j<theWallets[i].addresses.length;j++) {
                    if(theWallets[i].addresses[j].protocol == protocol) {
                        message.push({walletId: theWallets[i].addresses[j].address, pillarId: theWallets[i].pillarId});
                    }
                }
            }
            if(message.length > 0) {
                logger.info('Manager.notify: Sending IPC notification to monitor ' + message.length + ' wallets.'); 
                ipc.server.emit(
                    socket,
                    'wallet.receive',
                    message
                );
            }
        }
    } catch(err) {
        logger.error(`Manager.notify() failed: ${err}`);
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
this.init();