#!/bin/bash
# Integration test runner for Guia Turístico

set -e

echo "======================================"
echo "Guia Turístico Integration Test Suite"
echo "======================================"

# Check dependencies
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed"
    exit 1
fi

if ! python3 -c "import selenium" &> /dev/null; then
    echo "WARNING: Selenium not installed"
    echo "Run: pip install selenium"
    exit 1
fi

# Create reports directory
mkdir -p test_reports
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="test_reports/test_report_$TIMESTAMP.txt"

echo "Starting tests at: $(date)" | tee "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Run tests
if python3 -m unittest discover -v 2>&1 | tee -a "$REPORT_FILE"; then
    echo ""  | tee -a "$REPORT_FILE"
    echo "All tests passed! ✓" | tee -a "$REPORT_FILE"
    exit 0
else
    echo "" | tee -a "$REPORT_FILE"
    echo "Some tests failed! ✗" | tee -a "$REPORT_FILE"
    exit 1
fi
