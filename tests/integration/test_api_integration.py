"""Integration tests for API integrations in Guia Turístico."""
import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options


class TestAPIIntegration(unittest.TestCase):
    """Test external API integrations."""

    @classmethod
    def setUpClass(cls):
        chrome_options = Options()
        chrome_options.add_argument("--disable-notifications")
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.base_url = "file:///home/mpb/Documents/GitHub/guia_turistico/src"

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            cls.driver.quit()

    def test_address_converter_loads(self):
        """Test address converter page loads."""
        self.driver.get(f"{self.base_url}/address-converter.html")
        self.assertIn("Conversor", self.driver.title)


if __name__ == "__main__":
    unittest.main(verbosity=2)
