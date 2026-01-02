/**
 * Performance Optimizations Module
 * Implements lazy loading, request debouncing, and resource management
 */

/* ============================================
   DEBOUNCING & THROTTLING
   ============================================ */

/**
 * Debounce function calls to reduce frequency of execution
 * Useful for optimizing events that fire rapidly (scroll, resize, input)
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds before executing
 * @param {boolean} [immediate=false] - Execute on leading edge instead of trailing
 * @returns {Function} Debounced function
 * @throws {TypeError} If func is not a function
 * @example
 * // Debounce search API calls on input
 * const debouncedSearch = debounce(searchAPI, 300);
 * searchInput.addEventListener('input', debouncedSearch);
 * 
 * @example
 * // Immediate execution on first call
 * const debouncedResize = debounce(handleResize, 150, true);
 * window.addEventListener('resize', debouncedResize);
 */
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Throttle function calls to maximum frequency (rate limiting)
 * Ensures function is called at most once per specified time period
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} Throttled function
 * @example
 * const throttledScroll = throttle(handleScroll, 200);
 * window.addEventListener('scroll', throttledScroll);
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/* ============================================
   LAZY LOADING WITH INTERSECTION OBSERVER
   ============================================ */

/**
 * Lazy Loader - Uses IntersectionObserver for efficient lazy loading
 * Automatically loads images/iframes when they enter viewport
 * @class
 * @example
 * const loader = new LazyLoader({ rootMargin: '100px' });
 * <img data-lazy-load data-lazy-src="image.jpg" alt="Description">
 */
class LazyLoader {
  /**
   * Create a lazy loader instance
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.rootMargin='50px'] - Margin around viewport for preloading
   * @param {number} [options.threshold=0.01] - Percentage of element visible to trigger
   */
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
      ...options
    };
    this.observer = null;
    this.init();
  }

  /**
   * Initialize lazy loading observer
   * @private
   */
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        this.options
      );
      this.observeElements();
    } else {
      // Fallback: Load everything immediately
      this.loadAll();
    }
  }

  /**
   * Observe all elements with data-lazy-load attribute
   * @private
   */
  observeElements() {
    const elements = document.querySelectorAll('[data-lazy-load]');
    elements.forEach(el => this.observer.observe(el));
  }

  /**
   * Handle intersection observer callback
   * @private
   * @param {IntersectionObserverEntry[]} entries - Observer entries
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  /**
   * Load a single lazy element (image, iframe, etc.)
   * @private
   * @param {HTMLElement} element - Element to load
   */
  loadElement(element) {
    const src = element.dataset.lazySrc;
    const srcset = element.dataset.lazySrcset;
    
    if (element.tagName === 'IMG') {
      if (srcset) element.srcset = srcset;
      if (src) element.src = src;
    } else if (element.tagName === 'IFRAME') {
      if (src) element.src = src;
    } else {
      // For other elements, load background image
      if (src) element.style.backgroundImage = `url(${src})`;
    }
    
    element.classList.add('loaded');
    delete element.dataset.lazySrc;
    delete element.dataset.lazySrcset;
  }

  /**
   * Load all lazy elements immediately (fallback for old browsers)
   * @private
   */
  loadAll() {
    const elements = document.querySelectorAll('[data-lazy-load]');
    elements.forEach(el => this.loadElement(el));
  }
}

// Initialize lazy loader
window.lazyLoader = new LazyLoader();

/* ============================================
   ADAPTIVE GEOLOCATION POLLING
   ============================================ */

/**
 * Adaptive Geolocation - Adjusts polling frequency based on movement
 * Saves battery by reducing updates when stationary
 * @class
 * @example
 * const geo = new AdaptiveGeolocation();
 * geo.startWatching((position) => {
 *   console.log('Current position:', position);
 * });
 */
