# Copilot Instructions for Guia Turístico

## Project Overview

Guia Turístico is a tourist guide application that provides location-based information and statistics. The application supports multiple use cases:

1. **Travel Route Guide**: Informs users about municipalities they're passing through during travel, including statistical data (population, area) and regional history
2. **Police Chase Support**: Helps police inform about streets they're passing through during pursuits
3. **Location-based Services**: Provides information about nearby services (movies in shopping centers, etc.)
4. **Social Meeting Points**: Allows groups to share locations for meetups

## Architecture

### Web Application (`src/` directory)
- **Primary interface**: HTML5 web application with geolocation capabilities
- **Main files**:
  - `index.html` + `index.js` + `index.css` - Main tourist guide interface
  - `loc-em-movimento.html` + `loc-em-movimento.js` + `loc-em-movimento.css` - Location tracking while moving
  - `address-converter.html` - Address conversion utility
  - `guia-turistico.html` - Tourist guide specific page (legacy, minimal content)
  - `andarilho.js` - Core shared logic (legacy naming, contains impure functions)
- **Architecture**: HTML/CSS/JS separation (separate files for structure/style/behavior)
- **JavaScript**: Uses vanilla JavaScript with geolocation APIs
- **Styling**: CSS with mobile-first responsive design in separate .css files
- **Libraries**: Custom JavaScript libraries were external (guia_js, sidra) - removed from repo


## Key Technologies and APIs

- **Geolocation API**: Browser-based location tracking
- **IBGE API**: Brazilian Institute of Geography and Statistics for demographic data
- **SIDRA API**: IBGE's automatic data recovery system
- **Wikipedia API**: For historical and statistical information
- **Overpass API**: OpenStreetMap data for nearby locations
- **Web Speech API**: Text-to-speech functionality

### Custom Libraries
- **guia_js**: Core geolocation and mapping utilities (external submodule, removed from this repo)
- **sidra**: IBGE/SIDRA API integration (external submodule, removed from this repo)
- These libraries were previously git submodules but have been removed
- The application uses their functionality when they're available
- Follow existing patterns when extending these libraries

## File Structure Conventions

```
src/
├── *.html           # Web application pages
├── *.css            # Stylesheets (mobile-first design, separated from HTML)
├── *.js             # Application logic (separated from HTML)
├── libs/            # Custom JavaScript libraries (removed from this repo)
ibge_data/           # IBGE statistical data cache
docs/                # Project documentation
utils/               # Utility scripts
tests/               # Test files
│   ├── unit/        # Jest unit tests for pure functions
│   └── integration/ # Selenium integration tests for web UI
```

## Coding Standards and Patterns

### JavaScript
- Use **vanilla JavaScript** (no frameworks like React/Vue)
- Follow ES6+ standards where browser support allows
- Use async/await for API calls
- Implement proper error handling for geolocation and API failures
- Use descriptive variable names in Portuguese for domain-specific terms
- Global variables should be minimal and clearly documented
- **MUST be in separate .js files** (no inline scripts in HTML)
- **Separate pure functions from impure functions** (see REFERENTIAL_TRANSPARENCY.md)
- Pure functions (business logic) should be testable with Jest unit tests
- Impure functions (DOM manipulation, I/O) tested with Selenium integration tests

### HTML
- Use semantic HTML5 elements
- Ensure mobile first design principles
- Ensure mobile responsiveness with proper viewport meta tags
- Include accessibility attributes (ARIA labels, alt text)
- Progressive enhancement approach
- Ensure HTML5 Boilerplate compliance
- **CRITICAL**: Keep HTML, CSS, and JavaScript in SEPARATE files (see HTML_CSS_JS_SEPARATION.md)
- **NO inline styles or inline scripts** (except for critical above-the-fold CSS)
- Link external CSS with `<link>` and external JS with `<script src="">`

### CSS
- **Mobile-first responsive design**
- Use CSS Grid and Flexbox for layouts
- Consistent naming conventions for classes
- **MUST be in separate .css files** (no inline styles in HTML)
- Follow Material Design 3 principles where applicable
- Use CSS custom properties (CSS variables) for theming

## Common Patterns

### Geolocation Management
- Always check for geolocation support before using
- Implement proper error handling for permission denied/unavailable
- Use `WebGeocodingManager` class for consistent location tracking
- Cache location data to avoid repeated API calls

