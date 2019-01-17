/** @module newService.js */
require('dotenv').config();
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
        unconfirmedTransactionListener.subscribe(x => {
            
            console.log(x);
        }, err => {
            console.log(err);
        });
    });
}
module.exports.subscribePendingTxn = subscribePendingTxn;

/**
 * Subscribe to new blocks on NEM blockchain.
 */
function subscribeNewBlocks() {
    let blockchainListener = new BlockchainListener().newBlock();

    blockchainListener.subscribe(x => {
        console.log(x);
        //check for confirmed transaction
    }, err => {
        console.log(err);
    });
}
module.exports.subscribeNewBlock = subscribeNewBlock;

