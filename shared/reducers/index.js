import { combineReducers } from 'redux';

import { reducer as form } from 'redux-form';
import { routerReducer as routing } from 'react-router-redux';

const rootReducer = combineReducers({
  form,
  routing,
});

export default rootReducer;
