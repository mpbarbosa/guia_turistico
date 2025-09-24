// Guia.js - Geolocation and address management library
// Version object for compatibility
const guiaVersion = {
  major: 1,
  minor: 0,
  patch: 0,
  prerelease: 'beta',
  status: 'stable',
  toString: function() {
    return `v${this.major}.${this.minor}.${this.patch}-${this.prerelease} (${this.status})`;
  }
};

// Check if geolocation is supported
function checkGeolocation(resultElement) {
  if (!navigator.geolocation) {
    if (resultElement) {
      resultElement.innerHTML = '<p class="error">Geolocation is not supported by this browser.</p>';
    }
    return false;
  }
  return true;
}

// Reverse geocoder class for converting coordinates to addresses
class ReverseGeocoder {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.observers = [];
    this.data = null;
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  notifyObservers() {
    this.observers.forEach(observer => {
      if (typeof observer.update === 'function') {
        observer.update(this.data);
      }
    });
  }

  async reverseGeocode() {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.latitude}&lon=${this.longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.data = await response.json();
      return this.data;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      throw error;
    }
  }
}

// HTML Address Displayer for showing address information
class HTMLAddressDisplayer {
  constructor(element) {
    this.element = element;
  }

  update(data) {
    if (!data || !data.address) {
      this.element.innerHTML = '<p class="error">No address information available.</p>';
      return;
    }

    const address = data.address;
    const displayName = data.display_name || 'Unknown location';
    
    let html = `
      <div class="address-info">
        <h3>Location Details</h3>
        <p><strong>Address:</strong> ${displayName}</p>
    `;

    if (address.house_number && address.road) {
      html += `<p><strong>Street:</strong> ${address.house_number} ${address.road}</p>`;
    } else if (address.road) {
      html += `<p><strong>Street:</strong> ${address.road}</p>`;
    }

    if (address.city || address.town || address.village) {
      const city = address.city || address.town || address.village;
      html += `<p><strong>City:</strong> ${city}</p>`;
    }

    if (address.state) {
      html += `<p><strong>State:</strong> ${address.state}</p>`;
    }

    if (address.country) {
      html += `<p><strong>Country:</strong> ${address.country}</p>`;
    }

    if (address.postcode) {
      html += `<p><strong>Postal Code:</strong> ${address.postcode}</p>`;
    }

    html += `
        <p><strong>Coordinates:</strong> ${data.lat}, ${data.lon}</p>
        <div class="map-link">
          <a href="https://www.openstreetmap.org/?mlat=${data.lat}&mlon=${data.lon}&zoom=16" target="_blank">
            View on OpenStreetMap
          </a>
        </div>
      </div>
    `;

    this.element.innerHTML = html;
  }
}

// Web Geocoding Manager class for handling location tracking
class WebGeocodingManager {
  constructor(document, resultElement) {
    this.document = document;
    this.resultElement = resultElement;
    this.subscribers = [];
    this.currentPosition = null;
    this.currentAddress = null;
    this.enderecoPadronizado = null;
    this.isTracking = false;
  }

  subscribeFunction(callback) {
    this.subscribers.push(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback(this.currentPosition, this.currentAddress, this.enderecoPadronizado);
    });
  }

  async updateLocation(position) {
    this.currentPosition = position;
    
    try {
      // Get address information using reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.currentAddress = await response.json();
      
      // Create standardized address object (Brazilian format)
      this.enderecoPadronizado = {
        municipio: this.currentAddress.address?.city || 
                   this.currentAddress.address?.town || 
                   this.currentAddress.address?.village || 'Unknown',
        siglaUf: this.currentAddress.address?.state_code || 
                 this.currentAddress.address?.state || 'Unknown',
        estado: this.currentAddress.address?.state || 'Unknown',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        endereco: this.currentAddress.display_name
      };

      // Update the result element
      if (this.resultElement) {
        this.updateResultElement();
      }

      // Notify subscribers
      this.notifySubscribers();

    } catch (error) {
      console.error('Failed to get address:', error);
      if (this.resultElement) {
        this.resultElement.innerHTML = `<p class="error">Failed to get address: ${error.message}</p>`;
      }
    }
  }

  updateResultElement() {
    if (!this.resultElement || !this.currentAddress) return;

    const address = this.currentAddress.address;
    const displayName = this.currentAddress.display_name || 'Unknown location';
    
    let html = `
      <div class="location-info">
        <h3>Your Location</h3>
        <p><strong>Address:</strong> ${displayName}</p>
        <p><strong>Coordinates:</strong> ${this.currentPosition.coords.latitude.toFixed(6)}, ${this.currentPosition.coords.longitude.toFixed(6)}</p>
    `;

    if (address) {
      if (address.city || address.town || address.village) {
        const city = address.city || address.town || address.village;
        html += `<p><strong>City:</strong> ${city}</p>`;
      }

      if (address.state) {
        html += `<p><strong>State:</strong> ${address.state}</p>`;
      }

      if (address.country) {
        html += `<p><strong>Country:</strong> ${address.country}</p>`;
      }
    }

    html += `
        <p><strong>Accuracy:</strong> ${this.currentPosition.coords.accuracy} meters</p>
        <p><strong>Timestamp:</strong> ${new Date(this.currentPosition.timestamp).toLocaleString()}</p>
      </div>
    `;

    this.resultElement.innerHTML = html;
  }

  startTracking() {
    if (!checkGeolocation(this.resultElement)) {
      return;
    }

    this.isTracking = true;
    
    if (this.resultElement) {
      this.resultElement.innerHTML = '<p class="loading">Getting your location...</p>';
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.updateLocation(position);
      },
      (error) => {
        let errorMessage = "An unknown error occurred.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "User denied the request for Geolocation.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get user location timed out.";
            break;
        }
        
        if (this.resultElement) {
          this.resultElement.innerHTML = `<p class="error">Geolocation error: ${errorMessage}</p>`;
        }
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  stopTracking() {
    this.isTracking = false;
  }

  // Get a single location update (compatibility method)
  getSingleLocationUpdate() {
    this.startTracking();
  }
}

// Export for compatibility (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WebGeocodingManager,
    ReverseGeocoder,
    HTMLAddressDisplayer,
    checkGeolocation,
    guiaVersion
  };
}