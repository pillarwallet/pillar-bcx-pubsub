const logger = require('../utils/logger.js');
const Web3 = require('web3');
require('dotenv').config();
const ERC20ABI = require('./ERC20ABI.json');
const processTx = require('./processTx.js');
const dbServices = require('./dbServices.js');
const rmqServices = require('./rmqServices.js');
const hashMaps = require('../utils/hashMaps.js');
const protocol = 'Ethereum';
const gethURL = process.env.GETH_NODE_URL + ':' + process.env.GETH_NODE_PORT;
let web3;

function connect() {
    logger.info('ethService.connect(): Connecting to web3.');
    return new Promise(((resolve, reject) => {
        try {
            if(web3 === undefined || (!web3.eth.isSyncing())) {
                web3 = new Web3(new Web3.providers.WebsocketProvider(gethURL));
                web3._provider.on('end', (eventObj) => {
                    logger.error('Websocket disconnected!! Restarting connection....');
                    web3 = new Web3(new Web3.providers.WebsocketProvider(gethURL));
                });
                logger.info('ethService.connect(): Connection to ' + gethURL + ' established successfully!');
                module.exports.web3 = web3;
                resolve(true);
            } else {
                logger.info('ethService.connect(): Re-using existing connection to geth: ' + gethURL);
                resolve(true);
            }
        } catch(e) { 
            logger.error('ethService.connect() failed with error: ' + e);
            reject(false); 
        }
    }));
}
module.exports.connect = connect;

function getWeb3() {
    logger.info('ethService.getWeb3(): fetches the current instance of web3 object'); 
    return new Promise(((resolve, reject) => {
        if(module.exports.connect()) {
            resolve(web3);
        } else {
            reject();
        }
    }));
}
module.exports.getWeb3 = getWeb3;

function subscribePendingTxn () {
    logger.info('ethService.subscribePendingTxn(): Subscribing to list of pending transactions.'); 
    if(module.exports.connect()) {
        web3.eth.subscribe('pendingTransactions', (err, res) => {})
          .on('data', (txHash) => {
            logger.debug('ethService.subscribePendingTxn(): received notification for txHash: ' + txHash);
            if ((txHash !== null) && (txHash !== '')) {
              logger.debug('ethService.subscribePendingTxn(): fetch txInfo for hash: ' + txHash);
              web3.eth.getTransaction(txHash)
                .then((txInfo) => {
                  if (txInfo !== null) {
                    processTx.newPendingTran(txInfo,protocol);
                  }
                })
                .catch((e) => { 
                    logger.error('ethService.subscribePendingTxn() failed with error: ' + e);
                });
            }
          });
        logger.info('ethService.subscribePendingTxn() has successfully subscribed to pendingTransaction events');
    } else {
        logger.error('ethService.subscribePendingTxn(): Connection to geth failed!');
    }
}
module.exports.subscribePendingTxn = subscribePendingTxn;

function subscribeBlockHeaders() {
    logger.info('ethService.subscribeBlockHeaders(): Subscribing to block headers.'); 
    if(module.exports.connect()) {
        web3.eth.subscribe('newBlockHeaders', (err, res) => {})
        .on('data', (blockHeader) => {
          if (blockHeader && blockHeader.number && blockHeader.hash) {
            logger.info(`ethService.subscribeBlockHeaders(): NEW BLOCK MINED : # ${blockHeader.number} Hash = ${blockHeader.hash}`);
            // Check for pending tx in database and update their status
            module.exports.checkPendingTx(hashMaps.pendingTx.keys()).then(() => {
                logger.debug('Finished validating pending transactions.')
            });
          }
        })
        .catch((e) => {
            logger.error('ethService.subscribeBlockHeaders(): failed with error: ' + e);
        })
    } else {
        logger.error('ethService.subscribeBlockHeaders(): Connection to geth failed!');
    }
}
module.exports.subscribeBlockHeaders = subscribeBlockHeaders;

function subscribeTransferEvents(theContract) { 
    try {
        logger.info('ethService.subscribeTransferEvents() subscribed to events for contract: ' + theContract);
        if(module.exports.connect()) {
            if (web3.utils.isAddress(theContract)) {
                const ERC20SmartContractObject = new web3.eth.Contract(ERC20ABI, theContract);
                ERC20SmartContractObject.events.Transfer((error, result) => {
                    if (!error) {
                        logger.debug('ethService: Token transfer event occurred for contract: ' + theContract + 'result: ' + result);
                        processTx.checkTokenTransfer(result, theContract, protocol);
                    } else {
                        logger.error('ethService.subscribeTransferEvents() failed: ' + error);
                    }
                });
            }
        } else {
            logger.error('ethService.subscribeTransferEvents(): Connection to geth failed!');
        }
      } catch (e) {
        logger.error('ethService.subscribeTransferEvents() failed: ' + e);
      }
}
module.exports.subscribeTransferEvents = subscribeTransferEvents;

