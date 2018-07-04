require('dotenv').config();

const amqp = require('amqplib/callback_api');
const jsHashes = require('jshashes');
const logger = require('../utils/logger.js');
const dbServices = require('./dbServices.js');

const SHA256 = new jsHashes.SHA256();
require('dotenv').config();

const { env } = process;
const checksumKey = env.CHECKSUM_KEY;

let pubSubChannel;

const pubSubQueue = typeof env.PUB_SUB_QUEUE !== 'undefined' ?
  env.PUB_SUB_QUEUE : 'bcx-pubsub';

let notificationsChannel;

const notificationsQueue = typeof env.NOTIFICATIONS_QUEUE !== 'undefined' ?
  env.NOTIFICATIONS_QUEUE : 'bcx-notifications';

const CWBURL = env.CWB_URL;

function validatePubSubMessage(payload) {
  const { checksum } = payload;
  delete payload.checksum;
  return (SHA256.hex(checksumKey + JSON.stringify(payload)) === checksum);
}

exports.validatePubSubMessage = validatePubSubMessage;

exports.initPubSubMQ = () => new Promise((resolve, reject) => {
  logger.info('Executing rmqServices.initMQ()');
  amqp.connect(env.RABBITMQ_SERVER, (error, conn) => {
    conn.createChannel((err, ch) => {
      pubSubChannel = ch;
      const msg = '{}';
      ch.assertQueue(pubSubQueue, { durable: false });
      // Note: on Node 6 Buffer.from(msg) should be used
      ch.sendToQueue(pubSubQueue, Buffer.from(msg));
      logger.info(` [x] Sent: ${msg}`);
      resolve();
    });
  });
});

exports.sendPubSubMessage = (payload) => {
  payload.checksum = SHA256.hex(checksumKey + JSON.stringify(payload));
  pubSubChannel.sendToQueue(pubSubQueue, Buffer.from(JSON.stringify(payload)));
};

exports.sendNotificationsMessage = (payload) => {
  notificationsChannel.sendToQueue(notificationsQueue, Buffer.from(JSON.stringify(payload)));
};

exports.initSubPubMQ = () => {
  try {
    let connection;
    logger.info('Subscriber Started executing initRabbitMQ()');
    amqp.connect(env.RABBITMQ_SERVER, (error, conn) => {
      if (error) {
        logger.error(`Subscriber failed initializing RabbitMQ, error: ${error}`);
        return setTimeout(exports.initSubPubMQ, 2000);
      }

      if (conn) {
        connection = conn;
      }

      connection.on('error', (err) => {
        logger.error(`Subscriber RMQ connection error out: ${err}`);
        return setTimeout(exports.initSubPubMQ, 2000);
      });

      connection.on('close', () => {
        logger.error('Subscriber RMQ Connection closed');
        return setTimeout(exports.initSubPubMQ, 2000);
      });

      logger.info('Subscriber RMQ Connected');

      connection.createChannel((err, ch) => {
        ch.assertQueue(pubSubQueue, { durable: false });

        ch.consume(pubSubQueue, (msg) => {
          logger.info(`Subscriber received rmq message: ${msg.content}`);

          if (typeof msg.content !== 'undefined' && msg.content !== '' &&
            validatePubSubMessage(JSON.parse(msg.content))) {
            const entry = JSON.parse(msg.content);
            const { type } = entry;
            delete entry.type;
            delete entry.checksum;
            switch (type) {
              case 'newTx':
                entry.gasUsed = null;
                entry.blockNumber = null;
                entry.status = 'pending';

                dbServices.dbCollections.transactions.findOneByTxHash(entry.txHash)
                  .then((tx) => {
                    if (tx === null) {
                      return dbServices.dbCollections.transactions.addTx(entry);
                    }
                    throw new Error('Transaction already exists');
                  })
                  .then(() => {
                    logger.info(`Transaction inserted: ${entry.txHash}`);
                    ch.assertQueue(notificationsQueue, { durable: false });
                    ch.sendToQueue(
                      notificationsQueue,
                      new Buffer.from(JSON.stringify(msg.content))
                    );
                    logger.info(`Transaction produced to: ${notificationsQueue}`);
                  })
                  .catch(e => logger.error(`${JSON.stringify(e)}`));
                break;
              case 'updateTx':
                dbServices.dbCollections.transactions.updateTx(entry)
                  .then(() => logger.info(`Transaction updated: ${entry.txHash}`));
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
