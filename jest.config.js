module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/__fixtures__/setup.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!@react-navigation|@react-native|react-native)',
  ],
};
