#!/usr/bin/env node
/** @module subscriber.js */
const logger = require('./utils/logger');
const rmqServices = require('./services/rmqServices.js');
const dbServices = require('./services/dbServices.js');
let runId = 0;

/**
 * Function for reporting unhandled promise rejections.
 * @param {any} reason - reason for failure/stack trace
 */

process.on('unhandledRejection', (reason, promise) => {
  logger.error('***********************************************');
  logger.error('ERROR: Unhandled Rejection at SUBSCRIBER:', reason.stack || reason);
  logger.error('***********************************************');
});


/**
 * Function that initializes the subscriber service
 */
exports.initServices = function () {

  if(process.argv[2] === undefined) {
    throw ({ message: 'Invalid runId parameter.' });
  } else {
    runId = process.argv[2];
  }
  dbServices.dbConnect()
    .then(() => {
      logger.info('Subscriber.initServices(): Connected to database');
      rmqServices.initSubPubMQ();
    })
    .catch((err) => {
      logger.error(err.message);
    });
};

this.initServices();