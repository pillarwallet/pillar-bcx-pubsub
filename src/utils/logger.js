const log4js = require('log4js');
const path = require('path');
const packageJson = require('../../package.json');
const appDir = path.dirname(require.main.filename);
let logger = log4js.getLogger('syslog');
log4js.configure({
  appenders: {
    out: { type: 'console' }, 
    error: { type: 'fileSync', filename: `${appDir}/logs/${packageJson.name}-debug`, "pattern":".log",alwaysIncludePattern:true}, 
    default: { type: 'fileSync', filename: `${appDir}/logs/${packageJson.name}-debug`, "pattern":".log",alwaysIncludePattern:true}
  },
  categories: {
    default: { appenders: ['out','default'], level: 'info' },
    error: { appenders: ['error'], level: 'error' }
  }
});
module.exports = logger;