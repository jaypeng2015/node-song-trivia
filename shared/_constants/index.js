import _ from 'lodash';

// Import constants files and attach them to a files object
import * as colors from './colors';
import * as url from './url';

const files = {
  colors,
  url,
};

// Loop through the imported constant files and check for duplicates,
// as well as extending the constants object to include them.
let constants = {};
_.each(_.keys(files), (filename) => {
  const file = files[filename];
  const duplicates = _.intersection(_.keys(constants), _.keys(file));
  _.each(duplicates, (duplicate) => {
    console.warn('Duplicate constant key found, it will overwrite existing. Please fix this immediately.', {
      filename,
      duplicate
    }); // eslint-disable-line no-console
  });
  constants = _.extend(constants, file);
});

export default constants;
