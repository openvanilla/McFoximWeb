module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['json', 'html', 'clover', 'json-summary'],
};
