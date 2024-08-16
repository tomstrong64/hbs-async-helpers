import { isPromise, isEmpty } from '../utils.js';

export default (handlebars) => {
  handlebars.registerHelper('if', async (...args) => {
    if (args.length !== 2) {
      throw new Error('#if requires exactly one argument');
    }

    const [conditional, options] = args;
    let newConditional = conditional;

    if (typeof conditional === 'function') {
      newConditional = conditional.call(this);
    } else if (isPromise(conditional)) {
      newConditional = await conditional;
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (
      (!options.hash.includeZero && !newConditional) ||
      isEmpty(newConditional)
    ) {
      return options.inverse(this);
    }
    return options.fn(this);
  });

  handlebars.registerHelper('unless', (...args) => {
    if (args.length !== 2) {
      throw new Error('#unless requires exactly one argument');
    }

    const [conditional, options] = args;

    return handlebars.helpers.if.call(this, conditional, {
      fn: options.inverse,
      inverse: options.fn,
      hash: options.hash,
    });
  });
};
