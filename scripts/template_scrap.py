"""
AKO Digital Mall — Printful Phone Case Image Downloader
Fully dynamic — reads all available models from the page at runtime.
Works for any product URL, any models Printful adds in future.

Setup (run once):
    pip install selenium requests webdriver-manager

Usage:
    python template_scrape.py
"""

import re
import time
import requests
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# ── Config ────────────────────────────────────────────────────────────────────
# Brand = "I Phone"

# PRINTFUL_URL = "https://www.printful.com/custom/phone-cases/personalized/tough-iphone-case"

Brand = "Samsung"

PRINTFUL_URL = "https://www.printful.com/custom/phone-cases/personalized/tough-case-for-samsung"


OUTPUT_DIR   = Path(f"case_images/{Brand}")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer":    "https://www.printful.com/",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def safe_name(name):
    return re.sub(r'[<>:"/\\|?*]', '', name).strip()


def download_image(url, path):
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        if r.status_code == 200 and len(r.content) > 2000:
            path.write_bytes(r.content)
            print(f"    saved {path.name} ({len(r.content)//1024}kb)")
            return True
        print(f"    failed — HTTP {r.status_code}")
        return False
    except Exception as e:
        print(f"    error — {e}")
        return False


def get_active_src(driver):
    """Get src of the currently active/visible main slide image."""
    try:
        img = driver.find_element(
            By.CSS_SELECTOR,
            ".splide__slide.is-active.is-visible img[src*='cdn.printful.com']"
        )
        return img.get_attribute("src") or ""
    except Exception:
        return ""


def wait_for_src_change(driver, old_src, timeout=12):
    """Poll until the active image src is different from old_src."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        new_src = get_active_src(driver)
        if new_src and new_src != old_src:
            time.sleep(0.8)  # let remaining images finish loading
            return True
        time.sleep(0.3)
    return False


def collect_image_urls(driver):
    """Collect all unique large image URLs from the current slider state."""
    urls = []

    # Primary: main slider non-clone slides
    try:
        imgs = driver.find_elements(
            By.CSS_SELECTOR,
            ".splide__slide:not(.splide__slide--clone) img[src*='cdn.printful.com']"
        )
        for img in imgs:
            src = img.get_attribute("src") or ""
            src = re.sub(r'_t(\?.*)?$', '_l', src).split("?")[0]
            if src and src not in urls:
                urls.append(src)
    except Exception:
        pass

    # Fallback: thumbnail strip
    if len(urls) < 2:
        try:
            imgs = driver.find_elements(
                By.CSS_SELECTOR,
                ".thumbnail-slider-container img[src*='cdn.printful.com']"
            )
            for img in imgs:
                src = img.get_attribute("src") or ""
                src = re.sub(r'_t(\?.*)?$', '_l', src).split("?")[0]
                if src and src not in urls:
                    urls.append(src)
        except Exception:
            pass

    return urls


def click_model(driver, wait, data_test):
    """Find button by data-test, scroll into view, JS click."""
    btn = wait.until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, f'button[data-test="{data_test}"]')
        )
    )
    driver.execute_script(
        "arguments[0].scrollIntoView({block:'center',inline:'center'});", btn
    )
    time.sleep(0.3)
    driver.execute_script("arguments[0].click();", btn)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 55)
    print(" AKO Digital Mall — Printful Case Image Downloader")
    print("       Fully dynamic model detection")
    print("=" * 55)

    print("\nStarting Chrome...")
    options = Options()
    options.add_argument("--window-size=1400,900")
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-popup-blocking")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    wait = WebDriverWait(driver, 20)

    try:
        print("Opening Printful page...")
        driver.get(PRINTFUL_URL)

        # Wait until at least one model button is in the DOM
        print("Waiting for page to render...")
        wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".size-picker button[data-test]")
            )
        )
        time.sleep(2)

        # Dismiss cookie banner
        for text in ["Accept all", "Accept"]:
            try:
                btn = driver.find_element(
                    By.XPATH, f"//button[contains(text(),'{text}')]"
                )
                btn.click()
                time.sleep(1)
                break
            except Exception:
                pass

        # ── Dynamically read all model buttons from the page ──────────────────
        buttons = driver.find_elements(
            By.CSS_SELECTOR, ".size-picker button[data-test]"
        )
        models = []
        for b in buttons:
            label     = b.text.strip()
            data_test = b.get_attribute("data-test")
            if label and data_test:
                models.append({"label": label, "data_test": data_test})

        print(f"\nFound {len(models)} models dynamically:")
        for m in models:
            print(f"  {m['label']}")

        if not models:
            print("No models found — page may not have loaded correctly.")
            return

        OUTPUT_DIR.mkdir(exist_ok=True)
        total  = 0
        failed = []

        # Prime: click the LAST model first so all earlier ones
        # trigger a real image src change when clicked
        last = models[-1]
        print(f"\nPriming with: {last['label']}...")
        try:
            click_model(driver, wait, last["data_test"])
            time.sleep(3)
        except Exception as e:
            print(f"  Prime failed: {e}")

        # ── Loop through every model ──────────────────────────────────────────
        for m in models:
            label     = m["label"]
            data_test = m["data_test"]
            folder    = OUTPUT_DIR / safe_name(label)
            folder.mkdir(parents=True, exist_ok=True)

            # Skip if already fully downloaded
            existing = list(folder.glob("*.jpg"))
            if len(existing) >= 4:
                print(f"\n[{label}] already done ({len(existing)} images), skipping")
                continue

            print(f"\n[{label}]")

            # Snapshot current src before click
            src_before = get_active_src(driver)

            # Click the model button
            try:
                click_model(driver, wait, data_test)
            except Exception as e:
                print(f"  Button click failed: {e}")
                failed.append(label)
                continue

            # Wait for images to actually update
            changed = wait_for_src_change(driver, src_before, timeout=12)

            if not changed:
                # Force a switch away then back to guarantee reload
                print(f"  No image change detected — forcing reload...")
                try:
                    other = models[-1] if label != models[-1]["label"] else models[-2]
                    click_model(driver, wait, other["data_test"])
                    time.sleep(2)
                    src_before = get_active_src(driver)
                    click_model(driver, wait, data_test)
                    wait_for_src_change(driver, src_before, timeout=12)
                except Exception:
                    pass

            # Grab image URLs
            urls = collect_image_urls(driver)

            if not urls:
                print(f"  No images found")
                failed.append(label)
                continue

            print(f"  {len(urls)} images — downloading...")

            for i, url in enumerate(urls, 1):
                dest = folder / f"{i}.jpg"
                if dest.exists():
                    print(f"    {dest.name} exists, skipping")
                    continue
                if download_image(url, dest):
                    total += 1
                time.sleep(0.2)

        # ── Summary ───────────────────────────────────────────────────────────
        print("\n" + "=" * 55)
        print(f"Done! {total} new images downloaded.")
        print(f"Saved to: {OUTPUT_DIR.resolve()}")

        if failed:
            print(f"\nFailed ({len(failed)}):")
            for m in failed:
                print(f"  - {m}")

        print("\nFolder structure:")
        for f in sorted(OUTPUT_DIR.iterdir()):
            if f.is_dir():
                jpgs = list(f.glob("*.jpg"))
                print(f"  {f.name}/ — {len(jpgs)} images")

    finally:
        driver.quit()


if __name__ == "__main__":
    main()