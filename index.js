import { registerCoreHelpers } from './helpers/index.js';
import { getPackageVersion } from './utils.js';

const isPromise = (obj) =>
  !!obj &&
  (typeof obj === 'object' || typeof obj === 'function') &&
  typeof obj.then === 'function';

function asyncHelpers(hbs) {
  const handlebars = hbs.create();
  const asyncCompiler = class extends hbs.JavaScriptCompiler {
    constructor() {
      super();
      this.compiler = asyncCompiler;
    }

    mergeSource(varDeclarations) {
      const sources = super.mergeSource(varDeclarations);
      sources.prepend('return (async () => {');
      sources.add(' })()');
      return sources;
    }

    appendToBuffer(source, location, explicit) {
      let asyncSource;
      // Force a source as this simplifies the merge logic.
      if (!Array.isArray(source)) {
        asyncSource = [source];
      }
      asyncSource = this.source.wrap(source, location);

      if (this.environment.isSimple) {
        return ['return await ', asyncSource, ';'];
      }
      if (explicit) {
        // This is a case where the buffer operation occurs as a child of another
        // construct, generally braces. We have to explicitly output these buffer
        // operations to ensure that the emitted code goes in the correct location.
        return ['buffer += await ', asyncSource, ';'];
      }
      asyncSource.appendToBuffer = true;
      asyncSource.prepend('await ');
      return asyncSource;
    }
  };
  handlebars.JavaScriptCompiler = asyncCompiler;

  const { compile, escapeExpression } = handlebars;
  const { template: vmTemplate } = handlebars.VM;

  const asyncEscapeExpression = function (value) {
    if (isPromise(value)) {
      return value.then((v) => escapeExpression(v));
    }
    return escapeExpression(value);
  };

  function lookupProperty(containerLookupProperty) {
    return function (parent, propertyName) {
      if (isPromise(parent)) {
        return parent.then((p) => containerLookupProperty(p, propertyName));
      }
      return containerLookupProperty(parent, propertyName);
    };
  }

  handlebars.template = function (spec) {
    const asyncSpec = spec;
    asyncSpec.main_d =
      (prog, props, container, depth, data, blockParams, depths) =>
      async (context) => {
        // const main = await spec.main
        const asyncContainer = container;
        asyncContainer.escapeExpression = asyncEscapeExpression;
        asyncContainer.lookupProperty = lookupProperty(
          container.lookupProperty,
        );

        let asyncDepths = depths;
        if (depths.length == 0) {
          asyncDepths = [data.root];
        }
        const v = asyncSpec.main(
          asyncContainer,
          context,
          container.helpers,
          container.partials,
          data,
          blockParams,
          asyncDepths,
        );
        return v;
      };
    return vmTemplate(asyncSpec, handlebars);
  };

  handlebars.compile = function (template, options) {
    const compiled = compile.apply(handlebars, [template, { ...options }]);

    return function (context, execOptions) {
      const newContext = context || {};

      return compiled.call(handlebars, newContext, execOptions);
    };
  };
  handlebars.ASYNC_VERSION = getPackageVersion();

  registerCoreHelpers(handlebars);

  return handlebars;
}

export default asyncHelpers;