### API Integration
- IBGE/SIDRA API calls should include proper error handling
- Implement rate limiting for external API calls
- Cache statistical data when possible
- Use meaningful variable names for location data (municipio, siglaUf, etc.)

### User Interface
- Always provide loading states for async operations
- Show user-friendly error messages in Portuguese
- Implement proper button states (disabled during loading)
- Use consistent versioning display format

## Development Guidelines

### Code Change Rules
- Make **minimal changes** to achieve the desired functionality
- Preserve existing working code and patterns unless specifically required to change
- Focus on surgical, precise modifications rather than broad refactoring
- Always validate changes don't break existing functionality
- Test changes thoroughly before finalizing

### When Adding New Features
1. Focus on web application implementation
2. **Separate HTML, CSS, and JavaScript** into different files
3. Write **pure functions** for business logic (testable with Jest)
4. Write **impure functions** for side effects (DOM, I/O, APIs)
5. Add **unit tests** for pure functions (Jest)
6. Add **integration tests** for user workflows (Selenium)
7. Test geolocation functionality across different browsers
8. Ensure mobile responsiveness
9. Add proper error handling for network failures
10. Update version numbers in relevant files
11. Run test suite before committing: `npm run test:all`

### API Keys and Security
- Never commit API keys or sensitive data
- Use environment variables for configuration
- Implement proper CORS handling for web APIs

### Dependency Management
- Web components use vanilla JavaScript without package managers
- Custom libraries (guia_js, sidra) are external (not in this repo)
- No Android dependencies since Android support has been removed
- Node.js dependencies managed with npm (see package.json)
- Test dependencies: Jest (unit tests), Selenium (integration tests)

### Testing Approach
- **Unit Tests (Jest)**: Test pure functions with `npm run test:unit`
  - Located in `tests/unit/`
  - Test referentially transparent functions only
  - No mocking required for pure functions
  - Target: 70% code coverage minimum
- **Integration Tests (Selenium)**: Test user workflows with `npm run test:integration`
  - Located in `tests/integration/`
  - Test geolocation with various permission scenarios
  - Verify API integrations with different response formats
  - Test responsive design on multiple screen sizes
  - Validate accessibility features
- **CI/CD**: GitHub Actions workflow runs tests automatically
- **Run all tests**: `npm run test:all` before committing

### Performance Considerations
- Minimize geolocation API calls
- Implement proper caching for statistical data
- Optimize for mobile network conditions
- Use progressive loading for large datasets

### Build and Deployment
- Web: Static files served directly from `src/` directory
- Cloudflare Workers configuration in `wrangler.jsonc`
- Test locally before deploying changes
- Focus on web deployment since Android support has been removed
- No Docker setup required (legacy Android development files have been removed)

### Debugging and Troubleshooting
- Use browser developer tools for debugging web components
- Console logging should use meaningful prefixes (e.g., `(index)`, `(manager)`)
- Test geolocation functionality with different browser permissions
- Validate API responses and handle edge cases gracefully

## Common Issues and Solutions

### Geolocation Problems
- Always provide fallback options when geolocation fails
- Handle permission denied gracefully
- Consider accuracy limitations of device GPS

### API Integration
- IBGE API responses can vary; always validate data structure
- Wikipedia API may return multiple results; implement proper selection logic
- Handle network timeouts gracefully

### Mobile Compatibility
- Test touch interactions on mobile devices
- Ensure text is readable on small screens
- Consider offline functionality for core features

## Version Management
The project uses semantic versioning displayed in the UI. Update version numbers in:
- HTML files (inline version displays)
- JavaScript version objects
- Android app version codes
- Increment versioning numbering at every commit in main branch.

## Portuguese Language Context
This is a Brazilian application, so:
- User-facing text should be in Portuguese
- Use Brazilian geographic and administrative terms
- Consider local data formats (dates, numbers)
- Respect cultural context in user interface design

## Development Workflow
- Always analyze the issue thoroughly before making changes
- Run existing functionality tests when possible
- Make incremental changes and test frequently
- Use git best practices for commits and branches
- Document significant changes in comments when necessary

