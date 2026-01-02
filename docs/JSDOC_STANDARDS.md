# JSDoc 3 Documentation Standards for Guia Turístico

## Overview

This document outlines the JSDoc 3 documentation standards used in the Guia Turístico project. All JavaScript files MUST follow these conventions for consistency and maintainability.

## Current Status ✅

**Documentation Coverage:** 100% (18/18 files)

All JavaScript files in `src/` are properly documented with:
- File-level comments (`@fileoverview`)
- Function-level documentation with `@param`, `@returns`, `@throws`
- Type annotations with TypeScript-style types
- Examples where appropriate

## Documentation Format

### File-Level Documentation

Every JavaScript file MUST start with a JSDoc comment block that includes:

```javascript
/**
 * @fileoverview Brief description of the file's purpose
 * More detailed description if needed. Can include:
 * - Features
 * - Architecture notes
 * - Dependencies
 * 
 * @module module/path (optional, for ES6 modules)
 * @requires dependency1 (list all imports/dependencies)
 * @requires dependency2
 * 
 * @example
 * import router from './router.js';
 * router.register('/', handler);
 */
```

**Example from `src/router.js`:**
```javascript
/**
 * @fileoverview Router Module - Hash-based SPA Router
 * Implements hash routing (#/) for single-page application navigation without
 * requiring server configuration.
 * 
 * Features:
 * - Hash-based routing (no server configuration required)
 * - Route registration with dynamic parameters (e.g., /user/:id)
 * - Browser history integration (back/forward buttons)
 * - 404 handling with custom handler
 * - Navigation guards (beforeEach, afterEach)
 * - Query parameter parsing
 * 
 * @example
 * import router from './router.js';
 * 
 * router
 *   .register('/', homeHandler)
 *   .register('/user/:id', userHandler)
 *   .beforeEach((from, to, next) => {
 *     console.log(`Navigating from ${from} to ${to}`);
 *     next(true);
 *   })
 *   .setDefault('/')
 *   .notFound((path) => console.log(`404: ${path}`));
 */
```

### Function Documentation

Every function MUST include:

#### Basic Function Documentation

```javascript
/**
 * Brief description of what the function does
 * 
 * @param {Type} paramName - Parameter description
 * @param {Type} [optionalParam] - Optional parameter (note the brackets)
 * @param {Type} [paramWithDefault=defaultValue] - Parameter with default value
 * @returns {Type} Return value description
 * @throws {ErrorType} Description of when/why error is thrown
 * 
 * @example
 * const result = functionName(arg1, arg2);
 * console.log(result); // Expected output
 */
function functionName(paramName, optionalParam, paramWithDefault = 'default') {
  // Implementation
}
```

#### Async Function Documentation

```javascript
/**
 * Fetches user data from the API
 * 
 * @async
 * @param {string} userId - User identifier (UUID format)
 * @returns {Promise<User>} User object with profile data
 * @throws {Error} If user not found (404)
 * @throws {NetworkError} If network request fails
 * 
 * @example
 * try {
 *   const user = await getUser('123e4567-e89b-12d3-a456-426614174000');
 *   console.log(user.name);
 * } catch (error) {
 *   console.error('Failed to fetch user:', error);
 * }
 */
async function getUser(userId) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`User not found: ${userId}`);
  }
  return response.json();
}
```

#### Method Documentation (Class Methods)

```javascript
/**
 * Router class - Manages SPA routing with hash-based navigation
 * @class
 */
class Router {
  /**
   * Register a route with its handler
   * 
   * @param {string} path - Route path (e.g., '/', '/tracking', '/converter/:id')
   * @param {Function} handler - Route handler function receiving (params, query)
   * @returns {Router} Router instance for chaining
   * 
   * @example
   * router.register('/user/:id', async (params, query) => {
   *   console.log('User ID:', params.id);
   * });
   */
  register(path, handler) {
    // Implementation
    return this;
  }

  /**
   * Initialize router - set up event listeners
   * @private
   */
  _init() {
    // Private method implementation
  }
}
```

