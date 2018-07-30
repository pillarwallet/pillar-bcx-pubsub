const logger = require('../utils/logger.js');
const Web3 = require('web3');
require('dotenv').config();
const ERC20ABI = require('./ERC20ABI.json');
const processTx = require('./processTx.js');
const dbServices = require('./dbServices.js');
const rmqServices = require('./rmqServices.js');
const hashMaps = require('../utils/hashMaps.js');

const protocol = 'Ethereum';
const gethURL = `${process.env.GETH_NODE_URL}:${process.env.GETH_NODE_PORT}`;
let web3;

function connect() {
  logger.info('ethService.connect(): Connecting to web3.');
  return new Promise(((resolve, reject) => {
    try {
      if (web3 === undefined || (!web3.eth.isSyncing())) {
        web3 = new Web3(new Web3.providers.WebsocketProvider(gethURL));
        web3._provider.on('end', (eventObj) => {
          logger.error('Websocket disconnected!! Restarting connection....');
          web3 = new Web3(new Web3.providers.WebsocketProvider(gethURL));
        });
        logger.info(`ethService.connect(): Connection to ${gethURL} established successfully!`);
        module.exports.web3 = web3;
        resolve(true);
      } else {
        logger.info(`ethService.connect(): Re-using existing connection to geth: ${gethURL}`);
        resolve(true);
      }
    } catch (e) {
      logger.error(`ethService.connect() failed with error: ${e}`);
      reject(false);
    }
  }));
}
module.exports.connect = connect;

