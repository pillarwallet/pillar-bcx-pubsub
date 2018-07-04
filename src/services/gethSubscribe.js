const logger = require('../utils/logger.js');
const colors = require('colors');

const ERC20ABI = require('./ERC20ABI.json');

const gethConnect = require('./gethConnect.js');
const bcx = require('./bcx.js');
const processTx = require('./processTx.js');
const dbServices = require('./dbServices.js');
const hashMaps = require('../utils/hashMaps.js');


function subscribePendingTx() {
  const subscribePromise = new Promise(((resolve, reject) => {
    try {
      gethConnect.web3.eth.subscribe('pendingTransactions', (err, res) => {})
        .on('data', (txHash) => {
          if ((txHash !== null) && (txHash !== '')) {
            bcx.getTxInfo(txHash)
              .then((txInfo) => {
                if (txInfo != null) {
                  processTx.newPendingTx(txInfo);
                }
              })
              .catch((e) => { reject(e); });
          }
        })
        .on('endSubscribePendingTx', () => { // Used for testing only
          logger.info('END PENDING TX SUBSCRIBTION\n');
          resolve();
        });
      logger.info(colors.green.bold('Subscribed to Pending Tx and Smart Contract Calls\n'));
    } catch (e) {
      logger.error('gethSubscribe.subscribePendingTx() failed: ' + e);
      reject(e);
    }
  }));
  return (subscribePromise);
}
module.exports.subscribePendingTx = subscribePendingTx;

function subscribeBlockHeaders() {
  const subscribePromise = new Promise((resolve, reject) => {
    try {
      gethConnect.web3.eth.subscribe('newBlockHeaders', (err, res) => {})
        .on('data', (blockHeader) => {
          if (blockHeader && blockHeader.number && blockHeader.hash) {
            logger.info(colors.gray(`NEW BLOCK MINED : # ${blockHeader.number} Hash = ${blockHeader.hash}\n`));
            // Check for pending tx in database and update their status
            processTx.checkPendingTx(hashMaps.pendingTx.keys(), blockHeader.number)
              .then(() => {
                dbServices.dbCollections.transactions.updateTxHistoryHeight(blockHeader.number)
                  .then(() => {
                    // logger.info(colors.green.bold('Highest Block Number for Tx History: '+blockHeader.number+'\n'))
                  })
                  .catch((e) => { reject(e); });
              })
              .catch((e) => { reject(e); });
          }
        })
        .on('endSubscribeBlockHeaders', () => { // Used for testing only
          logger.info('END BLOCK HEADERS SUBSCRIBTION\n');
          resolve();
        });
      logger.info(colors.green.bold('Subscribed to Block Headers\n'));
    } catch (e) {
      logger.error('gethSubscribe.subscribeBlockHeaders() failed: ' + e);
      reject(e);
    }
  });
  return (subscribePromise);
}
module.exports.subscribeBlockHeaders = subscribeBlockHeaders;


function subscribeAllDBERC20SmartContracts() {
  try {
    const smartContractsArray = hashMaps.assets.values();
    smartContractsArray.forEach((ERC20SmartContract) => {
      module.exports.subscribeERC20SmartContract(ERC20SmartContract);
    });
    logger.info(colors.green.bold('Subscribed to DB ERC20 Smart Contracts Transfer Events\n'));
  } catch (e) {
    logger.error('gethSubscribe.subscribeAllDBERC20SmartContracts() failed: ' + e);
  }
}
module.exports.subscribeAllDBERC20SmartContracts = subscribeAllDBERC20SmartContracts;

function subscribeERC20SmartContract(ERC20SmartContract) {
  try {
    if (ERC20SmartContract.contractAddress !== 'contractAddress') {
      const ERC20SmartContractObject =
        new gethConnect.web3.eth.Contract(ERC20ABI, ERC20SmartContract.contractAddress);
      ERC20SmartContractObject.events.Transfer((error, result) => {
        if (!error) {
          processTx.checkTokenTransferEvent(result, ERC20SmartContract);
        } else {
          logger.error(error);
        }
      });
    }
  } catch (e) {
    logger.error('gethSubscribe.subscribeERC20SmartContract() failed: ' + e);
  }
}
module.exports.subscribeERC20SmartContract = subscribeERC20SmartContract;
