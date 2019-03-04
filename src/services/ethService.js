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

/** @module ethService.js */
const bluebird = require('bluebird');
const logger = require('../utils/logger');
const Web3 = require('web3');
const helpers = require('web3-core-helpers');
const BigNumber = require('bignumber.js');
require('dotenv').config();
const fs = require('fs');
const abiPath = `${require('app-root-path')}/src/abi/`;
const abiDecoder = require('abi-decoder');
const ERC20ABI = require('../abi/ERC20ABI');
const ERC721ABI = require('../abi/ERC721ABI');
const processTx = require('./processTx');
const rmqServices = require('./rmqServices');
const hashMaps = require('../utils/hashMaps');
const redis = require('redis');

const protocol = 'Ethereum';
const gethURL = `${process.env.GETH_NODE_URL}:${process.env.GETH_NODE_PORT}`;
let web3;
let wsCnt = 0;
const client = redis.createClient();
bluebird.promisifyAll(redis);

/**
 * Establish connection to the geth node
 */
function connect() {
  return new Promise((resolve, reject) => {
    try {
      if (web3 === undefined || !web3.eth.isSyncing()) {
        web3 = new Web3(new Web3.providers.WebsocketProvider(gethURL));
        /**
         * extend Web3 functionality by including parity trace functions
         */
        web3.extend({
          property: 'trace',
          methods: [
            new web3.extend.Method({
              name: 'call',
              call: 'trace_call',
              params: 3,
              inputFormatter: [
                helpers.formatters.inputCallFormatter,
                null,
                helpers.formatters.inputDefaultBlockNumberFormatter,
              ],
            }),
            new web3.extend.Method({
              name: 'rawTransaction',
              call: 'trace_rawTransaction',
              params: 2,
            }),
            new web3.extend.Method({
              name: 'replayTransaction',
              call: 'trace_replayTransaction',
              params: 2,
            }),
            new web3.extend.Method({
              name: 'block',
              call: 'trace_block',
              params: 1,
              inputFormatter: [
                helpers.formatters.inputDefaultBlockNumberFormatter,
              ],
            }),
            new web3.extend.Method({
              name: 'filter',
              call: 'trace_filter',
              params: 1,
            }),
            new web3.extend.Method({
              name: 'get',
              call: 'trace_get',
              params: 2,
            }),
            new web3.extend.Method({
              name: 'transaction',
              call: 'trace_transaction',
              params: 1,
            }),
          ],
        });
        web3._provider.on('end', eventObj => {
          logger.error(
            'Websocket disconnected!! Restarting connection....',
            eventObj,
          );
          web3 = new Web3(new Web3.providers.WebsocketProvider(gethURL));
        });
        web3._provider.on('close', eventObj => {
          logger.error(
            'Websocket disconnected!! Restarting connection....',
            eventObj,
          );
          web3 = new Web3(new Web3.providers.WebsocketProvider(gethURL));
        });
        web3._provider.on('error', eventObj => {
          logger.error(
            'Websocket disconnected!! Restarting connection....',
            eventObj,
          );
          web3 = new Web3(new Web3.providers.WebsocketProvider(gethURL));
        });
        logger.info(
          `ethService.connect(): Connection to ${gethURL} established successfully!`,
        );
        module.exports.web3 = web3;
        resolve(true);
      } else {
        resolve(true);
      }
    } catch (e) {
      logger.error(`ethService.connect() failed with error: ${e}`);
      reject(new Error(false));
    }
  });
}
module.exports.connect = connect;

/**
 * Return an instance to the underlying web3 instance
 */
function getWeb3() {
  logger.info(
    'ethService.getWeb3(): fetches the current instance of web3 object',
  );
  return new Promise((resolve, reject) => {
    if (module.exports.connect()) {
      resolve(web3);
    } else {
      reject();
    }
  });
}
module.exports.getWeb3 = getWeb3;

/**
 * Subscribe to geth WS event corresponding to new pending transactions.
 */
