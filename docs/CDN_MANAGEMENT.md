# CDN Dependency Management

## Overview

This application uses external dependencies from CDN (Content Delivery Network) services. This document outlines the strategy for managing these dependencies safely and reliably.

## CDN Dependencies

### Current External Dependencies

1. **sidra.js** - IBGE/SIDRA API integration
   - Source: `https://cdn.jsdelivr.net/gh/mpbarbosa/sidra.js@main/sidra.js`
   - Fallback: Not available (external library)
   - Used in: `index.html`, `loc-em-movimento.html`

2. **guia.js** - Geolocation and mapping utilities
   - Source: `https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js`
   - Fallback: Not available (external library)
   - Type: ES6 Module
   - Used in: `address-converter.html`, `loc-em-movimento.html`

## Security Considerations

### Subresource Integrity (SRI)

**Challenge**: These libraries are hosted on external repositories (GitHub via jsDelivr) and don't provide stable SRI hashes due to:
- Using `@main` branch (constantly changing)
- Using `@0.6.0-alpha` version (alpha/beta versions may update)

**Current Status**: ⚠️ SRI hashes not implemented due to dynamic nature of sources

**Risk Mitigation Strategies**:

1. **Version Pinning** (Recommended)
   ```html
   <!-- Instead of @main, use specific commit hash -->
   <script src="https://cdn.jsdelivr.net/gh/mpbarbosa/sidra.js@abc123/sidra.js"></script>
   ```

2. **Self-Hosting** (Most Secure)
   - Download libraries to `/libs` directory
   - Serve from same origin
   - Implement Content Security Policy (CSP)

3. **CDN Loader with Fallback** (Implemented)
   - Automatic fallback to local copies if available
   - Network detection
   - Error handling and user notification

### Content Security Policy (CSP)

**Recommended CSP Header**:
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' 
    https://servicodados.ibge.gov.br 
    https://api.wikimedia.org 
    https://nominatim.openstreetmap.org;
  font-src 'self';
```

**Implementation**:
- Add to web server configuration (Apache, Nginx, Cloudflare Workers)
- Or add via meta tag (less secure):
  ```html
  <meta http-equiv="Content-Security-Policy" content="...">
  ```

## Reliability Strategies

### 1. CDN Loader (Implemented)

File: `cdn-loader.js`

**Features**:
- Automatic CDN loading with timeout
- Fallback to local copies if available
- Error handling and user notification
- Network status detection
- Loading statistics

**Usage Example**:
```javascript
CDNLoader.load({
  url: 'https://cdn.jsdelivr.net/gh/mpbarbosa/sidra.js@main/sidra.js',
  fallback: '/libs/sidra.js',
  test: () => typeof SIDRA !== 'undefined',
  name: 'SIDRA.js'
});
```

### 2. Graceful Degradation

**Strategy**: Application should work (with reduced functionality) even if CDN fails

**Implementation**:
```javascript
// Check if library loaded
if (typeof SIDRA !== 'undefined') {
  // Use SIDRA functionality
  loadCityStatistics();
} else {
  // Show user-friendly message
  showMessage('Estatísticas não disponíveis. Verifique sua conexão.');
}
```

### 3. Local Fallback Files

**Directory Structure**:
```
src/
├── libs/              # Local fallback copies
│   ├── sidra.js       # SIDRA library fallback
│   └── guia.js        # Guia library fallback
├── cdn-loader.js      # CDN management
└── ...
```

**Setup Instructions**:
1. Download libraries:
   ```bash
   mkdir -p src/libs
   curl -o src/libs/sidra.js https://cdn.jsdelivr.net/gh/mpbarbosa/sidra.js@main/sidra.js
   curl -o src/libs/guia.js https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js
   ```

2. Update HTML files to use CDN loader:
   ```html
   <script src="cdn-loader.js"></script>
   <script>
     CDNLoader.load({
       url: 'https://cdn.jsdelivr.net/gh/mpbarbosa/sidra.js@main/sidra.js',
       fallback: '/libs/sidra.js',
       test: () => typeof SIDRA !== 'undefined',
       name: 'SIDRA.js'
     });
   </script>
   ```

3. Configure web server to serve `/libs` directory

### 4. Service Worker (Future Enhancement)

**Benefits**:
- Cache CDN resources locally
- Offline functionality
- Faster subsequent loads
- Network resilience

**Implementation** (Future):
```javascript
// service-worker.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

## Performance Optimization

### 1. Preconnect to CDN

Add to `<head>`:
```html
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
```

