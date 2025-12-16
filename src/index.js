import { WebGeocodingManager } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ========================================
// IMPURE FUNCTIONS (Side Effects Layer)
// ========================================

function init() {
  console.log("(index) Initializing application...");
  const manager = initializeGeocodingManager();
  setupLocationUpdateHandlers(manager);
  setupCacheDisplayHandlers(manager);
  setupButtonHandlers();
  manager.getSingleLocationUpdate();
}

function initializeGeocodingManager() {
  const locationResult = document.getElementById("locationResult");
  console.log("(index) locationResult:", locationResult);
  console.log("(index) Creating WebGeocodingManager...");
  const manager = new WebGeocodingManager(document, {
    locationResult: locationResult.id
  });
  console.log("(index) manager:", manager);
  return manager;
}

function setupLocationUpdateHandlers(manager) {
  manager.subscribeFunction((currentPosition, newAddress, enderecoPadronizado) => {
    console.log(`(index) Location updated - currentPosition: ${currentPosition}, newAddress: ${newAddress}, enderecoPadronizado: ${enderecoPadronizado}`);
    
    const coordinatesText = extractCoordinatesText(currentPosition);
    renderToElement("lat-long-display", coordinatesText);
    
    if (newAddress) {
      const referencePlaceText = extractReferencePlaceText(newAddress);
      renderToElement("reference-place-display", referencePlaceText);
      
      const bairroText = extractBairroText(newAddress);
      renderToElement("bairro-value", bairroText);
    }
    
    if (enderecoPadronizado) {
      const municipioText = formatMunicipioText(enderecoPadronizado);
      renderToElement("endereco-padronizado-display", municipioText);
      renderToElement("municipio-value", municipioText);
      
      const sidraParams = createSidraParams(enderecoPadronizado);
      displaySidraDadosParams(document.getElementById("dadosSidra"), "PopEst", sidraParams);
    }
  });
}

function setupCacheDisplayHandlers(manager) {
  const cache = findAddressCache(manager);
  if (cache && cache.subscribeFunction) {
    cache.subscribeFunction(cacheData => {
      const cacheSize = calculateCacheSize(cacheData);
      renderToElement("tam-cache", cacheSize);
    });
  }
}

function setupButtonHandlers() {
  const findRestaurantsBtn = document.getElementById("findRestaurantsBtn");
  const cityStatsBtn = document.getElementById("cityStatsBtn");
  
  scheduleButtonEnabling([findRestaurantsBtn, cityStatsBtn], 2000);
  
  findRestaurantsBtn.addEventListener('click', findNearbyRestaurants);
  cityStatsBtn.addEventListener('click', getCityStats);
}

function renderToElement(elementId, content) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = content;
  }
}

function scheduleButtonEnabling(buttons, delay) {
  setTimeout(() => {
    buttons.forEach(button => {
      if (button) button.disabled = false;
    });
  }, delay);
}

function findNearbyRestaurants() {
  console.log("Finding nearby restaurants...");
}

function getCityStats() {
  console.log("Getting city statistics...");
}

// ========================================
// PURE FUNCTIONS (Business Logic Layer)
// ========================================

function extractCoordinatesText(currentPosition) {
  if (!currentPosition || !currentPosition.coords) {
    return "";
  }
  return `Latitude: ${currentPosition.coords.latitude}, Longitude: ${currentPosition.coords.longitude}`;
}

function extractReferencePlaceText(address) {
  if (!address) {
    return "";
  }
  return address.display_name 
    || address.displayName 
    || (typeof address === 'string' ? address : JSON.stringify(address));
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
  const siglaUf = enderecoPadronizado.siglaUf;
  return siglaUf ? `${municipio}, ${siglaUf}` : municipio;
}

function createSidraParams(enderecoPadronizado) {
  if (!enderecoPadronizado) {
    return null;
  }
  return {
    municipio: enderecoPadronizado.municipio, 
    siglaUf: enderecoPadronizado.siglaUf
  };
}

function calculateCacheSize(cacheData) {
  if (!cacheData) {
    return "0";
  }
  return `${cacheData.size || cacheData.length || 0}`;
}

function findAddressCache(manager) {
  if (!manager) {
    return null;
  }
  if (manager.addressCache) {
    return manager.addressCache;
  }
  if (manager.reverseGeocoder && manager.reverseGeocoder.addressCache) {
    return manager.reverseGeocoder.addressCache;
  }
  return null;
}
