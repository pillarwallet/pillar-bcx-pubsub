const colors = require('colors');
const time = require('unix-timestamp');
const logger = require('../utils/logger.js');
const ERC20ABI = require('./ERC20ABI');


function processNewPendingTxArray(web3, txArray, dbCollections, abiDecoder, notif, channel, queue, nbTxFound, checkAddress = null) {
  return new Promise(((resolve, reject) => {
    try {
      if (txArray.length === 0) {
        resolve(nbTxFound);
      } else {
        module.exports.newPendingTx(web3, txArray[0], dbCollections, abiDecoder, notif, true, false, checkAddress)
          .then((isMonitoredAccoutnTx) => {
            if (isMonitoredAccoutnTx) { nbTxFound += 1; }
            txArray.splice(0, 1);
            resolve(processNewPendingTxArray(
              web3, txArray, dbCollections, abiDecoder,
              notif, channel, queue, nbTxFound, checkAddress,
            ));
          })
          .catch((e) => { reject(e); });
      }
    } catch (e) { reject(e); }
  }));
}
module.exports.processNewPendingTxArray = processNewPendingTxArray;

function newPendingTx(
  web3, tx, dbCollections, abiDecoder, notif, channel, queue,
  sendNotif = true, history = false, checkAddress = null,
) {
  return new Promise(((resolve, reject) => {
    const tmstmp = time.now();
    let toERC20SmartContract;
    let ticker;
    let toPillarAccount;
    let fromPillarAccount;
    if (tx.to == null) { // SMART CONTRACT CREATION TRANSACTION
      resolve(false);
    } else {
      module.exports.filterAddress(tx.to, dbCollections.ethAddresses, dbCollections.smartContracts, checkAddress)
        .then((result) => {
          toPillarAccount = result.isPillarAddress;
          toERC20SmartContract = result.isERC20SmartContract;
          ticker = result.ERC20SmartContractTicker;
          module.exports.filterAddress(tx.from, dbCollections.ethAddresses, dbCollections.smartContracts, checkAddress)
            .then((result2) => {
              fromPillarAccount = result2.isPillarAddress;
              let value = tx.value * (10 ** -18);
              if (toPillarAccount) {
                const asset = 'ETH';
                dbCollections.ethTransactions.addTx(
                  tx.to.toUpperCase(), tx.from.toUpperCase(),
                  asset, null, tmstmp, value, tx.hash, 0, history,
                )
                  .then(() => {
                    if (fromPillarAccount) {
                      logger.info(colors.yellow(`TANSACTION PENDING: ${tx.hash}\n${value} ETH\nFROM: PILLAR WALLET ${tx.from}\nTO: PILLAR WALLET ${tx.to}\n`));
                      /*
                      if (sendNotif) {
                        dbCollections.ethAddresses.getFCMIID(tx.to)
                          .then((FCMIID) => {
                            notif.sendNotification(tx.hash, tx.from, tx.to, value, asset, null, 'pending', 0, FCMIID);
                          })
                          .catch((e) => {
                            reject(e);
                          });
                      }
                      */
                      resolve(true);
                    } else {
                      logger.info(colors.yellow(`TANSACTION PENDING: ${tx.hash}\n${value} ETH\nFROM: EXTERNAL ETH ACCOUNT ${tx.from}\nTO: PILLAR WALLET ${tx.to}\n`));
                      /*
                      if (sendNotif) {
                        dbCollections.ethAddresses.getFCMIID(tx.to)
                          .then((FCMIID) => {
                            notif.sendNotification(tx.hash, tx.from, tx.to, value, asset, null, 'pending', 0, FCMIID);
                          })
                          .catch((e) => {
                            reject(e);
                          });
                      }
                      */
                      resolve(true);
                    }
                  })
                  .catch((e) => {
                    reject(e);
                  });
              } else if (toERC20SmartContract) {
                const contractAddress = tx.to;
                abiDecoder.addABI(ERC20ABI);
                const data = abiDecoder.decodeMethod(tx.input);
                // logger.info(tx)
                // logger.info(data)
                if (data !== undefined) {
                  if (value !== 0) {
                    const asset = 'ETH';
                    if (fromPillarAccount) {
                      dbCollections.ethTransactions.addTx(
                        tx.to.toUpperCase(), tx.from.toUpperCase(), asset,
                        contractAddress, tmstmp, value, tx.hash, 0, history,
                      )
                        .then(() => {
                          logger.info(colors.yellow(`TRANSACTION PENDING: ${tx.hash}\n${value} ETH\nFROM: PILLAR WALLET ${tx.from}\nTO: ${ticker} SMART CONTRACT ${tx.to}\nDATA:\n`));
                          resolve(true);
                        })
                        .catch((e) => {
                          reject(e);
                        });
                    } else {
                      resolve(false);
                    }
                  } else { // value==0
                    const asset = ticker;
                    if (fromPillarAccount) {
                      logger.info(colors.cyan(`SMART CONTRACT CALL: ${tx.hash}\nFROM: PILLAR WALLET ${tx.from}\nTO: ${ticker} SMART CONTRACT ${tx.to}\n`));
                      if (data.name === 'transfer') {
                        value = (parseInt(data.params[1].value, 10) * (10 ** -18)).toString();
                        const to = data.params[0].value;
                        dbCollections.ethTransactions.addTx(
                          tx.to.toUpperCase(), tx.from.toUpperCase(), asset,
                          contractAddress, tmstmp, value, tx.hash, 0, history,
                        )
                          .then(() => {
                            module.exports.filterAddress(to, dbCollections.ethAddresses, dbCollections.smartContracts)
                              .then((result3) => {
                                toPillarAccount = result3.isPillarAddress;
                                if (toPillarAccount) {
                                  logger.info(colors.cyan(`${ticker} TOKEN TRANSFER:\n${value} ${ticker}\nFROM PILLAR WALLET: ${tx.from}\nTO PILLAR WALLET: ${to}\n`));
                                  /*
                                  if (sendNotif) {
                                    dbCollections.ethAddresses.getFCMIID(to)
                                      .then((FCMIID) => {
                                        notif.sendNotification(tx.hash, tx.from, to, value, asset, tx.to, 'pending', 0, FCMIID);
                                      })
                                      .catch((e) => {
                                        reject(e);
                                      });
                                  }
                                  */
                                  resolve(true);
                                } else {
                                  logger.info(colors.cyan.bold(`${ticker} TOKEN TRANSFER:\n${value} ${ticker}\nFROM PILLAR WALLET: ${tx.from}\nTO EXTERNAL ETH ACCOUNT: ${to}\n`));
                                  resolve(true);
                                }
                              })
                              .catch((e) => {
                                reject(e);
                              });
                          })
                          .catch((e) => {
                            reject(e);
                          });
                      } else {
                        resolve(true);
                      }
                    } else if (data.name === 'transfer') {
                      value = (parseInt(data.params[1].value, 10) * (10 ** -18)).toString();
                      const to = data.params[0].value;
                      module.exports.filterAddress(to, dbCollections.ethAddresses, dbCollections.smartContracts)
                        .then((result4) => {
                          toPillarAccount = result4.isPillarAddress;
                          if (toPillarAccount) {
                            dbCollections.ethTransactions.addTx(
                              tx.to.toUpperCase(), tx.from.toUpperCase(), asset,
                              contractAddress, tmstmp, value, tx.hash, 0, history,
                            )
                              .then(() => {
                                logger.info(colors.cyan(`${ticker} TOKEN TRANSFER:\n${value} ${ticker}\nFROM EXTERNAL ETH ACCOUNT: ${tx.from}\nTO PILLAR WALLET: ${to}\n`));
                                /*
                                if (sendNotif) {
                                  dbCollections.ethAddresses.getFCMIID(to)
                                    .then((FCMIID) => {
                                      notif.sendNotification(tx.hash, tx.from, to, value, asset, tx.to, 'pending', 0, FCMIID);
                                    })
                                    .catch((e) => {
                                      reject(e);
                                    });
                                }
                                */
                                resolve(true);
                              })
                              .catch((e) => {
                                reject(e);
                              });
                          } else {
                            resolve(false);
                          }
                        })
                        .catch((e) => {
                          reject(e);
                        });
                    } else {
                      resolve(false);
                    }
                  }
                } else if (fromPillarAccount) {
                  const asset = 'ETH';
                  dbCollections.ethTransactions.addTx(
                    tx.to.toUpperCase(), tx.from.toUpperCase(), asset,
                    contractAddress, tmstmp, value, tx.hash, 0, history,
                  )
                    .then(() => {
                      logger.info(colors.yellow(`TANSACTION PENDING: ${tx.hash}\n${value} ETH\nFROM: PILLAR WALLET ${tx.from}\nTO: ERC20 SMART CONTRACT ${tx.to}\n`));
                      resolve(true);
                    })
                    .catch((e) => {
                      reject(e);
                    });
                } else {
                  resolve(false);
                }
              } else if (fromPillarAccount) {
                const asset = 'ETH';
                dbCollections.ethTransactions.addTx(
                  tx.to.toUpperCase(), tx.from.toUpperCase(),
                  asset, null, tmstmp, value, tx.hash, 0, history,
                )
                  .then(() => {
                    logger.info(colors.yellow(`TANSACTION PENDING: ${tx.hash}\n${value} ETH\nFROM: PILLAR WALLET ${tx.from}\nTO: EXTERNAL ETH ACCOUNT OR SMART CONTRACT ${tx.to}\n`));
                    resolve(true);
                  })
                  .catch((e) => {
                    reject(e);
                  });
              } else {
                resolve(false);
              }
            })
            .catch((e) => {
              reject(e);
            });
        })
        .catch((e) => {
          reject(e);
        });
    }
  }));
}
module.exports.newPendingTx = newPendingTx;