function subscribePendingTxn() {
  logger.info(
    'ethService.subscribePendingTxn(): Subscribing to list of pending transactions.',
  );
  if (module.exports.connect()) {
    web3.eth
      .subscribe('pendingTransactions', (err, res) => {
        if (!err) {
          logger.debug(
            `ethService.subscribePendingTxn(): pendingTransactions subscription status : ${res}`,
          );
        } else {
          logger.error(
            `ethService.subscribePendingTxn(): pendingTransactions subscription errored : ${err}`,
          );
        }
      })
      .on('data', txHash => {
        logger.debug(
          `ethService.subscribePendingTxn(): received notification for txHash: ${txHash}`,
        );
        if (txHash !== null && txHash !== '') {
          logger.debug(
            `ethService.subscribePendingTxn(): fetch txInfo for hash: ${txHash}`,
          );
          web3.eth
            .getTransaction(txHash)
            .then(txInfo => {
              if (txInfo !== null) {
                processTx.newPendingTran(txInfo, protocol);
              }
            })
            .catch(e => {
              logger.error(
                `ethService.subscribePendingTxn() failed with error: ${e}`,
              );
            });
        }
      })
      .on('error', err => {
        logger.error(
          `ethService.subscribePendingTxn() failed with error: ${err}`,
        );
      });
    logger.info(
      'ethService.subscribePendingTxn() has successfully subscribed to pendingTransaction events',
    );
  } else {
    logger.error(
      'ethService.subscribePendingTxn(): Connection to geth failed!',
    );
  }
}
module.exports.subscribePendingTxn = subscribePendingTxn;

/**
 * Gets the transaction info/receipt and returns the transaction object
 * @param {string} txHash Transaction hash
 */
async function getTxInfo(txHash) {
  const [txInfo, txReceipt] = await Promise.all([
    web3.eth.getTransaction(txHash),
    web3.eth.getTransactionReceipt(txHash),
  ]);
  let to;
  let value;
  let asset;
  let contractAddress;
  if (!hashMaps.assets.has(txInfo.to.toLowerCase())) {
    ({ to } = txInfo);
  } else {
    const contractDetail = hashMaps.assets.get(txInfo.to.toLowerCase());
    ({ contractAddress } = contractDetail);
    asset = contractDetail.symbol;
    if (fs.existsSync(`${abiPath + asset}.json`)) {
      const theAbi = require(`${abiPath + asset}.json`);
      abiDecoder.addABI(theAbi);
    } else {
      abiDecoder.addABI(ERC20ABI);
    }
    const data = abiDecoder.decodeMethod(txInfo.input);
    if (data !== undefined && data.name === 'transfer') {
      // smart contract call hence the asset must be the token name
      to = data.params[0].value;
      [, { value }] = data.params;
    } else {
      ({ to } = txInfo);
    }
  }
  return {
    txHash: txInfo.hash,
    fromAddress: txInfo.from,
    toAddress: to,
    value,
    asset,
    contractAddress,
    status: txReceipt.status === '0x1' ? 'confirmed' : 'failed',
    gasPrice: txInfo.gasPrice,
    gasUsed: txReceipt.gasUsed,
    blockNumber: txReceipt.blockNumber,
  };
}

module.exports.getTxInfo = getTxInfo;

/**
 * Subscribe to geth WS events corresponding to new block headers.
 */
function subscribeBlockHeaders() {
  logger.info(
    'ethService.subscribeBlockHeaders(): Subscribing to block headers.',
  );
  if (module.exports.connect()) {
    web3.eth
      .subscribe('newBlockHeaders', (err, res) => {
        if (!err) {
          logger.debug(
            `ethService.subscribeBlockHeaders(): newBlockHeader subscription status : ${res}`,
          );
        } else {
          logger.error(
            `ethService.subscribeBlockHeaders(): newBlockHeader subscription errored : ${err}`,
          );
        }
      })
      .on('data', blockHeader => {
        logger.info(
          `ethService.subscribeBlockHeaders(): new block : ${
            blockHeader.number
          }`,
        );
        if (blockHeader && blockHeader.number && blockHeader.hash) {
          if (blockHeader.number === hashMaps.LATEST_BLOCK_NUMBER) {
            wsCnt += 1;
            // if the same block number is reported for 5 times, then report websocket is stale
            if (wsCnt === 5) {
              logger.error(
                '## WEB SOCKET STALE?? NO NEW BLOCK REPORTED FOR PAST 5 TRIES!####',
              );
            }
          } else {
            wsCnt = 0;
          }
          hashMaps.LATEST_BLOCK_NUMBER = blockHeader.number;
          logger.info(
            `ethService.subscribeBlockHeaders(): NEW BLOCK MINED : # ${
              blockHeader.number
            } Hash = ${blockHeader.hash}`,
          );
          // Check for pending tx in database and update their status
          module.exports.checkPendingTx(hashMaps.pendingTx).then(() => {
            logger.debug(
              'ethService.subscribeBlockHeaders(): Finished validating pending transactions.',
            );
          });
          module.exports.checkNewAssets(hashMaps.pendingAssets.keys());
          // capture gas price statistics
          module.exports.storeGasInfo(blockHeader);

          // Check MarketMaker Transactions
          web3.eth.getBlock(blockHeader.number).then(response => {
            response.transactions.forEach(async transaction => {
              if (await client.existsAsync(transaction)) {
                let txObject = await getTxInfo(transaction);
                rmqServices.sendOffersMessage(txObject);
                client.del(transaction);
              }
            });
          });
        }
      })
      .on('error', err => {
        logger.error(
          `ethService.subscribePendingTxn() failed with error: ${err}`,
        );
      });
  } else {
    logger.error(
      'ethService.subscribeBlockHeaders(): Connection to geth failed!',
    );
  }
}
module.exports.subscribeBlockHeaders = subscribeBlockHeaders;

