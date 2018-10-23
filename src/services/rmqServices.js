/** @module rmqServices.js */
require('dotenv').config();
const amqp = require('amqplib/callback_api');
const moment = require('moment');
const jsHashes = require('jshashes');
const logger = require('../utils/logger.js');
const dbServices = require('./dbServices.js');
const SHA256 = new jsHashes.SHA256();
const checksumKey = process.env.CHECKSUM_KEY;
let pubSubChannel;
const pubSubQueue = 'bcx-pubsub';
const notificationsQueue = typeof process.env.NOTIFICATIONS_QUEUE !== 'undefined' ?
  process.env.NOTIFICATIONS_QUEUE : 'bcx-notifications';
const MQ_URL = 'amqp://' + process.env.MQ_BCX_USERNAME + ':' + process.env.MQ_BCX_PASSWORD + '@' + process.env.RABBITMQ_SERVER;
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
        amqp.connect(MQ_URL, (error, conn) => {

          if (error) {
            logger.error(`Publisher failed initializing RabbitMQ, error: ${error}`);
            return setTimeout(initPubSubMQ, 5000);
          }
          if (conn) {
            connection = conn;
          }
          connection.on('error', (err) => {
            logger.error(`Publisher RMQ connection errored out: ${err}`);
            return setTimeout(initPubSubMQ, 5000);
          });
          connection.on('close', () => {
            logger.error('Publisher RMQ Connection closed');
            return setTimeout(initPubSubMQ, 5000);
          });

          logger.info('Publisher RMQ Connected');

          connection.createChannel((err, ch) => {
            pubSubChannel = ch;
            ch.assertQueue(pubSubQueue, { durable: true });
            // Note: on Node 6 Buffer.from(msg) should be used
          });
        });
        resolve();
      } catch (err) {
        logger.error('rmqServices.initPubSubMQ() failed: ', err.message);
        reject(err);
      } finally {
        logger.info('Exited rmqServices.initPubSubMQ()');
      }
    });
  };

module.exports.initPubSubMQ = initPubSubMQ;

/**
 * Function that calculates the checksum for a given payload and then writes to queue
 * @param {any} payload - the payload/message to be send to queue
 */
function sendPubSubMessage(payload) {
  const checksum = SHA256.hex(checksumKey + JSON.stringify(payload));
  payload.checksum = checksum;
  pubSubChannel.sendToQueue(pubSubQueue, Buffer.from(JSON.stringify(payload)));
};

module.exports.sendPubSubMessage = sendPubSubMessage;

/**
 * Function to generate the notification payload thats send to notification queue
 * @param {any} payload -  The payload for the notification queue
 */
function getNotificationPayload(payload) {
  const p = {
    type: 'transactionEvent',
    payload
  };
  logger.info(JSON.stringify(p));
  return p;
}

/**
 * Function that resets the transaction map
 */
function resetTxMap() {
  for (const x in TX_MAP) {
    logger.info(`resetTxMap Loop: ${x}`);
    const timestamp = moment().diff(TX_MAP[x].timestamp, 'minutes');
    logger.info(`resetTxMap Loop Timestamp: ${timestamp}`);

    if (timestamp >= 3) {
      delete TX_MAP[x];
      logger.info(`resetTxMap delete: ${x}`);
    }
  }
}

/**
 * Function to initialize the subscriber publisher queue befpore consumption
 */
function initSubPubMQ() {
  try {
    let connection;
    logger.info('Subscriber Started executing initSubPubMQ()');
    amqp.connect(MQ_URL, (error, conn) => {

      if (error) {
        logger.error(`Subscriber failed initializing RabbitMQ, error: ${error}`);
        return setTimeout(initSubPubMQ, 5000);
      }
      if (conn) {
        connection = conn;
      }
      connection.on('error', (err) => {
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
        ch.consume(pubSubQueue, (msg) => {
          
          logger.info(`Subscriber received rmq message: ${msg.content}`);
          if (typeof msg.content !== 'undefined' && msg.content !== '' &&
            validatePubSubMessage(JSON.parse(msg.content), checksumKey)) {
            const entry = JSON.parse(msg.content);
            const { type, txHash } = entry;
            delete entry.type;
            delete entry.checksum;
            switch (type) {
              case 'newTx':
                // Removes all txn hash's after 3 minutes.
                resetTxMap();

                // Added to stop duplicate transactions.
                if (txHash in TX_MAP) {
                  break;
                } else {
                  TX_MAP[txHash] = { timestamp: moment() };
                }

                entry.gasUsed = null;

                dbServices.dbCollections.transactions.findOneByTxHash(txHash)
                  .then((tx) => {
                    if (tx === null) {
                      logger.debug('Subscriber saving transaction: ' + entry);
                      return dbServices.dbCollections.transactions.addTx(entry);
                    } else {
                      return dbServices.dbCollections.transactions.updateTx(entry);
                    }
                    //throw new Error('newTx: Transaction already exists');
                  })
                  .then(() => {
                    logger.info(`newTx: Transaction inserted: ${txHash}`);
                    ch.assertQueue(notificationsQueue, { durable: true });
                    ch.sendToQueue(
                      notificationsQueue,
                      new Buffer.from(JSON.stringify(getNotificationPayload(entry)))
                    );
                    logger.info(`newTx: Transaction produced to: ${notificationsQueue}`);
                  })
                  .catch(e => logger.error(`${JSON.stringify(e)}`));
                break;
              case 'updateTx':
                dbServices.dbCollections.transactions.updateTx(entry)
                  .then(() => {
                    logger.info(`Transaction updated: ${txHash}`);
                    ch.assertQueue(notificationsQueue, { durable: true });
                    ch.sendToQueue(
                      notificationsQueue,
                      new Buffer.from(JSON.stringify(getNotificationPayload(entry)))
                    );
                    logger.info(`updateTx: Transaction produced to: ${notificationsQueue}`);
                  });
                break;
              case 'newAsset':
                dbServices.dbCollections.assets.addContract(entry)
                  .then(() => {
                    logger.info(`New aseet added: `);
                  }); 
                break;
              case 'tranStat':
                  logger.debug('Subscriber adding a new transaction stats entry');
                  dbServices.addTransactionStats(entry);
                  break;
              default:
                break;
            }
          }
        }, { noAck: true });
      });
    });
  } catch (err) {
    logger.error(`Subscriber initSubPubMQ failed: ${err}`);
  } finally {
    logger.info('Exited initSubPubMQ()');
  }
};

module.exports.initSubPubMQ = initSubPubMQ;

/**
 * Function that validates the checksum of the payload received.
 * @param {any} payload - The IPC message received from the master
 */
function validatePubSubMessage(payload, checksumKey) {
  const checksum = payload.checksum;
  delete payload.checksum;
  if (SHA256.hex(checksumKey + JSON.stringify(payload)) === checksum) {
    return true;
  }
  return false;
};

module.exports.validatePubSubMessage = validatePubSubMessage;
