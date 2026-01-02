# Quick Start - SPA Development

## Getting Started with the SPA

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (Python, Node.js, or any HTTP server)
- Text editor or IDE

### Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/mpbarbosa/guia_turistico.git
   cd guia_turistico
   ```

2. **Start a local server**
   
   Using Python:
   ```bash
   cd src
   python3 -m http.server 8080
   ```
   
   Using Node.js:
   ```bash
   npx http-server src -p 8080
   ```
   
   Using PHP:
   ```bash
   cd src
   php -S localhost:8080
   ```

3. **Open in browser**
   ```
   http://localhost:8080/app.html
   ```

### Project Structure

```
src/
├── app.html              # SPA entry point - START HERE
├── app.js                # Application initialization
├── router.js             # Hash-based router
├── route-manager.js      # View lifecycle manager
│
├── views/                # View modules (one per page)
│   ├── home.js           # Home page
│   ├── converter.js      # Coordinate converter
│   └── tracking.js       # Real-time tracking
│
├── [shared JS]           # Shared utilities
│   ├── andarilho.js      # Legacy shared functions
│   ├── geolocation-banner.js
│   └── error-recovery.js
│
└── [CSS files]           # Styling (mobile-first)
    ├── typography.css
    ├── navigation.css
    └── [other CSS...]
```

## Development Workflow

### 1. Creating a New View

Create `src/views/my-view.js`:

```javascript
export default {
  title: 'My View Title',
  
  styles: [
    'my-view.css'  // Optional: view-specific CSS
  ],
  
  render() {
    // Return HTML as string
    return `
      <header>
        <h1>My View</h1>
      </header>
      <main>
        <p>Content here...</p>
      </main>
    `;
  },
  
  async mount(container) {
    // Initialize after rendering
    console.log('View mounted');
    
    // Add event listeners
    const button = container.querySelector('#my-button');
    button.addEventListener('click', this.handleClick.bind(this));
  },
  
  cleanup() {
    // Clean up resources
    console.log('View cleanup');
    // Remove event listeners, stop timers, etc.
  },
  
  handleClick() {
    console.log('Button clicked');
  }
};
```

### 2. Registering a Route

Edit `src/app.js`:

```javascript
import myView from './views/my-view.js';

router.register('/my-route', async () => {
  await routeManager.loadView(myView);
  updateActiveNavLink('/my-route');
});
```

### 3. Adding Navigation Link

Edit `src/app.html`:

```html
<nav class="app-navigation">
  <ul>
    <li><a href="#/">Home</a></li>
    <li><a href="#/my-route">My View</a></li>
  </ul>
</nav>
```

## Router API

### Navigation

```javascript
// Programmatic navigation
router.navigate('/converter');

// Replace current history entry
router.navigate('/converter', true);

// Go back
router.back();

// Go forward
router.forward();

// Get current route
const route = router.getCurrentRoute();
console.log(route.path, route.params, route.query);
```

### Route Parameters

```javascript
// Register route with parameters
router.register('/user/:id', async (params) => {
  console.log(params.id);  // Access parameter
  // Load view with user ID
});

// Navigate to parameterized route
router.navigate('/user/123');
```

### Query Strings

```javascript
// Navigate with query string
router.navigate('/search?q=restaurant&city=sao-paulo');

// Access query params in handler
router.register('/search', async (params, query) => {
  console.log(query.q);      // 'restaurant'
  console.log(query.city);   // 'sao-paulo'
});
```

### Navigation Guards

```javascript
// Before navigation (authentication, validation)
router.beforeEach((from, to, next) => {
  console.log(`Going from ${from} to ${to}`);
  
  // Allow navigation
  next(true);
  
  // Block navigation
  // next(false);
});

// After navigation (analytics, logging)
router.afterEach((route) => {
  console.log(`Navigated to ${route.path}`);
  // Send analytics event
});
```

## Route Manager API

### Loading Views

```javascript
import routeManager from './route-manager.js';

await routeManager.loadView({
  title: 'Page Title',
  styles: ['page.css'],
  render: () => '<h1>Hello</h1>',
  mount: (container) => {
    // Initialize
  },
  cleanup: () => {
    // Clean up
  }
});
```

### Preloading Views

```javascript
// Preload for performance
await routeManager.preloadView(converterView);
```

### Current View

```javascript
const currentView = routeManager.getCurrentView();
console.log(currentView);
```

## View Lifecycle

```
1. RENDER
   ↓ View generates HTML (pure function)
   
