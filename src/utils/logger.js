require('dotenv').config();
const buildLogger = require('@pillarwallet/common-logger');
var appRoot = require('app-root-path');
const packageJson = require('../../package.json');
const appDir = appRoot + process.env.LOGS_DIR;
const level = process.env.LOGS_LEVEL
const logger = buildLogger(
    { level, name: packageJson.name + '-log', path: appDir, logToFile: process.env.NODE_ENV !== 'test' }
);

module.exports = logger;