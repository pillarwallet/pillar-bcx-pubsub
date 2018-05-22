#!/usr/bin/env node

exports.connect = () => {
  amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
      console.error('[AMQP]', err.message);
      return setTimeout(start, 1000);
    }
    conn.on('error', (err) => {
      if (err.message !== 'Connection closing') {
        console.error('Error: ', err.message);
      }
    });
    conn.on('close', () => {
      console.error('Reconnecting');
      return setTimeout(start, 1000);
    });
    console.log('Connected');
    conn.createChannel((err, ch) => {
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
