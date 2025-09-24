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
  - `index.html` - Main tourist guide interface
  - `loc_em_movimento.html` - Location tracking while moving
  - `address_converter.html` - Address conversion utility
  - `guia_turistico.html` - Tourist guide specific page
- **JavaScript**: Uses vanilla JavaScript with geolocation APIs
- **Styling**: CSS with mobile-first responsive design
- **Libraries**: Custom JavaScript libraries in `src/libs/` (guia_js, sidra)


## Key Technologies and APIs

- **Geolocation API**: Browser-based location tracking
- **IBGE API**: Brazilian Institute of Geography and Statistics for demographic data
- **SIDRA API**: IBGE's automatic data recovery system
- **Wikipedia API**: For historical and statistical information
- **Overpass API**: OpenStreetMap data for nearby locations
- **Web Speech API**: Text-to-speech functionality

### Custom Libraries
- **guia_js**: Core geolocation and mapping utilities (`src/libs/guia_js/`)
- **sidra**: IBGE/SIDRA API integration (`src/libs/sidra/`)
- These libraries provide the main functionality for the application
- Follow existing patterns when extending these libraries

## File Structure Conventions

```
src/
├── *.html           # Web application pages
├── *.css            # Stylesheets (mobile-first design)
├── *.js             # Application logic
├── libs/            # Custom JavaScript libraries
│   ├── guia_js/     # Core geolocation and mapping utilities
│   └── sidra/       # IBGE/SIDRA API integration
ibge_data/           # IBGE statistical data cache
docs/                # Project documentation
utils/               # Utility scripts
tests/               # Test files (Selenium tests for web UI)
```

## Coding Standards and Patterns

### JavaScript
- Use **vanilla JavaScript** (no frameworks like React/Vue)
- Follow ES6+ standards where browser support allows
- Use async/await for API calls
- Implement proper error handling for geolocation and API failures
- Use descriptive variable names in Portuguese for domain-specific terms
- Global variables should be minimal and clearly documented

### HTML
- Use semantic HTML5 elements
- Ensure mobile first design principles
- Ensure mobile responsiveness with proper viewport meta tags
- Include accessibility attributes (ARIA labels, alt text)
- Progressive enhancement approach

### CSS
- **Mobile-first responsive design**
- Use CSS Grid and Flexbox for layouts
- Consistent naming conventions for classes
- Avoid inline styles except for dynamic positioning

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

### When Adding New Features
1. Focus on web application implementation
2. Test geolocation functionality across different browsers
3. Ensure mobile responsiveness
4. Add proper error handling for network failures
5. Update version numbers in relevant files

### API Keys and Security
- Never commit API keys or sensitive data
- Use environment variables for configuration
- Implement proper CORS handling for web APIs

### Dependency Management
- Web components use vanilla JavaScript without package managers
- Custom libraries are in `src/libs/` directory
- No Android dependencies since Android support has been removed
- Consider compatibility when updating library versions

### Testing Approach
- Test geolocation with various permission scenarios
- Verify API integrations with different response formats
- Test responsive design on multiple screen sizes
- Validate accessibility features
- Selenium tests available in `tests/` directory for web UI testing
- Use appropriate testing strategy for web components

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

## Tool Calling
You have the capability to call multiple tools in a single response. For maximum efficiency, whenever you need to perform multiple independent operations, ALWAYS invoke all relevant tools simultaneously rather than sequentially. Especially when exploring repository, reading files, viewing directories, validating changes or replying to comments.