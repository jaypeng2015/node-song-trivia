const config = require('../../config').get('cache');
const Cache = require('./cache');

const cache = new Cache(config);
module.exports = cache;
