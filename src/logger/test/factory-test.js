const _ = require('lodash');
const assert = require('assert');
const factory = require('../factory');

describe('logger:lib:factory', () => {
  const level = 'info';

  describe('logger:lib:factory:transports', () => {
    it('should support: console', () => {
      const logger = factory({
        transports: ['console'],
        console: { level },
      });
      assert(logger.exitOnError);
      assert.deepEqual(_.keys(logger.transports), ['console']);
    });

    it('should support: file', () => {
      const logger = factory({
        transports: ['file'],
        file: { level, filename: '/dev/null' },
      });
      assert.deepEqual(_.keys(logger.transports), ['file']);
    });

    it('should support: loggly', () => {
      const logger = factory({
        transports: ['loggly'],
        loggly: { level, token: 'a token', subdomain: 'ahm' },
        tags: ['foo', 'bar'],
      });
      assert.deepEqual(_.keys(logger.transports), ['loggly']);
    });

    it('should support: sentry', () => {
      const logger = factory({
        transports: ['sentry'],
        sentry: { level, dsn: 'https://abc:def@app.getsentry.com/123' },
        tags: ['foo', 'bar'],
      });
      assert.deepEqual(_.keys(logger.transports), ['sentry']);
    });

    it('should support: none', () => {
      const logger = factory({ transports: ['none'] });
      assert.deepEqual(_.keys(logger.transports), ['file']);
    });

    it('should support: multi transport', () => {
      const logger = factory({
        transports: ['console', 'file'],
        console: { level },
        file: { level, filename: '/dev/null' },
      });
      assert.deepEqual(_.keys(logger.transports), ['console', 'file']);
    });

    it('should not support: unknown', () => {
      const logger = factory({
        transports: ['foo'],
      });
      assert.deepEqual(_.keys(logger.transports), []);
    });
  });

  describe('logger:lib:factory:file', () => {
    it('should use default filename and level if not specified', () => {
      const logger = factory({
        transports: ['file'],
        file: {},
        defaults: { level },
      });
      assert.deepEqual(_.keys(logger.transports), ['file']);
    });
  });

  describe('logger:lib:factory:loggly', () => {
    it('should use default filename if not specified', () => {
      const logger = factory({
        transports: ['loggly'],
        loggly: { token: 'a token', subdomain: 'ahm' },
        tags: ['foo', 'bar'],
        defaults: { level },
      });
      assert.deepEqual(_.keys(logger.transports), ['loggly']);
    });
  });

  describe('logger:lib:factory:sentry', () => {
    it('should use default filename if not specified', () => {
      const logger = factory({
        transports: ['sentry'],
        sentry: { dsn: 'https://abc:def@app.getsentry.com/123' },
        tags: ['foo', 'bar'],
        defaults: { level },
      });
      assert.deepEqual(_.keys(logger.transports), ['sentry']);
    });
  });
});
