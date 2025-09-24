# Diagrama de Classes - Guia Turístico

## Classes Principais do Sistema

### Classe: WebGeocodingManager
**Responsabilidade**: Gerenciar operações de geolocalização e geocodificação  
**Localização**: Biblioteca guia_js

```javascript
class WebGeocodingManager {
  // Atributos
  - document: Document
  - locationResult: HTMLElement
  - currentPosition: Position
  - isTracking: boolean
  - subscribers: Function[]
  
  // Métodos
  + constructor(document: Document, locationResult: HTMLElement)
  + subscribeFunction(callback: Function): void
  + startTracking(): void
  + stopTracking(): void
  + getSingleLocationUpdate(): void
  + getCurrentPosition(): Position
  + reverseGeocode(lat: number, lon: number): Address
  - notifyObservers(): void
  - handleLocationSuccess(position: Position): void
  - handleLocationError(error: PositionError): void
}
```

### Classe: ReverseGeocoder
**Responsabilidade**: Converter coordenadas em endereços legíveis

```javascript
class ReverseGeocoder {
  // Atributos
  - latitude: number
  - longitude: number
  - address: Address
  - observers: Observer[]
  
  // Métodos
  + constructor(latitude: number, longitude: number)
  + subscribe(observer: Observer): void
  + reverseGeocode(): Promise<Address>
  + notifyObservers(): void
  - buildNominatimUrl(): string
  - parseNominatimResponse(response: any): Address
}
```

### Classe: HTMLAddressDisplayer
**Responsabilidade**: Exibir endereços na interface HTML

```javascript
class HTMLAddressDisplayer {
  // Atributos
  - containerElement: HTMLElement
  
  // Métodos
  + constructor(containerElement: HTMLElement)
  + update(address: Address): void
  + renderAddress(address: Address): string
  - formatAddressHTML(address: Address): string
}
```

### Classe: SidraAPIManager
**Responsabilidade**: Integração com API SIDRA/IBGE para dados estatísticos  
**Localização**: Biblioteca sidra

```javascript
class SidraAPIManager {
  // Atributos
  - baseUrl: string
  - cache: Map<string, any>
  
  // Métodos
  + displaySidraDadosParams(container: HTMLElement, indicator: string, params: LocationParams): void
  + fetchMunicipalData(municipio: string, siglaUf: string): Promise<MunicipalData>
  + fetchPopulationEstimate(municipio: string, siglaUf: string): Promise<number>
  - buildSidraUrl(indicator: string, params: LocationParams): string
  - processSidraResponse(response: any): MunicipalData
  - getCachedData(key: string): any
  - setCachedData(key: string, data: any): void
}
```

### Classe: LocationService
**Responsabilidade**: Serviços principais de localização da aplicação

```javascript
class LocationService {
  // Atributos
  - currentCoords: Coordinates
  - currentAddress: Address
  - isTracking: boolean
  
  // Métodos
  + getLocation(): void
  + startContinuousTracking(): void
  + stopTracking(): void
  + buildTextToSpeech(address: Address): string
  + speak(text: string): void
  + checkGeolocation(resultContainer: HTMLElement): boolean
  - handleLocationUpdate(position: Position): void
  - handleLocationError(error: PositionError): void
}
```

### Classe: WikipediaService
**Responsabilidade**: Integração com API Wikipedia para informações da cidade

```javascript
class WikipediaService {
  // Atributos
  - baseUrl: string
  - language: string
  
  // Métodos
  + searchWikipedia(searchTerm: string): Promise<WikiSearchResult[]>
  + getWikipediaPage(pageId: number): Promise<string>
  + extractCityStats(wikiData: string): CityStats
  - buildSearchUrl(term: string): string
  - buildPageUrl(pageId: number): string
  - parseWikipediaResponse(response: any): WikiSearchResult[]
}
```

### Classe: OverpassService
**Responsabilidade**: Integração com API Overpass para serviços próximos

```javascript
class OverpassService {
  // Atributos
  - baseUrl: string
  - defaultRadius: number
  
  // Métodos
  + getNearbyRestaurants(lat: number, lon: number, radius: number): Promise<Restaurant[]>
  + getNearbyServices(lat: number, lon: number, serviceType: string): Promise<Service[]>
  - buildOverpassQuery(lat: number, lon: number, radius: number, amenity: string): string
  - parseOverpassResponse(response: any): Service[]
}
```

### Classe: TextToSpeechManager
**Responsabilidade**: Gerenciar síntese de voz

```javascript
class TextToSpeechManager {
  // Atributos
  - speechSynthesis: SpeechSynthesis
  - voice: SpeechSynthesisVoice
  - rate: number
  - pitch: number
  
  // Métodos
  + speak(text: string): void
  + setVoice(voice: SpeechSynthesisVoice): void
  + setRate(rate: number): void
  + setPitch(pitch: number): void
  + stop(): void
  - createUtterance(text: string): SpeechSynthesisUtterance
}
```

