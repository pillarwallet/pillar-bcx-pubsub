const amqp = require('amqplib/callback_api');
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices.js');
const jsHashes = require('jsHashes');
require('dotenv').config();

const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PWD;
const serverIP = process.env.SERVER;
const dbName = process.env.DBNAME;
const mongoUrl = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}`;
const hashPrefix = process.env.HASH_PREFIX;

let dbCollections;

sha256 = new jsHashes.SHA256();
let connection;

exports.initServices = function () {
  dbServices.dbConnect(mongoUrl)
    .then((db) => {
      dbCollections = db;
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
    logger.info('Started executing initRabbitMQ()');
    amqp.connect('amqp://localhost', (err, conn) => {
      if (err) {
        logger.error(err.message);
        return setTimeout(exports.initRabbitMQ, 2000);
      }
      if (conn) {
        connection = conn;
      }
      connection.on('error', (err) => {
        logger.error(err);
        return setTimeout(exports.initRabbitMQ, 2000);
      });
      connection.on('close', () => {
        logger.error('Connection closed');
        return setTimeout(exports.initRabbitMQ, 2000);
      });

      logger.info('Connected');

      connection.createChannel((err, ch) => {
        const q = 'bcx-pubsub';
        ch.assertQueue(q, { durable: false });
        ch.consume(q, (msg) => {
          const entry = JSON.parse(msg.content);
          const type = entry.type;
          delete entry.type;
          delete entry.checksum;
          switch (type) {
            case 'newTx':
              entry.gasUsed = '';
              entry.blockNumber = '';
              entry.status = 'pending';

              dbCollections.transactions.addTx(entry)
                .then(() => {
                  logger.info(`Transaction inserted: ${entry.txHash}`);
                })
                .catch((err) => {
                  logger.error(err.message);
                });
              break
            case 'updateTx':
              dbCollections.transactions.updateTx(entry)
                .then(() => {
                  logger.info(`Transaction updated: ${entry.txHash}`);
                })
                .catch((err) => {
                  logger.error(err.message);
                });
              break;
          }
        }, { noAck: true });
      });
    });
  } catch (err) {
    logger.error(err.message);
    return setTimeout(exports.initRabbitMQ, 2000);
  } finally {
    logger.info('Exited initRabbitMQ()');
  }
};


this.initServices();