2. MOUNT
   ↓ HTML injected into DOM
   ↓ mount() called
   ↓ Event listeners attached
   ↓ API calls made
   
3. ACTIVE
   ↓ User interacts with view
   
4. CLEANUP
   ↓ cleanup() called
   ↓ Event listeners removed
   ↓ Resources freed
   
5. UNMOUNT
   ↓ HTML removed from DOM
```

## Best Practices

### View Organization

✅ **DO**: Keep views self-contained
```javascript
export default {
  render() { /* HTML */ },
  mount() { /* Setup */ },
  cleanup() { /* Teardown */ },
  _helperMethod() { /* Private helper */ }
};
```

❌ **DON'T**: Use global variables
```javascript
// Bad - pollutes global scope
window.myData = { };
```

### Event Listeners

✅ **DO**: Clean up listeners
```javascript
mount(container) {
  this.handleClick = () => { /* ... */ };
  container.querySelector('button').addEventListener('click', this.handleClick);
},

cleanup() {
  // Remove listener
  const button = document.querySelector('button');
  if (button) {
    button.removeEventListener('click', this.handleClick);
  }
}
```

### Async Operations

✅ **DO**: Cancel pending operations
```javascript
mount() {
  this.abortController = new AbortController();
  
  fetch('/api/data', { signal: this.abortController.signal })
    .then(/* ... */);
},

cleanup() {
  this.abortController.abort();
}
```

### CSS Scoping

✅ **DO**: Use view-specific classes
```css
/* converter.css */
.converter-container { }
.converter-form { }
```

❌ **DON'T**: Use generic classes that conflict
```css
/* Bad - too generic */
.container { }
.form { }
```

## Debugging

### Browser Console

```javascript
// Access router
window.__router.getCurrentRoute()

// Access route manager
window.__routeManager.getCurrentView()

// List all routes
window.__router.routes
```

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Sources tab
3. Add breakpoints in `src/router.js` or view files
4. Navigate to trigger breakpoints

### Common Issues

**Issue**: View not loading
- Check browser console for errors
- Verify view is imported in `app.js`
- Check route is registered correctly

**Issue**: Events not working
- Ensure `mount()` is called
- Check event listeners are attached to elements in the view
- Verify elements exist after render

**Issue**: Navigation not working
- Check hash format: `#/route` not `#route`
- Verify router is initialized
- Check for JavaScript errors

## Testing

### Manual Testing Checklist

```
Navigation:
☐ Click navigation links
☐ Browser back button
☐ Browser forward button
☐ Direct URL (app.html#/route)
☐ Bookmark and return

Views:
☐ All views load without errors
☐ Forms submit correctly
☐ Buttons perform actions
☐ Data displays correctly

Accessibility:
☐ Tab navigation works
☐ Screen reader announces changes
☐ Focus indicators visible
☐ All interactive elements reachable

Performance:
☐ Initial load < 3 seconds
☐ Navigation instant
☐ No layout shifts
☐ Smooth animations
```

### Unit Testing (Future)

```javascript
// Example test structure
import homeView from './views/home.js';

test('Home view renders correctly', () => {
  const html = homeView.render();
  expect(html).toContain('<h1>Guia Turístico</h1>');
});
```

## Deployment

### Static Hosting

The SPA works on any static host:

- **GitHub Pages**: Upload `src/` folder
- **Cloudflare Pages**: Connect repository
- **Netlify**: Drag and drop `src/` folder
- **Vercel**: Import repository

### Configuration

No special configuration needed! Hash routing works everywhere.

For pretty URLs (future):
- Add server rewrites to serve `app.html` for all routes
- Switch from hash routing to history API

## Resources

- [MDN Web Docs - ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [MDN - History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Material Design 3](https://m3.material.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Support

Questions? Check:
- `docs/SPA_MIGRATION_PHASE1.md` - Migration details
- `COPILOT_INSTRUCTIONS.md` - Development guidelines
- GitHub Issues - Report bugs or request features

---

Happy coding! 🚀