## Classes de Modelo de Dados

### Classe: Address
```javascript
class Address {
  // Atributos
  + road: string
  + houseNumber: string
  + city: string
  + town: string
  + village: string
  + state: string
  + country: string
  + postcode: string
  + displayName: string
  
  // Métodos
  + toString(): string
  + getMainLocation(): string
}
```

### Classe: Position
```javascript
class Position {
  + coords: Coordinates
  + timestamp: number
}
```

### Classe: Coordinates
```javascript
class Coordinates {
  + latitude: number
  + longitude: number
  + accuracy: number
  + altitude: number
  + altitudeAccuracy: number
  + heading: number
  + speed: number
}
```

### Classe: MunicipalData
```javascript
class MunicipalData {
  + municipio: string
  + siglaUf: string
  + population: number
  + area: number
  + density: number
  + established: Date
  
  + getPopulationFormatted(): string
  + getAreaFormatted(): string
}
```

### Classe: CityStats
```javascript
class CityStats {
  + population: string
  + area: string
  + elevation: string
  + density: string
  + timeZone: string
  + founded: string
  + otherStats: Stat[]
  
  + hasBasicStats(): boolean
}
```

### Classe: Restaurant
```javascript
class Restaurant {
  + name: string
  + lat: number
  + lon: number
  + cuisine: string
  + phone: string
  + website: string
  + distance: number
  
  + getDistanceFormatted(): string
}
```

## Relacionamentos entre Classes

### Composição
- `WebGeocodingManager` **compõe** `ReverseGeocoder`
- `LocationService` **compõe** `WebGeocodingManager`
- `LocationService` **compõe** `TextToSpeechManager`

### Agregação
- `HTMLAddressDisplayer` **agrega** `Address`
- `SidraAPIManager` **agrega** `MunicipalData`
- `WikipediaService` **agrega** `CityStats`

### Dependência
- `WebGeocodingManager` **depende de** `Position`, `Coordinates`
- `SidraAPIManager` **depende de** `Address`
- `WikipediaService` **depende de** `Address`
- `OverpassService` **depende de** `Coordinates`

### Implementação de Padrões
- **Observer Pattern**: `WebGeocodingManager` e seus subscribers
- **Strategy Pattern**: Diferentes serviços de API (SIDRA, Wikipedia, Overpass)
- **Singleton Pattern**: Instâncias de serviços de API

## Diagrama UML em Texto

```
@startuml
class WebGeocodingManager {
  -document: Document
  -locationResult: HTMLElement
  -currentPosition: Position
  -isTracking: boolean
  -subscribers: Function[]
  +constructor(document, locationResult)
  +subscribeFunction(callback): void
  +startTracking(): void
  +stopTracking(): void
  +getSingleLocationUpdate(): void
  +getCurrentPosition(): Position
  +reverseGeocode(lat, lon): Address
  -notifyObservers(): void
}

class ReverseGeocoder {
  -latitude: number
  -longitude: number
  -address: Address
  -observers: Observer[]
  +constructor(latitude, longitude)
  +subscribe(observer): void
  +reverseGeocode(): Promise<Address>
  +notifyObservers(): void
}

class LocationService {
  -currentCoords: Coordinates
  -currentAddress: Address
  -isTracking: boolean
  +getLocation(): void
  +startContinuousTracking(): void
  +buildTextToSpeech(address): string
  +speak(text): void
}

class SidraAPIManager {
  -baseUrl: string
  -cache: Map
  +displaySidraDadosParams(container, indicator, params): void
  +fetchMunicipalData(municipio, siglaUf): Promise<MunicipalData>
}

class WikipediaService {
  -baseUrl: string
  -language: string
  +searchWikipedia(searchTerm): Promise<WikiSearchResult[]>
  +getWikipediaPage(pageId): Promise<string>
  +extractCityStats(wikiData): CityStats
}

class OverpassService {
  -baseUrl: string
  -defaultRadius: number
  +getNearbyRestaurants(lat, lon, radius): Promise<Restaurant[]>
  +getNearbyServices(lat, lon, serviceType): Promise<Service[]>
}

class Address {
  +road: string
  +city: string
  +state: string
  +country: string
  +displayName: string
  +toString(): string
}

class MunicipalData {
  +municipio: string
  +population: number
  +area: number
  +getPopulationFormatted(): string
}

class CityStats {
  +population: string
  +area: string
  +otherStats: Stat[]
  +hasBasicStats(): boolean
}

WebGeocodingManager *-- ReverseGeocoder
LocationService *-- WebGeocodingManager
LocationService --> SidraAPIManager
LocationService --> WikipediaService
LocationService --> OverpassService
ReverseGeocoder --> Address
SidraAPIManager --> MunicipalData
WikipediaService --> CityStats

@enduml
```