import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import configureStore from 'store/configure';
import createRoutes from 'routes';

import Root from 'containers/root';

const initialState = window.__data;
const store = configureStore(initialState);
const routes = createRoutes(store);
const rootElement = document.getElementById('content');

render(
  <Root routes={routes} store={store} />,
  rootElement
);
