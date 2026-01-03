/**
 * @fileoverview Home View - Main landing page for Guia Turístico
 * Displays user's current location with toggle between single-position and continuous tracking
 * 
 * This view is loaded by the SPA router and uses the WebGeocodingManager from guia_js library
 * to obtain and display location information.
 * 
 * Features:
 * - Single location capture (one-time)
 * - Continuous location tracking (loop mode)
 * - Toggle between modes with checkbox
 * 
 * @module views/home
 * @requires https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js
 */

import { WebGeocodingManager, PositionManager, AddressCache } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js';

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
  title: 'Guia Turístico - Localização',
  
  styles: [],
  
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
          <span id="tracking-timer-container" style="display: none;">
            Tempo decorrido: <span id="chronometer" aria-live="polite">00:00</span> | 
            Fila fala: <span id="tam-fila-fala" aria-live="polite">0</span> | 
          </span>
          <abbr title="Dados salvos localmente para acesso rápido" aria-label="Cache: dados salvos localmente">Cache</abbr>: 
          <span id="tam-cache" aria-live="polite">0</span> itens
        </p>
      </header>

      <!-- Tracking Mode Toggle -->
      <section class="tracking-mode-section" aria-label="Modo de rastreamento">
        <div class="tracking-mode-toggle">
          <input 
            type="checkbox" 
            id="continuous-tracking-toggle" 
            aria-describedby="tracking-mode-description"
            role="switch"
            aria-checked="false"
          />
          <label for="continuous-tracking-toggle">
            <strong>Rastreamento Contínuo</strong>
            <span id="tracking-mode-description" class="toggle-description">
              Ative para atualizar sua localização automaticamente enquanto você se move
            </span>
          </label>
        </div>
      </section>

      <nav aria-label="Ações da página">
        <div class="button-container">
          <button 
            id="findRestaurantsBtn" 
            disabled 
            aria-disabled="true"
            aria-describedby="restaurants-status"
            aria-label="Encontrar restaurantes próximos"
            class="md3-button-filled"
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
            class="md3-button-filled"
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

      <!-- Tracking Mode Controls (visible only in continuous mode) -->
      <div id="tracking-controls" style="display: none;">
        <button id="insertPositionButton" class="md3-button-outlined" aria-label="Inserir posição de teste">
          Inserir posição de teste
        </button>
        
        <label for="text-input" class="sr-only">Digite o texto para falar</label>
        <textarea 
          id="text-input" 
          placeholder="Digite o texto para falar..." 
          aria-label="Texto para síntese de voz"
          style="width: 100%; min-height: 60px; margin: 8px 0; padding: 8px; border-radius: 4px; border: 1px solid #ccc;"
        ></textarea>

        <label for="bottom-scroll-textarea" class="sr-only">Histórico de texto - somente leitura</label>
        <textarea 
          id="bottom-scroll-textarea" 
          rows="4" 
          readonly
          aria-readonly="true"
          aria-label="Histórico de texto gerado automaticamente durante navegação - somente leitura"
          placeholder="O histórico de texto será exibido aqui conforme você se move. Este campo é somente leitura."
          style="width: 100%; margin: 8px 0; padding: 8px; border-radius: 4px; border: 1px solid #ccc; background: #f5f5f5;"
        ></textarea>
      </div>
    `;
  },
  
  async mount(container) {
    console.log("(home-view) Mounting home view...");
    
    // Initialize state
    this.continuousMode = false;
    this.firstUpdate = true;
    
    // Initialize geolocation manager
    this.manager = await this._initializeGeocodingManager();
    
    // Setup handlers
    this._setupLocationUpdateHandlers();
    this._setupCacheDisplayHandlers();
    this._setupButtonHandlers();
    this._setupTrackingModeToggle();
    this._setupTrackingControls();
    
    // Request initial location with banner
    this._requestLocationWithBanner();
  },
  
  cleanup() {
    console.log("(home-view) Cleaning up home view...");
    
    // Stop any ongoing geolocation watchers
    if (this.manager && this.manager.watchId) {
      navigator.geolocation.clearWatch(this.manager.watchId);
    }
    
    // Stop speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Clear intervals
    if (this.cacheInterval) {
      clearInterval(this.cacheInterval);
    }
    if (this.speechQueueInterval) {
      clearInterval(this.speechQueueInterval);
    }
    
    // Clear state
    this.manager = null;
    this.continuousMode = false;
    this.firstUpdate = true;
  },
  
  // Helper methods (impure functions)
  async _initializeGeocodingManager() {
    const locationResult = document.getElementById("locationResult");
    const enderecoPadronizadoDisplay = document.getElementById("endereco-padronizado-display");
    const referencePlaceDisplay = document.getElementById("reference-place-display");
    
    console.log("(home-view) Creating WebGeocodingManager...");
    
    const params = {
      locationResult: locationResult,
      enderecoPadronizadoDisplay: enderecoPadronizadoDisplay,
      referencePlaceDisplay: referencePlaceDisplay,
      elementIds: {
        chronometer: "chronometer",
        findRestaurantsBtn: "findRestaurantsBtn",
        cityStatsBtn: "cityStatsBtn",
        timestampDisplay: "tsPosCapture",
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
    };
    
    return await WebGeocodingManager.createAsync(document, params);
  },
  
  _setupLocationUpdateHandlers() {
    this.manager.subscribeFunction((currentPosition, newAddress, enderecoPadronizado) => {
      console.log(`(home-view) Location updated`);
      
      if (currentPosition) {
        // Show success banner on first location update
        if (this.firstUpdate) {
          window.showLocationSuccess?.('geolocation-banner-container', 3000);
          this.firstUpdate = false;
        }
        
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
      
      // Update SIDRA data if in continuous mode
      if (this.continuousMode) {
        this._updateSidraData(enderecoPadronizado);
      }
    });
  },
  
  _updateLocationDisplay(currentPosition, newAddress, enderecoPadronizado) {
    // Update coordinates
    if (currentPosition) {
      const coords = currentPosition.coords || currentPosition;
      const latLongDisplay = document.getElementById("lat-long-display");
      if (latLongDisplay) {
        const lat = coords.latitude || currentPosition.latitude;
        const lng = coords.longitude || currentPosition.longitude;
        latLongDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    }
    
    // Update reference place (bairro)
    if (newAddress) {
      const bairro = newAddress.suburb 
        || newAddress.neighbourhood 
        || newAddress.quarter 
        || newAddress.residential 
        || newAddress.address?.suburb 
        || newAddress.address?.neighbourhood 
        || newAddress.address?.quarter 
        || newAddress.address?.residential;
      
      this._renderToElement("bairro-value", bairro || "Não disponível");
    }
    
    // Update standardized address
    if (enderecoPadronizado) {
      const enderecoCompleto = enderecoPadronizado.enderecoCompleto 
        ? enderecoPadronizado.enderecoCompleto() 
        : enderecoPadronizado;
      
      const enderecoPadronizadoDisplay = document.getElementById("endereco-padronizado-display");
      if (enderecoPadronizadoDisplay) {
        enderecoPadronizadoDisplay.textContent = enderecoCompleto;
      }
      
      // Update município highlight card
      const municipio = enderecoPadronizado.municipio || "Não disponível";
      const siglaUf = enderecoPadronizado.siglaUF;
      const municipioText = siglaUf ? `${municipio}, ${siglaUf}` : municipio;
      this._renderToElement("municipio-value", municipioText);
    }
  },
  
  _updateSidraData(enderecoPadronizado) {
    if (!enderecoPadronizado || typeof window.displaySidraDadosParams !== 'function') return;
    
    const dadosSidraDiv = document.getElementById("dadosSidra");
    const params = {
      "municipio": enderecoPadronizado.municipio,
      "siglaUf": enderecoPadronizado.siglaUF
    };
    window.displaySidraDadosParams(dadosSidraDiv, "PopEst", params);
  },
  
  _setupCacheDisplayHandlers() {
    const updateCacheDisplay = () => {
      const tamCache = document.getElementById("tam-cache");
      if (tamCache && this.manager.cache) {
        tamCache.textContent = this.manager.cache.size || 0;
      }
    };
    
    // Try to subscribe to cache updates
    if (AddressCache && typeof AddressCache.subscribeFunction === 'function') {
      AddressCache.subscribeFunction(eventData => {
        const cacheSize = eventData?.cacheSize || eventData?.cache?.length || 0;
        this._renderToElement("tam-cache", cacheSize.toString());
      });
    }
    
    // Update initially and periodically as fallback
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
  
  _requestLocationWithBanner() {
    window.showPermissionRequest?.('geolocation-banner-container');
    
    this.manager.requestLocation().catch(error => {
      console.error("(home-view) Error requesting location:", error);
      window.showLocationError?.('geolocation-banner-container', error.message);
    });
  },
  
  _setupTrackingModeToggle() {
    const toggle = document.getElementById("continuous-tracking-toggle");
    if (!toggle) return;
    
    toggle.addEventListener("change", (e) => {
      this.continuousMode = e.target.checked;
      e.target.setAttribute('aria-checked', this.continuousMode.toString());
      
      console.log(`(home-view) Continuous tracking ${this.continuousMode ? 'enabled' : 'disabled'}`);
      
      // Show/hide tracking-specific UI
      const trackingTimer = document.getElementById("tracking-timer-container");
      const trackingControls = document.getElementById("tracking-controls");
      
      if (this.continuousMode) {
        // Start continuous tracking
        if (trackingTimer) trackingTimer.style.display = 'inline';
        if (trackingControls) trackingControls.style.display = 'block';
        
        // Start tracking
        this.manager.startTracking();
        
        // Setup speech queue monitoring
        this._setupSpeechQueueMonitoring();
        
        window.toast?.info('Rastreamento contínuo ativado', 2000);
      } else {
        // Stop continuous tracking
        if (trackingTimer) trackingTimer.style.display = 'none';
        if (trackingControls) trackingControls.style.display = 'none';
        
        // Stop tracking
        if (this.manager && this.manager.watchId) {
          navigator.geolocation.clearWatch(this.manager.watchId);
          this.manager.watchId = null;
        }
        
        // Stop speech
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        
        // Clear speech queue interval
        if (this.speechQueueInterval) {
          clearInterval(this.speechQueueInterval);
          this.speechQueueInterval = null;
        }
        
        window.toast?.info('Rastreamento contínuo desativado', 2000);
      }
    });
  },
  
  _setupTrackingControls() {
    // Insert position button (for testing)
    const insertButton = document.getElementById("insertPositionButton");
    if (insertButton) {
      insertButton.addEventListener("click", () => {
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
        if (latLongDisplay) {
          latLongDisplay.innerText = `${position.coords.latitude}, ${position.coords.longitude}`;
        }
      });
    }
    
    // Text input handler
    const textInput = document.getElementById("text-input");
    if (textInput) {
      textInput.addEventListener("change", () => {
        const dadosSidraDiv = document.getElementById("dadosSidra");
        if (dadosSidraDiv) {
          textInput.value += "." + dadosSidraDiv.innerText;
        }
      });
    }
  },
  
  _setupSpeechQueueMonitoring() {
    if (!this.manager.htmlSpeechSynthesisDisplayer) return;
    if (!this.manager.htmlSpeechSynthesisDisplayer.speechManager) return;
    
    const speechQueue = this.manager.htmlSpeechSynthesisDisplayer.speechManager.speechQueue;
    if (!speechQueue) return;
    
    if (typeof speechQueue.subscribeFunction === 'function') {
      speechQueue.subscribeFunction(queue => {
        const size = this._calculateQueueSize(queue);
        this._renderToElement("tam-fila-fala", size.toString());
      });
    } else {
      // Fallback polling
      this.speechQueueInterval = setInterval(() => {
        const queueLength = speechQueue.length || (Array.isArray(speechQueue.queue) ? speechQueue.queue.length : 0);
        this._renderToElement("tam-fila-fala", queueLength.toString());
      }, 500);
    }
  },
  
  _renderToElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerText = content;
      // Add tooltip for potentially truncated text in highlight cards
      if (element.classList.contains('highlight-card-value')) {
        element.title = content;
      }
    }
  },
  
  _calculateQueueSize(queue) {
    if (!queue) return 0;
    if (typeof queue.size === 'function') return queue.size();
    if (Array.isArray(queue.queue)) return queue.queue.length;
    return 0;
  }
};
