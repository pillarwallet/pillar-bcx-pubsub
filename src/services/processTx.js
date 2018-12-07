/** @module processTx.js */
const time = require('unix-timestamp');
const logger = require('../utils/logger.js');
const dbServices = require('./dbServices.js');
const rmqServices = require('./rmqServices.js');
const abiDecoder = require('abi-decoder');
const ERC20ABI = require('./ERC20ABI');
const abiPath = require('app-root-path') + '/src/abi/';
const hashMaps = require('../utils/hashMaps.js');
const fs = require('fs');
const bluebird = require('bluebird');
const redis = require('redis');
let client = redis.createClient();
bluebird.promisifyAll(redis);

/**
 * Store the gas information corresponding to the block
 * @param {any} entry - the json string corresponding to gas information.
 */
function storeTransactionStats(entry) {
    try {
        logger.debug('processTx.storeTransactionStats() storing the transaction ' + JSON.stringify(entry));
        dbServices.addTransactionStats(entry);
        logger.debug('processTx.storeTransactionStats(): Successfully saved the transaction stats.');
    }catch(e) {
        logger.error('processTx.storeTransactionStats(): failed storing transaction details ' + e);
    }
}
module.exports.storeTransactionStats = storeTransactionStats;
/**
 * Store the token event if either of the wallets are being monitored
 * @param {any} event - the token transfer event
 * @param {String} asset - the asset symbol
 * @param {String} protocol - the protocol
 * @param {any} txn - the transaction receipt
 */
function storeTokenEvent(event,asset,protocol,txn) {
    try {
        logger.debug('processTx.storeTokenEvent(): for transaction ' + event.transactionHash + ' of asset ' + asset);
        dbServices.dbCollections.transactions.findOneByTxHash(event.transactionHash).then(async (tran) => {
            var pillarId, status;
            var tmstmp = time.now();
            status = 'confirmed';
            if(tran === null) {
                if ((event.returnValues._to !== null) && await client.existsAsync(event.returnValues._to.toLowerCase())) {
                    //fetch the pillarId corresponding to the to address and
                    pillarId = await client.getAsync(event.returnValues._to.toLowerCase());
                } else if ((event.returnValues._from !== null) && await client.existsAsync(event.returnValues._from.toLowerCase())) {
                    pillarId = await client.getAsync(event.returnValues._from.toLowerCase());
                }
                if(pillarId !== undefined) {
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
                    logger.debug('processTx.storeTokenEvent(): Saving transaction into the database: ' + entry);
                    dbServices.dbCollections.transactions.addTx(entry);  
                } else {
                    logger.debug('processTx.storeTokenEvent(): Not relevant ignoring transaction: ' + event.transactionHash);
                }
            } else {
                logger.debug('processTx.storeTokenEvent(): Transaction ' + event.transactionHash + ' already exists in the database, ignoring!');
            }
        });
    }catch(e) {
        logger.error('processTx.storeTokenEvent(): Failed with error ' + e);
    }
}
module.exports.storeTokenEvent = storeTokenEvent;
/**
 * Check if given transaction is relevant and store in the database
 * @param {any} tx - the transaction object
 * @param {any} protocol - the transaction object
 */
async function storeIfRelevant(tx, protocol) {
    const tmstmp = time.now();
    var pillarId = '';
    var data, value;
    var from = tx.from;
    var to = tx.to;
    var status = (tx.status === '0x1' ? 'confirmed' : 'failed');
    var hash = tx.transactionHash;
    if ((tx.to !== null) && await client.existsAsync(tx.to.toLowerCase())) {
        //fetch the pillarId corresponding to the to address and
        pillarId = await client.getAsync(tx.to.toLowerCase());
    } else if ((tx.from !== null) && await client.existsAsync(tx.from.toLowerCase())) {
        pillarId = await client.getAsync(tx.from.toLowerCase());
    }
    if(!hashMaps.assets.has(tx.to.toLowerCase())) { 
        asset = 'ETH';
        value = tx.value;
    } else {
        //fetch the asset from the assets hashmap
        const contractDetail = hashMaps.assets.get(tx.to.toLowerCase());
        contractAddress = contractDetail.contractAddress;
        asset = contractDetail.symbol;
        if(fs.existsSync(abiPath + asset + '.json')) {
            const theAbi = require(abiPath + asset + '.json');
            logger.debug('processTx - Fetched ABI for token: ' + asset);
            abiDecoder.addABI(theAbi);
        } else {
            abiDecoder.addABI(ERC20ABI);
        }
        data = abiDecoder.decodeMethod(tx.input);
        if ((data !== undefined) && (data.name === 'transfer')) { 
            //smart contract call hence the asset must be the token name
            to = data.params[0].value;
            value = data.params[1].value;
        }
    }
    
    if(pillarId !== '') {
        dbServices.dbCollections.transactions.findOneByTxHash(hash).then((txn) => {
            if (txn === null) {
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
                    gasPrice: tx.gasPrice,
                    blockNumber: tx.blockNumber,
                    status
                };
                logger.debug('processTx.saveIfRelevant(): Saving transaction into the database: ' + entry);
                dbServices.dbCollections.transactions.addTx(entry);
            }
            throw new Error('newTx: Transaction already exists');
        })
    } else {
        logger.debug('processTx.storeIfRelevant(): ignoring txn as its not relevant!');
    } 
}
module.exports.storeIfRelevant = storeIfRelevant;

/**
 * Store the new pending transaction in memeory if the transaction corresponds
 * to a monitored wallet.
 * @param {any} tx - the transaction object
 * @param {any} protocol - the transaction object
 */
