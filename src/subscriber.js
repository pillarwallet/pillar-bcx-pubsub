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
 * @param {any} promise
 */

process
  .on('unhandledRejection', (reason, promise) => {
    logger.error(`Subscriber - Unhandled Rejection at Promise reason - ${reason}, p - ${p}`);
  })
  .on('uncaughtException', err => {
    logger.error(`Subscriber - Uncaught Exception thrown error - ${err}`);
    process.exit(1);
  });


/**
 * commonon logger function that prints out memory footprint of the process
 */
function logMemoryUsage() {
  const mem = process.memoryUsage();
  var rss = Math.round((mem.rss*10.0) / (1024*1024*10.0),2);
  var heap = Math.round((mem.heapUsed*10.0) / (1024*1024*10.0),2);
  var total = Math.round((mem.heapTotal*10.0) / (1024*1024*10.0),2);
  var external = Math.round((mem.external*10.0) / (1024*1024*10.0),2);
  logger.info(`Subscriber - PID: ${process.pid}, RSS: ${rss} MB, HEAP: ${heap} MB, EXTERNAL: ${external} MB, TOTAL AVAILABLE: ${total} MB`);
}
module.exports.logMemoryUsage = logMemoryUsage;

/**
 * Function that initializes the subscriber service
 */
module.exports.initServices = function () {

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