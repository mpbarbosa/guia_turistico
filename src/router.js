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

/**
 * Router class - Manages SPA routing with hash-based navigation
 * @class
 */
class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.defaultRoute = '/';
    this.notFoundHandler = null;
    this.beforeNavigate = null;
    this.afterNavigate = null;
    
    // Initialize router
    this._init();
  }

  /**
   * Initialize router - set up event listeners
   * @private
   */
  _init() {
    // Listen for hash changes (back/forward buttons, manual URL changes)
    window.addEventListener('hashchange', () => this._handleRouteChange());
    
    // Listen for initial page load
    window.addEventListener('load', () => this._handleRouteChange());
    
    // Intercept link clicks for SPA navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#/"]');
      if (link) {
        e.preventDefault();
        const path = link.getAttribute('href').substring(1); // Remove '#'
        this.navigate(path);
      }
    });
  }

  /**
   * Register a route with its handler
   * @param {string} path - Route path (e.g., '/', '/tracking', '/converter/:id')
   * @param {Function} handler - Route handler function receiving (params, query)
   * @returns {Router} Router instance for chaining
   * @example
   * router.register('/user/:id', async (params, query) => {
   *   console.log('User ID:', params.id);
   * });
   */
  register(path, handler) {
    this.routes.set(path, {
      path,
      handler,
      pattern: this._pathToRegex(path)
    });
    return this;
  }

  /**
   * Set default route (fallback when no route matches)
   * @param {string} path - Default route path
   * @returns {Router} Router instance for chaining
   */
  setDefault(path) {
    this.defaultRoute = path;
    return this;
  }

  /**
   * Set 404 not found handler
   * @param {Function} handler - Handler function for unmatched routes
   * @returns {Router} Router instance for chaining
   */
  notFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  /**
   * Set navigation guard (runs before every route change)
   * @param {Function} guard - Guard function (from, to, next) => void
   * @returns {Router} Router instance for chaining
   * @example
   * router.beforeEach((from, to, next) => {
   *   if (isAuthenticated()) {
   *     next(true); // Allow navigation
   *   } else {
   *     next(false); // Block navigation
   *   }
   * });
   */
  beforeEach(guard) {
    this.beforeNavigate = guard;
    return this;
  }

  /**
   * Set after navigation hook (runs after route change completes)
   * @param {Function} hook - Hook function receiving route info
   * @returns {Router} Router instance for chaining
   * @example
   * router.afterEach((route) => {
   *   analytics.trackPageView(route.path);
   * });
   */
  afterEach(hook) {
    this.afterNavigate = hook;
    return this;
  }

  /**
   * Navigate to a route programmatically
   * @param {string} path - Path to navigate to (without '#')
   * @param {boolean} [replace=false] - Replace history entry instead of pushing
   * @returns {void}
   * @example
   * router.navigate('/tracking'); // Push new history entry
   * router.navigate('/home', true); // Replace current entry
   */
  navigate(path, replace = false) {
    const currentPath = this._getCurrentPath();
    
    // Run before navigation guard
    if (this.beforeNavigate) {
      let shouldContinue = true;
      const next = (proceed = true) => { shouldContinue = proceed; };
      this.beforeNavigate(currentPath, path, next);
      if (!shouldContinue) return;
    }

    // Update URL hash
    if (replace) {
      window.location.replace(`#${path}`);
    } else {
      window.location.hash = path;
    }
  }

  /**
   * Handle route changes (hash changes or initial load)
   * @private
   */
  _handleRouteChange() {
    const path = this._getCurrentPath();
    const { route, params } = this._matchRoute(path);
    
    if (route) {
      this.currentRoute = { path, params, query: this._getQueryParams() };
      route.handler(params, this.currentRoute.query);
      
      // Run after navigation hook
      if (this.afterNavigate) {
        this.afterNavigate(this.currentRoute);
      }
    } else if (this.notFoundHandler) {
      this.notFoundHandler(path);
    } else if (this.defaultRoute && path !== this.defaultRoute) {
      // Redirect to default route if no match
      this.navigate(this.defaultRoute, true);
    }
  }

  /**
   * Get current path from hash
   * @private
   * @returns {string} Current path without hash
   */
  _getCurrentPath() {
    const hash = window.location.hash.substring(1); // Remove '#'
    return hash || this.defaultRoute;
  }

  /**
   * Convert route path to regex pattern for matching
   * @private
   * @param {string} path - Route path with optional parameters
   * @returns {RegExp} Regex pattern for matching
   */
  _pathToRegex(path) {
    // Convert '/converter/:id' to regex pattern
    // Matches named parameters (:param)
    const pattern = path
      .replace(/\//g, '\\/')
      .replace(/:([^\/]+)/g, '(?<$1>[^/]+)');
    return new RegExp(`^${pattern}$`);
  }

  /**
   * Match current path against registered routes
   * @private
   * @param {string} path - Path to match
   * @returns {Object} { route, params } or { route: null, params: {} }
   */
  _matchRoute(path) {
    // Remove query string for matching
    const pathWithoutQuery = path.split('?')[0];
    
    for (const [routePath, route] of this.routes) {
      const match = pathWithoutQuery.match(route.pattern);
      if (match) {
        return {
          route,
          params: match.groups || {}
        };
      }
    }
    
    return { route: null, params: {} };
  }

  /**
   * Parse query parameters from hash
   * @private
   * @returns {Object} Query parameters as key-value pairs
   */
  _getQueryParams() {
    const hash = window.location.hash.substring(1);
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    
    if (!queryString) return {};
    
    return queryString.split('&').reduce((params, param) => {
      const [key, value] = param.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      return params;
    }, {});
  }

  /**
   * Get current route information
   * @returns {Object|null} Current route with path, params, and query
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Go back in history
   */
  back() {
    window.history.back();
  }

  /**
   * Go forward in history
   */
  forward() {
    window.history.forward();
  }
}

// Export singleton instance
export const router = new Router();
export default router;
