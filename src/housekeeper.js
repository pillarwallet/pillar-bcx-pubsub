#!/usr/bin/env node
'use strict';
/** @module housekeeper.js */
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://ab9bcca15a4e44aa917794a0b9d4f4c3@sentry.io/1289773' });
require('dotenv').config();
const redis = require('redis');
let client = redis.createClient();
const time = require('unix-timestamp');
const abiDecoder = require('abi-decoder');
const ERC20ABI = require('./services/ERC20ABI');
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices');
const LOOK_BACK_BLOCKS = 50;
const ethService = require('./services/ethService');
const protocol = 'Ethereum';

let entry = {};
let startBlock;

/**
 * Function that subscribes to redis related connection errors.
 */
client.on("error", function (err) {
    logger.error(`Housekeeper failed with REDIS client error: ${err}`);
});

/**
 * commonon logger function that prints out memory footprint of the process
 */
function logMemoryUsage() {
    const mem = process.memoryUsage();
    var rss = Math.round((mem.rss*10.0) / (1024*1024*10.0),2);
    var heap = Math.round((mem.heapUsed*10.0) / (1024*1024*10.0),2);
    var total = Math.round((mem.heapTotal*10.0) / (1024*1024*10.0),2);
    var external = Math.round((mem.external*10.0) / (1024*1024*10.0),2);
    logger.info('*****************************************************************************************************************************');
    logger.info(`Housekeeper - PID: ${process.pid}, RSS: ${rss} MB, HEAP: ${heap} MB, EXTERNAL: ${external} MB, TOTAL AVAILABLE: ${total} MB`);
    logger.info('*****************************************************************************************************************************');
}
module.exports.logMemoryUsage = logMemoryUsage;

/**
 * Check the transactions pool and update pending transactions.
 */
async function checkTxPool() {
    return new Promise(async (resolve,reject) => {
        try {
            logger.info('Housekeeper.checkTxPool(): Checking txpool');
            await dbServices.listPending(protocol).then((pendingTxArray) => {
                logger.debug('Housekeeper.checkTxPool(): Number of pending transactions in DB: ' + pendingTxArray.length);
                pendingTxArray.forEach((item) => {
                    logger.debug('Housekeeper.checkTxPool for pending txn: ' + item.txHash);
                    //recheck the status of the transaction
                    ethService.getTxReceipt(item.txHash).then((receipt) => {
                        if(receipt !== null) {
                            logger.debug('Housekeeper.checkTxPool(): checking status of txn : ' + receipt.transactionHash);
                            //update the status of the transaction
                            let status;
                            if(receipt.status === '0x1') { 
                                status = 'confirmed';
                            } else {
                                status = 'failed';
                            }
                            const gasUsed = receipt.gasUsed;
                            const entry = {
                                txHash: item.txHash,
                                status,
                                gasUsed,
                                blockNumber: receipt.blockNumber
                            };
                            dbServices.dbCollections.transactions.updateTx(entry).then(() => {
                                logger.info(`Housekeeper.checkTxPool(): Transaction updated: ${entry.txHash}`);
                            });
                        }
                    });
                });
            });
            resolve();
        } catch(e) {
            logger.error(`Housekeeper.checkTxPool(): Failed with error: ${e}`);
            reject(e);
        }
    });
}
module.exports.checkTxPool = checkTxPool;

/**
 * Recover transactions corresponding to a wallet by going back blocks.
 * @param {string} walletId - Wallet ID for which transactions has to be recovered.
 * @param {string} pillarId - Pillar ID for which transactions has to be recovered.
 * @param {string} nBlocks - The number of blocks to go back to recover transactions.
 */
