/**
 * Performance Optimizations Module
 * Implements lazy loading, request debouncing, and resource management
 */

/* ============================================
   DEBOUNCING & THROTTLING
   ============================================ */

/**
 * Debounce function calls to reduce frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute on leading edge
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
 * Throttle function calls to maximum frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls (ms)
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

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
      ...options
    };
    this.observer = null;
    this.init();
  }

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

  observeElements() {
    const elements = document.querySelectorAll('[data-lazy-load]');
    elements.forEach(el => this.observer.observe(el));
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

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
   * Calculate distance between two coordinates (Haversine formula)
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
   * Adapt polling frequency based on movement
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
   * Stop tracking
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

class RequestBatcher {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Batch multiple requests to same endpoint
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

  getCacheKey(url, options) {
    return `${url}_${JSON.stringify(options)}`;
  }

  clearCache() {
    this.cache.clear();
  }

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
 * Preconnect to domain for faster requests
 */
function preconnect(url) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * DNS prefetch for faster resolution
 */
function dnsPrefetch(url) {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Prefetch page for navigation
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

class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = [];
  }

  mark(name) {
    const mark = performance.mark(name);
    this.marks.set(name, mark);
    return mark;
  }

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
 * Run non-critical tasks during idle time
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

class DOMBatcher {
  constructor() {
    this.readQueue = [];
    this.writeQueue = [];
    this.scheduled = false;
  }

  /**
   * Schedule a DOM read (avoid layout thrashing)
   */
  read(callback) {
    this.readQueue.push(callback);
    this.schedule();
  }

  /**
   * Schedule a DOM write (avoid layout thrashing)
   */
  write(callback) {
    this.writeQueue.push(callback);
    this.schedule();
  }

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
