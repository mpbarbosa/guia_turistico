# Documentação do Projeto Guia Turístico

Esta pasta contém toda a documentação técnica e arquitetural do projeto Guia Turístico.

## Estrutura da Documentação

### 📋 Documentação UML (`uml/`)
Documentação arquitetural completa com diagramas UML:

- **[Diagramas de Casos de Uso](uml/use-case-diagrams/main-use-cases.md)** - Cenários de uso e atores do sistema
- **[Diagramas de Classe](uml/class-diagrams/core-classes.md)** - Estrutura das classes JavaScript e modelos de dados  
- **[Diagramas de Sequência](uml/sequence-diagrams/location-tracking-flow.md)** - Fluxos de interação entre componentes
- **[Diagramas de Componentes](uml/component-diagrams/system-architecture.md)** - Arquitetura de alto nível e integrações

### 📁 Estrutura de Diretórios (`arvore_dirs.txt`)
Documenta a estrutura organizacional recomendada para projetos web.

## Visão Geral do Sistema

### Aplicação
O **Guia Turístico** é uma aplicação web HTML5 que fornece informações baseadas em localização, desenvolvida com foco em:

- **Geolocalização em tempo real** usando APIs nativas do browser
- **Dados estatísticos municipais** através da integração com IBGE/SIDRA
- **Informações históricas e turísticas** via Wikipedia
- **Serviços próximos** usando dados do OpenStreetMap
- **Interface responsiva** para dispositivos móveis e desktop

### Cenários de Uso Principais

1. **🚗 Guia de Rota de Viagem**
   - Acompanha o usuário durante viagens
   - Informa sobre municípios percorridos
   - Fornece dados estatísticos e históricos

2. **🚓 Suporte a Perseguição Policial**
   - Rastreamento de ruas durante perseguições
   - Informações de localização em tempo real
   - Narração automática via síntese de voz

3. **📍 Serviços Baseados em Localização**
   - Descoberta de restaurantes e serviços próximos
   - Informações contextuais (ex: filmes no shopping)
   - Integração com dados do OpenStreetMap

4. **👥 Pontos de Encontro Social**
   - Compartilhamento de localização em grupos
   - Coordenação de encontros
   - Notificações de chegada

### Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **APIs**: Geolocation, Web Speech, IBGE/SIDRA, Wikipedia, Overpass
- **Bibliotecas Customizadas**: 
  - `guia_js` (geolocalização e geocodificação)
  - `sidra` (integração com dados IBGE)
- **Deploy**: Cloudflare Workers
- **Versionamento**: Git com submódulos

## Como Usar Esta Documentação

### Para Desenvolvedores
1. **Comece com os [Casos de Uso](uml/use-case-diagrams/main-use-cases.md)** para entender os requisitos
2. **Estude a [Arquitetura de Componentes](uml/component-diagrams/system-architecture.md)** para visão geral do sistema
3. **Analise os [Diagramas de Classe](uml/class-diagrams/core-classes.md)** para implementação
4. **Acompanhe os [Fluxos de Sequência](uml/sequence-diagrams/location-tracking-flow.md)** para integração

### Para Arquitetos e Gestores
1. **[Visão Geral da Arquitetura](uml/component-diagrams/system-architecture.md#1-visão-geral-da-arquitetura)**
2. **[Casos de Uso de Negócio](uml/use-case-diagrams/main-use-cases.md#casos-de-uso-principais)**
3. **[Padrões Arquiteturais](uml/component-diagrams/system-architecture.md#5-padrões-arquiteturais-implementados)**

### Para Testadores
1. **[Fluxos de Teste](uml/sequence-diagrams/location-tracking-flow.md)** - Cenários de teste baseados em sequências
2. **[Casos de Uso](uml/use-case-diagrams/main-use-cases.md)** - Critérios de aceitação por cenário

## Ferramentas para Visualização

Os diagramas estão em formato PlantUML (texto) e podem ser visualizados usando:

### Online
- [PlantText](https://www.planttext.com/) - Editor online simples
- [PlantUML Server](http://www.plantuml.com/plantuml/) - Servidor oficial

### Extensões de Editor
- **VS Code**: PlantUML Extension
- **IntelliJ IDEA**: PlantUML Integration Plugin  
- **Sublime Text**: PlantUML Plugin

### Linha de Comando
```bash
# Instalar PlantUML (requer Java)
java -jar plantuml.jar diagram.puml
```

## Contribuindo com a Documentação

### Padrões de Documentação
- Use **português brasileiro** para texto descritivo
- Mantenha **diagramas UML** em formato PlantUML
- Documente **decisões arquiteturais** com justificativas
- Inclua **exemplos práticos** quando possível

### Estrutura de Commits
- `docs: adiciona diagrama de casos de uso`
- `docs: atualiza arquitetura de componentes`
- `docs: corrige fluxo de sequência de login`

### Processo de Revisão
1. Valide diagramas UML com ferramentas online
2. Garanta consistência com código existente
3. Solicite revisão de arquiteto técnico
4. Atualize índices e referências cruzadas