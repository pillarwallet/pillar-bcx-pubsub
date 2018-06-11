const transactions = require('../models/transactions_model');
const logger = require('../utils/logger.js');

function listAll() {
  return new Promise(((resolve, reject) => {
    try {
	    transactions.Transactions.find((err, result) => {
        if (err) {
          logger.info(`transactions.listAll DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.listAll = listAll;

function listPending() {
  return new Promise(((resolve, reject) => {
    try {
	    transactions.Transactions.find({ status: 'pending' }, (err, result) => {
        if (err) {
          logger.info(`transactions.listPending DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.listPending = listPending;

function listHistory() {
  return new Promise(((resolve, reject) => {
    try {
	    transactions.Transactions.find({ status: 'history' }, (err, result) => {
        if (err) {
          logger.info(`transactions.listHistory DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.listHistory = listHistory;

function listDbZeroConfTx() {
  return new Promise(((resolve, reject) => {
    try {
	    transactions.Transactions.find({ nbConfirmations: 0, status: 'pending' }, (err, result) => {
        if (err) {
          logger.info(`transactions.listDBZeroConfTx DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.listDbZeroConfTx = listDbZeroConfTx;

function findById(id) {
  return new Promise(((resolve, reject) => {
    try {
	    transactions.Transactions.findOne({ _id: id }, (err, result) => {
        if (err) {
          logger.info(`transactions.findById DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.findById = findById;

function findByTxHash(txHash) {
  return new Promise((resolve, reject) => {
    try {
	    transactions.Transactions.find({ txHash }, (err, result) => {
        if (err) {
          logger.info(`transactions.findByTxHash DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  });
}
module.exports.findByTxHash = findByTxHash;

function addTx(txObject) {
  return new Promise((resolve, reject) => {
    try {
      const tx = new transactions.Transactions(txObject);
      tx.save((err) => {
        if (err) {
          logger.info(`transactions.addTx DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve();
      });
    } catch (e) { reject(e); }
  });
}
module.exports.addTx = addTx;

function updateTx(txUpdatedKeys) {
  return new Promise((resolve, reject) => {
    try {
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
    } catch (e) { reject(e); }
  });
}
module.exports.updateTx = updateTx;

function txFailed(id, failureStatus) {
  return new Promise((resolve, reject) => {
    try {
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
    } catch (e) { reject(e); }
  });
}
module.exports.txFailed = txFailed;

function emptyCollection() {
  return new Promise(((resolve, reject) => {
    try {
      transactions.Transactions.remove((err, countremoved) => {
        if (err) {
          logger.info(`transactions.emptyCollection DB controller ERROR: ${err}`);
          reject(err);
        }
        logger.info(`Removed ${countremoved.result.n} documents from transactions database...\n`);
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.emptyCollection = emptyCollection;

function addZeroTxHistoryHeight() {
  return new Promise(((resolve, reject) => {
    try {
      const txHistHeight = new transactions.Transactions({
        pillarId: 'lskjdhf', protocol: 'Ethereum', txHash: 'sjdhgkjdfhg', blockNumber: 3333207, status: 'blockNumber = highest block number for tx history',
      });
      txHistHeight.save((err) => {
        if (err) {
          logger.info(`transactions.addZeroTxHistoryHeight DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.addZeroTxHistoryHeight = addZeroTxHistoryHeight;

function updateTxHistoryHeight(blockNb) {
  return new Promise(((resolve, reject) => {
    try {
	    transactions.Transactions.update({ status: 'blockNumber = highest block number for tx history' }, { blockNumber: blockNb }, (err) => {
        if (err) {
          logger.info(`transactions.updateTxHistoryHeight DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.updateTxHistoryHeight = updateTxHistoryHeight;

function findTxHistoryHeight() {
  return new Promise(((resolve, reject) => {
    try {
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
    } catch (e) { reject(e); }
  }));
}
module.exports.findTxHistoryHeight = findTxHistoryHeight;

function getBalance(address, asset) {
  return new Promise((resolve, reject) => {
    let toBalance = 0;
    let fromBalance = 0;
    try {
	    transactions.Transactions.aggregate([
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
          },
          {
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
    } catch (e) { reject(e); }
  });
}
module.exports.getBalance = getBalance;

function getTxHistory(address1, address2, asset, fromIndex, endIndex) {
  return new Promise(((resolve, reject) => {
    try {
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
                resolve({ txHistory: txHistory.slice(fromIndex, endIndex), txCount: txHistory.length });
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
                resolve({ txHistory: txHistory.slice(fromIndex, endIndex), txCount: txHistory.length });
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
                  resolve({ txHistory: txHistory.slice(fromIndex, endIndex), txCount: txHistory.length });
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
                      resolve({ txHistory: txHistory.slice(fromIndex, endIndex), txCount: txHistory.length });
                    }
                  },
                );
              }
            },
          );
        }
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.getTxHistory = getTxHistory;