async function recoverWallet(walletId, pillarId, nbBlocks) {
    return new Promise(async (resolve,reject) => {
        try {
            //loop 50 blocks back for the given wallet and update all transactions.
            var tmstmp = time.now();;
            var data, value;
            var from;
            var to;
            var status;
            var hash;
            var pillarId = '';
            logger.info(`Housekeeper.recoverWallet() - Attempting to recover transactions for ${walletId} over the past ${nbBlocks} blocks`);
            var endBlock = startBlock - nbBlocks;
            logger.debug(`Recovering transactions from startBlock: ${startBlock} to endBlock: ${endBlock}`);
            for(var i = startBlock; i > endBlock; i--) { 
                logger.debug(`Housekeeper.recoverWallet(): Fetching transactions from block: ${i}`);
                ethService.getBlockTx(i).then((transactions) => {
                    logger.debug(`Housekeeper.recoverWallet: Total transactions in block ${i} is ${transactions.length}`);
                    transactions.forEach((txn) => {
                        logger.debug(`Housekeeper.recoverWallet() fetch transaction receipt for tran: ${txn.hash}`);
                        ethService.getTxReceipt(txn.hash).then((receipt) => {
                            logger.debug(`Housekeeper.recoverWallet(): Validating txn hash: ${receipt.transactionHash}`); 
                            if(receipt.from === walletId || receipt.to === walletId) {
                                from = receipt.from;
                                to = receipt.to;
                                status = (receipt.status === '0x1' ? 'confirmed' : 'failed');
                                hash = receipt.transactionHash;
                                
                                dbServices.assetDetails(receipt.to).then((theAsset) => {
                                    if(theAsset !== null && theAsset !== undefined) {
                                        contractAddress = theAsset.contractAddress;
                                        asset = theAsset.symbol;
                                        abiDecoder.addABI(ERC20ABI);
                                        data = abiDecoder.decodeMethod(receipt.input);
                                        if ((data !== undefined) && (data.name === 'transfer')) { 
                                            //smart contract call hence the asset must be the token name
                                            to = data.params[0].value;
                                            value = data.params[1].value;
                                            if(to !== walletId) {
                                                //not relevant transaction
                                                return;
                                            }
                                        }
                                    } else {
                                        asset = 'ETH';
                                        value = receipt.value; 
                                    }

                                    if(pillarId !== '') {
                                        dbServices.dbCollections.transactions.findOneByTxHash(hash).then((tran) => {
                                            if (tran === null) {
                                                let entry = {
                                                    pillarId,
                                                    protocol,
                                                    toAddress: to,
                                                    fromAddress: from,
                                                    txHash: hash,
                                                    asset,
                                                    contractAddress: null,
                                                    timestamp: tmstmp,
                                                    value,
                                                    gasPrice: receipt.gasPrice,
                                                    blockNumber: receipt.blockNumber,
                                                    status
                                                };
                                                logger.debug(`Housekeeper.recoverWallet(): Saving transaction into the database: ${entry}`);
                                                dbServices.dbCollections.transactions.addTx(entry);
                                            } else {
                                                throw new Error('newTx: Transaction already exists');
                                            }
                                        });           
                                    } 
                                });
                            }
                        });
                    });
                });
            }
            logger.debug(`Housekeeper.recoverWallet(): finished recovering for wallets: ${walletId}`);    
            resolve();
        }catch(e) {
            logger.error(`Housekeeper.recoverWallet(): Failed with error ${e}`); 
            reject(e);
        }
    });
}
module.exports.recoverWallet = recoverWallet;

/**
 * Go back through the ethereum blockchain and load relevant transactions from missed blocks.
 * @param {string} walletId - the wallet address of the account whose transactions have to be recovered
 * @param {string} pillarId - the pillar id of the wallet being recovered.
 */
async function recoverAssetEvents(wallet,pillarId) {
    return new Promise(async (resolve,reject) => {
        try {
            await dbServices.listAssets(protocol).then((assets) => {
                assets.forEach(async (asset) => {
                    logger.info(`Housekeeper.recoverAssetEvents() for wallet - ${wallet}: past events of asset ${asset.symbol} since block: ${entry.blockNumber}`);
                    ethService.getPastEvents(asset.contractAddress,'Transfer',entry.blockNumber,wallet,pillarId);
                });
            });
            resolve();
        }catch(e) {
            logger.error(`Housekeeper.recoverAssetEvents() failed for address: ${wallet} with error:clear ${e}`);
            reject(e);
        }
    });
}
module.exports.recoverAssetEvents = recoverAssetEvents;

