const transactions = require('../models/transactions_model');

function listAll() {
  return new Promise(((resolve, reject) => {
    try {
      transactions.Transactions.find((err, result) => {
        if (err) {
          console.log(`ethTransactions.listAll DB controller ERROR: ${err}`);
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
          console.log(`ethTransactions.listPending DB controller ERROR: ${err}`);
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
          console.log(`ethTransactions.listHistory DB controller ERROR: ${err}`);
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
          console.log(`ethTransactions.listDBZeroConfTx DB controller ERROR: ${err}`);
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
          console.log(`ethTransactions.findById DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.findById = findById;

function findByTxHash(txHash) {
  return new Promise(((resolve, reject) => {
    try {
	    transactions.Transactions.findOne({ hash: txHash }, (err, result) => {
        if (err) {
          console.log(`ethTransactions.findByTxHash DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve(result);
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.findByTxHash = findByTxHash;

function addTx(to, from, asset, contractAddress, tmstmp, value, hash, nbConf, history = false) {
  return new Promise(((resolve, reject) => {
    try {
      let ethTx;
      if (history) {
        ethTx = new transactions.Transactions({
          to, from, asset, contractAddress, timestamp: tmstmp, value, status: 'history', hash, gasUsed: null, nbConfirmations: nbConf,
        });
      } else {
        ethTx = new transactions.Transactions({
          to, from, asset, contractAddress, timestamp: tmstmp, value, status: 'pending', hash, gasUsed: null, nbConfirmations: nbConf,
        });
      }
      ethTx.save((err) => {
        if (err) {
          console.log(`ethTransactions.addTx DB controller ERROR: ${err}`);
          reject(err);
        }
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.addTx = addTx;

function updateTx(id, txInfo, receipt, nbConf, status) {
  return new Promise(((resolve, reject) => {
    try {
      let gasUsed;
      if (receipt) {
        gasUsed = receipt.gasUsed * txInfo.gasPrice * (10 ** -18);
      } else {
        gasUsed = -999;
      }
	    transactions.Transactions.update(
        { _id: id },
        { nbConfirmations: nbConf, status, gasUsed },
        (err) => {
          if (err) {
            console.log(`ethTransactions.updateTx DB controller ERROR: ${err}`);
            reject(err);
          }
          resolve();
        },
      );
    } catch (e) { reject(e); }
  }));
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
            console.log(`ethTransactions.txFailed DB controller ERROR: ${err}`);
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
          console.log(`ethTransactions.emptyCollection DB controller ERROR: ${err}`);
          reject(err);
        }
        console.log(`Removed ${countremoved.result.n} documents from ethTransactions database...\n`);
        resolve();
      });
    } catch (e) { reject(e); }
  }));
}
module.exports.emptyCollection = emptyCollection;

function addZeroTxHistoryHeight() {
  return new Promise(((resolve, reject) => {
    try {
      const txHistHeight = new transactions.Transactions({ nbConfirmations: 2693500, status: 'nbConfirmations = highest block number for tx history' });
      txHistHeight.save((err) => {
        if (err) {
          console.log(`ethTransactions.addZeroTxHistoryHeight DB controller ERROR: ${err}`);
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
	    transactions.Transactions.update({ status: 'nbConfirmations = highest block number for tx history' }, { nbConfirmations: blockNb }, (err) => {
        if (err) {
          console.log(`ethTransactions.updateTxHistoryHeight DB controller ERROR: ${err}`);
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
	    transactions.Transactions.find({ status: 'nbConfirmations = highest block number for tx history' }, (err, result) => {
        if (err) {
          console.log(`ethTransactions.findTxHistoryHeight DB controller ERROR: ${err}`);
          reject(err);
        }
        if (result.length > 0) {
          resolve(result[0].nbConfirmations);
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
      // console.log('ETHTRANSACTIONS CTRL GET TX HISTORY')
      if (address2 === 'ALL' && asset === 'ALL') {
	      transactions.Transactions.find({ to: address1 }, (err, result) => {
          if (err) {
            console.log(`ethTransactions.getTxHistory DB controller ERROR (1): ${err}`);
            reject(err);
          } else {
            txHistoryTo = result;
	          transactions.Transactions.find({ from: address1 }, (e, res) => {
              if (e) {
                console.log(`ethTransactions.getTxHistory DB controller ERROR (2): ${e}`);
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
            console.log(`ethTransactions.getTxHistory DB controller ERROR (1): ${err}`);
            reject(err);
          } else {
            txHistoryTo = result;
	          transactions.Transactions.find({ from: address1, asset }, (e, res) => {
              if (e) {
                console.log(`ethTransactions.getTxHistory DB controller ERROR (2): ${e}`);
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
              console.log(`ethTransactions.getTxHistory DB controller ERROR (1): ${err}`);
              reject(err);
            } else {
              txHistoryTo = result;
	            transactions.Transactions.find({ to: address2, from: address1 }, (e, res) => {
                if (err) {
                  console.log(`ethTransactions.getTxHistory DB controller ERROR (2): ${e}`);
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
                console.log(`ethTransactions.getTxHistory DB controller ERROR (1): ${err}`);
                reject(err);
              } else {
                txHistoryTo = result;
	              transactions.Transactions.find(
                  { to: address2, from: address1, asset },
                  (e, res) => {
                    if (e) {
                      console.log(`ethTransactions.getTxHistory DB controller ERROR (2): ${e}`);
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

