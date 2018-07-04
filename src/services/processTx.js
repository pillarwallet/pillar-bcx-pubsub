const colors = require('colors');
const time = require('unix-timestamp');
const logger = require('../utils/logger.js');
const ERC20ABI = require('./ERC20ABI');
// const dbServices = require('./dbServices.js');
const rmqServices = require('./rmqServices.js');
const abiDecoder = require('abi-decoder');
const bcx = require('./bcx.js');
const hashMaps = require('../utils/hashMaps.js');

function processNewPendingTxArray(txArray, nbTxFound, isPublisher = true) {
  return new Promise(((resolve, reject) => {
    if (txArray.length === 0) {
      resolve(nbTxFound);
    } else {
      module.exports.newPendingTx(txArray[0], isPublisher)
        .then((isMonitoredAccoutnTx) => {
          txArray.splice(0, 1);
          resolve(processNewPendingTxArray(txArray, isMonitoredAccoutnTx ?
            (nbTxFound + 1) : nbTxFound, isPublisher));
        })
        .catch(e => reject(e));
    }
  }));
}

module.exports.processNewPendingTxArray = processNewPendingTxArray;

function newPendingTx(tx, isPublisher = true) {
  return new Promise(((resolve, reject) => {
    const tmstmp = time.now();
    let toERC20SmartContract;
    let ticker;
    let toPillarAccount;
    let toPillarId;
    let fromPillarAccount;
    let fromPillarId;
    if (tx.to == null) { // SMART CONTRACT CREATION TRANSACTION
      resolve(false);
    } else { // REGULAR TRANSACTION OR SMART CONTRACT CALL
      module.exports.filterAddress(tx.to, isPublisher)
        .then((result) => {
          toPillarAccount = result.isPillarAddress;
          toPillarId = result.pillarId;
          toERC20SmartContract = result.isERC20SmartContract;
          ticker = result.ERC20SmartContractTicker;
          module.exports.filterAddress(tx.from, isPublisher)
            .then((result2) => {
              fromPillarAccount = result2.isPillarAddress;
              fromPillarId = result2.pillarId;
              let value = tx.value * (10 ** -18);

              if (toPillarAccount) { // TRANSACTION RECIPIENT ADDRESS === PILLAR WALLET ADDRESS
                const asset = 'ETH'; // MUST BE ETH TRANSFER BECAUSE RECIPIENT ADDRESS !== SMART CONTRACT ADDRESS
                if (isPublisher) {
                  // PUBLISHER SENDS NEW TX DATA TO SUBSCRIBER
                  const txMsgTo = {
                    type: 'newTx',
                    pillarId: toPillarId,
                    protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                    fromAddress: tx.from,
                    toAddress: tx.to,
                    txHash: tx.hash,
                    asset,
                    contractAddress: null,
                    timestamp: tmstmp,
                    value: tx.value,
                    gasPrice: tx.gasPrice,
                  };
                  rmqServices.sendPubSubMessage(txMsgTo);
                  // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
                  hashMaps.pendingTx.set(tx.hash, {
                    pillarId: toPillarId,
                    protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                    fromAddress: tx.from,
                    toAddress: tx.to,
                    txHash: tx.hash,
                    asset,
                    contractAddress: null,
                    timestamp: tmstmp,
                    value: tx.value,
                    gasPrice: tx.gasPrice,
                  });
                } else {
                  // HOUSEKEEPER STORES TX IN DB
                  dbServices.dbCollections.transactions.addTx({
                    pillarId: toPillarId,
                    protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                    fromAddress: tx.from,
                    toAddress: tx.to,
                    txHash: tx.hash,
                    asset,
                    contractAddress: null,
                    timestamp: tmstmp,
                    blockNumber: null,
                    value: tx.value,
                    status: 'pending',
                    gasPrice: tx.gasPrice,
                    gasUsed: null,
                  });
                }

                if (fromPillarAccount) { // TRANSACTION SENDER ADDRESS === PILLAR WALLET ADDRESS
                  if (isPublisher) {
                    // SEND NEW TX DATA TO SUBSCRIBER
                    const txMsgFrom = {
                      type: 'newTx',
                      pillarId: fromPillarId,
                      protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                      fromAddress: tx.from,
                      toAddress: tx.to,
                      txHash: tx.hash,
                      asset,
                      contractAddress: null,
                      timestamp: tmstmp,
                      value: tx.value,
                      gasPrice: tx.gasPrice,
                    };
                    rmqServices.sendPubSubMessage(txMsgFrom);
                    // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
                    hashMaps.pendingTx.set(tx.hash, {
                      pillarId: toPillarId,
                      protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                      fromAddress: tx.from,
                      toAddress: tx.to,
                      txHash: tx.hash,
                      asset,
                      contractAddress: null,
                      timestamp: tmstmp,
                      value: tx.value,
                      gasPrice: tx.gasPrice,
                    });
                  } else {
                    // HOUSEKEEPER STORES TX IN DB
                    dbServices.dbCollections.transactions.addTx({
                      pillarId: fromPillarId,
                      protocol: 'Ethereum',
                      fromAddress: tx.from,
                      toAddress: tx.to,
                      txHash: tx.hash,
                      asset,
                      contractAddress: null,
                      timestamp: tmstmp,
                      blockNumber: null,
                      value: tx.value,
                      status: 'pending',
                      gasPrice: tx.gasPrice,
                      gasUsed: null,
                    });
                  }
                  logger.info(colors.yellow(`TRANSACTION PENDING: ${tx.hash}\n${value} ETH\nFROM: PILLAR WALLET ${tx.from}\nTO: PILLAR WALLET ${tx.to}\n`));
                } else {
                  logger.info(colors.yellow(`TRANSACTION PENDING: ${tx.hash}\n${value} ETH\nFROM: EXTERNAL ETH ACCOUNT ${tx.from}\nTO: PILLAR WALLET ${tx.to}\n`));
                }
                resolve(true);
              } else if (toERC20SmartContract) { // RECIPIENT ADDRESS === SMART CONTRACT ADDRESS
                const contractAddress = tx.to;
                abiDecoder.addABI(ERC20ABI);
                const data = abiDecoder.decodeMethod(tx.input);
                if (data !== undefined) { // TRANSACTION CARRIES INPUT DATA
                  if (value !== 0) { // TRANSACTION VALUE !== 0 THEREFORE...
                    const asset = 'ETH'; // ... TRANSACTION MUST BE ETH TRANSFER (TO A SMART CONTRACT BECAUSE RECIPIENT ADDRESS === SMART CONTRACT ADDRESS)

                    if (fromPillarAccount) { // SENDER ADDRESS === PILLAR ADDRESS
                      if (isPublisher) {
                        // SEND NEW TX DATA TO SUBSCRIBER MSG QUEUE
                        const txMsgFrom = {
                          type: 'newTx',
                          pillarId: fromPillarId,
                          protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                          fromAddress: tx.from,
                          toAddress: tx.to,
                          txHash: tx.hash,
                          asset,
                          contractAddress,
                          timestamp: tmstmp,
                          value: tx.value,
                          gasPrice: tx.gasPrice,
                        };
                        rmqServices.sendPubSubMessage(txMsgFrom);
                        // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
                        hashMaps.pendingTx.set(tx.hash, {
                          pillarId: toPillarId,
                          protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                          fromAddress: tx.from,
                          toAddress: tx.to,
                          txHash: tx.hash,
                          asset,
                          contractAddress,
                          timestamp: tmstmp,
                          value: tx.value,
                          gasPrice: tx.gasPrice,
                        });
                      } else {
                        // HOUSEKEEPER STORES TX IN DB
                        dbServices.dbCollections.transactions.addTx({
                          pillarId: fromPillarId,
                          protocol: 'Ethereum',
                          fromAddress: tx.from,
                          toAddress: tx.to,
                          txHash: tx.hash,
                          asset,
                          contractAddress,
                          timestamp: tmstmp,
                          blockNumber: null,
                          value: tx.value,
                          status: 'pending',
                          gasPrice: tx.gasPrice,
                          gasUsed: null,
                        });
                      }
                      logger.info(colors.yellow(`TRANSACTION PENDING: ${tx.hash}\n${value} ETH\nFROM: PILLAR WALLET ${tx.from}\nTO: ${ticker} SMART CONTRACT ${contractAddress}\nDATA:\n`));
                      resolve(true);
                    } else {
                      resolve(false);
                    }
                  } else { // TRANSACTION VALUE === 0 THEREFORE TRANSACTION IS A SMART CONTRACT CALL
                    // (BECAUSE RECIPIENT ADDRESS === SMART CONTRACT ADDRESS
                    // AND TRANSACTION CARRIES INPUT DATA)
                    const asset = ticker;
                    if (fromPillarAccount) { // SENDER ADDRESS === PILLAR WALLET ADDRESS
                      logger.info(colors.cyan(`SMART CONTRACT CALL: ${tx.hash}\nFROM: PILLAR WALLET ${tx.from}\nTO: ${ticker} SMART CONTRACT ${contractAddress}\n`));

                      if (data.name === 'transfer') { // TRANSACTION IS A TOKEN TRANSFER SMART CONTRACT CALL
                        value = (parseInt(data.params[1].value, 10) * (10 ** -18)).toString();
                        // ^ TOKEN TRANSFER VALUE IS CARRIED IN TRANSACTION INPUT DATA
                        const to = data.params[0].value;
                        // ^ TOKEN TRANSFER RECIPIENT ADDRESS IS CARRIED IN TRANSACTION INPUT DATA

                        if (isPublisher) {
                          // SEND NEW TX DATA TO SUBSCRIBER MSG QUEUE
                          const txMsgFrom = {
                            type: 'newTx',
                            pillarId: fromPillarId,
                            protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                            fromAddress: tx.from,
                            toAddress: to,
                            txHash: tx.hash,
                            asset,
                            contractAddress,
                            timestamp: tmstmp,
                            value: parseInt(data.params[1].value, 10),
                            gasPrice: tx.gasPrice,
                          };
                          rmqServices.sendPubSubMessage(txMsgFrom);
                          // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
                          hashMaps.pendingTx.set(tx.hash, {
                            pillarId: toPillarId,
                            protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                            fromAddress: tx.from,
                            toAddress: to,
                            txHash: tx.hash,
                            asset,
                            contractAddress,
                            timestamp: tmstmp,
                            value: parseInt(data.params[1].value, 10),
                            gasPrice: tx.gasPrice,
                          });
                        } else {
                          // HOUSEKEEPER STORES TX IN DB
                          dbServices.dbCollections.transactions.addTx({
                            pillarId: fromPillarId,
                            protocol: 'Ethereum',
                            fromAddress: tx.from,
                            toAddress: to,
                            txHash: tx.hash,
                            asset,
                            contractAddress,
                            timestamp: tmstmp,
                            blockNumber: null,
                            value: tx.value,
                            status: 'pending',
                            gasPrice: tx.gasPrice,
                            gasUsed: null,
                          });
                        }
                        module.exports.filterAddress(to, isPublisher)
                          .then((result3) => {
                            toPillarAccount = result3.isPillarAddress;
                            if (toPillarAccount) { // RECIPIENT ADDRESS === PILLAR WALLET ADDRESS
                              if (isPublisher) {
                                // SEND NEW TX DATA TO SUBSCRIBER MSG QUEUE
                                const txMsgTo = {
                                  type: 'newTx',
                                  pillarId: toPillarId,
                                  protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                                  fromAddress: tx.from,
                                  toAddress: to,
                                  txHash: tx.hash,
                                  asset,
                                  contractAddress,
                                  timestamp: tmstmp,
                                  value: parseInt(data.params[1].value, 10),
                                  gasPrice: tx.gasPrice,
                                };
                                rmqServices.sendPubSubMessage(txMsgTo);
                                // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
                                hashMaps.pendingTx.set(tx.hash, {
                                  pillarId: toPillarId,
                                  protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                                  fromAddress: tx.from,
                                  toAddress: to,
                                  txHash: tx.hash,
                                  asset,
                                  contractAddress,
                                  timestamp: tmstmp,
                                  value: parseInt(data.params[1].value, 10),
                                  gasPrice: tx.gasPrice,
                                });
                              } else {
                                // HOUSEKEEPER STORES TX IN DB
                                dbServices.dbCollections.transactions.addTx({
                                  pillarId: toPillarId,
                                  protocol: 'Ethereum',
                                  fromAddress: tx.from,
                                  toAddress: to,
                                  txHash: tx.hash,
                                  asset,
                                  contractAddress,
                                  timestamp: tmstmp,
                                  blockNumber: null,
                                  value: tx.value,
                                  status: 'pending',
                                  gasPrice: tx.gasPrice,
                                  gasUsed: null,
                                });
                              }
                              logger.info(colors.cyan(`${ticker} TOKEN TRANSFER:\n${value} ${ticker}\nFROM PILLAR WALLET: ${tx.from}\nTO PILLAR WALLET: ${to}\n`));
                            } else {
                              logger.info(colors.cyan.bold(`${ticker} TOKEN TRANSFER:\n${value} ${ticker}\nFROM PILLAR WALLET: ${tx.from}\nTO EXTERNAL ETH ACCOUNT: ${to}\n`));
                            }
                            resolve(true);
                          })
                          .catch((e) => {
                            reject(e);
                          });
                      } else {
                        // TRANSACTION IS A ZERO-VALUE ERC20 SMART CONTRACT CALL
                        // (BUT NOT A TOKEN TRANSFER) FROM A PILLAR WALLET
                        if (isPublisher) {
                          // SEND NEW TX DATA TO SUBSCRIBER MSG QUEUE
                          const txMsgFrom = {
                            type: 'newTx',
                            pillarId: fromPillarId,
                            protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                            fromAddress: tx.from,
                            toAddress: contractAddress,
                            txHash: tx.hash,
                            asset,
                            contractAddress,
                            timestamp: tmstmp,
                            value: tx.value,
                            gasPrice: tx.gasPrice,
                          };
                          rmqServices.sendPubSubMessage(txMsgFrom);
                          // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
                          hashMaps.pendingTx.set(tx.hash, {
                            pillarId: toPillarId,
                            protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                            fromAddress: tx.from,
                            toAddress: contractAddress,
                            txHash: tx.hash,
                            asset,
                            contractAddress,
                            timestamp: tmstmp,
                            value: tx.value,
                            gasPrice: tx.gasPrice,
                          });
                        } else {
                          // HOUSEKEEPER STORES TX IN DB
                          dbServices.dbCollections.transactions.addTx({
                            pillarId: fromPillarId,
                            protocol: 'Ethereum',
                            fromAddress: tx.from,
                            toAddress: contractAddress,
                            txHash: tx.hash,
                            asset,
                            contractAddress,
                            timestamp: tmstmp,
                            blockNumber: null,
                            value: tx.value,
                            status: 'pending',
                            gasPrice: tx.gasPrice,
                            gasUsed: null,
                          });
                        }
                        resolve(true);
                      }
                    } else if (data.name === 'transfer') { // TRANSACTION SENDER ADDRESS !== PILLAR ACCOUNT ADDRESS
                      // AND TRANSACTION IS A TOKEN TRANSFER SMART CONTRACT CALL
                      value = (parseInt(data.params[1].value, 10) * (10 ** -18)).toString();
                      // ^ TOKEN TRANSFER VALUE IS CARRIED IN TRANSACTION INPUT DATA
                      const to = data.params[0].value;
                      // ^ TOKEN TRANSFER RECIPIENT ADDRESS IS CARRIED IN TRANSACTION INPUT DATA
                      module.exports.filterAddress(to, isPublisher)
                        .then((result4) => {
                          toPillarAccount = result4.isPillarAddress;
                          if (toPillarAccount) { // RECIPIENT ADDRESS === PILLAR ACCOUNT ADDRESS
                            if (isPublisher) {
                              // SEND NEW TX DATA TO SUBSCRIBER MSG QUEUE
                              const txMsgTo = {
                                type: 'newTx',
                                pillarId: toPillarId,
                                protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                                fromAddress: tx.from,
                                toAddress: to,
                                txHash: tx.hash,
                                asset,
                                contractAddress,
                                timestamp: tmstmp,
                                value: parseInt(data.params[1].value, 10),
                                gasPrice: tx.gasPrice,
                              };
                              rmqServices.sendPubSubMessage(txMsgTo);
                              // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
                              hashMaps.pendingTx.set(tx.hash, {
                                pillarId: toPillarId,
                                protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                                fromAddress: tx.from,
                                toAddress: to,
                                txHash: tx.hash,
                                asset,
                                contractAddress,
                                timestamp: tmstmp,
                                value: parseInt(data.params[1].value, 10),
                                gasPrice: tx.gasPrice,
                              });
                            } else {
                              // HOUSEKEEPER STORES TX IN DB
                              dbServices.dbCollections.transactions.addTx({
                                pillarId: toPillarId,
                                protocol: 'Ethereum',
                                fromAddress: tx.from,
                                toAddress: to,
                                txHash: tx.hash,
                                asset,
                                contractAddress,
                                timestamp: tmstmp,
                                blockNumber: null,
                                value: tx.value,
                                status: 'pending',
                                gasPrice: tx.gasPrice,
                                gasUsed: null,
                              });
                            }
                            logger.info(colors.cyan(`${ticker} TOKEN TRANSFER:\n${value} ${ticker}\nFROM EXTERNAL ETH ACCOUNT: ${tx.from}\nTO PILLAR WALLET: ${to}\n`));
                            resolve(true);
                          } else {
                            resolve(false);
                          }
                        })
                        .catch((e) => {
                          reject(e);
                        });
                    } else {
                      // TX IS SMART CONTRACT CALL (CARRIES INPUT DATA)
                      // FROM EXTERNAL ETH ACCOUNT AND NOT A TOKEN TRANSFER
                      resolve(false);
                    }
                  }
                } else if (fromPillarAccount) {
                  // TRANSACTION RECIPIENT ADDRESS === SMART CONTRACT ADDRESS
                  // AND SENDER ADDRESS === PILLAR ACCOUNT ADDRESS
                  // BUT TRANSACTION DOES NOT CARRY INPUT DATA...
                  const asset = 'ETH'; // ... THEREFORE TRANSACTION MUST BE AN ETH TRANSFER TO A SMART CONTRACT
                  if (isPublisher) {
                    // SEND NEW TX DATA TO SUBSCRIBER MSG QUEUE
                    const txMsgFrom = {
                      type: 'newTx',
                      pillarId: fromPillarId,
                      protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                      fromAddress: tx.from,
                      toAddress: contractAddress,
                      txHash: tx.hash,
                      asset,
                      contractAddress,
                      timestamp: tmstmp,
                      value: tx.value,
                      gasPrice: tx.gasPrice,
                    };
                    rmqServices.sendPubSubMessage(txMsgFrom);
                    // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
                    hashMaps.pendingTx.set(tx.hash, {
                      pillarId: toPillarId,
                      protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                      fromAddress: tx.from,
                      toAddress: contractAddress,
                      txHash: tx.hash,
                      asset,
                      contractAddress,
                      timestamp: tmstmp,
                      value: tx.value,
                      gasPrice: tx.gasPrice,
                    });
                  } else {
                    // HOUSEKEEPER STORES TX IN DB
                    dbServices.dbCollections.transactions.addTx({
                      pillarId: fromPillarId,
                      protocol: 'Ethereum',
                      fromAddress: tx.from,
                      toAddress: contractAddress,
                      txHash: tx.hash,
                      asset,
                      contractAddress,
                      timestamp: tmstmp,
                      blockNumber: null,
                      value: tx.value,
                      status: 'pending',
                      gasPrice: tx.gasPrice,
                      gasUsed: null,
                    });
                  }
                  logger.info(colors.yellow(`TANSACTION PENDING: ${tx.hash}\n${value} ETH\nFROM: PILLAR WALLET ${tx.from}\nTO: ERC20 SMART CONTRACT ${tx.to}\n`));
                  resolve(true);
                } else {
                  // TX RECIPIENT IS A SMART CONTRACT,
                  // TX SENDER IS AN EXTERNAL ETH ACCOUNT (NOT A PILLAR WALLET)
                  // AND TX DOES NOT CARRY INPUT DATA,
                  // SO TX IS AN ETH TRANSFER TO A SMART CONTRACT FROM AN EXTERNAL ETH ACCOUNT
                  resolve(false);
                }
              } else if (fromPillarAccount) { // TRANSACTION RECIPIENT IS NOT A PILLAR ACCOUNT
                // NOR IS IT A MONITORED ERC20 SMART CONTRACT
                // BUT TRANSACTION SENDER ADDRESS === PILLAR ACCOUNT ADDRESS
                const asset = 'ETH';
                if (isPublisher) {
                  // SEND NEW TX DATA TO SUBSCRIBER MSG QUEUE
                  const txMsgFrom = {
                    type: 'newTx',
                    pillarId: fromPillarId,
                    protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                    fromAddress: tx.from,
                    toAddress: tx.to,
                    txHash: tx.hash,
                    asset,
                    contractAddress: null,
                    timestamp: tmstmp,
                    value: tx.value,
                    gasPrice: tx.gasPrice,
                  };
                  rmqServices.sendPubSubMessage(txMsgFrom);
                  // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
                  hashMaps.pendingTx.set(tx.hash, {
                    pillarId: toPillarId,
                    protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                    fromAddress: tx.from,
                    toAddress: tx.to,
                    txHash: tx.hash,
                    asset,
                    contractAddress: null,
                    timestamp: tmstmp,
                    value: tx.value,
                    gasPrice: tx.gasPrice,
                  });
                } else {
                  // HOUSEKEEPER STORES TX IN DB
                  dbServices.dbCollections.transactions.addTx({
                    pillarId: fromPillarId,
                    protocol: 'Ethereum',
                    fromAddress: tx.from,
                    toAddress: tx.to,
                    txHash: tx.hash,
                    asset,
                    contractAddress: null,
                    timestamp: tmstmp,
                    blockNumber: null,
                    value: tx.value,
                    status: 'pending',
                    gasPrice: tx.gasPrice,
                    gasUsed: null,
                  });
                }
                logger.info(colors.yellow(`TANSACTION PENDING: ${tx.hash}\n${value} ETH\nFROM: PILLAR WALLET ${tx.from}\nTO: EXTERNAL ETH ACCOUNT OR SMART CONTRACT ${tx.to}\n`));
                resolve(true);
              } else {
                // TX IS NOT TO OR FROM A PILLAR WALLET AND IS NOT TO A SMART CONTRACT
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


function checkPendingTx(pendingTxArray, blockNumber, isPublisher = true) {
  return new Promise(((resolve, reject) => {
    if (pendingTxArray.length === 0) {
      resolve();
    } else {
      const txHash = pendingTxArray[0];
      const item = hashMaps.pendingTx.get(txHash);
      pendingTxArray.splice(0, 1);

      bcx.getTxInfo(item.txHash)
        .then((txInfo) => {
          if (txInfo != null) {
            if (txInfo.blockNumber != null) {
              const confBlockNb = txInfo.blockNumber;
              bcx.getTxReceipt(item.txHash)
                .then((receipt) => {
                  if (receipt != null) {
                    if (receipt.gasUsed <= txInfo.gas) { // TX MINED
                      const nbConf = 1 + (blockNumber - confBlockNb);
                      if (nbConf >= 1) {
                        const status = 'confirmed';
                        const confBlockNumber = confBlockNb;
                        const gasUsed = receipt.gasUsed;
                        if (isPublisher) {
                          // SEND UPDATED TX DATA TO SUBSCRIBER MSG QUEUE
                          const txMsg = {
                            type: 'updateTx',
                            txHash: item.txHash,
                            confBlockNumber,
                            status,
                            gasUsed,
                          };
                          rmqServices.sendPubSubMessage(txMsg);
                        } else {
                          // HOUSEKEEPER UPDATES TX IN DB
                          dbServices.dbCollections.transactions.updateTx({
                            txHash: item.txHash,
                            blockNumber,
                            status,
                            gasUsed,
                          });
                        }
                        logger.info(colors.green(`TRANSACTION ${item.txHash} CONFIRMED @ BLOCK # ${(blockNumber - nbConf) + 1}\n`));
                        hashMaps.pendingTx.delete(txHash);
                        resolve(checkPendingTx(pendingTxArray, blockNumber, isPublisher));
                      } else {
                        logger.info(colors.red.bold('WARNING: txInfo.blockNumber>=lastBlockNumber\n'));
                      }
                    } else { // OUT OF GAS
                      const status = 'failed: out of gas';
                      const confBlockNumber = confBlockNb;
                      const gasUsed = receipt.gasUsed;
                      if (isPublisher) {
                        // SEND UPDATED TX DATA TO SUBSCRIBER MSG QUEUE
                        const txMsg = {
                          type: 'updateTx',
                          txHash: item.txHash,
                          confBlockNumber,
                          status,
                          gasUsed,
                        };
                        rmqServices.sendPubSubMessage(txMsg);
                      } else {
                        // HOUSEKEEPER UPDATES TX IN DB
                        dbServices.dbCollections.transactions.updateTx({
                          txHash: item.txHash,
                          blockNumber,
                          status,
                          gasUsed,
                        });
                      }
                      logger.info(colors.red.bold(`TRANSACTION ${item.txHash} OUT OF GAS: FAILED! (status : out of gas)\n`));
                      hashMaps.pendingTx.delete(txHash);
                      resolve(checkPendingTx(pendingTxArray, blockNumber, isPublisher));
                    }
                  } else { // TX RECEIPT NOT FOUND
                    const status = 'failed: tx receipt not found';
                    const confBlockNumber = confBlockNb;
                    const gasUsed = null;
                    if (isPublisher) {
                      // SEND UPDATED TX DATA TO SUBSCRIBER MSG QUEUE
                      const txMsg = {
                        type: 'updateTx',
                        txHash: item.txHash,
                        confBlockNumber,
                        status,
                        gasUsed,
                      };
                      rmqServices.sendPubSubMessage(txMsg);
                    } else {
                      // HOUSEKEEPER UPDATES TX IN DB
                      dbServices.dbCollections.transactions.updateTx({
                        txHash: item.txHash,
                        blockNumber,
                        status,
                        gasUsed,
                      });
                    }
                    logger.info(colors.red.bold(`TRANSACTION ${item.txHash}: TX RECEIPT NOT FOUND: FAILED! (status : tx receipt not found)\n`));
                    hashMaps.pendingTx.delete(txHash);
                    resolve(checkPendingTx(pendingTxArray, blockNumber, isPublisher));
                  }
                })
                .catch((e) => {
                  reject(e);
                });
            } else { // TX STILL PENDING
              logger.info(`TX ${item.txHash} STILL PENDING (IN TX POOL)...\n`);
              resolve(checkPendingTx(pendingTxArray, blockNumber, isPublisher));
            }
          } else { // TX INFO NOT FOUND
            const status = 'failed: tx info not found';
            const confBlockNumber = null;
            const gasUsed = null;
            if (isPublisher) {
              // SEND UPDATED TX DATA TO SUBSCRIBER MSG QUEUE
              const txMsg = {
                type: 'updateTx',
                txHash: item.txHash,
                confBlockNumber,
                status,
                gasUsed,
              };
              rmqServices.sendPubSubMessage(txMsg);
            } else {
              // HOUSEKEEPER UPDATES TX IN DB
              dbServices.dbCollections.transactions.updateTx({
                txHash: item.txHash,
                blockNumber,
                status,
                gasUsed,
              });
            }
            logger.info(colors.red.bold(`TRANSACTION ${item.txHash} NOT FOUND IN TX POOL OR BLOCKCHAIN: FAILED! (status : tx info not found)\n`));
            hashMaps.pendingTx.delete(txHash);
            resolve(checkPendingTx(pendingTxArray, blockNumber, isPublisher));
          }
        })
        .catch((e) => {
          reject(e);
        });
    }
  }));
}

module.exports.checkPendingTx = checkPendingTx;


function filterAddress(address, isPublisher) {
  /* CHECKS IF ADDRESS IS ONE OF THE MONITORED ADDRESSES REGISTERED IN THE DATABASE */
  return new Promise(((resolve, reject) => {
    try {
      // const ADDRESS = address.toUpperCase();
      if (isPublisher === false) {
        dbServices.dbCollections.accounts.findByAddress(address.toLowerCase)
          .then((result) => {
            if (result) {
              resolve({
                isPillarAddress: true,
                pillarId: result.pillarId,
                isERC20SmartContract: false,
                ERC20SmartContractTicker: '',
              });
            } else {
              dbServices.dbCollections.assets.findByAddress(address.toLowerCase)
                .then((result2) => {
                  if (result2) {
                    const ticker = result2.symbol;
                    resolve({
                      isPillarAddress: false,
                      pillarId: null,
                      isERC20SmartContract: true,
                      ERC20SmartContractTicker: ticker,
                    });
                  } else {
                    resolve({
                      isPillarAddress: false,
                      pillarId: null,
                      isERC20SmartContract: false,
                      ERC20SmartContractTicker: null,
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
      } else if (hashMaps.accounts.has(address.toLowerCase())) {

        const pillarId = hashMaps.accounts.get(address.toLowerCase());
        resolve({
          isPillarAddress: true,
          pillarId,
          isERC20SmartContract: false,
          ERC20SmartContractTicker: null,
        });
      } else if (hashMaps.assets.has(address.toLowerCase())) {
        resolve({
          isPillarAddress: false,
          pillarId: null,
          isERC20SmartContract: true,
          ERC20SmartContractTicker: 'ticker', // NEED TO ADD ASSET TICKER IN HASHMAP
        });
      } else {
        resolve({
          isPillarAddress: false,
          pillarId: null,
          isERC20SmartContract: false,
          ERC20SmartContractTicker: null,
        });
      }
    } catch (e) {
      resolve({
        isPillarAddress: false,
        pillarId: null,
        isERC20SmartContract: false,
        ERC20SmartContractTicker: null,
      });
    }
  }));
}

module.exports.filterAddress = filterAddress;


function checkTokenTransferEvent(eventInfo, ERC20SmartcContractInfo) {
  // THIS IS TO CATCH TOKEN TRANSFERS THAT RESULT FROM SENDING ETH TO A
  // SMART CONTRACT (WHICH IN RETURN TRANSFERS TOKENS TO ETH SENDER)
  return new Promise(((resolve, reject) => {
    try {
      const tmstmp = time.now();
      logger.info(eventInfo);
      module.exports.filterAddress(eventInfo.returnValues._to, true)
      // ^ check if token transfer destination address is pillar wallet
        .then((result) => {
          if (result.isPillarAddress === true) {
            // ^ TOKEN TRANSFER DESTINATION ADDRESS === PILLAR ACCOUNT ADDRESS
            const pillarId = result.pillarId;
            dbServices.dbCollections.transactions.findByTxHash(eventInfo.transactionHash)
            // ETH TX SHOULD BE ALREADY IN DB BECAUSE
            // ETH WAS SENT TO SMART CONTRACT BY PILLAR WALLET
              .then((tx) => {
                if (tx.asset === 'ETH') { // check is it is regular token transfer,
                  // if so (asset === TOKEN): resolve (because token transfer already processed),
                  // otherwise (asset === ETH) transfer needs to be processed here:
                  const value = eventInfo.returnValues._value * (10 ** -ERC20SmartcContractInfo.decimals);
                  logger.info(colors.red.bold('TOKEN TRANSFER EVENT:\n'));
                  logger.info(colors.red(`${value} ${ERC20SmartcContractInfo.ticker}\n`));
                  logger.info(colors.red(`FROM: ${ERC20SmartcContractInfo.ticker} SMART CONTRACT ${ERC20SmartcContractInfo.address}\n`));
                  logger.info(colors.red(`TO: PILLAR WALLET ${eventInfo.returnValues._to}\n`));

                  // SEND NEW TX DATA TO SUBSCRIBER MSG QUEUE
                  const txMsg = {
                    type: 'newTx',
                    pillarId, // RECIPIENT PILLAR ID, NEED TO FIND IT IN HASH TABLE
                    protocol: 'Ethereum', // WHERE DO WE GET THIS INFO FROM? IS IT A PUBLISHER INSTANCE ATTRIBUTE?
                    fromAddress: ERC20SmartcContractInfo.address,
                    toAddress: eventInfo.returnValues._to,
                    txHash: eventInfo.transactionHash,
                    asset: ERC20SmartcContractInfo.ticker,
                    contractAddress: ERC20SmartcContractInfo.address,
                    timestamp: tmstmp,
                    value: eventInfo.returnValues._value,
                    gasPrice: eventInfo.gasPrice,
                    // blockNumber,
                    // gasUsed,
                    status: 'confirmed',
                  };
                  rmqServices.sendPubSubMessage(txMsg);
                  resolve();
                } else {
                  resolve();
                }
              })
              .catch((e) => {
                reject(e);
              });
          } else {
            resolve();
          }
        })
        .catch((e) => {
          reject(e);
        });
    } catch (e) {
      reject(e);
    }
  }));
}

module.exports.checkTokenTransferEvent = checkTokenTransferEvent;

