#!/usr/bin/env node
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices.js');
const processTx = require('./services/processTx.js');
const accounts = require('./services/accounts.js');
const ERC20ABI = require('./services/ERC20ABI');
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
            processTx.processNewPendingTxArray(pendingTxArray,0,false).then((nbTxFound) => {
                logger.info(`DONE UPDATING PENDING TX IN DATABASE--> ${nbTxFound} transactions found`);
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
                            txArray.forEach((theTx) => {
                                logger.debug(('Housekeeper.updateTxHistory(): validating transaction : ' + theTx));
                                processTx.newPendingTran(theTx,protocol);
                                dbServices.dbCollections.transactions.listHistory().then((historyTxArray) => {
                                    //loop through each pending transaction in the database and update latest status
                                    historyTxArray.forEach((histTx) => {
                                        logger.debug('Housekeeper.updateTxHistory(): Fetching tx receipt for : ' + histTx);
                                        ethService.getTxReceipt(histTx).then((receipt) => {
                                            if(receipt !== null) {
                                                let status;
                                                if(receipt.status == '0x1') { 
                                                    status = 'confirmed';
                                                } else {
                                                    status = 'failed';
                                                }
                                                logger.debug('Housekeeper.updateTxHistory(): Transaction ' + receipt.transactionHash + ' completed with status: ' + status);
                                                dbServices.dbCollections.transactions.updateTx({
                                                    txHash: receipt.transactionHash,
                                                    blockNumber: receipt.blockNumber,
                                                    status,
                                                    gasUsed: receipt.gasUsed,
                                                });
                                                hashMaps.pendingTx.delete(txHash);
                                            } else {
                                                logger.debug('Housekeeper.updateTxHistory(): Transaction ' + histTx + ' is still pending.');
                                            }
                                        });
                                    });
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

function init() {
    logger.info('Houskeeper.init(): Started executing the function');
    try {
        this.checkTxPool();
        this.updateTxHistory();
    } catch(e) {
        logger.error('Houskeeper.init(): Error initializing houskeeper: ' + e);
    }
    logger.info('Houskeeper.init(): Finished executing the function');
}
module.exports.init = init;

this.init();