/**
 * Route Manager - View Lifecycle Management
 * Manages loading/unloading of views, CSS, and cleanup handlers
 * 
 * Features:
 * - Dynamic view loading
 * - CSS isolation per route
 * - Cleanup handlers for proper resource management
 * - Loading states
 * - Error boundaries
 * - View transitions with animations
 * - Progress indicators
 */

class RouteManager {
  constructor(containerSelector = '#app-content') {
    this.container = document.querySelector(containerSelector);
    this.currentView = null;
    this.currentCleanup = null;
    this.loadedStyles = new Set();
    this.transitionType = 'fade'; // fade, slide, scale
    this.progressBar = null;
    
    if (!this.container) {
      throw new Error(`Container element "${containerSelector}" not found`);
    }
    
    this._initProgressBar();
  }
  
  /**
   * Initialize navigation progress bar
   * @private
   */
  _initProgressBar() {
    if (!document.querySelector('.navigation-progress')) {
      const progress = document.createElement('div');
      progress.className = 'navigation-progress';
      progress.setAttribute('role', 'progressbar');
      progress.setAttribute('aria-label', 'Progresso de navegação');
      progress.innerHTML = '<div class="navigation-progress-bar"></div>';
      document.body.insertBefore(progress, document.body.firstChild);
      this.progressBar = progress.querySelector('.navigation-progress-bar');
    } else {
      this.progressBar = document.querySelector('.navigation-progress-bar');
    }
  }

  /**
   * Load a view into the container
   * @param {Object} view - View configuration
   * @param {Function} view.render - Function that returns HTML string or DOM element
   * @param {Function} [view.mount] - Function called after view is mounted (receives container)
   * @param {Function} [view.cleanup] - Function called before view is unmounted
   * @param {Array<string>} [view.styles] - CSS files to load for this view
   * @param {string} [view.title] - Page title for this view
   * @param {string} [view.transition] - Transition type: 'fade', 'slide', 'scale'
   */
  async loadView(view) {
    try {
      // Show progress bar
      this._showProgress();
      
      // Add exit transition to current view
      if (this.container.firstElementChild) {
        await this._exitTransition();
      }

      // Cleanup previous view
      await this._cleanup();

      // Load CSS for this view
      if (view.styles && view.styles.length > 0) {
        await this._loadStyles(view.styles);
      }

      // Render view
      const content = await view.render();
      this._renderContent(content);

      // Update page title
      if (view.title) {
        document.title = `${view.title} - Guia Turístico`;
      }

      // Store current view and cleanup handler
      this.currentView = view;
      this.currentCleanup = view.cleanup;
      
      // Add enter transition
      await this._enterTransition(view.transition);

      // Mount view (initialize event handlers, etc.)
      if (view.mount) {
        await view.mount(this.container);
      }

      // Hide progress bar
      this._hideProgress();

      // Announce view change to screen readers
      this._announceViewChange(view.title || 'Nova página');

      // Scroll to top (smooth scroll respecting prefers-reduced-motion)
      this._scrollToTop();

    } catch (error) {
      console.error('(route-manager) Error loading view:', error);
      this._hideProgress();
      this._showError(error);
    }
  }

  /**
   * Show progress bar
   * @private
   */
  _showProgress() {
    if (this.progressBar) {
      this.progressBar.style.width = '0%';
      this.progressBar.classList.add('loading');
      // Simulate progress
      setTimeout(() => {
        if (this.progressBar) this.progressBar.style.width = '30%';
      }, 100);
      setTimeout(() => {
        if (this.progressBar) this.progressBar.style.width = '60%';
      }, 300);
    }
  }
  
  /**
   * Hide progress bar
   * @private
   */
  _hideProgress() {
    if (this.progressBar) {
      this.progressBar.style.width = '100%';
      this.progressBar.classList.remove('loading');
      setTimeout(() => {
        if (this.progressBar) this.progressBar.style.width = '0%';
      }, 300);
    }
  }
  
  /**
   * Add exit transition to current view
   * @private
   */
  async _exitTransition() {
    const element = this.container.firstElementChild;
    if (!element) return;
    
    const transitionClass = `view-transition-${this.transitionType}-exit`;
    element.classList.add(transitionClass);
    
    // Wait for animation to complete
    return new Promise(resolve => {
      setTimeout(resolve, 200); // Match CSS animation duration
    });
  }
  
