# Design Patterns Implementation Guide

## Overview

This guide documents the modern design patterns implemented in the Guia Turístico application. These patterns follow Material Design 3 guidelines and industry best practices for web applications.

## Files

- **CSS**: `src/design-patterns.css` (320 lines, 11KB)
- **JavaScript**: `src/design-patterns.js` (350 lines, 11KB)
- **Demo**: `src/design-patterns-demo.html` (interactive examples)

---

## Pattern 1: Empty State Pattern

### Purpose
Provide engaging visual feedback when no data is available, guiding users on next steps.

### Usage

```html
<div class="empty-state">
  <div class="empty-state-icon">
    <svg><!-- Location icon --></svg>
  </div>
  <h3 class="empty-state-title">Nenhuma localização ainda</h3>
  <p class="empty-state-description">
    Permita o acesso à sua localização para começar
  </p>
  <button class="empty-state-action">Ativar Localização</button>
</div>
```

### When to Use
- No restaurants found nearby
- Location permission not granted
- Cache is empty
- No history available

### Best Practices
- Use friendly, actionable language
- Provide clear call-to-action button
- Include relevant icon/illustration
- Explain why the state is empty
- Suggest what users can do next

---

## Pattern 2: Progressive Disclosure

### Purpose
Hide advanced features and technical details behind expandable sections, reducing cognitive load.

### Usage

```html
<div class="disclosure-section" id="technical-info" aria-expanded="false">
  <div class="disclosure-header">
    <h3 class="disclosure-title">Informações Técnicas</h3>
    <span class="disclosure-icon">▼</span>
  </div>
  <div class="disclosure-content">
    <p><strong>Cache:</strong> 15 itens</p>
    <p><strong>Precisão GPS:</strong> ±10 metros</p>
  </div>
</div>
```

```javascript
// Initialize (automatic with design-patterns.js)
const disclosure = new DisclosureSection('technical-info');

// Programmatic control
disclosure.expand();
disclosure.collapse();
disclosure.toggle();
```

### When to Use
- Cache information
- Technical details
- Advanced settings
- Debug information
- Additional metadata

### Best Practices
- Start collapsed for non-essential info
- Use descriptive titles
- Limit nesting to 2 levels
- Ensure keyboard accessibility
- Persist user preferences if possible

---

## Pattern 3: Snackbar Queue Pattern

### Purpose
Show non-intrusive notifications that automatically queue and dismiss, without overwhelming users.

### Usage

```javascript
// Simple message
window.snackbar.show('Operação concluída!');

// With type
window.snackbar.show('Erro ao processar', { type: 'error' });

// With action button
window.snackbar.show('Item excluído', {
  type: 'warning',
  duration: 5000,
  actionText: 'Desfazer',
  onAction: () => {
    // Undo logic here
  }
});

// Types: 'success', 'error', 'warning', 'info'
```

### Configuration Options

```javascript
{
  type: 'success',        // Visual style
  duration: 4000,         // Auto-dismiss time (ms), 0 = manual only
  actionText: 'Undo',    // Optional action button
  onAction: () => {}     // Action callback
}
```

### When to Use
- Success confirmations
- Error notifications
- Undo actions
- Background task completion
- Network status changes

### Best Practices
- Keep messages concise (< 2 lines)
- Use appropriate type for context
- Provide undo for destructive actions
- Don't interrupt user flow
- Queue multiple messages automatically

---

## Pattern 4: FAB (Floating Action Button)

### Purpose
Provide quick access to the primary action on a page.

### Usage

```html
<!-- Regular FAB -->
<button class="fab" onclick="primaryAction()">
  <svg class="fab-icon"><!-- Icon --></svg>
</button>

<!-- Extended FAB with label -->
<button class="fab fab-extended">
  <svg class="fab-icon"><!-- Icon --></svg>
  <span class="fab-label">Minha Localização</span>
</button>

<!-- Small FAB -->
<button class="fab fab-small">
  <svg class="fab-icon"><!-- Icon --></svg>
</button>
```

### When to Use
- Get current location (primary action)
- Quick add/create actions
- Always-visible primary action
- Mobile-first interfaces

### Best Practices
- Use for THE primary action only
- Position bottom-right corner
- Use extended variant sparingly
- Ensure 56x56px minimum size
- Hide on scroll (optional)
- Don't use multiple FABs per page

---

## Pattern 5: Bottom Sheet (Mobile) / Modal (Desktop)

