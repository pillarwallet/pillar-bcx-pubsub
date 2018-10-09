require('dotenv').config();
const buildLogger = require('@pillarwallet/common-logger');
var appRoot = require('app-root-path');
const packageJson = require('../../package.json');
const appDir = appRoot + process.env.LOGS_DIR;
const logger = buildLogger(
    { level: 'info', name: packageJson.name+'-common-logs', path: appDir }
);

module.exports = logger;