/**
 * Cache
 *
 * Requires min redis 2.6.0 (for psetex, pexpireat, pttl)
 */

const _ = require('lodash');
const async = require('async');
const cbw = require('cbw');
const ms = require('ms');
const redis = require('./redis');
const constants = require('./constants');

class Cache {
  constructor(config) {
    this.baseNamespace = config.redis.namespace;
    this.enabled = config.enabled;
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
   * @param value Value will be run through JSON.stringify. If null/undefined then will update ttl of existing key rather than `set`ing
   * @param opts Supports 'ttl' which can be a string (in "ms" library format), integer (in milliseconds) or date object
   */
  set(key, value, opts, callback) {
    const done = _.isFunction(opts) ? opts : (callback || _.noop);
    const ttl = _.isFunction(opts) ? undefined : _.get(opts, 'ttl');

    if (!this.enabled) {
      done();
      return;
    }

    // Prepare the key, value and ttl
    const namespacedKey = this.namespace(key);
    const transformedValue = !_.isNull(value) && !_.isUndefined(value) ? JSON.stringify(value) : null;

    // If no ttl, set indefinitely as normal
    if (_.isNull(ttl) || _.isUndefined(ttl)) {
      if (_.isNull(transformedValue)) {
        done();
        return;
      }

      this.redis.set(namespacedKey, transformedValue, done);
    }

    // If the ttl is a string or number
    if (_.isString(ttl) || _.isFinite(ttl)) {
      const milliseconds = _.isString(ttl) ? ms(ttl) : ttl;
      if (_.isNull(transformedValue)) {
        this.redis.pexpire(namespacedKey, milliseconds, done);
        return;
      }

      this.redis.psetex(namespacedKey, milliseconds, transformedValue, done);
    }

    // If the ttl is a date then use the pexpireat method
    if (_.isDate(ttl)) {
      async.series([
        // If value is null, don't perform the set method, proceed straight to pexpireat
        (cb) => (!_.isNull(transformedValue) ? this.redis.set(namespacedKey, transformedValue, cb) : cb()),
        (cb) => this.redis.pexpireat(namespacedKey, ttl.getTime(), cb),
      ], done);
    }
  }

  /**
   * get
   * Retrieves and parses values (using JSON.parse) before returning them
   * NOTE: If you don't provide a callback it will ignore your "get" request
   * @param key Can be a single key or an array of keys
   */
  get(key, callback) {
    const cb = callback || _.noop;
    // If store disabled or cb not function, don't continue
    if (!this.enabled) {
      cb();
      return;
    }

    const keys = _.flatten([key]).map((item) => this.namespace(item));
    this.redis.mget(keys, cbw(cb)((res) => {
      const results = res.map(JSON.parse);

      // Track whether an array was passed in, or just string
      // (determines how output should be structured). If it was an array
      // of keys passed in, then an array of results is expected
      cb(null, _.isArray(key) ? results : results[0]);
    }));
  }

  /**
   * del
   * Deletes a key from redis database
   */
  del(key, callback) {
    const cb = callback || _.noop;
    if (!this.enabled) {
      cb(null, constants.NOT_FOUND);
      return;
    }

    const keys = _.flatten([key]).map((item) => this.namespace(item));
    this.redis.del(keys, (err, count) => {
      cb(err, count >= 1 ? constants.DELETED : constants.NOT_FOUND);
    });
  }

  /**
   * ttl
   * Retuns the milliseconds of expiry time left on a key
   * NOTE: If key doesn't exist then -2 is returned, if the key has no expiry then -1 is returned
   */
  ttl(key, callback) {
    const cb = callback || _.noop;
    // If store disabled or cb not function, don't continue
    if (!this.enabled) {
      cb(null, constants.KEY_NOT_FOUND);
      return;
    }

    this.redis.pttl(this.namespace(key), cb);
  }

  /**
   * flush
   * Removes all cached redis data by iterating on keys prefixed with cache namespace
   */
  flush(callback) {
    const cb = callback || _.noop;

    // If store disabled, don't continue
    if (!this.enabled) {
      cb();
      return;
    }

    // Find keys beginning with the namespace prefix
    this.redis.keys(this.namespace('*'), cbw(cb)((keys) => {
      if (keys.length === 0) {
        cb();
        return;
      }

      this.redis.del(keys, cb);
    }));
  }

  /**
   * touch
   * Updates the ttl of a cache key if ttl is defined
   */
  touch(key, opts, callback) {
    const cb = callback || _.noop;
    // Updates ttl by sending a null value for a key to the `set` command
    this.set(key, null, opts, cb);
  }

  /**
   * getOrSet
   * Gets value from cache, if not present, then execute function and save the result to cache
   * NOTE: I have not used fat arrow functions because I didn't want any scope issues with
   * the `fn` param being called. Possibly I've been incorrect in my approach?
   *
   * @param key Must be a single key (arrays not supported yet)
   * @param fn The function to run on cache miss
   * @param opts The options to be used for the "set" command on cache miss
   * @param cb Function called with errors or result
   */
  getOrSet(key, fn, opts, callback) {
    const cb = callback || _.noop;
    async.series([
      (done) => {
        // Otherwise get from cache
        this.get(key, (err, res) => {
          if (!err && !_.isNull(res) && !_.isUndefined(res)) {
            // Then return
            cb(null, res);
            return;
          }

          done();
        });
      },
      (done) => { // fallback
        fn(cbw(cb)((res) => {
          cb(null, res);
          this.set(key, res, opts);
          done();
        }));
      },
    ]);
  }

  /**
   * reload
   * Bypasses cache, executes function and save the result to cache
   *
   * @param key Must be a single key (arrays not supported yet)
   * @param fn The function to run to get results from primary source
   * @param opts The options to be used for the "set" command on cache miss
   * @param cb Function called with errors or result
   */
  reload(key, fn, opts, callback) {
    const cb = callback || _.noop;
    fn(cbw(cb)((res) => {
      cb(null, res);
      this.set(key, res, opts);
    }));
  }
}

module.exports = Cache;
