/* global module */
var pkg = require('../package.json');

module.exports = Object.assign({}, pkg.jest, {
  rootDir: '../',
  moduleNameMapper: {
    '/src/index$': '<rootDir>/lib/index',
  },
});
