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
/** @module rmqServices.js */
require('dotenv').config();
const amqp = require('amqplib/callback_api');
const moment = require('moment');
const jsHashes = require('jshashes');
const logger = require('../utils/logger.js');
const dbServices = require('./dbServices.js');

const TRANSACTION_PENDING = 'transactionPendingEvent';
const TRANSACTION_CONFIRMATION = 'transactionConfirmationEvent';
const COLLECTIBLE_TRANSFER = 'collectibleTransferEvent';
const SHA256 = new jsHashes.SHA256();
const checksumKey = process.env.CHECKSUM_KEY;
let pubSubChannel;
let offersChannel;
const pubSubQueue = 'bcx-pubsub';
const offersQueue = 'bcx-offers';
const notificationsQueue =
  typeof process.env.NOTIFICATIONS_QUEUE !== 'undefined'
    ? process.env.NOTIFICATIONS_QUEUE
    : 'bcx-notifications';
const MQ_URL = `amqp://${process.env.MQ_BCX_USERNAME}:${
  process.env.MQ_BCX_PASSWORD
}@${process.env.RABBITMQ_SERVER}`;
const TX_MAP = {};
moment.locale('en_GB');

/**
 * Initialize the pub-sub rabbit mq.
 */

function initPubSubMQ() {
  return new Promise((resolve, reject) => {
    try {
      let connection;
      logger.info('Executing rmqServices.initPubSubMQ()');
      amqp.connect(
        MQ_URL,
        (error, conn) => {
          if (error) {
            logger.error(
              `Publisher failed initializing RabbitMQ, error: ${error}`,
            );
            return setTimeout(initPubSubMQ, 5000);
          }
          if (conn) {
            connection = conn;
          }
          connection.on('error', err => {
            logger.error(`Publisher RMQ connection errored out: ${err}`);
            return setTimeout(initPubSubMQ, 5000);
          });
          connection.on('close', () => {
            logger.error('Publisher RMQ Connection closed');
            return setTimeout(initPubSubMQ, 5000);
          });

          logger.info('Publisher RMQ Connected');
          initializePubSubChannel(connection);
          initializeOffersChannel(connection);
        },
      );
      resolve();
    } catch (err) {
      logger.error('rmqServices.initPubSubMQ() failed: ', err.message);
      reject(err);
    } finally {
      logger.info('Exited rmqServices.initPubSubMQ()');
    }
  });
}

module.exports.initPubSubMQ = initPubSubMQ;

/**
 * Function that calculates the checksum for a given payload and then writes to queue
 * @param {any} payload - the payload/message to be send to queue
 */
function sendPubSubMessage(payload) {
  const checksum = calculateChecksum(payload, checksumKey);
  payload.checksum = checksum;

  if (!pubSubChannel) {
    throw new Error('pubSubChannel is not initialized');
  }
  pubSubChannel.sendToQueue(pubSubQueue, Buffer.from(JSON.stringify(payload)));
}

module.exports.sendPubSubMessage = sendPubSubMessage;

/**
 * Function that initialize the connection
 * @param {any} connection - the connection
 */
function initializePubSubChannel(connection) {
  connection.createChannel((err, ch) => {
    pubSubChannel = ch;
    ch.assertQueue(pubSubQueue, { durable: true });
    // Note: on Node 6 Buffer.from(msg) should be used
  });
}

module.exports.initializePubSubChannel = initializePubSubChannel;

/**
 * Function that initialize the connection
 * @param {any} connection - the connection
 */
function initializeOffersChannel(connection) {
  connection.createChannel((err, ch) => {
    offersChannel = ch;
    ch.assertQueue(offersQueue, { durable: true });
  });
}

module.exports.initializeOffersChannel = initializeOffersChannel;

/**
 * Calculate checksum of payload
 * @param {any} payload - the payload/message to calculate checksum
 */
function calculateChecksum(payload, checksumKey) {
  return SHA256.hex(checksumKey + JSON.stringify(payload));
}

module.exports.calculateChecksum = calculateChecksum;

/**
 * Function that writes to queue
 * @param {any} payload - the payload/message to be send to queue
 */
function sendOffersMessage(payload) {
  if (!offersChannel) {
    throw new Error('pubSubChannel is not initialized');
  }
  offersChannel.sendToQueue(offersQueue, Buffer.from(JSON.stringify(payload)));
  logger.info(`Message sent to ${offersQueue}, Content: ${payload}`);
}

module.exports.sendOffersMessage = sendOffersMessage;

/**
 * Function to generate the notification payload thats send to notification queue
 * @param {any} payload -  The payload for the notification queue
 */
function getNotificationPayload(type, payload) {
  const p = {
    type,
    payload,
    meta: {},
  };
  logger.info(JSON.stringify(p));
  return p;
}

module.exports.getNotificationPayload = getNotificationPayload;

/**
 * Function that resets a given  transaction map
 * @param {any}  txMap -  TX_MAP like param
 */
function resetTxMap(txMap) {
  for (const x in txMap) {
    logger.debug(`resetTxMap Loop: ${x}`);
    const timestamp = moment().diff(txMap[x].timestamp, 'minutes');
    logger.debug(`resetTxMap Loop Timestamp: ${timestamp}`);

    if (timestamp >= 3) {
      delete txMap[x];
      logger.debug(`resetTxMap delete: ${x}`);
    }
  }
  return txMap;
}

