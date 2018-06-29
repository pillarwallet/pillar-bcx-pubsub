require('dotenv').config();
const amqp = require('amqplib/callback_api');
const jsHashes = require('jshashes');
const logger = require('../utils/logger.js');

const SHA256 = new jsHashes.SHA256();
require('dotenv').config();

const checksumKey = process.env.CHECKSUM_KEY;

let channel;
const queue = 'bcx-pubsub';

exports.initMQ = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.info('Executing rmqServices.initMQ()');
      amqp.connect(process.env.RABBITMQ_SERVER, (err, conn) => {
        conn.createChannel((err, ch) => {
          channel = ch;
          const msg = '{}';
          ch.assertQueue(queue, { durable: false });
          // Note: on Node 6 Buffer.from(msg) should be used
          ch.sendToQueue(queue, Buffer.from(msg));
          console.log(' [x] Sent %s', msg);
          resolve();
        });
        // setTimeout(() => { conn.close(); process.exit(0); }, 500);
      });
    } catch (err) {
      logger.error('rmqServices.initMQ() failed: ', err.message);
      reject(err);
    } finally {
      logger.info('Exited rmqServices.initMQ()');
    }
  });
};

function sendMessage(payload) {
  const checksum = SHA256.hex(checksumKey + JSON.stringify(payload));
  payload.checksum = checksum;
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
}
module.exports.sendMessage = sendMessage;
