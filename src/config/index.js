const nconf = require('nconf');

const SEPARATOR = '__';
const env = process.env.NODE_ENV || 'development';

// Build our match whitelist from the top level of config.defaults.json
const json = require('./data/config.defaults.json');
const matchString = Object.keys(json).join('|');
const MATCH_REGEXP = new RegExp(`^(${matchString})${SEPARATOR}.+`);

/**
 * Setup configuration with nconf in the following order:
 *   1. Environment variables (process.env) with '__' as the separator
 *   2. Command line arguments (process.argv)
 *   3. Local custom config (if provided, never checked in)
 *   4. Environment specific config 'config.<env>.json'
 *   5. User-specified default values
 */
nconf
  .env({
    separator: SEPARATOR,
    match: MATCH_REGEXP,
    whitelist: [
      'NODE_ENV',
    ],
  })
  .argv()
  .file('local', './config/data/config.local.json')
  .file(env, `./config/data/config.${env}.json`)
  .file('defaults', './config/data/config.defaults.json');

module.exports = nconf;
