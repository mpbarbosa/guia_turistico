/**
 * Geolocation Banner Utility
 * Reusable functions for showing geolocation status banners
 * 
 * Pure functions for creating banner HTML and managing banner state
 */

// ========================================
// PURE FUNCTIONS (Business Logic)
// ========================================

/**
 * Create banner HTML structure
 * @param {string} type - Banner type: 'info', 'success', 'warning', 'error'
 * @param {string} icon - Icon character/emoji
 * @param {string} title - Banner title
 * @param {string} message - Banner message
 * @param {boolean} showSpinner - Whether to show loading spinner
 * @returns {string} HTML string for banner
 */
function createBannerHTML(type, icon, title, message, showSpinner = false) {
  const spinnerHTML = showSpinner 
    ? '<div class="geolocation-banner-spinner" role="progressbar" aria-label="Carregando"></div>' 
    : '';
  
  return `
    <div class="geolocation-banner ${type}" role="status" aria-live="polite">
      <div class="geolocation-banner-icon" aria-hidden="true">${icon}</div>
      <div class="geolocation-banner-content">
        <div class="geolocation-banner-title">${title}</div>
        <div class="geolocation-banner-message">${message}</div>
      </div>
      ${spinnerHTML}
    </div>
  `;
}

/**
 * Create permission request banner
 * @returns {string} HTML for permission request banner
 */
function createPermissionRequestBanner() {
  return createBannerHTML(
    'info',
    'ℹ️',
    'Solicitando Permissão de Localização',
    'Por favor, permita o acesso à sua localização para continuar.',
    true
  );
}

/**
 * Create loading location banner
 * @returns {string} HTML for loading location banner
 */
function createLoadingLocationBanner() {
  return createBannerHTML(
    'info',
    '📍',
    'Obtendo Localização',
    'Buscando sua localização atual...',
    true
  );
}

/**
 * Create location success banner
 * @returns {string} HTML for location success banner
 */
function createLocationSuccessBanner() {
  return createBannerHTML(
    'success',
    '✓',
    'Localização Obtida',
    'Sua localização foi determinada com sucesso.',
    false
  );
}

/**
 * Create permission denied banner with instructions
 * @returns {string} HTML for permission denied banner
 */
function createPermissionDeniedBanner() {
  return createBannerHTML(
    'error',
    '✕',
    'Permissão Negada',
    'Por favor, permita o acesso à localização nas configurações do navegador. Depois, recarregue a página ou <button class="banner-retry" onclick="location.reload()">clique aqui para tentar novamente</button>.',
    false
  );
}

/**
 * Create geolocation unavailable banner with troubleshooting
 * @returns {string} HTML for geolocation unavailable banner
 */
function createGeolocationUnavailableBanner() {
  return createBannerHTML(
    'error',
    '✕',
    'Localização Indisponível',
    'Verifique se o GPS está ativado e se você tem conexão com a internet. <button class="banner-retry" onclick="retryGeolocation()">Tentar Novamente</button>',
    false
  );
}

/**
 * Create timeout banner with auto-retry
 * @returns {string} HTML for timeout banner
 */
function createTimeoutBanner() {
  return createBannerHTML(
    'warning',
    '⚠',
    'Tempo Esgotado',
    'Não foi possível obter sua localização no tempo esperado. <button class="banner-retry" onclick="retryGeolocation()">Tentar Novamente</button>',
    false
  );
}

/**
 * Create position error banner based on error code
 * @param {number} errorCode - GeolocationPositionError code
 * @returns {string} HTML for appropriate error banner
 */
function createPositionErrorBanner(errorCode) {
  switch (errorCode) {
    case 1: // PERMISSION_DENIED
      return createPermissionDeniedBanner();
    case 2: // POSITION_UNAVAILABLE
      return createGeolocationUnavailableBanner();
    case 3: // TIMEOUT
      return createTimeoutBanner();
    default:
      return createBannerHTML(
        'error',
        '✕',
        'Erro de Localização',
        'Ocorreu um erro ao obter sua localização.',
        false
      );
  }
}

// ========================================
// IMPURE FUNCTIONS (Side Effects)
// ========================================

/**
 * Show a geolocation banner in a container
 * @param {string|HTMLElement} containerId - Container ID or element
 * @param {string} bannerHTML - Banner HTML string
 * @returns {HTMLElement|null} The created banner element
 */
function showGeolocationBanner(containerId, bannerHTML) {
  const container = typeof containerId === 'string' 
    ? document.getElementById(containerId) 
    : containerId;
  
  if (!container) {
    console.warn(`(geolocation-banner) Container not found: ${containerId}`);
    return null;
  }
  
  // Remove existing banner if present
  const existingBanner = container.querySelector('.geolocation-banner');
  if (existingBanner) {
    existingBanner.remove();
  }
  
  // Insert new banner at the top
  container.insertAdjacentHTML('afterbegin', bannerHTML);
  return container.querySelector('.geolocation-banner');
}

/**
 * Hide geolocation banner with fade animation
 * @param {string|HTMLElement} containerId - Container ID or element
 * @param {number} delay - Delay before hiding (ms)
 */
function hideGeolocationBanner(containerId, delay = 0) {
  const container = typeof containerId === 'string' 
    ? document.getElementById(containerId) 
    : containerId;
  
  if (!container) {
    return;
  }
  
  const banner = container.querySelector('.geolocation-banner');
  if (!banner) {
    return;
  }
  
  setTimeout(() => {
    banner.classList.add('hiding');
    setTimeout(() => {
      banner.remove();
    }, 300); // Match CSS animation duration
  }, delay);
}

/**
 * Show permission request banner and hide after delay
 * @param {string|HTMLElement} containerId - Container ID or element
 */
function showPermissionRequest(containerId) {
  const banner = createPermissionRequestBanner();
  showGeolocationBanner(containerId, banner);
}

/**
 * Show loading location banner
 * @param {string|HTMLElement} containerId - Container ID or element
 */
function showLoadingLocation(containerId) {
  const banner = createLoadingLocationBanner();
  showGeolocationBanner(containerId, banner);
}

/**
 * Show success banner and auto-hide
 * @param {string|HTMLElement} containerId - Container ID or element
 * @param {number} autoHideDelay - Auto-hide delay (ms), default 3000
 */
function showLocationSuccess(containerId, autoHideDelay = 3000) {
  const banner = createLocationSuccessBanner();
  showGeolocationBanner(containerId, banner);
  hideGeolocationBanner(containerId, autoHideDelay);
}

/**
 * Show error banner based on GeolocationPositionError
 * @param {string|HTMLElement} containerId - Container ID or element
 * @param {GeolocationPositionError} error - Geolocation error object
 */
function showLocationError(containerId, error) {
  const banner = createPositionErrorBanner(error.code);
  showGeolocationBanner(containerId, banner);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Pure functions
    createBannerHTML,
    createPermissionRequestBanner,
    createLoadingLocationBanner,
    createLocationSuccessBanner,
    createPermissionDeniedBanner,
    createGeolocationUnavailableBanner,
    createTimeoutBanner,
    createPositionErrorBanner,
    // Impure functions
    showGeolocationBanner,
    hideGeolocationBanner,
    showPermissionRequest,
    showLoadingLocation,
    showLocationSuccess,
    showLocationError
  };
}
