/** @module processTx.js */
const time = require('unix-timestamp');
const logger = require('../utils/logger.js');
const dbServices = require('./dbServices.js');
const rmqServices = require('./rmqServices.js');
const abiDecoder = require('abi-decoder');
const ERC20ABI = require('./ERC20ABI');
const hashMaps = require('../utils/hashMaps.js');

/**
 * Check if given transaction is relevant and store in the database
 * @param {any} tx - the transaction object
 * @param {any} protocol - the transaction object
 */
function storeIfRelevant(tx, protocol) {
    const tmstmp = time.now();
<<<<<<< HEAD
    let toERC20SmartContract;
    let ticker;
    let toPillarAccount;
    let toPillarId;
    let fromPillarAccount;
    let fromPillarId;
    if (tx.to == null) { // SMART CONTRACT CREATION TRANSACTION
      resolve(false);
    } else { // REGULAR TRANSACTION OR SMART CONTRACT CALL
      module.exports.filterAddress(tx.to, isPublisher, recoverAddress)
        .then((result) => {
          toPillarAccount = result.isPillarAddress;
	        toPillarId = result.pillarId;
          toERC20SmartContract = result.isERC20SmartContract;
          ticker = result.ERC20SmartContractTicker;
          module.exports.filterAddress(tx.from, isPublisher, recoverAddress)
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
                        value = (parseFloat(data.params[1].value) * (10 ** -18)).toString();
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
                            value: parseFloat(data.params[1].value),
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
                            value: parseFloat(data.params[1].value),
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
                        module.exports.filterAddress(to, isPublisher, recoverAddress)
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
                                  value: parseFloat(data.params[1].value),
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
                                  value: parseFloat(data.params[1].value),
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
                      value = (parseFloat(data.params[1].value) * (10 ** -18)).toString();
                      // ^ TOKEN TRANSFER VALUE IS CARRIED IN TRANSACTION INPUT DATA
                      const to = data.params[0].value;
                      // ^ TOKEN TRANSFER RECIPIENT ADDRESS IS CARRIED IN TRANSACTION INPUT DATA
	                    module.exports.filterAddress(to, isPublisher, recoverAddress)
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
                                value: parseFloat(data.params[1].value),
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
                                value: parseFloat(data.params[1].value),
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
=======
    var pillarId = '';
    var data, value;
    from = tx.from;
    to = tx.to;
    var status = (tx.status === '0x1' ? 'confirmed' : 'failed');
    var hash = tx.transactionHash;
    if ((tx.to !== null) && hashMaps.accounts.has(tx.to.toLowerCase())) {
        //fetch the pillarId corresponding to the to address and
        pillarId = hashMaps.accounts.get(tx.to.toLowerCase());
    } else if ((tx.from !== null) && hashMaps.accounts.has(tx.from.toLowerCase())) {
        pillarId = hashMaps.accounts.get(tx.from.toLowerCase());
    }
    if(!hashMaps.assets.has(tx.to.toLowerCase())) { 
        asset = 'ETH';
        value = tx.value;
    } else {
        //fetch the asset from the assets hashmap
        const contractDetail = hashMaps.assets.get(tx.to.toLowerCase());
        contractAddress = contractDetail.contractAddress;
        asset = contractDetail.symbol;
        abiDecoder.addABI(ERC20ABI);
        data = abiDecoder.decodeMethod(tx.input);
        if ((data !== undefined) && (data.name === 'transfer')) { 
            //smart contract call hence the asset must be the token name
            to = data.params[0].value;
            value = data.params[1].value;
        }
    }
    
    if(pillarId !== '') {
        dbServices.dbCollections.transactions.findOneByTxHash(hash).then((txn) => {
            if (txn === null) {
                let entry = {
                    pillarId,
                    protocol,
                    toAddress: to,
                    fromAddress: from,
                    txHash: hash,
>>>>>>> develop
                    asset,
                    contractAddress: null,
                    timestamp: tmstmp,
                    value,
                    gasPrice: tx.gasPrice,
                    blockNumber: tx.blockNumber,
                    status
                };
                logger.debug('processTx.saveIfRelevant(): Saving transaction into the database: ' + entry);
                dbServices.dbCollections.transactions.addTx(entry);
            }
            throw new Error('newTx: Transaction already exists');
        })
    } else {
        logger.debug('processTx.storeIfRelevant(): ignoring txn as its not relevant!');
    } 
}
<<<<<<< HEAD
module.exports.checkPendingTx = checkPendingTx;


function filterAddress(address, isPublisher, recoverAddress = null) {
  /* CHECKS IF ADDRESS IS ONE OF THE MONITORED ADDRESSES REGISTERED IN THE DATABASE */
  return new Promise(((resolve, reject) => {
    try {
      if (recoverAddress && recoverAddress.toLowerCase() === address.toLowerCase()) {
        dbServices.dbCollections.accounts.findByAddress(recoverAddress.toLowerCase())
          .then((result) => {
            if (result) {
              resolve({
                isPillarAddress: true,
                pillarId: result.pillarId,
                isERC20SmartContract: false,
                ERC20SmartContractTicker: '',
              });
            } else {
              resolve({
                isPillarAddress: false,
                pillarId: null,
                isERC20SmartContract: false,
                ERC20SmartContractTicker: null,
              });
            }
          });
      } else if (isPublisher === false) {
        dbServices.dbCollections.accounts.findByAddress(address.toLowerCase())
          .then((result) => {
            if (result) {
              resolve({
                isPillarAddress: true,
                pillarId: result.pillarId,
                isERC20SmartContract: false,
                ERC20SmartContractTicker: '',
              });
            } else {
              dbServices.dbCollections.assets.findByAddress(address.toLowerCase())
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
        const theAsset = hashMaps.assets.get(address.toLowerCase());
        resolve({
          isPillarAddress: false,
          pillarId: null,
          isERC20SmartContract: true,
          ERC20SmartContractTicker: theAsset.symbol, // NEED TO ADD ASSET TICKER IN HASHMAP
          //ERC20SmartContractTicker: 'ticker', // NEED TO ADD ASSET TICKER IN HASHMAP
        });
=======
module.exports.storeIfRelevant = storeIfRelevant;

/**
 * Store the new pending transaction in memeory if the transaction corresponds
 * to a monitored wallet.
 * @param {any} tx - the transaction object
 * @param {any} protocol - the transaction object
 */
function newPendingTran(tx, protocol) {
  try {
    logger.debug('processTx.newPendingTran(): validating transaction: ' + JSON.stringify(tx));
    const tmstmp = time.now();
    var pillarId = '';
    var asset, contractAddress, data, from, to, value, hash;
    from = ((typeof tx.from !== 'undefined') ? tx.from : tx.fromAddress);
    to = ((typeof tx.to !== 'undefined') ? tx.to : tx.toAddress);
    hash = ((typeof tx.hash !== 'undefined') ? tx.hash : tx.txHash);
    //ignore contract creation transactions, these have the to as null
    if(to === null) {
        logger.debug('processTx.newPendingTran(): txn ' + hash + ' looks like a probable contract deployment');
        hashMaps.pendingAssets.set(hash,tx);
    }
    if(from !== null && to !== null) {
      logger.debug('processTx.newPendingTran(): txn ' + hash+ ' from= ' + from + ' to= ' + to);
      if ((to !== null) && hashMaps.accounts.has(to.toLowerCase())) {
          //fetch the pillarId corresponding to the to address and
          pillarId = hashMaps.accounts.get(to.toLowerCase());
      } else if ((from !== null) && hashMaps.accounts.has(from.toLowerCase())) {
          pillarId = hashMaps.accounts.get(from.toLowerCase());
      }
      if(!hashMaps.assets.has(to.toLowerCase())) { 
          asset = 'ETH';
          value = tx.value;
>>>>>>> develop
      } else {
          //fetch the asset from the assets hashmap
          const contractDetail = hashMaps.assets.get(to.toLowerCase());
          contractAddress = contractDetail.contractAddress;
          asset = contractDetail.symbol;
          abiDecoder.addABI(ERC20ABI);
          data = abiDecoder.decodeMethod(tx.input);
          logger.debug('ethService.newPendingTran(): Identified a new pending transaction involving monitored asset: ' + asset);
          logger.debug('ethService.newPendingTran(): tx.input= ' + tx.input + ' data is ' + JSON.stringify(data));
          if ((data !== 'undefined') && (data.name === 'transfer')) { 
              //smart contract call hence the asset must be the token name
              to = data.params[0].value;
              value = data.params[1].value;
          } else {
              value = tx.value;
          }
      }
      
      //logger.debug('processTx.newPendingTran(): ' + pillarId + ' tx: ' + JSON.stringify(tx));
      if(pillarId !== '') {
          //send a message to the notifications queue reporting a new transactions
          const txMsgTo = {
              type: 'newTx',
              pillarId: pillarId,
              protocol: protocol, 
              fromAddress: from,
              toAddress: to,
              txHash: hash,
              asset,
              contractAddress: contractAddress,
              timestamp: tmstmp,
              value: value,
              gasPrice: tx.gasPrice,
              blockNumber: tx.blockNumber,
              status: 'pending'
          };
          logger.debug('processTx.newPendingTran() notifying subscriber of a new relevant transaction: ' + JSON.stringify(txMsgTo));

          rmqServices.sendPubSubMessage(txMsgTo);
          // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
          hashMaps.pendingTx.set(tx.hash, txMsgTo);
      }
    }
  }catch(e) {
    logger.error('processTx.newPendingTran(): failed with error ' + e + ' for txn: ' + tx.hash);
  }
}
module.exports.newPendingTran = newPendingTran;

/**
 * Validated if the wallets involved in a monitored token transfer needs to be persisted in database
 * @param {any} evnt - the event associated with the token transfer
 * @param {String} theContract - the smart contract address associated with the token
 * @param {String} protocol - the protocol corresponding to the token blockchain
 */
function checkTokenTransfer(evnt, theContract, protocol) {
    return new Promise(((resolve, reject) => {
        var pillarId;
        if (hashMaps.accounts.has(evnt.returnValues._to.toLowerCase())) {
            pillarId = hashMaps.accounts.get(evnt.returnValues._to.toLowerCase());
        } else if(hashMaps.accounts.has(evnt.returnValues._from.toLowerCase())) {
            pillarId = hashMaps.accounts.get(evnt.returnValues._from.toLowerCase());
        } 
        dbServices.dbCollections.transactions.findByTxHash(eventInfo.transactionHash)
        // ETH TX SHOULD BE ALREADY IN DB BECAUSE
        // ETH WAS SENT TO SMART CONTRACT BY PILLAR WALLET
            .then((tx) => {
                if (tx.asset === 'ETH') { 
                    // check is it is regular token transfer,
                    // if so (asset === TOKEN): resolve (because token transfer already processed),
                    // otherwise (asset === ETH) transfer needs to be processed here:
                    // SEND NEW TX DATA TO SUBSCRIBER MSG QUEUE
                    const txMsg = {
                        type: 'newTx',
                        pillarId, 
                        protocol: protocol, 
                        fromAddress: theContract.address,
                        toAddress: evnt.returnValues._to,
                        txHash: evnt.transactionHash,
                        asset: theContract.ticker,
                        contractAddress: theContract.address,
                        timestamp: tmstmp,
                        value: evnt.returnValues._value,
                        gasPrice: evnt.gasPrice,
                        blockNumber: evnt.blockNumber,
                        status: 'confirmed',
                    };
                    logger.debug('processTx.checkTokenTransfer(): notifying subscriber of new tran: ' + JSON.stringify(txMsg));
                    rmqServices.sendPubSubMessage(txMsg);
                    resolve();
                } else {
                    resolve();
                }
            })
            .catch((e) => { reject(e); });
    }));
}
module.exports.checkTokenTransfer = checkTokenTransfer;