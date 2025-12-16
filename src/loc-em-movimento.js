/**
 * loc-em-movimento.js
 * JavaScript behavior for Location in Movement page
 * 
 * Separated from HTML following HTML/CSS/JS separation principles
 */

// ========================================
// IMPURE FUNCTIONS (Side Effects Layer)
// ========================================

async function init() {
  const initialized = await waitForDependencies();
  if (!initialized) {
    console.error("Failed to load required classes after multiple retries.");
    return;
  }

  log("(guia_turistico) guia.js loaded successfully.");

  setupInsertPositionButton();
  setupTextInputHandler();
  const manager = await initializeGeocodingManager();
  setupLocationUpdateHandlers(manager);
  setupSpeechQueueMonitoring(manager);
  setupCacheMonitoring();
  
  manager.startTracking();
}

async function waitForDependencies() {
  const maxRetries = 50;
  const retryDelay = 100;
  let retries = 0;

  while (!areDependenciesLoaded() && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    retries++;
  }

  return retries < maxRetries;
}

function areDependenciesLoaded() {
  return typeof WebGeocodingManager !== 'undefined' && 
         typeof PositionManager !== 'undefined' && 
         typeof AddressCache !== 'undefined';
}

function setupInsertPositionButton() {
  const insertPositionButton = document.getElementById("insertPositionButton");
  insertPositionButton.addEventListener("click", insertPosition);
}

function setupTextInputHandler() {
  const textInput = document.getElementById("text-input");
  textInput.addEventListener("change", updateTextInput);
}

async function initializeGeocodingManager() {
  const params = createGeocodingParams();
  return await WebGeocodingManager.createAsync(document, params);
}

function createGeocodingParams() {
  return {
    "locationResult": document.getElementById("locationResult"),
    "enderecoPadronizadoDisplay": document.getElementById("endereco-padronizado-display"),
    "referencePlaceDisplay": document.getElementById("reference-place-display")
  };
}

function setupLocationUpdateHandlers(manager) {
  manager.subscribeFunction((currentPosition, newAddress, enderecoPadronizado) => {
    updateCoordinatesDisplay(currentPosition);
    updateBairroDisplay(newAddress);
    updateMunicipioDisplays(enderecoPadronizado);
    updateSidraData(enderecoPadronizado);
  });
}

function updateCoordinatesDisplay(currentPosition) {
  if (!currentPosition || !currentPosition.coords) return;

  const coordsText = formatCoordinatesText(currentPosition.coords);
  renderToElement("lat-long-display", coordsText);
}

function updateBairroDisplay(newAddress) {
  if (!newAddress) return;

  const bairroText = extractBairroText(newAddress);
  renderToElement("bairro-value", bairroText);
}

function updateMunicipioDisplays(enderecoPadronizado) {
  if (!enderecoPadronizado) return;

  const enderecoCompleto = enderecoPadronizado.enderecoCompleto() || '';
  renderToElement("endereco-padronizado-display", enderecoCompleto);

  const municipioText = formatMunicipioText(enderecoPadronizado);
  renderToElement("municipio-value", municipioText);
}

function updateSidraData(enderecoPadronizado) {
  if (!enderecoPadronizado) return;

  const dadosSidraDiv = document.getElementById("dadosSidra");
  const params = createSidraParams(enderecoPadronizado);
  displaySidraDadosParams(dadosSidraDiv, "PopEst", params);
}

function setupSpeechQueueMonitoring(manager) {
  const speechQueue = findSpeechQueue(manager);
  
  if (!speechQueue) {
    console.warn("(loc_em_movimento) speechQueue not available - will not update tam-fila-fala");
    return;
  }

  if (typeof speechQueue.subscribeFunction === 'function') {
    subscribeSpeechQueueUpdates(speechQueue);
  } else {
    console.warn("(loc_em_movimento) speechQueue.subscribeFunction not available - using polling fallback");
    pollSpeechQueueSize(speechQueue);
  }
}

function subscribeSpeechQueueUpdates(speechQueue) {
  speechQueue.subscribeFunction(queue => {
    const size = calculateQueueSize(queue);
    renderToElement("tam-fila-fala", size.toString());
  });
}

