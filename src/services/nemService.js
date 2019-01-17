/** @module newService.js */
const logger = require('../utils/logger');
const nemlib = require('nem-library');
const NetworkTypes = nemlib.NetworkTypes;
const UnconfirmedTransactionListener = nemlib.UnconfirmedTransactionListener;
const NEMAddress = nemlib.Address;
const AccountHttp = nemlib.AccountHttp;
const BlockchainListener = nemlib.BlockchainListener;
const hashMaps = require('../utils/hashMaps');
const rmqServices = require('./rmqServices.js');
const protocol = 'NEM';

/**
 * Establish connection to the geth node
 */
function connect() {
    //nemlib.NEMbootstrap(NetworkTypes.TEST_NET);
    nemlib.NEMLibrary.bootstrap(NetworkTypes.TEST_NET);
}
module.exports.connect = connect;

/**
 * Subscribe to NEM WS event corresponding to new pending transactions.
 */
function subscribePendingTxn (addresses) {
    addresses.forEach((address) => {
        logger.info(`nemService.js - Subscribing to pending transactions for address - ${address.address}`);
        const theAddress = new NEMAddress(address.address);
        let unconfirmedTransactionListener = new UnconfirmedTransactionListener().given(theAddress);
        unconfirmedTransactionListener.subscribe(tran => {
            hashMaps.pendingTx.set(tran.transactionInfo.hash,JSON.stringify(tran));
            //PUBLISH THE PENDING TRANSACTION MESSAGE TO SUBSCRIBER
            const txMsg = {
                type: 'newTx',
                protocol: protocol, 
                fromAddress: tran.signer.address.value,
                toAddress: tran.recipient.address.value,
                txHash: tran.transactionInfo.hash,
                asset: tran._xem.assetId.namespaceId + ':' + tran._xem.assetId.name,
                timestamp: tran.timeWindow.timeStamp,
                value: tran._xem.quantity,
                status: 'pending'
            };
            logger.info(`nemService.js - received a new pending transaction for address - ${address}, tran - ${JSON.stringify(txMsg)}`);
            //send notifications to the subscriber
            rmqServices.sendPubSubMessage(txMsg);
        }, err => {
            logger.error(`nemService.js - subscribe pending transactions failed with error - ${err}, for address - ${address}`);
        });
    });
}
module.exports.subscribePendingTxn = subscribePendingTxn;

/**
 * Subscribe to new blocks on NEM blockchain.
 */
function subscribeNewBlock() {
    let blockchainListener = new BlockchainListener().newBlock();

    blockchainListener.subscribe(blockInfo => {
        logger.info(`nemService.js - new block mined - ${JSON.stringify(blockInfo.height)}`);
        blockInfo.transactions.forEach((tran) => {
            console.log("Transaction: ", JSON.stringify(tran));
            if(hashMaps.pendingTx.has(tran)) {
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


