const logger = require('../utils/logger.js');
const gethConnect = require('./gethConnect.js');


function getTxInfo(txHash) {
  try {
    return gethConnect.web3.eth.getTransaction(txHash);
  }catch(e) {
    logger.error('Invalid transaction hash: ' + txHash);
    return;
  }
}
module.exports.getTxInfo = getTxInfo;


function getBlockSmartContractsAddressesArray(txHashArray, smartContractsAddressesArray, index) {
  return new Promise(((resolve, reject) => {
    try {
      if (index >= txHashArray.length) {
        resolve(smartContractsAddressesArray);
      } else {
        gethConnect.web3.eth.getTransactionReceipt(txHashArray[index])
          .then((txReceipt) => {
            if (txReceipt && txReceipt.contractAddress != null) {
              smartContractsAddressesArray.push(txReceipt.contractAddress);
            }
            resolve(getBlockSmartContractsAddressesArray(
              txHashArray, smartContractsAddressesArray, index + 1,
            ));
          })
          .catch((e) => { reject(e); });
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.getBlockSmartContractsAddressesArray = getBlockSmartContractsAddressesArray;

function getBlockTx(blockNumber) {
  return new Promise(((resolve, reject) => {
    try {
      gethConnect.web3.eth.getBlock(blockNumber, true)
        .then((result) => {
          // logger.info(result.transactions)
          if (result) {
            resolve(result.transactions);
          } else {
            reject('bcx.getBlockTx Error: WRONG BLOCK NUMBER PROVIDED');
          }
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.getBlockTx = getBlockTx;

function getBlockNumber(blockHash) {
  return new Promise(((resolve, reject) => {
    try {
      gethConnect.web3.eth.getBlock(blockHash)
        .then((result) => {
          resolve(result.number);
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.getBlockNumber = getBlockNumber;

function getLastBlockNumber() {
  return gethConnect.web3.eth.getBlockNumber();
}
module.exports.getLastBlockNumber = getLastBlockNumber;

function getTxReceipt(txHash) {
  return gethConnect.web3.eth.getTransactionReceipt(txHash);
}
module.exports.getTxReceipt = getTxReceipt;

function getPendingTxArray() {
  return new Promise(((resolve, reject) => {
    try {
      gethConnect.web3.eth.getBlock('pending', true)
        .then((result) => {
          // logger.info(result)
          resolve(result.transactions);
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.getPendingTxArray = getPendingTxArray;

function getBalance(address, asset, contractAddress) {
  return new Promise(((resolve, reject) => {
    try {
      if (asset === 'ETH') {
        gethConnect.web3.eth.getBalance(address)
          .then((result) => {
            const ETHBalance = gethConnect.web3.utils.fromWei(gethConnect.web3.utils.toBN(result).toString(), 'ether');
            logger.info(`WEB3 ${asset} BALANCE = ${ETHBalance}`);
            resolve(ETHBalance);
          })
          .catch((e) => { reject(e); });
      } else {
        if (!contractAddress) {
          reject(new Error('Missing ERC20 contract address'));
        }
        const addr = (address).substring(2);
        const callData = (`0x70a08231000000000000000000000000${addr}`);
        gethConnect.web3.eth.call(
          {
            to: contractAddress,
            // ERC20 token contract address,
            // used to call the token balance of the address in question
            data: callData,
            // Combination of callData and address, required to call the balance of an address
          },
          (err, result) => {
            if (result) {
              const tokenBalance = gethConnect.web3.utils.fromWei(gethConnect.web3.utils.toBN(result).toString(), 'ether');
              // logger.info('WEB3 '+asset+ 'TOKEN BALANCE = ' + tokenBalance+'\n')
              resolve(tokenBalance);
            } else {
              logger.info(err); // Dump errors here
              reject(err);
            }
          },
        );
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.getBalance = getBalance;
