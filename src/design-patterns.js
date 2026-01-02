/**
 * Design Patterns JavaScript Module
 * Implements interactive design patterns (Snackbar, Bottom Sheet, etc.)
 */

/* ============================================
   SNACKBAR QUEUE PATTERN
   ============================================ */

class SnackbarQueue {
  constructor() {
    this.queue = [];
    this.container = null;
    this.currentSnackbar = null;
    this.init();
  }

  init() {
    // Create container if it doesn't exist
    if (!document.querySelector('.snackbar-container')) {
      this.container = document.createElement('div');
      this.container.className = 'snackbar-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.snackbar-container');
    }
  }

  /**
   * Show a snackbar message
   * @param {string} message - Message to display
   * @param {Object} options - Configuration options
   * @param {string} options.type - 'success', 'error', 'warning', 'info'
   * @param {number} options.duration - Duration in ms (default: 4000)
   * @param {string} options.actionText - Optional action button text
   * @param {Function} options.onAction - Optional action callback
   */
  show(message, options = {}) {
    const config = {
      type: options.type || '',
      duration: options.duration || 4000,
      actionText: options.actionText || null,
      onAction: options.onAction || null,
      ...options
    };

    this.queue.push({ message, config });
    
    if (!this.currentSnackbar) {
      this.showNext();
    }
  }

  showNext() {
    if (this.queue.length === 0) {
      this.currentSnackbar = null;
      return;
    }

    const { message, config } = this.queue.shift();
    
    const snackbar = document.createElement('div');
    snackbar.className = `snackbar ${config.type ? `snackbar-${config.type}` : ''}`;
    snackbar.setAttribute('role', 'status');
    snackbar.setAttribute('aria-live', 'polite');

    const messageEl = document.createElement('span');
    messageEl.className = 'snackbar-message';
    messageEl.textContent = message;
    snackbar.appendChild(messageEl);

    if (config.actionText && config.onAction) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'snackbar-action';
      actionBtn.textContent = config.actionText;
      actionBtn.onclick = () => {
        config.onAction();
        this.hide(snackbar);
      };
      snackbar.appendChild(actionBtn);
    }

    const closeBtn = document.createElement('button');
    closeBtn.className = 'snackbar-close';
    closeBtn.setAttribute('aria-label', 'Fechar notificação');
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => this.hide(snackbar);
    snackbar.appendChild(closeBtn);

    this.container.appendChild(snackbar);
    this.currentSnackbar = snackbar;

    // Auto-hide after duration
    if (config.duration > 0) {
      setTimeout(() => {
        this.hide(snackbar);
      }, config.duration);
    }
  }

  hide(snackbar) {
    snackbar.classList.add('snackbar-exit');
    setTimeout(() => {
      snackbar.remove();
      if (this.currentSnackbar === snackbar) {
        this.showNext();
      }
    }, 200);
  }
}

// Global instance
window.snackbar = new SnackbarQueue();

/* ============================================
   BOTTOM SHEET PATTERN
   ============================================ */

class BottomSheet {
  constructor(elementId) {
    this.sheet = document.getElementById(elementId);
    this.overlay = null;
    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.sheet) return;

    // Create overlay if it doesn't exist
    if (!document.querySelector('.bottom-sheet-overlay')) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'bottom-sheet-overlay';
      this.overlay.onclick = () => this.close();
      document.body.appendChild(this.overlay);
    } else {
      this.overlay = document.querySelector('.bottom-sheet-overlay');
    }

    // Handle swipe down to close (mobile)
    let startY = 0;
    let currentY = 0;

    const handle = this.sheet.querySelector('.bottom-sheet-handle');
    if (handle) {
      handle.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
      });

      handle.addEventListener('touchmove', (e) => {
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 0) {
          this.sheet.style.transform = `translateY(${diff}px)`;
        }
      });

      handle.addEventListener('touchend', () => {
        const diff = currentY - startY;
        if (diff > 100) {
          this.close();
        } else {
          this.sheet.style.transform = '';
        }
      });
    }

    // Keyboard accessibility
    this.sheet.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.overlay.classList.add('active');
    this.sheet.classList.add('active');
    this.sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    const focusable = this.sheet.querySelector('button, input, textarea, select');
    if (focusable) {
      focusable.focus();
    }
  }

  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
    this.sheet.classList.remove('active');
    this.sheet.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.sheet.style.transform = '';
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

/* ============================================
   PROGRESSIVE DISCLOSURE PATTERN
   ============================================ */

class DisclosureSection {
  constructor(elementId) {
    this.section = document.getElementById(elementId);
    this.isExpanded = false;
    this.init();
  }

