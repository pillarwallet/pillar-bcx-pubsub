/** @module ethService.js */
const logger = require('../utils/logger.js');
const Web3 = require('web3');
require('dotenv').config();
const ERC20ABI = require('./ERC20ABI.json');
const processTx = require('./processTx.js');
const rmqServices = require('./rmqServices.js');
const hashMaps = require('../utils/hashMaps.js');
const protocol = 'Ethereum';
const gethURL = process.env.GETH_NODE_URL + ':' + process.env.GETH_NODE_PORT;
let web3;

/**
 * Establish connection to the geth node
 */
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

/**
 * Return an instance to the underlying web3 instance
 */
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

/**
 * Subscribe to geth WS event corresponding to new pending transactions.
 */
function subscribePendingTxn () {
    logger.info('ethService.subscribePendingTxn(): Subscribing to list of pending transactions.'); 
    if(module.exports.connect()) {
        web3.eth.subscribe('pendingTransactions', (err, res) => {
            if(!err) { 
                logger.debug('ethService.subscribePendingTxn(): pendingTransactions subscription status : ' + res);
            } else {
                logger.error('ethService.subscribePendingTxn(): pendingTransactions subscription errored : ' + err);
            }
          })
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
          })
          .on("error", (err) => {
              logger.error('ethService.subscribePendingTxn() failed with error: ' + err);
          });
        logger.info('ethService.subscribePendingTxn() has successfully subscribed to pendingTransaction events');
    } else {
        logger.error('ethService.subscribePendingTxn(): Connection to geth failed!');
    }
}
module.exports.subscribePendingTxn = subscribePendingTxn;

/**
 * Subscribe to geth WS events corresponding to new block headers.
 */
function subscribeBlockHeaders() {
    logger.info('ethService.subscribeBlockHeaders(): Subscribing to block headers.'); 
    if(module.exports.connect()) {
        web3.eth.subscribe('newBlockHeaders', (err, res) => {
            if(!err) { 
                logger.debug('ethService.subscribeBlockHeaders(): newBlockHeader subscription status : ' + res);
            } else {
                logger.error('ethService.subscribeBlockHeaders(): newBlockHeader subscription errored : ' + err);
            }
        })
        .on('data', (blockHeader) => {
            logger.info(`ethService.subscribeBlockHeaders(): new block : ${blockHeader.number}`);
            if (blockHeader && blockHeader.number && blockHeader.hash) {
                logger.info(`ethService.subscribeBlockHeaders(): NEW BLOCK MINED : # ${blockHeader.number} Hash = ${blockHeader.hash}`);
                // Check for pending tx in database and update their status
                module.exports.checkPendingTx(hashMaps.pendingTx.keys()).then(() => {
                    logger.debug('ethService.subscribeBlockHeaders(): Finished validating pending transactions.');
                });
                module.exports.checkNewAssets(hashMaps.pendingAssets.keys());
                //capture gas price statistics
                module.exports.storeGasInfo(blockHeader);
            }
        })
        .on("error", (err) => {
            logger.error('ethService.subscribePendingTxn() failed with error: ' + err);
        });
    } else {
        logger.error('ethService.subscribeBlockHeaders(): Connection to geth failed!');
    }
}
module.exports.subscribeBlockHeaders = subscribeBlockHeaders;

/**
 * Determin the gas price and store the details.
 * @param {any} blockHeader - the event object corresponding to the current block
 */
function storeGasInfo(blockHeader) {
    logger.info('ethService.storeGasInfo(): fetching gas information for block number ' + blockHeader.number);
    let entry;
    try {
        web3.eth.getBlockTransactionCount(blockHeader.number).then((txnCnt) => {
            if(txnCnt !== null) {
                entry = {
                    type: 'tranStat',
                    protocol,
                    gasLimit: blockHeader.gasLimit,
                    gasUsed: blockHeader.gasUsed,
                    blockNumber: blockHeader.number,
                    transactionCount: txnCnt
                };
                rmqServices.sendPubSubMessage(entry);
            }
        });
    }catch(e) {
        logger.error('ethService.storeGasInfo() failed with error ' + e);
    }
}
module.exports.storeGasInfo = storeGasInfo; 

/**
 * Subscribe to token transfer event corresponding to a given smart contract.
 * @param {any} theContract - the smart contract address
 */