## Repository-Specific Notes
- Libraries (guia_js and sidra) were previously git submodules but have been removed
- The project uses Cloudflare Workers for deployment
- Android development files (run.sh, my_run.sh) are legacy and should be ignored
- Version numbers should be updated consistently across HTML files
- Focus on web-based geolocation and mapping functionality
- **NEW**: File naming convention uses hyphens (e.g., `loc-em-movimento.html`, not `loc_em_movimento.html`)
- **NEW**: HTML, CSS, and JavaScript are in separate files for each page
- **NEW**: Comprehensive test suite with Jest (unit) and Selenium (integration)

## Web UI Design Guidelines

### Material Design 3 Implementation

The project follows **Material Design 3 (Material You)** principles for modern, accessible, and consistent UI design.

#### Core Material Design 3 Principles
- **Dynamic Color**: Use M3 color system with primary, secondary, tertiary, and surface variants
- **Elevation**: Implement proper shadow tokens for depth and hierarchy
- **Shape**: Use rounded corners with consistent corner radius tokens (4dp, 8dp, 12dp, 16dp)
- **Typography**: Follow Material Design type scale (Display, Headline, Title, Body, Label)
- **Motion**: Smooth transitions with easing curves (cubic-bezier)
- **States**: Clear visual feedback for hover, focus, active, and disabled states

#### Material Design 3 Color System
```css
/* Primary colors */
--md-sys-color-primary: #1976d2;
--md-sys-color-on-primary: #ffffff;
--md-sys-color-primary-container: #d3e4f4;
--md-sys-color-on-primary-container: #001d36;

/* Secondary colors */
--md-sys-color-secondary: #4caf50;
--md-sys-color-on-secondary: #ffffff;
--md-sys-color-secondary-container: #c8e6c9;
--md-sys-color-on-secondary-container: #1b5e20;

/* Surface colors */
--md-sys-color-surface: #ffffff;
--md-sys-color-on-surface: #1c1b1f;
--md-sys-color-surface-variant: #f9f9f9;
--md-sys-color-on-surface-variant: #49454f;

/* Error colors */
--md-sys-color-error: #ba1a1a;
--md-sys-color-on-error: #ffffff;
```

#### Material Design 3 Elevation Tokens
```css
/* Elevation shadows (M3 spec) */
--md-sys-elevation-level0: none;
--md-sys-elevation-level1: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
--md-sys-elevation-level2: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15);
--md-sys-elevation-level3: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.3);
--md-sys-elevation-level4: 0 6px 10px 4px rgba(0, 0, 0, 0.15), 0 2px 3px 0 rgba(0, 0, 0, 0.3);
--md-sys-elevation-level5: 0 8px 12px 6px rgba(0, 0, 0, 0.15), 0 4px 4px 0 rgba(0, 0, 0, 0.3);
```

#### Material Design 3 Components

**Cards**
- Use elevation level 1 for default state
- Elevation level 2 on hover
- Border-radius: 12px
- Padding: 16px
- Smooth transition: `box-shadow 0.2s ease-in-out`

```css
.md3-card {
  background: var(--md-sys-color-surface);
  border-radius: 12px;
  box-shadow: var(--md-sys-elevation-level1);
  padding: 16px;
  transition: box-shadow 0.2s ease-in-out;
}

.md3-card:hover {
  box-shadow: var(--md-sys-elevation-level2);
}
```

**Buttons**
- Filled buttons: Primary action, elevated
- Outlined buttons: Secondary action
- Text buttons: Low-emphasis action
- FAB (Floating Action Button): Primary action, always visible
- Icon buttons: Compact actions

```css
/* Filled Button */
.md3-button-filled {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.md3-button-filled:hover {
  background: var(--md-sys-color-primary-dark);
  box-shadow: var(--md-sys-elevation-level1);
}

.md3-button-filled:disabled {
  background: rgba(0, 0, 0, 0.12);
  color: rgba(0, 0, 0, 0.38);
  cursor: not-allowed;
}
```

**Text Fields**
- Outlined style (default)
- Filled style (alternative)
- Error states with helper text
- Label animation
- Clear focus indicators

**Chips**
- Filter chips: Multiple selection
- Input chips: User-entered information
- Suggestion chips: AI-powered suggestions
- Assist chips: Related actions

### Modern UX Best Practices

#### Mobile-First Responsive Design
- **Start with mobile** (320px minimum width)
- **Breakpoints**:
  - Mobile: 320px - 599px
  - Tablet: 600px - 899px
  - Desktop: 900px - 1199px
  - Large Desktop: 1200px+
