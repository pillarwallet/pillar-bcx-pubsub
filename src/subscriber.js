#!/usr/bin/env node
/** @module subscriber.js */
const logger = require('./utils/logger');
const rmqServices = require('./services/rmqServices.js');
const dbServices = require('./services/dbServices.js');

/**
 * Function that initializes the subscriber service
 */
exports.initServices = function () {
<<<<<<< HEAD
  dbServices.dbConnect()
    .then(() => {
      logger.info('Subscriber.initServices(): Connected to database');
      rmqServices.initSubPubMQ();
    })
    .catch((err) => {
      logger.error(err.message);
    });
=======
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

>>>>>>> fix-unit-tests
};

this.initServices();