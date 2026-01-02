/**
 * Address Converter - Coordinate to Address conversion logic
 * Separates concerns: business logic in external JS file
 */

let addressCache = null;

/**
 * Initialize the application when DOM is ready
 */
function init() {
  console.log("(address-converter) Initializing application...");
  const fetchButton = document.getElementById("fetchButton");
  const latitudeInput = document.getElementById("latitude");
  const longitudeInput = document.getElementById("longitude");
  const form = latitudeInput.closest('form');

  // Add event listeners without inline handlers
  form.addEventListener("submit", handleSubmit);
  
  // Real-time validation feedback
  latitudeInput.addEventListener("blur", () => validateInput(latitudeInput, "latitude"));
  longitudeInput.addEventListener("blur", () => validateInput(longitudeInput, "longitude"));
  
  // Clear errors on input
  latitudeInput.addEventListener("input", () => clearError(latitudeInput));
  longitudeInput.addEventListener("input", () => clearError(longitudeInput));
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
function handleSubmit(e) {
  e.preventDefault();
  
  const latitudeInput = document.getElementById("latitude");
  const longitudeInput = document.getElementById("longitude");
  
  // Validate both inputs
  const latValid = validateInput(latitudeInput, "latitude");
  const lonValid = validateInput(longitudeInput, "longitude");
  
  if (latValid && lonValid) {
    fetchAddress();
  }
}

/**
 * Validate a coordinate input
 * @param {HTMLInputElement} input - Input element to validate
 * @param {string} type - Type of coordinate ("latitude" or "longitude")
 * @returns {boolean} True if valid
 */
function validateInput(input, type) {
  const value = input.value.trim();
  const errorDiv = document.getElementById(`${type}-error`);
  
  // Check if empty
  if (!value) {
    showInputError(input, errorDiv, `Por favor, insira ${type === "latitude" ? "a latitude" : "a longitude"}.`);
    return false;
  }
  
  // Check if numeric
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    showInputError(input, errorDiv, "Deve ser um número válido.");
    return false;
  }
  
  // Check range
  if (type === "latitude" && (numValue < -90 || numValue > 90)) {
    showInputError(input, errorDiv, "Latitude deve estar entre -90 e 90.");
    return false;
  }
  
  if (type === "longitude" && (numValue < -180 || numValue > 180)) {
    showInputError(input, errorDiv, "Longitude deve estar entre -180 e 180.");
    return false;
  }
  
  // Valid - clear any errors
  clearError(input);
  return true;
}

/**
 * Show validation error for an input
 * @param {HTMLInputElement} input - Input element
 * @param {HTMLElement} errorDiv - Error message container
 * @param {string} message - Error message
 */
function showInputError(input, errorDiv, message) {
  input.setAttribute("aria-invalid", "true");
  errorDiv.textContent = message;
  errorDiv.hidden = false;
}

/**
 * Clear validation error for an input
 * @param {HTMLInputElement} input - Input element
 */
function clearError(input) {
  const type = input.id;
  const errorDiv = document.getElementById(`${type}-error`);
  
  input.setAttribute("aria-invalid", "false");
  if (errorDiv) {
    errorDiv.textContent = "";
    errorDiv.hidden = true;
  }
}

/**
 * Fetch and display address from coordinates
 */
