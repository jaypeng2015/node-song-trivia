const _ = require('lodash');
const assert = require('assert');
const logger = require('../');

describe('logger:lib:index', () => {
  it('should instantiate logger check for at least one method', () => {
    assert(_.includes(_.keys(logger), 'debug'));
  });
});
