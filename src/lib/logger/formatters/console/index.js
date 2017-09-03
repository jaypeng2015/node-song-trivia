const _ = require('lodash');
const winston = require('winston');
const moment = require('moment');
const trace = require('./trace');
const stack = require('./stack');

module.exports = (opts) => {
  const ts = moment(opts.date).format('HH:mm:ss.SSS');
  const name = opts.meta.name ? `${opts.meta.name}: ` : '';
  let output = `${ts} ${opts.level.toUpperCase()} - ${name}${opts.message}`;

  // If trace is defined, format it to more compact representation
  const { meta } = opts;
  if (Array.isArray(meta.trace)) {
    meta.trace = trace(meta.trace);
  }

  // Log the associated data but remove stack if defined because we will log separately
  if (!_.isEmpty(meta)) {
    output += '\n';
    output += JSON.stringify(_.omit(meta, 'stack'), null, 2);
  }

  // If stack is defined, log in separately in a formatted style
  if (_.isString(meta.stack)) {
    output += '\n';
    output += stack(meta.stack);
  }

  return opts.colorize ? winston.config.colorize(opts.level, output) : output;
};
