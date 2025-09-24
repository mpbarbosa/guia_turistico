# Diagramas de Casos de Uso

Esta pasta contém os diagramas de casos de uso que documentam os requisitos funcionais e cenários de negócio do sistema Guia Turístico.

## Arquivos Disponíveis

### [main-use-cases.md](main-use-cases.md)
Diagrama principal contendo todos os casos de uso do sistema, incluindo:

- **UC001**: Obter Localização Atual
- **UC002**: Rastrear Rota de Viagem  
- **UC003**: Informar Ruas Durante Perseguição
- **UC004**: Descobrir Serviços Próximos
- **UC005**: Obter Estatísticas da Cidade
- **UC006**: Compartilhar Localização em Grupo
- **UC007**: Converter Coordenadas em Endereço

## Atores do Sistema

- **Usuário (Turista)** - Pessoa viajando entre cidades
- **Usuário (Policial)** - Policial em operação de perseguição
- **Usuário (Pessoa Local)** - Pessoa buscando serviços próximos
- **Membro do Grupo** - Participante de encontro social

## Sistemas Externos

- **Sistema de Geolocalização** (Browser)
- **API IBGE/SIDRA** (Dados estatísticos brasileiros)
- **API Wikipedia** (Informações enciclopédicas)
- **API Overpass** (Dados OpenStreetMap)
- **Sistema de Síntese de Voz** (Browser)

## Como Visualizar os Diagramas

Os diagramas estão em formato PlantUML. Para visualizá-los:

1. **Online**: Copie o código PlantUML para [PlantText](https://www.planttext.com/)
2. **VS Code**: Instale a extensão PlantUML
3. **Linha de comando**: Use `java -jar plantuml.jar arquivo.puml`