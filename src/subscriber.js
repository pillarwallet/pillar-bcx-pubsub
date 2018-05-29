var amqp = require('amqplib/callback_api');
const logger = require('./utils/logger');
const dbServices = require('./services/dbServices.js'); 
var jsHashes = require('jsHashes');
require('dotenv').config();
const mongoUser = process.env.MONGO_USER;
const mongoPwd = process.env.MONGO_PWD;
const serverIP = process.env.SERVER;
const dbName = process.env.DBNAME;
const mongoUrl = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}`;

exports.initServices = function () {

      md5 = new jsHashes.MD5;

      dbServices.dbConnect(mongoUrl)
      .then((dbCollections) => {    
          try {
            logger.info('Started executing publisher.initMQ()');
            amqp.connect('amqp://localhost', (err, conn) => {
              conn.createChannel(function(err, ch) {
                var q = 'txQueue';
              
                ch.assertQueue(q, {durable: false});
                ch.consume(q, function(msg) {          
                var entry = JSON.parse(msg.content);

                dbCollections.transactions.addTx(entry.pillarId,entry.protocol,entry.fromAddress,entry.toAddress,entry.txHash,entry.asset,entry.contractAddress, entry.timestamp,entry.blockNumber,entry.value,entry.status,entry.gasUsed)
                .then(() =>{
                  logger.info("Transaction inserted: " + entry.txHash);
                })
                }, {noAck: true});
              });
            });
          } catch (err) {
            logger.error('subscriber.initServices() failed: ', err.message);
          } finally {
            logger.info('Exited subscriber.initServices()');
          }
        });
};

var validate = (payload) => {
  var checksum = payload.checksum;
  delete payload.checksum;
  if (md5.hex(JSON.stringify(payload)) === checksum) {
    return true;
  } else {
    return false;
  }
}

exports.initServices();
