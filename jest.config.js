module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 10000,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  testMatch: ['**/test/**/*.test.js'],
};
