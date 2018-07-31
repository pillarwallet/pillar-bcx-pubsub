#!/usr/bin/env node
require('dotenv').config();
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices.js');
const processTx = require('./services/processTx.js');
const LOOK_BACK_BLOCKS = 15;
const ethService = require('./services/ethService.js');
const protocol = 'Ethereum';

process.on('message', (data) => {
    logger.debug('Housekeeper has received message :' + JSON.stringify(data) + ' from master');
    const message = data.message;
    if (data.type === 'accounts') {
      for (let i = 0; i < message.length; i++) {
        const obj = message[i];
        logger.debug(`Housekeeper received notification to monitor :${obj.walletId.toLowerCase()} for pillarId: ${obj.pillarId}`);
        module.exports.recoverWallet(obj.walletId.toLowerCase(), LOOK_BACK_BLOCKS);
      }
    }
});

function init() {
    logger.info('Houskeeper.init(): Started executing the function');
    try {
        dbServices.dbConnect().then(() => {
            this.checkTxPool();
            this.updateTxHistory();
        });
    } catch(e) {
        logger.error('Houskeeper.init(): Error initializing houskeeper: ' + e);
    }
    logger.info('Houskeeper.init(): Finished executing the function');
}
module.exports.init = init;

function recoverWallet (recoverAddress, nbBlocks) {
    try {
        //loop 15 blocks back for the given wallet and update all transactions.
        logger.debug('Housekeeper.recoverWallet(): Recovering transactions for the wallet: ' + recoverAddress + ' by looping back: ' + nbBlocks + ' blocks.');
        ethService.getLastBlockNumber().then((startBlock) => {
            var endBlock = startBlock - nbBlocks;
            logger.debug('Recovering transactions from startBlock: ' + startBlock + ' to endBlock: ' + endBlock);
            for(var i = startBlock; i > endBlock; i--) { 
                logger.debug('Housekeeper.recoverWallet(): Fetching transactions from block: ' + i);
                ethService.getBlockTransactionCount(i).then((txnCnt) => {
                    logger.debug('Housekeeper.recoverWallet: Total transactions in block ' + i + ' is ' + txnCnt);
                    for(var j=0;i<txnCnt;j++) {
                        ethService.getTransactionFromBlock(i,j).then((txn) => {
                            ethService.getTxReceipt(txn.hash).then((receipt) => {
                                logger.debug('Housekeeper.recoverWallet(): Validating txn hash: ' + receipt.transactionHash);
                                processTx.storeIfRelevant(receipt,protocol);
                            });
                        });
                    }
                });
            }
            logger.debug('Housekeeper.recoverWallet(): finished recovering wallet: ' + recoverAddress);
        });
    } catch(e) {
        logger.debug('Housekeeper.recoverWallet(): Failed with error ' + e);
    }
}
module.exports.recoverWallet = recoverWallet;

function checkTxPool() {
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
                        if(receipt.status == '0x1') { 
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
                            logger.info(`Housekeeper.checkTxPool(): Transaction updated: ${txHash}`);
                        });
                    }
                });
            });
        });
    } catch(e) {
        logger.error('Housekeeper.checkTxPool(): Failed with error: ' + e);
    } finally {
        logger.info('Housekeeper.checkTxPool(): Finished txpool check.')
    }
}
module.exports.checkTxPool = checkTxPool;

function updateTxHistory() {
    try {
        logger.info('Housekeeper.updateTxHistory(): updating tx history');
        ethService.getLastBlockNumber().then((maxBlock) => {
            logger.info(`Housekeeper.updateTxHistory(): LAST BLOCK NUMBER = ${maxBlock}`);
            dbServices.findMaxBlock(protocol).then((startBlock) => {
                logger.debug('Max block: ' + startBlock);
                if (startBlock > maxBlock) {
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
        });
    }catch(e) {
        logger.error('Housekeeper.updateTxHistory() failed with error: ' + e);
    } finally {
        logger.info('Housekeeper.updateTxHistory(): finished update.')
    }
}
module.exports.updateTxHistory = updateTxHistory;

//write code for fetching new smart contracts deployed
function scanForContracts() {
    //subscribe to new blocks and check for contracts
}
module.exports.scanForContracts = scanForContracts;

this.init();