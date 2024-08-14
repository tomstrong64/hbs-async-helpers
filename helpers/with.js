import {
  isPromise,
  isEmpty,
  createFrame,
  appendContextPath,
  blockParams,
} from '../utils.js';

export default (handlebars) => {
  handlebars.registerHelper('with', async (...args) => {
    if (args.length !== 2) {
      throw new Error('#with requires exactly one argument');
    }

    const [context, options] = args;
    let newContext = context;

    if (typeof context === 'function') {
      newContext = context.call(this);
    } else if (isPromise(context)) {
      newContext = await context;
    }

    const { fn } = options;

    if (!isEmpty(newContext)) {
      let { data } = options;
      if (options.data && options.ids) {
        data = createFrame(options.data);
        data.contextPath = appendContextPath(
          options.data.contextPath,
          options.ids[0],
        );
      }

      return fn(newContext, {
        data,
        blockParams: blockParams([newContext], [data && data.contextPath]),
      });
    }
    return options.inverse(this);
  });
};
