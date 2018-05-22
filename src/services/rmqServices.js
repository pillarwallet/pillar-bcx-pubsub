const amqp = require('amqplib/callback_api');

let amqpConn = null;
let pubChannel = null;
const offlinePubQueue = [];


const connect = () => {
  return new Promise((resolve, reject) => {
		amqp.connect('amqp://localhost', (err, conn) => {
			if (err) {
				console.error('[AMQP]', err.message);
				resolve(setTimeout(connect, 1000));
			}
			conn.on('error', (err) => {
				if (err.message !== 'Connection closing') {
					console.error('[AMQP] conn error', err.message);
					reject();
				}
			});
			conn.on('close', () => {
				console.error('[AMQP] reconnecting');
				resolve(setTimeout(connect, 1000));
			});
			console.log('[AMQP] connected');
			amqpConn = conn;
			resolve();
		});
	});
}

const startPublisher = () => {
  amqpConn.createConfirmChannel((err, ch) => {
    if (closeOnErr(err)) return;
    ch.on('error', (err) => {
      console.error('[AMQP] channel error', err.message);
    });
    ch.on('close', () => {
      console.log('[AMQP] channel closed');
    });

    pubChannel = ch;
    while (true) {
      const m = offlinePubQueue.shift();
      if (!m) break;
      publish(m[0], m[1], m[2]);
    }
  });
};

var publish = (exchange, routingKey, content) => {
  try {
    pubChannel.publish(
      exchange, routingKey, content, { persistent: true },
      (err, ok) => {
        if (err) {
          console.error('[AMQP] publish', err);
          offlinePubQueue.push([exchange, routingKey, content]);
          pubChannel.connection.close();
        }
      },
    );
  } catch (e) {
    console.error('[AMQP] publish', e.message);
    offlinePubQueue.push([exchange, routingKey, content]);
  }
};

const startSubscriber = () => {
  amqpConn.createChannel((err, ch) => {
    if (closeOnErr(err)) return;
    ch.on('error', (err) => {
      console.error('[AMQP] channel error', err.message);
    });
    ch.on('close', () => {
      console.log('[AMQP] channel closed');
    });

    ch.prefetch(10);
    ch.assertQueue('jobs', { durable: true }, (err, _ok) => {
      if (closeOnErr(err)) return;
      ch.consume('jobs', processMsg, { noAck: false });
      console.log('Worker is started');
    });
  });
};

var processMsg = (msg) => {
  work(msg, (ok) => {
    try {
      if (ok) { ch.ack(msg); } else { ch.reject(msg, true); }
    } catch (e) {
      closeOnErr(e);
    }
  });
};

var work = (msg, cb) => {
  console.log('PDF processing of ', msg.content.toString());
  cb(true);
};

var closeOnErr = (err) => {
  if (!err) return false;
  console.error('[AMQP] error', err);
  amqpConn.close();
  return true;
};

module.exports = {
  amqpConn,
  pubChannel,
  offlinePubQueue,
  connect,
  startPublisher,
  publish,
	startSubscriber,
  processMsg,
  work,
  closeOnErr,
};
