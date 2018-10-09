#!/usr/bin/env node
/** @module subscriber.js */
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://190ad2a95b2842fbabd4e6c213ac9b9e@sentry.io/1285042' });
const CronJob = require('cron').CronJob;
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
  logger.error('ERROR: Unhandled Rejection at SUBSCRIBER:', JSON.stringify(reason));
  logger.error('***********************************************');
});

/**
 * Function that initializes the subscriber service
 */
module.exports.initServices = function () {
  
  this.logMemoryUsage();

  if(process.argv[2] === undefined) {
    throw ({ message: 'Invalid runId parameter.' });
  } else {
    runId = process.argv[2];
  }
  dbServices.dbConnect()
    .then(() => {
      logger.info('Subscriber.initServices(): Connected to database');
      rmqServices.initSubPubMQ();
      const job = new CronJob('*/5 * * * * *',() => {
        module.exports.logMemoryUsage();
      });
      job.start();
    })
    .catch((err) => {
      logger.error(err.message);
    });
};

this.initServices();