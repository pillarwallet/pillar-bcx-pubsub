#!/usr/bin/env node
/** @module subscriber.js */
const logger = require('./utils/logger');
const rmqServices = require('./services/rmqServices.js');
const dbServices = require('./services/dbServices.js');
const optionDefinitions = [
  { name: 'runId', type: Number }
];
const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions, {partial: false});
let runId = 0;

/**
 * Function that initializes the subscriber service
 */
exports.initServices = function () {

  if(options.runId === undefined) {
    throw ({ message: 'Invalid runId parameter.' });
  } else {
    runId = options.runId;
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