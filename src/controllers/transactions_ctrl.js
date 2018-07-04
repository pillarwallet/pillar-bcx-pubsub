const transactions = require('../models/transactions_model');
const logger = require('../utils/logger.js');

function listAll() {
  return new Promise(((resolve, reject) => {
    transactions.Transactions.find((err, result) => {
      if (err) {
        logger.info(`transactions.listAll DB controller ERROR: ${err}`);
        reject(err);
      }
      return resolve(result);
    });
  }));
}

module.exports.listAll = listAll;

function listPending() {
  return new Promise(((resolve, reject) => {
    transactions.Transactions.find({ status: 'pending' }, (err, result) => {
      if (err) {
        logger.info(`transactions.listPending DB controller ERROR: ${err}`);
        reject(err);
      }
      resolve(result);
    });
  }));
}

module.exports.listPending = listPending;

function listHistory() {
  return new Promise(((resolve, reject) => {
    transactions.Transactions.find({ status: 'history' }, (err, result) => {
      if (err) {
        logger.info(`transactions.listHistory DB controller ERROR: ${err}`);
        reject(err);
      }
      resolve(result);
    });
  }));
}

module.exports.listHistory = listHistory;

function listDbZeroConfTx() {
  return new Promise(((resolve, reject) => {
    transactions.Transactions.find({ nbConfirmations: 0, status: 'pending' }, (err, result) => {
      if (err) {
        logger.info(`transactions.listDBZeroConfTx DB controller ERROR: ${err}`);
        reject(err);
      }
      resolve(result);
    });
  }));
}

module.exports.listDbZeroConfTx = listDbZeroConfTx;

function findById(id) {
  return new Promise(((resolve, reject) => {
    transactions.Transactions.findOne({ _id: id }, (err, result) => {
      if (err) {
        logger.info(`transactions.findById DB controller ERROR: ${err}`);
        reject(err);
      }
      resolve(result);
    });
  }));
}

module.exports.findById = findById;

function findByTxHash(txHash) {
  return new Promise((resolve, reject) => {
    transactions.Transactions.find({ txHash }, (err, result) => {
      if (err) {
        logger.info(`transactions.findByTxHash DB controller ERROR: ${err}`);
        reject(err);
      }
      resolve(result);
    });
  });
}

module.exports.findByTxHash = findByTxHash;

function findOneByTxHash(txHash) {
  return new Promise((resolve, reject) => {
    transactions.Transactions.findOne({ txHash }, (err, result) => {
      if (err) {
        logger.info(`transactions.findByTxHash DB controller ERROR: ${err}`);
        reject(err);
      }
      logger.info(`transactions.findByTxHash DB controller: ${result}`);
      resolve(result);
    });
  });
}

module.exports.findOneByTxHash = findOneByTxHash;

function addTx(txObject) {
  return new Promise((resolve, reject) => {
    const tx = new transactions.Transactions(txObject);
    tx.save((err) => {
      if (err) {
        logger.info(`transactions.addTx DB controller ERROR: ${err}`);
        reject(err);
      }
      resolve();
    });
  });
}

module.exports.addTx = addTx;

function updateTx(txUpdatedKeys) {
  return new Promise((resolve, reject) => {
    findByTxHash(txUpdatedKeys.txHash).then((result) => {
      result.forEach((tx) => {
        transactions.Transactions.update(
          { _id: tx._id },
          txUpdatedKeys,
          (err) => {
            if (err) {
              logger.info(`transactions.updateTx DB controller ERROR: ${err}`);
              reject(err);
            }
          },
        );
      });
      resolve();
    });
  });
}

module.exports.updateTx = updateTx;

