/** @module newService.js */
const logger = require('../utils/logger');
const nemlib = require('nem-library');
const NetworkTypes = nemlib.NetworkTypes;
const AccountHttp = nemlib.AccountHttp;
const BlockchainListener = nemlib.BlockchainListener;
const NEM_NODE = 'http://127.0.0.1:7890';
const hashMaps = require('../utils/hashMaps');
const rmqServices = require('./rmqServices.js');
const protocol = 'NEM';
var request = require('request');
const redis = require('redis');
let client = redis.createClient();
bluebird.promisifyAll(redis);

/**
 * Establish connection to the geth node
 */
function connect() {
    //nemlib.NEMbootstrap(NetworkTypes.TEST_NET);
    nemlib.NEMLibrary.bootstrap(NetworkTypes.TEST_NET);
}
module.exports.connect = connect;

/**
 * Subscribe to new blocks on NEM blockchain.
 */
function subscribeNewBlock() {
    let blockchainListener = new BlockchainListener([{domain: NEM_NODE}]).newBlock();

    blockchainListener.subscribe(blockInfo => {
        logger.info(`nemService.js - new block mined - ${JSON.stringify(blockInfo.height)}`);
        //fetch the extended transactions details by querying the local nem node
        
        var options = {
              uri: NEM_NODE + '/local/block/at',
              method: 'POST',
              json: {
                    "height": blockInfo.height
              }
        };
    
        request(options, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                    const trans = JSON.parse(JSON.stringify(body));
                    trans.txes.forEach((tran) => {
                        console.log("Tran: ", tran.tx);
                        //check if either of the addresses in the transaction is a pillar address
                        if((await client.existsAsync(tran.tx.signer)) || (await client.existsAsync(tran.tx.recipient))) {
                            let asset, quantity;
                            if(typeof tran.tx.mosaics !== "undefined") {
                                asset = tran.tx.mosaics[0].mosaicId.namespaceId + "-" + tran.tx.mosaics[0].mosaicId.name;
                                quantity = tran.tx.mosaics[0].quantity;
                            } else {
                                asset = 'xem-nem';
                                quantity = tran.tx.amount;
                            }
                                        
                            //format the output in desired schema
                            const txMsg = {
                                type: 'updateTx',
                                protocol: protocol, 
                                fromAddress: tran.tx.signer,
                                toAddress: tran.tx.recipient,
                                txHash: tran.tx.hash,
                                asset: asset,
                                timestamp: tran.tx.timeStamp,
                                value: quantity,
                                gasPrice: tran.tx.fee,
                                blockNumber: blockInfo.height,
                                status: 'confirmed'
                            };
                            logger.info(`nemService.js - transaction confirmed - ${JSON.stringify(txMsg)}`);
                            //send notifications to the subscriber
                            rmqServices.sendPubSubMessage(txMsg);
                            //delete the pending transaction from hashmap
                            hashMaps.pendingTx.delete(tran);
                        }                        
                    })
              } else {
                console.log("error: ",error);
                console.log("statusCode: ", response.statusCode);
            }
        });
        /*
        console.log(JSON.stringify(blockInfo.transactions));
        blockInfo.transactions.forEach((tran) => {
            //check if either of the addresses in the transaction is a pillar address
            if((await client.existsAsync(tran.signer.address.value)) || (await client.existsAsync(tran.recipient.value))) {
                
                //format the output in desired schema
                const txMsg = {
                    type: 'updateTx',
                    protocol: protocol, 
                    fromAddress: tran.signer.address.value,
                    toAddress: tran.recipient.address.value,
                    txHash: tran.transactionInfo.hash,
                    asset: tran._xem.assetId.namespaceId + '-' + tran._xem.assetId.name,
                    timestamp: tran.timeWindow.timeStamp,
                    value: tran._xem.quantity,
                    gasPrice: tran.fee,
                    blockNumber: blockInfo.BlockHeight,
                    status: 'confirmed'
                };
                logger.info(`nemService.js - transaction confirmed - ${JSON.stringify(txMsg)}`);
                //send notifications to the subscriber
                rmqServices.sendPubSubMessage(txMsg);
                //delete the pending transaction from hashmap
                hashMaps.pendingTx.delete(tran);
            }
        });
        */
    }, err => {
        logger.error(`nemService.js - new block subscription failed with error - ${err}`);
    });
}
module.exports.subscribeNewBlock = subscribeNewBlock;


/**
 * Fetch all transactions for a given set of addresses
 */
function fetchAllTran(address) {
    let accountHttp = new AccountHttp();
    let trans;
    accountHttp.allTransactions(new Address(address)).subscribe(allTransactions => {
       trans = JSON.stringify(allTransactions);
    });
    console.log(trans);
    return trans;
}
module.exports.fetchAllTran = fetchAllTran;


