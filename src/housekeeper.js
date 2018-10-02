#!/usr/bin/env node
'use strict';
/** @module housekeeper.js */
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://ab9bcca15a4e44aa917794a0b9d4f4c3@sentry.io/1289773' });
require('dotenv').config();
const time = require('unix-timestamp');
const abiDecoder = require('abi-decoder');
const ERC20ABI = require('./services//ERC20ABI');
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices.js');
const processTx = require('./services/processTx.js');
const LOOK_BACK_BLOCKS = 50;
const ethService = require('./services/ethService.js');
const protocol = 'Ethereum';


/**
 * Method to handle IPC message received from master
 * @param {any} message - The IPC message received from the master
 */
process.on('message', (data) => {
    logger.debug('Housekeeper has received message :' + JSON.stringify(data) + ' from master');
    const message = data.message;
    if (data.type === 'accounts') {
      for (let i = 0; i < message.length; i++) {
        const obj = message[i];
        logger.debug(`Housekeeper received notification to monitor :${obj.walletId.toLowerCase()} for pillarId: ${obj.pillarId}`);
        module.exports.recoverWallet(obj.walletId.toLowerCase(), obj.pillarId, LOOK_BACK_BLOCKS);
      }
      //recover all the asset events for this wallet as well
      module.exports.recoverAssetEvents();
    } 
});

/**
 * Function that initializes the houskeeper.
 */
function init() {
    logger.info('Houskeeper.init(): Started executing the function');
    try {
        dbServices.dbConnect().then(() => {
            this.checkTxPool().then(() => {
                this.updateTxHistory();
            });
            setTimeout(() => { 
                module.exports.recoverAssetEvents(); 
                },5000
            );
        });
    } catch(e) {
        logger.error('Houskeeper.init(): Error initializing houskeeper: ' + e);
    }
    logger.info('Houskeeper.init(): Finished executing the function');
}
module.exports.init = init;

/**
 * Recover transactions corresponding to a wallet by going back blocks.
 * @param {string} recoverAddress - The address to recover transactions for.
 * @param {string} pillarId - The pillar ID corresponding to the wallet
 * @param {string} nBlocks - The number of blocks to go back to recover transactions.
 */
function recoverWallet (recoverAddress, pillarId, nbBlocks) {
    try {
        //loop 50 blocks back for the given wallet and update all transactions.
        var tmstmp;
        var data, value;
        var from;
        var to;
        var status;
        var hash;
        logger.debug('Housekeeper.recoverWallet(): Recovering transactions for the wallet: ' + recoverAddress + ' by looping back: ' + nbBlocks + ' blocks.');
        ethService.getLastBlockNumber().then((startBlock) => {
            var endBlock = startBlock - nbBlocks;
            logger.debug('Recovering transactions from startBlock: ' + startBlock + ' to endBlock: ' + endBlock);
            for(var i = startBlock; i > endBlock; i--) { 
                logger.debug('Housekeeper.recoverWallet(): Fetching transactions from block: ' + i);
                ethService.getBlockTx(i).then((transactions) => {
                    logger.debug('Housekeeper.recoverWallet: Total transactions in block ' + i + ' is ' + transactions.length);
                    transactions.forEach((txn) => {
                        logger.debug('Housekeeper.recoverWallet() fetch transaction receipt for tran: ' + txn.hash);
                        ethService.getTxReceipt(txn.hash).then((receipt) => {
                            logger.debug('Housekeeper.recoverWallet(): Validating txn hash: ' + receipt.transactionHash); 
                            tmstmp = time.now();
                            from = receipt.from;
                            to = receipt.to;
                            status = (receipt.status === '0x1' ? 'confirmed' : 'failed');
                            hash = receipt.transactionHash;
                            dbServices.assetDetails(receipt.to).then((theAsset) => {
                                if(theAsset !== null) {
                                    contractAddress = theAsset.contractAddress;
                                    asset = theAsset.symbol;
                                    abiDecoder.addABI(ERC20ABI);
                                    data = abiDecoder.decodeMethod(receipt.input);
                                    if ((data !== undefined) && (data.name === 'transfer')) { 
                                        //smart contract call hence the asset must be the token name
                                        to = data.params[0].value;
                                        value = data.params[1].value;
                                    }
                                } else {
                                    asset = 'ETH';
                                    value = receipt .value;    
                                }
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
                                        logger.debug('Housekeeper.recoverWallet(): Saving transaction into the database: ' + entry);
                                        dbServices.dbCollections.transactions.addTx(entry);
                                    }
                                    throw new Error('newTx: Transaction already exists');
                                });
                            });
                        });
                    });
                });
            }
            logger.debug('Housekeeper.recoverWallet(): finished recovering wallet: ' + recoverAddress);
        });
    } catch(e) {
        logger.debug('Housekeeper.recoverWallet(): Failed with error ' + e);
    }
}
module.exports.recoverWallet = recoverWallet;

