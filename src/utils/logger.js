const log4js = require('log4js');
const path = require('path');
const packageJson = require('../../package.json');
const appDir = require('app-root-path');
let logger = log4js.getLogger('syslog');
log4js.configure({
  appenders: {
    out: { type: 'stdout' }, 
    error: { type: 'dateFile', filename: `${appDir}/src/logs/${packageJson.name}-debug`, "pattern":".log",alwaysIncludePattern:true}, 
    default: { type: 'dateFile', filename: `${appDir}/src/logs/${packageJson.name}-debug`, "pattern":".log",alwaysIncludePattern:true}
  },
  categories: {
    default: { appenders: ['out','default'], level: 'info' },
    error: { appenders: ['error'], level: 'error' }
  },
  pm2: true,
  pm2InstanceVar: 'INSTANCE_ID'
});
module.exports = logger;