const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Polyfill for toReversed if not available
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}

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

// Workaround for toReversed compatibility issue
const defaultConfig = getDefaultConfig(__dirname);

module.exports = mergeConfig(defaultConfig, config);
