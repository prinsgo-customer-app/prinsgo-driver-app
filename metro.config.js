const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /node_modules\/react-native\/ReactAndroid\/.*/,
  /node_modules\/react-native\/ReactCommon\/.*/,
  /node_modules\/react-native\/sdks\/.*/,
  /node_modules\/.*\/android\/.*/,
  /node_modules\/.*\/ios\/.*/,
  /node_modules\/.*\.git\/.*/,
];

module.exports = config;