function checkPendingTx(web3, bcx, dbCollections, dbPendingTxArray, blockNumber, notif, sendNotif = true) {
  return new Promise(((resolve, reject) => {
    if (dbPendingTxArray.length === 0) {
      resolve();
    } else {
      const item = dbPendingTxArray[0];
      dbPendingTxArray.splice(0, 1);
      let contractAddress;
      if (item.asset !== 'ETH') {
        contractAddress = item.contractAddress;
      } else {
        contractAddress = null;
      }
      bcx.getTxInfo(web3, item.hash)
        .then((txInfo) => {
          if (txInfo != null) {
            if (txInfo.blockNumber != null) {
              bcx.getTxReceipt(web3, item.hash)
                .then((receipt) => {
                  if (receipt != null) {
                    bcx.getBlockNumber(web3, txInfo.blockHash)
                      .then((confBlockNb) => {
                        const input = web3.utils.hexToNumberString(txInfo.input);
                        if (txInfo.value === 0 && input !== '0') { // SMART CONTRACT CALL IDENTIFIED
                          if (receipt.gasUsed < txInfo.gas) { // TX MINED
                            const nbConf = 1 + (blockNumber - confBlockNb);
                            if (nbConf < 5 && nbConf >= 0) {
                              dbCollections.ethTransactions.updateTx(item._id, txInfo, receipt, nbConf, 'pending')
                                .then(() => {
                                  logger.info(colors.green(`TRANSACTION ${item.hash}: ${nbConf} CONFIRMATION(S) @ BLOCK # ${blockNumber}\n`));
                                  resolve(checkPendingTx(
                                    web3, bcx, dbCollections, dbPendingTxArray,
                                    blockNumber, notif, sendNotif,
                                  ));
                                })
                                .catch((e) => { reject(e); });
                            } else if (nbConf >= 5) {
                              dbCollections.ethTransactions.updateTx(item._id, txInfo, receipt, nbConf, 'confirmed')
                                .then(() => {
                                  logger.info(colors.green(`TRANSACTION ${item.hash}: ${nbConf} CONFIRMATION(S) @ BLOCK # ${blockNumber}\n`));
                                  logger.info(colors.green.bold(`TRANSACTION ${item.hash} CONFIRMED!\n`));
                                  if (sendNotif) {
                                    dbCollections.ethAddresses.getFCMIID(item.to)
                                      .then((toFCMIID) => {
                                        notif.sendNotification(item.hash, item.from, item.to, item.value, item.asset, contractAddress, 'confirmed', nbConf, toFCMIID)
                                          .then(() => {
                                            dbCollections.ethAddresses.getFCMIID(item.from)
                                              .then((fromFCMIID) => {
                                                notif.sendNotification(item.hash, item.from, item.to, item.value, item.asset, contractAddress, 'confirmed', nbConf, fromFCMIID)
                                                  .then(() => {
                                                    resolve(checkPendingTx(
                                                      web3, bcx, dbCollections, dbPendingTxArray,
                                                      blockNumber, notif, sendNotif,
                                                    ));
                                                  })
                                                  .catch((e) => { reject(e); });
                                              })
                                              .catch((e) => { reject(e); });
                                          })
                                          .catch((e) => { reject(e); });
                                      })
                                      .catch((e) => { reject(e); });
                                  } else {
                                    resolve(checkPendingTx(
                                      web3, bcx, dbCollections, dbPendingTxArray,
                                      blockNumber, notif, sendNotif,
                                    ));
                                  }
                                })
                                .catch((e) => { reject(e); });
                            } else {
                              logger.info(colors.red.bold('WARNING: txInfo.blockNumber>lastBlockNumber\n'));
                              resolve(checkPendingTx(
                                web3, bcx, dbCollections, dbPendingTxArray,
                                blockNumber, notif, sendNotif,
                              ));
                            }
                          } else { // OUT OF GAS
                            dbCollections.ethTransactions.txFailed(item._id, 'out of gas')
                              .then(() => {
                                logger.info(colors.red.bold(`TRANSACTION ${item.hash} OUT OF GAS: FAILED! (status : out of gas)\n`));
                                if (sendNotif) {
                                  dbCollections.ethAddresses.getFCMIID(item.to)
                                    .then((toFCMIID) => {
                                      notif.sendNotification(item.hash, item.from, item.to, item.value, item.asset, contractAddress, 'failed: out of gas', 0, toFCMIID)
                                        .then(() => {
                                          dbCollections.ethAddresses.getFCMIID(item.from)
                                            .then((fromFCMIID) => {
                                              notif.sendNotification(item.hash, item.from, item.to, item.value, item.asset, contractAddress, 'failed: out of gas', 0, fromFCMIID)
                                                .then(() => {
                                                  resolve(checkPendingTx(
                                                    web3, bcx, dbCollections, dbPendingTxArray,
                                                    blockNumber, notif, sendNotif,
                                                  ));
                                                })
                                                .catch((e) => { reject(e); });
                                            })
                                            .catch((e) => { reject(e); });
                                        })
                                        .catch((e) => { reject(e); });
                                    })
                                    .catch((e) => { reject(e); });
                                } else {
                                  resolve(checkPendingTx(
                                    web3, bcx, dbCollections, dbPendingTxArray,
                                    blockNumber, notif, sendNotif,
                                  ));
                                }
                              })
                              .catch((e) => { reject(e); });
                          }
                        } else { // REGULAR ETH TX
                          const nbConf = 1 + (blockNumber - confBlockNb);
                          if (nbConf < 5 && nbConf >= 0) {
                            dbCollections.ethTransactions.updateTx(item._id, txInfo, receipt, nbConf, 'pending')
                              .then(() => {
                                logger.info(colors.green(`TRANSACTION ${item.hash}: ${nbConf} CONFIRMATION(S) @ BLOCK # ${blockNumber}\n`));
                                resolve(checkPendingTx(
                                  web3, bcx, dbCollections, dbPendingTxArray,
                                  blockNumber, notif, sendNotif,
                                ));
                              })
                              .catch((e) => { reject(e); });
                          } else if (nbConf >= 5) {
                            dbCollections.ethTransactions.updateTx(item._id, txInfo, receipt, nbConf, 'confirmed')
                              .then(() => {
                                logger.info(colors.green(`TRANSACTION ${item.hash}: ${nbConf} CONFIRMATION(S) @ BLOCK # ${blockNumber}\n`));
                                logger.info(colors.green.bold(`TRANSACTION ${item.hash} CONFIRMED!\n`));
                                if (sendNotif) {
                                  dbCollections.ethAddresses.getFCMIID(item.to)
                                    .then((toFCMIID) => {
                                      notif.sendNotification(item.hash, item.from, item.to, item.value, item.asset, contractAddress, 'confirmed', nbConf, toFCMIID)
                                        .then(() => {
                                          dbCollections.ethAddresses.getFCMIID(item.from)
                                            .then((fromFCMIID) => {
                                              notif.sendNotification(item.hash, item.from, item.to, item.value, item.asset, contractAddress, 'confirmed', nbConf, fromFCMIID)
                                                .then(() => {
                                                  resolve(checkPendingTx(
                                                    web3, bcx, dbCollections, dbPendingTxArray,
                                                    blockNumber, notif, sendNotif,
                                                  ));
                                                })
                                                .catch((e) => { reject(e); });
                                            })
                                            .catch((e) => { reject(e); });
                                        })
                                        .catch((e) => { reject(e); });
                                    })
                                    .catch((e) => { reject(e); });
                                } else {
                                  resolve(checkPendingTx(
                                    web3, bcx, dbCollections, dbPendingTxArray,
                                    blockNumber, notif, sendNotif,
                                  ));
                                }
                              })
                              .catch((e) => { reject(e); });
                          } else {
                            logger.info(colors.red.bold('WARNING: txInfo.blockNumber>lastBlockNumber\n'));
                            resolve(checkPendingTx(
                              web3, bcx, dbCollections, dbPendingTxArray,
                              blockNumber, notif, sendNotif,
                            ));
                          }
                        }
                      })
                      .catch((e) => { reject(e); });
                  } else { // TX RECEIPT NOT FOUND
                    dbCollections.ethTransactions.txFailed(item._id, 'tx receipt not found') // SHOULD WE WAIT A CERTAIN NUMBER OF BLOCKS BEFORE DECLARING TX FAILED?
                      .then(() => {
                        logger.info(colors.red.bold(`TRANSACTION ${item.hash}: TX RECEIPT NOT FOUND: FAILED! (status : tx receipt not found)\n`));
                        if (sendNotif) {
                          dbCollections.ethAddresses.getFCMIID(item.to)
                            .then((toFCMIID) => {
                              notif.sendNotification(item.hash, item.from, item.to, item.value, item.asset, contractAddress, 'failed: tx receipt not found', 0, toFCMIID)
                                .then(() => {
                                  dbCollections.ethAddresses.getFCMIID(item.from)
                                    .then((fromFCMIID) => {
                                      notif.sendNotification(item.hash, item.from, item.to, item.value, item.asset, contractAddress, 'failed: tx receipt not found', 0, fromFCMIID)
                                        .then(() => {
                                          resolve(checkPendingTx(
                                            web3, bcx, dbCollections, dbPendingTxArray,
                                            blockNumber, notif, sendNotif,
                                          ));
                                        })
                                        .catch((e) => { reject(e); });
                                    })
                                    .catch((e) => { reject(e); });
                                })
                                .catch((e) => { reject(e); });
                            })
                            .catch((e) => { reject(e); });
                        } else {
                          resolve(checkPendingTx(
                            web3, bcx, dbCollections, dbPendingTxArray,
                            blockNumber, notif, sendNotif,
                          ));
                        }
                      })
                      .catch((e) => { reject(e); });
                  }
                })
                .catch((e) => { reject(e); });
            } else {
              dbCollections.ethTransactions.updateTx(item._id, txInfo, null, 0, 'pending')
                .then(() => {
                  logger.info(`TX ${item.hash} STILL PENDING (IN TX POOL)...\n`);
                  resolve(checkPendingTx(
                    web3, bcx, dbCollections, dbPendingTxArray,
                    blockNumber, notif, sendNotif,
                  ));
                })
                .catch((e) => { reject(e); });
            }
          } else { // TX NOT FOUND
            dbCollections.ethTransactions.txFailed(item._id, 'tx info not found') // SHOULD WE WAIT A CERTAIN NUMBER OF BLOCKS BEFORE DECLARING TX FAILED?
              .then(() => {
                logger.info(colors.red.bold(`TRANSACTION ${item.hash} NOT FOUND IN TX POOL OR BLOCKCHAIN: FAILED! (status : tx info not found)\n`));
                if (sendNotif) {
                  dbCollections.ethAddresses.getFCMIID(item.to)
                    .then((toFCMIID) => {
                      notif.sendNotification(item.hash, item.from, item.to, item.value, item.asset, contractAddress, 'failed: tx info not found', 0, toFCMIID)
                        .then(() => {
                          dbCollections.ethAddresses.getFCMIID(item.from)
                            .then((fromFCMIID) => {
                              notif.sendNotification(item.hash, item.from, item.to, item.value, item.asset, contractAddress, 'failed: tx info not found', 0, fromFCMIID)
                                .then(() => {
                                  resolve(checkPendingTx(
                                    web3, bcx, dbCollections, dbPendingTxArray,
                                    blockNumber, notif, sendNotif,
                                  ));
                                })
                                .catch((e) => { reject(e); });
                            })
                            .catch((e) => { reject(e); });
                        })
                        .catch((e) => { reject(e); });
                    })
                    .catch((e) => { reject(e); });
                } else {
                  resolve(checkPendingTx(
                    web3, bcx, dbCollections, dbPendingTxArray,
                    blockNumber, notif, sendNotif,
                  ));
                }
              })
              .catch((e) => { reject(e); });
          }
        })
        .catch((e) => { reject(e); });
    }
  }));
}
module.exports.checkPendingTx = checkPendingTx;