/**
 * Determin the gas price and store the details.
 * @param {any} blockHeader - the event object corresponding to the current block
 */
function storeGasInfo(blockHeader) {
  logger.info(
    `ethService.storeGasInfo(): fetching gas information for block number ${
      blockHeader.number
    }`,
  );
  let entry;
  try {
    web3.eth.getBlockTransactionCount(blockHeader.number).then(txnCnt => {
      if (txnCnt !== null) {
        web3.eth.getBlock(blockHeader.number, true).then(trans => {
          const gasPrices = trans.transactions.map(tran =>
            BigNumber(tran.gasPrice),
          );
          if (gasPrices.length > 0) {
            const totalGasPrice = gasPrices.reduce((previous, current) =>
              current.plus(previous),
            );
            const avgGasPrice = totalGasPrice.div(txnCnt);
            entry = {
              type: 'tranStat',
              protocol,
              gasLimit: blockHeader.gasLimit,
              gasUsed: blockHeader.gasUsed,
              blockNumber: blockHeader.number,
              avgGasPrice: parseFloat(avgGasPrice),
              transactionCount: txnCnt,
            };
            rmqServices.sendPubSubMessage(entry);
          }
        });
      }
    });
  } catch (e) {
    logger.error(`ethService.storeGasInfo() failed with error ${e}`);
  }
}
module.exports.storeGasInfo = storeGasInfo;

/**
 * Subscribe to token transfer event corresponding to a given smart contract.
 * @param {any} theContract - the smart contract address
 */
function subscribeTransferEvents(theContract) {
  try {
    logger.info(
      `ethService.subscribeTransferEvents() subscribed to events for contract: ${theContract}`,
    );
    if (module.exports.connect()) {
      if (web3.utils.isAddress(theContract.contractAddress)) {
        const ERC20SmartContractObject = new web3.eth.Contract(
          ERC20ABI,
          theContract.contractAddress,
        );
        ERC20SmartContractObject.events.Transfer({}, (error, result) => {
          logger.debug(
            `ethService: Token transfer event occurred for contract: ${JSON.stringify(
              theContract,
            )} result: ${result} error: ${error}`,
          );
          if (!error) {
            processTx.checkTokenTransfer(result, theContract, protocol);
          } else {
            logger.error(
              `ethService.subscribeTransferEvents() failed: ${error}`,
            );
          }
        });
      }
    } else {
      logger.error(
        'ethService.subscribeTransferEvents(): Connection to geth failed!',
      );
    }
  } catch (e) {
    logger.error(`ethService.subscribeTransferEvents() failed: ${e}`);
  }
}
module.exports.subscribeTransferEvents = subscribeTransferEvents;

/**
 * Subscribe to collectible transfer event corresponding to a given smart contract.
 * @param {any} theContract - the smart contract address
 */
