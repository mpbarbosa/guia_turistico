# Diagramas de Sequência

Esta pasta contém os diagramas de sequência que documentam os fluxos de interação entre componentes e as chamadas de API ao longo do tempo.

## Arquivos Disponíveis

### [location-tracking-flow.md](location-tracking-flow.md)
Documento principal contendo 6 diagramas de sequência essenciais:

#### 1. Obter Localização Inicial
- Fluxo quando usuário acessa a aplicação
- Solicitação de permissão de geolocalização
- Conversão de coordenadas em endereço

#### 2. Rastreamento Contínuo de Rota
- Monitoramento contínuo durante viagem
- Detecção de mudança de município
- Obtenção de dados estatísticos via IBGE

#### 3. Buscar Serviços Próximos
- Descoberta de restaurantes usando Overpass API
- Processamento de dados do OpenStreetMap
- Exibição de resultados com distâncias

#### 4. Obter Estatísticas da Cidade
- Busca paralela Wikipedia + IBGE
- Combinação de dados históricos e estatísticos
- Processamento e exibição unificada

#### 5. Conversão de Coordenadas
- Interface de conversão manual
- Validação de entrada
- Geocodificação reversa

#### 6. Compartilhamento de Localização em Grupo
- Funcionalidade futura de compartilhamento
- Coordenação de encontros
- Sincronização entre dispositivos

## Características dos Fluxos

### Padrões Assíncronos
- Uso extensivo de `Promise` e `async/await`
- Tratamento de erros em operações de rede
- Timeouts e fallbacks para APIs indisponíveis

### Integração com Browser APIs
- Geolocation API com handling de permissões
- Web Speech API para narração
- DOM manipulation para interface

### Caching e Performance
- Cache local para reduzir chamadas de API
- Verificação de dados existentes antes de nova consulta
- Otimização de requests paralelos

## Como Interpretar os Diagramas

### Elementos PlantUML
- `participant` - Atores/Componentes do sistema
- `activate/deactivate` - Ciclo de vida de objetos
- `alt/else/end` - Fluxos condicionais
- `loop/end` - Iterações
- `par/end` - Processamento paralelo

### Convenções Utilizadas
- **Setas sólidas** (`->`) - Chamadas síncronas
- **Setas pontilhadas** (`-->`) - Retornos/respostas
- **Notas** - Explicações de contexto
- **Ativação** - Tempo de vida do objeto