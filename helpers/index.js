import each from './each.js';
import ifHelper from './if.js';
import withHelper from './with.js';

const registerCoreHelpers = (handlebars) => {
  each(handlebars);
  ifHelper(handlebars);
  withHelper(handlebars);
};

export default registerCoreHelpers;
