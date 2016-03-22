import MetaService from 'services/meta';

import { UPDATE_LOCATION } from 'react-router-redux';

export default function metaMiddleware() {
  return (next) => (action) => {
    // Update the page title when necessary
    if (action.type === UPDATE_LOCATION) {
      if (typeof document !== 'undefined') {
        document.title = MetaService.getPageTitle(action.payload.pathname);
      }
    }

    return next(action);
  };
}
