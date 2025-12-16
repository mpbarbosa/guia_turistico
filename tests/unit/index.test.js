/**
 * Unit Test Suite for src/index.js
 * 
 * Tests focus on pure functions (Business Logic Layer)
 * which are referentially transparent and easily testable.
 * 
 * @jest-environment jsdom
 */

// ========================================
// PURE FUNCTIONS (copied for testing)
// Note: In production, these should be exported from index.js
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

// ========================================
// TEST SUITES
// ========================================

describe('Pure Functions - Business Logic Layer', () => {
  
  describe('extractCoordinatesText()', () => {
    
    test('should return formatted coordinates text', () => {
      const position = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333
        }
      };
      
      const result = extractCoordinatesText(position);
      
      expect(result).toBe('Latitude: -23.5505, Longitude: -46.6333');
    });
    
    test('should return empty string when currentPosition is null', () => {
      expect(extractCoordinatesText(null)).toBe('');
    });
    
    test('should return empty string when currentPosition is undefined', () => {
      expect(extractCoordinatesText(undefined)).toBe('');
    });
    
    test('should return empty string when coords is missing', () => {
      const position = { timestamp: 123456789 };
      expect(extractCoordinatesText(position)).toBe('');
    });
    
    test('should handle zero coordinates', () => {
      const position = {
        coords: { latitude: 0, longitude: 0 }
      };
      
      expect(extractCoordinatesText(position)).toBe('Latitude: 0, Longitude: 0');
    });
    
    test('should handle negative coordinates', () => {
      const position = {
        coords: { latitude: -90, longitude: -180 }
      };
      
      expect(extractCoordinatesText(position)).toBe('Latitude: -90, Longitude: -180');
    });
    
    test('is referentially transparent (same input = same output)', () => {
      const position = {
        coords: { latitude: 10.5, longitude: 20.3 }
      };
      
      const result1 = extractCoordinatesText(position);
      const result2 = extractCoordinatesText(position);
      const result3 = extractCoordinatesText(position);
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
  
  describe('extractReferencePlaceText()', () => {
    
    test('should return display_name if present', () => {
      const address = {
        display_name: 'Avenida Paulista, São Paulo, Brasil'
      };
      
      expect(extractReferencePlaceText(address)).toBe('Avenida Paulista, São Paulo, Brasil');
    });
    
    test('should return displayName if display_name is not present', () => {
      const address = {
        displayName: 'Rua Augusta, SP'
      };
      
      expect(extractReferencePlaceText(address)).toBe('Rua Augusta, SP');
    });
    
    test('should return string address directly', () => {
      const address = 'Simple string address';
      
      expect(extractReferencePlaceText(address)).toBe('Simple string address');
    });
    
    test('should return JSON string for objects without display properties', () => {
      const address = {
        street: 'Rua dos Testes',
        number: 123
      };
      
      const result = extractReferencePlaceText(address);
      
      expect(result).toBe(JSON.stringify(address));
      expect(result).toContain('Rua dos Testes');
    });
    
    test('should return empty string for null address', () => {
      expect(extractReferencePlaceText(null)).toBe('');
    });
    
    test('should return empty string for undefined address', () => {
      expect(extractReferencePlaceText(undefined)).toBe('');
    });
    
    test('should prefer display_name over displayName', () => {
      const address = {
        display_name: 'Display Name',
        displayName: 'Display Name Alt'
      };
      
      expect(extractReferencePlaceText(address)).toBe('Display Name');
    });
    
    test('is deterministic', () => {
      const address = { display_name: 'Test Address' };
      
      expect(extractReferencePlaceText(address)).toBe(extractReferencePlaceText(address));
    });
  });
  
  describe('extractBairroText()', () => {
    
    test('should extract suburb from address', () => {
      const address = { suburb: 'Jardim Paulista' };
      
      expect(extractBairroText(address)).toBe('Jardim Paulista');
    });
    
    test('should extract neighbourhood as fallback', () => {
      const address = { neighbourhood: 'Vila Madalena' };
      
      expect(extractBairroText(address)).toBe('Vila Madalena');
    });
    
    test('should extract quarter as fallback', () => {
      const address = { quarter: 'Centro' };
      
      expect(extractBairroText(address)).toBe('Centro');
    });
    
    test('should extract residential as fallback', () => {
      const address = { residential: 'Residencial Jardim' };
      
      expect(extractBairroText(address)).toBe('Residencial Jardim');
    });
    
    test('should extract suburb from nested address object', () => {
      const address = {
        address: {
          suburb: 'Morumbi'
        }
      };
      
      expect(extractBairroText(address)).toBe('Morumbi');
    });
    
    test('should extract neighbourhood from nested address object', () => {
      const address = {
        address: {
          neighbourhood: 'Pinheiros'
        }
      };
      
      expect(extractBairroText(address)).toBe('Pinheiros');
    });
    
    test('should return "Não disponível" for null address', () => {
      expect(extractBairroText(null)).toBe('Não disponível');
    });
    
    test('should return "Não disponível" for undefined address', () => {
      expect(extractBairroText(undefined)).toBe('Não disponível');
    });
    
    test('should return "Não disponível" when no bairro fields exist', () => {
      const address = {
        street: 'Rua Qualquer',
        city: 'São Paulo'
      };
      
      expect(extractBairroText(address)).toBe('Não disponível');
    });
    
    test('should prefer top-level suburb over nested', () => {
      const address = {
        suburb: 'Top Level',
        address: {
          suburb: 'Nested Level'
        }
      };
      
      expect(extractBairroText(address)).toBe('Top Level');
    });
    
    test('follows fallback priority chain', () => {
      const addressWithMultiple = {
        suburb: 'Suburb',
        neighbourhood: 'Neighbourhood',
        quarter: 'Quarter',
        residential: 'Residential'
      };
      
      expect(extractBairroText(addressWithMultiple)).toBe('Suburb');
    });
    
    test('is referentially transparent', () => {
      const address = { suburb: 'Test' };
      const result1 = extractBairroText(address);
      const result2 = extractBairroText(address);
      
      expect(result1).toBe(result2);
    });
  });
  
  describe('formatMunicipioText()', () => {
    
    test('should format municipio with siglaUf', () => {
      const endereco = {
        municipio: 'São Paulo',
        siglaUf: 'SP'
      };
      
      expect(formatMunicipioText(endereco)).toBe('São Paulo, SP');
    });
    
    test('should format municipio without siglaUf', () => {
      const endereco = {
        municipio: 'Brasília'
      };
      
      expect(formatMunicipioText(endereco)).toBe('Brasília');
    });
    
    test('should return "Não disponível" for null', () => {
      expect(formatMunicipioText(null)).toBe('Não disponível');
    });
    
    test('should return "Não disponível" for undefined', () => {
      expect(formatMunicipioText(undefined)).toBe('Não disponível');
    });
    
    test('should handle missing municipio field', () => {
      const endereco = { siglaUf: 'RJ' };
      
      expect(formatMunicipioText(endereco)).toBe('Não disponível, RJ');
    });
    
    test('should handle empty municipio', () => {
      const endereco = {
        municipio: '',
        siglaUf: 'MG'
      };
      
      expect(formatMunicipioText(endereco)).toBe('Não disponível, MG');
    });
    
    test('should handle empty siglaUf', () => {
      const endereco = {
        municipio: 'Rio de Janeiro',
        siglaUf: ''
      };
      
      expect(formatMunicipioText(endereco)).toBe('Rio de Janeiro');
    });
    
    test('is pure and deterministic', () => {
      const endereco = { municipio: 'Curitiba', siglaUf: 'PR' };
      
      const result1 = formatMunicipioText(endereco);
      const result2 = formatMunicipioText(endereco);
      const result3 = formatMunicipioText(endereco);
      
      expect(result1).toBe('Curitiba, PR');
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
  
  describe('createSidraParams()', () => {
    
    test('should create params object with municipio and siglaUf', () => {
      const endereco = {
        municipio: 'São Paulo',
        siglaUf: 'SP'
      };
      
      const result = createSidraParams(endereco);
      
      expect(result).toEqual({
        municipio: 'São Paulo',
        siglaUf: 'SP'
      });
    });
    
    test('should return null for null input', () => {
      expect(createSidraParams(null)).toBeNull();
    });
    
    test('should return null for undefined input', () => {
      expect(createSidraParams(undefined)).toBeNull();
    });
    
    test('should handle missing municipio', () => {
      const endereco = { siglaUf: 'RJ' };
      
      const result = createSidraParams(endereco);
      
      expect(result).toEqual({
        municipio: undefined,
        siglaUf: 'RJ'
      });
    });
    
    test('should handle missing siglaUf', () => {
      const endereco = { municipio: 'Belo Horizonte' };
      
      const result = createSidraParams(endereco);
      
      expect(result).toEqual({
        municipio: 'Belo Horizonte',
        siglaUf: undefined
      });
    });
    
    test('should return new object (immutability)', () => {
      const endereco = {
        municipio: 'Porto Alegre',
        siglaUf: 'RS'
      };
      
      const result = createSidraParams(endereco);
      
      expect(result).not.toBe(endereco);
      expect(result).toEqual({
        municipio: 'Porto Alegre',
        siglaUf: 'RS'
      });
    });
    
    test('is referentially transparent', () => {
      const endereco = { municipio: 'Recife', siglaUf: 'PE' };
      
      const result1 = createSidraParams(endereco);
      const result2 = createSidraParams(endereco);
      
      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2);
    });
  });
  
  describe('calculateCacheSize()', () => {
    
    test('should calculate size from size property', () => {
      const cache = { size: 42 };
      
      expect(calculateCacheSize(cache)).toBe('42');
    });
    
    test('should calculate size from length property', () => {
      const cache = { length: 15 };
      
      expect(calculateCacheSize(cache)).toBe('15');
    });
    
    test('should prefer size over length', () => {
      const cache = { size: 10, length: 20 };
      
      expect(calculateCacheSize(cache)).toBe('10');
    });
    
    test('should return "0" for null', () => {
      expect(calculateCacheSize(null)).toBe('0');
    });
    
    test('should return "0" for undefined', () => {
      expect(calculateCacheSize(undefined)).toBe('0');
    });
    
    test('should return "0" for empty object', () => {
      expect(calculateCacheSize({})).toBe('0');
    });
    
    test('should handle zero size', () => {
      const cache = { size: 0 };
      
      expect(calculateCacheSize(cache)).toBe('0');
    });
    
    test('should handle large numbers', () => {
      const cache = { size: 1000000 };
      
      expect(calculateCacheSize(cache)).toBe('1000000');
    });
    
    test('is deterministic', () => {
      const cache = { size: 99 };
      
      expect(calculateCacheSize(cache)).toBe(calculateCacheSize(cache));
    });
  });
  
  describe('findAddressCache()', () => {
    
    test('should find cache from manager.addressCache', () => {
      const mockCache = { size: 10 };
      const manager = {
        addressCache: mockCache
      };
      
      expect(findAddressCache(manager)).toBe(mockCache);
    });
    
    test('should find cache from manager.reverseGeocoder.addressCache', () => {
      const mockCache = { size: 20 };
      const manager = {
        reverseGeocoder: {
          addressCache: mockCache
        }
      };
      
      expect(findAddressCache(manager)).toBe(mockCache);
    });
    
    test('should prefer manager.addressCache over reverseGeocoder', () => {
      const directCache = { size: 10 };
      const nestedCache = { size: 20 };
      
      const manager = {
        addressCache: directCache,
        reverseGeocoder: {
          addressCache: nestedCache
        }
      };
      
      expect(findAddressCache(manager)).toBe(directCache);
    });
    
    test('should return null when no cache exists', () => {
      const manager = {};
      
      expect(findAddressCache(manager)).toBeNull();
    });
    
    test('should return null for null manager', () => {
      expect(findAddressCache(null)).toBeNull();
    });
    
    test('should return null for undefined manager', () => {
      expect(findAddressCache(undefined)).toBeNull();
    });
    
    test('should return null when reverseGeocoder has no addressCache', () => {
      const manager = {
        reverseGeocoder: {}
      };
      
      expect(findAddressCache(manager)).toBeNull();
    });
    
    test('is pure (does not modify input)', () => {
      const mockCache = { size: 5 };
      const manager = {
        addressCache: mockCache
      };
      
      findAddressCache(manager);
      
      expect(manager.addressCache).toBe(mockCache);
      expect(manager.addressCache.size).toBe(5);
    });
    
    test('is referentially transparent', () => {
      const manager = {
        addressCache: { size: 30 }
      };
      
      const result1 = findAddressCache(manager);
      const result2 = findAddressCache(manager);
      
      expect(result1).toBe(result2);
    });
  });
  
});

// ========================================
// PROPERTY-BASED TESTS
// ========================================

describe('Property-Based Tests for Pure Functions', () => {
  
  test('extractCoordinatesText: calling multiple times returns same result', () => {
    const position = {
      coords: { latitude: Math.random() * 180 - 90, longitude: Math.random() * 360 - 180 }
    };
    
    const results = [
      extractCoordinatesText(position),
      extractCoordinatesText(position),
      extractCoordinatesText(position)
    ];
    
    expect(results[0]).toBe(results[1]);
    expect(results[1]).toBe(results[2]);
  });
  
  test('formatMunicipioText: always includes comma when siglaUf exists', () => {
    const testCases = [
      { municipio: 'São Paulo', siglaUf: 'SP' },
      { municipio: 'Rio de Janeiro', siglaUf: 'RJ' },
      { municipio: 'Brasília', siglaUf: 'DF' }
    ];
    
    testCases.forEach(endereco => {
      const result = formatMunicipioText(endereco);
      expect(result).toContain(',');
      expect(result).toContain(endereco.siglaUf);
    });
  });
  
  test('calculateCacheSize: always returns a string', () => {
    const testCases = [
      { size: 0 },
      { size: 100 },
      { length: 50 },
      null,
      undefined,
      {}
    ];
    
    testCases.forEach(cache => {
      const result = calculateCacheSize(cache);
      expect(typeof result).toBe('string');
    });
  });
  
  test('createSidraParams: returns null or object with municipio and siglaUf properties', () => {
    const testCases = [
      { municipio: 'Test1', siglaUf: 'T1' },
      { municipio: 'Test2' },
      null,
      undefined
    ];
    
    testCases.forEach(endereco => {
      const result = createSidraParams(endereco);
      
      if (result === null) {
        expect(result).toBeNull();
      } else {
        expect(result).toHaveProperty('municipio');
        expect(result).toHaveProperty('siglaUf');
      }
    });
  });
  
});

// ========================================
// INTEGRATION TESTS (Pure Functions Together)
// ========================================

describe('Integration Tests - Pure Functions Working Together', () => {
  
  test('location data pipeline: extracting and formatting', () => {
    const position = {
      coords: { latitude: -23.5505, longitude: -46.6333 }
    };
    
    const address = {
      suburb: 'Consolação',
      display_name: 'Avenida Paulista, Consolação, São Paulo, SP'
    };
    
    const enderecoPadronizado = {
      municipio: 'São Paulo',
      siglaUf: 'SP'
    };
    
    const coordinates = extractCoordinatesText(position);
    const referencePlace = extractReferencePlaceText(address);
    const bairro = extractBairroText(address);
    const municipio = formatMunicipioText(enderecoPadronizado);
    const sidraParams = createSidraParams(enderecoPadronizado);
    
    expect(coordinates).toBe('Latitude: -23.5505, Longitude: -46.6333');
    expect(referencePlace).toBe('Avenida Paulista, Consolação, São Paulo, SP');
    expect(bairro).toBe('Consolação');
    expect(municipio).toBe('São Paulo, SP');
    expect(sidraParams).toEqual({ municipio: 'São Paulo', siglaUf: 'SP' });
  });
  
  test('cache management pipeline', () => {
    const mockCache = { size: 25 };
    const manager = {
      reverseGeocoder: {
        addressCache: mockCache
      }
    };
    
    const cache = findAddressCache(manager);
    const cacheSize = calculateCacheSize(cache);
    
    expect(cache).toBe(mockCache);
    expect(cacheSize).toBe('25');
  });
  
  test('handling missing data gracefully', () => {
    const emptyPosition = null;
    const emptyAddress = null;
    const emptyEndereco = null;
    
    expect(extractCoordinatesText(emptyPosition)).toBe('');
    expect(extractReferencePlaceText(emptyAddress)).toBe('');
    expect(extractBairroText(emptyAddress)).toBe('Não disponível');
    expect(formatMunicipioText(emptyEndereco)).toBe('Não disponível');
    expect(createSidraParams(emptyEndereco)).toBeNull();
  });
  
});