function subscribeTransferEvents(theContract) { 
    try {
        logger.info('ethService.subscribeTransferEvents() subscribed to events for contract: ' + theContract);
        if(module.exports.connect()) {
            if (web3.utils.isAddress(theContract)) {
                const ERC20SmartContractObject = new web3.eth.Contract(ERC20ABI, theContract);
                ERC20SmartContractObject.events.Transfer({},(error, result) => {
                    logger.debug('ethService: Token transfer event occurred for contract: ' + theContract + ' result: ' + result + ' error: ' + error);
                    if (!error) {
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

/**
 * Fetch transaction details corresponding to given block number
 * @param {Number} blockNumber - the block number
 */
function getBlockTx(blockNumber) {
    return new Promise(((resolve, reject) => {
        logger.debug('ethService.getBlockTx(): Fetch transactions from block: ' + blockNumber);
        try {
            if(module.exports.connect()) {
                web3.eth.getBlock(blockNumber, true)
                .then((result) => {
                    //logger.info("Transactions within block " + blockNumber + " is " + JSON.stringify(result.transactions));
                    resolve(result.transactions);
                });
                logger.debug('Fetched transactions from block');                
            } else {
                reject('ethService.getBlockTx Error: Connection to geth failed!');
            }
        } catch (e) { 
            logger.error("ethService.getBlockTx(): " + e); 
            reject(e);
        }
    }));
}
module.exports.getBlockTx = getBlockTx;

/**
 * Fetch block number for a given block hash
 * @param {any} blockHash - the block hash
 */
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

/**
 * Fetch the latest block number
 */
function getLastBlockNumber() {
    if(module.exports.connect()) {
        return web3.eth.getBlockNumber();
    } else {
        logger.error('ethService.getLastBlockNumber(): connection to geth failed!');
        return;
    }
}
module.exports.getLastBlockNumber = getLastBlockNumber;

/**
 * Fetch the transaction receipt corresponding to a given transaction hash
 * @param {String} txHash - the transaction hash
 */
function getTxReceipt(txHash) {
    if(module.exports.connect()) {
        return web3.eth.getTransactionReceipt(txHash);
    } else {
        logger.error('ethService.getTxReceipt(): connection to geth failed!');
        return;        
    }
}
module.exports.getTxReceipt = getTxReceipt;

/**
 * Fetch the total number of transactions within a given block
 * @param {String} hashStringOrBlockNumber - block hash or block number
 */
function getBlockTransactionCount(hashStringOrBlockNumber) {
    if(module.exports.connect()) {
        return web3.eth.getBlockTransactionCount(hashStringOrBlockNumber);
    } else {
        logger.error('ethService.getBlockTransactionCount(): connection to geth failed!');
        return;        
    }
}
module.exports.getBlockTransactionCount = getBlockTransactionCount;

/**
 * Fetch the transaction corresponding to a given block and index
 * @param {String} hashStringOrBlockNumber - block hash or block number
 * @param {Number} index - index number
 */
function getTransactionFromBlock(hashStringOrBlockNumber,index) {
    if(module.exports.connect()) {
        return web3.eth.getTransactionFromBlock(hashStringOrBlockNumber,index);
    } else {
        logger.error('ethService.getTransactionFromBlock(): connection to geth failed!');
        return;        
    }    
}
module.exports.getTransactionFromBlock = getTransactionFromBlock;

/**
 * Fetch all pending transactions.
 */
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

/**
 * Check the status of the given transaction hashes
 * @param {any} pendingTxArray - an array of transaction hashes
 */
function checkPendingTx(pendingTxArray) {
    logger.info('ethService.checkPendingTx(): pending tran count: ' + pendingTxArray.length);
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
                        const gasUsed = receipt.gasUsed;
                        if(receipt.status == '0x1') { 
                            status = 'confirmed';
                        } else {
                            status = 'failed';
                        }
                        const txMsg = {
                                type: 'updateTx',
                                txHash: item,
                                status,
                                gasUsed,
                                blockNumber: receipt.blockNumber
                            };         
                        rmqServices.sendPubSubMessage(txMsg);
                        logger.info(`ethService.checkPendingTx(): TRANSACTION ${item} CONFIRMED @ BLOCK # ${receipt.blockNumber}`);
                        hashMaps.pendingTx.delete(item);
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

/**
 * Check if a new pending transaction corresponds to an asset
 * @param {any} pendingAssets - an array of transaction hashes
 */
function checkNewAssets(pendingAssets) {
    logger.info('ethService.checkNewAsset(): pending asset count: ' + pendingAssets.length);
    return new Promise(((resolve, reject) => {
      if (pendingAssets.length === 0) {
        resolve();
      } else {
        pendingAssets.forEach((item) => {
            logger.debug('ethService.checkNewAssets(): Checking status of transaction: ' + item);
            if(module.exports.connect()) {
                web3.eth.getTransactionReceipt(item).then((receipt) => {
                    logger.debug('ethService.checkNewAssets(): receipt is ' + JSON.stringify(receipt));
                    if(receipt !== null && receipt.contractAddress !== null) {
                        //check if contract is an ERC20
                        if(!module.exports.addERC20(receipt)) {
                            module.exports.addERC721(receipt);
                        }
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
module.exports.checkNewAssets = checkNewAssets;

/**
 * Validated if a given transaction corresponds to the deployment of a token contract
 * @param {any} receipt - the transaction receipt
 */
async function addERC20(receipt) {
    let contract;
    try {
        contract = new web3.eth.Contract(ERC20ABI,receipt.contractAddress);
        const symbol = await contract.methods.symbol().call();
        const name = await contract.methods.name().call();
        const decimals = await contract.methods.decimals().call();
        const totalSupply = await contract.methods.totalSupply().call();

        if(receipt.status == '0x1') { 
            const txMsg = {
                type: 'newAsset',
                name,
                symbol,
                decimals,
                contractAddress: receipt.contractAddress,
                totalSupply,
                category: 'Token',
                protocol: protocol
            };
            rmqServices.sendPubSubMessage(txMsg);
            logger.info(`ethService.addERC20(): Identified a new ERC20 asset (${receipt.contractAddress}) in block: ${receipt.blockNumber}`);
        }
        hashMaps.pendingAssets.delete(receipt.transactionHash);
        return true;
    }catch(e) {
        logger.error('ethService.addERC20(): deployed contract ' + receipt.contractAddress + ' is not ERC20.');
        hashMaps.pendingAssets.delete(receipt.transactionHash);
        return false;
    }
}
module.exports.addERC20 = addERC20;

/**
 * Validated if a given transaction corresponds to the deployment of a collectible contract
 * @param {any} txn - the transaction receipt
 */
async function addERC721(receipt) {
    let contract;
    try {
        contract = new web3.eth.Contract(ERC721ABI,receipt.contractAddress);
        const symbol = await contract.methods.symbol().call();
        const name = await contract.methods.name().call();

        if(receipt.status === '0x1') { 
            const txMsg = {
                type: 'newAsset',
                name,
                symbol,
                decimals: 0,
                contractAddress: receipt.contractAddress,
                totalSupply: 1,
                category: 'Collectible',
                protocol: protocol
            };
            rmqServices.sendPubSubMessage(txMsg);
            logger.info(`ethService.addERC721(): Identified a new ERC20 asset (${receipt.contractAddress}) in block: ${receipt.blockNumber}`);
        }
        hashMaps.pendingAssets.delete(receipt.transactionHash);
        return true;
    }catch(e) {
        logger.error('ethService.addERC721(): deployed contract ' + receipt.contractAddress + ' is not ERC721.');
        hashMaps.pendingAssets.delete(receipt.transactionHash);
        return false;
    }
}
module.exports.addERC721 = addERC721;

/**
 * Get past transfer events associated with token
 * @param {String} address - the smart contract address to get events
 * @param {String} eventName - the eventName
 * @param {Number} blockNumber - the block number from which to listen to contract events
 * @param {String} walletAddress - the wallet address relevant to the transaction
 * @param {String} pillarId - The pillarId corresponding to the transactions
 */
async function getPastEvents(address,eventName = 'Transfer' ,blockNumber = 0, wallet = undefined, pillarId = undefined) {
    try {
        const contract = new web3.eth.Contract(ERC20ABI,address);
        const asset = await contract.methods.symbol().call();
        contract.getPastEvents(eventName,{fromBlock: blockNumber,toBlock: 'latest'},(error,events) => {
            if(!error) {
                logger.debug('ethService.getPastEvents(): Fetching past events of contract ' + address + ' from block: ' + blockNumber);
                events.forEach((event) => { 
                    this.getTxReceipt(event.transactionHash).then((txn) => {
                        if(event.returnValues._to === wallet || event.returnValues._from === wallet) {
                            dbServices.dbCollections.transactions.findOneByTxHash(event.transactionHash).then((tran) => {
                                var status;
                                var protocol = 'Ethereum';
                                var tmstmp = time.now();
                                status = 'confirmed';
                                if(tran === null) {
                                    let entry = {
                                        pillarId,
                                        protocol,
                                        toAddress: event.returnValues._to,
                                        fromAddress: event.returnValues._from,
                                        txHash: event.transactionHash,
                                        asset,
                                        contractAddress: null,
                                        timestamp: tmstmp,
                                        value: event.returnValues._value,
                                        blockNumber: event.blockNumber,
                                        status,
                                        gasPrice: txn.gasPrice,
                                        gasUsed: txn.gasUsed
                                    };
                                    logger.debug('ethService.getPastEvents(): Saving transaction into the database: ' + entry);
                                    dbServices.dbCollections.transactions.addTx(entry);  
                                } else {
                                    logger.debug('processTx.storeTokenEvent(): Transaction ' + event.transactionHash + ' already exists in the database, ignoring!');
                                }
                            });
                        }
                    });
                });
            } else {
                logger.error('ethService.getPastEvents() error fetching past events for contract ' + address + ' error: ' + error);
            }
        });
    } catch(err) {
        logger.error('ethService.getPastEvents(): for contract: ' + address + ' failed with error: ' + err);
    }
}
module.exports.getPastEvents = getPastEvents;