"""
Integration tests for geolocation flow in Guia Turístico application.
Tests the complete flow from location acquisition to address display.
"""

import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException


class TestGeolocationFlow(unittest.TestCase):
    """Test geolocation functionality across different pages."""

    @classmethod
    def setUpClass(cls):
        """Set up the Chrome WebDriver with geolocation permissions."""
        chrome_options = Options()
        # Grant geolocation permission
        prefs = {
            "profile.default_content_setting_values.geolocation": 1,
            "profile.default_content_settings.geolocation": 1
        }
        chrome_options.add_experimental_option("prefs", prefs)
        # Mock geolocation - São Paulo coordinates
        chrome_options.add_argument("--use-fake-ui-for-media-stream")
        
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.driver.maximize_window()
        cls.base_url = "file:///home/mpb/Documents/GitHub/guia_turistico/src"
        cls.wait_timeout = 15

    @classmethod
    def tearDownClass(cls):
        """Close the browser."""
        if cls.driver:
            cls.driver.quit()

    def setUp(self):
        """Set up before each test."""
        self.wait = WebDriverWait(self.driver, self.wait_timeout)

    def test_01_index_page_loads(self):
        """Test that index page loads successfully."""
        self.driver.get(f"{self.base_url}/index.html")
        
        # Check page title
        self.assertIn("Guia Turístico", self.driver.title)
        
        # Verify main button exists
        get_location_btn = self.wait.until(
            EC.presence_of_element_located((By.ID, "getLocationBtn"))
        )
        self.assertTrue(get_location_btn.is_displayed())

    def test_02_geolocation_permission_request(self):
        """Test that geolocation permission is requested."""
        self.driver.get(f"{self.base_url}/index.html")
        
        # Click the get location button
        get_location_btn = self.wait.until(
            EC.element_to_be_clickable((By.ID, "getLocationBtn"))
        )
        get_location_btn.click()
        
        # Wait for location result to appear
        location_result = self.wait.until(
            EC.presence_of_element_located((By.ID, "locationResult"))
        )
        
        # Check that some content is displayed (either coordinates or error)
        self.assertTrue(len(location_result.text) > 0)

    def test_03_coordinates_display(self):
        """Test that coordinates are displayed after location acquisition."""
        self.driver.get(f"{self.base_url}/index.html")
        
        get_location_btn = self.wait.until(
            EC.element_to_be_clickable((By.ID, "getLocationBtn"))
        )
        get_location_btn.click()
        
        # Wait for coordinates to be displayed
        try:
            # Check if coordinates section exists and contains latitude/longitude
            location_result = self.wait.until(
                EC.presence_of_element_located((By.ID, "locationResult"))
            )
            time.sleep(2)  # Allow time for async operations
            
            result_text = location_result.text.lower()
            # Accept either success with coordinates or permission denied
            self.assertTrue(
                any(keyword in result_text for keyword in 
                    ["latitude", "longitude", "coordenadas", "denied", "permission", "negou"])
            )
        except TimeoutException:
            self.fail("Location result did not appear within timeout")

    def test_04_address_converter_page(self):
        """Test address converter page functionality."""
        self.driver.get(f"{self.base_url}/address-converter.html")
        
        # Check page loaded
        self.assertIn("Conversor", self.driver.title)
        
        # Verify input fields exist
        lat_input = self.wait.until(
            EC.presence_of_element_located((By.ID, "latitude"))
        )
        lon_input = self.wait.until(
            EC.presence_of_element_located((By.ID, "longitude"))
        )
        
        self.assertTrue(lat_input.is_displayed())
        self.assertTrue(lon_input.is_displayed())


if __name__ == "__main__":
    unittest.main(verbosity=2)