class AdaptiveGeolocation {
  constructor() {
    this.watchId = null;
    this.lastPosition = null;
    this.lastUpdate = null;
    this.updateFrequency = 5000; // Start with 5 seconds
    this.minFrequency = 1000;    // Minimum 1 second (fast movement)
    this.maxFrequency = 30000;   // Maximum 30 seconds (stationary)
    this.movementThreshold = 10; // meters
    this.isMoving = false;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Adapt polling frequency based on user movement
   * Increases frequency when moving, decreases when stationary
   * @private
   * @param {GeolocationPosition} position - Current position
   */
  adaptFrequency(position) {
    if (!this.lastPosition) {
      this.lastPosition = position;
      this.lastUpdate = Date.now();
      return;
    }

    const distance = this.calculateDistance(
      this.lastPosition.coords.latitude,
      this.lastPosition.coords.longitude,
      position.coords.latitude,
      position.coords.longitude
    );

    const timeDelta = (Date.now() - this.lastUpdate) / 1000; // seconds
    const speed = distance / timeDelta; // meters per second

    // Adjust frequency based on speed
    if (speed > 5) {
      // Fast movement (>18 km/h) - update frequently
      this.updateFrequency = this.minFrequency;
      this.isMoving = true;
    } else if (speed > 1) {
      // Moderate movement (>3.6 km/h) - medium frequency
      this.updateFrequency = 5000;
      this.isMoving = true;
    } else if (speed < 0.1) {
      // Stationary - reduce frequency to save battery
      this.updateFrequency = this.maxFrequency;
      this.isMoving = false;
    } else {
      // Slow movement - balanced frequency
      this.updateFrequency = 10000;
      this.isMoving = true;
    }

    this.lastPosition = position;
    this.lastUpdate = Date.now();

    console.log(`(performance) Speed: ${speed.toFixed(2)} m/s, Frequency: ${this.updateFrequency}ms`);
  }

  /**
   * Start adaptive geolocation tracking
   * Automatically adjusts polling frequency based on movement speed
   * @param {Function} callback - Success callback receiving GeolocationPosition
   * @param {Function} errorCallback - Error callback receiving GeolocationPositionError
   * @returns {void}
   * @example
   * const geo = new AdaptiveGeolocation();
   * geo.start(
   *   (position) => console.log('Position:', position),
   *   (error) => console.error('Error:', error)
   * );
   */
  start(callback, errorCallback) {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation not supported'));
      return;
    }

    // Initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.adaptFrequency(position);
        callback(position);
      },
      errorCallback,
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    // Watch position with adaptive frequency
    this.watchId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.adaptFrequency(position);
          callback(position);
        },
        errorCallback,
        {
          enableHighAccuracy: this.isMoving,
          maximumAge: this.updateFrequency / 2,
          timeout: 10000
        }
      );
    }, this.updateFrequency);
  }

  /**
   * Stop geolocation tracking
   * Clears the watch interval and resets state
   * @returns {void}
   */
  stop() {
    if (this.watchId) {
      clearInterval(this.watchId);
      this.watchId = null;
    }
  }
}

// Global instance
window.adaptiveGeolocation = new AdaptiveGeolocation();

/* ============================================
   REQUEST BATCHING & CACHING
   ============================================ */

/**
 * Request Batcher - Deduplicates and caches API requests
 * Batches multiple identical requests and provides caching
 * @class
 * @example
 * const batcher = new RequestBatcher();
 * const data = await batcher.fetch('https://api.example.com/data');
 */
class RequestBatcher {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch data with batching and caching
   * Deduplicates simultaneous requests and caches responses
   * @param {string} url - API endpoint URL
   * @param {Object} [options={}] - Fetch options
   * @returns {Promise<any>} Response data
   * @throws {Error} If fetch fails after retries
   * @example
   * const batcher = new RequestBatcher();
   * const data = await batcher.fetch('/api/location', { method: 'GET' });
   */
  async fetch(url, options = {}) {
    const cacheKey = this.getCacheKey(url, options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`(performance) Cache HIT: ${url}`);
        return Promise.resolve(cached.data);
      }
    }

    // Check if request already in flight
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`(performance) Batching request: ${url}`);
      return this.pendingRequests.get(cacheKey);
    }

    // Make new request
    const promise = fetch(url, options)
      .then(response => response.json())
      .then(data => {
        // Cache result
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        // Remove from pending
        this.pendingRequests.delete(cacheKey);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  /**
   * Generate cache key from URL and options
   * @private
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {string} Cache key
   */
  getCacheKey(url, options) {
    return `${url}_${JSON.stringify(options)}`;
  }

  /**
   * Clear all cached data
   * @returns {void}
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Remove expired cache entries
   * @returns {void}
   */
  clearOldCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
}

// Global instance
window.requestBatcher = new RequestBatcher();

// Clear old cache every 5 minutes
setInterval(() => {
  window.requestBatcher.clearOldCache();
}, 5 * 60 * 1000);

/* ============================================
   RESOURCE HINTS
   ============================================ */

/**
 * Preconnect to domain for faster subsequent requests
 * Establishes early connection (DNS, TCP, TLS) to speed up future requests
 * @param {string} url - Domain URL to preconnect
 * @returns {void}
 * @example
 * preconnect('https://api.example.com');
 */
function preconnect(url) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * DNS prefetch for faster domain name resolution
 * Resolves domain name before resource is needed
 * @param {string} url - Domain URL for DNS prefetch
 * @returns {void}
 * @example
 * dnsPrefetch('https://cdn.example.com');
 */
function dnsPrefetch(url) {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Prefetch page for instant navigation
 * Downloads page resources in advance for faster navigation
 * @param {string} url - Page URL to prefetch
 * @returns {void}
 * @example
 * prefetchPage('/about');
 */
function prefetchPage(url) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'document';
  document.head.appendChild(link);
}

/* ============================================
   PERFORMANCE MONITORING
   ============================================ */

/**
 * Performance Monitor - Tracks and reports performance metrics
 * Uses Performance API to measure timing and resource usage
 * @class
 * @example
 * const monitor = new PerformanceMonitor();
 * monitor.mark('start-load');
 * // ... do work
 * monitor.mark('end-load');
 * monitor.measure('page-load', 'start-load', 'end-load');
 */
class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = [];
  }

  /**
   * Create performance mark at current time
   * @param {string} name - Mark identifier
   * @returns {PerformanceMark} Performance mark object
   */
  mark(name) {
    const mark = performance.mark(name);
    this.marks.set(name, mark);
    return mark;
  }

  /**
   * Measure time between two marks
   * @param {string} name - Measure identifier
   * @param {string} startMark - Start mark name
   * @param {string} endMark - End mark name
   * @returns {PerformanceMeasure|undefined} Performance measure object
   */
  measure(name, startMark, endMark) {
    try {
      const measure = performance.measure(name, startMark, endMark);
      this.measures.push(measure);
      console.log(`(performance) ${name}: ${measure.duration.toFixed(2)}ms`);
      return measure;
    } catch (e) {
      console.error('Performance measure failed:', e);
    }
  }

  /**
   * Get performance metrics from Performance API
   * @returns {Object|null} Performance metrics including navigation and paint timing
   */
  getMetrics() {
    if (!performance.getEntriesByType) return null;

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      // Navigation timing
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
      
      // Paint timing
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      
      // Custom measures
      customMeasures: this.measures
    };
  }

  /**
   * Log performance metrics to console
   * Displays metrics in table format
   * @returns {void}
   */
  logMetrics() {
    const metrics = this.getMetrics();
    console.table(metrics);
  }
}