### TypeScript-Style Type Annotations

#### Primitive Types

```javascript
/**
 * @param {string} name - User's name
 * @param {number} age - User's age
 * @param {boolean} active - Whether user is active
 * @param {null} value - Null value
 * @param {undefined} value - Undefined value
 */
```

#### Object Types

```javascript
/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User's full name
 * @property {number} age - User's age
 * @property {string} [email] - Optional email address
 * @property {Address} address - User's address
 */

/**
 * @typedef {Object} Address
 * @property {string} street - Street name
 * @property {string} city - City name
 * @property {string} zipCode - ZIP/Postal code
 */

/**
 * Create a new user
 * @param {User} userData - User data object
 * @returns {Promise<User>} Created user
 */
async function createUser(userData) {
  // Implementation
}
```

#### Array Types

```javascript
/**
 * @param {Array<string>} items - Array of strings
 * @param {string[]} items - Alternative syntax for array of strings
 * @param {Array<User>} users - Array of User objects
 * @param {Array<{id: string, name: string}>} items - Array of inline objects
 */
```

#### Union Types

```javascript
/**
 * @param {string|number} id - ID as string or number
 * @param {HTMLElement|string} content - HTML element or string
 * @returns {boolean|null} Success status or null if not applicable
 */
```

#### Function Types

```javascript
/**
 * @typedef {Function} RouteHandler
 * @param {Object} params - Route parameters
 * @param {Object} query - Query parameters
 * @returns {void|Promise<void>}
 */

/**
 * @param {(error: Error) => void} callback - Error callback function
 * @param {(params: Object, query: Object) => Promise<void>} handler - Route handler
 */
```

#### Complex Types

```javascript
/**
 * @typedef {Object} ViewConfig
 * @property {string} title - Page title
 * @property {Function} render - Function that returns HTML string or DOM element
 * @property {Function} [mount] - Function called after view is mounted (receives container)
 * @property {Function} [cleanup] - Function called before view is unmounted
 * @property {Array<string>} [styles] - CSS files to load for this view
 * @property {string} [transition] - Transition type: 'fade', 'slide', 'scale'
 */

/**
 * Load a view with transition
 * @param {ViewConfig} view - View configuration
 * @returns {Promise<void>}
 */
async function loadView(view) {
  // Implementation
}
```

### Promise and Async/Await Documentation

```javascript
/**
 * Fetch data from API with retry logic
 * 
 * @async
 * @param {string} url - API endpoint URL
 * @param {Object} [options={}] - Fetch options
 * @param {number} [retries=3] - Number of retry attempts
 * @returns {Promise<Response>} Fetch response
 * @throws {NetworkError} If all retry attempts fail
 * @throws {TypeError} If URL is invalid
 * 
 * @example
 * try {
 *   const response = await fetchWithRetry('/api/data', { method: 'GET' });
 *   const data = await response.json();
 * } catch (error) {
 *   console.error('Failed to fetch:', error);
 * }
 */
async function fetchWithRetry(url, options = {}, retries = 3) {
  // Implementation with retry logic
}

/**
 * Promise-based timeout utility
 * 
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>} Promise that resolves after delay
 * 
 * @example
 * await delay(1000); // Wait 1 second
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Error Documentation

```javascript
/**
 * Custom error for network-related failures
 * @extends Error
 * @class
 */
class NetworkError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} [statusCode] - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
  }
}

/**
 * Make HTTP request with error handling
 * 
 * @param {string} url - Request URL
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {NetworkError} If request fails or returns non-2xx status
 * @throws {SyntaxError} If response is not valid JSON
 */
async function makeRequest(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new NetworkError(`HTTP ${response.status}`, response.status);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError('Network request failed', 0);
  }
}
```

### Event Handler Documentation

```javascript
/**
 * Handle click events on navigation links
 * 
 * @param {MouseEvent} event - Click event
 * @returns {void}
 * 
 * @listens MouseEvent
 */
