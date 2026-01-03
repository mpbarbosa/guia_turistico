/**
 * @fileoverview Service Worker - Offline Support and Caching
 * Provides offline functionality and performance improvements using Cache API
 * 
 * Implements cache-first strategy for app assets and network-first for APIs.
 * Handles offline fallback with custom offline page.
 * 
 * @requires Cache API
 * @requires Service Worker API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */

/**
 * Cache name with version for cache busting
 * @type {string}
 * @constant
 */
const CACHE_NAME = 'guia-turistico-v0.7.0';

/**
 * URL for offline fallback page
 * @type {string}
 * @constant
 */
const OFFLINE_URL = '/offline.html';

/**
 * Assets to cache immediately on service worker install
 * @type {Array<string>}
 * @constant
 */
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/router.js',
  '/route-manager.js',
  '/toast.js',
  '/transitions.css',
  '/typography.css',
  '/navigation.css',
  '/skip-link.css',
  '/reduced-motion.css',
  '/loading-states.css',
  '/touch-device-fixes.css',
  '/design-patterns.css',
  '/accessibility-compliance.css',
  '/performance-optimizations.css',
  '/geolocation-banner.css',
  '/version-display.css',
  '/tooltip.css',
  '/noscript.css',
  '/error-recovery.js',
  '/geolocation-banner.js'
];

/**
 * Assets to cache on first use with network-first strategy
 * @type {Array<string>}
 * @constant
 */
const RUNTIME_CACHE_URLS = [
  '/views/home.js',
  '/views/converter.js'
];

/**
 * Service Worker install event handler
 * Precaches essential assets for offline functionality
 * 
 * @listens install
 * @param {ExtendableEvent} event - Install event
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      console.log('[SW] Skip waiting');
      return self.skipWaiting();
    })
  );
});

/**
 * Service Worker activate event handler
 * Cleans up old caches and claims clients
 * 
 * @listens activate
 * @param {ExtendableEvent} event - Activate event
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

/**
 * Service Worker fetch event handler
 * Implements cache-first strategy with network fallback
 * - Same-origin requests: cache-first with runtime caching
 * - External requests: network-only (APIs, CDN)
 * - Offline fallback for navigation requests
 * 
 * @listens fetch
 * @param {FetchEvent} event - Fetch event
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests (APIs, CDN)
  if (url.origin !== location.origin) {
    // Network-only for external APIs
    event.respondWith(fetch(request));
    return;
  }
  
  // Cache-first strategy for app assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', request.url);
        return cachedResponse;
      }
      
      // Not in cache, fetch from network
      console.log('[SW] Fetching from network:', request.url);
      return fetch(request).then((response) => {
        // Don't cache if not successful
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response
        const responseToCache = response.clone();
        
        // Add to runtime cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      }).catch((error) => {
        console.error('[SW] Fetch failed:', error);
        
        // Return offline page for navigation requests
        if (request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
        
        // Return a generic offline response for other requests
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});

/**
 * Service Worker message event handler
 * Handles commands from client application
 * - SKIP_WAITING: Activate new service worker immediately
 * - CACHE_URLS: Cache specified URLs for offline use
 * 
 * @listens message
 * @param {ExtendableMessageEvent} event - Message event
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    console.log('[SW] Received CACHE_URLS message');
    const urls = event.data.urls || [];
    
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(urls).then(() => {
        console.log('[SW] Cached requested URLs');
      });
    });
  }
});

/**
 * Service Worker sync event handler
 * Handles background sync when connection is restored
 * 
 * @listens sync
 * @param {SyncEvent} event - Sync event
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

/**
 * Sync data when back online
 * Processes queued requests from offline mode
 * 
 * @async
 * @function
 * @returns {Promise<void>}
 * 
 * @example
 * // Called by sync event when 'sync-data' tag is triggered
 * await syncData();
 */
async function syncData() {
  console.log('[SW] Syncing data...');
  // Implement sync logic here
  // For example, send queued API requests
  return Promise.resolve();
}

console.log('[SW] Service Worker loaded');
