var amqp = require('amqplib/callback_api');
var amqpConn = null;
var pubChannel = null;
var offlinePubQueue = [];

    var connect = () => {
        amqp.connect("amqp://localhost", function(err, conn) {
        if (err) {
            console.error("[AMQP]", err.message);
            return setTimeout(connect, 1000);
        }
        conn.on("error", function(err) {
            if (err.message !== "Connection closing") {
            console.error("[AMQP] conn error", err.message);
            }
        });
        conn.on("close", function() {
            console.error("[AMQP] reconnecting");
            return setTimeout(connect, 1000);
        });
        console.log("[AMQP] connected");
        amqpConn = conn;
        });
    }

    var startPub = () => {
        amqpConn.createConfirmChannel(function(err, ch) {
          if (closeOnErr(err)) return;
            ch.on("error", function(err) {
            console.error("[AMQP] channel error", err.message);
          });
          ch.on("close", function() {
            console.log("[AMQP] channel closed");
          });
      
          pubChannel = ch;
          while (true) {
            var m = offlinePubQueue.shift();
            if (!m) break;
            publish(m[0], m[1], m[2]);
          }
        });
      }
      
      var publish = (exchange, routingKey, content) => {
        try {
          pubChannel.publish(exchange, routingKey, content, { persistent: true },
                            function(err, ok) {
                              if (err) {
                                console.error("[AMQP] publish", err);
                                offlinePubQueue.push([exchange, routingKey, content]);
                                pubChannel.connection.close();
                              }
                            });
        } catch (e) {
          console.error("[AMQP] publish", e.message);
          offlinePubQueue.push([exchange, routingKey, content]);
        }
      }
      var startSub = () => {
        amqpConn.createChannel(function(err, ch) {
          if (closeOnErr(err)) return;
          ch.on("error", function(err) {
            console.error("[AMQP] channel error", err.message);
          });
          ch.on("close", function() {
            console.log("[AMQP] channel closed");
          });
      
          ch.prefetch(10);
          ch.assertQueue("jobs", { durable: true }, function(err, _ok) {
            if (closeOnErr(err)) return;
            ch.consume("jobs", processMsg, { noAck: false });
            console.log("Worker is started");
          });
        });
      }

      var processMsg = (msg) => {
        work(msg, function(ok) {
          try {
            if (ok)
              ch.ack(msg);
            else
              ch.reject(msg, true);
          } catch (e) {
            closeOnErr(e);
          }
        });
      },

      var work = (msg, cb) => {
        console.log("PDF processing of ", msg.content.toString());
        cb(true);
      },

      var closeOnErr = (err) => {
        if (!err) return false;
        console.error("[AMQP] error", err);
        amqpConn.close();
        return true;
      }

module.exports = {
    amqpConn,
    pubChannel,
    offlinePubQueue,
    connect,
    startPub,
    publish,
    startSub,
    processMsg,
    work,
    closeOnErr
}