function handleClick(event) {
  event.preventDefault();
  // Implementation
}

/**
 * Service worker fetch event handler
 * 
 * @param {FetchEvent} event - Fetch event from service worker
 * @returns {void}
 * 
 * @listens FetchEvent
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Cache-first strategy
  );
});
```

### View Configuration Objects

```javascript
/**
 * Home view configuration object
 * 
 * @type {Object}
 * @property {string} title - Page title for document.title
 * @property {Array<string>} styles - CSS files to load for this view
 * @property {Function} render - Returns HTML string for view content
 * @property {Function} mount - Called after view is mounted to DOM
 * @property {Function} cleanup - Called before view is unmounted
 */
export default {
  title: 'Home',
  
  styles: ['index.css'],
  
  /**
   * Render home view HTML
   * @returns {string} HTML string for home view
   */
  render() {
    return `<div>Home Content</div>`;
  },
  
  /**
   * Mount home view - set up event listeners
   * @param {HTMLElement} container - View container element
   * @returns {void}
   */
  mount(container) {
    // Setup code
  },
  
  /**
   * Cleanup home view - remove event listeners
   * @returns {void}
   */
  cleanup() {
    // Cleanup code
  }
};
```

## NPM Package References

When referencing npm packages, include version information:

```javascript
/**
 * @fileoverview Module using Jest for testing
 * @requires jest@^29.7.0
 * @requires @testing-library/dom@^9.3.4
 */
```

## Web API References

Reference MDN Web Docs for Web APIs:

```javascript
/**
 * Get user's geolocation using Geolocation API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
 * 
 * @returns {Promise<GeolocationPosition>} User's position
 * @throws {GeolocationPositionError} If geolocation fails or permission denied
 * 
 * @example
 * try {
 *   const position = await getCurrentPosition();
 *   console.log(position.coords.latitude, position.coords.longitude);
 * } catch (error) {
 *   console.error('Geolocation failed:', error.message);
 * }
 */
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
```

## Common Patterns in Guia Turístico

### Geolocation Management

```javascript
/**
 * @typedef {Object} LocationData
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 * @property {string} municipio - Municipality name (Brazilian term)
 * @property {string} siglaUf - State abbreviation (e.g., 'SP', 'RJ')
 * @property {string} [bairro] - Neighborhood name (optional)
 */

/**
 * Get user's location with geocoding
 * 
 * @async
 * @returns {Promise<LocationData>} Location data with municipality info
 * @throws {Error} If geolocation permission denied
 * @throws {Error} If geocoding service fails
 */
async function getUserLocation() {
  // Implementation using WebGeocodingManager
}
```

### IBGE API Integration

```javascript
/**
 * Fetch municipality statistics from IBGE API
 * 
 * @async
 * @param {string} codigoIbge - IBGE municipality code (7 digits)
 * @returns {Promise<Object>} Municipality statistics
 * @throws {Error} If municipality not found
 * @throws {NetworkError} If IBGE API request fails
 * 
 * @see https://servicodados.ibge.gov.br/api/docs
 */
async function getMunicipalityStats(codigoIbge) {
  // Implementation
}
```

## Validation

Run documentation validation with:

```bash
npm run validate:docs
# or
node validate-docs.js
```

Expected output:
```
=== Documentation Validation Report ===

✅ src/app.js
✅ src/router.js
✅ src/route-manager.js
...

=== Summary ===
Total files: 18
Documented: 18 (100%)
Missing docs: 0

✅ All files are properly documented!
```

## JSDoc Generation (Future)

To generate HTML documentation from JSDoc comments:

```bash
# Install JSDoc
npm install --save-dev jsdoc

# Generate documentation
npx jsdoc -c jsdoc.json

