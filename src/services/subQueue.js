#!/usr/bin/env node
const amqp = require('amqplib/callback_api');

const amqpConn = null;
exports.connect = () => {
  amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
      console.error('[AMQP]', err.message);
      return setTimeout(module.exports.connect, 1000);
    }
    conn.on('error', (e) => {
      if (err.message !== 'Connection closing') {
        console.error('Error: ', e.message);
      }
    });
    conn.on('close', () => {
      console.error('Reconnecting');
      return setTimeout(module.exports.connect, 1000);
    });
    console.log('Connected');
    conn.createChannel((e, ch) => {
      const q = 'hello';

      ch.assertQueue(q, { durable: false });
	    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q);
	    ch.consume(q, (msg) => {
		    console.log(' [x] Received %s', msg.content.toString());
	    }, { noAck: true });
    });
    //	amqpConn = conn;
    // whenConnected();
  });
};