function fetchAddress() {
  console.log("(address-converter) Fetching address...");
  const latitude = parseFloat(document.getElementById("latitude").value.trim());
  const longitude = parseFloat(document.getElementById("longitude").value.trim());
  const resultsDiv = document.getElementById("results");

  // Validate coordinates
  if (isNaN(latitude) || isNaN(longitude)) {
    showError("Coordenadas inválidas. Por favor, insira números válidos.");
    return;
  }

  if (latitude < -90 || latitude > 90) {
    showError("Latitude deve estar entre -90 e 90.");
    return;
  }

  if (longitude < -180 || longitude > 180) {
    showError("Longitude deve estar entre -180 e 180.");
    return;
  }

  console.log(`(address-converter) Valid coordinates: ${latitude}, ${longitude}`);
  resultsDiv.innerHTML = '<p class="loading" role="status">Carregando...</p>';

  var reverseGeocoder = new ReverseGeocoder(latitude, longitude);
  var htmlDisplayer = new HTMLAddressDisplayer(resultsDiv);
  reverseGeocoder.subscribe(htmlDisplayer);

  // Subscribe to address cache size changes if not already subscribed
  if (!addressCache && reverseGeocoder.addressCache) {
    addressCache = reverseGeocoder.addressCache;
    if (addressCache.subscribeFunction) {
      addressCache.subscribeFunction(cache => {
        document.getElementById("tam-cache").innerHTML = `${cache.size || cache.length || 0}`;
      });
    }
  }

  reverseGeocoder.reverseGeocode().then((data) => {
    console.log("(address-converter) Address fetched:", data);
    reverseGeocoder.notifyObservers();
    
    // Update highlight cards
    if (data) {
      // Update Bairro highlight card
      const bairroValue = document.getElementById("bairro-value");
      if (bairroValue) {
        const bairro = data.suburb || data.neighbourhood || data.quarter || data.residential || 
                       data.address?.suburb || data.address?.neighbourhood || data.address?.quarter || 
                       data.address?.residential;
        const bairroText = bairro || "Não disponível";
        bairroValue.innerText = bairroText;
        bairroValue.title = bairroText; // Tooltip for long names
      }
      
      // Update Municipio highlight card
      const municipioValue = document.getElementById("municipio-value");
      if (municipioValue) {
        const city = data.city || data.town || data.village || 
                     data.address?.city || data.address?.town || data.address?.village;
        const state = data.state || data.address?.state || "";
        const municipioText = city ? (state ? `${city}, ${state}` : city) : "Não disponível";
        municipioValue.innerText = municipioText;
        municipioValue.title = municipioText; // Tooltip for long names
      }
    }
  }).catch((error) => {
    console.error("(address-converter) ReverseGeocoder error:", error);
    console.log("(address-converter) Falling back to direct Nominatim API...");
    
    // Fallback to direct Nominatim API call
    fetchAddressDirectly(latitude, longitude, resultsDiv);
  });
}

/**
 * Fallback: Fetch address directly from Nominatim API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {HTMLElement} resultsDiv - Results container
 */
function fetchAddressDirectly(latitude, longitude, resultsDiv) {
  resultsDiv.innerHTML = '<p class="loading" role="status">Tentando método alternativo...</p>';
  
  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
    {
      headers: {
        'User-Agent': 'GuiaTuristico/0.5.0'
      }
    }
  )
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.error) {
      throw new Error(data.error);
    }
    
    console.log("(address-converter) Nominatim data:", data);
    
    // Update highlight cards
    const municipioValue = document.getElementById("municipio-value");
    const bairroValue = document.getElementById("bairro-value");
    
    if (municipioValue) {
      const city = data.address?.city || data.address?.town || data.address?.village || '—';
      municipioValue.textContent = city;
    }
    
    if (bairroValue) {
      const suburb = data.address?.suburb || data.address?.neighbourhood || '—';
      bairroValue.textContent = suburb;
    }
    
    // Display full results
    resultsDiv.innerHTML = `
      <h3>Endereço Encontrado</h3>
      <p><strong>Endereço completo:</strong> ${data.display_name}</p>
      ${formatAddressFields(data.address)}
      <p class="map-link">
        <a href="https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=16" 
           target="_blank" 
           rel="noopener noreferrer"
           aria-label="Ver localização no OpenStreetMap">
          Ver no OpenStreetMap ↗
        </a>
      </p>
    `;
  })
  .catch((error) => {
    console.error("(address-converter) Error fetching address:", error);
    
    let errorMessage = "Erro ao buscar endereço. ";
    
    // Provide more specific error messages
    if (error.message.includes("Invalid coordinates")) {
      errorMessage += "As coordenadas fornecidas são inválidas. Verifique os valores e tente novamente.";
    } else if (error.message.includes("Network") || error.message.includes("Failed to fetch")) {
      errorMessage += "Erro de conexão. Verifique sua internet e tente novamente.";
    } else if (error.message.includes("timeout")) {
      errorMessage += "O servidor demorou muito para responder. Tente novamente.";
    } else {
      errorMessage += error.message || "Tente novamente em alguns instantes.";
    }
    
    showError(errorMessage);
  });
}

/**
 * Display error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `<p class="error" role="alert">${message}</p>`;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
