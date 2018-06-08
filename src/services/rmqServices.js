const amqp = require('amqplib/callback_api');
const jsHashes = require('jsHashes');
const logger = require('../utils/logger.js');

const SHA256 = new jsHashes.SHA256();
require('dotenv').config();

const checksumKey = process.env.CHECKSUM_KEY;


exports.initMQ = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.info('Executing rmqServices.initMQ()');
      amqp.connect('amqp://localhost', (err, conn) => {
        conn.createChannel((err, ch) => {
          const q = 'bcx-pubsub';
          const msg = 'Initialized bcx-pubsub message queue!';
          ch.assertQueue(q, { durable: false });
          // Note: on Node 6 Buffer.from(msg) should be used
          ch.sendToQueue(q, Buffer.from(msg));
          console.log(' [x] Sent %s', msg);
          resolve({ ch, q });
        });
        // setTimeout(() => { conn.close(); process.exit(0); }, 500);
      });
    } catch (err) {
      logger.error('rmqServices.initMQ() failed: ', err.message);
    } finally {
      logger.info('Exited rmqServices.initMQ()');
    }
  });
};

function sendMessage(payload, channel, queue) {
  const checksum = SHA256.hex(checksumKey + JSON.stringify(payload));

  payload.checksum = checksum;
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
}
module.exports.sendMessage = sendMessage;
