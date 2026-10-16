"""Browser QA for the three HTGF public work samples.

Locally: python -m pip install playwright && python -m playwright install chromium
Then: python tests/htgf-showcase-e2e.py
Uses a local HTTP server, fictitious fixtures and no external services.
"""
from __future__ import annotations
import http.server
import functools
import subprocess
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts" / "htgf-proof-release"
OUT.mkdir(parents=True, exist_ok=True)
server = subprocess.Popen(["python", "-m", "http.server", "8877", "--directory", str(ROOT)],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
issues = []
try:
    time.sleep(1.0)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        desktop = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        desktop.on("pageerror", lambda error: issues.append(str(error)))
        desktop.goto("http://127.0.0.1:8877/agents/", wait_until="networkidle")
        assert desktop.locator(".as-hero-side").is_visible()
        assert desktop.get_by_role("heading", name="A tenant needs help.", exact=False).is_visible()
        desktop.screenshot(path=str(OUT / "01-worker-desktop.png"), full_page=True)
        desktop.locator("#run").click()
        desktop.locator("#output.show").wait_for(timeout=5000)
        assert "Ready for review" in desktop.locator("#outTitle").inner_text()
        desktop.locator("#break").click()
        assert "Can't continue" in desktop.locator("#outTitle").inner_text()
        assert not desktop.locator("#approval").is_visible()
        desktop.screenshot(path=str(OUT / "02-worker-safely-stopped.png"), full_page=True)
        desktop.reload(wait_until="networkidle")
        desktop.locator("#run").click()
        desktop.locator("#approval.show").wait_for(timeout=5000)
        desktop.locator("#approve").click()
        assert "Release approved once" in desktop.locator("#notSent").inner_text()
        desktop.locator("#retry").click()
        assert "Duplicate execution blocked" in desktop.locator("#notSent").inner_text()
        desktop.goto("http://127.0.0.1:8877/gitlaw-proof/", wait_until="networkidle")
        assert desktop.locator(".as-hero-side").is_visible()
        desktop.screenshot(path=str(OUT / "03-gitlaw-desktop.png"), full_page=True)
        desktop.locator("#sourceBtn").click()
        assert desktop.locator("#sources").is_visible()
        assert desktop.locator("#sources a[href*='gesetze-im-internet']").count() >= 2
        desktop.goto("http://127.0.0.1:8877/pruefpilot/", wait_until="networkidle")
        assert desktop.locator(".as-hero-side").is_visible()
        assert desktop.locator("[data-case]").count() == 3
        desktop.screenshot(path=str(OUT / "04-pruefpilot-desktop.png"), full_page=True)
        desktop.locator("#run").click()
        desktop.locator("#result.show").wait_for(timeout=6000)
        desktop.locator("#why").click()
        assert desktop.locator("#evidence").is_visible()

        mobile = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True,
                                  device_scale_factor=1)
        mobile.on("pageerror", lambda error: issues.append(str(error)))
        for route, file in (("agents", "05-worker-mobile.png"),
                            ("gitlaw-proof", "06-gitlaw-mobile.png"),
                            ("pruefpilot", "07-pruefpilot-mobile.png")):
            mobile.goto(f"http://127.0.0.1:8877/{route}/", wait_until="networkidle")
            assert mobile.locator(".as-hero-side").is_visible(), f"{route}: missing case preview"
            actual = mobile.evaluate("document.documentElement.scrollWidth")
            width = mobile.evaluate("window.innerWidth")
            assert actual <= width + 2, f"{route}: horizontal overflow {actual} > {width}"
            mobile.screenshot(path=str(OUT / file), full_page=True)
        assert not issues, f"Client-side exceptions: {issues}"
        browser.close()
    print("HTGF RELEASE BROWSER QA: PASS")
    print("Desktop + mobile screenshots:", OUT)
except Exception as error:
    print("HTGF RELEASE BROWSER QA: FAIL", repr(error))
    raise
finally:
    server.terminate()
    server.wait(timeout=5)
