#!/usr/bin/env node
/** @module subscriber.js */
const logger = require('./utils/logger');
const rmqServices = require('./services/rmqServices.js');
const dbServices = require('./services/dbServices.js');

/**
 * Function that initializes the subscriber service
 */
exports.initServices = function () {
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