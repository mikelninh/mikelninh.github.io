"""Verify published v2 bytes, then exercise the real HTTPS origin in Chromium.

Run from the repository root. The separate local report is not a substitute for
this origin test. No authenticated visitor data or third-party writes are used.
"""
from __future__ import annotations
import hashlib
import json
import os
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('SITE', 'https://mikelninh.github.io/interbeing/').rstrip('/') + '/'
ROOT = Path('interbeing')
OUT = Path('interbeing-qa')
OUT.mkdir(exist_ok=True)
checks: list[dict] = []
errors: list[str] = []
assets: list[dict] = []

def check(name: str, condition: bool) -> None:
    assert condition, name
    checks.append({'check': name, 'result': 'pass'})
    print('PASS:', name, flush=True)

def save(status: str) -> None:
    (OUT/'results.json').write_text(json.dumps({
        'status': status, 'version': '2.0.0', 'public_url': BASE,
        'environment': 'Chromium on actual public HTTPS origin; not physical-device or scientific validation',
        'assets': assets, 'checks': checks, 'passed': len(checks),
        'javascript_errors': errors,
        'limits': ['No friend comprehension testing', 'No independent scientific review', 'No physical-device or cross-browser test'],
    }, indent=2))

try:
    names = ['index.html', 'root-atlas.css', 'root-data.js', 'root-atlas.js', 'friends-v1.html']
    for attempt in range(72):
        try:
            current = []
            for name in names:
                req = urllib.request.Request(BASE+name, headers={'Cache-Control':'no-cache','User-Agent':'InterbeingReleaseCheck/2.0'})
                with urllib.request.urlopen(req, timeout=20) as response:
                    payload = response.read()
                    assert payload == (ROOT/name).read_bytes(), name+' differs from this commit'
                    current.append({'file':name,'http':response.status,'sha256':hashlib.sha256(payload).hexdigest()})
            assets = current
            break
        except Exception as error:
            print('Awaiting publication', attempt+1, str(error), flush=True)
            time.sleep(5)
    check('Published asset bytes match the checked-out source', len(assets) == len(names))
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width':1440,'height':1000}, accept_downloads=True)
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE, wait_until='networkidle')
        page.wait_for_function('window.InterbeingRoot && InterbeingRoot.validate()')
        check('Version 2.0 and valid endpoints/source references', page.evaluate('InterbeingRoot.version') == '2.0.0')
        counts = page.evaluate('InterbeingRoot.model().counts')
        check('62 nodes, 109 typed relationships, 8 families and 10 domains', counts == {'nodes':62,'edges':109,'root':8,'problem':10,'response':14,'actor':9})
        check('Problem-first homepage', 'Suffering has roots.' in page.locator('h1').inner_text())
        page.wait_for_function('document.querySelectorAll("#world .node").length === 25')
        check('10 domains and 8 families visible in overview', page.locator('#world .node.problem').count() == 10 and page.locator('#world .node.root').count() == 8)
        page.screenshot(path=str(OUT/'desktop.png'), full_page=True)
        for path in ['food','care','wild']:
            page.click('[data-path="'+path+'"]')
            check(path+' pathway opens', page.evaluate('InterbeingRoot.snapshot().path') == path)
            page.click('#trace-roots')
            check(path+' roots include specific mechanisms', page.evaluate('InterbeingRoot.snapshot().mode') == 'roots' and page.evaluate('InterbeingRoot.model().visible.some(id=>ROOT_ATLAS.nodes[id].type==="mechanism")'))
            page.click('[data-path="'+path+'"]')
            page.click('#show-responses')
            check(path+' response view includes interventions', page.evaluate('InterbeingRoot.model().visible.some(id=>ROOT_ATLAS.nodes[id].type==="response")'))
            page.click('[data-path="'+path+'"]')
            page.click('#compare')
            check(path+' comparison includes three responses', page.locator('.compare-card').count() == 3)
            page.click('#close-dialog')
            page.click('[data-story="'+path+'"]')
            for step in range(4):
                check(path+' guided step '+str(step+1), page.evaluate('InterbeingRoot.snapshot().step') == step)
                page.click('#story-next')
            check(path+' guide ends without losing path', page.evaluate('InterbeingRoot.snapshot().step') == -1 and page.evaluate('InterbeingRoot.snapshot().path') == path)
        page.click('[data-path="care"]')
        page.click('#show-loop')
        check('Care feedback loop is explicitly context-dependent', page.locator('#loop-strip').is_visible() and 'context-dependent' in page.locator('#loop-strip').inner_text().lower())
        for edge in ['poverty--barrier','barrier--illness','illness--costs','costs--poverty']:
            page.click('[data-loop-edge="'+edge+'"]')
            check('Inspect loop claim '+edge, page.evaluate('InterbeingRoot.snapshot().edge') == edge and page.locator('#details .source-link').count() > 0)
        page.screenshot(path=str(OUT/'loop.png'), full_page=True)
        page.click('[data-path="all"]')
        page.check('#actors')
        check('Programme activities are mapped', page.evaluate('InterbeingRoot.model().visible.filter(id=>ROOT_ATLAS.nodes[id].type==="actor").length') == 9)
        page.click('[data-path="food"]')
        page.click('[data-view="space"]')
        yaw = page.evaluate('InterbeingRoot.snapshot().yaw')
        page.locator('#graph').focus()
        page.keyboard.press('ArrowRight')
        check('Spatial view responds to camera controls', page.evaluate('InterbeingRoot.snapshot().yaw') != yaw)
        page.click('[data-dialog="place"]')
        page.select_option('#role','researcher')
        page.click('#save-role')
        page.evaluate('InterbeingRoot.select("plant", true)')
        page.click('#save-step')
        check('Research step and optional role persist on real origin', page.evaluate('localStorage.getItem("interbeing.step.v2")') == 'plant' and page.evaluate('localStorage.getItem("interbeing.role.v2")') == 'researcher')
        page.reload(wait_until='networkidle')
        page.wait_for_function('window.InterbeingRoot')
        check('Saved step survives a hosted reload', 'Plant-rich provision' in page.locator('#next-step').inner_text())
        page.click('[data-story="food"]')
        page.click('#story-next')
        page.click('#story-next')
        page.click('[data-view="space"]')
        page.click('#share-view')
        link = page.locator('#share-url').input_value()
        check('Share link excludes role and local storage keys', 'researcher' not in link and 'role=' not in link and 'interbeing.step' not in link)
        with page.expect_download() as captured:
            page.click('#save-card')
        download = captured.value
        check('Map card downloads as PNG', download.suggested_filename.endswith('.png'))
        download.save_as(str(OUT/'shared-card.png'))
        second = context.new_page()
        second.on('pageerror', lambda error: errors.append(str(error)))
        second.goto(link, wait_until='networkidle')
        second.wait_for_function('window.InterbeingRoot')
        check('Shared link reopens selected pathway and guide step on actual origin', second.evaluate('InterbeingRoot.snapshot().path') == 'food' and second.evaluate('InterbeingRoot.snapshot().step') == 2 and second.evaluate('InterbeingRoot.snapshot().view') == 'space')
        second.close()
        page.click('#close-dialog')
        page.click('[data-dialog="reflection"]')
        check('Reflection UI does not pretend to submit to an inbox', 'No central inbox' in page.locator('#dialog-content').inner_text())
        page.click('#close-dialog')
        page.click('[data-path="all"]')
        page.click('[data-view="map"]')
        for width in [360,390,580,768,1024,1440,1720]:
            page.set_viewport_size({'width':width,'height':900})
            page.wait_for_timeout(160)
            check('No horizontal overflow at '+str(width), page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'))
        mobile = context.new_page()
        mobile.set_viewport_size({'width':390,'height':844})
        mobile.on('pageerror', lambda error: errors.append(str(error)))
        mobile.goto(BASE,wait_until='networkidle')
        mobile.wait_for_function('window.InterbeingRoot')
        mobile.screenshot(path=str(OUT/'mobile.png'))
        mobile.click('#find')
        mobile.fill('#search','predation')
        mobile.click('[data-list-id="predation"]')
        check('Mobile searchable list opens a mechanism', mobile.evaluate('InterbeingRoot.snapshot().selected') == 'predation')
        mobile.screenshot(path=str(OUT/'mobile-list.png'),full_page=True)
        legacy = context.new_page()
        legacy.goto(BASE+'friends-v1.html',wait_until='networkidle')
        legacy.wait_for_function('window.Interbeing && Interbeing.validate()')
        check('Friends Edition 1.0 remains working at archive route', 'You are not' in legacy.locator('#hero-title').inner_text())
        legacy.close()
        check('No JavaScript errors in tested public interactions', not errors)
        browser.close()
    save('pass')
    print('INTERBEING V2 REAL-ORIGIN BROWSER PASS', flush=True)
except Exception:
    save('fail')
    raise