async function newPendingTran(tx, protocol) {
  try {
    logger.debug('processTx.newPendingTran(): validating transaction: ' + JSON.stringify(tx));
    const tmstmp = time.now();
    var pillarId = '';
    var asset, contractAddress, data, from, to, value, hash;
    from = ((typeof tx.from !== 'undefined') ? tx.from : tx.fromAddress);
    to = ((typeof tx.to !== 'undefined') ? tx.to : tx.toAddress);
    hash = ((typeof tx.hash !== 'undefined') ? tx.hash : tx.txHash);
    //ignore contract creation transactions, these have the to as null
    if(to === null) {
        logger.debug('processTx.newPendingTran(): txn ' + hash + ' looks like a probable contract deployment');
        hashMaps.pendingAssets.set(hash,tx);
    }
    if(from !== null && to !== null) {
      logger.debug('processTx.newPendingTran(): txn ' + hash+ ' from= ' + from + ' to= ' + to);
      if ((to !== null) && await client.existsAsync(to.toLowerCase())) {
          //fetch the pillarId corresponding to the to address and
          pillarId = await client.getAsync(to.toLowerCase());
      } else if ((from !== null) && await client.existsAsync(from.toLowerCase())) {
          pillarId = await client.getAsync(from.toLowerCase());
      }
      if(!hashMaps.assets.has(to.toLowerCase())) { 
          asset = 'ETH';
          value = tx.value;
      } else {
          value = tx.value;  
          //fetch the asset from the assets hashmap
          const contractDetail = hashMaps.assets.get(to.toLowerCase());
          contractAddress = contractDetail.contractAddress;
          asset = contractDetail.symbol;

          if(fs.existsSync(abiPath + asset + '.json')) {
            const theAbi = require(abiPath + asset + '.json');
            logger.debug('processTx - Fetched ABI for token: ' + asset);
            abiDecoder.addABI(theAbi);
          } else {
            abiDecoder.addABI(ERC20ABI);
          }
          data = abiDecoder.decodeMethod(tx.input);
          logger.debug('ethService.newPendingTran(): Identified a new pending transaction involving monitored asset: ' + asset);
          logger.debug('ethService.newPendingTran(): tx.input= ' + tx.input + ' data is ' + JSON.stringify(data));
          if ((typeof data !== 'undefined') && (tx.input !== '0x')) {
            if(data.name  === 'transfer'){ 
                //smart contract call hence the asset must be the token name
                to = data.params[0].value;
                pillarId = await client.getAsync(to);
                value = data.params[1].value;
            }
          }
      }
      
      if(pillarId !== '' && pillarId !== null) {
        logger.info('processTx.newPendingTran(): PillarID: ' + pillarId + ' tx: ' + JSON.stringify(tx));
          //send a message to the notifications queue reporting a new transactions
          const txMsgTo = {
              type: 'newTx',
              pillarId: pillarId,
              protocol: protocol, 
              fromAddress: from,
              toAddress: to,
              txHash: hash,
              asset,
              contractAddress: contractAddress,
              timestamp: tmstmp,
              value: value,
              gasPrice: tx.gasPrice,
              blockNumber: tx.blockNumber,
              status: 'pending',
              input: tx.input
          };
          logger.info('processTx.newPendingTran() notifying subscriber of a new relevant transaction: ' + JSON.stringify(txMsgTo));

          rmqServices.sendPubSubMessage(txMsgTo);
          // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
          hashMaps.pendingTx.set(tx.hash, txMsgTo);
      }
    }
  }catch(e) {
    logger.error('processTx.newPendingTran(): failed with error ' + e + ' for txn: ' + tx.hash);
  }
}
module.exports.newPendingTran = newPendingTran;

/**
 * Validated if the wallets involved in a monitored token transfer needs to be persisted in database
 * @param {any} evnt - the event associated with the token transfer
 * @param {String} theContract - the smart contract address associated with the token
 * @param {String} protocol - the protocol corresponding to the token blockchain
 */
function checkTokenTransfer(evnt, theContract, protocol) {
    logger.debug('processTx.checkTokenTransfer(): received event: ' + JSON.stringify(evnt));
    return new Promise((async (resolve, reject) => {
        var pillarId;
        if (await client.existsAsync(evnt.returnValues._to.toLowerCase())) {
            pillarId = await client.getAsync(evnt.returnValues._to.toLowerCase());
        } else if(await client.existsAsync(evnt.returnValues._from.toLowerCase())) {
            pillarId = await client.getAsync(evnt.returnValues._from.toLowerCase());
        }
        dbServices.dbConnect().then(() => { 
            dbServices.dbCollections.transactions.findByTxHash(evnt.transactionHash).then((tx) => {
                if (tx.asset === 'ETH') { 
                    // check is it is regular token transfer,
                    // if so (asset === TOKEN): resolve (because token transfer already processed),
                    // otherwise (asset === ETH) transfer needs to be processed here:
                    // SEND NEW TX DATA TO SUBSCRIBER MSG QUEUE
                    const txMsg = {
                        type: 'newTx',
                        pillarId, 
                        protocol: protocol, 
                        fromAddress: theContract.address,
                        toAddress: evnt.returnValues._to,
                        txHash: evnt.transactionHash,
                        asset: theContract.ticker,
                        contractAddress: theContract.address,
                        timestamp: tmstmp,
                        value: evnt.returnValues._value,
                        gasPrice: evnt.gasPrice,
                        blockNumber: evnt.blockNumber,
                        status: 'confirmed',
                    };
                    logger.debug('processTx.checkTokenTransfer(): notifying subscriber of new tran: ' + JSON.stringify(txMsg));
                    rmqServices.sendPubSubMessage(txMsg);
                    resolve();
                } else {
                    resolve();
                }
            });
        });
    }));
}
module.exports.checkTokenTransfer = checkTokenTransfer;