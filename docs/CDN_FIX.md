# CDN Resource Fix Documentation

## Issue

The sidra.js library (loaded from CDN) was failing to load required municipality data due to incorrect path reference.

**Error:**
```
Failed to load resource: the server responded with a status of 404 (File not found)
libs/sidra/tab6579_municipios.json
```

## Root Cause

The sidra.js library (version from GitHub `mpbarbosa/sidra.js@main`) has a hardcoded path reference:

```javascript
// Line 245 in sidra.js
return await fetch("libs/sidra/tab6579_municipios.json")
```

However, in the GitHub repository, the file is located at the root level:
- **Expected by code:** `libs/sidra/tab6579_municipios.json`
- **Actual location:** `tab6579_municipios.json` (root)

## Solution

### Option 1: Local Copy (Implemented) ✅

Created the expected directory structure and placed a local copy of the file:

```bash
mkdir -p src/libs/sidra/
curl -s "https://cdn.jsdelivr.net/gh/mpbarbosa/sidra.js@main/tab6579_municipios.json" \
  -o src/libs/sidra/tab6579_municipios.json
```

**Pros:**
- ✅ Works immediately
- ✅ No external dependency
- ✅ Faster load time (local file)
- ✅ No CDN downtime issues

**Cons:**
- ❌ Need to manually update when upstream changes
- ❌ Increases repository size (+186KB)

### Option 2: Fix in sidra.js (Upstream)

Submit a pull request to fix the path in the upstream repository:

```javascript
// Change line 245 from:
return await fetch("libs/sidra/tab6579_municipios.json")

// To:
return await fetch("tab6579_municipios.json")
```

**Pros:**
- ✅ Fixes for everyone using the library
- ✅ Proper long-term solution

**Cons:**
- ❌ Requires upstream acceptance
- ❌ Takes time

### Option 3: Use Specific CDN Path

Reference the file directly from CDN with correct path:

```javascript
// Override in your own code
const SIDRA_DATA_URL = "https://cdn.jsdelivr.net/gh/mpbarbosa/sidra.js@main/tab6579_municipios.json";
```

## File Details

**File:** `tab6579_municipios.json`  
**Size:** 186KB  
**Content:** Municipality population estimate data from IBGE  
**Format:** JSON array with municipality codes and population data  
**Source:** https://github.com/mpbarbosa/sidra.js

**Sample Structure:**
```json
[
  {
    "codigo": "1100015",
    "nome": "Alta Floresta d'Oeste",
    "populacao": "24838"
  },
  ...
]
```

## Implementation Status

### Current Setup

✅ **Local Copy Implemented**
- File location: `src/libs/sidra/tab6579_municipios.json`
- Size: 186KB
- Last updated: 2026-01-02

✅ **Working Correctly**
- sidra.js can now find the file
- No more 404 errors
- IBGE population data loading successfully

### Maintenance

**Update Schedule:**
- Check for updates quarterly
- IBGE data typically updates annually
- Monitor upstream repository for changes

**Update Command:**
```bash
curl -s "https://cdn.jsdelivr.net/gh/mpbarbosa/sidra.js@main/tab6579_municipios.json" \
  -o src/libs/sidra/tab6579_municipios.json
```

## Related Files

**Using sidra.js:**
- `src/index.html` - Loads sidra.js from CDN
- `src/loc-em-movimento.html` - Loads sidra.js from CDN
- `src/index.js` - Uses sidra functionality

**CDN URLs:**
- **Main library:** `https://cdn.jsdelivr.net/gh/mpbarbosa/sidra.js@main/sidra.js`
- **Data file:** `https://cdn.jsdelivr.net/gh/mpbarbosa/sidra.js@main/tab6579_municipios.json`

## Testing

### Verify Fix

1. Open browser DevTools (F12)
2. Go to Network tab
3. Load `index.html`
4. Check for `tab6579_municipios.json` request
5. Should return **200 OK** (not 404)

### Console Check

```javascript
// Should not show error
// Expected: Municipality data loads successfully
displaySidraDadosParams(element, "PopEst", params);
```

## Future Recommendations

1. **Submit PR to upstream** - Fix the path in sidra.js
2. **Consider forking** - Maintain own version with fixes
3. **Add to build process** - Automated updates from CDN
4. **Cache strategy** - Service Worker caching for offline use
5. **Monitoring** - Alert if file becomes unavailable

## Alternative: Self-Host sidra.js

If CDN reliability is a concern, consider self-hosting:

```html
<!-- Instead of CDN -->
<script src="libs/sidra/sidra.js"></script>

<!-- Benefits: -->
<!-- - Full control over updates -->
<!-- - No external dependencies -->
<!-- - Faster load time (same origin) -->
<!-- - Can fix bugs immediately -->
```

## Known Issues

### Issue 1: Hardcoded Path
**Status:** Workaround implemented  
**Impact:** Low (resolved with local copy)  
**Permanent fix:** Awaiting upstream change

### Issue 2: Data Freshness
**Status:** Manual updates required  
**Impact:** Low (data updates annually)  
**Mitigation:** Quarterly update check

## Related Documentation

- [sidra.js GitHub Repository](https://github.com/mpbarbosa/sidra.js)
- [IBGE SIDRA API Documentation](https://servicodados.ibge.gov.br/api/docs)
- [jsDelivr CDN Documentation](https://www.jsdelivr.com/documentation)

---

**Status:** ✅ Fixed  
**Date:** 2026-01-02  
**Method:** Local copy in expected path  
**Verification:** Tested and working
