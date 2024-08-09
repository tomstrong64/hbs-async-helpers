import each from './each.js';
import ifHelper from './if.js';
import withHelper from './with.js';

export const registerCoreHelpers = (handlebars) => {
  each(handlebars);
  ifHelper(handlebars);
  withHelper(handlebars);
};