function subscribeCollectibleEvents(theContract) {
  try {
    logger.info(
      `ethService.subscribeCollectibleEvents() subscribed to events for contract: ${theContract}`,
    );
    if (module.exports.connect()) {
      if (web3.utils.isAddress(theContract.contractAddress)) {
        const collectible = new web3.eth.Contract(
          ERC721ABI,
          theContract.contractAddress,
        );
        collectible.events.Transfer({}, async (error, result) => {
          logger.debug(
            `ethService: Collectible transfer event occurred for contract: ${JSON.stringify(
              theContract,
            )} result: ${result} error: ${error}`,
          );
          if (!error) {
            processTx.checkCollectibleTransfer(result,theContract,protocol);
          } else {
            logger.error(
              `ethService.subscribeCollectibleEvents() failed: ${error}`,
            );
          }
        });
      }
    } else {
      logger.error(
        'ethService.subscribeCollectibleEvents(): Connection to geth failed!',
      );
    }
  } catch (e) {
    logger.error(`ethService.subscribeCollectibleEvents() failed: ${e}`);
  }
}
module.exports.subscribeCollectibleEvents = subscribeCollectibleEvents;

/**
 * Fetch transaction details corresponding to given block number
 * @param {Number} blockNumber - the block number
 */
function getBlockTx(blockNumber) {
  return new Promise((resolve, reject) => {
    logger.debug(
      `ethService.getBlockTx(): Fetch transactions from block: ${blockNumber}`,
    );
    try {
      if (module.exports.connect()) {
        resolve(web3.eth.getBlock(blockNumber, true));
      } else {
        reject(
          new Error('ethService.getBlockTx Error: Connection to geth failed!'),
        );
      }
    } catch (e) {
      logger.error(`ethService.getBlockTx(): ${e}`);
      reject(e);
    }
  });
}
module.exports.getBlockTx = getBlockTx;

/**
 * Fetch block number for a given block hash
 * @param {any} blockHash - the block hash
 */
