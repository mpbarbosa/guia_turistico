# JSDoc Documentation Guide

## Overview

This project uses JSDoc 3 format for documenting JavaScript code, following MDN Web Docs style guidelines.

## Documentation Standards

### File-Level Documentation

Every JavaScript file should start with a `@fileoverview` tag:

```javascript
/**
 * @fileoverview Brief description of the file's purpose
 * Detailed explanation of what the module does.
 * 
 * Additional context about architecture, dependencies, or usage.
 * 
 * @module path/to/module
 * @requires dependency1
 * @requires dependency2
 * @see https://developer.mozilla.org/...
 */
```

### Function Documentation

#### Synchronous Functions

```javascript
/**
 * Brief description of what the function does
 * @function
 * @param {string} userId - User identifier
 * @param {Object} options - Configuration options
 * @param {number} [options.timeout=5000] - Optional timeout in ms
 * @returns {User} User object with profile data
 * @throws {TypeError} If userId is not a string
 * @throws {Error} If user not found
 * 
 * @example
 * const user = getUser('123', { timeout: 3000 });
 * console.log(user.name);
 */
function getUser(userId, options = {}) {
  // Implementation
}
```

#### Async Functions

```javascript
/**
 * Fetch user data from API
 * @async
 * @function
 * @param {string} id - User ID
 * @returns {Promise<Object>} Promise resolving to user data
 * @throws {Error} If API request fails
 * 
 * @example
 * try {
 *   const user = await fetchUser('123');
 *   console.log(user);
 * } catch (error) {
 *   console.error('Failed to fetch user:', error);
 * }
 */
async function fetchUser(id) {
  // Implementation
}
```

### Type Definitions

#### Variables and Constants

```javascript
/**
 * Cache name with version for cache busting
 * @type {string}
 * @constant
 */
const CACHE_NAME = 'guia-turistico-v0.5.0';

/**
 * Current geographic coordinates
 * @type {Object|null}
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 */
let currentCoords = null;
```

#### Classes

```javascript
/**
 * Router class - Manages SPA routing with hash-based navigation
 * @class
 * 
 * @example
 * const router = new Router();
 * router.register('/', homeHandler);
 * router.navigate('/about');
 */
class Router {
  /**
   * Create a router instance
   * @constructor
   */
  constructor() {
    // Implementation
  }
  
  /**
   * Register a route handler
   * @param {string} path - Route path (e.g., '/', '/user/:id')
   * @param {Function} handler - Route handler function
   * @returns {Router} Router instance for chaining
   */
  register(path, handler) {
    // Implementation
  }
}
```

### Event Listeners

```javascript
/**
 * Service Worker install event handler
 * Precaches essential assets for offline functionality
 * 
 * @listens install
 * @param {ExtendableEvent} event - Install event
 */
self.addEventListener('install', (event) => {
  // Implementation
});
```

### Web APIs

When documenting functions that use Web APIs, reference MDN:

```javascript
/**
 * Get user's current location using browser geolocation API
 * @async
 * @function
 * @returns {Promise<void>}
 * @throws {GeolocationPositionError} If geolocation fails or is denied
 * 
 * @requires navigator.geolocation - Browser Geolocation API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
 * 
 * @example
 * await getLocation();
 */
async function getLocation() {
  // Implementation using navigator.geolocation
}
```

## Type Annotations

### Common Types

- `{string}` - String value
- `{number}` - Numeric value
- `{boolean}` - Boolean value
- `{Object}` - Generic object
- `{Array}` - Generic array
- `{Array<string>}` - Array of strings
- `{Function}` - Function
- `{Promise<T>}` - Promise that resolves to type T
- `{HTMLElement}` - DOM element
- `{Event}` - Event object
- `{?string}` - Nullable string (can be null)
- `{string|number}` - Union type (string OR number)
- `{*}` - Any type

### Optional Parameters

```javascript
/**
 * @param {string} required - Required parameter
 * @param {number} [optional] - Optional parameter
 * @param {number} [withDefault=5] - Optional with default value
 */
```

### Object Parameters

```javascript
/**
 * @param {Object} options - Configuration object
 * @param {string} options.name - User name
 * @param {number} [options.age] - User age (optional)
 * @param {boolean} [options.active=true] - Active status (default true)
 */
```

### Return Types

```javascript
/**
 * @returns {void} - Function returns nothing
 * @returns {string} - Returns a string
 * @returns {Promise<User>} - Returns promise of User object
 * @returns {HTMLElement|null} - Returns element or null
 */
```

## Examples

### Pure Functions

Functions without side effects:

```javascript
/**
 * Calculate retry delay with exponential backoff
 * @function
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {number} Delay in milliseconds
 * 
 * @example
 * calculateRetryDelay(0, 1000); // 1000
 * calculateRetryDelay(1, 1000); // 2000
 * calculateRetryDelay(2, 1000); // 4000
 */
function calculateRetryDelay(attempt, baseDelay) {
  return baseDelay * Math.pow(2, attempt);
}
```

### Impure Functions

Functions with side effects (DOM, I/O, APIs):

```javascript
/**
 * Show geolocation banner in container
 * Updates DOM by inserting banner HTML
 * 
 * @function
 * @param {string|HTMLElement} containerId - Container ID or element
 * @param {string} bannerHTML - Banner HTML string
 * @returns {HTMLElement|null} The created banner element
 * 
 * @example
 * const banner = showGeolocationBanner('banner-container', '<div>...</div>');
 */
function showGeolocationBanner(containerId, bannerHTML) {
  // DOM manipulation
}
```

## Generating Documentation

### Install JSDoc

```bash
npm install -g jsdoc
```

### Generate Documentation

```bash
# Generate HTML documentation
jsdoc -c jsdoc.json

# Custom output directory
jsdoc src/ -r -d docs/api
```

### JSDoc Configuration

Create `jsdoc.json`:

```json
{
  "source": {
    "include": ["src"],
    "includePattern": ".+\\.js$",
    "excludePattern": "(node_modules|tests)"
  },
  "opts": {
    "destination": "./docs/api",
    "recurse": true,
    "readme": "README.md"
  },
  "plugins": ["plugins/markdown"],
  "templates": {
    "default": {
      "outputSourceFiles": true
    }
  }
}
```

## Best Practices

1. **Document as you code** - Write JSDoc immediately when creating functions
2. **Be descriptive** - Explain *why*, not just *what*
3. **Include examples** - Show common usage patterns
4. **Update documentation** - Keep docs in sync with code changes
5. **Use proper types** - Leverage TypeScript-style type annotations
6. **Link to resources** - Use `@see` for external documentation
7. **Separate concerns** - Mark pure vs impure functions clearly
8. **Test coverage** - Document which tests cover the function

## Validation

Run the documentation validator:

```bash
node validate-docs.js
```

This checks:
- All files have file-level comments
- Functions have `@param` and `@returns` tags
- Async functions have `@async` tag
- Type annotations are present

## IDE Support

### VS Code

Install extensions:
- **Document This** - Generate JSDoc stubs
- **JS Parameter Annotations** - Show parameter types inline

Settings:
```json
{
  "javascript.suggest.completeJSDocs": true
}
```

### WebStorm

Built-in JSDoc support:
- Type `/**` above function and press Enter for auto-generation
- Enable inspections: Settings → Editor → Inspections → JavaScript → JSDoc

## Resources

- [JSDoc Official Documentation](https://jsdoc.app/)
- [MDN Web Docs Style Guide](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide)
- [Google JavaScript Style Guide - JSDoc](https://google.github.io/styleguide/jsguide.html#jsdoc)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)

---

**Last Updated**: 2026-01-02
