# Integration Test Suite - Guia Turístico

Comprehensive integration test suite for the Guia Turístico web application.

## Test Files

1. **test_geolocation_flow.py** - Geolocation and core functionality
2. **test_api_integration.py** - External API integration tests
3. **test_user_workflows.py** - End-to-end user scenarios  
4. **test_performance.py** - Performance and optimization tests

## Prerequisites

### Install Dependencies

```bash
pip install selenium
```

### Install ChromeDriver

```bash
# Ubuntu/Debian
sudo apt-get install chromium-chromedriver

# macOS
brew install chromedriver
```

## Running Tests

### Run All Tests

```bash
cd tests/integration
python -m unittest discover -v
```

### Run Specific Test

```bash
python -m unittest test_geolocation_flow -v
```

### Run with Test Runner Script

```bash
./run_tests.sh
```

## Test Configuration

Tests use local file:// protocol by default. Update `base_url` for HTTP server:

```python
cls.base_url = "http://localhost:8000"
```

## Performance Thresholds

- Page load: < 10 seconds
- Button interaction: < 3 seconds
- API calls: < 10 seconds

## CI/CD Integration

Tests can be integrated with GitHub Actions or other CI/CD pipelines using headless Chrome.

## Troubleshooting

### ChromeDriver Version Mismatch
Download matching version from https://chromedriver.chromium.org/

### Permission Errors
```bash
chmod +x run_tests.sh
chmod +x /path/to/chromedriver
```

## Version

- v1.0.0 (2025-12-15): Initial integration test suite
