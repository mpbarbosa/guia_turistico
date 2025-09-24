# Guia Turístico - UML Documentation

This directory contains UML diagrams in Mermaid format to help understand the architecture and workflows of the guia.js library.

## Files

### [class-diagram.md](./class-diagram.md)
Contains the class diagram showing the main classes and their relationships in the guia.js geolocation system:

- **WebGeocodingManager**: Main orchestrator for geolocation tracking
- **ReverseGeocoder**: Handles coordinate-to-address conversion
- **HTMLAddressDisplayer**: Renders address information in HTML
- **GeolocationUtils**: Utility functions for geolocation operations
- **AddressFormatter**: Formats address data for display and speech
- **SidraIntegration**: Integrates with IBGE SIDRA API for Brazilian statistics

### [sequence-diagram.md](./sequence-diagram.md)
Contains multiple sequence diagrams showing the typical workflows:

1. **Location Tracking Workflow**: Shows how continuous location tracking works
2. **Address Conversion Workflow**: Shows the coordinate-to-address conversion process
3. **Restaurant Finding Workflow**: Shows how nearby restaurants are found using Overpass API
4. **City Statistics Workflow**: Shows how city information is retrieved from Wikipedia
5. **Error Handling Workflow**: Shows how various geolocation errors are handled

## Viewing the Diagrams

These diagrams use Mermaid syntax and can be viewed in:

- GitHub (automatically renders Mermaid diagrams)
- VS Code with Mermaid extension
- Any Mermaid-compatible viewer
- Online at [mermaid.live](https://mermaid.live/)

## Purpose

The code in guia.js was becoming increasingly complex and harder to understand. These UML diagrams provide:

- **Visual documentation** of the system architecture
- **Clear understanding** of class relationships and responsibilities
- **Workflow visualization** for common use cases
- **Better maintainability** through documented design patterns
- **Easier onboarding** for new developers

## Design Patterns Used

The system implements several key design patterns:

- **Observer Pattern**: For location updates and address notifications
- **Strategy Pattern**: For different address formatting approaches
- **Factory Pattern**: For creating geocoding and display components
- **Singleton Pattern**: For utility classes and API integrations

## Architecture Principles

- **Separation of Concerns**: Each class has a single, well-defined responsibility
- **Loose Coupling**: Components interact through interfaces and observers
- **Extensibility**: New address formatters and displays can be easily added
- **Error Resilience**: Comprehensive error handling throughout the system