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
*/
'use strict';
/** @module subscriber.js */
require('./utils/diagnostics');
const logger = require('./utils/logger');
const rmqServices = require('./services/rmqServices.js');
const dbServices = require('./services/dbServices.js');
/**
 * Function for reporting unhandled promise rejections.
 * @param {any} reason - reason for failure/stack trace
 * @param {any} promise
 */

process
  .on('unhandledRejection', (reason, p) => {
    logger.error(
      `Subscriber - Unhandled Rejection at Promise reason - ${reason}, p - ${p}`,
    );
  })
  .on('uncaughtException', err => {
    logger.error(`Subscriber - Uncaught Exception thrown error - ${err}`);
    process.exit(1);
  });

/**
 * Function that initializes the subscriber service
 */
module.exports.initServices = function() {
  dbServices
    .dbConnect()
    .then(() => {
      logger.info('Subscriber.initServices(): Connected to database');
      rmqServices.initSubPubMQ();
    })
    .catch(err => {
      logger.error(err.message);
    });
};

this.initServices();
