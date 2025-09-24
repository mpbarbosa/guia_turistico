# Guia Turístico

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

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **APIs Integradas**: Geolocation, IBGE/SIDRA, Wikipedia, Overpass (OpenStreetMap)
- **Bibliotecas Customizadas**: 
  - `guia_js` (geolocalização e geocodificação)
  - `sidra` (integração com dados IBGE)
- **Deploy**: Cloudflare Workers

## 📚 Documentação

A documentação completa do projeto, incluindo diagramas UML e especificações arquiteturais, está disponível em:

**[📋 Documentação Técnica Completa](docs/README.md)**

### Diagramas UML Disponíveis
- **[Casos de Uso](docs/uml/use-case-diagrams/main-use-cases.md)** - Cenários e atores do sistema
- **[Classes](docs/uml/class-diagrams/core-classes.md)** - Estrutura das classes JavaScript
- **[Sequência](docs/uml/sequence-diagrams/location-tracking-flow.md)** - Fluxos de interação
- **[Componentes](docs/uml/component-diagrams/system-architecture.md)** - Arquitetura do sistema

## 🚀 Como Usar

### Acesso Web
- **Página Principal**: `src/index.html` - Interface principal com funcionalidades básicas
- **Rastreamento**: `src/loc_em_movimento.html` - Rastreamento contínuo durante viagem
- **Conversor**: `src/address_converter.html` - Conversão de coordenadas em endereços

### Desenvolvimento Local
```bash
# Clone o repositório
git clone https://github.com/mpbarbosa/guia_turistico.git

# Inicialize os submódulos (bibliotecas customizadas)
git submodule update --init --recursive

# Sirva os arquivos estaticamente (exemplo com Python)
cd src && python -m http.server 8000
```

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