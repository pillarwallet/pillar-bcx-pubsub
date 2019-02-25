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
const collectibles = require('../models/collectibles_model');
const logger = require('../utils/logger.js');

function hasAsset(wallet,contractAddress,tokenId) {
  return new Promise((resolve, reject) => {
    try {
      collectibles.Collectibles.find({ owner: wallet, contractAddress,tokenId }, (err, result) => {
        if (err) {
          logger.error(`collectibles.hasAsset DB controller ERROR: ${err}`);
          reject(false);
        } else {
            logger.debug(`collectibles.hasAsset - found asset ${JSON.stringify(result)}`);
            resolve(true);
        }
      });
    } catch (e) {
      logger.error(`collectibles.hasAsset error occurred: " + ${e}`);
      reject(false);
    }
  });
}
module.exports.hasAsset = hasAsset;

function exists(contractAddress,tokenId) {
    return new Promise((resolve, reject) => {
        try {
          collectibles.Collectibles.find({ contractAddress,tokenId }, (err, result) => {
            if (err) {
              logger.error(`collectibles.exists DB controller ERROR: ${err}`);
              reject(false);
            } else {
                logger.debug(`collectibles.exists - found asset ${JSON.stringify(result)}`);
                resolve(true);
            }
          });
        } catch (e) {
          logger.error(`collectibles.exists error occurred: " + ${e}`);
          reject(false);
        }
      });    
}
module.exports.exists = exists;

function add(wallet, symbol, name, contractAddress, tokenId, txHash) {
    return new Promise((resolve,reject) => {
        try {
            exists(contractAddress,tokenId).then((ret) => {
                if(!ret) {
                    logger.debug(`collectibles.Collectible - added a new collectible ${contractAddress} - ${tokenId} to wallet - ${wallet}`)
                    collectibles.Collectibles.save({owner: wallet, symbol, name, contractAddress, tokenId, txHash});
                } else {
                    hasAsset(wallet,contractAddress,tokenId).then((res) => {
                        if(!res) {
                            logger.debug(`collectibles.Collectible - added a new collectible ${contractAddress} - ${tokenId} to wallet - ${wallet}`)
                            collectibles.Collectibles.save({owner: wallet, symbol, name, contractAddress, tokenId, txHash});                            
                        } else {
                            return update(wallet,contractAddress,tokenId,txHash);
                        }
                        resolve();
                    });
                }
            });
        } catch(e) {
            reject(e);
        }
    });
}
module.exports.add = add;

function update(wallet, contractAddress, tokenId, txHash) {
    return new Promise((resolve,reject) => {
        try {
            collectibles.Collectibles.update({owner: wallet, contractAddress, tokenId, txHash});
            logger.debug('Updated collectibles');
            resolve()
        } catch(e) {
            reject(e);
        }
    });
}
module.exports.update = update;


function findByAddress(wallet) {
  return new Promise((resolve, reject) => {
    try {
      collectibles.Collectibles.find({ owner: wallet }, (err, result) => {
        if (err) {
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

function findByCollectible(contractAddress) {
  return new Promise((resolve, reject) => {
    try {
      collectibles.collectibles.find({ contractAddress }, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.findByCollectible = findByCollectible;
