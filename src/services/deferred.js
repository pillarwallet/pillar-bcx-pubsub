#!/usr/bin/env node
'use strict';
/** @module deferred.js */
const diagnostics = require('../utils/diagnostics');
const dbServices = require('./dbServices.js');
const ethService = require('./ethService.js');
const logger = require('../utils/logger');
const CronJob = require('cron').CronJob;
const protocol = 'Ethereum'


function generateList(number) {
    var lista = []
    while (number > 0) {
        lista.push(number);
        number -= 10000
    }
    lista.push('earliest')
    return lista
}


async function saveDefferedTransactions(result, entry) {
    try{
        dbServices.dbConnect().then(async () => {
            dbServices.dbCollections.accounts.findByStatus('deferred', protocol).then((result) => {
                if(result){
                    result.addresses.forEach((acc) => {
                        if (acc.status === "deferred"){
                            ethService.getAllTransactionsForWallet(acc.address).then((transactions) => {
                                var listOfTrans = generateList(transactions)
                                for (var i = 0; i < listOfTrans.length -1 ; i++){
                                    console.log("Esto entro",listOfTrans[i], listOfTrans[i + 1])
                                    ethService.getAllTransactionsForWallet(acc.address, listOfTrans[i], listOfTrans[i+1]).then((transactions) => {
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