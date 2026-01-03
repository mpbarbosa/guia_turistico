/**
 * @fileoverview Home View - Main landing page for Guia Turístico
 * Displays user's current location and provides access to nearby restaurants and city statistics
 * 
 * This view is loaded by the SPA router and uses the WebGeocodingManager from guia_js library
 * to obtain and display location information.
 * 
 * @module views/home
 * @requires https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js
 */

import { WebGeocodingManager } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js';

/**
 * Home view configuration object
 * @type {Object}
 * @property {string} title - Page title for document.title
 * @property {Array<string>} styles - CSS files to load for this view
 * @property {Function} render - Returns HTML string for view content
 * @property {Function} mount - Called after view is mounted to DOM
 * @property {Function} cleanup - Called before view is unmounted
 */
export default {
  title: 'Sua Localização',
  
  styles: [
    'index.css'
  ],
  
  /**
   * Render home view HTML
   * @returns {string} HTML string for home view
   */
  render() {
    return `
      <header>
        <h1>Guia Turístico</h1>
        <p>Descubra sua localização e encontre restaurantes e estatísticas da cidade próximos.</p>
        <p>
          <abbr title="Dados salvos localmente para acesso rápido" aria-label="Cache: dados salvos localmente">Cache</abbr>: 
          <span id="tam-cache" aria-live="polite">0</span> itens
        </p>
      </header>

      <nav aria-label="Ações da página">
        <div class="button-container">
          <button 
            id="findRestaurantsBtn" 
            disabled 
            aria-disabled="true"
            aria-describedby="restaurants-status"
            aria-label="Encontrar restaurantes próximos"
          >
            <span class="button-text">Encontrar Restaurantes Próximos</span>
            <span class="button-loading" aria-hidden="true" hidden>⏳</span>
          </button>
          <span id="restaurants-status" class="button-status" role="status" aria-live="polite">
            Aguardando localização...
          </span>
        </div>
        
        <div class="button-container">
          <button 
            id="cityStatsBtn" 
            disabled 
            aria-disabled="true"
            aria-describedby="stats-status"
            aria-label="Obter estatísticas da cidade"
          >
            <span class="button-text">Obter Estatísticas da Cidade</span>
            <span class="button-loading" aria-hidden="true" hidden>⏳</span>
          </button>
          <span id="stats-status" class="button-status" role="status" aria-live="polite">
            Aguardando localização...
          </span>
        </div>
      </nav>
      
      <!-- Geolocation status banner container -->
      <div id="geolocation-banner-container"></div>

      <!-- Location Highlight Cards -->
      <section class="location-highlights" aria-label="Destaques de localização">
        <div class="highlight-card" role="region" aria-labelledby="municipio-label">
          <div id="municipio-label" class="highlight-card-label">Município</div>
          <div id="municipio-value" class="highlight-card-value" aria-live="polite">—</div>
        </div>
        <div class="highlight-card" role="region" aria-labelledby="bairro-label">
          <div id="bairro-label" class="highlight-card-label">Bairro</div>
          <div id="bairro-value" class="highlight-card-value" aria-live="polite">—</div>
        </div>
      </section>

      <section id="coordinates" aria-labelledby="coordinates-heading">
        <h2 id="coordinates-heading" class="sr-only">Coordenadas</h2>
        <p><strong>Coordenadas:</strong> <span id="lat-long-display" aria-live="polite">Aguardando localização...</span></p>
      </section>

      <section id="reference-place" aria-labelledby="reference-place-heading">
        <h2 id="reference-place-heading" class="sr-only">Local de Referência</h2>
        <p><strong>Local de referência:</strong> <span id="reference-place-display" aria-live="polite">Aguardando localização...</span></p>
      </section>

      <section id="standardized-address" aria-labelledby="address-heading">
        <h2 id="address-heading" class="sr-only">Endereço Padronizado</h2>
        <p><strong>Endereço padronizado:</strong> <span id="endereco-padronizado-display" aria-live="polite">Aguardando localização...</span></p>
      </section>

      <section class="section" id="dadosSidra" aria-labelledby="location-info-heading">
        <h2 id="location-info-heading">Informações da Localização</h2>
      </section>
      
      <section id="locationResult" aria-live="polite" aria-label="Resultado da localização">
        <p>As informações da sua localização aparecerão aqui.</p>
      </section>
    `;
  },
  
  async mount(container) {
    console.log("(home-view) Mounting home view...");
    
    // Initialize geolocation manager
    const manager = this._initializeGeocodingManager();
    
    // Setup handlers
    this._setupLocationUpdateHandlers(manager);
    this._setupCacheDisplayHandlers(manager);
    this._setupButtonHandlers();
    
    // Request location with banner
    this._requestLocationWithBanner(manager);
    
    // Store manager for cleanup
    this.manager = manager;
  },
  
  cleanup() {
    console.log("(home-view) Cleaning up home view...");
    // Stop any ongoing geolocation watchers
    if (this.manager && this.manager.watchId) {
      navigator.geolocation.clearWatch(this.manager.watchId);
    }
    this.manager = null;
  },
  
  // Helper methods (impure functions)
  _initializeGeocodingManager() {
    const locationResult = document.getElementById("locationResult");
    console.log("(home-view) Creating WebGeocodingManager...");
    const manager = new WebGeocodingManager(document, {
      locationResult: locationResult,
      elementIds: {
        chronometer: "chronometer", // Optional element, not in HTML
        findRestaurantsBtn: "findRestaurantsBtn", // Match actual HTML ID
        cityStatsBtn: "cityStatsBtn", // Match actual HTML ID
        timestampDisplay: "tsPosCapture", // Optional element, not in HTML
        speechSynthesis: {
          languageSelectId: "language",
          voiceSelectId: "voice-select",
          textInputId: "text-input",
          speakBtnId: "speak-btn",
          pauseBtnId: "pause-btn",
          resumeBtnId: "resume-btn",
          stopBtnId: "stop-btn",
          rateInputId: "rate",
          rateValueId: "rate-value",
          pitchInputId: "pitch",
          pitchValueId: "pitch-value",
        }
      }
    });
    return manager;
  },
  
  _setupLocationUpdateHandlers(manager) {
    manager.subscribeFunction((currentPosition, newAddress, enderecoPadronizado) => {
      console.log(`(home-view) Location updated`);
      
      if (currentPosition) {
        window.showLocationSuccess?.('geolocation-banner-container', 3000);
        
        // Enable buttons
        const findRestaurantsBtn = document.getElementById("findRestaurantsBtn");
        const cityStatsBtn = document.getElementById("cityStatsBtn");
        
        if (findRestaurantsBtn) {
          findRestaurantsBtn.disabled = false;
          findRestaurantsBtn.setAttribute('aria-disabled', 'false');
          const status = document.getElementById("restaurants-status");
          if (status) status.textContent = "Pronto";
        }
        
        if (cityStatsBtn) {
          cityStatsBtn.disabled = false;
          cityStatsBtn.setAttribute('aria-disabled', 'false');
          const status = document.getElementById("stats-status");
          if (status) status.textContent = "Pronto";
        }
      }
      
      // Update display elements
      this._updateLocationDisplay(currentPosition, newAddress, enderecoPadronizado);
    });
  },
  
  _updateLocationDisplay(currentPosition, newAddress, enderecoPadronizado) {
    // Update coordinates
    const latLongDisplay = document.getElementById("lat-long-display");
    if (latLongDisplay && currentPosition) {
      latLongDisplay.textContent = `${currentPosition.latitude.toFixed(6)}, ${currentPosition.longitude.toFixed(6)}`;
    }
    
    // Update reference place
    const referencePlaceDisplay = document.getElementById("reference-place-display");
    if (referencePlaceDisplay && newAddress) {
      referencePlaceDisplay.textContent = newAddress;
    }
    
    // Update standardized address
    const enderecoPadronizadoDisplay = document.getElementById("endereco-padronizado-display");
    if (enderecoPadronizadoDisplay && enderecoPadronizado) {
      enderecoPadronizadoDisplay.textContent = enderecoPadronizado;
    }
    
    // Update highlight cards
    this._updateHighlightCards(enderecoPadronizado);
  },
  
  _updateHighlightCards(enderecoPadronizado) {
    if (!enderecoPadronizado) return;
    
    // Parse enderecoPadronizado to extract município and bairro
    const parts = enderecoPadronizado.split(',').map(p => p.trim());
    
    const municipioValue = document.getElementById("municipio-value");
    const bairroValue = document.getElementById("bairro-value");
    
    // Typically: "Bairro, Município, Estado"
    if (parts.length >= 2) {
      if (municipioValue) municipioValue.textContent = parts[1] || '—';
      if (bairroValue) bairroValue.textContent = parts[0] || '—';
    }
  },
  
  _setupCacheDisplayHandlers(manager) {
    const updateCacheDisplay = () => {
      const tamCache = document.getElementById("tam-cache");
      if (tamCache && manager.cache) {
        tamCache.textContent = manager.cache.size || 0;
      }
    };
    
    // Update initially and periodically
    updateCacheDisplay();
    this.cacheInterval = setInterval(updateCacheDisplay, 5000);
  },
  
  _setupButtonHandlers() {
    const findRestaurantsBtn = document.getElementById("findRestaurantsBtn");
    const cityStatsBtn = document.getElementById("cityStatsBtn");
    
    if (findRestaurantsBtn) {
      findRestaurantsBtn.addEventListener('click', () => {
        console.log("(home-view) Find restaurants clicked");
        alert("Funcionalidade de busca de restaurantes será implementada em breve!");
      });
    }
    
    if (cityStatsBtn) {
      cityStatsBtn.addEventListener('click', () => {
        console.log("(home-view) City stats clicked");
        alert("Funcionalidade de estatísticas da cidade será implementada em breve!");
      });
    }
  },
  
  _requestLocationWithBanner(manager) {
    window.showPermissionRequest?.('geolocation-banner-container');
    
    manager.requestLocation().catch(error => {
      console.error("(home-view) Error requesting location:", error);
      window.showLocationError?.('geolocation-banner-container', error.message);
    });
  }
};
