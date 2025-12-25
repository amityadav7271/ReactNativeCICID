// Load polyfill first
require('./polyfill');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Add any resolver configuration here
  },
  transformer: {
    // Add any transformer configuration here
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
