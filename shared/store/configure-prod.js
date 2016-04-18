import { createStore, applyMiddleware } from 'redux';
import { browserHistory } from 'react-router';
import { syncHistory } from 'react-router-redux';

import apiMiddleware from 'middleware/api';
import thunkMiddleware from 'redux-thunk';
const reduxRouterMiddleware = syncHistory(browserHistory);

import rootReducer from '../reducers';

export default function configureStore(initialState) {
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(
      reduxRouterMiddleware,
      apiMiddleware,
      thunkMiddleware
    )
  );

  return store;
}
