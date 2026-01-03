/**
 * @fileoverview Tracking View - Real-time Location Tracking
 * Tracks user's location continuously while moving and provides turn-by-turn information
 * 
 * This view is designed for active navigation, providing:
 * - Continuous location updates
 * - Text-to-speech feedback
 * - Municipality and neighborhood information
 * - IBGE statistics for current location
 * 
 * @module views/tracking
 */

// Import from CDN
import { WebGeocodingManager, PositionManager, AddressCache } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js';

/**
 * Tracking view configuration object
 * @type {Object}
 * @property {string} title - Page title for document.title
 * @property {Array<string>} styles - CSS files to load for this view
 * @property {Function} render - Returns HTML string for view content
 * @property {Function} mount - Called after view is mounted to DOM
 * @property {Function} cleanup - Called before view is unmounted
 */
export default {
  title: 'Localização em Movimento',
  
  styles: [
    'loc-em-movimento.css'
  ],
  
  // Internal state
  manager: null,
  firstUpdate: true,
  
  /**
   * Render tracking view HTML
   * @returns {string} HTML string for tracking view
   */
  render() {
    return `
      <header>
        <h1>Guia de Caminho</h1>
        <p>
          Tempo decorrido: <span id="chronometer" aria-live="polite"> </span> | 
          Fila fala: <span id="tam-fila-fala" aria-live="polite"> </span> | 
          <abbr title="Dados salvos localmente para acesso rápido" aria-label="Cache: dados salvos localmente">Cache</abbr>: 
          <span id="tam-cache" aria-live="polite"> </span> itens
        </p>
      </header>

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
        <h2 id="reference-place-heading" class="sr-only">Referência</h2>
        <p><strong>Referência:</strong> <span id="reference-place-display" aria-live="polite">Aguardando localização...</span></p>
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

      <button id="insertPositionButton" aria-label="Inserir posição de teste">Inserir posição</button>
      <label for="text-input" class="sr-only">Digite o texto para falar</label>
      <textarea id="text-input" placeholder="Digite o texto para falar..." aria-label="Texto para síntese de voz"></textarea>

      <footer>
        <label for="bottom-scroll-textarea" class="sr-only">Histórico de texto - somente leitura</label>
        <textarea 
          id="bottom-scroll-textarea" 
          rows="4" 
          readonly
          aria-readonly="true"
          aria-label="Histórico de texto gerado automaticamente durante navegação - somente leitura"
          placeholder="O histórico de texto será exibido aqui conforme você se move. Este campo é somente leitura."
        ></textarea>
      </footer>
    `;
  },
  
  async mount(container) {
    console.log("(tracking-view) Mounting tracking view...");
    
    // Show permission request banner
    if (window.showPermissionRequest) {
      window.showPermissionRequest('geolocation-banner-container');
    }
    
    // Initialize geocoding manager
    this.manager = await this._initializeGeocodingManager();
    
    // Setup handlers
    this._setupLocationUpdateHandlers();
    this._setupSpeechQueueMonitoring();
    this._setupCacheMonitoring();
    this._setupInsertPositionButton();
    this._setupTextInputHandler();
    
    // Show loading banner before starting tracking
    if (window.showLoadingLocation) {
      window.showLoadingLocation('geolocation-banner-container');
    }
    
    // Start tracking
    this.manager.startTracking();
    
    console.log("(tracking-view) Tracking view mounted");
  },
  
  cleanup() {
    console.log("(tracking-view) Cleaning up tracking view...");
    
    // Stop tracking
    if (this.manager && this.manager.watchId) {
      navigator.geolocation.clearWatch(this.manager.watchId);
    }
    
    // Stop speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Clear state
    this.manager = null;
    this.firstUpdate = true;
  },
  
  // Helper methods (impure functions)
  async _initializeGeocodingManager() {
    const params = {
      locationResult: "locationResult",
      enderecoPadronizadoDisplay: "endereco-padronizado-display",
      referencePlaceDisplay: "reference-place-display",
      elementIds: {
        chronometer: "chronometer",
        findRestaurantsBtn: "find-restaurants-btn",
        cityStatsBtn: "city-stats-btn",
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
      // Show success banner on first location update
      if (this.firstUpdate && currentPosition && window.showLocationSuccess) {
        window.showLocationSuccess('geolocation-banner-container', 3000);
        this.firstUpdate = false;
      }
      
      this._updateCoordinatesDisplay(currentPosition);
      this._updateBairroDisplay(newAddress);
      this._updateMunicipioDisplays(enderecoPadronizado);
      this._updateSidraData(enderecoPadronizado);
    });
  },
  
  _updateCoordinatesDisplay(currentPosition) {
    if (!currentPosition || !currentPosition.coords) return;
    
    const coordsText = `Latitude: ${currentPosition.coords.latitude}, Longitude: ${currentPosition.coords.longitude}`;
    this._renderToElement("lat-long-display", coordsText);
  },
  
  _updateBairroDisplay(newAddress) {
    if (!newAddress) return;
    
    const bairro = newAddress.suburb 
      || newAddress.neighbourhood 
      || newAddress.quarter 
      || newAddress.residential 
      || newAddress.address?.suburb 
      || newAddress.address?.neighbourhood 
      || newAddress.address?.quarter 
      || newAddress.address?.residential;
    
    this._renderToElement("bairro-value", bairro || "Não disponível");
  },
  
  _updateMunicipioDisplays(enderecoPadronizado) {
    if (!enderecoPadronizado) return;
    
    const enderecoCompleto = enderecoPadronizado.enderecoCompleto() || '';
    this._renderToElement("endereco-padronizado-display", enderecoCompleto);
    
    const municipio = enderecoPadronizado.municipio || "Não disponível";
    const siglaUf = enderecoPadronizado.siglaUF;
    const municipioText = siglaUf ? `${municipio}, ${siglaUf}` : municipio;
    this._renderToElement("municipio-value", municipioText);
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
      setInterval(() => {
        const queueLength = speechQueue.length || (Array.isArray(speechQueue.queue) ? speechQueue.queue.length : 0);
        this._renderToElement("tam-fila-fala", queueLength.toString());
      }, 500);
    }
  },
  
  _setupCacheMonitoring() {
    if (!AddressCache || typeof AddressCache.subscribeFunction !== 'function') return;
    
    AddressCache.subscribeFunction(eventData => {
      const cacheSize = eventData?.cacheSize || eventData?.cache?.length || 0;
      this._renderToElement("tam-cache", cacheSize.toString());
    });
  },
  
  _setupInsertPositionButton() {
    const button = document.getElementById("insertPositionButton");
    if (!button) return;
    
    button.addEventListener("click", () => {
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
        latLongDisplay.innerText = `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`;
      }
    });
  },
  
  _setupTextInputHandler() {
    const textInput = document.getElementById("text-input");
    if (!textInput) return;
    
    textInput.addEventListener("change", () => {
      const dadosSidraDiv = document.getElementById("dadosSidra");
      if (dadosSidraDiv) {
        textInput.value += "." + dadosSidraDiv.innerText;
      }
    });
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
