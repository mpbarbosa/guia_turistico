/**
 * @fileoverview Deprecation Notice Module
 * Shows banner on old HTML pages with migration information to new SPA version
 * 
 * Displays a dismissible banner informing users about the deprecation timeline
 * and provides a direct link to migrate to the new application version.
 * 
 * Features:
 * - Dismissible banner with "remind me later" functionality
 * - LocalStorage-based persistence (re-shows after 3 days)
 * - Automatic date formatting for Brazilian locale
 * - Accessibility compliant (ARIA attributes)
 * 
 * @module legacy/deprecation
 */

(function() {
  'use strict';
  
  /**
   * Configuration for deprecation notice
   * @type {Object}
   * @property {string} newAppUrl - URL of the new SPA application
   * @property {string} deprecationDate - Date when deprecation was announced
   * @property {string} removalDate - Date when old pages will be removed
   * @property {string} storageKey - LocalStorage key for dismissal tracking
   */
  const DEPRECATION_CONFIG = {
    newAppUrl: 'app.html',
    deprecationDate: '2026-01-02',
    removalDate: '2026-01-16', // 2 weeks from deprecation
    storageKey: 'guia-turistico-deprecation-dismissed'
  };
  
  /**
   * Check if deprecation notice should be shown
   * @function
   * @returns {boolean} True if notice should be displayed
   * 
   * @example
   * if (shouldShowNotice()) {
   *   showBanner();
   * }
   */
  function shouldShowNotice() {
    // Check if user dismissed the notice
    const dismissed = localStorage.getItem(DEPRECATION_CONFIG.storageKey);
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      // Show again after 3 days
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      if (now - dismissedDate < threeDaysMs) {
        return false;
      }
    }
    
    // Check if we're already on the new app
    if (window.location.pathname.includes('app.html')) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Create deprecation banner HTML element
   * @function
   * @returns {HTMLElement} Banner element with content and actions
   */
  function createBanner() {
    const banner = document.createElement('div');
    banner.className = 'deprecation-banner';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'polite');
    
    banner.innerHTML = `
      <div class="deprecation-banner-content">
        <div class="deprecation-banner-icon" aria-hidden="true">⚠️</div>
        <div class="deprecation-banner-text">
          <div class="deprecation-banner-title">Esta página será descontinuada</div>
          <div class="deprecation-banner-message">
            Esta versão do Guia Turístico será removida em <strong>${formatDate(DEPRECATION_CONFIG.removalDate)}</strong>. 
            Por favor, migre para a nova versão do aplicativo para continuar usando todos os recursos.
          </div>
        </div>
        <div class="deprecation-banner-actions">
          <a href="${DEPRECATION_CONFIG.newAppUrl}" class="deprecation-banner-button">
            Ir para Nova Versão
          </a>
          <button class="deprecation-banner-dismiss" id="dismissDeprecation">
            Lembrar Depois
          </button>
        </div>
      </div>
    `;
    
    return banner;
  }
  
  /**
   * Format date to Brazilian format (DD/MM/YYYY)
   * @function
   * @param {string} dateString - ISO date string or parseable date
   * @returns {string} Formatted date in pt-BR locale
   * 
   * @example
   * formatDate('2026-01-16'); // "16/01/2026"
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  /**
   * Dismiss deprecation notice and store dismissal timestamp
   * Notice will re-appear after 3 days
   * @function
   * @returns {void}
   */
  function dismissNotice() {
    const banner = document.querySelector('.deprecation-banner');
    if (banner) {
      banner.style.animation = 'slideUp 0.3s ease-in';
      setTimeout(() => {
        banner.remove();
        document.body.classList.remove('has-deprecation-banner');
      }, 300);
    }
    
    // Store dismissal timestamp
    localStorage.setItem(DEPRECATION_CONFIG.storageKey, new Date().toISOString());
  }
  
  /**
   * Add CSS animation for slideUp effect
   * Creates a style element with @keyframes animation
   * @function
   * @returns {void}
   */
  function addSlideUpAnimation() {
    if (!document.querySelector('#deprecation-animations')) {
      const style = document.createElement('style');
      style.id = 'deprecation-animations';
      style.textContent = `
        @keyframes slideUp {
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Initialize deprecation notice system
   * Checks if notice should be shown and waits for DOM ready
   * @function
   * @returns {void}
   */
  function init() {
    if (!shouldShowNotice()) {
      return;
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
  
  /**
   * Show the deprecation banner to user
   * Loads CSS, creates banner, and sets up event handlers
   * @function
   * @returns {void}
   */
  function showBanner() {
    // Add CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'deprecation.css';
    document.head.appendChild(link);
    
    // Add slideUp animation
    addSlideUpAnimation();
    
    // Create and insert banner
    const banner = createBanner();
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.classList.add('has-deprecation-banner');
    
    // Add dismiss handler
    const dismissBtn = document.getElementById('dismissDeprecation');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', dismissNotice);
    }
    
    // Log for debugging
    console.log('(deprecation) Notice displayed - old page version');
    console.log(`(deprecation) Removal date: ${DEPRECATION_CONFIG.removalDate}`);
  }
  
  // Initialize
  init();
  
  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      shouldShowNotice,
      dismissNotice,
      formatDate
    };
  }
})();
