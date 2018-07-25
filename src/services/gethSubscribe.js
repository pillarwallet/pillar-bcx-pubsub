const logger = require('../utils/logger.js');
const colors = require('colors');

const ERC20ABI = require('./ERC20ABI.json');

const gethConnect = require('./gethConnect.js');
const bcx = require('./bcx.js');
const processTx = require('./processTx.js');
const dbServices = require('./dbServices.js');
const hashMaps = require('../utils/hashMaps.js');
const protocol = 'Ethereum';

function subscribePendingTx() {
  logger.info('Publisher subscribing to pending transactions.');
  const subscribePromise = new Promise(((resolve, reject) => {
    try {
      gethConnect.gethConnectDisplay().then(function() {
        gethConnect.web3.eth.subscribe('pendingTransactions', (err, res) => {})
          .on('data', (txHash) => {
            logger.debug('gethSubscribe: received notification for txHash: ' + txHash);
            if ((txHash !== null) && (txHash !== '')) {
              logger.debug('gethSubscribe: fetch txInfo for hash: ' + txHash);
              bcx.getTxInfo(txHash)
                .then((txInfo) => {
                  if (txInfo != null) {
                    //processTx.newPendingTx(txInfo);
                    processTx.newPendingTran(txInfo,protocol);
                  }
                })
                .catch((e) => { reject(e); });
            }
          })
          .on('endSubscribePendingTx', () => { // Used for testing only
            logger.info('END PENDING TX SUBSCRIBTION\n');
            resolve();
          });
        logger.info('Subscribed to Pending Tx and Smart Contract Calls');
      });
    } catch (e) {
      logger.error(`gethSubscribe.subscribePendingTx() failed: ${e}`);
      reject(e);
    }
  }));
  return (subscribePromise);
}
module.exports.subscribePendingTx = subscribePendingTx;

function subscribeBlockHeaders() {
  logger.info('Publisher subscribing to block headers.');
  const subscribePromise = new Promise((resolve, reject) => {
    try {
      gethConnect.web3.eth.subscribe('newBlockHeaders', (err, res) => {})
        .on('data', (blockHeader) => {
          if (blockHeader && blockHeader.number && blockHeader.hash) {
            logger.info(`NEW BLOCK MINED : # ${blockHeader.number} Hash = ${blockHeader.hash}`);
            // Check for pending tx in database and update their status
            processTx.checkPendingTx(hashMaps.pendingTx.keys(), blockHeader.number)
              .then(() => {
                if (dbServices.dbCollections) {
                  dbServices.dbCollections.transactions.updateTxHistoryHeight(blockHeader.number);
                }
              })
              .catch(e => reject(e));
          }
        })
        .on('endSubscribeBlockHeaders', () => { // Used for testing only
          logger.info('END BLOCK HEADERS SUBSCRIBTION');
          resolve();
        });
      logger.info('Subscribed to Block Headers');
    } catch (e) {
      logger.error(`gethSubscribe.subscribeBlockHeaders() failed: ${e}`);
      reject(e);
    }
  });
  return (subscribePromise);
}
module.exports.subscribeBlockHeaders = subscribeBlockHeaders;


function subscribeAllDBERC20SmartContracts() {
  try {
    logger.info('Publisher subscribing to ERC20 events.');
    const smartContractsArray = hashMaps.assets.values();
    smartContractsArray.forEach((ERC20SmartContract) => {
      module.exports.subscribeERC20SmartContract(ERC20SmartContract);
    });
    logger.info('Subscribed to DB ERC20 Smart Contracts Transfer Events');
  } catch (e) {
    logger.error('gethSubscribe.subscribeAllDBERC20SmartContracts() failed: ' + e);
  }
}
module.exports.subscribeAllDBERC20SmartContracts = subscribeAllDBERC20SmartContracts;

function subscribeERC20SmartContract(ERC20SmartContract) {
  try {
    logger.info('gethSubscribe.subscribeERC20SmartContract() subscribed to events for contract: ' + ERC20SmartContract.contractAddress);
    if (ERC20SmartContract.contractAddress !== 'contractAddress') {
      const ERC20SmartContractObject = new gethConnect.web3.eth.Contract(ERC20ABI, ERC20SmartContract.contractAddress);
      ERC20SmartContractObject.events.Transfer((error, result) => {
        if (!error) {
          logger.debug('gethSubscribe: Token transfer event occurred for contract: ' + ERC20SmartContract.contractAddress);
          processTx.checkTokenTransferEvent(result, ERC20SmartContract);
        } else {
          logger.error('gethSubscribe.subscribeERC20SmartContract() failed: ' + error);
        }
      });
    }
  } catch (e) {
    logger.error('gethSubscribe.subscribeERC20SmartContract() failed: ' + e);
  }
}
module.exports.subscribeERC20SmartContract = subscribeERC20SmartContract;
