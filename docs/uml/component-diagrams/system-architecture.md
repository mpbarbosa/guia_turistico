# Diagramas de Componentes - Arquitetura do Sistema

## 1. Visão Geral da Arquitetura

Este diagrama mostra a arquitetura de alto nível do sistema Guia Turístico.

```
@startuml
!include <C4/C4_Component>

Container_Boundary(web, "Web Application") {
    Component(ui, "User Interface", "HTML5/CSS3/JavaScript", "Interface web responsiva")
    Component(core, "Core Application", "JavaScript", "Lógica principal da aplicação")
    Component(guia_js, "Guia.js Library", "JavaScript", "Biblioteca de geolocalização customizada")
    Component(sidra, "SIDRA Library", "JavaScript", "Biblioteca para integração com IBGE")
}

Container_Boundary(browser, "Browser APIs") {
    Component(geolocation, "Geolocation API", "Browser API", "API nativa de geolocalização")
    Component(speech, "Web Speech API", "Browser API", "API de síntese de voz")
    Component(dom, "DOM API", "Browser API", "Manipulação do DOM")
}

Container_Boundary(external, "External APIs") {
    Component(nominatim, "Nominatim API", "REST API", "Geocodificação reversa")
    Component(ibge_api, "IBGE/SIDRA API", "REST API", "Dados estatísticos brasileiros")
    Component(wikipedia, "Wikipedia API", "REST API", "Informações enciclopédicas")
    Component(overpass, "Overpass API", "REST API", "Dados do OpenStreetMap")
}

Container_Boundary(deploy, "Deployment") {
    Component(cloudflare, "Cloudflare Workers", "Edge Computing", "Deploy e CDN")
}

' Relações principais
ui --> core : "Chama funções"
core --> guia_js : "Usa para geolocalização"
core --> sidra : "Usa para dados IBGE"

guia_js --> geolocation : "Acessa GPS"
guia_js --> nominatim : "Geocodificação"
core --> speech : "Síntese de voz"
ui --> dom : "Manipula interface"

sidra --> ibge_api : "Busca dados municipais"
core --> wikipedia : "Busca informações da cidade"
core --> overpass : "Busca serviços próximos"

ui --> cloudflare : "Hospedado em"

@enduml
```

## 2. Arquitetura Detalhada dos Componentes Web

Este diagrama mostra os componentes internos da aplicação web e suas interações.

```
@startuml
package "Web Application Layer" {
    [index.html] as IndexPage
    [loc_em_movimento.html] as TrackingPage  
    [address_converter.html] as ConverterPage
    [guia_turistico.html] as TouristPage
}

package "JavaScript Core Layer" {
    [andarilho.js] as CoreLogic
    [Location Service] as LocationSvc
    [UI Controller] as UIController
    [Text-to-Speech Manager] as TTSManager
}

package "Custom Libraries" {
    component "guia_js" {
        [WebGeocodingManager] as WGM
        [ReverseGeocoder] as RG
        [HTMLAddressDisplayer] as HAD
    }
    
    component "sidra" {
        [SidraAPIManager] as SidraAPI
        [Municipal Data Service] as MunicipalSvc
    }
}

package "External API Services" {
    [Wikipedia Service] as WikiSvc
    [Overpass Service] as OverpassSvc
    [Geolocation Service] as GeoSvc
}

package "Data Models" {
    [Address] as AddressModel
    [Position] as PositionModel
    [MunicipalData] as MunicipalModel
    [CityStats] as CityStatsModel
    [Restaurant] as RestaurantModel
}

' Conexões entre páginas e core
IndexPage --> CoreLogic
IndexPage --> LocationSvc
TrackingPage --> WGM
ConverterPage --> RG
TouristPage --> CoreLogic

' Core para bibliotecas customizadas
CoreLogic --> WGM
CoreLogic --> SidraAPI
LocationSvc --> WGM
UIController --> HAD

' Bibliotecas para serviços externos
WGM --> GeoSvc
CoreLogic --> WikiSvc
CoreLogic --> OverpassSvc
SidraAPI --> MunicipalSvc

' Uso de modelos de dados
WGM --> AddressModel
WGM --> PositionModel
SidraAPI --> MunicipalModel
WikiSvc --> CityStatsModel
OverpassSvc --> RestaurantModel

' Serviços internos
LocationSvc --> TTSManager
UIController --> TTSManager

@enduml
```

## 3. Componentes de Integração com APIs Externas

Este diagrama foca nas integrações com APIs externas e como os dados fluem pelo sistema.

