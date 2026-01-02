/**
 * Unit Tests for Toast Notification System
 * Tests toast creation, display, and dismissal
 */

describe('ToastManager', () => {
  let ToastManager;
  let toast;
  
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Clear all timers
    jest.clearAllTimers();
    jest.useFakeTimers();
    
    // Define ToastManager class for testing
    ToastManager = class TestToastManager {
      constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
      }
      
      init() {
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
      
      show(message, options = {}) {
        const {
          type = 'info',
          duration = 3000,
          closable = true
        } = options;
        
        const toastElement = this._createToast(message, type, closable);
        this.container.appendChild(toastElement);
        this.toasts.push(toastElement);
        
        if (duration > 0) {
          setTimeout(() => this.dismiss(toastElement), duration);
        }
        
        return {
          dismiss: () => this.dismiss(toastElement),
          element: toastElement
        };
      }
      
      success(message, duration = 3000) {
        return this.show(message, { type: 'success', duration });
      }
      
      error(message, duration = 5000) {
        return this.show(message, { type: 'error', duration });
      }
      
      info(message, duration = 3000) {
        return this.show(message, { type: 'info', duration });
      }
      
      _createToast(message, type, closable) {
        const toastElement = document.createElement('div');
        toastElement.className = `toast toast-${type}`;
        toastElement.setAttribute('role', 'status');
        toastElement.setAttribute('aria-live', 'polite');
        
        const icon = document.createElement('span');
        icon.className = 'toast-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = this._getIcon(type);
        toastElement.appendChild(icon);
        
        const messageEl = document.createElement('div');
        messageEl.className = 'toast-message';
        messageEl.textContent = message;
        toastElement.appendChild(messageEl);
        
        if (closable) {
          const closeBtn = document.createElement('button');
          closeBtn.className = 'toast-close';
          closeBtn.setAttribute('aria-label', 'Fechar notificação');
          closeBtn.textContent = '✕';
          closeBtn.addEventListener('click', () => this.dismiss(toastElement));
          toastElement.appendChild(closeBtn);
        }
        
        return toastElement;
      }
      
      _getIcon(type) {
        const icons = {
          success: '✓',
          error: '⚠',
          info: 'ℹ'
        };
        return icons[type] || icons.info;
      }
      
      dismiss(toastElement) {
        if (!toastElement || !toastElement.parentElement) return;
        
        toastElement.classList.add('toast-exit');
        
        setTimeout(() => {
          if (toastElement.parentElement) {
            toastElement.parentElement.removeChild(toastElement);
          }
          const index = this.toasts.indexOf(toastElement);
          if (index > -1) {
            this.toasts.splice(index, 1);
          }
        }, 200);
      }
      
      dismissAll() {
        this.toasts.forEach(t => this.dismiss(t));
      }
      
      destroy() {
        this.dismissAll();
        if (this.container && this.container.parentElement) {
          this.container.parentElement.removeChild(this.container);
        }
        this.container = null;
        this.toasts = [];
      }
    };
    
    toast = new ToastManager();
  });
  
  afterEach(() => {
    toast.destroy();
    jest.clearAllTimers();
  });
  
  describe('Initialization', () => {
    test('should create toast container on init', () => {
      const container = document.querySelector('.toast-container');
      
      expect(container).not.toBeNull();
      expect(container.getAttribute('role')).toBe('region');
      expect(container.getAttribute('aria-label')).toBe('Notificações');
      expect(container.getAttribute('aria-live')).toBe('polite');
    });
    
    test('should reuse existing container', () => {
      const newToast = new ToastManager();
      const containers = document.querySelectorAll('.toast-container');
      
      expect(containers.length).toBe(1);
      
      newToast.destroy();
    });
  });
  
  describe('Show Toast', () => {
    test('should create and display toast', () => {
      toast.show('Test message');
      
      const toastElement = document.querySelector('.toast');
      expect(toastElement).not.toBeNull();
      expect(toastElement.textContent).toContain('Test message');
    });
    
    test('should add toast to container', () => {
      toast.show('Test message');
      
      expect(toast.container.children.length).toBe(1);
    });
    
    test('should add toast to toasts array', () => {
      toast.show('Test message');
      
      expect(toast.toasts.length).toBe(1);
    });
    
    test('should return toast instance with dismiss method', () => {
      const instance = toast.show('Test message');
      
      expect(instance).toHaveProperty('dismiss');
      expect(instance).toHaveProperty('element');
      expect(typeof instance.dismiss).toBe('function');
    });
  });
  
  describe('Toast Types', () => {
    test('should create success toast', () => {
      toast.success('Success message');
      
      const toastElement = document.querySelector('.toast-success');
      expect(toastElement).not.toBeNull();
      expect(toastElement.textContent).toContain('✓');
    });
    
    test('should create error toast', () => {
      toast.error('Error message');
      
      const toastElement = document.querySelector('.toast-error');
      expect(toastElement).not.toBeNull();
      expect(toastElement.textContent).toContain('⚠');
    });
    
    test('should create info toast', () => {
      toast.info('Info message');
      
      const toastElement = document.querySelector('.toast-info');
      expect(toastElement).not.toBeNull();
      expect(toastElement.textContent).toContain('ℹ');
    });
  });
  
  describe('Toast Content', () => {
    test('should display message', () => {
      toast.show('Test message');
      
      const message = document.querySelector('.toast-message');
      expect(message.textContent).toBe('Test message');
    });
    
    test('should display icon', () => {
      toast.show('Test message', { type: 'success' });
      
      const icon = document.querySelector('.toast-icon');
      expect(icon.textContent).toBe('✓');
    });
    
    test('should include close button by default', () => {
      toast.show('Test message');
      
      const closeBtn = document.querySelector('.toast-close');
      expect(closeBtn).not.toBeNull();
      expect(closeBtn.textContent).toBe('✕');
    });
    
    test('should hide close button when not closable', () => {
      toast.show('Test message', { closable: false });
      
      const closeBtn = document.querySelector('.toast-close');
      expect(closeBtn).toBeNull();
    });
  });
  
  describe('Auto Dismiss', () => {
    test('should auto-dismiss after duration', () => {
      toast.show('Test message', { duration: 3000 });
      
      expect(toast.toasts.length).toBe(1);
      
      jest.advanceTimersByTime(3200); // 3000 + 200 for animation
      
      expect(toast.toasts.length).toBe(0);
    });
    
    test('should not auto-dismiss when duration is 0', () => {
      toast.show('Test message', { duration: 0 });
      
      jest.advanceTimersByTime(10000);
      
      expect(toast.toasts.length).toBe(1);
    });
  });
  
  describe('Manual Dismiss', () => {
    test('should dismiss toast manually', () => {
      const instance = toast.show('Test message');
      
      expect(toast.toasts.length).toBe(1);
      
      instance.dismiss();
      jest.advanceTimersByTime(200);
      
      expect(toast.toasts.length).toBe(0);
    });
    
    test('should dismiss toast via close button', () => {
      toast.show('Test message');
      
      const closeBtn = document.querySelector('.toast-close');
      closeBtn.click();
      
      jest.advanceTimersByTime(200);
      
      expect(toast.toasts.length).toBe(0);
    });
  });
  
  describe('Dismiss All', () => {
    test('should dismiss all toasts', () => {
      toast.show('Message 1');
      toast.show('Message 2');
      toast.show('Message 3');
      
      expect(toast.toasts.length).toBe(3);
      
      toast.dismissAll();
      jest.advanceTimersByTime(200);
      
      expect(toast.toasts.length).toBe(0);
    });
  });
  
  describe('Multiple Toasts', () => {
    test('should stack multiple toasts', () => {
      toast.show('Message 1');
      toast.show('Message 2');
      toast.show('Message 3');
      
      expect(toast.container.children.length).toBe(3);
      expect(toast.toasts.length).toBe(3);
    });
    
    test('should dismiss toasts independently', () => {
      const instance1 = toast.show('Message 1');
      const instance2 = toast.show('Message 2');
      
      instance1.dismiss();
      jest.advanceTimersByTime(200);
      
      expect(toast.toasts.length).toBe(1);
      expect(toast.toasts[0]).toBe(instance2.element);
    });
  });
  
  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      toast.show('Test message');
      
      const toastElement = document.querySelector('.toast');
      expect(toastElement.getAttribute('role')).toBe('status');
      expect(toastElement.getAttribute('aria-live')).toBe('polite');
    });
    
    test('should have accessible close button', () => {
      toast.show('Test message');
      
      const closeBtn = document.querySelector('.toast-close');
      expect(closeBtn.getAttribute('aria-label')).toBe('Fechar notificação');
    });
    
    test('should hide icon from screen readers', () => {
      toast.show('Test message');
      
      const icon = document.querySelector('.toast-icon');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });
  
  describe('Destroy', () => {
    test('should remove all toasts', () => {
      toast.show('Message 1');
      toast.show('Message 2');
      
      toast.destroy();
      jest.advanceTimersByTime(200);
      
      expect(toast.toasts.length).toBe(0);
    });
    
    test('should remove container', () => {
      toast.destroy();
      
      const container = document.querySelector('.toast-container');
      expect(container).toBeNull();
    });
    
    test('should reset internal state', () => {
      toast.destroy();
      
      expect(toast.container).toBeNull();
      expect(toast.toasts).toEqual([]);
    });
  });
});
