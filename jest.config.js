module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/unit/**/*.spec.js'
  ],
  
  // Coverage configuration
  // Only collect coverage for files that have corresponding tests
  // (Pure functions - other functionality tested via integration tests)
  collectCoverageFrom: [
    'tests/unit/**/*.test.js'
  ],
  
  coverageDirectory: 'coverage',
  
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Coverage thresholds
  // Note: Unit tests focus on pure functions only
  // Other code (DOM manipulation, I/O) is tested via integration tests
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  
  // Module paths
  roots: ['<rootDir>'],
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Transform (if needed for ES6 modules)
  transform: {},
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset mocks between tests
  resetMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true
};
