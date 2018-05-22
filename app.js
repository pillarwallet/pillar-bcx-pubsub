var express = require('express');
var path = require('path');
var morganLogger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const logger = require('./utils/logger.js');
require('dotenv').config();

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

 app.use(morganLogger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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

//app.use('/', index);
//app.use('/users', users);

const initialize = () => new Promise(((resolve) => {
  /* CONNECT TO GETH NODE */
  require("./services/gethConnect.js").gethConnectDisplay()
    .then((web3) => {
      /* CONNECT TO DATABASE */
      const mongoUser = process.env.MONGO_USER;
      const mongoPwd = process.env.MONGO_PWD;
      const serverIP = process.env.SERVER;
      const dbName = process.env.DBNAME;
      const url = `mongodb://${mongoUser}:${mongoPwd}@${serverIP}:27017/${dbName}`;

      const dbServices = require("./services/dbServices.js");
      dbServices.dbConnectDisplayAccounts(url)
        .then((dbCollections) => {
          /* MANUALLY ADD ACCOUNTS AND ERC20 SMART-CONTRACTS TO DATABASE */
          // var accounts = require('./services/accounts.js') //Load dummy accounts
          // dbServices.initDB(accounts.accountsArray,accounts.contractsArray)

          /* SET ROUTES */
          require("./routes/routes.js")(app, web3);

          /* INITIALIZE DATABASE */
          dbServices.initDBTxHistory()
          // dbServices.resetDBTxHistory()

            .then(() => {
              dbServices.initDBERC20SmartContracts()
              // dbServices.resetDBERC20SmartContracts()

                .then(() => {
                  /* LOAD BCX SERVICES */
                  const bcx = require("./services/bcx.js");

                  /* SUBSCRIBE TO GETH NODE EVENTS */
                  const gethSubscribe = require("./services/gethSubscribe.js");
                  const notif = require("./services/notifications.js");
                  const processTx = require("./services/processTx.js");
                  const abiDecoder = require("abi-decoder");

                  gethSubscribe.subscribePendingTx(
                    web3, bcx, processTx, dbCollections, abiDecoder, notif,
                  );
                  gethSubscribe.subscribeBlockHeaders(
                    web3, gethSubscribe, bcx, processTx, dbServices,
                    dbCollections, abiDecoder, notif, true, true,
                  );
                  gethSubscribe.subscribeAllDBERC20SmartContracts(
                    web3, bcx, processTx, dbCollections, notif,
                  );
                  resolve();
                });
            });
        });
    });
}));

module.exports.app = app;
module.exports.initialize = initialize();
