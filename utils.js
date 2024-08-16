import { readFileSync } from 'fs';

export function blockParams(params, ids) {
  const newParams = params;
  newParams.path = ids;
  return newParams;
}

export function extend(...args) {
  let obj = args[0];
  for (let i = 1; i < args.length; i += 1) {
    obj = { ...obj, ...args[i] };
  }

  return obj;
}

export function appendContextPath(contextPath, id) {
  return (contextPath ? `${contextPath}.` : '') + id;
}

export function createFrame(object) {
  const frame = extend({}, object);
  frame.parent = object;
  return frame;
}

export function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  return false;
}

export function isPromise(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.then === 'function'
  );
}

export const getPackageVersion = () => {
  const packageJson = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url)),
  );
  return packageJson.version;
};
