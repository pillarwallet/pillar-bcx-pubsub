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
/** @module processTx.js */
const time = require('unix-timestamp');
const logger = require('../utils/logger.js');
const rmqServices = require('./rmqServices.js');
const abiDecoder = require('abi-decoder');
const ERC20ABI = require('../abi/ERC20ABI');
const ERC721ABI = require('../abi/ERC721ABI');
const abiPath = `${require('app-root-path')}/src/abi/`;
const hashMaps = require('../utils/hashMaps.js');
const fs = require('fs');
const bluebird = require('bluebird');

/**
 * Connecting to Redis
 */
const redis = require('redis');
const redisOptions = {host: process.env.REDIS_SERVER, port: process.env.REDIS_PORT, password: process.env.REDIS_PW};
let client;
try {
  client = redis.createClient(redisOptions);
  logger.info("processTx successfully connected to Redis server")
} catch (e) { logger.error(e) }
bluebird.promisifyAll(redis);

/**
 * Store the new pending transaction in memeory if the transaction corresponds
 * to a monitored wallet.
 * @param {any} tx - the transaction object
 * @param {any} protocol - the transaction object
 */
async function newPendingTran(tx, protocol) {
  try {
    logger.debug(
      `processTx.newPendingTran(): validating transaction: ${JSON.stringify(
        tx,
      )}`,
    );
    const tmstmp = time.now();
    let pillarId = '';
    let asset;
    let contractAddress;
    let data;
    let value;
    let tokenId;
    let collectible = false;
    const from = typeof tx.from !== 'undefined' ? tx.from : tx.fromAddress;
    let to = typeof tx.to !== 'undefined' ? tx.to : tx.toAddress;
    const hash = typeof tx.hash !== 'undefined' ? tx.hash : tx.txHash;
    // ignore contract creation transactions, these have the to as null
    if (to === null) {
      logger.debug(
        `processTx.newPendingTran(): txn ${hash} looks like a probable contract deployment`,
      );
      hashMaps.pendingAssets.set(hash, tx);
    }
    if (from !== null && to !== null) {
      logger.debug(
        `processTx.newPendingTran(): txn ${hash} from= ${from} to= ${to}`,
      );
      if (await client.existsAsync(to.toLowerCase())) {
        // fetch the pillarId corresponding to the to address and
        pillarId = await client.getAsync(to.toLowerCase());
      } else if (await client.existsAsync(from.toLowerCase())) {
        pillarId = await client.getAsync(from.toLowerCase());
      }
      if (!hashMaps.assets.has(to.toLowerCase())) {
        asset = 'ETH';
        ({ value } = tx);
      } else {
        ({ value } = tx);
        // fetch the asset from the assets hashmap
        const contractDetail = hashMaps.assets.get(to.toLowerCase());
        ({ contractAddress } = contractDetail);
        asset = contractDetail.symbol;
        logger.info('Contract detail category: ' + contractDetail.category);
        if(typeof contractDetail.category === 'undefined') {
          if (fs.existsSync(`${abiPath + asset}.json`)) {
            const theAbi = require(`${abiPath + asset}.json`);
            logger.debug(`processTx - Fetched ABI for token: ${asset}`);
            abiDecoder.addABI(theAbi);
          } else {
            abiDecoder.addABI(ERC20ABI);
          }
        } else {
          logger.info('Addding erc721 abi');
          abiDecoder.addABI(ERC721ABI);
          collectible = true;
        }
        data = abiDecoder.decodeMethod(tx.input);
        logger.debug(
          `ethService.newPendingTran(): Identified a new pending transaction involving monitored asset: ${asset}`,
        );
        logger.debug(
          `ethService.newPendingTran(): tx.input= ${
            tx.input
          } data is ${JSON.stringify(data)}`,
        );
        if (typeof data !== 'undefined' && tx.input !== '0x') {
          if (data.name === 'transfer') {
            // smart contract call hence the asset must be the token name
            to = data.params[0].value;
            pillarId = await client.getAsync(to);
            [, { value }] = data.params;
          } else if (
            data.name === 'transferFrom' 
            || 
            data.name === 'safeTransferFrom'
            ) {
            to = data.params[1].value;
            pillarId = await client.getAsync(to);
            [, , { value }] = data.params;
          }
          if (collectible) {
            tokenId = value;
          }
        }
      }

      if (pillarId !== '' && pillarId !== null) {
        logger.info(
          `processTx.newPendingTran(): PillarID: ${pillarId} tx: ${JSON.stringify(
            tx,
          )}`,
        );
        // send a message to the notifications queue reporting a new transactions
        let txMsgTo = {
            type: 'newTx',
            pillarId,
            protocol,
            fromAddress: from,
            toAddress: to,
            txHash: hash,
            asset,
            contractAddress,
            timestamp: tmstmp,
            value,
            gasPrice: tx.gasPrice,
            blockNumber: tx.blockNumber,
            status: 'pending',
            input: tx.input,
            tokenId
          };
        logger.info(
          `processTx.newPendingTran() notifying subscriber of a new relevant transaction: ${JSON.stringify(
            txMsgTo,
          )}`,
        );

        rmqServices.sendPubSubMessage(txMsgTo);
        // PENDING TX IS STORED IN HASH MAP AND WILL BE CHECKED AT NEXT BLOCK FOR TX CONFIRMATION
        hashMaps.pendingTx.set(tx.hash, txMsgTo);
      }
    }
  } catch (e) {
    logger.error(
      `processTx.newPendingTran(): failed with error ${e} for txn: ${tx.hash}`,
    );
  }
}
module.exports.newPendingTran = newPendingTran;

