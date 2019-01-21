#!/usr/bin/env node
'use strict';
/** @module deferred.js */
const diagnostics = require('../utils/diagnostics');
const dbServices = require('./dbServices.js');
const ethService = require('./ethService.js');
const logger = require('../utils/logger');
const CronJob = require('cron').CronJob;

function saveDefferedTransactions(result, entry) {
    try{
        dbServices.dbCollections.accounts.findByStatus('deferred').then((result) => {
                if(result){
                    result.addresses.forEach((acc) => {
                        if (acc.status === "deferred"){
                            ethService.getAllTransactionsForWallet(result).then((transactions) => {
                                var totalTransactions = transactions.length;
                                logger.info(`deferred.saveDefferedTransactions: started processing for wallet ${acc.address} and recovered ${totalTransactions}`);
                                dbServices.dbCollections.historicTransactions.addMultipleTx(transactions);
                                logger.debug('deferred.saveDefferedTransactions dbServices.dbCollections.historicTransactions successfully added');
                                acc.status = "deferred_done"
                                result.save((err) => {
                                    if (err) {
                                        logger.info(`accounts.addAddress DB controller ERROR: ${err}`);
                                        reject(err);
                                    }
                                    resolve();
                                });
                            })
                        }
                    })
                }
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
        const job = new CronJob('0/1 0 0/1 ? * * *', () => {
            module.exports.saveDefferedTransactions();
        });
        job.start();
    } catch (e) {
        logger.error(`deferred.launch() failed: ${e.message}`);
    }
}

module.exports.launch = launch;

this.launch()