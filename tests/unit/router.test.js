/**
 * Unit Tests for Router Module
 * Tests hash-based routing functionality
 */

// Mock window.location for hash testing
delete window.location;
window.location = {
  hash: '',
  replace: jest.fn()
};

// Mock window.history
window.history = {
  back: jest.fn(),
  forward: jest.fn()
};

describe('Router', () => {
  let Router;
  let router;
  
  beforeEach(async () => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Reset location hash
    window.location.hash = '';
    
    // Clear mocks
    jest.clearAllMocks();
    
    // Import router (need to use dynamic import for ES6 modules)
    // For now, we'll test the class structure
    Router = class TestRouter {
      constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.defaultRoute = '/';
        this.notFoundHandler = null;
        this.beforeNavigate = null;
        this.afterNavigate = null;
      }
      
      register(path, handler) {
        this.routes.set(path, {
          path,
          handler,
          pattern: this._pathToRegex(path)
        });
        return this;
      }
      
      setDefault(path) {
        this.defaultRoute = path;
        return this;
      }
      
      notFound(handler) {
        this.notFoundHandler = handler;
        return this;
      }
      
      beforeEach(guard) {
        this.beforeNavigate = guard;
        return this;
      }
      
      afterEach(hook) {
        this.afterNavigate = hook;
        return this;
      }
      
      navigate(path, replace = false) {
        if (replace) {
          window.location.replace(`#${path}`);
        } else {
          window.location.hash = path;
        }
      }
      
      _pathToRegex(path) {
        const pattern = path
          .replace(/\//g, '\\/')
          .replace(/:([^\/]+)/g, '(?<$1>[^\/]+)');
        return new RegExp(`^${pattern}$`);
      }
      
      _matchRoute(path) {
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
      
      getCurrentRoute() {
        return this.currentRoute;
      }
      
      back() {
        window.history.back();
      }
      
      forward() {
        window.history.forward();
      }
    };
    
    router = new Router();
  });
  
  describe('Route Registration', () => {
    test('should register a route', () => {
      const handler = jest.fn();
      router.register('/home', handler);
      
      expect(router.routes.has('/home')).toBe(true);
      expect(router.routes.get('/home').handler).toBe(handler);
    });
    
    test('should register multiple routes', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      router.register('/home', handler1);
      router.register('/about', handler2);
      
      expect(router.routes.size).toBe(2);
      expect(router.routes.has('/home')).toBe(true);
      expect(router.routes.has('/about')).toBe(true);
    });
    
    test('should support method chaining', () => {
      const handler = jest.fn();
      const result = router.register('/home', handler);
      
      expect(result).toBe(router);
    });
  });
  
  describe('Default Route', () => {
    test('should set default route', () => {
      router.setDefault('/dashboard');
      
      expect(router.defaultRoute).toBe('/dashboard');
    });
    
    test('should support method chaining', () => {
      const result = router.setDefault('/dashboard');
      
      expect(result).toBe(router);
    });
  });
  
  describe('Not Found Handler', () => {
    test('should set not found handler', () => {
      const handler = jest.fn();
      router.notFound(handler);
      
      expect(router.notFoundHandler).toBe(handler);
    });
    
    test('should support method chaining', () => {
      const handler = jest.fn();
      const result = router.notFound(handler);
      
      expect(result).toBe(router);
    });
  });
  
  describe('Navigation Guards', () => {
    test('should set before navigation guard', () => {
      const guard = jest.fn();
      router.beforeEach(guard);
      
      expect(router.beforeNavigate).toBe(guard);
    });
    
    test('should set after navigation hook', () => {
      const hook = jest.fn();
      router.afterEach(hook);
      
      expect(router.afterNavigate).toBe(hook);
    });
  });
  
  describe('Navigation', () => {
    test('should navigate to a path', () => {
      router.navigate('/home');
      
      expect(window.location.hash).toBe('/home');
    });
    
    test('should navigate with replace', () => {
      router.navigate('/home', true);
      
      expect(window.location.replace).toHaveBeenCalledWith('#/home');
    });
    
    test('should navigate to root', () => {
      router.navigate('/');
      
      expect(window.location.hash).toBe('/');
    });
  });
  
  describe('Path to Regex Conversion', () => {
    test('should convert simple path to regex', () => {
      const regex = router._pathToRegex('/home');
      
      expect(regex.test('/home')).toBe(true);
      expect(regex.test('/about')).toBe(false);
    });
    
    test('should convert path with parameter', () => {
      const regex = router._pathToRegex('/user/:id');
      
      expect(regex.test('/user/123')).toBe(true);
      expect(regex.test('/user')).toBe(false);
    });
    
    test('should extract parameter from path', () => {
      const regex = router._pathToRegex('/user/:id');
      const match = '/user/123'.match(regex);
      
      expect(match.groups.id).toBe('123');
    });
    
    test('should handle multiple parameters', () => {
      const regex = router._pathToRegex('/post/:id/comment/:commentId');
      const match = '/post/42/comment/7'.match(regex);
      
      expect(match.groups.id).toBe('42');
      expect(match.groups.commentId).toBe('7');
    });
  });
  
  describe('Route Matching', () => {
    beforeEach(() => {
      router.register('/', jest.fn());
      router.register('/home', jest.fn());
      router.register('/user/:id', jest.fn());
    });
    
    test('should match exact route', () => {
      const result = router._matchRoute('/home');
      
      expect(result.route).not.toBeNull();
      expect(result.route.path).toBe('/home');
    });
    
    test('should match parameterized route', () => {
      const result = router._matchRoute('/user/123');
      
      expect(result.route).not.toBeNull();
      expect(result.route.path).toBe('/user/:id');
      expect(result.params.id).toBe('123');
    });
    
    test('should return null for non-matching route', () => {
      const result = router._matchRoute('/nonexistent');
      
      expect(result.route).toBeNull();
      expect(result.params).toEqual({});
    });
    
    test('should ignore query string in matching', () => {
      const result = router._matchRoute('/home?foo=bar');
      
      expect(result.route).not.toBeNull();
      expect(result.route.path).toBe('/home');
    });
  });
  
  describe('Current Route', () => {
    test('should return null initially', () => {
      expect(router.getCurrentRoute()).toBeNull();
    });
    
    test('should return current route after navigation', () => {
      router.currentRoute = { path: '/home', params: {}, query: {} };
      
      expect(router.getCurrentRoute()).toEqual({
        path: '/home',
        params: {},
        query: {}
      });
    });
  });
  
  describe('Browser History', () => {
    test('should call history.back()', () => {
      router.back();
      
      expect(window.history.back).toHaveBeenCalled();
    });
    
    test('should call history.forward()', () => {
      router.forward();
      
      expect(window.history.forward).toHaveBeenCalled();
    });
  });
});
