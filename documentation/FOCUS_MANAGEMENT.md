# Focus Management and Modal Accessibility Guide

## Overview

This document provides comprehensive guidelines for implementing accessible modals, overlays, and dialogs in the Guia Turístico application. Following these patterns ensures WCAG 2.1 AA compliance and excellent keyboard navigation experience.

## Current Status

**No modals or overlays currently implemented** ✅

This documentation serves as a **reference for future development** to ensure accessibility from the start.

## Focus Management Principles

### 1. Focus Trap

When a modal opens, keyboard focus must be **trapped** within the modal:
- Tab key cycles through focusable elements **inside** modal only
- Cannot tab to page content behind modal
- Shift+Tab cycles backward within modal
- First focusable element receives focus on open
- Focus returns to trigger element on close

### 2. Keyboard Support

Required keyboard interactions:
- **Escape** - Close modal
- **Tab** - Move to next focusable element (circular within modal)
- **Shift+Tab** - Move to previous focusable element (circular)
- **Enter/Space** - Activate buttons

### 3. ARIA Attributes

Required ARIA attributes:
```html
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal description</p>
  <!-- Modal content -->
</div>
```

## Implementation Pattern

### HTML Structure

```html
<!-- Modal overlay (backdrop) -->
<div 
  class="modal-overlay" 
  aria-hidden="false"
  data-modal-id="example-modal"
>
  <!-- Modal dialog -->
  <div 
    class="modal-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    aria-describedby="modal-description"
    tabindex="-1"
  >
    <!-- Close button (always first focusable) -->
    <button 
      class="modal-close" 
      aria-label="Fechar modal"
      data-action="close"
    >
      ✕
    </button>
    
    <!-- Modal header -->
    <header class="modal-header">
      <h2 id="modal-title">Título do Modal</h2>
    </header>
    
    <!-- Modal body -->
    <div class="modal-body">
      <p id="modal-description">Descrição do modal...</p>
      
      <!-- Interactive content -->
      <input type="text" placeholder="Exemplo" />
      <button>Ação</button>
    </div>
    
    <!-- Modal footer -->
    <footer class="modal-footer">
      <button class="button-secondary" data-action="cancel">
        Cancelar
      </button>
      <button class="button-primary" data-action="confirm">
        Confirmar
      </button>
    </footer>
  </div>
</div>
```

### CSS (Material Design 3)

```css
/* Modal overlay (backdrop) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease-in-out;
}

/* Modal dialog */
.modal-dialog {
  background: var(--md-sys-color-surface, #ffffff);
  border-radius: 28px;
  box-shadow: var(--md-sys-elevation-level3);
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  position: relative;
}

.modal-dialog:focus {
  outline: none; /* Focus managed internally */
}

/* Close button */
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: var(--md-sys-color-on-surface);
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.08);
}

.modal-close:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

/* Modal sections */
.modal-header {
  padding: 24px 24px 16px;
}

.modal-body {
  padding: 0 24px 24px;
}

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-dialog {
    animation: none;
  }
}
```

### JavaScript (Focus Trap Implementation)

