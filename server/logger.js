const winston = require('winston');

const config = require('./config');

const alignedWithColorsAndTime = winston.format.combine(
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const {
      timestamp, level, message, ...args
    } = info;

    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
  })
);

const transports = [new winston.transports.Console({
  level: config.logLevel,
  format: alignedWithColorsAndTime
})];

const logger = winston.createLogger({
  level: config.logLevel,
  transports
});

// Monkey patching Winston because it incorrectly logs `Error` instances
// Related issue: https://github.com/winstonjs/winston/issues/1498
logger.exception = function (error, prefix) {
  const message = error.message || error.toString();
  const stack = error.stack;
  prefix = prefix || 'Error';

  return this.error(`${prefix} ${message}, stack ${stack}`);
};

module.exports = logger;
