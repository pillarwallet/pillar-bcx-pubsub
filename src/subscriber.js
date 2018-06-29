const logger = require('./utils/logger');
const rmqServices = require('./services/rmqServices.js');
const dbServices = require('./services/dbServices.js');


exports.initServices = function () {
  dbServices.dbConnect()
    .then(() => {
      logger.info('Connected to database');
      rmqServices.initSubPubMQ();
    })
    .catch((err) => {
      logger.error(err.message);
    });
};

this.initServices();
