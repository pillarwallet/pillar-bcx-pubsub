/*
Copyright (C) 2019 Stiftung Pillar Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

#!/usr/bin/env node */
/** @module subscriber.js */
require('./utils/diagnostics');
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
    logger.error(
      `Subscriber - Unhandled Rejection at Promise reason - ${reason}, p - ${p}`,
    );
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
  const rss = Math.round((mem.rss * 10.0) / (1024 * 1024 * 10.0), 2);
  const heap = Math.round((mem.heapUsed * 10.0) / (1024 * 1024 * 10.0), 2);
  const total = Math.round((mem.heapTotal * 10.0) / (1024 * 1024 * 10.0), 2);
  const external = Math.round((mem.external * 10.0) / (1024 * 1024 * 10.0), 2);
  logger.info(
    `Subscriber - PID: ${
      process.pid
    }, RSS: ${rss} MB, HEAP: ${heap} MB, EXTERNAL: ${external} MB, TOTAL AVAILABLE: ${total} MB`,
  );
}
module.exports.logMemoryUsage = logMemoryUsage;

/**
 * Function that initializes the subscriber service
 */
module.exports.initServices = function() {
  if (process.argv[2] === undefined) {
    throw { message: 'Invalid runId parameter.' };
  } else {
    runId = process.argv[2];
  }
  dbServices
    .dbConnect()
    .then(() => {
      logger.info('Subscriber.initServices(): Connected to database');
      rmqServices.initSubPubMQ();
      const job = new CronJob('*/5 * * * * *', () => {
        module.exports.logMemoryUsage();
      });
      job.start();
    })
    .catch(err => {
      logger.error(err.message);
    });
};

this.initServices();