/**
 * Function to process the newly registered wallets
 * @param {string} lastId - Last processed wallet Id
 */
function processData(lastId) {
    try {
        dbServices.dbConnect().then(async () => {
            //Update pending transactions in the db
            await this.checkTxPool();
            //fetch new registrations since last run
            logger.info(`Housekeeper fetching new registrations after ID: ${lastId}`);
            dbServices.recentAccounts(lastId).then(async (accounts) => {
                logger.info(`Housekeeper found accounts: ${accounts.length} wallets to process.`);
                if(accounts === null || accounts.length === 0) {
                    entry.status = 'completed';
                    entry.endTime = time.now();
                    client.set('housekeeper',JSON.stringify(entry), redis.print);
                    logger.info(`Housekeeper.processData() - Completed processing ${accounts.length} records.`)
                    this.logMemoryUsage();
                    process.exit();

                } else {
                    var promises = [];
                    await accounts.forEach(async (account) => {
                        await account.addresses.forEach(async (acc) => {
                            if(acc.protocol === protocol) {
                                promises.push(this.recoverWallet(acc.address,account.pillarId,LOOK_BACK_BLOCKS));
                                promises.push(this.recoverAssetEvents(acc.address,account.pillarId));
                                logger.info(`Finished recovering transactions for wallet: ${acc.address}`);
                                entry.lastId = accounts._id;
                            }
                        });
                    });
                    Promise.all(promises).then(() => {
                        entry.status = 'completed';
                        entry.lastId = accounts._id;
                        entry.endTime = time.now();
                        client.set('housekeeper',JSON.stringify(entry), redis.print);
                        logger.info(`Housekeeper.processData() - Completed processing ${accounts.length} records.`)
                        this.logMemoryUsage();
                        process.exit();
                    });
                }
            });
        });
    } catch(e) {
        logger.error(`Housekeeper.processData(${lastId}): Failed with error ${e}`);
    }
}
module.exports.processData = processData;

/**
 * Function that reads from the REDIS server to determine the configuration parameters.
 */
async function init() {
    logger.info(`Housekeeper(PID: ${process.pid}) started processing.`);
    this.logMemoryUsage();
    try {
        startBlock = await ethService.getLastBlockNumber();
        entry.blockNumber = startBlock - LOOK_BACK_BLOCKS;
        logger.info(`Latest blocknumber: ${startBlock}`);
        //read REDIS server to fetch config parameters for the current run.
        await client.get('housekeeper',async (err,config) => {
            logger.info(`Housekeeper: Configuration fetched from REDIS = ${config}`);
            if(config === null || config === false) {
                //the very first run of housekeeper so add the entry to redis server
                entry.pid = process.pid;
                entry.lastId = '';
                entry.startTime = time.now();
                entry.endTime =  0;
                client.set('housekeeper',JSON.stringify(entry),redis.print);
                this.processData('');
            } else {
                config = JSON.parse(config);
                //check the config parameters to check the status of last run
                logger.info(`Housekeeper previous runs status: ${config.status}`);
                if(config.status !== 'completed') {
                    logger.error('HOUSKEEPER FAILED!! PREVIOUS PROCESS IS STILL RUNNING!!');
                    entry = config;
                    process.exit(0);
                } else {
                    //the previous run was successful so start process 
                    logger.info(`Housekeeper processing records since last record: ${config.lastId}`);
                    entry.lastId = config.lastId;
                    entry.pid = process.pid;
                    entry.startTime =  time.now();
                    entry.status = 'pending';
                    client.set('housekeeper',JSON.stringify(entry), redis.print);
                    this.processData(config.lastId);
                }
            }
        });
    } catch(e) {
        logger.error(`Housekeeper failed with error: ${e}`);
        entry.status = 'failed';
        entry.endTime = time.now();
        client.set('housekeeper',JSON.stringify(entry), redis.print);
        throw e;
    }
}
module.exports.init = init;

this.init();