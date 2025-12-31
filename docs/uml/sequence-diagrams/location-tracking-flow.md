# Diagramas de Sequência - Fluxos Principais

## 1. Sequência: Obter Localização Inicial

Este diagrama mostra o fluxo quando o usuário acessa a aplicação e solicita sua localização atual.

```
@startuml
participant "Usuário" as User
participant "index.html" as UI
participant "index.js" as JS
participant "Pure Functions" as Pure
participant "WebGeocodingManager" as WGM
participant "Navigator.geolocation" as GPS
participant "ReverseGeocoder" as RG
participant "Nominatim API" as API

User -> UI: Acessa aplicação
activate UI

UI -> JS: Carrega index.js
activate JS

JS -> Pure: Inicializa funções puras
activate Pure

JS -> WGM: new WebGeocodingManager(document, locationResult)
activate WGM

LS -> WGM: subscribeFunction(callback)
WGM -> WGM: Adiciona callback aos subscribers

LS -> WGM: getSingleLocationUpdate()
WGM -> GPS: getCurrentPosition(successCallback, errorCallback, options)
activate GPS

alt Permissão concedida e GPS disponível
    GPS -> WGM: successCallback(position)
    deactivate GPS
    
    WGM -> RG: new ReverseGeocoder(lat, lon)
    activate RG
    
    WGM -> RG: reverseGeocode()
    RG -> API: GET /reverse?lat=...&lon=...
    activate API
    
    API --> RG: address data
    deactivate API
    
    RG --> WGM: Promise<Address>
    deactivate RG
    
    WGM -> WGM: notifyObservers()
    WGM -> LS: callback(position, address, enderecoPadronizado)
    
    LS -> UI: displaySidraDadosParams(container, "PopEst", params)
    UI --> User: Exibe localização e dados municipais

else Permissão negada ou GPS indisponível
    GPS -> WGM: errorCallback(positionError)
    deactivate GPS
    
    WGM -> UI: Exibe mensagem de erro
    UI --> User: "Não foi possível obter localização"
end

deactivate WGM
deactivate LS
deactivate UI

@enduml
```

## 2. Sequência: Rastreamento Contínuo de Rota

Este diagrama mostra o fluxo de rastreamento contínuo durante uma viagem.

```
@startuml
participant "Usuário" as User
participant "loc_em_movimento.html" as UI
participant "WebGeocodingManager" as WGM
participant "Navigator.geolocation" as GPS
participant "SidraAPIManager" as SIDRA
participant "TextToSpeechManager" as TTS

User -> UI: Inicia rastreamento contínuo
activate UI

UI -> WGM: startTracking()
activate WGM

WGM -> GPS: watchPosition(successCallback, errorCallback, options)
activate GPS

loop Posição atualizada continuamente
    GPS -> WGM: successCallback(newPosition)
    
    WGM -> WGM: Verifica se houve mudança significativa de localização
    
    alt Nova localização detectada
        WGM -> WGM: reverseGeocode(lat, lon)
        WGM -> WGM: notifyObservers()
        WGM -> UI: callback(position, newAddress, enderecoPadronizado)
        
        alt Município mudou
            UI -> SIDRA: displaySidraDadosParams(container, "PopEst", params)
            activate SIDRA
            
            SIDRA -> SIDRA: fetchMunicipalData(municipio, siglaUf)
            SIDRA --> UI: Dados municipais (população, área)
            deactivate SIDRA
            
            UI -> UI: buildTextToSpeech(enderecoPadronizado)
            UI -> TTS: speak(text)
            activate TTS
            TTS --> User: Narração sobre novo município
            deactivate TTS
        end
        
        UI --> User: Atualiza interface com nova localização
    end
end

User -> UI: Para rastreamento
UI -> WGM: stopTracking()
WGM -> GPS: clearWatch(watchId)
deactivate GPS

deactivate WGM
deactivate UI

@enduml
```

## 3. Sequência: Buscar Serviços Próximos

Este diagrama mostra como o sistema busca restaurantes ou outros serviços próximos.

```
@startuml
participant "Usuário" as User
participant "index.html" as UI
participant "LocationService" as LS
participant "OverpassService" as OS
participant "Overpass API" as API

User -> UI: Clica "Find Nearby Restaurants"
activate UI

UI -> LS: findNearbyRestaurants()
activate LS

LS -> LS: Verifica se localização atual está disponível
alt Localização disponível
    LS -> OS: getNearbyRestaurants(lat, lon, radius)
    activate OS
    
    OS -> OS: buildOverpassQuery(lat, lon, radius, "restaurant")
    OS -> API: POST query
    activate API
    
    API --> OS: XML response com estabelecimentos
    deactivate API
    
    OS -> OS: parseOverpassResponse(response)
    OS --> LS: Promise<Restaurant[]>
    deactivate OS
    
    LS -> LS: Processa lista de restaurantes
    LS -> UI: Atualiza DOM com lista de restaurantes
    UI --> User: Exibe restaurantes próximos com distâncias

else Localização não disponível
    LS -> UI: Exibe erro "Localização não disponível"
    UI --> User: Mensagem de erro
end

deactivate LS
deactivate UI

@enduml
```

