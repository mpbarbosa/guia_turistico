# Diagrama de Casos de Uso - Guia Turístico

## Atores

### Ator Principal: Usuário
- Turista em viagem
- Policial em perseguição  
- Pessoa procurando serviços locais
- Membro de grupo social

### Atores Secundários (Sistemas Externos)
- Sistema de Geolocalização (Browser)
- API IBGE/SIDRA
- API Wikipedia
- API Overpass (OpenStreetMap)
- Sistema de Síntese de Voz (Browser)

## Casos de Uso Principais

### UC001: Obter Localização Atual
**Ator**: Usuário, Sistema de Geolocalização  
**Descrição**: Usuário solicita sua localização atual através do navegador  
**Fluxo Principal**:
1. Usuário acessa a aplicação
2. Sistema solicita permissão de geolocalização
3. Usuário concede permissão
4. Sistema obtém coordenadas GPS
5. Sistema converte coordenadas em endereço
6. Sistema exibe localização atual

**Fluxo Alternativo**:
- 3a. Usuário nega permissão → Sistema exibe erro
- 4a. GPS indisponível → Sistema exibe erro de localização

### UC002: Rastrear Rota de Viagem
**Ator**: Usuário (Turista), Sistema de Geolocalização, API IBGE  
**Descrição**: Acompanhar continuamente a localização durante viagem e informar dados dos municípios  
**Fluxo Principal**:
1. Usuário inicia rastreamento de rota
2. Sistema inicia monitoramento contínuo de localização
3. Sistema detecta mudança de município
4. Sistema consulta dados estatísticos do novo município (IBGE)
5. Sistema exibe informações do município (população, área)
6. Sistema pode narrar informações via síntese de voz
7. Processo continua até usuário parar o rastreamento

### UC003: Informar Ruas Durante Perseguição
**Ator**: Usuário (Policial), Sistema de Geolocalização  
**Descrição**: Informar continuamente as ruas percorridas durante uma perseguição  
**Fluxo Principal**:
1. Policial inicia modo de perseguição
2. Sistema rastreia localização em alta frequência
3. Sistema identifica mudanças de rua
4. Sistema informa nome da rua atual
5. Sistema pode narrar nome das ruas via síntese de voz
6. Processo continua até fim da perseguição

### UC004: Descobrir Serviços Próximos
**Ator**: Usuário, API Overpass  
**Descrição**: Encontrar serviços e estabelecimentos próximos à localização atual  
**Fluxo Principal**:
1. Usuário solicita busca de serviços próximos
2. Sistema obtém localização atual
3. Sistema consulta API Overpass para estabelecimentos próximos
4. Sistema filtra por tipo de serviço (restaurantes, cinemas, etc.)
5. Sistema exibe lista de estabelecimentos com distância
6. Usuário pode obter direções para estabelecimento escolhido

### UC005: Obter Estatísticas da Cidade
**Ator**: Usuário, API Wikipedia, API IBGE  
**Descrição**: Obter informações estatísticas e históricas sobre a cidade atual  
**Fluxo Principal**:
1. Usuário solicita estatísticas da cidade
2. Sistema identifica cidade atual
3. Sistema consulta Wikipedia para informações da cidade
4. Sistema consulta IBGE para dados estatísticos oficiais
5. Sistema processa e estrutura informações
6. Sistema exibe dados (população, área, densidade, história)

### UC006: Compartilhar Localização em Grupo
**Ator**: Usuário (Membro do Grupo)  
**Descrição**: Compartilhar localização atual com grupo para encontro  
**Fluxo Principal**:
1. Usuário inicia compartilhamento de localização
2. Sistema obtém localização atual
3. Sistema gera link ou código de compartilhamento
4. Usuário compartilha com grupo
5. Membros do grupo podem visualizar localização
6. Sistema encerra compartilhamento quando todos chegam ao local

### UC007: Converter Coordenadas em Endereço
**Ator**: Usuário  
**Descrição**: Converter coordenadas latitude/longitude em endereço legível  
**Fluxo Principal**:
1. Usuário insere coordenadas (lat/long)
2. Sistema valida formato das coordenadas
3. Sistema consulta serviço de geocodificação reversa
4. Sistema obtém endereço correspondente
5. Sistema exibe endereço formatado

## Relacionamentos entre Casos de Uso

- **Incluem**: 
  - UC002, UC003, UC004, UC005, UC006 **incluem** UC001 (Obter Localização Atual)
  - UC002 **inclui** UC005 (Obter Estatísticas da Cidade)

- **Estendem**:
  - UC003 **estende** UC002 (modo especializado para perseguição)
  - UC006 **estende** UC001 (adiciona funcionalidade de compartilhamento)

## Diagrama UML em Texto

```
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Usuário\n(Turista)" as Tourist
actor "Usuário\n(Policial)" as Police  
actor "Usuário\n(Pessoa Local)" as Local
actor "Membro do Grupo" as GroupMember

actor "Sistema de\nGeolocalização" as GPS
actor "API IBGE/SIDRA" as IBGE
actor "API Wikipedia" as Wiki
actor "API Overpass" as Overpass
actor "Sistema de\nSíntese de Voz" as TTS

rectangle "Sistema Guia Turístico" {
  usecase "Obter Localização\nAtual" as UC001
  usecase "Rastrear Rota\nde Viagem" as UC002
  usecase "Informar Ruas Durante\nPerseguição" as UC003
  usecase "Descobrir Serviços\nPróximos" as UC004
  usecase "Obter Estatísticas\nda Cidade" as UC005
  usecase "Compartilhar Localização\nem Grupo" as UC006
  usecase "Converter Coordenadas\nem Endereço" as UC007
}

Tourist --> UC002
Police --> UC003
Local --> UC004
Local --> UC005
GroupMember --> UC006
Tourist --> UC007
Local --> UC007

UC002 .> UC001 : <<include>>
UC003 .> UC001 : <<include>>
UC004 .> UC001 : <<include>>
UC005 .> UC001 : <<include>>
UC006 .> UC001 : <<include>>
UC002 .> UC005 : <<include>>

UC003 .> UC002 : <<extend>>
UC006 .> UC001 : <<extend>>

UC001 --> GPS
UC002 --> IBGE
UC005 --> Wiki
UC005 --> IBGE
UC004 --> Overpass
UC002 --> TTS
UC003 --> TTS

@enduml
```