// Global instance
window.performanceMonitor = new PerformanceMonitor();

/* ============================================
   IDLE CALLBACK HELPER
   ============================================ */

/**
 * Run non-critical tasks during browser idle time
 * Uses requestIdleCallback when available, falls back to setTimeout
 * @param {Function} callback - Function to run during idle time
 * @param {Object} [options={}] - Options for requestIdleCallback
 * @param {number} [options.timeout] - Maximum time to wait before executing
 * @returns {void}
 * @example
 * runWhenIdle(() => {
 *   console.log('Running during idle time');
 * }, { timeout: 2000 });
 */
function runWhenIdle(callback, options = {}) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, options);
  } else {
    // Fallback: use setTimeout
    setTimeout(callback, 1);
  }
}

/* ============================================
   BATCH DOM UPDATES
   ============================================ */

/**
 * DOM Batcher - Prevents layout thrashing by batching DOM operations
 * Separates reads and writes using requestAnimationFrame
 * @class
 * @example
 * const batcher = new DOMBatcher();
 * batcher.read(() => {
 *   const height = element.offsetHeight; // DOM read
 *   batcher.write(() => {
 *     element.style.height = height * 2 + 'px'; // DOM write
 *   });
 * });
 */
class DOMBatcher {
  constructor() {
    this.readQueue = [];
    this.writeQueue = [];
    this.scheduled = false;
  }

  /**
   * Schedule a DOM read operation
   * Prevents layout thrashing by batching reads before writes
   * @param {Function} callback - Function performing DOM reads
   * @returns {void}
   */
  read(callback) {
    this.readQueue.push(callback);
    this.schedule();
  }

  /**
   * Schedule a DOM write operation
   * Batches writes after all reads complete
   * @param {Function} callback - Function performing DOM writes
   * @returns {void}
   */
  write(callback) {
    this.writeQueue.push(callback);
    this.schedule();
  }

  /**
   * Schedule execution of queued operations
   * @private
   * @returns {void}
   */
  schedule() {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      // Execute all reads first
      this.readQueue.forEach(cb => cb());
      this.readQueue = [];

      // Then all writes
      this.writeQueue.forEach(cb => cb());
      this.writeQueue = [];

      this.scheduled = false;
    });
  }
}

// Global instance
window.domBatcher = new DOMBatcher();

/* ============================================
   INITIALIZATION
   ============================================ */

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
  // Mark DOMContentLoaded
  window.performanceMonitor.mark('dom-ready');

  // Preconnect to known external domains
  preconnect('https://cdn.jsdelivr.net');
  dnsPrefetch('https://nominatim.openstreetmap.org');
  dnsPrefetch('https://servicodados.ibge.gov.br');

  // Prefetch navigation pages on hover
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      prefetchPage(link.href);
    }, { once: true, passive: true });
  });

  // Log performance metrics after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.performanceMonitor.logMetrics();
    }, 0);
  });
});

/* ============================================
   EXPORT FOR MODULE USAGE
   ============================================ */

export {
  debounce,
  throttle,
  LazyLoader,
  AdaptiveGeolocation,
  RequestBatcher,
  PerformanceMonitor,
  DOMBatcher,
  preconnect,
  dnsPrefetch,
  prefetchPage,
  runWhenIdle
};
