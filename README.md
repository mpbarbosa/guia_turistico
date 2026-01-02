# Guia Turístico

**Versão:** 0.6.0 🚀  
**Status:** Production Ready  
**Última Atualização:** 2026-01-02

Uma aplicação web de geolocalização que oferece informações contextuais baseadas na localização do usuário, incluindo dados estatísticos municipais, informações históricas e serviços próximos.

## 🎯 Cenários de Uso

### 1. 🚗 Guia de Rota de Viagem
Acompanha o usuário durante viagens entre cidades, informando:
- Municípios pelos quais está passando
- Dados estatísticos (população estimada, área territorial)
- História e informações regionais
- Clima da cidade destino
- Velocidade média e cidades à frente

### 2. 🚓 Suporte a Perseguição Policial  
Auxilia policiais durante perseguições fornecendo:
- Nomes das ruas percorridas em tempo real
- Narração automática via síntese de voz
- Rastreamento contínuo de localização

### 3. 📍 Serviços Baseados em Localização
Informa sobre serviços e estabelecimentos próximos:
- Restaurantes e estabelecimentos comerciais
- Filmes em exibição em shoppings próximos
- Pontos de interesse baseados na localização atual

### 4. 👥 Pontos de Encontro Social
Facilita encontros em grupo através de:
- Compartilhamento de localização entre membros
- Coordenação de pontos de encontro
- Encerramento automático quando todos chegam ao local

## 🏗️ Arquitetura

### Single Page Application (SPA) ✨

A aplicação foi **consolidada em SPA moderna** para produção:

- **Frontend**: 
  - **SPA (Single Page Application)** - Hash-based routing
  - HTML5, CSS3, JavaScript vanilla (ES6 modules)
  - Mobile-first responsive design
  - Material Design 3 UI components
  - Progressive Web App (PWA) with service worker
  - Offline-first architecture

- **Padrões de Design**: 
  - HTML/CSS/JS em arquivos separados
  - Funções puras para lógica de negócio (testáveis)
  - Separação entre lógica pura e efeitos colaterais
  - View lifecycle management (render → mount → cleanup)
  - Modular view-based architecture

- **APIs Integradas**: 
  - Geolocation API
  - IBGE/SIDRA (dados estatísticos brasileiros)
  - Wikipedia API (informações históricas)
  - Overpass API / OpenStreetMap (geocodificação)

- **Bibliotecas Customizadas**: 
  - `guia_js` v0.6.0-alpha (geolocalização - CDN)
  - `sidra` (integração IBGE - CDN)

- **Deploy**: Cloudflare Workers / Pages

### 🎉 SPA Migration Complete (v0.6.0)

O projeto foi **completamente migrado** para arquitetura SPA:

- ✅ **Router hash-based** com navegação client-side
- ✅ **View lifecycle management** (mount/cleanup)
- ✅ **Service worker** para suporte offline
- ✅ **View transitions** suaves e acessíveis
- ✅ **Toast notifications** system
- ✅ **Legacy files archived** em `src/legacy/`
- ✅ **Production ready** com testes (98.5% pass rate)
- 📖 **Documentação**: [SPA Migration](docs/spa_migration/README.md)
- 🚀 **Deploy Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

**Acesso**: `src/index.html` (SPA principal)  
**Rotas**: `#/`, `#/converter`, `#/tracking`

## 📚 Documentação

A documentação completa do projeto, incluindo diagramas UML e especificações arquiteturais, está disponível em:

**[📋 Documentação Técnica Completa](docs/README.md)**

### Diagramas UML Disponíveis
- **[Casos de Uso](docs/uml/use-case-diagrams/main-use-cases.md)** - Cenários e atores do sistema
- **[Classes](docs/uml/class-diagrams/core-classes.md)** - Estrutura das classes JavaScript
- **[Sequência](docs/uml/sequence-diagrams/location-tracking-flow.md)** - Fluxos de interação
- **[Componentes](docs/uml/component-diagrams/system-architecture.md)** - Arquitetura do sistema

