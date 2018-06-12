const { createLogger, format, transports } = require('winston');
require('winston-syslog').Syslog; // eslint-disable-line no-unused-expressions
const path = require('path');
const packageJson = require('../../package.json');

const appDir = path.dirname(require.main.filename);

const {
  combine,
  timestamp,
  printf,
  colorize,
} = format;

const formatter = printf((info) => {
  const output = `${info.timestamp} - ${process.argv[1].substring(process.argv[1].lastIndexOf('/') + 1)} : [${packageJson.name}/${packageJson.version}] ${info.level}: ${info.message}`;
  return output;
});

const logger = createLogger({
  transports: [
    new transports.Console({
      level: 'debug',
      format: combine(
        colorize(),
        timestamp(),
        formatter,
      ),
    }),
    new transports.Syslog(),
    new transports.File({ level: 'silly', filename: `${appDir}/logs/${packageJson.name}.log` }),
    new transports.File({ level: 'debug', filename: `${appDir}/logs/${packageJson.name}-debug.log` }),
    new transports.File({ level: 'verbose', filename: `${appDir}/logs/${packageJson.name}-verbose.log` }),
    new transports.File({ level: 'info', filename: `${appDir}/logs/${packageJson.name}-info.log` }),
    new transports.File({ level: 'warn', filename: `${appDir}/logs/${packageJson.name}-warn.log` }),
    new transports.File({ level: 'error', filename: `${appDir}/logs/${packageJson.name}-error.log` }),
  ],
});

module.exports = logger;
