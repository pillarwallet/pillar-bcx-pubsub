/*
Copyright (C) 2019 Stiftung Pillar Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const logger = require('../utils/logger.js');

const accounts = require('../models/accounts_model');
const mongoose = require('mongoose');

const ACCOUNTS_NUMBER_TO_FETCH = process.env.ACCOUNTS_NUMBER_TO_FETCH ? process.env.ACCOUNTS_NUMBER_TO_FETCH : 100;

function listAll() {
  return new Promise((resolve, reject) => {
    try {
      return accounts.Accounts.find((err, result) => {
        if (err) {
          logger.info(`accounts.listAll DB controller ERROR: ${err}`);
          return reject(err);
        }
        return resolve(result);
      });
    } catch (e) {
      return reject(e);
    }
  });
}
module.exports.listAll = listAll;

function listRecent(idFrom) {
  return new Promise((resolve, reject) => {
    try {
      const oId = mongoose.Types.ObjectId(idFrom);
      // accounts.Accounts.find(query, (err, result) => {
      // limit the number of results to ACCOUNTS_RECENT_FETCH records
      const q = accounts.Accounts.find({ _id: { $gt: oId } }).limit(ACCOUNTS_NUMBER_TO_FETCH);
      q.exec((err, result) => {
        if (err) {
          logger.error(`accounts.listRecent DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) {
      logger.error(`accounts.listRecent error occurred: " + ${e}`);
      reject(e);
    }
  });
}
module.exports.listRecent = listRecent;

function findByAddress(address, protocol) {
  return new Promise((resolve, reject) => {
    try {
      accounts.Accounts.findOne(
        { 'addresses.address': address, 'addresses.protocol': protocol },
        (err, result) => {
          if (err) {
            logger.info(`accounts.findByAddress DB controller ERROR: ${err}`);
            reject(err);
          }
          resolve(result);
        },
      );
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.findByAddress = findByAddress;

function findByStatus(status, protocol) {
  return new Promise((resolve, reject) => {
    try {
      accounts.Accounts.findOne(
        { 'addresses.status': status, 'addresses.protocol': protocol },
        (err, result) => {
          if (err) {
            logger.info(`accounts.findByAddress DB controller ERROR: ${err}`);
            reject(err);
          }
          resolve(result);
        },
      );
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.findByStatus = findByStatus;

function findByWalletId(pillarId) {
  return new Promise((resolve, reject) => {
    try {
      accounts.Accounts.findOne({ walletID: pillarId }, (err, result) => {
        if (err) {
          logger.info(`accounts.findByWalletId DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.findByWalletId = findByWalletId;

function addAddress(pillarId, address) {
  return new Promise((resolve, reject) => {
    try {
      const ethAddress = new accounts.Accounts({
        pillarId,
        addresses: { protocol: 'Ethereum', address: address.toUpperCase() },
      });
      ethAddress.save(err => {
        if (err) {
          logger.info(`accounts.addAddress DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.addAddress = addAddress;

function removeAddress(pillarId) {
  return new Promise((resolve, reject) => {
    try {
      accounts.Accounts.remove({ pillarId }, err => {
        if (err) {
          logger.info(`accounts.removeAddress DB controller ERROR: ${err}`);
          reject(err);
        }
        logger.info(`REMOVED ACCOUNT ${pillarId}\n`);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.removeAddress = removeAddress;

function emptyCollection() {
  return new Promise((resolve, reject) => {
    try {
      accounts.Accounts.remove((err, result) => {
        if (err) {
          logger.info(`accounts.emptyCollection DB controller ERROR: ${err}`);
          reject(err);
        }
        logger.info(
          `Removed ${result.result.n} documents from accounts database...\n`,
        );
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.emptyCollection = emptyCollection;
