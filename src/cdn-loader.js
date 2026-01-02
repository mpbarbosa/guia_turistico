/**
 * CDN Loader with Fallback Support
 * 
 * Provides robust loading of external dependencies with:
 * - Automatic fallback to local copies
 * - Loading state management
 * - Error handling and reporting
 * - Network detection
 * 
 * Usage:
 *   CDNLoader.load({
 *     url: 'https://cdn.example.com/library.js',
 *     fallback: '/libs/library.js',
 *     test: () => typeof Library !== 'undefined',
 *     name: 'Library'
 *   });
 */

class CDNLoader {
  constructor() {
    this.loadedScripts = new Set();
    this.failedScripts = new Set();
    this.retryAttempts = 2;
    this.retryDelay = 1000; // ms
  }

  /**
   * Load a script from CDN with fallback support
   * @param {Object} config - Configuration object
   * @param {string} config.url - CDN URL
   * @param {string} config.fallback - Local fallback path (optional)
   * @param {Function} config.test - Function to test if library loaded (optional)
   * @param {string} config.name - Library name for logging
   * @param {boolean} config.module - Load as ES6 module (default: false)
   * @param {string} config.integrity - SRI hash (optional)
   * @returns {Promise<void>}
   */
  async load({
    url,
    fallback = null,
    test = null,
    name = 'Script',
    module = false,
    integrity = null
  }) {
    // Check if already loaded
    if (this.loadedScripts.has(url)) {
      console.log(`[CDN] ${name} already loaded`);
      return Promise.resolve();
    }

    // Check if previously failed
    if (this.failedScripts.has(url)) {
      console.warn(`[CDN] ${name} previously failed, skipping`);
      return Promise.reject(new Error(`${name} failed to load`));
    }

    try {
      // Try loading from CDN
      console.log(`[CDN] Loading ${name} from CDN...`);
      await this._loadScript(url, { module, integrity });
      
      // Test if library loaded correctly
      if (test && !test()) {
        throw new Error(`${name} loaded but test failed`);
      }

      this.loadedScripts.add(url);
      console.log(`[CDN] ✅ ${name} loaded successfully from CDN`);
      
      // Report success
      this._reportStatus(name, 'cdn', true);
      
      return Promise.resolve();
    } catch (error) {
      console.warn(`[CDN] ⚠️ Failed to load ${name} from CDN:`, error.message);

      // Try fallback if available
      if (fallback) {
        try {
          console.log(`[CDN] Trying fallback for ${name}...`);
          await this._loadScript(fallback, { module });
          
          // Test fallback
          if (test && !test()) {
            throw new Error(`${name} fallback loaded but test failed`);
          }

          this.loadedScripts.add(url);
          console.log(`[CDN] ✅ ${name} loaded from fallback`);
          
          // Report fallback success
          this._reportStatus(name, 'fallback', true);
          
          return Promise.resolve();
        } catch (fallbackError) {
          console.error(`[CDN] ❌ Fallback failed for ${name}:`, fallbackError.message);
          this.failedScripts.add(url);
          
          // Report failure
          this._reportStatus(name, 'failed', false);
          
          return Promise.reject(fallbackError);
        }
      } else {
        console.error(`[CDN] ❌ No fallback available for ${name}`);
        this.failedScripts.add(url);
        
        // Report failure
        this._reportStatus(name, 'failed', false);
        
        return Promise.reject(error);
      }
    }
  }

  /**
   * Load multiple scripts in parallel
   * @param {Array<Object>} configs - Array of configuration objects
   * @returns {Promise<Array>}
   */
  async loadMultiple(configs) {
    return Promise.allSettled(
      configs.map(config => this.load(config))
    );
  }

  /**
   * Internal method to load a script
   * @private
   */
  _loadScript(url, { module = false, integrity = null } = {}) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      
      if (module) {
        script.type = 'module';
      }
      
      script.src = url;
      
      // Add SRI if provided
      if (integrity) {
        script.integrity = integrity;
        script.crossOrigin = 'anonymous';
      }
      
      script.async = true;
      
      script.onload = () => {
        console.log(`[CDN] Script loaded: ${url}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.error(`[CDN] Script error: ${url}`, error);
        // Remove failed script from DOM
        script.remove();
        reject(new Error(`Failed to load script: ${url}`));
      };
      
      document.head.appendChild(script);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.loadedScripts.has(url)) {
          script.remove();
          reject(new Error(`Timeout loading script: ${url}`));
        }
      }, 10000);
    });
  }

  /**
   * Report loading status to UI
   * @private
   */
  _reportStatus(name, source, success) {
    // Dispatch custom event for UI updates
    const event = new CustomEvent('cdn-status', {
      detail: { name, source, success, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    // Log to console
    const emoji = success ? '✅' : '❌';
    const sourceText = source === 'cdn' ? 'CDN' : 
                      source === 'fallback' ? 'fallback' : 
                      'failed';
    console.log(`[CDN] ${emoji} ${name}: ${sourceText}`);
  }

  /**
   * Check if online
   * @returns {boolean}
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Get loading statistics
   * @returns {Object}
   */
  getStats() {
    return {
      loaded: this.loadedScripts.size,
      failed: this.failedScripts.size,
      online: this.isOnline()
    };
  }
}

// Create singleton instance
const cdnLoader = new CDNLoader();

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('[CDN] Network connection restored');
});

window.addEventListener('offline', () => {
  console.warn('[CDN] Network connection lost - using fallbacks');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = cdnLoader;
}

// Global access
window.CDNLoader = cdnLoader;
