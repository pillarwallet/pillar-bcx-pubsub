/** @module newService.js */
require('dotenv').config();
const logger = require('./utils/logger');
const nemlib = require('nem-library');
const UnconfirmedTransactionListener = nemlib.UnconfirmedTransactionListener;
const NetworkTypes = nemlib.NetworkTypes;
const BlockchainListener = nemlib.BlockchainListener;
const hashMaps = require('../utils/hashMaps');
const protocol = 'NEM';

/**
 * Establish connection to the geth node
 */
function connect() {
    nemlib.bootstrap(NetworkTypes.TEST_NET);
}
module.exports.connect = connect;

/**
 * Subscribe to NEM WS event corresponding to new pending transactions.
 */
function subscribePendingTxn (addresses) {
    addresses.forEach((address) => {
        const theAddress = new nemlib.address(address);
        let unconfirmedTransactionListener = new UnconfirmedTransactionListener().given(theAddress);
        unconfirmedTransactionListener.subscribe(tran => {
            //hashMaps.pendingTx.set(address,JSON.stringify(tran));
            hashMaps.pendingTx.set(tran.transactionInfo.hash,JSON.stringify(tran));
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
        blockInfo.transactions.forEach((tran) => {
            if(hashMaps.pendingTx.has(tran)) {
                //send notifications to the subscriber

            }
        });
    }, err => {
        console.log(err);
    });
}
module.exports.subscribeNewBlock = subscribeNewBlock;


/**
 * Fetch all transactions for a given set of addresses
 */
function fetchAllTran(addresses) {
    
}
module.exports.subscribeNewBlock = subscribeNewBlock;