**Benefits**:
- Faster DNS resolution
- Faster TLS handshake
- Reduced latency

### 2. Async Loading

**Current Implementation**: ✅ Already async
```html
<script src="..." async></script>
```

### 3. Defer Non-Critical Scripts

```html
<script src="cdn-loader.js" defer></script>
```

## Error Handling

### User Notification

**Strategy**: Show clear, actionable messages when CDN fails

**Implementation**:
```javascript
window.addEventListener('cdn-status', (event) => {
  const { name, source, success } = event.detail;
  
  if (!success) {
    showNotification(
      `Não foi possível carregar ${name}. ` +
      `Algumas funcionalidades podem estar indisponíveis. ` +
      `Verifique sua conexão de internet.`,
      'warning'
    );
  }
});
```

### Retry Logic

**CDN Loader includes**:
- 2 retry attempts
- 1 second delay between retries
- 10 second timeout per attempt

## Testing

### Manual Testing Scenarios

1. **CDN Available**
   - ✅ Libraries load from CDN
   - ✅ Application works normally

2. **CDN Blocked**
   - Block `cdn.jsdelivr.net` in browser DevTools
   - ✅ Fallback to local copies
   - ✅ User sees notification

3. **Offline Mode**
   - Enable offline mode in DevTools
   - ✅ Uses cached/fallback resources
   - ✅ Clear offline indicator

4. **Slow Network**
   - Throttle network to "Slow 3G"
   - ✅ Loading indicators show
   - ✅ Timeout after 10 seconds
   - ✅ Fallback activates

### Automated Testing

**Test Script** (Future):
```javascript
describe('CDN Loading', () => {
  it('should load from CDN when online', async () => {
    const result = await CDNLoader.load({
      url: 'https://cdn.example.com/lib.js',
      test: () => typeof Lib !== 'undefined',
      name: 'TestLib'
    });
    expect(result).toBeTruthy();
  });

  it('should use fallback when CDN fails', async () => {
    // Mock fetch to fail
    jest.spyOn(window, 'fetch').mockRejectedValue(new Error('Network error'));
    
    const result = await CDNLoader.load({
      url: 'https://cdn.example.com/lib.js',
      fallback: '/libs/lib.js',
      test: () => typeof Lib !== 'undefined',
      name: 'TestLib'
    });
    expect(result).toBeTruthy();
  });
});
```

## Monitoring

### Metrics to Track

1. **CDN Success Rate**
   - Percentage of successful CDN loads
   - Target: >99%

2. **Fallback Usage**
   - How often fallbacks are used
   - Target: <1%

3. **Load Times**
   - Time to load libraries
   - Target: <2 seconds

4. **Failure Reasons**
   - Network errors
   - Timeouts
   - CORS issues

### Implementation

```javascript
// Track CDN statistics
window.addEventListener('cdn-status', (event) => {
  const { name, source, success } = event.detail;
  
  // Send to analytics (if available)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'cdn_load', {
      library: name,
      source: source,
      success: success
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[CDN Stats]', CDNLoader.getStats());
  }
});
```

## Recommendations

### Immediate Actions

1. ✅ **Implement CDN Loader** - Done
2. ⏳ **Create local fallback copies** - TODO
3. ⏳ **Add CSP headers** - TODO (requires server config)
4. ⏳ **Add preconnect hints** - TODO

### Short-term (1-2 weeks)

1. **Pin library versions**
   - Change `@main` to specific commit hash
   - Calculate SRI hashes for pinned versions
   - Update quarterly or when needed

2. **Set up monitoring**
   - Track CDN success rates
   - Alert on high failure rates

3. **Test fallback scenarios**
   - Manual testing with DevTools
   - Document user experience

### Long-term (1-3 months)

1. **Evaluate self-hosting**
   - Host libraries on same domain
   - Implement strong CSP
   - Set up CI/CD for library updates

2. **Implement Service Worker**
   - Cache strategies
   - Offline functionality
   - Background sync

3. **Performance optimization**
   - Analyze bundle sizes
   - Consider bundling dependencies
   - HTTP/2 push

## Resources

- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [jsDelivr Documentation](https://www.jsdelivr.com/documentation)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Changelog

| Date | Change | Rationale |
|------|--------|-----------|
| 2026-01-02 | Created CDN loader with fallback | Improve reliability and security |
| 2026-01-02 | Documented CDN strategy | Provide guidance for maintenance |

---

**Last Updated**: 2026-01-02  
**Owner**: Development Team  
**Status**: ⚠️ In Progress (fallbacks not yet implemented)
