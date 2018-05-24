const express = require('express');
const path = require('path');
const morganLogger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('./src/utils/logger.js');
var amqp = require('amqplib/callback_api');
require('dotenv').config();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morganLogger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

/**
 * Log errors that occur. This should occur
 * last in the middleware chain.
 */
app.use((err, req, res, next) => {
  logger.error(err.stack);
  next(err);
});

// app.use('/', index);
// app.use('/users', users);

const initialize = () => new Promise(((resolve) => {
  /* CONNECT TO GETH NODE */
  require('./src/services/gethConnect.js').gethConnectDisplay()
    .then((web3) => {
	    /* CONNECT TO DATABASE */
	    const mongoUser = process.env.MONGO_USER;
	    const mongoPwd = process.env.MONGO_PWD;
	    const serverIP = process.env.SERVER;
	    const dbName = process.env.DBNAME;
	    const url = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}`;
	    const dbServices = require('./src/services/dbServices.js');
	    dbServices.dbConnectDisplayAccounts(url)
	    .then((dbCollections) => {
        /* CONNECT TO MESSAGE QUEUE CHANNEL */

        /* LOAD BCX SERVICES */
        const bcx = require('./src/services/bcx.js');

        /* SUBSCRIBE TO GETH NODE EVENTS */
        const gethSubscribe = require('./src/services/gethSubscribe.js');

        const notif = require('./src/services/notifications.js');
        const processTx = require('./src/services/processTx.js');
        const abiDecoder = require('abi-decoder');

        gethSubscribe.subscribePendingTx(web3, bcx, processTx, dbCollections, abiDecoder, notif);
        gethSubscribe.subscribeBlockHeaders(
          web3, gethSubscribe, bcx, processTx, dbServices,
          dbCollections, abiDecoder, notif, true, true,
        );

        gethSubscribe.subscribeAllDBERC20SmartContracts(web3, bcx, processTx, dbCollections, notif);

        amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
          var q = 'bcx';
          var msg = 'Hello World!';
          ch.assertQueue(q, {durable: false});
          ch.sendToQueue(q, new Buffer(msg));
        });
        setTimeout(function() { conn.close(); process.exit(0) }, 500);
      });

	    });
    });
}));


module.exports.app = app;
module.exports.initialize = initialize();
