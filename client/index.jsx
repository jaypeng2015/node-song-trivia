import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import configureStore from 'store/configure';
import createRoutes from 'routes';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import Root from 'containers/root';

const initialState = window.__data;
const store = configureStore(initialState);
const routes = createRoutes(store);
const rootElement = document.getElementById('content');

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

render(
  <Root routes={routes} store={store} history={history} />,
  rootElement
);