function pollSpeechQueueSize(speechQueue) {
  setInterval(() => {
    const queueLength = speechQueue.length || (Array.isArray(speechQueue.queue) ? speechQueue.queue.length : 0);
    renderToElement("tam-fila-fala", queueLength.toString());
  }, 500);
}

function setupCacheMonitoring() {
  if (!AddressCache || typeof AddressCache.subscribeFunction !== 'function') {
    console.warn("(loc_em_movimento) addressCache not available - will not update tam-cache");
    return;
  }

  AddressCache.subscribeFunction(eventData => {
    const cacheSize = calculateCacheSize(eventData);
    renderToElement("tam-cache", cacheSize.toString());
  });
}

function renderToElement(elementId, content) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = content;
  }
}

// ========================================
// PURE FUNCTIONS (Business Logic Layer)
// ========================================

function formatCoordinatesText(coords) {
  return `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;
}

function extractBairroText(address) {
  if (!address) {
    return "Não disponível";
  }
  
  const bairro = address.suburb 
    || address.neighbourhood 
    || address.quarter 
    || address.residential 
    || address.address?.suburb 
    || address.address?.neighbourhood 
    || address.address?.quarter 
    || address.address?.residential;
  
  return bairro || "Não disponível";
}

function formatMunicipioText(enderecoPadronizado) {
  if (!enderecoPadronizado) {
    return "Não disponível";
  }
  
  const municipio = enderecoPadronizado.municipio || "Não disponível";
  const siglaUf = enderecoPadronizado.siglaUF;
  return siglaUf ? `${municipio}, ${siglaUf}` : municipio;
}

function createSidraParams(enderecoPadronizado) {
  if (!enderecoPadronizado) {
    return null;
  }
  return {
    "municipio": enderecoPadronizado.municipio,
    "siglaUf": enderecoPadronizado.siglaUF
  };
}

function findSpeechQueue(manager) {
  if (!manager.htmlSpeechSynthesisDisplayer) return null;
  if (!manager.htmlSpeechSynthesisDisplayer.speechManager) return null;
  return manager.htmlSpeechSynthesisDisplayer.speechManager.speechQueue || null;
}

function calculateQueueSize(queue) {
  if (!queue) {
    return 0;
  }
  if (typeof queue.size === 'function') {
    return queue.size();
  }
  if (Array.isArray(queue.queue)) {
    return queue.queue.length;
  }
  return 0;
}

function calculateCacheSize(eventData) {
  if (!eventData) {
    return 0;
  }
  return eventData.cacheSize || eventData.cache?.length || 0;
}

function insertPosition() {
  const position = { 
    "coords": { 
      "latitude": -23.55052, 
      "longitude": -46.633308, 
      "accuracy": 1 
    }, 
    "timestamp": Date.now() 
  };
  PositionManager.getInstance(position);
  const latLongDisplay = document.getElementById("lat-long-display");
  latLongDisplay.innerText = `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`;
}

function updateTextInput() {
  const textInput = document.getElementById("text-input");
  const dadosSidraDiv = document.getElementById("dadosSidra");
  textInput.value += "." + dadosSidraDiv.innerText;
}

// ========================================
// VERSION DISPLAY
// ========================================

async function displayVersionInfo() {
  const pageVersion = {
    major: 0,
    minor: 4,
    patch: 14,
    prerelease: 'alpha',
    status: 'unstable, pre-release',
    toString: function () {
      return `v${this.major}.${this.minor}.${this.patch}-${this.prerelease} (${this.status})`;
    }
  };

  let retries = 0;
  const maxRetries = 50;
  const retryDelay = 100;
  while (typeof guiaVersion === 'undefined' && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    retries++;
  }

  let guiaVerStr = '';
  if (typeof guiaVersion !== 'undefined' && typeof guiaVersion.toString === 'function') {
    guiaVerStr = 'guia.js ' + guiaVersion.toString();
  }
  
  const versionElement = document.getElementById('guia-version');
  if (versionElement) {
    versionElement.innerHTML = `${guiaVerStr}<br>HTML page ${pageVersion.toString()}`;
  }
}

// ========================================
// INITIALIZATION
// ========================================

window.addEventListener('DOMContentLoaded', () => {
  init();
  displayVersionInfo();
});
