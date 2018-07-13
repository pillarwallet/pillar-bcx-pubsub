
const logger = require('../utils/logger.js');

const accounts = require('../models/accounts_model');
const mongoose = require('mongoose');

function listAll() {
  return new Promise((resolve, reject) => {
    try {
      accounts.Accounts.find((err, result) => {
        if (err) {
          logger.info(`accounts.listAll DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  });
}
module.exports.listAll = listAll;

function listRecent(idFrom) {
  return new Promise(((resolve, reject) => {
    try {
      oId = mongoose.Types.ObjectId(idFrom);
      var query = "{_id : {$gt: " + oId + ")}}";
      //accounts.Accounts.find(query, (err, result) => {
      accounts.Accounts.find({_id : {$gt: oId}}, (err, result) => {
        if(err) {
          logger.error(`accounts.listRecent DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch(e) {
      logger.error(`accounts.listRecent error occurred: " + ${e}`);
      reject(e);
  }}));
}
module.exports.listRecent = listRecent;

function findByAddress(address) {
  return new Promise(((resolve, reject) => {
    try {
      accounts.Accounts.findOne({ addresses: { $elemMatch: { protocol: 'Ethereum', address } } }, (err, result) => {
        if (err) {
          logger.info(`accounts.findByAddress DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.findByAddress = findByAddress;

function findByWalletId(pillarId) {
  return new Promise(((resolve, reject) => {
    try {
      accounts.Accounts.findOne({ pillarId: pillarId }, (err, result) => {
        if (err) {
          logger.info(`accounts.findByWalletId DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.findByWalletId = findByWalletId;

function addAddress(pillarId, address) {
  return new Promise(((resolve, reject) => {
    try {
      const ethAddress
        = new accounts.Accounts({ pillarId, addresses: { protocol: 'Ethereum', address: address.toUpperCase() } });
      ethAddress.save((err) => {
        if (err) {
          logger.info(`accounts.addAddress DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.addAddress = addAddress;


function removeAddress(pillarId) {
  return new Promise(((resolve, reject) => {
    try {
      accounts.Accounts.remove({ pillarId }, (err) => {
        if (err) {
          logger.info(`accounts.removeAddress DB controller ERROR: ${err}`);
          reject(err);
        }
        logger.info(`REMOVED ACCOUNT ${pillarId}\n`);
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.removeAddress = removeAddress;

/*
function updateFCMIID(pwalletID, newFCMIID) {
  return new Promise(((resolve, reject) => {
    try {
      accounts.Accounts.find({ walletID }, (err, result) => {
        if (err) {
          logger.info(`accounts.updateFCMIID DB controller ERROR: ${err}`);
          reject(err);
        }
        if (result.length === 0) {
          reject(new Error('Invalid wallet Id'));
        } else {
          accounts.accounts.update(
            { walletID },
            { FCMIID: newFCMIID },
            (error) => {
              if (error) {
                logger.info(`accounts.updateFCMIID DB controller ERROR: ${error}`);
                reject(error);
              }
              logger.info(`UPDATED FCM INSTANCE ID FOR ACCOUNT ${walletID}\n`);
              resolve();
            },
          );
        }
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.updateFCMIID = updateFCMIID;
*/

function emptyCollection() {
  return new Promise(((resolve, reject) => {
    try {
      accounts.Accounts.remove((err, result) => {
        if (err) {
          logger.info(`accounts.emptyCollection DB controller ERROR: ${err}`);
          reject(err);
        }
        logger.info(`Removed ${result.result.n} documents from accounts database...\n`);
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.emptyCollection = emptyCollection;

/*
function getFCMIID(publicAddress) {
  return new Promise(((resolve, reject) => {
    try {
      accounts.Accounts.find({ address: publicAddress.toUpperCase() }, (err, result) => {
        if (err) {
          logger.info(`accounts.getFCMIID DB controller ERROR: ${err}`);
          reject(err);
        }
        if (result.length > 0) { resolve(result[0].FCMIID); } else { resolve('FCMIID_not_found'); }
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.getFCMIID = getFCMIID;
*/
