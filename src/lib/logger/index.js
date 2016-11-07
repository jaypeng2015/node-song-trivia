const _ = require('lodash');
const config = require('../../config').get();
const factory = require('./factory');

// Initiate a logger with config that has extras values on it
const conf = _.extend(config.log, {
  environment: config.NODE_ENV,
  tags: [`application-${config.application}`, `environment-${config.environment}`],
});
const logger = factory(conf);

module.exports = logger;
