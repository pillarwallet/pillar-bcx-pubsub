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
const transactions = require('../models/transactions_model');
const logger = require('../utils/logger.js');

function handleError(err) {
  if (err) {
    throw new Error(err);
  }
}

const txHistorySort = (a, b) => a.timestamp < b.timestamp;

function listAll() {
  return new Promise((resolve, reject) => {
    try {
      return transactions.Transactions.find((err, result) => {
        if (err) {
          logger.error(`transactions.listAll DB controller ERROR: ${err}`);
          return reject(err);
        }
        return resolve(result);
      });
    } catch (e) {
      logger.error(`transaction_ctrl.listAll(): failed with error: ${e}`);
      return reject(e);
    }
  });
}
module.exports.listAll = listAll;

function listPending(protocol) {
  logger.debug(`transactions_ctrl.listPending(): for protocol: ${protocol}`);
  return new Promise((resolve, reject) => {
    try {
      transactions.Transactions.find({ protocol, status: 'pending' }).then(
        result => {
          logger.debug(
            `transactions_ctrl.listPending(): fetching ${
              result.length
            } records`,
          );
          resolve(result);
        },
      );
    } catch (e) {
      logger.error(`transaction_ctrl.listPending(): failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.listPending = listPending;

function listHistory() {
  return new Promise((resolve, reject) => {
    try {
      transactions.Transactions.find({ status: 'history' }, (err, result) => {
        if (err) {
          logger.error(`transactions.listHistory DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) {
      logger.error(`transaction_ctrl.listHistory(): failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.listHistory = listHistory;

function listDbZeroConfTx() {
  return new Promise((resolve, reject) => {
    try {
      transactions.Transactions.find(
        { nbConfirmations: 0, status: 'pending' },
        (err, result) => {
          if (err) {
            logger.error(
              `transactions.listDBZeroConfTx DB controller ERROR: ${err}`,
            );
            reject(err);
          }
          resolve(result);
        },
      );
    } catch (e) {
      logger.error(
        `transaction_ctrl.listDbZeroConfTx(): failed with error: ${e}`,
      );
      reject(e);
    }
  });
}
module.exports.listDbZeroConfTx = listDbZeroConfTx;

function findById(id) {
  return new Promise((resolve, reject) => {
    try {
      transactions.Transactions.findOne({ _id: id }, (err, result) => {
        if (err) {
          logger.error(`transactions.findById DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) {
      logger.error(`transaction_ctrl.findById(): failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.findById = findById;

function findByTxHash(txHash) {
  return new Promise((resolve, reject) => {
    try {
      transactions.Transactions.find({ txHash }, (err, result) => {
        if (err) {
          logger.error(`transactions.findByTxHash DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) {
      logger.error(`transaction_ctrl.findByTxHash(): failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.findByTxHash = findByTxHash;

function findOneByTxHash(txHash) {
  return new Promise((resolve, reject) => {
    transactions.Transactions.findOne({ txHash }, (err, result) => {
      if (err) {
        logger.error(`transactions.findByTxHash DB controller ERROR: ${err}`);
        reject(err);
      }
      resolve(result);
    });
  });
}

module.exports.findOneByTxHash = findOneByTxHash;

function addTx(txObject) {
  return new Promise((resolve, reject) => {
    try {
      const tx = new transactions.Transactions(txObject);
      tx.save(err => {
        if (err) {
          logger.error(`transactions.addTx DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve();
      });
    } catch (e) {
      logger.error(`transaction_ctrl.addTx(): failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.addTx = addTx;

function updateTx(txUpdatedKeys) {
  return new Promise((resolve, reject) => {
    try {
      findByTxHash(txUpdatedKeys.txHash).then(result => {
        result.forEach(tx => {
          transactions.Transactions.update(
            { _id: tx._id },
            txUpdatedKeys,
            handleError,
          );
        });
        resolve();
      });
    } catch (e) {
      logger.error(`transaction_ctrl.updateTx(): failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.updateTx = updateTx;

function txFailed(id, failureStatus) {
  return new Promise((resolve, reject) => {
    try {
      transactions.Transactions.update(
        { _id: id },
        { status: failureStatus },
        err => {
          if (err) {
            logger.error(`transactions.txFailed DB controller ERROR: ${err}`);
            reject(err);
          }
          resolve();
        },
      );
    } catch (e) {
      logger.error(`transaction_ctrl.txFailed(): failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.txFailed = txFailed;

function emptyCollection() {
  return new Promise((resolve, reject) => {
    try {
      transactions.Transactions.remove((err, countremoved) => {
        if (err) {
          logger.error(
            `transactions.emptyCollection DB controller ERROR: ${err}`,
          );
          reject(err);
        }
        logger.info(
          `Removed ${
            countremoved.result.n
          } documents from transactions database...\n`,
        );
        resolve();
      });
    } catch (e) {
      logger.error(
        `transaction_ctrl.emptyCollection(): failed with error: ${e}`,
      );
      reject(e);
    }
  });
}
module.exports.emptyCollection = emptyCollection;

function findMaxBlock(protocol, asset = null) {
  logger.debug(
    `transactions_ctrl.findMaxBlock(): Fetching maxBlock for ${protocol} asset: ${asset}`,
  );
  return new Promise((resolve, reject) => {
    try {
      if (asset === null) {
        transactions.Transactions.find({ protocol, blockNumber: { $ne: null } })
          .sort({ blockNumber: -1 })
          .limit(1)
          .then(maxBlock => {
            if (
              maxBlock !== undefined &&
              maxBlock !== '' &&
              maxBlock.blockNumber !== undefined
            ) {
              logger.debug(`Transactions.findMaxBlock(): ${maxBlock}`);
              resolve(maxBlock.blockNumber);
            } else {
              reject();
            }
          });
      } else {
        transactions.Transactions.find({
          protocol,
          asset,
          blockNumber: { $ne: null },
        })
          .sort({ blockNumber: -1 })
          .limit(1)
          .then(maxBlock => {
            if (maxBlock.length === 0) {
              resolve(0);
            } else {
              logger.debug(`Transactions.findMaxBlock(): ${maxBlock.length}`);
              resolve(maxBlock.blockNumber);
            }
          });
      }
    } catch (e) {
      logger.error(`transactions_ctrl.findMaxBlock() failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.findMaxBlock = findMaxBlock;

function getBalance(address, asset) {
  return new Promise((resolve, reject) => {
    let toBalance = 0;
    let fromBalance = 0;
    try {
      transactions.Transactions.aggregate(
        [
          {
            $match: {
              to: address.toUpperCase(),
              asset,
              status: 'confirmed',
            },
          },
          {
            $group: {
              _id: null,
              balance: { $sum: '$value' },
            },
          },
        ],
        (err, result) => {
          if (err) {
            reject(err);
          }
          if (result[0]) {
            toBalance = result[0].balance;
          }
          transactions.Transactions.aggregate(
            [
              {
                $match: {
                  $or: [
                    {
                      from: address.toUpperCase(),
                      asset,
                      status: 'pending',
                    },
                    {
                      from: address.toUpperCase(),
                      asset,
                      status: 'confirmed',
                    },
                  ],
                },
              },
              {
                $group: {
                  _id: null,
                  balance: { $sum: '$value' },
                },
              },
            ],
            (e, res) => {
              if (e) {
                reject(e);
              }
              if (res[0]) {
                fromBalance = res[0].balance;
              }
              resolve(toBalance - fromBalance);
            },
          );
        },
      );
    } catch (e) {
      logger.error(`transaction_ctrl.getBalance(): failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.getBalance = getBalance;

function getTxHistory(address1, address2, asset, fromIndex, endIndex) {
  return new Promise((resolve, reject) => {
    try {
      let txHistoryTo;
      let txHistoryFrom;
      let txHistory;
      // logger.info('transactions CTRL GET TX HISTORY')
      if (address2 === 'ALL' && asset === 'ALL') {
        transactions.Transactions.find({ to: address1 }, (err, result) => {
          if (err) {
            logger.error(
              `transactions.getTxHistory DB controller ERROR (1): ${err}`,
            );
            reject(err);
          } else {
            txHistoryTo = result;
            transactions.Transactions.find({ from: address1 }, (e, res) => {
              if (e) {
                logger.error(
                  `transactions.getTxHistory DB controller ERROR (2): ${e}`,
                );
                reject(e);
              } else {
                txHistoryFrom = res;
                txHistory = txHistoryTo.concat(txHistoryFrom);

                txHistory.sort(txHistorySort);
                resolve({
                  txHistory: txHistory.slice(fromIndex, endIndex),
                  txCount: txHistory.length,
                });
              }
            });
          }
        });
      } else if (address2 === 'ALL' && asset !== 'ALL') {
        transactions.Transactions.find(
          { to: address1, asset },
          (err, result) => {
            if (err) {
              logger.error(
                `transactions.getTxHistory DB controller ERROR (1): ${err}`,
              );
              reject(err);
            } else {
              txHistoryTo = result;
              transactions.Transactions.find(
                { from: address1, asset },
                (e, res) => {
                  if (e) {
                    logger.error(
                      `transactions.getTxHistory DB controller ERROR (2): ${e}`,
                    );
                    reject(e);
                  } else {
                    txHistoryFrom = res;
                    txHistory = txHistoryTo.concat(txHistoryFrom);

                    txHistory.sort(txHistorySort);
                    resolve({
                      txHistory: txHistory.slice(fromIndex, endIndex),
                      txCount: txHistory.length,
                    });
                  }
                },
              );
            }
          },
        );
      } else if (address2 !== 'ALL') {
        if (asset === 'ALL') {
          transactions.Transactions.find(
            { to: address1, from: address2 },
            (err, result) => {
              if (err) {
                logger.error(
                  `transactions.getTxHistory DB controller ERROR (1): ${err}`,
                );
                reject(err);
              } else {
                txHistoryTo = result;
                transactions.Transactions.find(
                  { to: address2, from: address1 },
                  (e, res) => {
                    if (err) {
                      logger.error(
                        `transactions.getTxHistory DB controller ERROR (2): ${e}`,
                      );
                      reject(e);
                    } else {
                      txHistoryFrom = res;
                      txHistory = txHistoryTo.concat(txHistoryFrom);

                      txHistory.sort(txHistorySort);
                      resolve({
                        txHistory: txHistory.slice(fromIndex, endIndex),
                        txCount: txHistory.length,
                      });
                    }
                  },
                );
              }
            },
          );
        } else {
          transactions.Transactions.find(
            { to: address1, from: address2, asset },
            (err, result) => {
              if (err) {
                logger.error(
                  `transactions.getTxHistory DB controller ERROR (1): ${err}`,
                );
                reject(err);
              } else {
                txHistoryTo = result;
                transactions.Transactions.find(
                  { to: address2, from: address1, asset },
                  (e, res) => {
                    if (e) {
                      logger.error(
                        `transactions.getTxHistory DB controller ERROR (2): ${e}`,
                      );
                      reject(e);
                    } else {
                      txHistoryFrom = res;
                      txHistory = txHistoryTo.concat(txHistoryFrom);
                      txHistory.sort(txHistorySort);
                      resolve({
                        txHistory: txHistory.slice(fromIndex, endIndex),
                        txCount: txHistory.length,
                      });
                    }
                  },
                );
              }
            },
          );
        }
      }
    } catch (e) {
      logger.error(`transaction_ctrl.getTxHistory(): failed with error: ${e}`);
      reject(e);
    }
  });
}
module.exports.getTxHistory = getTxHistory;
