"""Performance tests for Guia Turístico application."""
import unittest
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


class TestPerformance(unittest.TestCase):
    """Test application performance metrics."""

    @classmethod
    def setUpClass(cls):
        chrome_options = Options()
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.base_url = "file:///home/mpb/Documents/GitHub/guia_turistico/src"

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            cls.driver.quit()

    def test_page_load_time(self):
        """Test page loads within acceptable time."""
        start = time.time()
        self.driver.get(f"{self.base_url}/index.html")
        load_time = time.time() - start
        self.assertLess(load_time, 10.0, f"Page load took {load_time:.2f}s")


if __name__ == "__main__":
    unittest.main(verbosity=2)