function txFailed(id, failureStatus) {
  return new Promise((resolve, reject) => {
    transactions.Transactions.update(
      { _id: id },
      { status: failureStatus },
      (err) => {
        if (err) {
          logger.info(`transactions.txFailed DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve();
      },
    );
  });
}

module.exports.txFailed = txFailed;

function emptyCollection() {
  return new Promise(((resolve, reject) => {
    transactions.Transactions.remove((err, countRemoved) => {
      if (err) {
        logger.info(`transactions.emptyCollection DB controller ERROR: ${err}`);
        reject(err);
      }
      logger.info(`Removed ${countRemoved.result.n} documents from transactions database...\n`);
      resolve();
    });
  }));
}

module.exports.emptyCollection = emptyCollection;

function addZeroTxHistoryHeight() {
  return new Promise(((resolve, reject) => {
    const txHistHeight = new transactions.Transactions({
      pillarId: 'pillarId',
      protocol: 'protocol',
      txHash: 'txHash',
      blockNumber: 3333207,
      status: 'blockNumber = highest block number for tx history',
    });
    txHistHeight.save((err) => {
      if (err) {
        logger.info(`transactions.addZeroTxHistoryHeight DB controller ERROR: ${err}`);
        reject(err);
      }
      resolve();
    });
  }));
}

module.exports.addZeroTxHistoryHeight = addZeroTxHistoryHeight;

function updateTxHistoryHeight(blockNb) {
  return new Promise(((resolve, reject) => {
    transactions.Transactions.update({ status: 'blockNumber = highest block number for tx history' }, { blockNumber: blockNb }, (err) => {
      if (err) {
        logger.info(`transactions.updateTxHistoryHeight DB controller ERROR: ${err}`);
        reject(err);
      }
      resolve();
    });
  }));
}

module.exports.updateTxHistoryHeight = updateTxHistoryHeight;

function findTxHistoryHeight() {
  return new Promise(((resolve, reject) => {
    transactions.Transactions.find({ status: 'blockNumber = highest block number for tx history' }, (err, result) => {
      if (err) {
        logger.info(`transactions.findTxHistoryHeight DB controller ERROR: ${err}`);
        reject(err);
      }
      if (result.length > 0) {
        resolve(result[0].blockNumber);
      } else {
        resolve('NO_TX_HSTORY_HEIGHT');
      }
    });
  }));
}

module.exports.findTxHistoryHeight = findTxHistoryHeight;

function getBalance(address, asset) {
  return new Promise((resolve, reject) => {
    let toBalance = 0;
    let fromBalance = 0;
    transactions.Transactions.aggregate([
      {
        $match: {
          to: address.toUpperCase(),
          asset,
          status: 'confirmed',
        },
      }, {
        $group: {
          _id: null,
          balance: { $sum: '$value' },
        },
      },
    ], (err, result) => {
      if (err) {
        reject(err);
      }
      if (result[0]) {
        toBalance = result[0].balance;
      }
      transactions.Transactions.aggregate([
        {
          $match: {
            $or: [{
              from: address.toUpperCase(),
              asset,
              status: 'pending',
            }, {
              from: address.toUpperCase(),
              asset,
              status: 'confirmed',
            }],
          },
        }, {
          $group: {
            _id: null,
            balance: { $sum: '$value' },
          },
        },
      ], (e, res) => {
        if (e) {
          reject(e);
        }
        if (res[0]) {
          fromBalance = res[0].balance;
        }
        resolve(toBalance - fromBalance);
      });
    });
  });
}

module.exports.getBalance = getBalance;

function getTxHistory(address1, address2, asset, fromIndex, endIndex) {
  return new Promise(((resolve, reject) => {
    let txHistoryTo;
    let txHistoryFrom;
    let txHistory;
    // logger.info('transactions CTRL GET TX HISTORY')
    if (address2 === 'ALL' && asset === 'ALL') {
      transactions.Transactions.find({ to: address1 }, (err, result) => {
        if (err) {
          logger.info(`transactions.getTxHistory DB controller ERROR (1): ${err}`);
          reject(err);
        } else {
          txHistoryTo = result;
          transactions.Transactions.find({ from: address1 }, (e, res) => {
            if (e) {
              logger.info(`transactions.getTxHistory DB controller ERROR (2): ${e}`);
              reject(e);
            } else {
              txHistoryFrom = res;
              txHistory = txHistoryTo.concat(txHistoryFrom);

              txHistory.sort((a, b) => a.timestamp < b.timestamp);
              resolve({
                txHistory: txHistory.slice(fromIndex, endIndex),
                txCount: txHistory.length
              });
            }
          });
        }
      });
    } else if (address2 === 'ALL' && asset !== 'ALL') {
      transactions.Transactions.find({ to: address1, asset }, (err, result) => {
        if (err) {
          logger.info(`transactions.getTxHistory DB controller ERROR (1): ${err}`);
          reject(err);
        } else {
          txHistoryTo = result;
          transactions.Transactions.find({ from: address1, asset }, (e, res) => {
            if (e) {
              logger.info(`transactions.getTxHistory DB controller ERROR (2): ${e}`);
              reject(e);
            } else {
              txHistoryFrom = res;
              txHistory = txHistoryTo.concat(txHistoryFrom);

              txHistory.sort((a, b) => a.timestamp < b.timestamp);
              resolve({
                txHistory: txHistory.slice(fromIndex, endIndex),
                txCount: txHistory.length
              });
            }
          });
        }
      });
    } else if (address2 !== 'ALL') {
      if (asset === 'ALL') {
        transactions.Transactions.find({ to: address1, from: address2 }, (err, result) => {
          if (err) {
            logger.info(`transactions.getTxHistory DB controller ERROR (1): ${err}`);
            reject(err);
          } else {
            txHistoryTo = result;
            transactions.Transactions.find({ to: address2, from: address1 }, (e, res) => {
              if (err) {
                logger.info(`transactions.getTxHistory DB controller ERROR (2): ${e}`);
                reject(e);
              } else {
                txHistoryFrom = res;
                txHistory = txHistoryTo.concat(txHistoryFrom);

                txHistory.sort((a, b) => a.timestamp < b.timestamp);
                resolve({
                  txHistory: txHistory.slice(fromIndex, endIndex),
                  txCount: txHistory.length
                });
              }
            });
          }
        });
      } else {
        transactions.Transactions.find(
          { to: address1, from: address2, asset },
          (err, result) => {
            if (err) {
              logger.info(`transactions.getTxHistory DB controller ERROR (1): ${err}`);
              reject(err);
            } else {
              txHistoryTo = result;
              transactions.Transactions.find(
                { to: address2, from: address1, asset },
                (e, res) => {
                  if (e) {
                    logger.info(`transactions.getTxHistory DB controller ERROR (2): ${e}`);
                    reject(e);
                  } else {
                    txHistoryFrom = res;
                    txHistory = txHistoryTo.concat(txHistoryFrom);
                    txHistory.sort((a, b) => a.timestamp < b.timestamp);
                    resolve({
                      txHistory: txHistory.slice(fromIndex, endIndex),
                      txCount: txHistory.length
                    });
                  }
                },
              );
            }
          },
        );
      }
    }
  }));
}

module.exports.getTxHistory = getTxHistory;

