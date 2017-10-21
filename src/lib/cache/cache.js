/**
 * Cache
 *
 * Requires min redis 2.6.0 (for psetex, pexpireat, pttl)
 */

const _ = require('lodash');
const ms = require('ms');
const redis = require('./redis');
const constants = require('./constants');

class Cache {
  constructor(config) {
    this.baseNamespace = config.redis.namespace;
    this.constants = constants;
    this.redis = redis.open(config.redis);
  }

  /**
   * namespace
   * All keys should be namespaced within the redis database
   */
  namespace(key) {
    return `${this.baseNamespace}${key}`;
  }

  /**
   * set
   * Method for setting keys with optional ttl for setting expiry. Value is automatically
   * stringified using JSON.stringify before storing
   *
   * @param key string
   * @param value Value will be run through JSON.stringify.
   * @param ttl which can be a string (in "ms" library format), integer (in milliseconds)
   */
  set(key, value, ttl) {
    return new Promise((resolve, reject) => {
      // Prepare the key, value and ttl
      const namespacedKey = this.namespace(key);
      const transformedValue = !_.isNil(value) ? JSON.stringify(value) : null;

      // If no ttl, set indefinitely as normal
      if (_.isNil(ttl)) {
        if (_.isNull(transformedValue)) {
          return resolve();
        }

        return this.redis.set(namespacedKey, transformedValue, () => resolve());
      }

      // If the ttl is a string or number
      if (_.isString(ttl) || _.isFinite(ttl)) {
        const milliseconds = _.isString(ttl) ? ms(ttl) : ttl;
        if (_.isNull(transformedValue)) {
          return this.redis.pexpire(namespacedKey, milliseconds, () => resolve());
        }
        return this.redis.psetex(namespacedKey, milliseconds, transformedValue, () => resolve());
      }

      return reject(new Error('Unsupported ttl value.'));
    });
  }

  /**
   * get
   * Retrieves and parses values (using JSON.parse) before returning them
   * NOTE: If you don't provide a callback it will ignore your "get" request
   * @param key Can be a single key or an array of keys
   */
  get(key) {
    return new Promise((resolve, reject) => {
      const keys = _.map(_.flatten([key]), item => this.namespace(item));
      this.redis.mget(keys, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        const results = _.map(res, JSON.parse);

        // Track whether an array was passed in, or just string
        // (determines how output should be structured). If it was an array
        // of keys passed in, then an array of results is expected
        resolve(_.isArray(key) ? results : results[0]);
      });
    });
  }

  /**
   * del
   * Deletes a key from redis database
   */
  del(key) {
    return new Promise((resolve, reject) => {
      const keys = _.map(_.flatten([key]), item => this.namespace(item));
      this.redis.del(keys, (err, count) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(count >= 1 ? constants.DELETED : constants.NOT_FOUND);
      });
    });
  }

  /**
   * ttl
   * Returns the milliseconds of expiry time left on a key
   * NOTE: If key doesn't exist then -2 is returned, if the key has no expiry then -1 is returned
   */
  ttl(key) {
    return new Promise((resolve, reject) => {
      this.redis.pttl(this.namespace(key), (err, ttl) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(ttl);
      });
    });
  }

  /**
   * touch
   * Updates the ttl of a cache key if ttl is defined
   */
  touch(key, ttl) {
    // Updates ttl by sending a null value for a key to the `set` command
    return this.set(key, null, ttl);
  }
}

module.exports = Cache;