function filterAddress(
  /* CHECKS IF ADDRESS IS ONE OF THE MONITORED ADDRESSES REGISTERED IN THE DATABASE */
  address, ethAddresses, smartContracts, checkAddress = null) {
  return new Promise(((resolve, reject) => {
    try {
      const ADDRESS = address.toUpperCase();

      if (checkAddress && ADDRESS === checkAddress.toUpperCase()) {
        resolve({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
      } else {
        ethAddresses.findByAddress(ADDRESS)
          .then((result) => {
            if (result) {
              resolve({ isPillarAddress: true, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
            } else {
              smartContracts.findByAddress(ADDRESS)
                .then((result2) => {
                  if (result2) {
                    const ticker = result2.ticker;
                    resolve({
                      isPillarAddress: false,
                      isERC20SmartContract: true,
                      ERC20SmartContractTicker: ticker,
                    });
                  } else {
                    resolve({
                      isPillarAddress: false,
                      isERC20SmartContract: false,
                      ERC20SmartContractTicker: '',
                    });
                  }
                })
                .catch((e) => {
                  reject(e);
                });
            }
          })
          .catch((e) => {
            reject(e);
          });
      }
    } catch (e) {
      resolve({ isPillarAddress: false, isERC20SmartContract: false, ERC20SmartContractTicker: '' });
    }
  }));
}
module.exports.filterAddress = filterAddress;

function checkTokenTransferEvent(web3, bcx, dbCollections, notif, eventInfo, ERC20SmartcContractInfo) {
  return new Promise(((resolve, reject) => {
    try {
      logger.info(eventInfo);
      module.exports.filterAddress(eventInfo.returnValues._to, dbCollections.ethAddresses, dbCollections.smartContracts) // check if token transfer destination address is pillar wallet
        .then((result) => {
          if (result.isPillarAddress === true) {
            dbCollections.ethTransactions.findByTxHash(eventInfo.transactionHash)
            // ETH TX SHOULD BE ALREADY IN DB BECAUSE ETH WAS SENT BY PILLAR WALLET
              .then((tx) => {
                if (tx.asset === 'ETH') { // check is it is regular token transfer, if so: resolve (because token transfer already processed), otherwise transfer needs to be processed here
                  const value
                    = eventInfo.returnValues._value * (10 ** -ERC20SmartcContractInfo.decimals);
                  logger.info(colors.red.bold('TOKEN TRANSFER EVENT:\n'));
                  logger.info(colors.red(`${value} ${ERC20SmartcContractInfo.ticker}\n`));
                  logger.info(colors.red(`FROM: ${ERC20SmartcContractInfo.ticker} SMART CONTRACT ${ERC20SmartcContractInfo.address}\n`));
                  logger.info(colors.red(`TO: PILLAR WALLET ${eventInfo.returnValues._to}\n`));
                  dbCollections.ethTransactions.addTx(
                  	eventInfo.returnValues._to.toUpperCase(),
	                  ERC20SmartcContractInfo.address.toUpperCase(),
                    ERC20SmartcContractInfo.ticker,
                    ERC20SmartcContractInfo.address.toUpperCase(),
                    tx.tmstmp,
                    value,
                    eventInfo.transactionHash,
                    1,
                    false,
                  )
                    .then(() => {
                      dbCollections.ethAddresses.getFCMIID(eventInfo.returnValues._to)
                        .then((toFCMIID) => {
                          notif.sendNotification(
                            tx.hash,
                            eventInfo.returnValues._from,
                            eventInfo.returnValues._to, value,
                            ERC20SmartcContractInfo.ticker,
                            ERC20SmartcContractInfo.address,
                            'pending',
                            1,
                            toFCMIID,
                          )
                            .then(() => {
                              resolve();
                            });
                        })
                        .catch((e) => { reject(e); });
                    })
                    .catch((e) => { reject(e); });
                } else {
                  resolve();
                }
              })
              .catch((e) => { reject(e); });
          } else {
            resolve();
          }
        })
        .catch((e) => { reject(e); });
    } catch (e) { reject(e); }
  }));
}
module.exports.checkTokenTransferEvent = checkTokenTransferEvent;
