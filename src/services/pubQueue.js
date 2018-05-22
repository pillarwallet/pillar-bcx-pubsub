const amqp = require('amqplib/callback_api');

const amqpConn = null;

exports.connect = () => new Promise((resolve, reject) => {
  amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
      console.error('[AMQP]', err.message);
      // reject();
      resolve(setTimeout(module.exports.connect, 1000));
    }
    conn.on('error', (e) => {
      if (e.message !== 'Connection closing') {
        console.error('Error: ', e.message);
        reject();
      }
    });
    conn.on('close', () => {
      console.error('Reconnecting');
      resolve(setTimeout(module.exports.connect, 1000));
    });
    console.log('Connected');
    conn.createChannel((e, channel) => {
      if (e) {
        reject();
      } else {
        const queue = 'pubsub';
        ch.assertQueue(queue, { durable: false });
        resolve({ channel, queue });
      }
    });
    //	amqpConn = conn;
    // whenConnected();
  });
});

exports.message = (channel, queue, msg) => {
  channel.sendToQueue(queue, Buffer.from(msg));
  console.log(' [x] Sent %s', msg);
};
