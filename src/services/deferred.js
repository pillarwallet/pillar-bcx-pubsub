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
        number -= 1000
    }
    lista.push(0)
    return lista
}

function decimalToHexString(number) {
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }

    return "0x"+number.toString(16).toUpperCase();
}

function saveTransactions(transactions, acc, result){
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
}


async function saveDefferedTransactions(result, entry) {
    try{
        dbServices.dbConnect().then(async () => {
            dbServices.dbCollections.accounts.findByStatus('deferred', protocol).then((result) => {
                if(result){
                    result.addresses.forEach((acc) => {
                        if (acc.status === "deferred"){
                            ethService.getTransactionCountForWallet(acc.address).then((totalTrans) => {
                                ethService.getLastBlockNumber().then((lastBlock) => {
                                    logger.info("lastblock is" + lastBlock)
                                    logger.info("totaltransacions is" + totalTrans)
                                    var listOfTrans = generateList(lastBlock)
                                    logger.info("list of trans " + listOfTrans.length )
                                    getTransactions(listOfTrans, 0, acc, result, totalTrans, [])
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


function getTransactions(listOfTrans, i, acc, result, totalTrans, transList){
       
        var toBlock = decimalToHexString(listOfTrans[i + 1])
        var fromBlock
        if(i == 0){
            fromBlock = decimalToHexString(listOfTrans[i])
        }else{
            fromBlock = decimalToHexString(listOfTrans[i] + 1 )
        }
        logger.info(`deferred.getTransactions: started processing for wallet ${acc.address} and i ${i} fromBlock ${fromBlock} toBlock ${toBlock} length transList ${transList.length}`);
        ethService.getAllTransactionsForWallet(acc.address, toBlock, fromBlock).then((transactions) => {
            if (transactions && transactions.length >0){
              
                var totalTransactions = transactions.length
                logger.info(`found transactions ${totalTransactions} `)
                if (totalTransactions > 0){
                    transList = transList.concat(transactions)
                }
                var transListLength = transList.length
                if (transListLength >= totalTrans) {
                    logger.info(`finished, transListLength ${transListLength} totalTrans  ${totalTrans}`)
                    // saveTransactions(transList, acc, result)
                    return
                }else{
                    getTransactions(listOfTrans, i + 1, acc, result, totalTrans, transList)
                }
                logger.info(`deferred.getTransactions: started processing for wallet ${acc.address} and recovered ${totalTransactions} fromBlock ${fromBlock} toBlock ${toBlock} length transList ${transListLength} total trans ${totalTrans}`);
            }else{
                getTransactions(listOfTrans, i + 1, acc, result, totalTrans, transList)
            }

        })
    }


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