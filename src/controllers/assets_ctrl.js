const colors = require('colors');
const assets = require('../models/assets_model');
const logger = require('../utils/logger.js');

function listAll() {
  return new Promise(((resolve, reject) => {
    try {
	    assets.Assets.find((err, result) => {
        if (err) {
          logger.info(`smartContracts.listAll DB controller ERROR: ${err}`);
          reject(err);
        }

        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.listAll = listAll;

function addContract(address, name, ticker, decimals) {
  return new Promise(((resolve, reject) => {
    try {
	    assets.Assets.find({
        address, name, ticker, decimals,
      }, (err, result) => {
        if (result.length === 0) {
          const smartContract = new assets.Assets({
            address, name, ticker, decimals,
          });
          smartContract.save((e) => {
            if (e) {
              logger.info(`smartContracts.addContract DB controller ERROR: ${e}`);
              reject(e);
            }
            logger.info(colors.magenta('-->added to database\n'));
            resolve();
          });
        } else {
          logger.info(colors.magenta('-->discarded (already in database)\n'));
          resolve();
        }
      })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.addContract = addContract;

function emptyCollection() {
  return new Promise(((resolve, reject) => {
    try {
	    assets.Assets.remove((err, countremoved) => {
        if (err) logger.info(`smartContracts.emptyCollection DB controller ERROR: ${err}`);
        logger.info(`Removed ${countremoved.result.n} documents from smartContracts database...\n`);
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.emptyCollection = emptyCollection;

function findByAddress(address) {
  return new Promise(((resolve, reject) => {
    try {
	    assets.Assets.findOne({ address }, (err, result) => {
        if (err) {
          logger.info(`smartContracts.findByAddress DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.findByAddress = findByAddress;

function findByTicker(ticker) {
  return new Promise(((resolve, reject) => {
    try {
	    assets.Assets.findOne({ ticker }, (err, result) => {
        if (err) {
          logger.info(`smartContracts.findByTicker DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.findByTicker = findByTicker;

function addZeroSmartContractsCreationHistoryHeight() {
  return new Promise(((resolve, reject) => {
    try {
      const zeroHeight = 2644980;
      const smartContractsCreationHistoryHeight = new assets.Assets({
        address: 'address', name: 'name', ticker: 'decimals = highest block number for ERC20 smart contracts creation history', decimals: zeroHeight,
      });
      smartContractsCreationHistoryHeight.save((err) => {
        if (err) {
          logger.info(`smartContracts.addZeroSmartContractsCreationHistoryHeight DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(zeroHeight);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.addZeroSmartContractsCreationHistoryHeight = addZeroSmartContractsCreationHistoryHeight;

function updateERC20SmartContractsHistoryHeight(blockNb) {
  return new Promise(((resolve, reject) => {
    try {
	    assets.Assets.update({ ticker: 'decimals = highest block number for ERC20 smart contracts creation history' }, { decimals: blockNb }, (err) => {
        if (err) {
          logger.info(`smartContracts.updateSmartContractsCreationHistoryHeight DB controller ERROR: ${err}`);
          reject(err);
        }
        // logger.info('Highest Block Number for Tx History updated to '+blockNb+'\n')
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.updateERC20SmartContractsHistoryHeight = updateERC20SmartContractsHistoryHeight;

function findERC20SmartContractsHistoryHeight() {
  return new Promise(((resolve, reject) => {
    try {
	    assets.Assets.find({ ticker: 'decimals = highest block number for ERC20 smart contracts creation history' }, (err, result) => {
        if (err) {
          logger.info(`smartContracts.findSmartContractsCreationHistoryHeight DB controller ERROR: ${err}`);
          reject(err);
        }
        if (result.length > 0) {
          resolve(result[0].decimals);
        } else {
          resolve('NO_ERC20_CONTRACTS_HISTORY_HEIGHT');
        }
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.findERC20SmartContractsHistoryHeight = findERC20SmartContractsHistoryHeight;
