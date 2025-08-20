from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

# Define the URL of your Selenium Grid Hub
# Replace 'localhost' and '4444' with the actual IP address/hostname and port of your Grid Hub
grid_url = "http://localhost:4444/wd/hub"

# Configure Chrome options (you can use options for other browsers like FirefoxOptions, EdgeOptions)
chrome_options = Options()
# Add any desired capabilities or options here, for example:
# chrome_options.add_argument("--headless") # Run in headless mode (no visible browser UI)
# chrome_options.add_argument("--start-maximized") # Maximize the browser window

try:
    # Initialize the Remote WebDriver
    # Pass the grid_url and the browser options
    print("Connecting to Selenium Grid...")
    driver = webdriver.Remote(command_executor=grid_url, options=chrome_options)
    if not driver:
        print("Failed to connect to Selenium Grid.")

    # Navigate to a website
    driver.get("file:///home/seluser/GitHub/guia_turistico/docs/index.html")

    # Print the title of the current page
    print("Successfully connected to the Selenium Grid and navigated to the page.")
    print("Current URL:", driver.current_url)
    print(f"Page title: {driver.title}")
    print(f"Page source: {driver.page_source}")
    ids = driver.find_elements(By.XPATH, "//*[@id]")
    for id in ids:
        print(f"Element ID: {id.get_attribute('id')}")
        print(f"Element Text: {id.text}")
        print(f"Element Tag Name: {id.tag_name}")

    print("Finding links...")
    links = driver.find_elements(By.TAG_NAME, "a")
    for link in links:
        print(f"Link Text: {link.text}")
        print(f"Link Href: {link.get_attribute('href')}")

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    # Close the browser session
    if "driver" in locals() and driver:
        driver.quit()
