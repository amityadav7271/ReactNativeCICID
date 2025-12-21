module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
        '@components': './src/components',
        '@screens': './src/screens',
        '@features': './src/features',
        '@services': './src/services',
        '@store': './src/store',
        '@utils': './src/utils',
        '@hooks': './src/hooks',
        '@assets': './src/assets',
        '@theme': './src/theme',
      },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