/**
 * Check the transactions pool and update pending transactions.
 */
function checkTxPool() {
    return new Promise((resolve, reject) => {
        try {
            logger.info('Housekeeper.checkTxPool(): Checking txpool');
            dbServices.listPending(protocol).then((pendingTxArray) => {
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
            logger.error('Housekeeper.checkTxPool(): Failed with error: ' + e);
            reject(e);
        } finally {
            logger.info('Housekeeper.checkTxPool(): Finished txpool check.');
            resolve();
        }
    });
}
module.exports.checkTxPool = checkTxPool;

/**
 * Go back through the ethereum blockchain and load relevant transactions from missed blocks.
 */
function updateTxHistory() {
    try {
        logger.info('Housekeeper.updateTxHistory(): updating tx history');
        ethService.getLastBlockNumber().then((maxBlock) => {
            if(maxBlock !== undefined) {
                logger.info(`Housekeeper.updateTxHistory(): LAST BLOCK NUMBER = ${maxBlock}`);
                dbServices.findMaxBlock(protocol).then((startBlock) => {
                    logger.debug('Max block: ' + startBlock);
                    if (startBlock === undefined || startBlock > maxBlock) {
                        logger.debug('Housekeeper.updateTxHistory(): Nothing to catchup, already on the latest block');
                    } else {
                        logger.info((`Housekeeper.updateTxHistory(): UPDATING TRANSACTIONS HISTORY FROM ETHEREUM NODE... BACK TO BLOCK # ${startBlock}`));
                        //loop from startBlock to maxBlock and process any new transactions into the database
                        for(var i = startBlock; i < maxBlock; i++) {
                            ethService.getBlockTx(i).then((txArray) => {
                                txArray.forEach((item) => {
                                    logger.debug(('Housekeeper.updateTxHistory(): validating transaction : ' + item));
                                    //format and add a new transaction to the database
                                    ethService.getTxReceipt(item.hash).then((receipt) => {
                                        if(receipt !== null) {
                                            processTx.storeIfRelevant(receipt,protocol);
                                        }
                                    });
                                });
                            });
                        }
                    }
                });
            }
        });
    }catch(e) {
        logger.error('Housekeeper.updateTxHistory() failed with error: ' + e);
    } finally {
        logger.info('Housekeeper.updateTxHistory(): finished update.')
    }
}
module.exports.updateTxHistory = updateTxHistory;

/**
 * Go back through the ethereum blockchain and load relevant transactions from missed blocks.
 */
function recoverAssetEvents() {
    try {
        logger.info('Housekeeper.recoverAssetEvents() started recovering asset events since last run.');
        dbServices.listAssets(protocol).then((assets) => {
            assets.forEach((asset) => {
                logger.debug('Housekeeper.recoverAssetEvents() : recoving past events of asset ' + asset.symbol);
                dbServices.findMaxBlock(protocol,asset.symbol).then((blockNumber) => {
                    logger.debug('Housekeeper.recoverAssetEvents(): recovering since ' + blockNumber);
                    ethService.getPastEvents(asset.contractAddress,'Transfer',blockNumber);
                });
            });
        });
    }catch(e) {
        logger.error('Housekeeper.recoverAssetEvents() failed with error: ' + e);
    } finally {
        logger.info('Housekeeper.recoverAssetEvents() finished recovering all token transfers');
    }
}
module.exports.recoverAssetEvents = recoverAssetEvents;

this.init();