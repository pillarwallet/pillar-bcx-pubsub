const log4js = require('log4js');
const path = require('path');
const packageJson = require('../../package.json');
//const appDir = path.dirname(require.main);
const appDir = require('app-root-path');
let logger = log4js.getLogger('syslog');
log4js.configure({
  appenders: {
    everything: { type: 'file', filename: `${appDir}/src/logs/${packageJson.name}-debug.log`, maxLogSize: 100458760, backups: 3, flags: "rs+" }
  },
  categories: {
    default: { appenders: [ 'everything' ], level: 'info'}
  }
});
module.exports = logger;