# Unit Tests for Guia Turístico

## Overview

This directory contains unit tests for the **pure functions** (Business Logic Layer) in the Guia Turístico application. The tests focus on referentially transparent functions that are deterministic and have no side effects.

## Test Structure

```text
tests/unit/
├── README.md           # This file
└── index.test.js       # Tests for src/index.js pure functions
```

## What's Tested

### Pure Functions from `src/index.js`

All tests focus on the **Business Logic Layer** - functions that are:

- ✅ **Referentially transparent** (same input → same output)
- ✅ **No side effects** (no DOM manipulation, I/O, or state mutation)
- ✅ **Easy to test** (no mocking required)

#### Functions Under Test:

1. **`extractCoordinatesText(currentPosition)`**
   - Extracts formatted coordinates from position object
   - 7 test cases covering valid inputs, edge cases, and referential transparency

2. **`extractReferencePlaceText(address)`**
   - Extracts display text from various address formats
   - 8 test cases covering different address structures

3. **`extractBairroText(address)`**
   - Extracts neighborhood (bairro) from address with fallback chain
   - 12 test cases covering priority order and edge cases

4. **`formatMunicipioText(enderecoPadronizado)`**
   - Formats municipality text with optional state abbreviation
   - 8 test cases covering different combinations

5. **`createSidraParams(enderecoPadronizado)`**
   - Creates SIDRA API parameter object
   - 6 test cases covering immutability and referential transparency

6. **`calculateCacheSize(cacheData)`**
   - Calculates cache size from size or length property
   - 9 test cases covering different cache formats

7. **`findAddressCache(manager)`**
   - Finds address cache in manager object structure
   - 10 test cases covering different manager configurations

## Test Categories

### 1. **Unit Tests** (7 `describe` blocks)

- Test each pure function in isolation
- Cover happy paths, edge cases, and error conditions
- Verify referential transparency

### 2. **Property-Based Tests** (4 tests)

- Verify mathematical properties hold for all inputs
- Test determinism (multiple calls = same result)
- Test output type consistency

### 3. **Integration Tests** (3 tests)

- Test pure functions working together
- Verify data transformation pipelines
- Test graceful handling of missing data

## Running Tests

### Install Jest (if not already installed)

```bash
npm install --save-dev jest
```

### Run All Tests

```bash
npm test
```

### Run Only Unit Tests

```bash
npm run test:unit
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Specific Test File

```bash
npx jest tests/unit/index.test.js
```

## Test Statistics

- **Total Test Suites**: 3 (Unit, Property-Based, Integration)
- **Total Test Cases**: 80+ individual assertions
- **Functions Tested**: 7 pure functions
- **Coverage Target**: 70% (branches, functions, lines, statements)

## Test Output Example

```
PASS  tests/unit/index.test.js
  Pure Functions - Business Logic Layer
    extractCoordinatesText()
      ✓ should return formatted coordinates text (2 ms)
      ✓ should return empty string when currentPosition is null (1 ms)
      ✓ should return empty string when currentPosition is undefined
      ...
    extractReferencePlaceText()
      ✓ should return display_name if present (1 ms)
      ...
  Property-Based Tests for Pure Functions
    ✓ extractCoordinatesText: calling multiple times returns same result
    ...
  Integration Tests - Pure Functions Working Together
    ✓ location data pipeline: extracting and formatting (2 ms)
    ...

Test Suites: 1 passed, 1 total
Tests:       80 passed, 80 total
Snapshots:   0 total
Time:        1.234 s
```

## Writing New Tests

When adding new pure functions to `src/index.js`, follow this pattern:

```javascript
describe('myNewPureFunction()', () => {
  
  test('should handle valid input', () => {
    const input = { /* test data */ };
    const result = myNewPureFunction(input);
    expect(result).toBe(/* expected value */);
  });
  
  test('should handle null input', () => {
    expect(myNewPureFunction(null)).toBe(/* expected fallback */);
  });
  
  test('is referentially transparent', () => {
    const input = { /* test data */ };
    const result1 = myNewPureFunction(input);
    const result2 = myNewPureFunction(input);
    expect(result1).toBe(result2);
  });
});
```

## Best Practices

1. **Test Pure Functions Only**: Don't test impure functions (DOM manipulation, I/O) in unit tests
2. **No Mocking Required**: Pure functions should be testable without mocks
3. **Test Referential Transparency**: Always verify same input produces same output
4. **Test Edge Cases**: null, undefined, empty objects, extreme values
5. **Test Immutability**: Verify functions don't mutate input parameters
6. **Use Descriptive Names**: Test names should clearly describe what's being tested

## Continuous Integration

These tests run automatically on:
- Every commit to main branch
- Every pull request
- Before deployment

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools

## Related Documentation

- [REFERENTIAL_TRANSPARENCY.md](../../.github/REFERENTIAL_TRANSPARENCY.md) - Principles behind pure functions
- [HIGH_COHESION_GUIDE.md](../../.github/HIGH_COHESION_GUIDE.md) - Code organization principles
- [LOW_COUPLING_GUIDE.md](../../.github/LOW_COUPLING_GUIDE.md) - Dependency management

## Troubleshooting

### Tests Won't Run

```bash
# Install dependencies
npm install

# Check Node.js version (requires 14+)
node --version

# Clear Jest cache
npx jest --clearCache
```

### Import Errors

Since `src/index.js` uses ES6 module imports, the test file duplicates the pure functions for testing. In production, you should:
1. Export pure functions from `src/index.js`
2. Import them in the test file
3. Use Babel or similar transpiler if needed

### Coverage Too Low

Focus on testing pure functions. Impure functions (DOM manipulation) should be tested with integration/E2E tests.

## Contributing

When adding new tests:
1. Follow existing test structure
2. Test all edge cases
3. Verify referential transparency
4. Update this README with new function descriptions
5. Ensure tests pass before committing

## Questions?

For questions about testing, open an issue using the [GitHub Configuration template](../../.github/ISSUE_TEMPLATE/github_config.md).
