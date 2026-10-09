#!/usr/bin/env python3
"""Release gate for the public Beyond the CV Garden.

Runs against the same static files GitHub Pages publishes. No external accounts,
API keys, emails, analytics or payments. Screenshots are local CI artifacts.
"""
from __future__ import annotations

import functools
import json
import pathlib
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "beyond-cv-garden-proof"
ARTIFACTS.mkdir(exist_ok=True)
PORT = 8765
BASE = f"http://127.0.0.1:{PORT}/beyond-cv/"


def check(condition: bool, description: str) -> None:
    if not condition:
        raise AssertionError(description)


def run() -> None:
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    findings = []
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True, args=["--disable-dev-shm-usage"])
            for width in (320, 390, 768, 1440):
                context = browser.new_context(
                    viewport={"width": width, "height": 830},
                    device_scale_factor=1,
                    reduced_motion="reduce",
                )
                page = context.new_page()
                page_errors = []
                page.on("pageerror", lambda error: page_errors.append(str(error)))
                response = page.goto(BASE, wait_until="domcontentloaded", timeout=45000)
                check(response is not None and response.status == 200, f"{width}px: homepage did not respond")
                page.locator(".garden-visual svg").wait_for(state="visible")
                check(page.locator("#worlds").count() == 1, f"{width}px: HANA gateway missing")
                check(page.locator("#thoughts .seed-note").count() == 3, f"{width}px: field notes missing")
                check(page.locator("#savasana").count() == 1, f"{width}px: closing scene missing")
                check(page.locator('a[href="./hana-grails/"]').count() > 0, f"{width}px: gallery CTA missing")
                check(page.locator('a[href="https://mikelninh.github.io/"]').count() > 0, f"{width}px: work CTA missing")

                # Crucially, verify real preview image bytes decode on the homepage.
                page.wait_for_function(
                    "() => [...document.querySelectorAll('.grail-frame img')].length === 2 && "
                    "[...document.querySelectorAll('.grail-frame img')].every(img => img.complete && img.naturalWidth > 0 && !img.hidden)",
                    timeout=30000,
                )
                images = page.locator(".grail-frame img").evaluate_all(
                    "(imgs) => imgs.map(i => ({src: i.getAttribute('src'),width:i.naturalWidth,height:i.naturalHeight}))"
                )
                check(all(i["width"] > 500 for i in images), f"{width}px: degraded card preview")

                # Native details must work without custom code.
                note = page.locator("#note-savasana details")
                check(not note.get_attribute("open"), f"{width}px: note unexpectedly expanded")
                note.locator("summary").click()
                check(note.get_attribute("open") is not None, f"{width}px: reflection failed to expand")
                check("Savasana is my favourite asana" in note.inner_text(), f"{width}px: note text missing")

                # Existing free builder remains working after editorial redesign.
                page.locator("#open-builder").click()
                dialog = page.locator("#builder")
                check(dialog.evaluate("(el) => el.open"), f"{width}px: builder didn't open")
                page.locator("#answer-0").fill("Learning guitar and growing herbs.")
                page.locator("#make-intro").click()
                output = page.locator("#intro-output").input_value()
                check("Learning guitar and growing herbs." in output, f"{width}px: builder output wrong")
                page.locator("#close-builder").click()
                check(not dialog.evaluate("(el) => el.open"), f"{width}px: builder didn't close")

                overflow = page.evaluate(
                    "() => ({doc: document.documentElement.scrollWidth, width: innerWidth})"
                )
                check(overflow["doc"] <= overflow["width"] + 3, f"{width}px: horizontal overflow {overflow}")
                check(not page_errors, f"{width}px: JS errors: {page_errors}")

                if width in (390, 1440):
                    page.goto(BASE, wait_until="domcontentloaded")
                    page.screenshot(path=str(ARTIFACTS / f"hero-{width}.png"))
                    page.locator("#worlds").scroll_into_view_if_needed()
                    page.screenshot(path=str(ARTIFACTS / f"hana-gateway-{width}.png"))
                findings.append({"viewport":width, "status":"pass","artwork":images,"overflow":overflow})
                context.close()

            context = browser.new_context(viewport={"width": 1200, "height": 900})
            page = context.new_page()
            page_errors = []
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            response = page.goto(BASE + "hana-grails/", wait_until="domcontentloaded", timeout=45000)
            check(response is not None and response.status == 200, "HANA exhibition unreachable")
            page.locator('#lotus .flip').click()
            check("is-flipped" in page.locator("#lotus").get_attribute("class"), "Lotus card didn't turn")
            page.locator('#lotus .flip').click()
            check("is-flipped" not in page.locator("#lotus").get_attribute("class"), "Lotus card didn't turn back")
            page.locator("#lotus .view").click()
            check(page.locator("#lightbox").evaluate("(el) => el.open"), "HANA lightbox didn't open")
            page.locator("#close-lightbox").click()
            check(not page.locator("#lightbox").evaluate("(el) => el.open"), "HANA lightbox didn't close")
            page.locator("#world").scroll_into_view_if_needed()
            page.wait_for_function(
                "() => {const i=document.querySelector('#world-art');return !i.hidden && i.complete && i.naturalWidth > 0}",
                timeout=45000,
            )
            check(not page_errors, f"HANA gallery JS errors: {page_errors}")
            page.screenshot(path=str(ARTIFACTS / "hana-exhibition.png"))
            findings.append({"gallery":"pass","worldArtworkLoaded":True})
            context.close()
            browser.close()
    finally:
        server.shutdown()
    report={"status":"pass","checks":findings}
    (ARTIFACTS / "report.json").write_text(json.dumps(report, indent=2), encoding="utf8")
    print("GARDEN_QA_PASS " + json.dumps(report))


if __name__ == "__main__":
    run()