```
@startuml
!include <C4/C4_Component>

System_Boundary(guia_turistico, "Guia Turístico System") {
    
    Container_Boundary(api_layer, "API Integration Layer") {
        Component(geocoding, "Geocoding Service", "JavaScript", "Converte coordenadas em endereços")
        Component(municipal_data, "Municipal Data Service", "JavaScript", "Obtém dados municipais do IBGE")
        Component(city_info, "City Information Service", "JavaScript", "Obtém informações da Wikipedia")
        Component(nearby_services, "Nearby Services", "JavaScript", "Encontra serviços próximos")
    }
    
    Container_Boundary(data_processing, "Data Processing Layer") {
        Component(location_processor, "Location Processor", "JavaScript", "Processa dados de localização")
        Component(stats_processor, "Statistics Processor", "JavaScript", "Processa estatísticas municipais")
        Component(content_processor, "Content Processor", "JavaScript", "Processa conteúdo textual")
    }
    
    Container_Boundary(caching, "Caching Layer") {
        Component(location_cache, "Location Cache", "Browser Storage", "Cache de localizações")
        Component(municipal_cache, "Municipal Data Cache", "Browser Storage", "Cache de dados municipais")
        Component(content_cache, "Content Cache", "Browser Storage", "Cache de conteúdo")
    }
}

System_Ext(nominatim, "Nominatim API", "Geocodificação reversa OpenStreetMap")
System_Ext(ibge, "IBGE/SIDRA API", "Instituto Brasileiro de Geografia e Estatística")
System_Ext(wikipedia_api, "Wikipedia API", "API da Wikipedia em português")
System_Ext(overpass_api, "Overpass API", "Consultas ao banco de dados OpenStreetMap")

' Fluxo de dados
geocoding --> nominatim : "GET /reverse"
municipal_data --> ibge : "GET /agregados"
city_info --> wikipedia_api : "GET /w/api.php"
nearby_services --> overpass_api : "POST /interpreter"

nominatim --> location_processor : "Address data"
ibge --> stats_processor : "Statistical data"
wikipedia_api --> content_processor : "City information"
overpass_api --> location_processor : "POI data"

location_processor --> location_cache : "Cached locations"
stats_processor --> municipal_cache : "Cached statistics"
content_processor --> content_cache : "Cached content"

location_cache --> geocoding : "Cached lookups"
municipal_cache --> municipal_data : "Cached data"
content_cache --> city_info : "Cached content"

@enduml
```

## 4. Diagrama de Implantação (Deployment)

Este diagrama mostra como o sistema é implantado e distribuído.

```
@startuml
!include <C4/C4_Deployment>

Deployment_Node(user_device, "User Device", "Mobile/Desktop") {
    Deployment_Node(browser, "Web Browser", "Chrome/Safari/Firefox") {
        Container(web_app, "Guia Turístico", "HTML5/CSS3/JavaScript", "Aplicação web responsiva")
        Container(local_storage, "Browser Storage", "LocalStorage/SessionStorage", "Cache local de dados")
    }
}

Deployment_Node(cloudflare_edge, "Cloudflare Edge", "Global CDN") {
    Container(static_files, "Static Files", "HTML/CSS/JS", "Arquivos estáticos da aplicação")
    Container(workers, "Cloudflare Workers", "Edge Computing", "Lógica serverless (futuro)")
}

Deployment_Node(github, "GitHub", "Source Control") {
    Container(repository, "Source Repository", "Git", "Código fonte e documentação")
    Container(pages, "GitHub Pages", "Static Hosting", "Hospedagem alternativa")
}

Deployment_Node(external_apis, "External APIs", "Third-party Services") {
    Container(openstreetmap, "OpenStreetMap Services", "Nominatim + Overpass", "Dados geográficos")
    Container(ibge_services, "IBGE Services", "SIDRA API", "Dados estatísticos brasileiros")
    Container(wikimedia, "Wikimedia Services", "Wikipedia API", "Informações enciclopédicas")
}

' Relações de implantação
user_device --|> cloudflare_edge : "HTTPS"
cloudflare_edge --|> github : "Deploy from"
web_app --|> external_apis : "API calls"
web_app --> local_storage : "Stores cache"

' Notas sobre a arquitetura
note right of cloudflare_edge
  CDN global com cache
  automático de assets
end note

note right of external_apis
  APIs externas com
  rate limiting e cache
end note

note right of local_storage
  Cache local para
  melhor performance
  offline
end note

@enduml
```

## 5. Padrões Arquiteturais Implementados

### Observer Pattern
- **WebGeocodingManager** notifica subscribers sobre mudanças de localização
- Permite múltiplos componentes reagirem a atualizações de localização

### Strategy Pattern  
- Diferentes estratégias para obter dados: IBGE, Wikipedia, Overpass
- Permite trocar implementações de API sem afetar o código cliente

### Factory Pattern
- Criação de objetos Address, Position, MunicipalData
- Centraliza a lógica de construção de objetos complexos

### Facade Pattern
- **LocationService** oferece interface simplificada para operações complexas
- Esconde a complexidade das múltiplas APIs e bibliotecas

### Cache Pattern
- Cache local de dados municipais e endereços
- Reduz chamadas desnecessárias às APIs externas

## 6. Fluxo de Dados Principal

```
@startuml
start

:Usuário acessa aplicação;
:Browser carrega HTML/CSS/JS;

fork
  :Solicita permissão de geolocalização;
  :Obtém coordenadas GPS;
fork again
  :Carrega bibliotecas customizadas;
  :Inicializa serviços;
end fork

:Converte coordenadas em endereço;
:Exibe localização na interface;

if (Dados municipais em cache?) then (sim)
  :Carrega dados do cache;
else (não)
  :Consulta API IBGE/SIDRA;
  :Processa e armazena dados;
endif

:Exibe informações municipais;

if (Rastreamento contínuo?) then (sim)
  repeat
    :Monitora mudanças de localização;
    :Atualiza interface quando necessário;
  repeat while (Usuário não para rastreamento?)
endif

stop

@enduml
```

## Considerações de Arquitetura

### Pontos Fortes
1. **Separação de Responsabilidades**: Clara divisão entre UI, lógica de negócio e integração
2. **Modularidade**: Bibliotecas customizadas podem ser reutilizadas
3. **Extensibilidade**: Fácil adicionar novos serviços de API
4. **Performance**: Cache local reduz latência e uso de rede
5. **Responsividade**: Interface adaptável a diferentes dispositivos

### Pontos de Melhoria  
1. **Gerenciamento de Estado**: Implementar store centralizado
2. **Tratamento de Erros**: Padronizar handling de erros de API
3. **Testing**: Adicionar testes unitários e de integração
4. **Offline Support**: Implementar funcionalidade offline
5. **Security**: Adicionar validação e sanitização de dados