if (__DEVELOPMENT__) {
  module.exports = require('./configure-dev');
} else {
  module.exports = require('./configure-prod');
}
