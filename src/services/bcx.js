const logger = require('../utils/logger.js');

function getTxInfo(web3, txHash) {
  return web3.eth.getTransaction(txHash);
}
module.exports.getTxInfo = getTxInfo;


function getBlockSmartContractsAddressesArray(web3, txHashArray, smartContractsAddressesArray, index) {
  return new Promise(((resolve, reject) => {
    try {
      if (index >= txHashArray.length) {
        resolve(smartContractsAddressesArray);
      } else {
        web3.eth.getTransactionReceipt(txHashArray[index])
          .then((txReceipt) => {
            if (txReceipt.contractAddress != null) {
              smartContractsAddressesArray.push(txReceipt.contractAddress);
            }
            resolve(getBlockSmartContractsAddressesArray(web3, txHashArray, smartContractsAddressesArray, index + 1));
          })
          .catch((e) => { reject(e); });
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.getBlockSmartContractsAddressesArray = getBlockSmartContractsAddressesArray;

function getBlockTx(web3, blockNumber) {
  return new Promise(((resolve, reject) => {
    try {
      web3.eth.getBlock(blockNumber, true)
        .then((result) => {
          // logger.info(result.transactions)
          resolve(result.transactions);
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.getBlockTx = getBlockTx;

function getBlockNumber(web3, blockHash) {
  return new Promise(((resolve, reject) => {
    try {
      web3.eth.getBlock(blockHash)
        .then((result) => {
          resolve(result.number);
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.getBlockNumber = getBlockNumber;

function getLastBlockNumber(web3) {
  return web3.eth.getBlockNumber();
}
module.exports.getLastBlockNumber = getLastBlockNumber;

function getTxReceipt(web3, txHash) {
  return web3.eth.getTransactionReceipt(txHash);
}
module.exports.getTxReceipt = getTxReceipt;

function getPendingTxArray(web3) {
  return new Promise(((resolve, reject) => {
    try {
      web3.eth.getBlock('pending', true)
        .then((result) => {
          // logger.info(result)
          resolve(result.transactions);
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.getPendingTxArray = getPendingTxArray;

function getBalance(address, asset, web3, contractAddress) {
  return new Promise(((resolve, reject) => {
    try {
      if (asset === 'ETH') {
        web3.eth.getBalance(address)
          .then((result) => {
            const ETHBalance = web3.utils.fromWei(web3.utils.toBN(result).toString(), 'ether');
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
        web3.eth.call(
          {
            to: contractAddress,
            // ERC20 token contract address,
            // used to call the token balance of the address in question
            data: callData,
            // Combination of callData and address, required to call the balance of an address
          },
          (err, result) => {
            if (result) {
              const tokenBalance = web3.utils.fromWei(web3.utils.toBN(result).toString(), 'ether');
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