### Purpose
Present additional options or content without navigating away from current context.

### Usage

```html
<div class="bottom-sheet" id="options-sheet" aria-hidden="true">
  <div class="bottom-sheet-handle"></div>
  <h3 class="bottom-sheet-title">Opções</h3>
  <div class="bottom-sheet-content">
    <!-- Content here -->
  </div>
</div>

<div class="bottom-sheet-overlay"></div>
```

```javascript
// Initialize
const sheet = new BottomSheet('options-sheet');

// Control
sheet.open();
sheet.close();
sheet.toggle();
```

### When to Use
- Filter options
- Share menu
- Additional actions
- Settings panel
- List of choices

### Best Practices
- Max height: 80vh (mobile)
- Include swipe-down gesture (mobile)
- Use handle for dragging affordance
- Close on overlay tap
- Support Escape key
- Disable body scroll when open
- Transform to modal on desktop

---

## Pattern 6: Micro-interactions

### Purpose
Provide subtle visual feedback for user actions, enhancing perceived responsiveness.

### Usage

```html
<!-- Press feedback -->
<button class="micro-press">Click Me</button>

<!-- Reveal animation -->
<div class="micro-reveal">
  <!-- Content animates in -->
</div>

<!-- Success indicator -->
<div class="micro-success"></div>

<!-- Pulse for attention -->
<div class="micro-pulse">Important!</div>

<!-- Shimmer loading effect -->
<div class="micro-shimmer"></div>
```

### Micro-interaction Types

1. **Press Feedback** - Button scale down on click
2. **Reveal Animation** - Fade + slide in from bottom
3. **Success Checkmark** - Animated checkmark with scale
4. **Pulse** - Gentle scale pulse for attention
5. **Shimmer** - Loading indicator

### When to Use
- Button clicks
- Card appearances
- Success states
- Loading states
- Attracting attention

### Best Practices
- Keep animations < 400ms
- Use easing curves (cubic-bezier)
- Don't overuse (subtle is better)
- Respect prefers-reduced-motion
- Use for feedback, not decoration

---

## Pattern 7: Retry with Exponential Backoff

### Purpose
Automatically retry failed operations with increasing delays, showing progress to users.

### Usage

```javascript
await window.retryManager.execute(
  'fetch-location',           // Unique key
  async () => {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  {
    maxAttempts: 3,           // Max retry attempts
    initialDelay: 1000,       // Start with 1s
    maxDelay: 10000,          // Cap at 10s
    onRetry: (attempt, delay) => {
      console.log(`Retry ${attempt}, waiting ${delay}ms`);
    }
  }
);
```

### Backoff Calculation

```
Delay = min(initialDelay * 2^(attempt-1), maxDelay)

Attempt 1: 1000ms
Attempt 2: 2000ms
Attempt 3: 4000ms
```

### When to Use
- API calls
- Geolocation requests
- Network operations
- External service calls

### Best Practices
- Show retry counter to users
- Provide manual retry button
- Don't retry for 4xx errors (client errors)
- Do retry for 5xx errors (server errors)
- Do retry for network failures
- Log retry attempts
- Reset counter on success

---

## Pattern 8: Optimistic UI

### Purpose
Show immediate feedback before server confirmation, rolling back on errors.

### Usage

```javascript
await window.optimisticUI.update(
  'like-button',
  // Optimistic update (runs immediately)
  () => {
    likeCount++;
    updateUI(likeCount);
  },
  // Actual update (async operation)
  async () => {
    const result = await api.like(itemId);
    return result;
  },
  // Rollback on error
  () => {
    likeCount--;
    updateUI(likeCount);
    showError('Failed to like');
  }
);
```

### When to Use
- Like/favorite buttons
- Simple form submissions
- Quick actions (archive, mark as read)
- Toggle switches
- Incremental operations

### When NOT to Use
- Critical operations (delete account)
- Payment transactions
- Complex multi-step forms
- When rollback is confusing

### Best Practices
- Show loading indicator
- Provide clear error feedback
- Always implement rollback
- Don't chain optimistic updates
- Log failures for debugging
- Consider offline queue

---

## Responsive Behavior

### Mobile (< 600px)
- Bottom sheets slide from bottom
- Snackbars full width
- FAB bottom-right, 24px spacing
- Touch targets 48x48px minimum
- Swipe gestures enabled