/**
 * Validated if the wallets involved in a monitored token transfer needs to be persisted in database
 * @param {any} evnt - the event associated with the token transfer
 * @param {String} theContract - the smart contract address associated with the token
 * @param {String} protocol - the protocol corresponding to the token blockchain
 */
async function checkTokenTransfer(evnt, theContract, protocol) {
  logger.debug(
    `processTx.checkTokenTransfer(): received event: ${JSON.stringify(evnt)}`,
  );
  try {
    let pillarId = '';
    const tmstmp = time.now();
    if (await client.existsAsync(evnt.returnValues._to.toLowerCase())) {
      pillarId = await client.getAsync(evnt.returnValues._to.toLowerCase());
    } else if (
      await client.existsAsync(evnt.returnValues._from.toLowerCase())
    ) {
      pillarId = await client.getAsync(evnt.returnValues._from.toLowerCase());
    }
    if (pillarId !== null && pillarId !== '') {
      const txMsg = {
        type: 'newTx',
        pillarId,
        protocol,
        fromAddress: evnt.returnValues._from,
        toAddress: evnt.returnValues._to,
        txHash: evnt.transactionHash,
        asset: theContract.symbol,
        contractAddress: theContract.contractAddress,
        timestamp: tmstmp,
        value: evnt.returnValues._value,
        gasPrice: evnt.gasPrice,
        blockNumber: evnt.blockNumber,
        status: 'confirmed',
      };
      logger.debug(
        `processTx.checkTokenTransfer(): notifying subscriber of new tran: ${JSON.stringify(
          txMsg,
        )}`,
      );
      rmqServices.sendPubSubMessage(txMsg);
    }
  } catch (err) {
    logger.error(`processTx.checkTokenTransfer failed with error - ${err}`);
  }
}
module.exports.checkTokenTransfer = checkTokenTransfer;

/**
 * Validated if the wallets involved in a monitored collectible transfer needs to be persisted in database
 * @param {any} evnt - the event associated with the token transfer
 * @param {String} theContract - the smart contract address associated with the token
 * @param {String} protocol - the protocol corresponding to the token blockchain
 */
async function checkCollectibleTransfer(evnt, theContract, protocol) {
  logger.info(
    `processTx.checkCollectibleTransfer(): received event: ${JSON.stringify(evnt)}`,
  );
  try {
    let pillarId = '';
    const tmstmp = time.now();
    if (await client.existsAsync(evnt.returnValues._to.toLowerCase())) {
      pillarId = await client.getAsync(evnt.returnValues._to.toLowerCase());
    } else if (
      await client.existsAsync(evnt.returnValues._from.toLowerCase())
    ) {
      pillarId = await client.getAsync(evnt.returnValues._from.toLowerCase());
    }
    if (pillarId !== null && pillarId !== '') {
      const txMsg = {
        type: 'updateTx',
        pillarId,
        protocol,
        fromAddress: evnt.returnValues._from,
        toAddress: evnt.returnValues._to,
        txHash: evnt.transactionHash,
        asset: theContract.symbol,
        contractAddress: theContract.contractAddress,
        timestamp: tmstmp,
        value: evnt.returnValues._value,
        gasPrice: evnt.gasPrice,
        blockNumber: evnt.blockNumber,
        status: 'confirmed',
        tokenId: evnt.returnValues._tokenId
      };
      logger.debug(
        `processTx.checkCollectibleTransfer(): notifying subscriber of new tran: ${JSON.stringify(
          txMsg,
        )}`,
      );
      rmqServices.sendPubSubMessage(txMsg);
    }
  } catch (err) {
    logger.error(`processTx.checkCollectibleTransfer failed with error - ${err}`);
  }
}
module.exports.checkCollectibleTransfer = checkCollectibleTransfer;
