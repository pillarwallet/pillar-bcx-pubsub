
const amqp = require('amqplib/callback_api');
const logger = require('./utils/logger');
const rmqServices = require('./services/rmqServices.js');
const dbServices = require('./services/dbServices.js');


exports.initServices = function () {
  return new Promise((resolve, reject) => {
		dbServices.dbConnect()
		.then(() => {
			logger.info('Connected to database');
			rmqServices.initSubPubMQ();
			resolve()
		})
		.catch((err) => {
			logger.error(err.message);
			reject()
		});
  });

};

this.initServices();
