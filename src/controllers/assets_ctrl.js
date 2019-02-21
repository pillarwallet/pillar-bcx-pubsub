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
const assets = require('../models/assets_model');
const logger = require('../utils/logger.js');
const mongoose = require('mongoose');

function listAll() {
  return new Promise((resolve, reject) => {
    try {
      assets.Assets.find((err, result) => {
        if (err) {
          logger.info(`smartContracts.listAll DB controller ERROR: ${err}`);
          reject(err);
        }

        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.listAll = listAll;

function listAssets(protocol) {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(
        `assets_ctrl.listAssets(): Finding assets for protocol: ${protocol}`,
      );
      assets.Assets.find({ protocol }).then(result => {
        logger.debug(
          `assets_ctrl.listAssets(): Found : ${result.length} records`,
        );
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.listAssets = listAssets;

function listRecent(idFrom) {
  return new Promise((resolve, reject) => {
    try {
      oId = mongoose.Types.ObjectId(idFrom);
      // console.log("Query: ",query);
      // accounts.Accounts.find(query, (err, result) => {
      assets.Assets.find({ _id: { $gt: oId } }, (err, result) => {
        if (err) {
          logger.error(`assets.listRecent DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) {
      logger.error(`assets.listRecent error occurred: " + ${e}`);
      reject(e);
    }
  });
}
module.exports.listRecent = listRecent;

function addContract(ERC20SmartContract) {
  return new Promise((resolve, reject) => {
    try {
      assets.Assets.find(ERC20SmartContract, (err, result) => {
        if (result.length === 0) {
          const smartContract = new assets.Assets(ERC20SmartContract);
          smartContract.save(e => {
            if (e) {
              logger.info(
                `smartContracts.addContract DB controller ERROR: ${e}`,
              );
              reject(e);
            }
            logger.info('-->added to database');
            resolve();
          });
        } else {
          logger.info('-->discarded (already in database)');
          resolve();
        }
      }).catch(e => {
        reject(e);
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.addContract = addContract;

function emptyCollection() {
  return new Promise((resolve, reject) => {
    try {
      assets.Assets.remove((err, countremoved) => {
        if (err)
          logger.info(
            `smartContracts.emptyCollection DB controller ERROR: ${err}`,
          );
        logger.info(
          `Removed ${
            countremoved.result.n
          } documents from smartContracts database...\n`,
        );
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.emptyCollection = emptyCollection;

function findByAddress(contractAddress) {
  return new Promise((resolve, reject) => {
    try {
      assets.Assets.findOne({ contractAddress }, (err, result) => {
        if (err) {
          logger.info(
            `smartContracts.findByAddress DB controller ERROR: ${err}`,
          );
          reject(err);
        }
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.findByAddress = findByAddress;

function findByTicker(ticker) {
  return new Promise((resolve, reject) => {
    try {
      assets.Assets.findOne({ symbol: ticker }, (err, result) => {
        if (err) {
          logger.info(
            `smartContracts.findByTicker DB controller ERROR: ${err}`,
          );
          reject(err);
        }
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.findByTicker = findByTicker;
