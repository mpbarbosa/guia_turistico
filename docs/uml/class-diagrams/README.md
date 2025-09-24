# Diagramas de Classes

Esta pasta contém os diagramas de classes que documentam a estrutura do código JavaScript, modelos de dados e relacionamentos entre componentes.

## Arquivos Disponíveis

### [core-classes.md](core-classes.md)
Diagrama principal contendo todas as classes do sistema, organizadas em:

#### Classes de Controle
- **WebGeocodingManager** - Gerenciamento de geolocalização
- **LocationService** - Serviços principais de localização  
- **ReverseGeocoder** - Conversão coordenadas → endereço
- **HTMLAddressDisplayer** - Exibição de endereços na interface

#### Classes de Integração API
- **SidraAPIManager** - Integração com IBGE/SIDRA
- **WikipediaService** - Integração com Wikipedia
- **OverpassService** - Integração com OpenStreetMap
- **TextToSpeechManager** - Síntese de voz

#### Classes de Modelo de Dados
- **Address** - Modelo de endereço
- **Position** / **Coordinates** - Modelos de localização geográfica
- **MunicipalData** - Dados municipais do IBGE
- **CityStats** - Estatísticas da cidade
- **Restaurant** - Modelo de estabelecimento

## Padrões de Design Implementados

### Observer Pattern
- `WebGeocodingManager` notifica subscribers sobre mudanças de localização
- Permite reatividade a atualizações de GPS

### Strategy Pattern
- Diferentes estratégias para APIs (SIDRA, Wikipedia, Overpass)
- Facilita troca de implementações

### Facade Pattern
- `LocationService` simplifica operações complexas
- Esconde complexidade das múltiplas APIs

## Tecnologias das Classes

- **JavaScript ES6+** - Linguagem principal
- **Browser APIs** - Geolocation, Web Speech, DOM
- **REST APIs** - Integrações externas
- **JSON** - Formato de dados