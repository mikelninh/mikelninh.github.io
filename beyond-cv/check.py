from __future__ import annotations

import hashlib
from html.parser import HTMLParser
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
import subprocess
import threading

from playwright.sync_api import sync_playwright
from link_portfolio import integrate, NAV_LINK, HERO_LINK

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'beyond-cv-proof'
OUT.mkdir(exist_ok=True)
checks: list[str] = []


class InspectHTML(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.anchors: list[str] = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if 'id' in values:
            self.ids.append(values['id'])
        if tag == 'a' and values.get('href', '').startswith('#'):
            self.anchors.append(values['href'][1:])


html = (ROOT / 'beyond-cv/index.html').read_text(encoding='utf-8')
parser = InspectHTML()
parser.feed(html)
assert len(parser.ids) == len(set(parser.ids))
assert all(target in parser.ids for target in parser.anchors)
checks.append('Unique IDs and valid in-page navigation')
subprocess.run(['node', '--check', str(ROOT / 'beyond-cv/beyond.js')], check=True)
checks.append('Browser JavaScript syntax')
original = (ROOT / 'index.html').read_text(encoding='utf-8')
linked = integrate(original)
assert integrate(linked) == linked
assert linked.replace(NAV_LINK, '').replace(HERO_LINK, '') == original
checks.append('Idempotent homepage integration; only two links added')

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
url = f'http://127.0.0.1:{server.server_port}/beyond-cv/'
errors: list[str] = []
requests: list[str] = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={'width': 1440, 'height': 1040})
        ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
        page = ctx.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda request: requests.append(request.url))
        page.goto(url)
        assert 'My CV tells you what I’ve done.' in page.locator('main').inner_text()
        assert page.locator('#metric-value').inner_text() == '40,56 °C'
        checks.append('Personal entry and preserved motto')
        page.screenshot(path=str(OUT / 'desktop-personal.png'), full_page=True)
        page.locator('#tab-climate').focus()
        page.keyboard.press('ArrowRight')
        assert page.locator('#metric-value').inner_text() == 'Dreifach'
        page.keyboard.press('End')
        assert page.locator('#metric-value').inner_text() == '≈ 1,10 km'
        assert 'krankenhaeuser' in page.locator('#source-link').get_attribute('href')
        checks.append('Arrow/Home/End-style keyboard tabs and evidence source changes')
        page.locator('#gaps summary').click()
        assert page.locator('#gaps li').count() == 4
        assert page.locator('#gaps li').first.is_visible()
        checks.append('Four evidence gaps visible before action')
        page.locator('#topic-learning').click()
        assert 'Anfänger' in page.locator('#topic-panel').inner_text()
        checks.append('Personal topic interaction')
        page.locator('#copy-prompt').click()
        page.wait_for_function("document.querySelector('#copy-status').textContent.startsWith('Kopiert')")
        clipboard = page.evaluate('navigator.clipboard.readText()')
        assert clipboard == page.locator('#prompt-text').inner_text().strip()
        assert '150 Wörtern' in clipboard
        checks.append('Actual clipboard write/read in browser')
        with page.expect_download() as event:
            page.locator('#download-prompt').click()
        download = event.value
        assert download.suggested_filename == 'Beyond_CV_Prompt.txt'
        assert Path(download.path()).read_text(encoding='utf-8').strip() == clipboard
        checks.append('Downloaded prompt content matches copied prompt')
        page.evaluate("Object.defineProperty(navigator, 'clipboard', {value:undefined, configurable:true})")
        page.locator('#copy-prompt').click()
        assert page.locator('#prompt-details').get_attribute('open') is not None
        assert 'gesperrt' in page.locator('#copy-status').inner_text()
        checks.append('Clipboard failure opens selectable text fallback')
        page.goto(url + '?for=dksr')
        assert 'dksr' in page.locator('body').get_attribute('class')
        assert 'DKSR' in page.title()
        assert page.locator('.dksr-only').first.is_visible()
        checks.append('Direct DKSR query-string entry')
        page.screenshot(path=str(OUT / 'desktop-dksr.png'), full_page=True)
        page.locator('[data-view=personal]').click()
        assert 'for=dksr' not in page.url
        page.go_back()
        assert 'dksr' in page.locator('body').get_attribute('class')
        checks.append('Mode switch and browser history restore correctly')
        for width in (360, 390, 768, 1440):
            page.set_viewport_size({'width': width, 'height': 950})
            for query in ('', '?for=dksr'):
                page.goto(url + query)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, query)
                if width == 390:
                    name = 'mobile-dksr.png' if query else 'mobile-personal.png'
                    page.screenshot(path=str(OUT / name), full_page=True)
            checks.append(f'No horizontal overflow at {width}px in both entries')
        page.emulate_media(reduced_motion='reduce')
        assert page.evaluate('getComputedStyle(document.documentElement).scrollBehavior') == 'auto'
        checks.append('Reduced-motion preference honoured')
        assert page.locator('#contact-link').get_attribute('href').startswith('mailto:')
        checks.append('Contact opens mail client; no automatic sending')
        nojs = browser.new_context(java_script_enabled=False)
        fallback = nojs.new_page()
        fallback.goto(url)
        fallback.locator('summary').filter(has_text='Alle Belege, Herkunft und Grenzen').click()
        assert fallback.locator('table').is_visible()
        fallback.locator('#prompt-details summary').click()
        assert fallback.locator('#prompt-text').is_visible()
        checks.append('Evidence and prompt readable without JavaScript')
        browser.close()
    assert not errors, errors
    assert all(request.startswith(url.split('/beyond-cv/')[0]) for request in requests), requests
    checks.extend(['No browser JavaScript errors', 'No third-party requests during use'])
    report = {'status': 'passed', 'count': len(checks), 'checks': checks,
              'scope': 'Website build and browser interaction; not validation of underlying city-model correctness or remote link availability.',
              'sha256': {name: hashlib.sha256((ROOT / 'beyond-cv' / name).read_bytes()).hexdigest()
                         for name in ('index.html', 'beyond.css', 'beyond.js')}}
    (OUT / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))
finally:
    server.shutdown()
    server.server_close()
