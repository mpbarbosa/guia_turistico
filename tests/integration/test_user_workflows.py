"""Integration tests for user workflows in Guia Turístico."""
import unittest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


class TestUserWorkflows(unittest.TestCase):
    """Test complete user workflows."""

    @classmethod
    def setUpClass(cls):
        chrome_options = Options()
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.base_url = "file:///home/mpb/Documents/GitHub/guia_turistico/src"

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            cls.driver.quit()

    def test_page_navigation(self):
        """Test basic page navigation."""
        self.driver.get(f"{self.base_url}/index.html")
        self.assertIn("Guia", self.driver.title)


if __name__ == "__main__":
    unittest.main(verbosity=2)
