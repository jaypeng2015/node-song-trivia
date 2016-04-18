/**
 * Webpack configuration file
 * @see  https://webpack.github.io/docs/configuration.html
 */
var webpack = require('webpack');
var path = require('path');

var constants = require('./constants');

module.exports = {
  /**
   * target
    - "web" Compile for usage in a browser-like environment (default)
    - "webworker" Compile as WebWorker
    - "node" Compile for usage in a node.js-like environment (use require to load chunks)
    - "async-node" Compile for usage in a node.js-like environment (use fs and vm to load chunks async)
    - "node-webkit" Compile for usage in webkit, uses jsonp chunk loading but also supports builtin node.js modules plus require(“nw.gui”) (experimental)
    - "electron" Compile for usage in Electron – supports require-ing Electron-specific modules.
   */
  target: 'web',

  devtool: 'eval-cheap-source-map',

  /**
   * The entry point for the bundle.
   * If you pass an array: All modules are loaded upon startup. The last one is exported.
   */
  entry: [
    'webpack-hot-middleware/client',
    constants.CLIENT_DIR,
  ],

  output: {
    path: constants.PUBLIC_DIST_DIR,
    filename: 'bundle.js',
    publicPath: '/dist/',
  },

  resolve: {
    extensions: ['', '.js', '.jsx', '.styl'],
    modulesDirectories: ['shared', 'node_modules'],
    root: constants.ROOT_DIR,
  },

  plugins: [
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __DEVELOPMENT__: true,
      'process.env.NODE_ENV': '"development"',
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],

  module: {
    preLoaders: [
      {
        test: /\.styl$/,
        loader: 'stylint',
      },
    ],
    loaders: [
      {
        test: /\.jsx*$/,
        loader: 'babel',
        exclude: /node_modules/,
        include: [
          constants.CLIENT_DIR,
          constants.SHARED_DIR,
        ],
        query: {
          presets: ['react', 'es2015', 'stage-1', 'react-hmre'],
        },
      },
      {
        test: /\.styl$/,
        loader: 'style!css?module&localIdentName=[path][name]---[local]---[hash:base64:5]!stylus',
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader',
      },
    ],
  },

  stylus: {
    use: [
      require('nib')(),
      require('rupture')(),
    ],
    import: [
      '~nib/lib/nib/index.styl',
      '~rupture/rupture/index.styl',
      path.join(constants.SHARED_DIR, '/style/variables'),
    ],
  },
};