- Use relative units (`rem`, `em`, `%`, `vw`, `vh`)
- Flexible grids with CSS Grid and Flexbox
- Touch targets: Minimum 48x48px (iOS guidelines) or 44x44px
- Adequate spacing between interactive elements (8px minimum)

#### Accessibility (a11y)
- **WCAG 2.1 Level AA Compliance** (minimum)
- Semantic HTML5 elements (`<nav>`, `<main>`, `<article>`, `<section>`)
- ARIA labels and roles where semantic HTML is insufficient
- Keyboard navigation support (Tab, Shift+Tab, Enter, Space, Arrow keys)
- Focus visible indicators (`:focus-visible` pseudo-class)
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Alt text for images and icons
- Form labels and error messages
- Skip links for screen readers
- Reduced motion support (`prefers-reduced-motion` media query)

```css
/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Performance Optimization
- **Core Web Vitals**: Monitor LCP, FID, CLS
- Lazy loading for images and non-critical resources
- Defer non-critical JavaScript
- Minimize CSS and JavaScript
- Use CSS containment for performance isolation
- Optimize font loading with `font-display: swap`
- Implement service workers for offline functionality (progressive enhancement)
- Use IntersectionObserver for scroll-based loading
- Debounce/throttle scroll and resize events

```javascript
// Debounce pattern for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

#### Loading States and Feedback
- **Skeleton screens** for content loading
- Progress indicators (linear, circular) for operations
- Toast/snackbar notifications for feedback
- Optimistic UI updates with rollback on failure
- Empty states with clear calls-to-action
- Error states with recovery actions

```css
/* Skeleton loading animation */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### Touch and Gesture Support
- Swipe gestures for navigation
- Pull-to-refresh for data updates
- Pinch-to-zoom where appropriate
- Long-press for context menus
- Prevent accidental taps with debouncing
- Use `touch-action` CSS property for custom gestures

#### Internationalization (i18n)
- This application uses **Portuguese (pt-BR)** as primary language
- Externalize strings for easy translation
- Support RTL (right-to-left) languages in the future
- Date/time formatting with locale awareness
- Number formatting (currency, percentages)
- Use `lang` attribute on HTML elements

### Component Patterns

#### Navigation Patterns
- **Bottom Navigation** (mobile): 3-5 primary destinations
- **Navigation Drawer** (tablet/desktop): Extended navigation
- **Top App Bar**: Context and actions
- **Tabs**: Content organization within a page
- Breadcrumbs for hierarchical navigation

#### Layout Patterns
- **Grid Layout**: Content organization with CSS Grid
- **List Views**: Vertical scrolling content
- **Card Grids**: Masonry or equal-height cards
- **Split View**: Master-detail on tablets/desktop
- Sticky headers and footers where appropriate

#### Form Patterns
- Inline validation (real-time feedback)
- Clear error messages in Portuguese
- Grouped related fields
- Progressive disclosure (show advanced options on demand)
- Autosave with visual feedback
- Confirmation for destructive actions

#### Data Visualization
- Clear labels and legends
- Accessible color choices (colorblind-friendly)
- Responsive charts and graphs
- Tooltips for detailed information
- Export options where relevant

### State Management UI Patterns

#### Visual Feedback States
```css
/* Interactive element states */
.interactive-element {
  transition: all 0.2s ease;
}

.interactive-element:hover {
  /* Subtle elevation or color change */
}

.interactive-element:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.interactive-element:active {
  /* Press feedback - scale or background change */
  transform: scale(0.98);
}

.interactive-element:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  pointer-events: none;
}
```

#### Loading States
- Buttons show spinner during async operations
- Disable interactive elements during loading
- Show progress indicators for long operations
- Provide cancel options for lengthy processes

#### Error Handling UI
- Non-intrusive error messages (snackbars for minor errors)
- Modal dialogs for critical errors requiring user action
- Inline error messages for form validation
- Retry mechanisms with exponential backoff
- Offline indicators and queue management

### Typography Scale

Follow Material Design 3 type scale:

```css
/* Display - Largest text */
.md3-display-large { font-size: 57px; line-height: 64px; font-weight: 400; }
.md3-display-medium { font-size: 45px; line-height: 52px; font-weight: 400; }
.md3-display-small { font-size: 36px; line-height: 44px; font-weight: 400; }