### Tablet (600px - 899px)
- Bottom sheets → Centered modals
- Same pattern behavior
- Increased spacing

### Desktop (900px+)
- Bottom sheets → Centered modals
- Hover states active
- Mouse interactions
- Keyboard shortcuts

---

## Accessibility

### WCAG 2.1 Compliance

All patterns meet:
- ✅ 2.1.1 Keyboard (Level A) - All functionality keyboard accessible
- ✅ 2.4.3 Focus Order (Level A) - Logical focus order
- ✅ 2.4.7 Focus Visible (Level AA) - Clear focus indicators
- ✅ 4.1.3 Status Messages (Level AA) - ARIA live regions

### ARIA Attributes

```html
<!-- Disclosure -->
<div aria-expanded="false" role="region">

<!-- Bottom Sheet -->
<div aria-hidden="true" role="dialog" aria-modal="true">

<!-- Snackbar -->
<div role="status" aria-live="polite">

<!-- FAB -->
<button aria-label="Obter localização atual">
```

### Keyboard Support

| Pattern | Keys | Action |
|---------|------|--------|
| Disclosure | Enter/Space | Toggle |
| Bottom Sheet | Escape | Close |
| Snackbar | Tab + Enter | Focus & activate action |
| FAB | Tab + Enter | Focus & activate |

---

## Performance

### CSS Performance
- Hardware-accelerated transforms
- Minimal reflows/repaints
- Efficient selectors
- No layout thrashing

### JavaScript Performance
- Event delegation where possible
- Debounced scroll handlers
- RequestAnimationFrame for animations
- Lazy initialization

### Bundle Size
- CSS: 11KB (~3KB gzipped)
- JS: 11KB (~4KB gzipped)
- Total: 22KB (~7KB gzipped)

---

## Browser Support

✅ Chrome/Edge 88+
✅ Firefox 85+
✅ Safari 14+
✅ iOS Safari 14+
✅ Chrome Android 88+

Graceful degradation for older browsers:
- Snackbars → alert() fallback
- Bottom sheets → full-page overlays
- FAB → regular button
- Animations → instant transitions

---

## Testing

### Demo Page
Open `src/design-patterns-demo.html` for interactive examples of all patterns.

### Unit Tests
```bash
npm test -- design-patterns.test.js
```

### Integration Tests
```bash
npm run test:integration -- design-patterns.spec.js
```

### Manual Testing Checklist

- [ ] Empty states display correctly
- [ ] Disclosure sections expand/collapse
- [ ] Snackbars queue properly
- [ ] FAB positioned correctly
- [ ] Bottom sheets swipe to close (mobile)
- [ ] Micro-interactions animate smoothly
- [ ] Retry logic works with failures
- [ ] Optimistic UI rolls back on error
- [ ] All patterns respect reduced motion
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes

---

## Common Issues & Solutions

### Issue: Snackbar not showing
**Solution:** Ensure design-patterns.js is loaded and snackbar container exists

### Issue: Bottom sheet won't close on swipe
**Solution:** Ensure touch events not prevented by parent element

### Issue: Disclosure animation jumpy
**Solution:** Set explicit max-height or use height: auto with transition

### Issue: FAB overlaps content
**Solution:** Add bottom padding to page content (100px)

### Issue: Optimistic UI doesn't rollback
**Solution:** Always implement rollback function, test error scenarios

---

## Migration Guide

### From Alerts to Snackbars

```javascript
// Before
alert('Operation successful');

// After
window.snackbar.show('Operation successful', { type: 'success' });
```

### From Confirm to Bottom Sheet

```javascript
// Before
if (confirm('Delete item?')) {
  deleteItem();
}

// After
const sheet = new BottomSheet('confirm-delete');
sheet.open();
// Handle in sheet buttons
```

---

## Future Enhancements

- [ ] Pull-to-refresh pattern
- [ ] Breadcrumb trail for navigation history
- [ ] Swipe actions on list items
- [ ] Drag-and-drop interface
- [ ] Contextual menus
- [ ] Advanced filtering UI
- [ ] Infinite scroll pattern

---

## References

- [Material Design 3 Patterns](https://m3.material.io/components)
- [Progressive Disclosure (NN/g)](https://www.nngroup.com/articles/progressive-disclosure/)
- [Optimistic UI Updates](https://uxdesign.cc/optimistic-1000-34d9eefe4c05)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-02  
**Author:** Guia Turístico Development Team
