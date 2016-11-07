const _ = require('lodash');
const winston = require('winston');
require('winston-loggly');
require('winston-sentry');
const formatters = require('./formatters');

function factory(config) {
  const logger = new winston.Logger({ exitOnError: true });

  const transports = {
    console: () => {
      logger.add(winston.transports.Console, {
        level: config.console.level || config.defaults.level,
        handleExceptions: true,
        colorize: true,
        formatter: formatters.console,
      });
    },
    file: () => {
      logger.add(winston.transports.File, {
        filename: config.file.filename || `${config.application}.log`,
        level: config.file.level || config.defaults.level,
        json: true,
        colorize: true,
        handleExceptions: true,
      });
    },
    loggly: () => {
      logger.add(winston.transports.Loggly, {
        level: config.loggly.level || config.defaults.level,
        token: config.loggly.token,
        subdomain: config.loggly.subdomain,
        json: true,
        tags: config.tags,
        handleExceptions: true,
      });
    },
    sentry: () => {
      logger.add(winston.transports.Sentry, {
        level: config.sentry.level || config.defaults.level,
        dsn: config.sentry.dsn,
        globalTags: config.tags,
      });
    },
    none: () => {
      logger.add(winston.transports.File, {
        filename: '/dev/null',
      });
    },
  };

  // Generate warning for unknown transports
  const unknownTransports = _.filter(config.transports, (name) => !transports[name]);
  if (unknownTransports.length) {
    /* eslint-disable no-console */
    console.error('The following transports are unknown:', unknownTransports);
    /* eslint-enable no-console */
  }

  _.filter(config.transports, (name) => !!transports[name]).forEach(name => transports[name]());

  return logger;
}

module.exports = factory;
