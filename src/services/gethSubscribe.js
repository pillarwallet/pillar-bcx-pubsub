const logger = require('../utils/logger.js');
const colors = require('colors');

const ERC20ABI = require('./ERC20ABI.json')


function subscribePendingTx(web3, bcx, processTx, dbCollections, abiDecoder, notif, channel, queue) {
  const subscribePromise = new Promise(((resolve, reject) => {
    web3.eth.subscribe('pendingTransactions', (err, res) => {})
      .on('data', (txHash) => {
        if (txHash != null) {
          bcx.getTxInfo(web3, txHash)
            .then((txInfo) => {
              if (txInfo != null) {
                processTx.newPendingTx(web3, txInfo, dbCollections, abiDecoder, notif, channel, queue);
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
    // At connection time: Check for pending Tx in TX pool which are not in DB and would not be added in TX History by dbServices.updateTxHistory
    logger.info(colors.yellow.bold('UPDATING PENDING TX IN DATABASE...\n'));
    bcx.getPendingTxArray(web3)
      .then((pendingTxArray) => {
        // CHECK IF TX ALREADY IN DB
        unknownPendingTxArray = [];
        dbCollections.ethTransactions.listDbZeroConfTx()
          .then((dbPendingTxArray) => {
            pendingTxArray.forEach((pendingTx) => {
              isDbPendingTx = false;
              dbPendingTxArray.forEach((dbPendingTx) => {
                if (pendingTx == dbPendingTx) {
                  isDbPendingTx = true;
                }
              });
              if (isDbPendingTx == false) {
                unknownPendingTxArray.push(pendingTx);
              }
            });
            processTx.processNewPendingTxArray(web3, unknownPendingTxArray, dbCollections, abiDecoder, notif, channel, queue, 0)
              .then((nbTxFound) => {
                logger.info(colors.yellow.bold(`DONE UPDATING PENDING TX IN DATABASE\n--> ${nbTxFound} transactions found\n`));
              });
          });
      });
  }));
  return (subscribePromise);
}
module.exports.subscribePendingTx = subscribePendingTx;

function subscribeBlockHeaders(web3, gethSubscribe, bcx, processTx, dbServices, dbCollections, abiDecoder, notif, channel, queue, updateTxHistory = true, updateERC20SmartContracts = true) {
  const subscribePromise = new Promise(((resolve, reject) => {
    let nbBlocksReceived = -1;
    web3.eth.subscribe('newBlockHeaders', (err, res) => {})
      .on('data', (blockHeader) => {
        if (blockHeader != null) {
          nbBlocksReceived++;
          logger.info(colors.gray(`NEW BLOCK MINED : # ${blockHeader.number} Hash = ${blockHeader.hash}\n`));
          if (nbBlocksReceived == 0) {
            if (updateTxHistory == true) {
              // Update tx History at connection time
              dbServices.updateTxHistory(web3, bcx, processTx, dbCollections, abiDecoder, notif, blockHeader.number - 1);
            }
            /*
                    if(updateERC20SmartContracts==true){
                        //Update ERC20 smart contracts at connection time
                        dbServices.updateERC20SmartContracts(web3,gethSubscribe,bcx,processTx,notif,dbCollections,blockHeader.number-1)
                    }
                    */
          }
          /*
                //NOW, @ EACH NEW BLOCK MINED:
                //Check for newly created ERC20 smart contracts
                dbServices.dlERC20SmartContracts(web3,gethSubscribe,bcx,processTx,notif,blockHeader.number,blockHeader.number,dbCollections,false)
                .then(function(){
                    //Update
                    dbCollections.smartContracts.updateERC20SmartContractsHistoryHeight(blockHeader.number)
                    .then(function(){
                        //logger.info(colors.green.bold('Highest Block Number for ERC20 Smart Contracts: '+blockHeader.number+'\n'))
                    })
                })
                */
          // Check for pending tx in database and update their status
          dbCollections.ethTransactions.listPending()
            .then((pendingTxArray) => {
              processTx.checkPendingTx(web3, bcx, dbCollections, pendingTxArray, blockHeader.number, notif, channel, queue)
                .then(() => {
                  dbCollections.ethTransactions.updateTxHistoryHeight(blockHeader.number)
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
  }));
  return (subscribePromise);
}
module.exports.subscribeBlockHeaders = subscribeBlockHeaders;

function subscribeAllDBERC20SmartContracts(web3, bcx, processTx, dbCollections, notif) {
  const subscribePromise = new Promise(((resolve, reject) => {
    dbCollections.smartContracts.listAll()
      .then((smartContractsArray) => {
        smartContractsArray.forEach((ERC20SmartContract) => {
          module.exports.subscribeERC20SmartContract(web3, bcx, dbCollections, processTx, notif, ERC20SmartContract);
        });
        logger.info(colors.green.bold('Subscribed to DB ERC20 Smart Contracts Transfer Events\n'));
        resolve();
      })
      .catch((e) => { reject(e); });
  }));
  return (subscribePromise);
}
module.exports.subscribeAllDBERC20SmartContracts = subscribeAllDBERC20SmartContracts;

function subscribeERC20SmartContract(web3, bcx, dbCollections, processTx, notif, ERC20SmartContract) {
  // var subscribePromise = new Promise(function(resolve,reject){
  try {
    if (ERC20SmartContract.address != 'address') {
      const ERC20SmartContractObject = new web3.eth.Contract(ERC20ABI, ERC20SmartContract.address);
      ERC20SmartContractObject.events.Transfer((error, result) => {
        if (!error) {
          processTx.checkTokenTransferEvent(web3, bcx, dbCollections, notif, result, ERC20SmartContract);
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

