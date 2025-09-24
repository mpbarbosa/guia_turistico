# UML Documentation for Guia Turístico

Este diretório contém diagramas UML e documentação arquitetural para a aplicação Guia Turístico.

## Visão Geral da Aplicação

O Guia Turístico é uma aplicação web de geolocalização que oferece informações baseadas em localização, incluindo dados estatísticos municipais, informações históricas e serviços próximos.

## Cenários de Uso Principais

1. **Guia de Rota de Viagem**: Informa sobre municípios durante viagens, incluindo dados estatísticos e história regional
2. **Suporte a Perseguição Policial**: Ajuda policiais a informar sobre ruas percorridas durante perseguições  
3. **Serviços Baseados em Localização**: Fornece informações sobre serviços próximos (cinemas em shoppings, etc.)
4. **Pontos de Encontro Social**: Permite grupos compartilharem localizações para encontros

## Estrutura da Documentação UML

### 1. Diagramas de Casos de Uso (`use-case-diagrams/`)
- Casos de uso principais do sistema
- Atores e suas interações
- Cenários de negócio

### 2. Diagramas de Classe (`class-diagrams/`)
- Estrutura das classes JavaScript
- Relacionamentos entre componentes
- Modelos de dados

### 3. Diagramas de Sequência (`sequence-diagrams/`)
- Fluxos de interação entre componentes
- Sequências de chamadas de API
- Processos de geolocalização

### 4. Diagramas de Componentes (`component-diagrams/`)
- Arquitetura de alto nível
- Dependências entre módulos
- Integração com APIs externas

## Tecnologias Principais

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **APIs**: Geolocation API, IBGE/SIDRA API, Wikipedia API, Overpass API
- **Bibliotecas Customizadas**: guia_js (geolocalização), sidra (dados IBGE)
- **Deploy**: Cloudflare Workers