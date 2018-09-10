#!/usr/bin/env node
/** @module subscriber.js */
const logger = require('./utils/logger');
const rmqServices = require('./services/rmqServices.js');
const dbServices = require('./services/dbServices.js');
let runId = 0;

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