function subscribePendingTxn() {
  logger.info('ethService.subscribePendingTxn(): Subscribing to list of pending transactions.');
  if (module.exports.connect()) {
    web3.eth.subscribe('pendingTransactions', (err, res) => {})
      .on('data', (txHash) => {
        logger.debug(`ethService.subscribePendingTxn(): received notification for txHash: ${txHash}`);
        if ((txHash !== null) && (txHash !== '')) {
          logger.debug(`ethService.subscribePendingTxn(): fetch txInfo for hash: ${txHash}`);
          web3.eth.getTransaction(txHash)
            .then((txInfo) => {
              if (txInfo !== null) {
                processTx.newPendingTran(txInfo, protocol);
              }
            })
            .catch((e) => {
              logger.error(`ethService.subscribePendingTxn() failed with error: ${e}`);
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
  if (module.exports.connect()) {
    web3.eth.subscribe('newBlockHeaders', (err, res) => {})
      .on('data', (blockHeader) => {
        if (blockHeader && blockHeader.number && blockHeader.hash) {
          logger.info(`ethService.subscribeBlockHeaders(): NEW BLOCK MINED : # ${blockHeader.number} Hash = ${blockHeader.hash}`);
          // Check for pending tx in database and update their status
          module.exports.checkPendingTx(hashMaps.pendingTx.keys(), blockHeader.number)
            .then(() => {
              if (dbServices.dbCollections) {
                dbServices.dbCollections.transactions.updateTxHistoryHeight(blockHeader.number);
              }
            });
        }
      });
  } else {
    logger.error('ethService.subscribeBlockHeaders(): Connection to geth failed!');
  }
}
module.exports.subscribeBlockHeaders = subscribeBlockHeaders;

function subscribeTransferEvents(contractAddress) {
  try {
    logger.info(`ethService.subscribeTransferEvents() subscribed to events for contract: ${contractAddress}`);
    if (module.exports.connect()) {
      if (web3.utils.isAddress(contractAddress)) {
        const ERC20SmartContractObject = new web3.eth.Contract(ERC20ABI, contractAddress);
        ERC20SmartContractObject.events.Transfer((error, result) => {
          if (!error) {
            logger.debug(`ethService: Token transfer event occurred for contract: ${contractAddress}result: ${result}`);
            processTx.checkTokenTransfer(result, contractAddress, protocol);
          } else {
            logger.error(`ethService.subscribeTransferEvents() failed: ${error}`);
          }
        });
      }
    } else {
      logger.error('ethService.subscribeTransferEvents(): Connection to geth failed!');
    }
  } catch (e) {
    logger.error(`ethService.subscribeTransferEvents() failed: ${e}`);
  }
}
module.exports.subscribeTransferEvents = subscribeTransferEvents;

function checkPendingTx(pendingTxArray, blockNumber) {
  return new Promise(((resolve, reject) => {
    if (pendingTxArray.length === 0) {
      resolve();
    } else {
      const txHash = pendingTxArray[0];
      const item = hashMaps.pendingTx.get(txHash);
      pendingTxArray.splice(0, 1);

      web3.eth.getTransaction(item.txHash)
        .then((txInfo) => {
          if (txInfo != null) {
            if (txInfo.blockNumber != null) {
              const confBlockNb = txInfo.blockNumber;
              web3.eth.getTransactionReceipt(txInfo.hash)
                .then((receipt) => {
                  if (receipt != null) {
                    if (receipt.gasUsed <= txInfo.gas) { // TX MINED
                      const nbConf = 1 + (blockNumber - confBlockNb);
                      if (nbConf >= 1) {
                        const status = 'confirmed';
                        const confBlockNumber = confBlockNb;
                        const gasUsed = receipt.gasUsed;
                        const txMsg = {
                          type: 'updateTx',
                          txHash: item.txHash,
                          confBlockNumber,
                          status,
                          gasUsed,
                        };
                        rmqServices.sendPubSubMessage(txMsg);
                        logger.info(`TRANSACTION ${item.txHash} CONFIRMED @ BLOCK # ${(blockNumber - nbConf) + 1}`);
                        hashMaps.pendingTx.delete(txHash);
                        resolve(checkPendingTx(pendingTxArray, blockNumber));
                      } else {
                        logger.info('WARNING: txInfo.blockNumber>=lastBlockNumber');
                      }
                    } else { // OUT OF GAS
                      const status = 'failed: out of gas';
                      const confBlockNumber = confBlockNb;
                      const gasUsed = receipt.gasUsed;
                      const txMsg = {
                        type: 'updateTx',
                        txHash: item.txHash,
                        confBlockNumber,
                        status,
                        gasUsed,
                      };
                      rmqServices.sendPubSubMessage(txMsg);
                      logger.info((`TRANSACTION ${item.txHash} OUT OF GAS: FAILED! (status : out of gas)`));
                      hashMaps.pendingTx.delete(txHash);
                      resolve(checkPendingTx(pendingTxArray, blockNumber));
                    }
                  } else { // TX RECEIPT NOT FOUND
                    const status = 'failed: tx receipt not found';
                    const confBlockNumber = confBlockNb;
                    const gasUsed = null;
                    // SEND UPDATED TX DATA TO SUBSCRIBER MSG QUEUE
                    const txMsg = {
                      type: 'updateTx',
                      txHash: item.txHash,
                      confBlockNumber,
                      status,
                      gasUsed,
                    };
                    rmqServices.sendPubSubMessage(txMsg);
                    logger.info(`TRANSACTION ${item.txHash}: TX RECEIPT NOT FOUND: FAILED! (status : tx receipt not found)`);
                    hashMaps.pendingTx.delete(txHash);
                    resolve(checkPendingTx(pendingTxArray, blockNumber));
                  }
                })
                .catch((e) => { reject(e); });
            } else { // TX STILL PENDING
              logger.info(`TX ${item.txHash} STILL PENDING (IN TX POOL)`);
              resolve(checkPendingTx(pendingTxArray, blockNumber));
            }
          } else { // TX INFO NOT FOUND
            const status = 'failed: tx info not found';
            const confBlockNumber = null;
            const gasUsed = null;

            // SEND UPDATED TX DATA TO SUBSCRIBER MSG QUEUE
            const txMsg = {
              type: 'updateTx',
              txHash: item.txHash,
              confBlockNumber,
              status,
              gasUsed,
            };
            rmqServices.sendPubSubMessage(txMsg);
            logger.info((`TRANSACTION ${item.txHash} NOT FOUND IN TX POOL OR BLOCKCHAIN: FAILED! (status : tx info not found)`));
            hashMaps.pendingTx.delete(txHash);
            resolve(checkPendingTx(pendingTxArray, blockNumber));
          }
        })
        .catch((e) => { reject(e); });
    }
  }));
}
module.exports.checkPendingTx = checkPendingTx;