  /**
   * Add enter transition to new view
   * @private
   */
  async _enterTransition(transition) {
    // Use view-specific transition or default
    const transitionType = transition || this.transitionType;
    const element = this.container.firstElementChild;
    if (!element) return;
    
    const transitionClass = `view-transition-${transitionType}-enter`;
    element.classList.add(transitionClass);
    
    // Remove class after animation
    setTimeout(() => {
      if (element) element.classList.remove(transitionClass);
    }, 300); // Match CSS animation duration
  }

  /**
   * Cleanup current view
   * @private
   */
  async _cleanup() {
    if (this.currentCleanup) {
      try {
        await this.currentCleanup();
      } catch (error) {
        console.error('(route-manager) Error during cleanup:', error);
      }
      this.currentCleanup = null;
    }
    this.currentView = null;
  }

  /**
   * Load CSS files for a view
   * @private
   * @param {Array<string>} stylePaths - Array of CSS file paths
   */
  async _loadStyles(stylePaths) {
    const promises = stylePaths.map(path => {
      // Skip if already loaded
      if (this.loadedStyles.has(path)) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        link.onload = () => {
          this.loadedStyles.add(path);
          resolve();
        };
        link.onerror = () => reject(new Error(`Failed to load CSS: ${path}`));
        document.head.appendChild(link);
      });
    });

    await Promise.all(promises);
  }

  /**
   * Render content into container
   * @private
   * @param {string|HTMLElement} content - HTML string or DOM element
   */
  _renderContent(content) {
    if (typeof content === 'string') {
      this.container.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.container.innerHTML = '';
      this.container.appendChild(content);
    } else {
      throw new Error('Content must be a string or HTMLElement');
    }
  }

  /**
   * Show loading state
   * @private
   */
  _showLoading() {
    this.container.innerHTML = `
      <div class="route-loading" role="status" aria-live="polite">
        <div class="loading-spinner" aria-hidden="true">⏳</div>
        <p>Carregando página...</p>
      </div>
    `;
    this.container.setAttribute('aria-busy', 'true');
  }

  /**
   * Hide loading state
   * @private
   */
  _hideLoading() {
    this.container.removeAttribute('aria-busy');
  }

  /**
   * Show error state
   * @private
   * @param {Error} error - Error to display
   */
  _showError(error) {
    this.container.innerHTML = `
      <div class="route-error" role="alert">
        <h2>⚠ Erro ao Carregar Página</h2>
        <p><strong>Não foi possível carregar a página solicitada.</strong></p>
        <details>
          <summary>Detalhes do erro</summary>
          <pre>${error.message}</pre>
          <pre>${error.stack}</pre>
        </details>
        <button onclick="window.location.reload()" class="md3-button-filled">
          Recarregar Página
        </button>
        <button onclick="window.location.hash = '#/'" class="md3-button-outlined">
          Ir para Início
        </button>
      </div>
    `;
    this.container.removeAttribute('aria-busy');
  }

  /**
   * Announce view change to screen readers
   * @private
   * @param {string} title - Title of new view
   */
  _announceViewChange(title) {
    const announcement = document.createElement('div');
    announcement.className = 'sr-only';
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = `Navegou para: ${title}`;
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => announcement.remove(), 1000);
  }

  /**
   * Scroll to top of page
   * @private
   */
  _scrollToTop() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Get current view
   * @returns {Object|null} Current view configuration
   */
  getCurrentView() {
    return this.currentView;
  }

  /**
   * Preload a view (for performance optimization)
   * @param {Object} view - View configuration to preload
   */
  async preloadView(view) {
    if (view.styles && view.styles.length > 0) {
      await this._loadStyles(view.styles);
    }
  }

  /**
   * Destroy route manager (cleanup all resources)
   */
  async destroy() {
    await this._cleanup();
    this.container = null;
    this.loadedStyles.clear();
  }
}

// Export singleton instance
export const routeManager = new RouteManager('#app-content');
export default routeManager;
