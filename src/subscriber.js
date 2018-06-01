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

md5 = new jsHashes.MD5;
var connection;

exports.initServices = function () {
      dbServices.dbConnect(mongoUrl)
      .then((dbCollections) => {
        logger.info("Connected to database")
        initRabbitMQ(dbCollections);
      })
      .catch(err =>{
        logger.error(err.message);
      })
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

var initRabbitMQ = (dbCollections) => {
  try {
          logger.info('Started executing initRabbitMQ()');
          amqp.connect('amqp://localhost', (err, conn) => {
            if (err) {
              logger.error(err.message);
              return setTimeout(initRabbitMQ, 2000);
            }
            if (conn)
            {
              connection = conn;
            }
            connection.on("error", function(err)
            {
              logger.error(err)
              return setTimeout(initRabbitMQ, 2000);
            });
            connection.on("close", function()
            {
              logger.error("Connection closed");
              return setTimeout(initRabbitMQ, 2000);
            });

          logger.info("Connected");

          connection.createChannel(function(err, ch) {
                
            var q = 'txQueue';
            ch.assertQueue(q, {durable: false});
            ch.consume(q, function(msg) {          
            var entry = JSON.parse(msg.content);
            var type = entry.type;
            delete entry.type;

            switch(type) {
            case 'newPendingTx':
                entry['gasUsed'] = '';
                entry['blockNumber'] = '';
                entry['status'] = 'pending'
                dbCollections.transactions.addTx(entry)
                .then(() => {
                  logger.info("Transaction inserted: " + entry.txHash);
                })
                .catch(err =>{
                  logger.error(err.message)
                })
            break;
            case 'newMinedTx':              
                dbCollections.transactions.addTx(entry)
                .then(() => {
                  logger.info("Transaction inserted: " + entry.txHash);
                })
                .catch(err =>{
                  logger.error(err.message)
                })
            break;
            case 'updateTx':
                dbCollections.transactions.updateTx(entry)
                .then(() => {
                  logger.info("Transaction updated: " + entry.txHash);
                })
                .catch(err =>{
                  logger.error(err.message)
                })
            break;
              }
            }, {noAck: true});
          });
        })
      }  
       catch (err) {
          logger.error(err.message);
          return setTimeout(einitRabbitMQ, 2000);
        } finally {
          logger.info('Exited initRabbitMQ()');
        }
}


exports.initServices()