function getBlockNumber(blockHash) {
  return new Promise((resolve, reject) => {
    try {
      if (module.exports.connect()) {
        web3.eth.getBlock(blockHash).then(result => {
          resolve(result.number);
        });
      } else {
        reject(
          new Error(
            'ethService.getBlockNumber Error: Connection to geth failed!',
          ),
        );
      }
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.getBlockNumber = getBlockNumber;

/**
 * Fetch the latest block number
 */
function getLastBlockNumber() {
  if (module.exports.connect()) {
    return web3.eth.getBlockNumber();
  }
  logger.error('ethService.getLastBlockNumber(): connection to geth failed!');
  return undefined;
}
module.exports.getLastBlockNumber = getLastBlockNumber;

/**
 * Fetch the transaction receipt corresponding to a given transaction hash
 * @param {String} txHash - the transaction hash
 */
function getTxReceipt(txHash) {
  if (module.exports.connect()) {
    return web3.eth.getTransactionReceipt(txHash);
  }
  logger.error('ethService.getTxReceipt(): connection to geth failed!');
  return undefined;
}
module.exports.getTxReceipt = getTxReceipt;

/**
 * Fetch the total number of transactions within a given block
 * @param {String} hashStringOrBlockNumber - block hash or block number
 */
function getBlockTransactionCount(hashStringOrBlockNumber) {
  if (module.exports.connect()) {
    return web3.eth.getBlockTransactionCount(hashStringOrBlockNumber);
  }
  logger.error(
    'ethService.getBlockTransactionCount(): connection to geth failed!',
  );
  return undefined;
}
module.exports.getBlockTransactionCount = getBlockTransactionCount;

/**
 * Fetch the transaction corresponding to a given block and index
 * @param {String} hashStringOrBlockNumber - block hash or block number
 * @param {Number} index - index number
 */
function getTransactionFromBlock(hashStringOrBlockNumber, index) {
  if (module.exports.connect()) {
    return web3.eth.getTransactionFromBlock(hashStringOrBlockNumber, index);
  }
  logger.error(
    'ethService.getTransactionFromBlock(): connection to geth failed!',
  );
  return undefined;
}
module.exports.getTransactionFromBlock = getTransactionFromBlock;

/**
 * Fetch all pending transactions.
 */
function getPendingTxArray() {
  return new Promise((resolve, reject) => {
    try {
      if (module.exports.connect()) {
        web3.eth.getBlock('pending', true).then(result => {
          resolve(result.transactions);
        });
      }
      return undefined;
    } catch (e) {
      return reject(e);
    }
  });
}
module.exports.getPendingTxArray = getPendingTxArray;

/**
 * Check the status of the given transaction hashes
 * @param {any} pendingTxArray - an array of transaction hashes
 */
function checkPendingTx(pendingTxArray) {
  logger.info(
    `ethService.checkPendingTx(): pending tran count: ${pendingTxArray.length}`,
  );
  return new Promise((resolve, reject) => {
    if (pendingTxArray.length === 0) {
      resolve();
    } else {
      pendingTxArray.forEach(item => {
        logger.debug(
          `ethService.checkPendingTx(): Checking status of transaction: ${
            item.txHash
          }`,
        );
        if (module.exports.connect()) {
          web3.eth.getTransactionReceipt(item.txHash).then(receipt => {
            let to;
            let value;
            let asset;
            logger.debug(`ethService.checkPendingTx(): receipt is ${receipt}`);
            if (receipt !== null) {
              let status;
              const { gasUsed } = receipt;
              if (receipt.status === '0x1') {
                status = 'confirmed';
              } else {
                status = 'failed';
              }

              if (!hashMaps.assets.has(item.toAddress.toLowerCase())) {
                to = item.toAddress;
              } else {
                const contractDetail = hashMaps.assets.get(
                  item.toAddress.toLowerCase(),
                );
                asset = contractDetail.symbol;
                if (fs.existsSync(`${abiPath + asset}.json`)) {
                  const theAbi = require(`${abiPath + asset}.json`);
                  logger.info(`processTx - Fetched ABI for token: ${asset}`);
                  abiDecoder.addABI(theAbi);
                } else {
                  abiDecoder.addABI(ERC20ABI);
                }
                const data = abiDecoder.decodeMethod(item.input);
                if (data !== undefined && data.name === 'transfer') {
                  // smart contract call hence the asset must be the token name
                  to = data.params[0].value;
                  [, { value }] = data.params;
                } else {
                  to = item.toAddress;
                }
              }

              if (!value) {
                ({ value } = item);
              }

              if (!asset) {
                ({ asset } = item);
              }

              const txMsg = {
                type: 'updateTx',
                txHash: item.txHash,
                protocol: item.protocol,
                fromAddress: item.fromAddress,
                toAddress: to,
                value,
                asset,
                contractAddress: item.contractAddress,
                status,
                gasUsed,
                blockNumber: receipt.blockNumber,
                input: item.input,
              };
              rmqServices.sendPubSubMessage(txMsg);
              logger.info(
                `ethService.checkPendingTx(): TRANSACTION ${item} CONFIRMED @ BLOCK # ${
                  receipt.blockNumber
                }`,
              );
              hashMaps.pendingTx.delete(item.txHash);
            } else {
              logger.debug(
                `ethService.checkPendingTx(): Txn ${item} is still pending.`,
              );
            }
          });
        } else {
          reject(
            new Error(
              'ethService.checkPendingTx(): connection to geth failed!',
            ),
          );
        }
      });
    }
  });
}
module.exports.checkPendingTx = checkPendingTx;

/**
 * Check if a new pending transaction corresponds to an asset
 * @param {any} pendingAssets - an array of transaction hashes
 */
function checkNewAssets(pendingAssets) {
  logger.info(
    `ethService.checkNewAsset(): pending asset count: ${pendingAssets.length}`,
  );
  return new Promise((resolve, reject) => {
    if (pendingAssets.length === 0) {
      resolve();
    } else {
      pendingAssets.forEach(item => {
        logger.debug(
          `ethService.checkNewAssets(): Checking status of transaction: ${item}`,
        );
        if (module.exports.connect()) {
          web3.eth.getTransactionReceipt(item).then(receipt => {
            logger.debug(
              `ethService.checkNewAssets(): receipt is ${JSON.stringify(
                receipt,
              )}`,
            );
            if (receipt !== null && receipt.contractAddress !== null) {
              // check if contract is an ERC20
              if (!module.exports.addERC20(receipt)) {
                module.exports.addERC721(receipt);
              }
            } else {
              logger.debug(
                `ethService.checkPendingTx(): Txn ${item} is still pending.`,
              );
            }
          });
        } else {
          reject(
            new Error(
              'ethService.checkPendingTx(): connection to geth failed!',
            ),
          );
        }
      });
    }
  });
}
module.exports.checkNewAssets = checkNewAssets;

/**
 * Validated if a given transaction corresponds to the deployment of a token contract
 * @param {any} receipt - the transaction receipt
 */
async function addERC20(receipt) {
  let contract;
  try {
    contract = new web3.eth.Contract(ERC20ABI, receipt.contractAddress);
    const symbol = await contract.methods.symbol().call();
    const name = await contract.methods.name().call();
    const decimals = await contract.methods.decimals().call();
    const totalSupply = await contract.methods.totalSupply().call();

    if (receipt.status === '0x1') {
      const txMsg = {
        type: 'newAsset',
        name,
        symbol,
        decimals,
        contractAddress: receipt.contractAddress,
        totalSupply,
        category: 'Token',
        protocol,
      };
      rmqServices.sendPubSubMessage(txMsg);
      logger.info(
        `ethService.addERC20(): Identified a new ERC20 asset (${
          receipt.contractAddress
        }) in block: ${receipt.blockNumber}`,
      );
    }
    hashMaps.pendingAssets.delete(receipt.transactionHash);
    return true;
  } catch (e) {
    logger.error(
      `ethService.addERC20(): deployed contract ${
        receipt.contractAddress
      } is not ERC20.`,
    );
    hashMaps.pendingAssets.delete(receipt.transactionHash);
    return false;
  }
}
module.exports.addERC20 = addERC20;

/**
 * Validated if a given transaction corresponds to the deployment of a collectible contract
 * @param {any} txn - the transaction receipt
 */
async function addERC721(receipt) {
  let contract;
  try {
    contract = new web3.eth.Contract(ERC721ABI, receipt.contractAddress);
    const symbol = await contract.methods.symbol().call();
    const name = await contract.methods.name().call();

    if (receipt.status === '0x1') {
      const txMsg = {
        type: 'newAsset',
        name,
        symbol,
        decimals: 0,
        contractAddress: receipt.contractAddress,
        totalSupply: 1,
        category: 'Collectible',
        protocol,
      };
      rmqServices.sendPubSubMessage(txMsg);
      logger.info(
        `ethService.addERC721(): Identified a new ERC20 asset (${
          receipt.contractAddress
        }) in block: ${receipt.blockNumber}`,
      );
    }
    hashMaps.pendingAssets.delete(receipt.transactionHash);
    return true;
  } catch (e) {
    logger.error(
      `ethService.addERC721(): deployed contract ${
        receipt.contractAddress
      } is not ERC721.`,
    );
    hashMaps.pendingAssets.delete(receipt.transactionHash);
    return false;
  }
}
module.exports.addERC721 = addERC721;

async function getAllTransactionsForWallet(
  wallet,
  fromBlockNumberParam,
  toBlockNumberParam,
) {
  try {
    let fromBlockNumber = fromBlockNumberParam;
    let toBlockNumber = toBlockNumberParam;
    logger.info(
      `ethService.getAllTransactionsForWallet(${wallet}) started processing`,
    );
    if (module.exports.connect()) {
      if (!fromBlockNumber) {
        fromBlockNumber = 'earliest';
      }

      if (!toBlockNumber) {
        toBlockNumber = 'latest';
      }

      const transTo = await web3.trace.filter({
        fromBlock: fromBlockNumber,
        toBlock: toBlockNumber,
        toAddress: [wallet.toLowerCase()],
      });
      const transFrom = await web3.trace.filter({
        fromBlock: fromBlockNumber,
        toBlock: toBlockNumber,
        fromAddress: [wallet.toLowerCase()],
      });
      return transTo.concat(transFrom);
    }
    logger.error(
      `ethService.getAllTransactionsForWallet() - failed connecting to web3 provider`,
    );
    return undefined;
  } catch (err) {
    logger.error(
      `ethService.getAllTransactionsForWallet(${wallet}) - failed with error - ${err}`,
    );
    return undefined;
  }
}
module.exports.getAllTransactionsForWallet = getAllTransactionsForWallet;

async function getTransactionCountForWallet(wallet) {
  try {
    logger.info(
      `ethService.getTransactionCountForWallet(${wallet}) started processing`,
    );
    if (module.exports.connect()) {
      const transCount = await web3.eth.getTransactionCount(
        wallet.toLowerCase(),
      );
      logger.info(
        `ethService.getTransactionCountForWallet(${wallet}) resolved ${transCount}`,
      );
      return transCount;
    }
    logger.error(
      `ethService.getTransactionCountForWallet() - failed connecting to web3 provider`,
    );
    return undefined;
  } catch (err) {
    logger.error(
      `ethService.getTransactionCountForWallet(${wallet}) - failed with error - ${err}`,
    );
    return undefined;
  }
}
module.exports.getTransactionCountForWallet = getTransactionCountForWallet;
