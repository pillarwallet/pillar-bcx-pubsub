require('dotenv').config();
const amqp = require('amqplib/callback_api');
const jsHashes = require('jshashes');
const logger = require('../utils/logger.js');
const dbServices = require('./dbServices.js');


const SHA256 = new jsHashes.SHA256();
require('dotenv').config();

const checksumKey = process.env.CHECKSUM_KEY;


let pubSubChannel;
const pubSubQueue = 'bcx-pubsub';

let notificationsChannel;
const notificationsQueue = 'bcx-notifications';

const CWBURL = process.env.CWB_URL;

exports.initPubSubMQ = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.info('Executing rmqServices.initMQ()');
      amqp.connect(process.env.RABBITMQ_SERVER, (err, conn) => {
        conn.createChannel((err, ch) => {
          pubSubChannel = ch;
          const msg = '{}';
          ch.assertQueue(pubSubQueue, { durable: false });
          // Note: on Node 6 Buffer.from(msg) should be used
          ch.sendToQueue(pubSubQueue, Buffer.from(msg));
          console.log(' [x] Sent %s', msg);
          resolve();
        });
        // setTimeout(() => { conn.close(); process.exit(0); }, 500);
      });
    } catch (err) {
      logger.error('rmqServices.initPubSubMQ() failed: ', err.message);
      reject(err);
    } finally {
      logger.info('Exited rmqServices.initPubSubMQ()');
    }
  });
};

exports.sendPubSubMessage = function (payload) {
  const checksum = SHA256.hex(checksumKey + JSON.stringify(payload));
  payload.checksum = checksum;
  pubSubChannel.sendToQueue(pubSubQueue, Buffer.from(JSON.stringify(payload)));
};

exports.sendNotificationsMessage = function (payload) {
  notificationsChannel.sendToQueue(notificationsQueue, Buffer.from(JSON.stringify(payload)));
};

exports.initSubPubMQ = () => {
  try {
	  let connection;
    logger.info('Subscriber Started executing initRabbitMQ()');
    amqp.connect(process.env.RABBITMQ_SERVER, (err, conn) => {
      if (err) {
        logger.error(`Subscriber failed initializing RabbitMQ, error: ${err}`);
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
        const notificationMessage;
        ch.assertQueue(pubSubQueue, { durable: false });
        ch.consume(pubSubQueue, (msg) => {
          logger.info(`Subscriber received rmq message: ${msg.content}`);
          notificationMessage = message.content;
          if (msg.content !== undefined && msg.content !== '' && validatePubSubMessage(JSON.parse(msg.content))) {
            const entry = JSON.parse(msg.content);
            const type = entry.type;
            delete entry.type;
            delete entry.checksum;
            switch (type) {
              case 'newTx':
                entry.gasUsed = null;
                entry.blockNumber = null;
                entry.status = 'pending';

                dbServices.dbCollections.transactions.addTx(entry)
                  .then(() => {
                    logger.info(`Transaction inserted: ${entry.txHash}`);
                  });
                break;
              case 'updateTx':
                dbServices.dbCollections.transactions.updateTx(entry)
                  .then(() => {
                    logger.info(`Transaction updated: ${entry.txHash}`);
                  });
                break;
            }
          }
        }, { noAck: true });
        if (msg.content !== undefined && msg.content !== '' && validatePubSubMessage(JSON.parse(msg.content))) {
          ch.sendToQueue(notificationsQueue, new Buffer.from(msg));
        }
      });
    });
  } catch (err) {
    logger.error(`Subscriber initiRabbitMQ failed: ${err}`);
    return setTimeout(exports.initRabbitMQ, 2000);
  } finally {
    logger.info('Exited initRabbitMQ()');
  }
};

exports.validatePubSubMessage = (payload) => {
  const checksum = payload.checksum;
  delete payload.checksum;
  if (SHA256.hex(checksumKey + JSON.stringify(payload)) === checksum) {
    return true;
  }
  return false;
};
