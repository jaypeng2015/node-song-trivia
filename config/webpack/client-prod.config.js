var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');
var webpack = require('webpack');

var constants = require('./constants');

module.exports = {
  target: 'web',

  entry: constants.CLIENT_DIR,

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
      __DEVELOPMENT__: false,
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
    new ExtractTextPlugin('styles.css'),
  ],

  module: {
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
          presets: ['react', 'es2015', 'stage-1'],
        },
      },
      {
        test: /\.styl$/,
        loader: ExtractTextPlugin.extract('style', 'css?module&localIdentName=[path][name]---[local]---[hash:base64:5]!stylus'),
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
