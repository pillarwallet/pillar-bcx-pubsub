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
exports.initPubSubMQ = function () {
    try {
      logger.info('Executing rmqServices.initMQ()');
      amqp.connect(MQ_URL, (err, conn) => {
        conn.createChannel((err, ch) => {
          pubSubChannel = ch;
          const msg = '{}';
          ch.assertQueue(pubSubQueue, { durable: true });
          // Note: on Node 6 Buffer.from(msg) should be used
          ch.sendToQueue(pubSubQueue, Buffer.from(msg));
          logger.info(` [x] Sent ${msg}`);
        });
        // setTimeout(() => { conn.close(); process.exit(0); }, 500);
      });
    } catch (err) {
      logger.error('rmqServices.initPubSubMQ() failed: ', err.message);
    } finally {
      logger.info('Exited rmqServices.initPubSubMQ()');
    }
};

/**
 * Function that calculates the checksum for a given payload and then writes to queue
 * @param {any} payload - the payload/message to be send to queue
 */
exports.sendPubSubMessage = function (payload) {
  const checksum = SHA256.hex(checksumKey + JSON.stringify(payload));
  payload.checksum = checksum;
  pubSubChannel.sendToQueue(pubSubQueue, Buffer.from(JSON.stringify(payload)));
};

/**
 * Function to generate the notification payload thats send to notification queue
 * @param {any} payload -  The payload for the notification queue
 */
function getNotificationPayload(payload) {
  const p = {
    type: 'transactionEvent',
    meta: {
      recipientWalletId: payload.pillarId
    },
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
exports.initSubPubMQ = () => {
  try {
    let connection;
    logger.info('Subscriber Started executing initRabbitMQ()');
    amqp.connect(MQ_URL, (error, conn) => {
      if (error) {
        logger.error(`Subscriber failed initializing RabbitMQ, error: ${error}`);
        return setTimeout(exports.initSubPubMQ, 2000);
      }
      if (conn) {
        connection = conn;
      }
      connection.on('error', (err) => {
        logger.error(`Subscriber RMQ connection errored out: ${err}`);
        return setTimeout(exports.initSubPubMQ, 2000);
      });
      connection.on('close', () => {
        logger.error('Subscriber RMQ Connection closed');
        return setTimeout(exports.initSubPubMQ, 2000);
      });

      logger.info('Subscriber RMQ Connected');

      connection.createChannel((err, ch) => {
        ch.assertQueue(pubSubQueue, { durable: true });
        ch.consume(pubSubQueue, (msg) => {
          logger.info(`Subscriber received rmq message: ${msg.content}`);
          if (typeof msg.content !== 'undefined' && msg.content !== '' &&
            exports.validatePubSubMessage(JSON.parse(msg.content), checksumKey)) {
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
                    }
                    throw new Error('newTx: Transaction already exists');
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
    logger.error(`Subscriber initiRabbitMQ failed: ${err}`);
    return setTimeout(exports.initRabbitMQ, 2000);
  } finally {
    logger.info('Exited initRabbitMQ()');
  }
};

/**
 * Function that validates the checksum of the payload received.
 * @param {any} payload - The IPC message received from the master
 */
exports.validatePubSubMessage = (payload, checksumKey) => {
  const checksum = payload.checksum;
  delete payload.checksum;
  if (SHA256.hex(checksumKey + JSON.stringify(payload)) === checksum) {
    return true;
  }
  return false;
};
