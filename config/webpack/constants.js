var path = require('path'); // eslint-disable-line no-var
var rootDir = path.join(__dirname, '../..'); // eslint-disable-line no-var

module.exports = {
  ROOT_DIR: rootDir,

  PUBLIC_DIST_DIR: path.join(rootDir, 'public', 'dist'),
  SERVER_DIST_DIR: path.join(rootDir, 'server', 'dist'),

  CLIENT_DIR: path.join(rootDir, 'client'),
  SHARED_DIR: path.join(rootDir, 'shared'),
  SERVER_DIR: path.join(rootDir, 'server'),
  NODE_MODULES_DIR: path.join(rootDir, 'node_modules'),
};