function getBlockTx(blockNumber) {
    return new Promise(((resolve, reject) => {
        try {
            if(module.exports.connect()) {
                web3.eth.getBlock(blockNumber, true)
                .then((result) => {
                    // logger.info(result.transactions)
                    if (result) {
                        resolve(result.transactions);
                    } else {
                        reject('ethService.getBlockTx Error: WRONG BLOCK NUMBER PROVIDED');
                    }
                })                
            } else {
                reject('ethService.getBlockTx Error: Connection to geth failed!');
            }
        } catch (e) { reject(e); }
    }));
}
module.exports.getBlockTx = getBlockTx;

function getBlockNumber(blockHash) {
    return new Promise(((resolve, reject) => {
        try {
            if(module.exports.connect()) {
                web3.eth.getBlock(blockHash)
                .then((result) => {
                    resolve(result.number);
                });
            } else {
                reject('ethService.getBlockNumber Error: Connection to geth failed!'); 
            }
        } catch (e) { reject(e); }
    }));
}
module.exports.getBlockNumber = getBlockNumber;

function getLastBlockNumber() {
    if(module.exports.connect()) {
        return web3.eth.getBlockNumber();
    } else {
        logger.error('ethService.getLastBlockNumber(): connection to geth failed!');
        return;
    }
}
module.exports.getLastBlockNumber = getLastBlockNumber;

function getTxReceipt(txHash) {
    if(module.exports.connect()) {
        return web3.eth.getTransactionReceipt(txHash);
    } else {
        logger.error('ethService.getTxReceipt(): connection to geth failed!');
        return;        
    }
}
module.exports.getTxReceipt = getTxReceipt;

function getBlockTransactionCount(hashStringOrBlockNumber) {
    if(module.exports.connect()) {
        return web3.eth.getBlockTransactionCount(hashStringOrBlockNumber);
    } else {
        logger.error('ethService.getBlockTransactionCount(): connection to geth failed!');
        return;        
    }
}
module.exports.getBlockTransactionCount = getBlockTransactionCount;

function getTransactionFromBlock(hashStringOrBlockNumber,index) {
    if(module.exports.connect()) {
        return web3.eth.getTransactionFromBlock(hashStringOrBlockNumber,index);
    } else {
        logger.error('ethService.getTransactionFromBlock(): connection to geth failed!');
        return;        
    }    
}
module.exports.getTransactionFromBlock = getTransactionFromBlock;

function getPendingTxArray() {
    return new Promise(((resolve, reject) => {
        try {
            if(module.exports.connect()) {
                web3.eth.getBlock('pending', true)
                .then((result) => {
                    // logger.info(result)
                    resolve(result.transactions);
                });
            } else {
                reject('ethService.getPendingTxArray(): connection to geth failed!')
            }
        } catch (e) { reject(e); }
    }));
}
module.exports.getPendingTxArray = getPendingTxArray;

function checkPendingTx(pendingTxArray) {
    return new Promise(((resolve, reject) => {
      if (pendingTxArray.length === 0) {
        resolve();
      } else {
        pendingTxArray.forEach((item) => {
            logger.debug('ethService.checkPendingTx(): Checking status of transaction: ' + item);
            if(module.exports.connect()) {
                web3.eth.getTransactionReceipt(item).then((receipt) => {
                    logger.debug('ethService.checkPendingTx(): receipt is ' + receipt);
                    if(receipt !== null) {
                        let status;
                        if(receipt.status == '0x1') { 
                            status = 'confirmed';
                        } else {
                            status = 'failed';
                        }
                        const gasUsed = receipt.gasUsed;
                        const txMsg = {
                            type: 'updateTx',
                            txHash: item,
                            status,
                            gasUsed,
                            blockNumber: receipt.blockNumber
                        };
                        rmqServices.sendPubSubMessage(txMsg);
                        logger.info(`ethService.checkPendingTx(): TRANSACTION ${item} CONFIRMED @ BLOCK # ${receipt.blockNumber}`);
                        hashMaps.pendingTx.delete(txHash);
                    } else {
                        logger.debug('ethService.checkPendingTx(): Txn ' + item + ' is still pending.');
                    }
                });
            } else {
                reject('ethService.checkPendingTx(): connection to geth failed!')
            }
        });
      }
    }));
  }
  module.exports.checkPendingTx = checkPendingTx;
  