/**
 * Toast Notification System
 * Provides user feedback for actions and events
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.init();
  }

  /**
   * Initialize toast container
   * @private
   */
  init() {
    // Create container if it doesn't exist
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.setAttribute('role', 'region');
      this.container.setAttribute('aria-label', 'Notificações');
      this.container.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Toast options
   * @param {string} options.type - Type: 'success', 'error', 'info' (default: 'info')
   * @param {number} options.duration - Duration in ms (default: 3000, 0 = permanent)
   * @param {boolean} options.closable - Show close button (default: true)
   * @returns {Object} Toast instance with dismiss() method
   */
  show(message, options = {}) {
    const {
      type = 'info',
      duration = 3000,
      closable = true
    } = options;

    const toast = this._createToast(message, type, closable);
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    // Return toast instance for manual control
    return {
      dismiss: () => this.dismiss(toast),
      element: toast
    };
  }

  /**
   * Show success toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms
   */
  success(message, duration = 3000) {
    return this.show(message, { type: 'success', duration });
  }

  /**
   * Show error toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms (0 = permanent)
   */
  error(message, duration = 5000) {
    return this.show(message, { type: 'error', duration });
  }

  /**
   * Show info toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms
   */
  info(message, duration = 3000) {
    return this.show(message, { type: 'info', duration });
  }

  /**
   * Create toast element
   * @private
   */
  _createToast(message, type, closable) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    // Icon
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = this._getIcon(type);
    toast.appendChild(icon);

    // Message
    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    toast.appendChild(messageEl);

    // Close button
    if (closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'toast-close';
      closeBtn.setAttribute('aria-label', 'Fechar notificação');
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', () => this.dismiss(toast));
      toast.appendChild(closeBtn);
    }

    return toast;
  }

  /**
   * Get icon for toast type
   * @private
   */
  _getIcon(type) {
    const icons = {
      success: '✓',
      error: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  /**
   * Dismiss a toast
   * @param {HTMLElement} toast - Toast element to dismiss
   */
  dismiss(toast) {
    if (!toast || !toast.parentElement) return;

    // Add exit animation
    toast.classList.add('toast-exit');

    // Remove after animation
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 200);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.toasts.forEach(toast => this.dismiss(toast));
  }

  /**
   * Destroy toast manager
   */
  destroy() {
    this.dismissAll();
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
    this.container = null;
    this.toasts = [];
  }
}

// Export singleton instance
export const toast = new ToastManager();
export default toast;
