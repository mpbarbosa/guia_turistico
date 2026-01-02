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
    
    // Load guia.js module
    const { WebGeocodingManager } = await import('https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js');
    
    // Import loc-em-movimento.js logic
    // Since loc-em-movimento.js has inline initialization, we'll need to replicate it here
    // or refactor it to be module-based
    
    // For now, dynamically load the script
    await this._loadScript('../loc-em-movimento.js');
    
    console.log("(tracking-view) Tracking view mounted");
  },
  
  cleanup() {
    console.log("(tracking-view) Cleaning up tracking view...");
    // Stop any ongoing tracking
    if (window.guiaManager && window.guiaManager.watchId) {
      navigator.geolocation.clearWatch(window.guiaManager.watchId);
    }
    
    // Clear any intervals
    if (window.chronometerInterval) {
      clearInterval(window.chronometerInterval);
    }
    
    // Stop speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },
  
  async _loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
};
