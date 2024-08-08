module.exports = {
  extends: [
    'eslint-config-airbnb-base',
    'eslint-config-airbnb-base/rules/strict',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  globals: {
    beforeEach: true,
    afterEach: true,
    describe: true,
    expect: true,
    it: true,
    xdescribe: true,
    xit: true,
  },
};
