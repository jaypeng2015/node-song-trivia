const config = require('../../config').cache;
const Cache = require('./cache');

const cache = new Cache(config);
module.exports = cache;
