/**
 * Redis Connection Manager
 */

const _ = require('lodash');
const redis = require('redis');
const url = require('url');
const ms = require('ms');
const uuid = require('uuid');
const logger = require('../logger');

const connections = {};

/**
 * open
 * Open a redis connection using the supplied options, if reuse is true then reuse existing connection
 * otherwise create a new connection just for the requester.
 *
 * - opts: object Redis connection options, currently only `uri` for redis connection
 * - reuse: boolean If true then reuse existing connection if available, else create new (important for pubsub or blocking commands)
 */
function open(opts, reuse) {
  const shouldReuse = reuse !== false;

  // Ensure we have all required values
  if (typeof opts === 'undefined' || typeof opts.uri === 'undefined') {
    throw new Error('Open connection with incorrect options');
  }

  // Check if connection already exists, thus returning it
  const uri = opts.uri;
  if (shouldReuse && connections[uri] && connections[uri].client) {
    connections[uri].listeners++;
    return connections[uri].client;
  }

  // Parse the uri to get database if specified
  // uri should look like redis://127.0.0.1:6379/1 where "1" is the database to use
  const parsed = url.parse(uri);
  const database = (parsed.pathname || '/').slice(1);

  // @TODO: Verify these options are good https://github.com/NodeRedis/node_redis#options-is-an-object-with-the-following-possible-properties
  const options = {
    url: uri,
    retry_strategy: () => ms('1m'),
    connect_timeout: ms('7d'),
  };
  const client = redis.createClient(options);
  // @TODO: Add authentication support

  if (database) {
    logger.debug('Redis selecting database: %d', database);
    // We need to issue `select` command before anything else tries to
    // set/get data from redis. Otherwise it goes to default database 0.
    // It's not a big deal in terms of race condition for connecting and
    // selecting db at the same time - `select` command got queued,
    // so that it will be the first command to execute.
    client.select(database);
  }

  // Catch errors and connect events and log them
  client.on('error', (err) => {
    logger.error('Redis error', { uri, err, stack: err.stack });
  });

  client.on('connect', () => {
    logger.debug('Redis connection open to uri: %s', uri);
  });

  client.on('ready', () => {
    logger.debug('Redis connection ready');
  });

  // We set the max_attempts to 1 once it has connected so that it doesn't continuously queue requests to redis
  // See https://github.com/NodeRedis/node_redis/pull/956 for more information
  client.once('connect', () => {
    this.max_attempts = 1;
  });

  // Attach a uuid to the client for identification
  client.uuid = client.uuid || uuid.v4();

  // Assign new client to connections for later use (only if shouldReuse is true)
  if (shouldReuse) {
    connections[uri] = {
      listeners: 1,
      client,
    };
  }

  // Return the resulting redis client connection
  return client;
}

/**
 * close
 * Method to close the connection, keeps tracks of listeners and only
 * closes when the last listener asks the connection to be closed.
 *
 * To close connections it decrements the number of listeners and if it
 * is equal or less than 0 then we can quit and delete the connection.
 *
 * @param {object} opts The same options passed to 'open' method
 */
function close(opts) {
  // Extract the connection uri from options
  const uri = opts.uri;

  // Ensure the connection exists, otherwise return
  const connection = connections[uri];
  if (!connection) {
    return;
  }

  // Subtract from listener count
  connection.listeners--;

  // If listeners is 0 or less then close the connection and remove
  if (connection.listeners <= 0) {
    connection.client.quit();
    delete connections[uri];
  }
}

/**
 * stats
 * Method to report the status of connections being managed. Includes
 * the number of listeners, connection state etc.
 */
function stats() {
  const results = _.mapValues(connections, (connection) => {
    return {
      listeners: connection.listeners,
      connected: _.get(connection, 'client.connected'),
      ready: _.get(connection, 'client.ready'),
      database: _.get(connection, 'client.selected_db'),
    };
  });
  return results;
}

module.exports = {
  open,
  close,
  stats,
};
