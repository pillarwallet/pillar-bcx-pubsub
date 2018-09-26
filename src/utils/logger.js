const log4js = require('log4js');
const path = require('path');
const packageJson = require('../../package.json');
const appDir = path.dirname(require.main.filename);

log4js.configure({
  appenders: {
    out: { type: 'console' }, 
    error: { type: 'dateFile', filename: `${appDir}/logs/${packageJson.name}-debug.log`, "pattern":"-dd.log",alwaysIncludePattern:true}, 
    default: { type: 'dateFile', filename: `${appDir}/logs/${packageJson.name}-debug.log`, "pattern":"-dd.log",alwaysIncludePattern:true}
  },
  categories: {
    default: { appenders: ['out','default'], level: 'debug' },
    error: { appenders: ['error'], level: 'error' }
  }
});

var logger = log4js.getLogger('syslog');
module.exports = logger;