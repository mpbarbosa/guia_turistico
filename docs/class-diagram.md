# Guia.js Class Diagram

This diagram shows the main classes and their relationships in the guia.js library for geolocation and address management.

```mermaid
classDiagram
    class WebGeocodingManager {
        -document: Document
        -locationResult: HTMLElement
        -subscribers: Function[]
        -watchId: number
        -currentPosition: GeolocationPosition
        -currentAddress: object
        -enderecoPadronizado: object
        +constructor(document, locationResult)
        +subscribeFunction(callback: Function)
        +startTracking(): void
        +stopTracking(): void
        +getCurrentPosition(): GeolocationPosition
        +getCurrentAddress(): object
        +getEnderecoPadronizado(): object
        -notifySubscribers(): void
        -updateLocation(position: GeolocationPosition): void
        -handleGeolocationError(error: GeolocationPositionError): void
    }

    class ReverseGeocoder {
        -latitude: number
        -longitude: number
        -observers: Observer[]
        -addressData: object
        +constructor(latitude: number, longitude: number)
        +reverseGeocode(): Promise~object~
        +subscribe(observer: Observer): void
        +unsubscribe(observer: Observer): void
        +notifyObservers(): void
        -fetchAddressFromAPI(): Promise~object~
        -parseAddressData(data: object): object
    }

    class HTMLAddressDisplayer {
        -targetElement: HTMLElement
        +constructor(targetElement: HTMLElement)
        +update(addressData: object): void
        +renderAddress(address: object): string
        +renderLocation(coords: object): string
        +clear(): void
        -formatAddress(address: object): string
        -createAddressHTML(address: object): string
    }

    class Observer {
        <<interface>>
        +update(data: object): void
    }

    class GeolocationUtils {
        <<utility>>
        +checkGeolocation(resultElement: HTMLElement): boolean
        +calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number
        +formatCoordinates(latitude: number, longitude: number): string
        +validateCoordinates(latitude: number, longitude: number): boolean
    }

    class AddressFormatter {
        <<utility>>
        +buildTextToSpeech(address: object): string
        +formatBrazilianAddress(address: object): object
        +extractMunicipioInfo(address: object): object
        +standardizeAddress(address: object): object
    }

    class SidraIntegration {
        -baseURL: string
        +displaySidraDadosParams(element: HTMLElement, indicator: string, params: object): void
        +fetchIBGEData(municipio: string, siglaUf: string): Promise~object~
        +formatIBGEData(data: object): object
        -buildSidraQuery(params: object): string
    }

    %% Relationships
    WebGeocodingManager "1" --> "many" Observer : notifies
    ReverseGeocoder "1" --> "many" Observer : notifies
    HTMLAddressDisplayer ..|> Observer : implements
    WebGeocodingManager --> ReverseGeocoder : uses
    WebGeocodingManager --> HTMLAddressDisplayer : uses
    WebGeocodingManager --> GeolocationUtils : uses
    HTMLAddressDisplayer --> AddressFormatter : uses
    WebGeocodingManager --> SidraIntegration : integrates with
    ReverseGeocoder --> GeolocationUtils : uses

    %% Notes
    note for WebGeocodingManager "Main class that manages geolocation\ntracking and coordinates with other\ncomponents for address resolution"
    note for ReverseGeocoder "Handles reverse geocoding operations\nusing external APIs to convert\ncoordinates to addresses"
    note for HTMLAddressDisplayer "Observer that renders address\ninformation in HTML format\nfor display in web pages"
```

## Class Descriptions

### WebGeocodingManager
The main orchestrator class that manages geolocation tracking, coordinates with reverse geocoding services, and notifies subscribers of location updates. It integrates with browser geolocation APIs and manages the application's location state.

### ReverseGeocoder  
Handles the conversion of latitude/longitude coordinates to human-readable addresses using external geocoding APIs. Implements the Observer pattern to notify other components when address data is available.

### HTMLAddressDisplayer
An Observer implementation that renders address information in HTML format for display in web applications. It formats and presents location data in a user-friendly way.

### GeolocationUtils
Utility class providing common geolocation operations like distance calculations, coordinate validation, and geolocation capability checks.

### AddressFormatter
Utility class for formatting address data, including Brazilian address standardization and text-to-speech preparation for location information.

### SidraIntegration
Handles integration with Brazil's IBGE SIDRA API for demographic and statistical data about municipalities, complementing location information with population and area statistics.