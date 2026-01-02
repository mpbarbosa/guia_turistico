# UX Components Quick Reference

## 🎨 Typography

```html
<!-- Display (largest) -->
<div class="md3-display-large">Display Large</div>
<div class="md3-display-medium">Display Medium</div>
<div class="md3-display-small">Display Small</div>

<!-- Headlines -->
<h1 class="md3-headline-large">Headline Large</h1>
<h2 class="md3-headline-medium">Headline Medium</h2>
<h3 class="md3-headline-small">Headline Small</h3>

<!-- Titles -->
<h4 class="md3-title-large">Title Large</h4>
<h5 class="md3-title-medium">Title Medium</h5>
<h6 class="md3-title-small">Title Small</h6>

<!-- Body -->
<p class="md3-body-large">Body Large</p>
<p class="md3-body-medium">Body Medium</p>
<p class="md3-body-small">Body Small</p>

<!-- Labels -->
<button class="md3-label-large">Button</button>
```

## ⏳ Loading States

### Skeleton Screens
```html
<!-- Text skeletons -->
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-text skeleton-text-medium"></div>
<div class="skeleton skeleton-text skeleton-text-short"></div>

<!-- Heading skeleton -->
<div class="skeleton skeleton-heading"></div>

<!-- Card skeleton -->
<div class="skeleton skeleton-card"></div>
```

### Button Loading
```html
<button class="loading">Processing...</button>
```

```javascript
button.classList.add('loading');    // Start loading
button.classList.remove('loading'); // Stop loading
```

### Spinners
```html
<!-- Small spinner -->
<div class="spinner"></div>

<!-- Large spinner -->
<div class="spinner spinner-large"></div>

<!-- Inline spinner -->
Processing <span class="inline-spinner"></span>
```

### Loading Text
```html
<div class="loading-text">Loading data</div>
<div class="loading-dots">Processing</div>
```

### Progress Bars
```html
<!-- Determinate (0-100%) -->
<div class="progress-bar">
  <div class="progress-bar-fill" style="width: 60%;"></div>
</div>

<!-- Indeterminate (unknown duration) -->
<div class="progress-bar progress-bar-indeterminate">
  <div class="progress-bar-fill"></div>
</div>
```

## ♿ Accessibility

### Reduced Motion Classes
```html
<!-- These automatically respect prefers-reduced-motion -->
<div class="motion-safe-fade">Content</div>
<div class="motion-safe-slide">Content</div>
```

### Loading State ARIA
```html
<div role="status" aria-busy="true" aria-live="polite">
  <div class="loading-text">Loading...</div>
</div>
```

## 📦 Complete Loading Pattern

```html
<div id="content">
  <!-- Initial: Skeleton -->
  <div class="skeleton skeleton-card"></div>
  
  <!-- Loading: Hidden -->
  <div hidden>
    <h2 class="md3-headline-medium">Real Content</h2>
    <p class="md3-body-medium">Data here...</p>
  </div>
</div>

<button id="loadBtn">Load Data</button>
```

```javascript
const btn = document.getElementById('loadBtn');
const content = document.getElementById('content');

btn.addEventListener('click', async () => {
  // Show button loading
  btn.classList.add('loading');
  btn.disabled = true;
  
  try {
    const data = await fetchData();
    
    // Replace skeleton with real content
    content.innerHTML = `
      <h2 class="md3-headline-medium">${data.title}</h2>
      <p class="md3-body-medium">${data.text}</p>
    `;
  } catch (error) {
    content.innerHTML = '<p class="error">Error loading data</p>';
  } finally {
    // Remove button loading
    btn.classList.remove('loading');
    btn.disabled = false;
  }
});
```

## 🎯 Common Patterns

### Loading Card Content
```html
<div class="location-card">
  <!-- While loading -->
  <div class="skeleton skeleton-heading"></div>
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text skeleton-text-medium"></div>
  
  <!-- After loaded (replace above) -->
  <h3 class="md3-title-large">São Paulo</h3>
  <p class="md3-body-medium">População: 12.3M</p>
  <p class="md3-body-small">Área: 1,521 km²</p>
</div>
```

### Form Submission
```html
<form onsubmit="handleSubmit(event)">
  <input type="text" required>
  <button type="submit" id="submitBtn">
    <span class="button-text">Submit</span>
  </button>
</form>

<script>
async function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  
  btn.classList.add('loading');
  
  try {
    await submitForm(new FormData(e.target));
    showSuccess();
  } catch (error) {
    showError(error);
  } finally {
    btn.classList.remove('loading');
  }
}
</script>
```

### Progress Tracking
```javascript
const progressBar = document.querySelector('.progress-bar-fill');

// Update progress (0-100)
function updateProgress(percent) {
  progressBar.style.width = `${percent}%`;
}

// Use with async operations
async function processItems(items) {
  for (let i = 0; i < items.length; i++) {
    await processItem(items[i]);
    updateProgress(((i + 1) / items.length) * 100);
  }
}
```

## 💡 Tips

1. **Always pair button loading with disabled state**
   ```javascript
   button.classList.add('loading');
   button.disabled = true;
   ```

2. **Use skeleton for > 300ms loads**
   ```javascript
   if (expectedLoadTime > 300) {
     showSkeleton();
   }
   ```

3. **Remove skeleton before showing content**
   ```javascript
   content.innerHTML = ''; // Clear skeleton
   content.appendChild(realContent);
   ```

4. **Respect reduced motion**
   ```css
   /* Already handled automatically! */
   ```

5. **Use semantic typography**
   ```html
   <!-- Good: Semantic HTML gets automatic styling -->
   <h1>Title</h1>
   
   <!-- Better: When you need specific scale -->
   <h1 class="md3-display-large">Title</h1>
   ```

## 🔗 Resources

- Full Documentation: `docs/UX_IMPROVEMENTS.md`
- Demo Page: `src/ux-improvements-demo.html`
- CSS Files:
  - `src/typography.css`
  - `src/loading-states.css`
  - `src/reduced-motion.css`
