#!/usr/bin/env node
'use strict';
/** @module deferred.js */
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://ab9bcca15a4e44aa917794a0b9d4f4c3@sentry.io/1289773' });
const dbServices = require('./dbServices.js');
const ethService = require('./ethService.js');
const logger = require('../utils/logger');
const CronJob = require('cron').CronJob;
const protocol = 'Ethereum'

function saveDefferedTransactions(result, entry) {
    try{
        dbServices.dbConnect().then(async () => {
            dbServices.dbCollections.accounts.findByStatus('deferred', protocol).then((result) => {
                    if(result){
                        result.addresses.forEach((acc) => {
                            if (acc.status === "deferred"){
                                ethService.getAllTransactionsForWallet(acc.address).then((transactions) => {
                                    var totalTransactions = transactions.length;
                                    logger.info(`deferred.saveDefferedTransactions: started processing for wallet ${acc.address} and recovered ${totalTransactions}`);
                                    dbServices.dbCollections.historicTransactions.addMultipleTx(transactions).then((transactions) => {
                                        logger.debug('deferred.saveDefferedTransactions dbServices.dbCollections.historicTransactions successfully added');
                                        acc.status = "deferred_done"
                                        result.save((err) => {
                                            if (err) {
                                                logger.info(`accounts.addAddress DB controller ERROR: ${err}`);
                                                reject(err);
                                            }
                                        });
                                    })
                                })
                            }
                        })
                    }
            })
        })
    }catch (e) {
        logger.error('deferred.saveDefferedTransactions failed with error ' + e);
    }   
}

module.exports.saveDefferedTransactions = saveDefferedTransactions;



async function launch() {
    try {
        logger.info('Started executing deferred.launch()');
        logger.info('starting a cron to run saveDefferedTransactions each hour');
        const job = new CronJob('0 * * * *', () => {
            module.exports.saveDefferedTransactions();
        });
        job.start();
        module.exports.saveDefferedTransactions();
    } catch (e) {
        logger.error(`deferred.launch() failed: ${e.message}`);
    }
}

module.exports.launch = launch;

this.launch()