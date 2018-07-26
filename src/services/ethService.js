const logger = require('../utils/logger.js');
const Web3 = require('web3');
require('dotenv').config();
const ERC20ABI = require('./ERC20ABI.json');
const bcx = require('./bcx.js');
const processTx = require('./processTx.js');
const dbServices = require('./dbServices.js');
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

function subscribePendingTxn () {
    logger.info('ethService.subscribePendingTxn(): Subscribing to list of pending transactions.'); 
    if(module.exports.connect()) {
        web3.eth.subscribe('pendingTransactions', (err, res) => {})
          .on('data', (txHash) => {
            logger.debug('ethService.subscribePendingTxn(): received notification for txHash: ' + txHash);
            if ((txHash !== null) && (txHash !== '')) {
              logger.debug('ethService.subscribePendingTxn(): fetch txInfo for hash: ' + txHash);
              bcx.getTxInfo(txHash)
                .then((txInfo) => {
                  if (txInfo != null) {
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
            processTx.checkPendingTx(hashMaps.pendingTx.keys(), blockHeader.number)
              .then(() => {
                if (dbServices.dbCollections) {
                  dbServices.dbCollections.transactions.updateTxHistoryHeight(blockHeader.number);
                }
              })
              .catch((e)  => { 
                logger.error('ethService.subscribeBlockHeaders(): failed with error: ' + e);
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