# Configuration file: jsdoc.json
{
  "source": {
    "include": ["src"],
    "includePattern": ".+\\.js$",
    "excludePattern": "(node_modules|tests)"
  },
  "opts": {
    "destination": "./docs/jsdoc",
    "recurse": true,
    "readme": "./README.md"
  },
  "plugins": ["plugins/markdown"],
  "templates": {
    "cleverLinks": true,
    "monospaceLinks": false
  }
}
```

## Best Practices

### DO ✅

- **Always document public APIs** - Functions, classes, methods exposed to other modules
- **Use TypeScript-style types** - `{string}`, `{number}`, `{Array<string>}`, etc.
- **Include examples** - Show how to use complex functions
- **Document async/await** - Use `@async` and `Promise<Type>` return types
- **Document errors** - Use `@throws` for all possible exceptions
- **Use Portuguese terms** - For Brazilian domain-specific terms (municipio, siglaUf, bairro)
- **Reference Web APIs** - Link to MDN docs with `@see` tags
- **Keep docs up-to-date** - Update docs when changing function signatures

### DON'T ❌

- **Don't document trivial code** - Getters/setters with obvious behavior
- **Don't duplicate code in docs** - Describe intent, not implementation
- **Don't use inline comments excessively** - Prefer JSDoc for public APIs
- **Don't forget optional parameters** - Use `[param]` syntax
- **Don't omit return types** - Always specify what functions return
- **Don't ignore promises** - Use `Promise<Type>` for async operations

## Examples from the Codebase

### Router Module (`src/router.js`)

```javascript
/**
 * Navigate to a specific route programmatically
 * 
 * @param {string} path - Target route path
 * @param {Object} [state={}] - State to pass to route handler
 * @returns {Promise<void>}
 * @throws {Error} If route doesn't exist and no notFoundHandler
 * 
 * @example
 * // Navigate to home
 * await router.navigate('/');
 * 
 * // Navigate with parameters
 * await router.navigate('/user/123', { from: 'dashboard' });
 */
async navigate(path, state = {}) {
  // Implementation
}
```

### Route Manager (`src/route-manager.js`)

```javascript
/**
 * Load CSS files dynamically
 * 
 * @param {Array<string>} stylePaths - Array of CSS file paths
 * @returns {Promise<void>}
 * @throws {Error} If CSS file fails to load
 * 
 * @example
 * await loadStyles(['index.css', 'home.css']);
 */
async loadStyles(stylePaths) {
  // Implementation
}
```

### Service Worker (`src/sw.js`)

```javascript
/**
 * Handle service worker install event
 * 
 * @param {ExtendableEvent} event - Install event
 * @returns {void}
 * 
 * @listens ExtendableEvent
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    // Cache static assets
  );
});
```

## Maintenance

### Adding New Functions

When adding new functions:
1. Write JSDoc BEFORE implementation
2. Include at least one `@example`
3. Document all parameters and return values
4. List all possible errors with `@throws`
5. Run `npm run validate:docs` to verify

### Updating Existing Functions

When modifying function signatures:
1. Update JSDoc first
2. Update all `@param` and `@returns` tags
3. Add new examples if behavior changed
4. Update `@throws` if error handling changed
5. Increment version number in relevant files

### Deprecation

When deprecating functions:

```javascript
/**
 * Old function (deprecated)
 * 
 * @deprecated Since v2.0.0 - Use newFunction() instead
 * @see newFunction
 * 
 * @param {string} param - Parameter
 * @returns {string} Result
 */
function oldFunction(param) {
  console.warn('oldFunction is deprecated, use newFunction instead');
  return newFunction(param);
}
```

## References

- [JSDoc 3 Official Documentation](https://jsdoc.app/)
- [TypeScript Type Annotations](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [MDN Web Docs - Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [Google JavaScript Style Guide - JSDoc](https://google.github.io/styleguide/jsguide.html#jsdoc)

## Version History

- **v1.0.0** (2026-01-02): Initial documentation standards established
  - 100% documentation coverage achieved
  - JSDoc 3 format with TypeScript types
  - Validation script implemented

---

**Last Updated:** 2026-01-02  
**Maintained By:** Guia Turístico Development Team