## 4. Sequência: Obter Estatísticas da Cidade

Este diagrama mostra como o sistema obtém estatísticas detalhadas de uma cidade.

```
@startuml
participant "Usuário" as User
participant "index.html" as UI  
participant "LocationService" as LS
participant "WikipediaService" as WS
participant "Wikipedia API" as WikiAPI
participant "SidraAPIManager" as SIDRA
participant "SIDRA API" as SidraAPI

User -> UI: Clica "Get City Statistics"
activate UI

UI -> LS: getCityStats()
activate LS

LS -> LS: Identifica cidade atual a partir do endereço
LS -> WS: searchWikipedia(cityName)
activate WS

WS -> WikiAPI: GET /w/api.php?action=query&list=search&srsearch=...
activate WikiAPI

WikiAPI --> WS: JSON com resultados da busca
deactivate WikiAPI

WS -> WS: Seleciona primeiro resultado (mais relevante)
WS -> WikiAPI: GET /w/api.php?action=query&pageids=...&prop=extracts
activate WikiAPI

WikiAPI --> WS: Conteúdo da página da cidade
deactivate WikiAPI

WS -> WS: extractCityStats(pageContent)
WS --> LS: Promise<CityStats>
deactivate WS

par Busca paralela de dados IBGE
    LS -> SIDRA: fetchMunicipalData(municipio, siglaUf)
    activate SIDRA
    
    SIDRA -> SidraAPI: GET dados populacionais e geográficos
    activate SidraAPI
    
    SidraAPI --> SIDRA: Dados oficiais IBGE
    deactivate SidraAPI
    
    SIDRA --> LS: MunicipalData
    deactivate SIDRA
end

LS -> LS: Combina dados Wikipedia + IBGE
LS -> UI: Atualiza interface com estatísticas completas
UI --> User: Exibe população, área, densidade, história, etc.

deactivate LS
deactivate UI

@enduml
```

## 5. Sequência: Conversão de Coordenadas

Este diagrama mostra o fluxo da página de conversão de coordenadas.

```
@startuml
participant "Usuário" as User
participant "address-converter.html" as UI
participant "ReverseGeocoder" as RG
participant "HTMLAddressDisplayer" as HAD
participant "Nominatim API" as API

User -> UI: Acessa página de conversão
activate UI

User -> UI: Insere latitude e longitude
User -> UI: Clica "Get Address"

UI -> UI: validateCoordinates(lat, lon)
alt Coordenadas válidas
    UI -> RG: new ReverseGeocoder(latitude, longitude)
    activate RG
    
    UI -> HAD: new HTMLAddressDisplayer(resultsDiv)
    activate HAD
    
    UI -> RG: subscribe(htmlDisplayer)
    RG -> RG: Adiciona observer
    
    UI -> RG: reverseGeocode()
    RG -> API: GET /reverse?lat=...&lon=...&format=json
    activate API
    
    API --> RG: JSON com dados do endereço
    deactivate API
    
    RG -> RG: parseNominatimResponse(response)
    RG -> RG: notifyObservers()
    RG -> HAD: update(address)
    
    HAD -> HAD: renderAddress(address)
    HAD -> UI: Atualiza DOM com endereço formatado
    UI --> User: Exibe endereço completo e link para mapa

else Coordenadas inválidas
    UI -> UI: showError("Invalid coordinates")
    UI --> User: Mensagem de erro
end

deactivate HAD
deactivate RG
deactivate UI

@enduml
```

## 6. Sequência: Compartilhamento de Localização em Grupo

Este diagrama mostra como funcionaria o compartilhamento de localização (funcionalidade futura).

```
@startuml
participant "Usuário A" as UserA
participant "App Instance A" as AppA
participant "Usuário B" as UserB  
participant "App Instance B" as AppB
participant "Shared Storage\n(Future)" as Storage

UserA -> AppA: Inicia compartilhamento de localização
activate AppA

AppA -> AppA: getCurrentPosition()
AppA -> Storage: createLocationShare(groupId, userId, position)
activate Storage

Storage --> AppA: shareId
AppA --> UserA: Código/Link de compartilhamento

UserA -> UserB: Compartilha código/link
UserB -> AppB: Acessa link de compartilhamento
activate AppB

AppB -> Storage: subscribeToLocationShare(shareId)
Storage -> AppB: Posição atual do Usuário A
AppB --> UserB: Exibe localização do Usuário A no mapa

loop Atualizações de localização
    AppA -> Storage: updateLocation(shareId, newPosition)
    Storage -> AppB: Notifica nova posição
    AppB --> UserB: Atualiza posição no mapa
end

alt Usuário A chega ao destino
    AppA -> Storage: endLocationShare(shareId)
    Storage -> AppB: Notifica fim do compartilhamento
    AppB --> UserB: "Compartilhamento encerrado"
end

deactivate Storage
deactivate AppB
deactivate AppA

@enduml
```