const logger = require('../utils/logger.js');
const colors = require('colors');

const ERC20ABI = require('./ERC20ABI.json');


function subscribePendingTx(web3, bcx, processTx, accounts, assets, abiDecoder, channel, queue, rmqServices) {
  const subscribePromise = new Promise(((resolve, reject) => {
    web3.eth.subscribe('pendingTransactions', (err, res) => {})
      .on('data', (txHash) => {
        if (txHash != null) {
          bcx.getTxInfo(web3, txHash)
            .then((txInfo) => {
              if (txInfo != null) {
		              processTx.newPendingTx(web3, txInfo, accounts, assets, abiDecoder, channel, queue, rmqServices);
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
  }));
  return (subscribePromise);
}
module.exports.subscribePendingTx = subscribePendingTx;

function subscribeBlockHeaders(web3, gethSubscribe, bcx, processTx, dbServices, dbCollections, abiDecoder, channel, queue, rmqServices) {
  const subscribePromise = new Promise((resolve, reject) => {
  	web3.eth.subscribe('newBlockHeaders', (err, res) => {})
	  .on('data', (blockHeader) => {
		  if (blockHeader && blockHeader.number && blockHeader.hash) {
			  //  nbBlocksReceived++;
			  logger.info(colors.gray(`NEW BLOCK MINED : # ${blockHeader.number} Hash = ${blockHeader.hash}\n`));
			  // Check for pending tx in database and update their status
			  dbCollections.transactions.listPending()
			  .then((pendingTxArray) => {
				  processTx.checkPendingTx(web3, bcx, pendingTxArray, blockHeader.number, channel, queue, rmqServices)
				  .then(() => {
					  dbCollections.transactions.updateTxHistoryHeight(blockHeader.number)
					  .then(() => {
						  // logger.info(colors.green.bold('Highest Block Number for Tx History: '+blockHeader.number+'\n'))
					  })
					  .catch((e) => { reject(e); });
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
  });
  return (subscribePromise);
}
module.exports.subscribeBlockHeaders = subscribeBlockHeaders;

/*
function checkNewERC20SmartContracts(web3, gethSubscribe, bcx, processTx, dbServices, dbCollections) {
	// CHECKS FOR NEW ERC20 SMART CONTRACTS PUBLISHED @ EACH NEW BLOCK
  const subscribePromise = new Promise((resolve, reject) => {
    // let nbBlocksReceived = -1;
    web3.eth.subscribe('newBlockHeaders', (err, res) => {})
      .on('data', (blockHeader) => {
        if (blockHeader != null) {
          //  nbBlocksReceived++;
          logger.info(colors.gray(`NEW BLOCK MINED : # ${blockHeader.number} Hash = ${blockHeader.hash}\n`));
          // NOW, @ EACH NEW BLOCK MINED:
          // Check for newly created ERC20 smart contracts
          dbServices.dlERC20SmartContracts(web3, gethSubscribe, bcx, processTx, blockHeader.number, blockHeader.number, dbCollections, false)
            .then(() => {
              // Update
              dbCollections.assets.updateERC20SmartContractsHistoryHeight(blockHeader.number)
                .then(() => {
                  // logger.info(colors.green.bold('Highest Block Number for ERC20 Smart Contracts: '+blockHeader.number+'\n'))
                });
            });
        }
      })
      .on('endSubscribeBlockHeaders', () => { // Used for testing only
        logger.info('END BLOCK HEADERS SUBSCRIBTION\n');
        resolve();
      });
    logger.info(colors.green.bold('Subscribed to Block Headers\n'));
  });
  return (subscribePromise);
}
module.exports.checkNewERC20SmartContracts = checkNewERC20SmartContracts;
*/

function subscribeAllDBERC20SmartContracts(web3, bcx, processTx, accounts, assets, dbCollections, channel, queue, rmqServices) {
  const subscribePromise = new Promise(((resolve, reject) => {
    dbCollections.assets.listAll()
      .then((smartContractsArray) => {
        smartContractsArray.forEach((ERC20SmartContract) => {
          module.exports.subscribeERC20SmartContract(web3, bcx, dbCollections, processTx, channel, queue, rmqServices, ERC20SmartContract);
        });
        logger.info(colors.green.bold('Subscribed to DB ERC20 Smart Contracts Transfer Events\n'));
        resolve();
      })
      .catch((e) => { reject(e); });
  }));
  return (subscribePromise);
}
module.exports.subscribeAllDBERC20SmartContracts = subscribeAllDBERC20SmartContracts;

function subscribeERC20SmartContract(web3, bcx, accounts, assets, dbCollections, processTx, channel, queue, rmqServices, ERC20SmartContract) {
// var subscribePromise = new Promise(function(resolve,reject){
  try {
    if (ERC20SmartContract.contractAddress !== 'contractAddress') {
      const ERC20SmartContractObject = new web3.eth.Contract(ERC20ABI, ERC20SmartContract.contractAddress);
      ERC20SmartContractObject.events.Transfer((error, result) => {
        if (!error) {
          processTx.checkTokenTransferEvent(web3, bcx, accounts, assets, dbCollections, channel, queue, rmqServices, result, ERC20SmartContract);
        } else {
          logger.info(error);
        }
      });
    }
  } catch (e) { logger.info(e); }
// })
// return(subscribePromise)
}
module.exports.subscribeERC20SmartContract = subscribeERC20SmartContract;

