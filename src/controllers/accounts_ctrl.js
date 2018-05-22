const accounts = require('../models/accounts_model');

function listAll() {
  return new Promise(((resolve, reject) => {
    try {
      accounts.Accounts.find((err, result) => {
        if (err) {
          console.log(`ethaddresses.listAll DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.listAll = listAll;

function findByAddress(address) {
  return new Promise(((resolve, reject) => {
    try {
	    accounts.Accounts.findOne({ address }, (err, result) => {
        if (err) {
          console.log(`ethaddresses.findByAddress DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.findByAddress = findByAddress;

function findByWalletId(walletId) {
  return new Promise(((resolve, reject) => {
    try {
	    accounts.Accounts.findOne({ walletID: walletId }, (err, result) => {
        if (err) {
          console.log(`ethAddresses.findByWalletId DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.findByWalletId = findByWalletId;

function addAddress(walletID, address, FCMIID) {
  return new Promise(((resolve, reject) => {
    try {
      const ethAddress
        = new accounts.Accounts({ walletID, address: address.toUpperCase(), FCMIID });
      ethAddress.save((err) => {
        if (err) {
          console.log(`EthAddresses.addAddress DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.addAddress = addAddress;


function removeAddress(walletID) {
  return new Promise(((resolve, reject) => {
    try {
	    accounts.Accounts.remove({ walletID }, (err) => {
        if (err) {
          console.log(`EthAddresses.removeAddress DB controller ERROR: ${err}`);
          reject(err);
        }
        console.log(`REMOVED ACCOUNT ${walletID}\n`);
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.removeAddress = removeAddress;


function updateFCMIID(walletID, newFCMIID) {
  return new Promise(((resolve, reject) => {
    try {
	    accounts.Accounts.find({ walletID }, (err, result) => {
        if (err) {
          console.log(`ethaddresses.updateFCMIID DB controller ERROR: ${err}`);
          reject(err);
        }
        if (result.length === 0) {
          reject(new Error('Invalid wallet Id'));
        } else {
	        accounts.Accounts.update(
            { walletID },
            { FCMIID: newFCMIID },
            (e) => {
              if (e) {
                console.log(`EthAddresses.updateFCMIID DB controller ERROR: ${e}`);
                reject(err);
              }
              console.log(`UPDATED FCM INSTANCE ID FOR ACCOUNT ${walletID}\n`);
              resolve();
            },
          );
        }
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.updateFCMIID = updateFCMIID;


function emptyCollection() {
  return new Promise(((resolve, reject) => {
    try {
	    accounts.Accounts.remove((err, countremoved) => {
        if (err) {
          console.log(`EthAddresses.emptyCollection DB controller ERROR: ${err}`);
          reject(err);
        }
        console.log(`Removed ${countremoved.result.n} documents from ethAddresses database...\n`);
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.emptyCollection = emptyCollection;


function getFCMIID(publicAddress) {
  return new Promise(((resolve, reject) => {
    try {
	    accounts.Accounts.find({ address: publicAddress.toUpperCase() }, (err, result) => {
        if (err) {
          console.log(`EthAddresses.getFCMIID DB controller ERROR: ${err}`);
          reject(err);
        }
        if (result.length > 0) { resolve(result[0].FCMIID); } else { resolve('FCMIID_not_found'); }
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.getFCMIID = getFCMIID;