```javascript
/**
 * Modal Manager with Focus Trap
 * WCAG 2.1 AA compliant modal implementation
 */

class ModalManager {
  constructor(modalId) {
    this.modalId = modalId;
    this.modal = null;
    this.overlay = null;
    this.triggerElement = null;
    this.focusableElements = [];
    this.firstFocusable = null;
    this.lastFocusable = null;
  }
  
  /**
   * Open modal and trap focus
   * @param {HTMLElement} triggerElement - Element that opened the modal
   */
  open(triggerElement) {
    this.triggerElement = triggerElement;
    this.overlay = document.querySelector(`[data-modal-id="${this.modalId}"]`);
    this.modal = this.overlay?.querySelector('[role="dialog"]');
    
    if (!this.modal) {
      console.error(`Modal ${this.modalId} not found`);
      return;
    }
    
    // Show modal
    this.overlay.style.display = 'flex';
    this.overlay.setAttribute('aria-hidden', 'false');
    
    // Get focusable elements
    this.updateFocusableElements();
    
    // Focus first element (close button or first input)
    this.firstFocusable?.focus();
    
    // Add event listeners
    this.addEventListeners();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Announce to screen readers
    this.announce('Modal aberto');
  }
  
  /**
   * Close modal and restore focus
   */
  close() {
    if (!this.overlay) return;
    
    // Hide modal
    this.overlay.style.display = 'none';
    this.overlay.setAttribute('aria-hidden', 'true');
    
    // Remove event listeners
    this.removeEventListeners();
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to trigger element
    this.triggerElement?.focus();
    
    // Announce to screen readers
    this.announce('Modal fechado');
    
    // Clean up
    this.triggerElement = null;
  }
  
  /**
   * Update list of focusable elements
   */
  updateFocusableElements() {
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    this.focusableElements = Array.from(
      this.modal.querySelectorAll(focusableSelector)
    );
    
    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
  }
  
  /**
   * Handle Tab key for focus trap
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleTab(e) {
    if (e.key !== 'Tab') return;
    
    // Shift+Tab on first element -> go to last
    if (e.shiftKey && document.activeElement === this.firstFocusable) {
      e.preventDefault();
      this.lastFocusable?.focus();
    }
    // Tab on last element -> go to first
    else if (!e.shiftKey && document.activeElement === this.lastFocusable) {
      e.preventDefault();
      this.firstFocusable?.focus();
    }
  }
  
  /**
   * Handle Escape key to close modal
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleEscape(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  }
  
  /**
   * Handle click on overlay backdrop
   * @param {MouseEvent} e - Mouse event
   */
  handleOverlayClick(e) {
    if (e.target === this.overlay) {
      this.close();
    }
  }
  
  /**
   * Handle button clicks
   * @param {MouseEvent} e - Mouse event
   */
  handleButtonClick(e) {
    const action = e.target.closest('[data-action]')?.dataset.action;
    
    if (action === 'close' || action === 'cancel') {
      this.close();
    } else if (action === 'confirm') {
      this.confirm();
    }
  }
  
  /**
   * Confirm action (override in subclass)
   */
  confirm() {
    console.log('Modal confirmed');
    this.close();
  }
  
  /**
   * Add event listeners
   */
  addEventListeners() {
    this.boundHandleTab = this.handleTab.bind(this);
    this.boundHandleEscape = this.handleEscape.bind(this);
    this.boundHandleOverlayClick = this.handleOverlayClick.bind(this);
    this.boundHandleButtonClick = this.handleButtonClick.bind(this);
    
    document.addEventListener('keydown', this.boundHandleTab);
    document.addEventListener('keydown', this.boundHandleEscape);
    this.overlay.addEventListener('click', this.boundHandleOverlayClick);
    this.modal.addEventListener('click', this.boundHandleButtonClick);
  }
  
  /**
   * Remove event listeners
   */
  removeEventListeners() {
    document.removeEventListener('keydown', this.boundHandleTab);
    document.removeEventListener('keydown', this.boundHandleEscape);
    this.overlay?.removeEventListener('click', this.boundHandleOverlayClick);
    this.modal?.removeEventListener('click', this.boundHandleButtonClick);
  }
  
  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   */
  announce(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// Usage example:
// const confirmModal = new ModalManager('confirm-modal');
// confirmButton.addEventListener('click', () => confirmModal.open(confirmButton));
```

## Usage Examples

### Example 1: Confirmation Dialog

```javascript
class ConfirmDialog extends ModalManager {
  constructor(modalId, onConfirm) {
    super(modalId);
    this.onConfirm = onConfirm;
  }
  
  confirm() {
    if (typeof this.onConfirm === 'function') {
      this.onConfirm();
    }
    this.close();
  }
}

// Usage
const deleteConfirm = new ConfirmDialog('delete-confirm', () => {
  console.log('Item deleted');
});

deleteButton.addEventListener('click', () => {
  deleteConfirm.open(deleteButton);
});
```

### Example 2: Form Dialog

```javascript
class FormDialog extends ModalManager {
  constructor(modalId, onSubmit) {
    super(modalId);
    this.onSubmit = onSubmit;
  }
  
  confirm() {
    const form = this.modal.querySelector('form');
    if (form && form.checkValidity()) {
      const formData = new FormData(form);
      if (typeof this.onSubmit === 'function') {
        this.onSubmit(formData);
      }
      this.close();
    }
  }
}
```

## Testing Checklist

### Keyboard Navigation
- [ ] Tab cycles through modal elements only
- [ ] Shift+Tab cycles backward
- [ ] First element focused on open
- [ ] Last element wraps to first
- [ ] First element wraps to last (shift)
- [ ] Escape closes modal
- [ ] Focus returns to trigger on close

### Screen Reader
- [ ] Modal announced when opened
- [ ] Modal role communicated
- [ ] Title read first
- [ ] Description read after title
- [ ] Close announced
- [ ] Trigger element focused after close

