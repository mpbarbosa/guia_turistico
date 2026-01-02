# SPA Architecture Diagram

## High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                       Browser (User)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Navigates to URL
                    (app.html#/route)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         app.html                                │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  Navigation Bar (Hash Links)                          │      │
│  │  [Home] [Converter] [Tracking]                        │      │
│  └───────────────────────────────────────────────────────┘      │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  <main id="app-content">                              │      │
│  │    <!-- Views render here dynamically -->             │      │
│  │  </main>                                              │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                 │
│  <script type="module" src="app.js"></script>                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         app.js                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Import router, routeManager, views                 │        │
│  │  Register routes:                                   │        │
│  │    '/' → homeView                                   │        │
│  │    '/converter' → converterView                     │        │
│  │    '/tracking' → trackingView                       │        │
│  └─────────────────────────────────────────────────────┘        │
└──────────┬───────────────────────────────┬──────────────────────┘
           │                               │
           ▼                               ▼
┌─────────────────────┐        ┌─────────────────────────┐
│    router.js        │        │   route-manager.js      │
│                     │        │                         │
│  - Listen hashchange│        │  - Load view HTML       │
│  - Match routes     │────────│  - Mount view           │
│  - Call handlers    │        │  - Manage CSS           │
│  - Browser history  │        │  - Cleanup old view     │
│  - Navigation guards│        │  - Error handling       │
└─────────────────────┘        └────────┬────────────────┘
                                        │
                         Loads view module
                                        │
                                        ▼
                    ┌──────────────────────────────────┐
                    │         View Module              │
                    │  (home.js / converter.js /       │
                    │   tracking.js)                   │
                    │                                  │
                    │  render() → HTML string          │
                    │  mount() → Init event handlers   │
                    │  cleanup() → Free resources      │
                    └──────────────────────────────────┘
```

## Navigation Flow

```text
┌─────────────┐
│   User      │
│   clicks    │
│   link      │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  <a href="#/route">  │
│  Router intercepts   │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────┐
│  Hash changes           │
│  window.location.hash   │
└──────┬──────────────────┘
       │
       ▼
┌────────────────────────────┐
│  Router detects change     │
│  - Parse hash              │
│  - Match route             │
│  - Call beforeEach guard   │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│  Route handler called      │
│  routeManager.loadView()   │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│  RouteManager              │
│  1. Cleanup old view       │
│  2. Load CSS (if needed)   │
│  3. Render new view        │
│  4. Mount view             │
│  5. Update title           │
│  6. Call afterEach hook    │
└──────┬─────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  View displayed         │
│  User can interact      │
└─────────────────────────┘
```

## View Lifecycle

```text
┌─────────────┐
│   RENDER    │  Pure function, returns HTML string
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   INJECT    │  HTML injected into #app-content
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   MOUNT     │  mount() called:
└──────┬──────┘  - Attach event listeners
       │          - Initialize APIs
       │          - Start timers
       ▼
┌─────────────┐
│   ACTIVE    │  User interacts with view
└──────┬──────┘  - Events fire
       │          - Data updates
       │          - API calls
       ▼
┌─────────────┐
│  CLEANUP    │  cleanup() called:
└──────┬──────┘  - Remove listeners
       │          - Stop timers
       │          - Cancel API calls
       ▼
┌─────────────┐
│  UNMOUNT    │  HTML removed from DOM
└─────────────┘
```

## File Dependencies

```text
app.html
  └── app.js
       ├── router.js (singleton)
       ├── route-manager.js (singleton)
       └── views/
            ├── home.js
            │    └── WebGeocodingManager (external)
            ├── converter.js
            │    └── Nominatim API
            └── tracking.js
                 ├── WebGeocodingManager (external)
                 └── Speech Synthesis API

Shared Resources (loaded in app.html):
  ├── error-recovery.js
  ├── geolocation-banner.js
  ├── sidra.js (CDN)
  └── CSS files (typography, navigation, etc.)
```

## Data Flow

```text
                    ┌──────────────┐
                    │   Browser    │
                    │  Geolocation │
                    │     API      │
                    └──────┬───────┘
                           │
                           ▼
                ┌──────────────────────┐
                │  WebGeocodingManager │
                │   (guia_js library)  │
                └──────┬───────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Nominatim  │ │   IBGE/     │ │  Wikipedia  │
│     API     │ │   SIDRA     │ │     API     │
│             │ │    API      │ │             │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
                       ▼
                ┌──────────────┐
                │     View     │
                │   Updates    │
                │     DOM      │
                └──────────────┘
```

## Router Internals

```text
Router Class
├── routes: Map()
│    └── [path, { handler, pattern }]
│
├── currentRoute: { path, params, query }
│
├── Methods:
│    ├── register(path, handler)
│    ├── navigate(path, replace?)
│    ├── beforeEach(guard)
│    ├── afterEach(hook)
│    ├── notFound(handler)
│    └── _handleRouteChange()
│         ├── _getCurrentPath()
│         ├── _matchRoute()
│         └── _getQueryParams()
│
└── Event Listeners:
     ├── hashchange
     ├── load
     └── click (link interception)
```

## Route Manager Internals

```text
RouteManager Class
├── container: HTMLElement (#app-content)
├── currentView: View
├── currentCleanup: Function
├── loadedStyles: Set()
│
├── Methods:
│    ├── loadView(view)
│    │    ├── _cleanup()
│    │    ├── _loadStyles()
│    │    ├── _renderContent()
│    │    ├── view.mount()
│    │    └── _announceViewChange()
│    │
│    ├── _showLoading()
│    ├── _hideLoading()
│    ├── _showError()
│    └── preloadView(view)
│
└── View Interface:
     ├── title: string
     ├── styles: string[]
     ├── render(): string
     ├── mount(container): void
     └── cleanup(): void
```

## State Management

```text
┌────────────────────────────────────────┐
│          Application State             │
├────────────────────────────────────────┤
│  Router State (window.location.hash)  │
│    ├─ Current path                     │
│    ├─ Route parameters                 │
│    └─ Query string                     │
├────────────────────────────────────────┤
│  View State (per view instance)       │
│    ├─ Manager instances                │
│    ├─ Event handlers                   │
│    ├─ Timers/intervals                 │
│    └─ API controllers                  │
├────────────────────────────────────────┤
│  Shared State (globals)               │
│    ├─ Cache (localStorage)             │
│    ├─ Geolocation data                 │
│    └─ User preferences                 │
└────────────────────────────────────────┘
```

## Error Handling

```text
                    ┌─────────────┐
                    │   Error     │
                    │  Occurs     │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│  View Error    │ │  Router Error  │ │  Global Error  │
│  (view.mount)  │ │  (navigation)  │ │  (uncaught)    │
└───────┬────────┘ └───────┬────────┘ └───────┬────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Error Boundary │
                  │  - Log to console
                  │  - Show UI error
                  │  - Offer recovery
                  └─────────────────┘
```

## Browser Compatibility

```text
Modern Browsers (Full Support)
├── Chrome/Edge 90+
├── Firefox 88+
├── Safari 14+
└── Mobile browsers (iOS 14+, Android 5+)

Required Features:
├── ES6 Modules (import/export)
├── Template Literals
├── Arrow Functions
├── Promises/Async-Await
├── History API (hashchange)
└── DOM APIs (querySelector, classList)
```

## Performance Optimization

```text
Initial Load
├── Load app.html (1 request)
├── Load app.js (1 request)
├── Load router.js (1 request)
├── Load route-manager.js (1 request)
├── Load common CSS (12 requests, parallel)
└── Load initial view (1 request)
    Total: ~16 requests, ~50 KB

Navigation (After Initial Load)
├── Hash change (0 requests)
├── Load view module (1 request, cached)
├── Load view CSS (1 request, if not loaded)
└── API calls (as needed)
    Total: ~1-2 requests, ~5-10 KB
```

## Security Considerations

```text
✅ No eval() or innerHTML with user input
✅ CSP-friendly (no inline scripts)
✅ HTTPS required for geolocation
✅ API keys not in client code
✅ XSS prevention via DOM APIs
✅ CORS headers respected
```

---

**Architecture Version**: 1.0  
**Last Updated**: 2026-01-02  
**Status**: Production Ready
