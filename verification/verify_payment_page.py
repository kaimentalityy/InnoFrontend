from playwright.sync_api import sync_playwright

def verify_payment_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Set localStorage
        page.goto("http://localhost:5173/login") # Go to login page first to initialize context

        page.evaluate("""() => {
            localStorage.setItem('token', 'fake-token');
            localStorage.setItem('user', JSON.stringify({ id: 1, username: 'testuser' }));
        }""")

        # Navigate to payments page
        page.goto("http://localhost:5173/payments")

        # Wait for the page to load
        try:
            page.wait_for_selector("h2:has-text('Payment History')", timeout=5000)
            print("Payment History header found.")
        except Exception as e:
            print(f"Error waiting for header: {e}")
            # Take screenshot anyway to see what happened

        # Take screenshot
        page.screenshot(path="verification/payment_page.png")
        print("Screenshot saved to verification/payment_page.png")

        browser.close()

if __name__ == "__main__":
    verify_payment_page()