### Visual
- [ ] Backdrop visible
- [ ] Modal centered
- [ ] Close button visible
- [ ] Focus indicators clear
- [ ] Animations smooth
- [ ] Reduced motion respected

### Mouse/Touch
- [ ] Click backdrop closes modal
- [ ] Close button works
- [ ] Modal doesn't close on content click
- [ ] Buttons work as expected

## WCAG 2.1 Requirements

### Required Success Criteria

**2.1.1 Keyboard (Level A)**
- ✅ All functionality keyboard accessible
- ✅ Focus trap prevents keyboard escape

**2.1.2 No Keyboard Trap (Level A)**
- ✅ User can exit modal with Escape
- ✅ Focus returns to trigger element

**2.4.3 Focus Order (Level A)**
- ✅ Focus order logical and predictable
- ✅ Circular navigation within modal

**2.4.7 Focus Visible (Level AA)**
- ✅ Focus indicators clearly visible
- ✅ 2px solid outline on all focusable elements

**4.1.2 Name, Role, Value (Level A)**
- ✅ role="dialog" on modal
- ✅ aria-modal="true" indicates modal
- ✅ aria-labelledby links to title
- ✅ aria-describedby links to description

**4.1.3 Status Messages (Level AA)**
- ✅ Screen reader announcement on open/close
- ✅ role="status" for announcements

## Common Pitfalls to Avoid

### ❌ Don't Do This

**1. No Focus Trap**
```javascript
// BAD: User can tab out of modal
function openModal() {
  modal.style.display = 'block';
  // No focus management!
}
```

**2. Missing ARIA**
```html
<!-- BAD: No semantic information -->
<div class="modal">
  <h2>Title</h2>
</div>
```

**3. No Return Focus**
```javascript
// BAD: Focus lost after close
function closeModal() {
  modal.style.display = 'none';
  // Trigger element not focused!
}
```

**4. Hardcoded Focusable Selectors**
```javascript
// BAD: Misses custom focusable elements
const focusable = modal.querySelectorAll('button, a');
```

### ✅ Do This Instead

**1. Implement Focus Trap**
```javascript
// GOOD: Focus trapped in modal
class ModalManager {
  handleTab(e) {
    // Circular focus navigation
  }
}
```

**2. Complete ARIA**
```html
<!-- GOOD: Full semantic information -->
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="title"
  aria-describedby="desc"
>
```

**3. Return Focus**
```javascript
// GOOD: Focus returns to trigger
close() {
  modal.style.display = 'none';
  this.triggerElement?.focus();
}
```

**4. Comprehensive Selector**
```javascript
// GOOD: Catches all focusable elements
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');
```

## Future Considerations

### Alert Dialogs (role="alertdialog")

For urgent alerts that interrupt workflow:
```html
<div 
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="alert-title"
  aria-describedby="alert-desc"
>
  <h2 id="alert-title">Atenção</h2>
  <p id="alert-desc">Ação irreversível!</p>
</div>
```

**Difference from dialog:**
- More assertive announcement
- Usually simpler (OK/Cancel only)
- Cannot be dismissed by clicking backdrop
- Escape should prompt confirmation

### Non-Modal Overlays

For tooltips, popovers that don't trap focus:
```html
<div 
  role="tooltip"
  aria-describedby="element-id"
>
  Informação adicional
</div>
```

**No focus trap needed** - user can interact with page

### Mobile Considerations

On mobile devices:
- Larger touch targets (min 44x44px)
- Swipe down to close
- Full-screen on small viewports
- Virtual keyboard handling

## Resources

### Specifications
- [ARIA Authoring Practices - Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Testing Tools
- **Keyboard**: Manual testing with Tab/Shift+Tab/Escape
- **Screen Reader**: NVDA (Windows), VoiceOver (Mac), TalkBack (Android)
- **Automated**: axe DevTools, Lighthouse

### Libraries (if needed)
- **focus-trap**: Lightweight focus trap utility
- **a11y-dialog**: Accessible dialog component
- **React**: Built-in focus management hooks

## Summary

When implementing modals in the future:

1. ✅ **Use ModalManager class** from this document
2. ✅ **Include all ARIA attributes**
3. ✅ **Implement focus trap**
4. ✅ **Return focus on close**
5. ✅ **Test with keyboard only**
6. ✅ **Test with screen reader**
7. ✅ **Follow WCAG 2.1 AA checklist**

This ensures excellent accessibility from day one! 🎉
