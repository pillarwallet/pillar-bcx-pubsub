const amqp = require('amqplib/callback_api');
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices.js');
const jsHashes = require('jsHashes');

const hashPrefix = process.env.HASH_PREFIX;

// let dbCollections;

sha256 = new jsHashes.SHA256();
let connection;

exports.initServices = function () {
  dbServices.dbConnect()
    .then(() => {
      logger.info('Connected to database');
      this.initRabbitMQ();
    })
    .catch((err) => {
      logger.error(err.message);
    });
};

exports.validate = (payload) => {
  const checksum = payload.checksum;
  delete payload.checksum;
  if (sha256.hex(hashPrefix + JSON.stringify(payload)) === checksum) {
    return true;
  }
  return false;
};

exports.initRabbitMQ = () => {
  try {
    logger.info('Subscriber Started executing initRabbitMQ()');
    amqp.connect('amqp://localhost', (err, conn) => {
      if (err) {
        logger.error('Subscriber failed initializing RabbitMQ, error: ' + err);
        return setTimeout(exports.initRabbitMQ, 2000);
      }
      if (conn) {
        connection = conn;
      }
      connection.on('error', (err) => {
        logger.error('Subscriber RMQ connection errored out: ' + err);
        return setTimeout(exports.initRabbitMQ, 2000);
      });
      connection.on('close', () => {
        logger.error('Subscriber RMQ Connection closed');
        return setTimeout(exports.initRabbitMQ, 2000);
      });

      logger.info('Subscriber RMQ Connected');

      connection.createChannel((err, ch) => {
        const q = 'bcx-pubsub';
        ch.assertQueue(q, { durable: false });
        ch.consume(q, (msg) => {
          logger.info('Subscriber received rmq message: ' + msg.content);
          if(msg.content !== undefined && msg.content !== '') {
            const entry = JSON.parse(msg.content);
            const type = entry.type;
            delete entry.type;
            delete entry.checksum;
            switch (type) {
              case 'newTx':
                entry.gasUsed = '';
                entry.blockNumber = '';
                entry.status = 'pending';

                dbServices.dbCollections.transactions.addTx(entry)
                  .then(() => {
                    logger.info(`Transaction inserted: ${entry.txHash}`);
                  })
                break
              case 'updateTx':
                dbServices.dbCollections.transactions.updateTx(entry)
                  .then(() => {
                    logger.info(`Transaction updated: ${entry.txHash}`);
                  })
                break;
            }
          }
        }, { noAck: true });
      });
    });
  } catch (err) {
    logger.error('Subscriber initiRabbitMQ failed: ' + err);
    return setTimeout(exports.initRabbitMQ, 2000);
  } finally {
    logger.info('Exited initRabbitMQ()');
  }
};

this.initServices();