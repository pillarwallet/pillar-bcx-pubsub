const express = require('express');
const path = require('path');
const morganLogger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('./src/utils/logger.js');
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
  /* CONNECT TO DATABASE */
  const mongoUser = process.env.MONGO_USER;
  const mongoPwd = process.env.MONGO_PWD;
  const serverIP = process.env.SERVER;
  const dbName = process.env.DBNAME;
  const url = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}`;

  const dbServices = require('./src/subServices/dbServices.js');
  dbServices.dbConnectDisplayAccounts(url)
    .then(() => {
      /* MANUALLY ADD ACCOUNTS AND ERC20 SMART-CONTRACTS TO DATABASE */
      // var accounts = require('./pubServices/accounts.js') //Load dummy accounts
      // dbServices.initDB(accounts.accountsArray,accounts.contractsArray)

      /* INITIALIZE DATABASE */
      dbServices.initDBTxHistory()
      // dbServices.resetDBTxHistory()

        .then(() => {
          dbServices.initDBERC20SmartContracts()
          // dbServices.resetDBERC20SmartContracts()
            .then(() => {
              /* CONNECT TO MESSAGE QUEUE CHANNEL */
              const messageQueue = require('./src/pubServices/pubQueue.js')
	            messageQueue.connect();

              resolve();

            });
        });
    });
}));


module.exports.app = app;
module.exports.initialize = initialize();
