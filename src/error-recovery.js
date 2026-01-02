/**
 * Error Recovery Module
 * Comprehensive error handling and retry mechanisms
 * 
 * Provides user-friendly error messages and recovery options
 * for geolocation failures, network errors, and API timeouts.
 */

// ========================================
// GLOBAL STATE
// ========================================

let retryAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Store retry callback for global access
let globalRetryCallback = null;

// ========================================
// ERROR MESSAGE CONSTANTS
// ========================================

const ERROR_MESSAGES = {
  // Geolocation errors (GeolocationPositionError codes)
  1: {
    title: 'Permissão Negada',
    message: 'Por favor, permita o acesso à localização nas configurações do navegador.',
    recoverable: false,
    action: 'Recarregar Página'
  },
  2: {
    title: 'Localização Indisponível',
    message: 'Verifique se o GPS está ativado e se você tem conexão com a internet.',
    recoverable: true,
    action: 'Tentar Novamente'
  },
  3: {
    title: 'Tempo Esgotado',
    message: 'Não foi possível obter sua localização no tempo esperado.',
    recoverable: true,
    action: 'Tentar Novamente'
  },
  
  // Network errors
  network: {
    title: 'Erro de Conexão',
    message: 'Verifique sua conexão com a internet e tente novamente.',
    recoverable: true,
    action: 'Tentar Novamente'
  },
  
  // API errors
  api_timeout: {
    title: 'Tempo Esgotado',
    message: 'O servidor demorou muito para responder. Tentando novamente...',
    recoverable: true,
    action: 'Tentando...'
  },
  
  api_error: {
    title: 'Erro no Servidor',
    message: 'Ocorreu um erro ao buscar os dados. Por favor, tente novamente.',
    recoverable: true,
    action: 'Tentar Novamente'
  },
  
  // Generic fallback
  unknown: {
    title: 'Erro Desconhecido',
    message: 'Ocorreu um erro inesperado. Por favor, tente novamente ou recarregue a página.',
    recoverable: true,
    action: 'Tentar Novamente'
  }
};

// ========================================
// PURE FUNCTIONS (Business Logic)
// ========================================

/**
 * Get error configuration based on error type
 * @param {number|string} errorCode - Error code or type
 * @returns {Object} Error configuration
 */
function getErrorConfig(errorCode) {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.unknown;
}

/**
 * Check if retry should be attempted
 * @param {number} attempts - Current retry attempts
 * @param {number} maxAttempts - Maximum retry attempts
 * @returns {boolean} True if should retry
 */
function shouldRetry(attempts, maxAttempts) {
  return attempts < maxAttempts;
}

/**
 * Calculate retry delay with exponential backoff
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
function calculateRetryDelay(attempt, baseDelay) {
  return baseDelay * Math.pow(2, attempt); // Exponential backoff: 2s, 4s, 8s...
}

// ========================================
// IMPURE FUNCTIONS (Side Effects)
// ========================================

/**
 * Handle geolocation error with recovery options
 * @param {GeolocationPositionError} error - Geolocation error object
 * @param {Function} retryCallback - Function to call on retry
 */
function handleGeolocationError(error, retryCallback) {
  console.error('(error-recovery) Geolocation error:', error);
  
  const errorConfig = getErrorConfig(error.code);
  
  // Store callback for global retry function
  globalRetryCallback = retryCallback;
  
  // Show error banner with recovery options
  if (typeof showErrorWithRecovery === 'function') {
    showErrorWithRecovery(
      errorConfig.title,
      errorConfig.message,
      errorConfig.recoverable,
      errorConfig.action
    );
  } else {
    // Fallback if banner function not available
    console.warn('(error-recovery) Banner function not available');
    alert(`${errorConfig.title}: ${errorConfig.message}`);
  }
}

/**
 * Handle network error with retry mechanism
 * @param {Error} error - Network error object
 * @param {Function} retryCallback - Function to call on retry
 */
function handleNetworkError(error, retryCallback) {
  console.error('(error-recovery) Network error:', error);
  
  const errorConfig = getErrorConfig('network');
  globalRetryCallback = retryCallback;
  
  if (typeof showErrorWithRecovery === 'function') {
    showErrorWithRecovery(
      errorConfig.title,
      errorConfig.message,
      errorConfig.recoverable,
      errorConfig.action
    );
  }
}

/**
 * Handle API error with retry mechanism
 * @param {Error} error - API error object
 * @param {Function} retryCallback - Function to call on retry
 */
