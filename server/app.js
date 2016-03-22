import Express from 'express';
import generateHtml from './html';
import path from 'path';

const app = new Express();
const config = {
  // Add any process.env variables that you want available on the front-end here
  // They will be available to you at window.__config
  EXTERNAL_BASE_URL: process.env.EXTERNAL_BASE_URL,
  GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  NODE_ENV: process.env.NODE_ENV,
};

// app.use(require('serve-favicon')(path.join(__dirname, '../public/img/favicons/favicon.ico')));
app.use(Express.static(path.join(__dirname, '../public')));

// Mount the api
import api from './api';
app.use('/api', api);

if (process.env.NODE_ENV === 'development') {
  const webpack = require('webpack');
  const webpackConfig = require('../config/webpack/client-dev.config');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');

  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
  }));
  app.use(webpackHotMiddleware(compiler));
}

app.get('*', (req, res) => {
  res.status(200).send(generateHtml(config));
});

export default app;
