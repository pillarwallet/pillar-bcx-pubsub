/** @module newService.js */
const logger = require('../utils/logger');
const nemlib = require('nem-library');
const NetworkTypes = nemlib.NetworkTypes;
const AccountHttp = nemlib.AccountHttp;
const BlockchainListener = nemlib.BlockchainListener;
const NEM_NODE = `${process.env.NEM_NODE_URL}:${process.env.NEM_NODE_PORT}`;
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
    if(process.env.NEM_EXEC_MODE == 'test') { 
        nemlib.NEMLibrary.bootstrap(NetworkTypes.TEST_NET);
    } else {
        nemlib.NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);
    }
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
                    //TODO - Handle multisig transactions
                    if((await client.existsAsync(tran.tx.signer)) || (await client.existsAsync(tran.tx.recipient))) {
                        let asset, quantity;
                        if(typeof tran.tx.mosaics !== "undefined") {
                            if(tran.tx.mosaics.length == 1) {
                                asset = tran.tx.mosaics[0].mosaicId.namespaceId + "-" + tran.tx.mosaics[0].mosaicId.name;
                                quantity = tran.tx.mosaics[0].quantity;
                            } else {
                                //this is a multi asset transfer
                                //TODO - handle multi asset transacter
                            }
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
                });
            } else {
                logger.error(`nemService.subscribeNewBlock - error fetching tran data from localhost ${error}`);
            }
        });
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
    logger.info(`nemService.fethAllTransactions for wallet ${address} - ${trans}`);
    return trans;
}
module.exports.fetchAllTran = fetchAllTran;