  init() {
    if (!this.section) return;

    const header = this.section.querySelector('.disclosure-header');
    const content = this.section.querySelector('.disclosure-content');

    if (!header || !content) return;

    // Set initial ARIA attributes
    this.section.setAttribute('aria-expanded', 'false');
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-controls', content.id || 'disclosure-content');

    // Click handler
    header.addEventListener('click', () => this.toggle());

    // Keyboard handler
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
    this.section.setAttribute('aria-expanded', this.isExpanded.toString());
  }

  expand() {
    if (!this.isExpanded) {
      this.toggle();
    }
  }

  collapse() {
    if (this.isExpanded) {
      this.toggle();
    }
  }
}

/* ============================================
   RETRY PATTERN WITH EXPONENTIAL BACKOFF
   ============================================ */

class RetryManager {
  constructor() {
    this.attempts = {};
  }

  /**
   * Execute a function with retry logic
   * @param {string} key - Unique identifier for this operation
   * @param {Function} fn - Async function to execute
   * @param {Object} options - Configuration
   */
  async execute(key, fn, options = {}) {
    const config = {
      maxAttempts: options.maxAttempts || 3,
      initialDelay: options.initialDelay || 1000,
      maxDelay: options.maxDelay || 10000,
      onRetry: options.onRetry || null,
      ...options
    };

    if (!this.attempts[key]) {
      this.attempts[key] = 0;
    }

    try {
      const result = await fn();
      this.attempts[key] = 0; // Reset on success
      return result;
    } catch (error) {
      this.attempts[key]++;

      if (this.attempts[key] >= config.maxAttempts) {
        this.attempts[key] = 0;
        throw new Error(`Falhou após ${config.maxAttempts} tentativas: ${error.message}`);
      }

      // Calculate backoff delay
      const delay = Math.min(
        config.initialDelay * Math.pow(2, this.attempts[key] - 1),
        config.maxDelay
      );

      if (config.onRetry) {
        config.onRetry(this.attempts[key], delay);
      }

      // Show snackbar for retry
      if (window.snackbar) {
        window.snackbar.show(
          `Tentativa ${this.attempts[key]}/${config.maxAttempts}. Tentando novamente em ${Math.round(delay / 1000)}s...`,
          { type: 'warning', duration: delay }
        );
      }

      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.execute(key, fn, config);
    }
  }

  reset(key) {
    this.attempts[key] = 0;
  }

  resetAll() {
    this.attempts = {};
  }
}

// Global instance
window.retryManager = new RetryManager();

/* ============================================
   OPTIMISTIC UI HELPER
   ============================================ */

class OptimisticUI {
  constructor() {
    this.pendingUpdates = new Map();
  }

  /**
   * Apply optimistic update with automatic rollback on error
   * @param {string} key - Unique identifier
   * @param {Function} optimisticUpdate - Function to update UI immediately
   * @param {Function} actualUpdate - Async function to perform actual update
   * @param {Function} rollback - Function to rollback on error
   */
  async update(key, optimisticUpdate, actualUpdate, rollback) {
    // Store rollback function
    this.pendingUpdates.set(key, rollback);

    // Apply optimistic update immediately
    optimisticUpdate();

    try {
      // Perform actual update
      const result = await actualUpdate();
      
      // Remove pending update on success
      this.pendingUpdates.delete(key);
      
      return result;
    } catch (error) {
      // Rollback on error
      if (rollback) {
        rollback();
      }
      this.pendingUpdates.delete(key);
      
      throw error;
    }
  }

  /**
   * Rollback all pending updates
   */
  rollbackAll() {
    this.pendingUpdates.forEach((rollback) => rollback());
    this.pendingUpdates.clear();
  }
}

// Global instance
window.optimisticUI = new OptimisticUI();

/* ============================================
   UTILITY: Initialize all patterns on page
   ============================================ */

function initializeDesignPatterns() {
  // Initialize disclosure sections
  document.querySelectorAll('.disclosure-section').forEach((section) => {
    if (section.id) {
      new DisclosureSection(section.id);
    }
  });

  // Initialize bottom sheets
  document.querySelectorAll('.bottom-sheet').forEach((sheet) => {
    if (sheet.id) {
      window[`bottomSheet_${sheet.id}`] = new BottomSheet(sheet.id);
    }
  });
}

// Auto-initialize on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDesignPatterns);
} else {
  initializeDesignPatterns();
}

// Export for module usage
export {
  SnackbarQueue,
  BottomSheet,
  DisclosureSection,
  RetryManager,
  OptimisticUI,
  initializeDesignPatterns
};
