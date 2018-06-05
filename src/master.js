#!/usr/bin/env node
/***************************************************************************************/
/*  Pub-Sub master that is used to spawn new instances of publishers and subscribers  */
/***************************************************************************************/
const logger = require('./utils/logger');
const mongoose = require('mongoose');
const fork = require('child_process').fork;

const optionDefinitions = [
    { name: 'protocol', alias: 'p', type: String},
    { name: 'minPort', type: Number},
    { name: 'maxPort', type: Number},
    { name: 'maxWallets', type: Number}
  ];
const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);

const dbServices = require('./services/dbServices');
require('dotenv').config();
const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PWD;
const serverIP = process.env.SERVER;
const dbName = process.env.DBNAME;
const mongoUrl = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}`;
//protocol has to be setup during init, we will have one master per protocol
var protocol = 'Ethereum';
var maxWalletsPerPub = 500000;

exports.pubs = [];
exports.subs = [];
exports.index = 1;

exports.init = function() {
    try {
        logger.info('Started executing master.init()');
        //validating input parameters
        if(options.protocol !== undefined) {
            protocol = options.protocol;
        }
        logger.info('master.init(): Initializing master for ' + protocol);

        if((options.minPort !== undefined) && (options.maxPort !== undefined) && (options.minPort >= 5500) && (options.minPort < options.maxPort)) {
            currentPort = options.minPort;
        } else {
            throw ({ message: 'Invalid configuration parameters minPort, maxPort'});
        }

        if(options.maxWallets !== undefined || options.maxWallets > 0) {
            logger.info('master.init(): A new publisher will be spawned for every ' + options.maxWallets + " wallets..");
            maxWalletsPerPub = options.maxWallets;
        } else {
            throw ({message: 'Invalid configuration parameter maxWallets'});
        }

        this.launch();
    } catch(err) {
        logger.error('master.init() failed: '+ err.message);
    } finally {
        logger.info('Exited master.init()');
    }
};

exports.notify = async function(idFrom,socket) {
    try {
        logger.info('Started executing master.notify()');

        //read the wallet address model and bring up multiple publishers
        var theWallets = await dbServices.recentAccounts(mongoUrl,idFrom);
        console.log('Fetched data from: ',theWallets);
        if(theWallets !== undefined) {
            var message = [];
            for(var i=0;i<theWallets.length;i++) {
                for(var j=0;j<theWallets[i].addresses.length;j++) {
                    if(theWallets[i].addresses[j].protocol == protocol) {
                        message.push({id: theWallets[i]._id, walletId: theWallets[i].addresses[j].address, pillarId: theWallets[i].pillarId});
                    }
                }
            }
            if(message.length > 0) {
                logger.info('master.notify(): Sending IPC notification to monitor ' + message.length + ' wallets.'); 
                socket.send({message});
            }
        }
    } catch(err) {
        logger.error(`master.notify() failed: ${err}`);
    } finally {
        logger.info('Exited master.notify()');
    }
};

exports.launch = function() {
    try {
        logger.info('Started executing master.launch()');

        //start the first program pair of publisher and subscribers
        exports.pubs[exports.index] = fork(`${__dirname}/publisher.js`);
        //subs[index] = fork(`${__dirname}/subscriber.js`);

        exports.pubs[exports.index].on('message',(data) => {
            logger.info('Master received message : ' + JSON.stringify(data) + ' from publisher');
            if(data.type == 'wallet.request') {
                logger.info('Received ' +  (data.message) + ' from ' + (data.id));
                exports.notify(data.message,exports.pubs[exports.index]);
            }
            if(data.type == 'queue.full') {
                logger.info('Received ' + (data.message) + ' from ' + (data.id));
                //fork new publisher-subscriber process pairs
                this.launch();
            }
        });
    } catch(err) {
        logger.error(err.mesasage);
    } finally {
        logger.info('Exited master.launch()');
    }
};
this.init();