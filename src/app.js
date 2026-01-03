/**
 * @fileoverview App Entry Point - SPA Application Initialization
 * Configures routes, registers views, and initializes the application.
 * 
 * This module sets up the single-page application (SPA) architecture with:
 * - Route registration and navigation
 * - Service worker for offline support
 * - Global error handling
 * - Navigation guards and hooks
 * 
 * @requires ./router.js
 * @requires ./route-manager.js
 * @requires ./toast.js
 * @requires ./views/home.js
 * @requires ./views/converter.js
 * @requires ./views/tracking.js
 */

import router from './router.js';
import routeManager from './route-manager.js';
import toast from './toast.js';

// Import views
import homeView from './views/home.js';
import converterView from './views/converter.js';

console.log("(app) Initializing Guia Turístico SPA...");

// Make toast available globally for convenience
window.toast = toast;

// Configure router with views
router
  .register('/', async () => {
    console.log("(app) Navigating to home");
    await routeManager.loadView(homeView);
    updateActiveNavLink('/');
  })
  .register('/converter', async () => {
    console.log("(app) Navigating to converter");
    await routeManager.loadView(converterView);
    updateActiveNavLink('/converter');
  })
  .setDefault('/')
  .notFound((path) => {
    console.warn(`(app) Route not found: ${path}`);
    routeManager.loadView({
      title: '404 - Página Não Encontrada',
      render: () => `
        <div class="route-error">
          <h1>404 - Página Não Encontrada</h1>
          <p>A página que você está procurando não existe.</p>
          <p>Caminho solicitado: <code>${path}</code></p>
          <button onclick="window.location.hash = '#/'" class="md3-button-filled">
            Ir para Início
          </button>
        </div>
      `,
      mount: () => {},
      cleanup: () => {}
    });
    updateActiveNavLink(null);
  });

// Navigation guard example (optional)
router.beforeEach((from, to, next) => {
  console.log(`(app) Navigating from ${from} to ${to}`);
  // You could add authentication checks here
  next(true);
});

// After navigation hook
router.afterEach((route) => {
  console.log(`(app) Navigation complete to ${route.path}`);
  // Analytics tracking could go here
  
  // Show success toast for major navigation (optional, can be removed if too noisy)
  // toast.info(`Navegou para: ${route.path}`, 2000);
});

/**
 * Update active navigation link styling
 * Adds 'current-page' class and aria-current attribute to active nav link
 * @param {string|null} path - Current route path (without '#')
 * @returns {void}
 * @example
 * updateActiveNavLink('/tracking'); // Marks tracking nav link as active
 */
function updateActiveNavLink(path) {
  const navLinks = document.querySelectorAll('.app-navigation a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const linkPath = href ? href.substring(1) : ''; // Remove '#'
    
    if (linkPath === path) {
      link.classList.add('current-page');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('current-page');
      link.removeAttribute('aria-current');
    }
  });
}

// Application lifecycle
window.addEventListener('DOMContentLoaded', () => {
  console.log("(app) DOM loaded, router will handle navigation");
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error("(app) Global error:", event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error("(app) Unhandled promise rejection:", event.reason);
});

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('(app) Service Worker registered:', reg);
        toast.success('App pronto para uso offline!', 2000);
        
        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              toast.info('Nova versão disponível! Recarregue a página.', 0);
            }
          });
        });
      })
      .catch(err => {
        console.log('(app) Service Worker registration failed:', err);
      });
  });
}

// Export router for debugging
window.__router = router;
window.__routeManager = routeManager;

console.log("(app) SPA initialization complete");

// Ensure initial route is loaded
// If the page has already loaded, manually trigger route handling
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log("(app) Page already loaded, triggering initial route...");
  // Use setTimeout to ensure all synchronous code completes first
  setTimeout(() => {
    // If no hash in URL, navigate to home
    if (!window.location.hash || window.location.hash === '#') {
      router.navigate('/', true);
    }
  }, 0);
}
