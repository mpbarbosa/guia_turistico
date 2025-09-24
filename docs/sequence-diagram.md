# Guia.js Sequence Diagrams

This document contains sequence diagrams showing the typical workflows in the guia.js geolocation system.

## Location Tracking Workflow

```mermaid
sequenceDiagram
    participant User
    participant WebPage as Web Page
    participant WGM as WebGeocodingManager
    participant Browser as Browser Geolocation
    participant RG as ReverseGeocoder
    participant API as Geocoding API
    participant HAD as HTMLAddressDisplayer
    participant SIDRA as SidraIntegration

    User->>WebPage: Load page / init()
    WebPage->>WGM: new WebGeocodingManager(document, locationResult)
    WebPage->>WGM: subscribeFunction(callback)
    WebPage->>WGM: startTracking()
    
    WGM->>Browser: navigator.geolocation.watchPosition()
    Browser-->>User: Request location permission
    User-->>Browser: Grant permission
    
    loop Continuous Tracking
        Browser->>WGM: position update
        WGM->>RG: new ReverseGeocoder(lat, lon)
        WGM->>HAD: new HTMLAddressDisplayer(element)
        WGM->>RG: subscribe(HTMLAddressDisplayer)
        
        WGM->>RG: reverseGeocode()
        RG->>API: fetch address data
        API-->>RG: address response
        RG->>RG: parseAddressData()
        RG->>HAD: notifyObservers() / update()
        HAD->>WebPage: render address HTML
        
        WGM->>WGM: notifySubscribers()
        WGM->>WebPage: callback(position, address, enderecoPadronizado)
        WebPage->>SIDRA: displaySidraDadosParams()
        SIDRA->>SIDRA: fetchIBGEData()
        SIDRA->>WebPage: display municipality stats
    end
```

## Address Conversion Workflow

```mermaid
sequenceDiagram
    participant User
    participant WebPage as Address Converter Page
    participant RG as ReverseGeocoder
    participant API as Geocoding API
    participant HAD as HTMLAddressDisplayer

    User->>WebPage: Enter coordinates
    User->>WebPage: Click "Get Address"
    WebPage->>WebPage: validateCoordinates()
    
    alt Valid coordinates
        WebPage->>RG: new ReverseGeocoder(lat, lon)
        WebPage->>HAD: new HTMLAddressDisplayer(resultsDiv)
        WebPage->>RG: subscribe(HTMLAddressDisplayer)
        
        WebPage->>RG: reverseGeocode()
        RG->>API: fetch address data
        API-->>RG: address response
        RG->>RG: parseAddressData()
        RG->>HAD: notifyObservers() / update()
        HAD->>WebPage: render formatted address
        
    else Invalid coordinates
        WebPage->>WebPage: showError("Invalid coordinates")
    end
```

## Restaurant Finding Workflow

```mermaid
sequenceDiagram
    participant User
    participant WebPage as Main Page
    participant Andarilho as andarilho.js
    participant OverpassAPI as Overpass API
    participant Utils as GeolocationUtils

    User->>WebPage: Click "Find Nearby Restaurants"
    WebPage->>Andarilho: findNearbyRestaurants()
    
    alt Location available
        Andarilho->>OverpassAPI: getNearbyRestaurants(lat, lon, radius)
        OverpassAPI-->>Andarilho: restaurant data
        
        loop For each restaurant
            Andarilho->>Utils: calculateDistance(userLat, userLon, restaurantLat, restaurantLon)
            Utils-->>Andarilho: distance
        end
        
        Andarilho->>Andarilho: sort by distance
        Andarilho->>WebPage: render restaurant list
        
    else No location
        Andarilho->>User: alert("Please get your location first")
    end
```

## City Statistics Workflow

```mermaid
sequenceDiagram
    participant User
    participant WebPage as Main Page
    participant Andarilho as andarilho.js
    participant WikiAPI as Wikipedia API

    User->>WebPage: Click "Get City Statistics"
    WebPage->>Andarilho: getCityStats()
    
    alt Address available
        Andarilho->>Andarilho: extract city name from currentAddress
        Andarilho->>WikiAPI: searchWikipedia(cityName + state + country)
        WikiAPI-->>Andarilho: search results
        
        alt Results found
            Andarilho->>WikiAPI: getWikipediaPage(pageId)
            WikiAPI-->>Andarilho: page content
            Andarilho->>Andarilho: extractCityStats(content)
            Andarilho->>WebPage: render city statistics
        else No results
            Andarilho->>WebPage: show "No Wikipedia article found"
        end
        
    else No address
        Andarilho->>User: alert("City information not available")
    end
```

## Error Handling Workflow

```mermaid
sequenceDiagram
    participant User
    participant WGM as WebGeocodingManager
    participant Browser as Browser Geolocation
    participant WebPage as Web Page

    WGM->>Browser: request geolocation
    Browser-->>User: permission request
    
    alt Permission denied
        User-->>Browser: deny permission
        Browser->>WGM: PERMISSION_DENIED error
        WGM->>WebPage: display error message
        WGM->>WebPage: disable location-dependent buttons
        
    else Location unavailable
        Browser->>WGM: POSITION_UNAVAILABLE error
        WGM->>WebPage: display "Location unavailable" message
        
    else Timeout
        Browser->>WGM: TIMEOUT error
        WGM->>WebPage: display "Location request timed out"
        
    else Success
        Browser->>WGM: position data
        WGM->>WebPage: continue normal flow
    end
```

## Key Workflow Patterns

### Observer Pattern
The system extensively uses the Observer pattern:
- `ReverseGeocoder` notifies observers when address data is ready
- `WebGeocodingManager` notifies subscribers when location updates occur
- `HTMLAddressDisplayer` implements the Observer interface to update UI

### Asynchronous Operations
All external API calls are asynchronous:
- Geolocation API calls use callbacks/promises
- Reverse geocoding API calls return promises
- Wikipedia and Overpass API calls are async/await based

### Error Handling Strategy
The system implements comprehensive error handling:
- Geolocation errors are categorized and user-friendly messages displayed
- API failures are caught and gracefully handled
- Input validation prevents invalid API calls

### Integration Points
The system integrates with multiple external services:
- Browser Geolocation API for location tracking
- Geocoding APIs for address resolution
- IBGE SIDRA API for Brazilian municipality statistics
- Wikipedia API for city information
- Overpass API for nearby places/restaurants