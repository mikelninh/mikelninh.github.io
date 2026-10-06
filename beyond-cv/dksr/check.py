from __future__ import annotations

from functools import partial
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import threading
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'beyond-cv'))
from link_portfolio import BRIDGE, HOME_LINK, build, integrate_home, integrate_personal

OUT = ROOT / 'beyond-cv-proof'
OUT.mkdir(exist_ok=True)
checks: list[str] = []
errors: list[str] = []
requests: list[str] = []


class InspectHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.anchors = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if 'id' in values:
            self.ids.append(values['id'])
        if tag == 'a' and values.get('href', '').startswith('#'):
            self.anchors.append(values['href'][1:])


original = (ROOT / 'beyond-cv/index.html').read_text(encoding='utf-8')
linked = integrate_personal(original)
assert integrate_personal(linked) == linked
assert linked.replace(BRIDGE, '', 1) == original
checks.append('Original Beyond CV preserved byte-for-byte after removing the single bridge')
home = (ROOT / 'index.html').read_text(encoding='utf-8')
home_linked = integrate_home(home)
assert integrate_home(home_linked) == home_linked
assert home_linked == home or home_linked.replace(HOME_LINK, '', 1) == home
checks.append('Homepage integration is idempotent and changes at most one link')
original_hash = hashlib.sha256(original.encode()).hexdigest()
build(ROOT)
for path in ('beyond-cv/index.html', 'beyond-cv/dksr/index.html'):
    parser = InspectHTML()
    parser.feed((ROOT / path).read_text(encoding='utf-8'))
    assert len(parser.ids) == len(set(parser.ids)), path
    assert all(target in parser.ids for target in parser.anchors), path
checks.append('Unique IDs and valid in-page navigation in both pages')
subprocess.run(['node', '--check', str(ROOT / 'beyond-cv/dksr/case.js')], check=True)
checks.append('Case JavaScript syntax')
shutil.copytree(ROOT / 'beyond-cv', OUT / 'site/beyond-cv', dirs_exist_ok=True, ignore=shutil.ignore_patterns('__pycache__'))
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = os.environ.get('BEYOND_CV_BASE', f'http://127.0.0.1:{server.server_port}/').rstrip('/')
url = base + '/beyond-cv/'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={'width': 1440, 'height': 1040})
        ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
        page = ctx.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda request: requests.append(request.url))
        page.goto(url)
        assert page.locator('#human').is_visible()
        assert page.locator('#work-proof').count() == 1
        assert page.locator('#gift-prompt').count() == 1
        checks.append('Authentic personal page, one new bridge and one original gift')
        page.screenshot(path=str(OUT / 'desktop-personal.png'), full_page=True)
        page.locator('#work-proof a[href="./dksr/"]').click()
        assert page.url.rstrip('/').endswith('/beyond-cv/dksr')
        assert page.locator('#metric-value').inner_text() == '40,56 °C'
        checks.append('Personal page leads directly into the new DKSR case')
        page.locator('#tab-climate').focus()
        page.keyboard.press('ArrowRight')
        assert page.locator('#metric-value').inner_text() == 'Dreifach'
        page.keyboard.press('End')
        assert page.locator('#metric-value').inner_text() == '≈ 1,10 km'
        assert 'krankenhaeuser' in page.locator('#source-link').get_attribute('href')
        page.keyboard.press('Home')
        assert page.locator('#metric-value').inner_text() == '40,56 °C'
        checks.append('Keyboard arrows/Home/End switch evidence, provenance and focus')
        page.locator('#gaps summary').click()
        assert page.locator('#gaps li').count() == 4
        assert page.locator('#gaps li').first.is_visible()
        checks.append('Four action gaps are accessible')
        page.locator('#all-evidence summary').click()
        assert page.locator('#all-evidence tbody tr').count() == 4
        checks.append('Full evidence table and limitations can be inspected')
        assert 'keine Live-Abfrage oder Priorisierung' in page.locator('main').inner_text()
        assert page.locator('#contact-link').get_attribute('href').startswith('mailto:')
        checks.append('Stored-case boundary and non-sending contact link')
        page.screenshot(path=str(OUT / 'desktop-dksr.png'), full_page=True)
        for width in (360, 390, 768, 1440):
            page.set_viewport_size({'width': width, 'height': 950})
            for suffix in ('', 'dksr/'):
                page.goto(url + suffix)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, suffix)
                if width == 390:
                    page.screenshot(path=str(OUT / ('mobile-dksr.png' if suffix else 'mobile-personal.png')), full_page=True)
            checks.append(f'No page overflow at {width}px on both routes')
        page.emulate_media(reduced_motion='reduce')
        assert page.evaluate('getComputedStyle(document.documentElement).scrollBehavior') == 'auto'
        checks.append('Reduced motion honoured')
        page.goto(url)
        prompt = page.locator('#gift-prompt').text_content().strip()
        page.locator('#copy-prompt').click()
        page.wait_for_function('expected => navigator.clipboard.readText().then(value => value === expected)', arg=prompt)
        checks.append('Original free prompt copied through real browser clipboard')
        page.locator('#next-question').click()
        assert page.locator('#question-count').inner_text().startswith('02')
        checks.append('Original conversation questions still work')
        page.locator('#open-builder').click()
        assert page.locator('#builder').is_visible()
        page.locator('#answer-0').fill('I enjoy cooking dinner with friends.')
        page.locator('#make-intro').click()
        intro = page.locator('#intro-output').input_value()
        assert 'cooking dinner with friends' in intro
        with page.expect_download() as event:
            page.locator('#download-intro').click()
        downloaded = Path(event.value.path()).read_text(encoding='utf-8')
        assert intro.strip() in downloaded
        checks.append('Original browser-only reflection builder and text download preserved')
        page.locator('#close-builder').click()
        page.reload()
        page.locator('#open-builder').click()
        assert page.locator('#answer-0').input_value() == ''
        page.locator('#close-builder').click()
        checks.append('Personal answers disappear after reload')
        nojs = browser.new_context(java_script_enabled=False)
        fallback = nojs.new_page()
        fallback.goto(url + 'dksr/')
        fallback.locator('#all-evidence summary').click()
        assert fallback.locator('table').is_visible()
        fallback.goto(url)
        fallback.locator('#gift-prompt').locator('..').locator('summary').click()
        assert fallback.locator('#gift-prompt').is_visible()
        assert fallback.locator('#work-proof a[href="./dksr/"]').is_visible()
        checks.append('Gift, work bridge and complete evidence readable without JavaScript')
        browser.close()
    assert not errors, errors
    origin = urlparse(base).netloc
    assert all(urlparse(request).netloc == origin or request.startswith(('data:', 'blob:')) for request in requests), requests
    checks.extend(['No JavaScript runtime errors in tested journeys', 'No third-party requests during tested interactions'])
    report = {'status': 'passed', 'count': len(checks), 'checks': checks, 'source_commit': os.environ.get('GITHUB_SHA'),
              'original_personal_sha256': original_hash,
              'scope': 'Browser and build checks; not validation of underlying city modelling, external source uptime or hiring outcomes.'}
    (OUT / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))
finally:
    server.shutdown()
    server.server_close()
