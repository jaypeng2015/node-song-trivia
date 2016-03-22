import React from 'react';

import { IndexRoute, Route } from 'react-router';
import App from 'containers/app';
import HomePage from 'containers/home-page';
import constants from '_constants';

export default function configureRoutes(store) {
  return (
    <Route path={constants.URL.HOME} component={App}>
      <IndexRoute component={HomePage} />
    </Route>
    );
}
