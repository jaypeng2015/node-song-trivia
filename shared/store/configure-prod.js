import { createStore, applyMiddleware } from 'redux';
import { browserHistory } from 'react-router';
import { syncHistory } from 'react-router-redux';

import apiMiddleware from 'middleware/api';
import metaMiddleware from 'middleware/meta';
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
      metaMiddleware,
      thunkMiddleware
    )
  );

  return store;
}
