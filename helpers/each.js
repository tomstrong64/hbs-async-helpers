import { Readable } from 'stream';
import {
  appendContextPath,
  createFrame,
  blockParams,
  isPromise,
} from '../utils.js';

export default (handlebars) => {
  handlebars.registerHelper('each', async (context, options) => {
    if (!options) {
      throw new Error('Must pass iterator to #each');
    }

    const { fn } = options;
    const { inverse } = options;
    let i = 0;
    let ret = [];
    let data;
    let contextPath;

    if (options.data && options.ids) {
      contextPath = `${appendContextPath(
        options.data.contextPath,
        options.ids[0],
      )}.`;
    }

    let currentContext = context;

    if (typeof currentContext === 'function') {
      currentContext = currentContext.call(this);
    }

    if (options.data) {
      data = createFrame(options.data);
    }

    const execIteration = async (field, index, last) => {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret.push(
        await fn(currentContext[field], {
          data,
          blockParams: blockParams(
            [currentContext[field], field],
            [contextPath + field, null],
          ),
        }),
      );
    };

    /* eslint-disable no-await-in-loop */ // have to happen in order
    if (currentContext && typeof currentContext === 'object') {
      if (isPromise(currentContext)) {
        currentContext = await currentContext;
      }
      if (Array.isArray(currentContext)) {
        for (let j = currentContext.length; i < j; i += 1) {
          if (i in currentContext) {
            await execIteration(i, i, i === currentContext.length - 1);
          }
        }
      } else if (global.Symbol && currentContext[global.Symbol.iterator]) {
        const newContext = [];
        const iterator = currentContext[global.Symbol.iterator]();
        for (let it = iterator.next(); !it.done; it = iterator.next()) {
          newContext.push(it.value);
        }
        currentContext = newContext;
        for (let j = currentContext.length; i < j; i += 1) {
          await execIteration(i, i, i === currentContext.length - 1);
        }
      } else if (currentContext instanceof Readable) {
        const newContext = [];
        await new Promise((resolve, reject) => {
          currentContext
            .on('data', (item) => {
              newContext.push(item);
            })
            .on('end', async () => {
              currentContext = newContext;
              for (let j = currentContext.length; i < j; i += 1) {
                await execIteration(i, i, i === currentContext.length - 1);
              }
              resolve();
            })
            .once('error', (e) => reject(e));
        });
      } else {
        const entries = Object.entries(currentContext);
        for (let j = 0; j < entries.length; j += 1) {
          const [key] = entries[j];
          await execIteration(key, j, j === entries.length - 1);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
      ret = [inverse(this)];
    }

    return ret.join('');
  });
};