/* Headline - High emphasis text */
.md3-headline-large { font-size: 32px; line-height: 40px; font-weight: 400; }
.md3-headline-medium { font-size: 28px; line-height: 36px; font-weight: 400; }
.md3-headline-small { font-size: 24px; line-height: 32px; font-weight: 400; }

/* Title - Medium emphasis text */
.md3-title-large { font-size: 22px; line-height: 28px; font-weight: 500; }
.md3-title-medium { font-size: 16px; line-height: 24px; font-weight: 500; }
.md3-title-small { font-size: 14px; line-height: 20px; font-weight: 500; }

/* Body - Main content text */
.md3-body-large { font-size: 16px; line-height: 24px; font-weight: 400; }
.md3-body-medium { font-size: 14px; line-height: 20px; font-weight: 400; }
.md3-body-small { font-size: 12px; line-height: 16px; font-weight: 400; }

/* Label - UI elements text */
.md3-label-large { font-size: 14px; line-height: 20px; font-weight: 500; }
.md3-label-medium { font-size: 12px; line-height: 16px; font-weight: 500; }
.md3-label-small { font-size: 11px; line-height: 16px; font-weight: 500; }
```

### Animation and Motion

Material Design 3 uses **easing curves** for natural motion:

```css
/* Standard easing */
--md-sys-motion-easing-standard: cubic-bezier(0.2, 0.0, 0, 1.0);

/* Emphasized easing - for important transitions */
--md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0.0, 0, 1.0);

/* Decelerated easing - entering elements */
--md-sys-motion-easing-decelerate: cubic-bezier(0.0, 0.0, 0, 1.0);

/* Accelerated easing - exiting elements */
--md-sys-motion-easing-accelerate: cubic-bezier(0.3, 0.0, 1.0, 1.0);

/* Duration tokens */
--md-sys-motion-duration-short1: 50ms;
--md-sys-motion-duration-short2: 100ms;
--md-sys-motion-duration-short3: 150ms;
--md-sys-motion-duration-short4: 200ms;
--md-sys-motion-duration-medium1: 250ms;
--md-sys-motion-duration-medium2: 300ms;
--md-sys-motion-duration-medium3: 350ms;
--md-sys-motion-duration-medium4: 400ms;
--md-sys-motion-duration-long1: 450ms;
--md-sys-motion-duration-long2: 500ms;
```

### Dark Mode Support (Future)

Prepare UI for dark mode implementation:
- Use CSS custom properties for colors
- Test color contrast in both themes
- Respect `prefers-color-scheme` media query
- Provide manual theme toggle
- Reduce brightness for dark surfaces
- Adjust elevation shadows for dark mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --md-sys-color-surface: #1c1b1f;
    --md-sys-color-on-surface: #e6e1e5;
    --md-sys-color-surface-variant: #49454f;
    /* Additional dark theme tokens */
  }
}
```

### Testing UI Components

When implementing or modifying UI components:
1. **Visual regression testing**: Compare screenshots before/after changes
2. **Cross-browser testing**: Chrome, Firefox, Safari, Edge
3. **Device testing**: Test on actual mobile devices when possible
4. **Accessibility audit**: Use browser dev tools (Lighthouse, axe DevTools)
5. **Performance testing**: Measure Core Web Vitals
6. **User testing**: Validate UX with real users when possible

### UI Consistency Checklist

Before completing UI changes, verify:
- [ ] Follows Material Design 3 guidelines
- [ ] Mobile-first responsive design
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Touch targets are adequate size (48x48px minimum)
- [ ] Loading states implemented
- [ ] Error states handled gracefully
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets requirements
- [ ] Typography scale used correctly
- [ ] Spacing follows 8px grid system
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Performance optimized (no layout thrashing)
- [ ] Works across target browsers
- [ ] Portuguese language strings used

## Tool Calling
You have the capability to call multiple tools in a single response. For maximum efficiency, whenever you need to perform multiple independent operations, ALWAYS invoke all relevant tools simultaneously rather than sequentially. Especially when exploring repository, reading files, viewing directories, validating changes or replying to comments.
<tool_calling>
You have the capability to call multiple tools in a single response. For maximum efficiency, whenever you need to perform multiple independent operations, ALWAYS invoke all relevant tools simultaneously rather than sequentially. Especially when exploring repository, reading files, viewing directories, validating changes or replying to comments.
</tool_calling>