### Guias de Desenvolvimento
- **[Transparência Referencial](.github/REFERENTIAL_TRANSPARENCY.md)** - Princípios de funções puras e programação funcional
- **[Separação HTML/CSS/JS](.github/HTML_CSS_JS_SEPARATION.md)** - Separação de camadas e responsabilidades
- **[Alta Coesão](.github/HIGH_COHESION_GUIDE.md)** - Organização de código com alta coesão
- **[Baixo Acoplamento](.github/LOW_COUPLING_GUIDE.md)** - Gerenciamento de dependências
- **[Padrões JSDoc 3](docs/JSDOC_STANDARDS.md)** - ✨ **Documentação de código com JSDoc 3 (100% cobertura)**

## 🚀 Como Usar

### Acesso Web (SPA)

**Aplicação Principal:** `src/index.html`

**Rotas Disponíveis:**
- `#/` - Página inicial (informações sobre localização atual)
- `#/converter` - Conversor de coordenadas para endereço
- `#/tracking` - Rastreamento contínuo em movimento

### Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/mpbarbosa/guia_turistico.git

# Entre no diretório
cd guia_turistico

# Instale as dependências (para testes)
npm install

# Sirva os arquivos estaticamente
cd src && python3 -m http.server 8080

# Acesse no navegador
# http://localhost:8080/
```

### Deploy para Produção

```bash
# Login no Cloudflare (primeira vez)
npx wrangler login

# Deploy da aplicação
npx wrangler pages deploy src --project-name=guia-turistico

# Ou use o wrangler.jsonc configurado
npx wrangler deploy
```

**📖 Guia completo**: [DEPLOYMENT.md](DEPLOYMENT.md)

### Arquivos Legados

Os arquivos da versão multi-page foram arquivados em `src/legacy/`:
- `legacy/index.html` - Página inicial antiga
- `legacy/loc-em-movimento.html` - Rastreamento antigo
- `legacy/address-converter.html` - Conversor antigo

## 🔧 Tecnologias

- **HTML5**: Interface e estrutura
- **CSS3**: Estilização responsiva
- **JavaScript ES6+**: Lógica da aplicação
- **Geolocation API**: Localização do usuário
- **Web Speech API**: Síntese de voz
- **APIs Externas**: IBGE, Wikipedia, OpenStreetMap

## 📱 Compatibilidade

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móveis (iOS, Android)
- ✅ Desktop (Windows, macOS, Linux)
- ⚠️ Requer HTTPS para Geolocation API

## 🧪 Testes

O projeto possui suíte completa de testes automatizados:

### Executar Todos os Testes
```bash
npm test
# Ou
npm run test:all
```

### Testes Unitários (Jest)
```bash
# Executar testes unitários
npm run test:unit

# Executar com watch mode
npm run test:unit:watch

# Gerar relatório de cobertura
npm run test:unit:coverage
```

**Cobertura Atual:**
- ✅ **197 test cases** (194 passing = 98.5%)
- ✅ Router: 24 tests (21 passing)
- ✅ Toast: 40+ tests (100% passing)
- ✅ Pure functions: 133 tests (100% passing)

### Testes de Integração (Selenium)
```bash
# Executar testes de integração
npm run test:integration

# Ou manualmente
cd tests/integration && ./run_tests.sh
```

### Documentação de Testes
- **[Visão Geral dos Testes](tests/TEST_SUITE_OVERVIEW.md)** - Estatísticas e resumo
- **[Testes de Integração](INTEGRATION_TESTS.md)** - Guia Selenium
- **[Testes Unitários](tests/unit/README.md)** - Documentação Jest

**Arquitetura de Testes:**
- ✅ Testes unitários para funções puras (Jest + jsdom)
- ✅ Testes de integração para fluxos de usuário (Selenium)
- ✅ CI/CD com GitHub Actions (workflow automático)
- ✅ Cobertura mínima: 70% (atual: 98.5%)
- ✅ Teste de acessibilidade (WCAG 2.1 AA)
- ✅ Teste de performance (Core Web Vitals) 