module.exports.resetTxMap = resetTxMap;

/**
 * Function to initialize the subscriber publisher queue befpore consumption
 */
function initSubPubMQ() {
  try {
    let connection;
    logger.info('Subscriber Started executing initSubPubMQ()');
    amqp.connect(
      MQ_URL,
      (error, conn) => {
        if (error) {
          logger.error(
            `Subscriber failed initializing RabbitMQ, error: ${error}`,
          );
          return setTimeout(initSubPubMQ, 5000);
        }
        if (conn) {
          connection = conn;
        }
        connection.on('error', err => {
          logger.error(`Subscriber RMQ connection errored out: ${err}`);
          return setTimeout(initSubPubMQ, 5000);
        });
        connection.on('close', () => {
          logger.error('Subscriber RMQ Connection closed');
          return setTimeout(initSubPubMQ, 5000);
        });

        logger.info('Subscriber RMQ Connected');

        connection.createChannel((err, ch) => {
          ch.assertQueue(pubSubQueue, { durable: true });
          ch.consume(
            pubSubQueue,
            msg => {
              logger.info(`Subscriber received rmq message: ${msg.content}`);
              if (
                typeof msg.content !== 'undefined' &&
                msg.content !== '' &&
                validatePubSubMessage(JSON.parse(msg.content), checksumKey)
              ) {
                const entry = JSON.parse(msg.content);
                const { type, txHash } = entry;
                delete entry.type;
                delete entry.checksum;
                switch (type) {
                  case 'newTx':
                    // Removes all txn hash's after 3 minutes.
                    resetTxMap(TX_MAP);

                    // Added to stop duplicate transactions.
                    if (txHash in TX_MAP) {
                      break;
                    } else {
                      TX_MAP[txHash] = { timestamp: moment() };
                    }

                    entry.gasUsed = null;

                    dbServices.dbCollections.transactions
                      .findOneByTxHash(txHash)
                      .then(tx => {
                        if (tx === null) {
                          logger.debug(
                            `Subscriber saving transaction: ${entry}`,
                          );
                          return dbServices.dbCollections.transactions.addTx(
                            entry,
                          );
                        }
                        return dbServices.dbCollections.transactions.updateTx(
                          entry,
                        );

                        // throw new Error('newTx: Transaction already exists');
                      })
                      .then(() => {
                        logger.info(`newTx: Transaction inserted: ${txHash}`);
                        ch.assertQueue(notificationsQueue, { durable: true });
                        if(typeof entry.tokenId === 'undefined') {
                          ch.sendToQueue(
                            notificationsQueue,
                            new Buffer.from(
                              JSON.stringify(
                                getNotificationPayload(
                                  TRANSACTION_PENDING,
                                  entry,
                                ),
                              ),
                            ),
                          );
                        } else {
                          ch.sendToQueue(
                            notificationsQueue,
                            new Buffer.from(
                              JSON.stringify(
                                getNotificationPayload(
                                  COLLECTIBLE_TRANSFER,
                                  entry,
                                ),
                              ),
                            ),
                          );
                        }
                        logger.info(
                          `newTx: Transaction produced to: ${notificationsQueue}`,
                        );
                      })
                      .catch(e => logger.error(`${JSON.stringify(e)}`));
                    break;
                  case 'updateTx':
                    dbServices.dbCollections.transactions
                      .updateTx(entry)
                      .then(() => {
                        logger.info(`Transaction updated: ${txHash}`);

                        ch.assertQueue(notificationsQueue, { durable: true });
                        ch.sendToQueue(
                          notificationsQueue,
                          new Buffer.from(
                            JSON.stringify(
                              getNotificationPayload(
                                TRANSACTION_CONFIRMATION,
                                entry,
                              ),
                            ),
                          ),
                        );
                        logger.info(
                          `updateTx: Transaction produced to: ${notificationsQueue}`,
                        );
                      });
                    break;
                  case 'newAsset':
                    dbServices.dbCollections.assets
                      .addContract(entry)
                      .then(() => {
                        logger.info(`New aseet added: `);
                      });
                    break;
                  case 'tranStat':
                    logger.debug(
                      'Subscriber adding a new transaction stats entry',
                    );
                    dbServices.addTransactionStats(entry);
                    break;
                  default:
                    break;
                }
              }
            },
            { noAck: true },
          );
        });
      },
    );
  } catch (err) {
    logger.error(`Subscriber initSubPubMQ failed: ${err} ${err.stack}`);
  } finally {
    logger.info('Exited initSubPubMQ()');
  }
}

module.exports.initSubPubMQ = initSubPubMQ;

/**
 * Function that validates the checksum of the payload received.
 * @param {any} payload - The IPC message received from the master
 */
function validatePubSubMessage(payload, checksumKey) {
  const checksum = payload.checksum;
  delete payload.checksum;
  if (calculateChecksum(payload, checksumKey) === checksum) {
    return true;
  }
  return false;
}

module.exports.validatePubSubMessage = validatePubSubMessage;