function handleAPIError(error, retryCallback) {
  console.error('(error-recovery) API error:', error);
  
  const isTimeout = error.name === 'TimeoutError' || error.message.includes('timeout');
  const errorConfig = getErrorConfig(isTimeout ? 'api_timeout' : 'api_error');
  
  globalRetryCallback = retryCallback;
  
  if (typeof showErrorWithRecovery === 'function') {
    showErrorWithRecovery(
      errorConfig.title,
      errorConfig.message,
      errorConfig.recoverable,
      errorConfig.action
    );
  }
}

/**
 * Retry with exponential backoff
 * @param {Function} callback - Function to retry
 * @param {number} maxAttempts - Maximum retry attempts
 */
function retryWithBackoff(callback, maxAttempts = MAX_RETRY_ATTEMPTS) {
  if (!shouldRetry(retryAttempts, maxAttempts)) {
    console.warn('(error-recovery) Max retry attempts reached');
    
    if (typeof showErrorWithRecovery === 'function') {
      showErrorWithRecovery(
        'Não Foi Possível Conectar',
        'Tentamos várias vezes, mas não conseguimos obter sua localização. Por favor, verifique suas configurações e tente novamente.',
        false,
        'Recarregar Página'
      );
    }
    return;
  }
  
  const delay = calculateRetryDelay(retryAttempts, RETRY_DELAY);
  retryAttempts++;
  
  console.log(`(error-recovery) Retry attempt ${retryAttempts}/${maxAttempts} after ${delay}ms`);
  
  setTimeout(() => {
    if (typeof callback === 'function') {
      callback();
    }
  }, delay);
}

/**
 * Reset retry counter
 */
function resetRetryCounter() {
  retryAttempts = 0;
}

/**
 * Global retry function (called from banner buttons)
 */
function retryGeolocation() {
  console.log('(error-recovery) Manual retry triggered');
  resetRetryCounter();
  
  if (globalRetryCallback && typeof globalRetryCallback === 'function') {
    globalRetryCallback();
  } else {
    // Fallback: reload page
    console.warn('(error-recovery) No retry callback available, reloading page');
    location.reload();
  }
}

/**
 * Show error banner with recovery options
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {boolean} recoverable - Whether error is recoverable
 * @param {string} actionText - Action button text
 */
function showErrorWithRecovery(title, message, recoverable, actionText) {
  const containerId = 'geolocation-banner-container';
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error('(error-recovery) Banner container not found');
    return;
  }
  
  const retryButton = recoverable
    ? `<button class="banner-retry" onclick="retryGeolocation()" aria-label="${actionText}">${actionText}</button>`
    : `<button class="banner-retry" onclick="location.reload()" aria-label="${actionText}">${actionText}</button>`;
  
  const bannerHTML = `
    <div class="geolocation-banner error" role="alert" aria-live="assertive">
      <div class="geolocation-banner-icon" aria-hidden="true">✕</div>
      <div class="geolocation-banner-content">
        <div class="geolocation-banner-title">${title}</div>
        <div class="geolocation-banner-message">
          ${message}
          ${retryButton}
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = bannerHTML;
}

/**
 * Wrap async function with error handling
 * @param {Function} asyncFn - Async function to wrap
 * @param {Function} errorHandler - Error handler function
 * @returns {Function} Wrapped function
 */
function withErrorHandling(asyncFn, errorHandler) {
  return async function(...args) {
    try {
      return await asyncFn(...args);
    } catch (error) {
      if (typeof errorHandler === 'function') {
        errorHandler(error);
      } else {
        console.error('(error-recovery) Unhandled error:', error);
      }
      throw error; // Re-throw for upstream handling
    }
  };
}

// ========================================
// EXPORTS (for use in other modules)
// ========================================

// Make functions available globally for browser usage
if (typeof window !== 'undefined') {
  window.handleGeolocationError = handleGeolocationError;
  window.handleNetworkError = handleNetworkError;
  window.handleAPIError = handleAPIError;
  window.retryGeolocation = retryGeolocation;
  window.retryWithBackoff = retryWithBackoff;
  window.resetRetryCounter = resetRetryCounter;
  window.showErrorWithRecovery = showErrorWithRecovery;
  window.withErrorHandling = withErrorHandling;
}

// Export for CommonJS (Node.js testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleGeolocationError,
    handleNetworkError,
    handleAPIError,
    retryGeolocation,
    retryWithBackoff,
    resetRetryCounter,
    showErrorWithRecovery,
    withErrorHandling,
    // Pure functions for testing
    getErrorConfig,
    shouldRetry,
    calculateRetryDelay
  };
}
