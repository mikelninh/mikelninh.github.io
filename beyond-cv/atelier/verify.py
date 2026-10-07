"""Browser QA for the two additive atelier routes. Never writes user content or commits.
Full navigation needs a browser allowed to reach the local HTTP test server.
"""
from __future__ import annotations
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import hashlib
import json
import os
import re
import subprocess
import threading
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'atelier-proof'
OUT.mkdir(exist_ok=True)
checks = []
errors = []
requests = []
failures = []

def passed(name):
    checks.append(name)
    print('PASS', name)

subprocess.run(['node', str(ROOT/'beyond-cv/atelier/test-engine.cjs')], check=True)
passed('24 dependency checks, including all 16 source combinations')
for file in ['beyond-cv/atelier/personal.js','beyond-cv/dksr/atelier/case.js']:
    subprocess.run(['node','--check',str(ROOT/file)], check=True)
passed('Browser JavaScript parses')

server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=os.environ.get('ATELIER_BASE',f'http://127.0.0.1:{server.server_port}').rstrip('/')
personal=base+'/beyond-cv/atelier/'
case=base+'/beyond-cv/dksr/atelier/'
axe_results=[]

try:
    with sync_playwright() as p:
        launch={'headless':True}
        if os.environ.get('CHROMIUM_PATH'):
            launch['executable_path']=os.environ['CHROMIUM_PATH']
        browser=p.chromium.launch(**launch)
        context=browser.new_context(viewport={'width':1440,'height':1000})
        context.grant_permissions(['clipboard-read','clipboard-write'])
        page=context.new_page()
        page.set_default_timeout(10000)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('request',lambda r:requests.append(r.url))
        page.goto(personal)
        assert page.locator('h1').count()==1
        assert 'My CV tells you' in page.locator('main').inner_text()
        assert page.locator('img').evaluate('(el)=>el.complete && el.naturalWidth>0')
        assert page.locator('.nav-links a[href="../../../cv-de.html"]').is_visible()
        passed('Original motto, real existing artwork and direct CV visible')
        page.screenshot(path=str(OUT/'personal-desktop.png'),full_page=True)
        page.screenshot(path=str(OUT/'personal-first-screen.png'))
        page.locator('#turn-artifact').click()
        assert page.locator('#artifact-back').is_visible()
        assert not page.locator('#artifact-front').is_visible()
        assert page.locator('#turn-artifact').get_attribute('aria-expanded')=='true'
        page.locator('#turn-artifact').press('Enter')
        assert page.locator('#artifact-front').is_visible()
        passed('Artwork concept opens and returns by pointer and keyboard')
        page.locator('#next-question').click()
        assert page.locator('#question-count').inner_text()=='02 / 08'
        page.locator('#copy-question').click()
        question=page.locator('#question-text').inner_text()
        page.wait_for_function('text=>navigator.clipboard.readText().then(v=>v===text)',arg=question)
        passed('Original conversation question and actual clipboard')
        malicious='<img src=x onerror=alert(1)> I cook with friends.'
        page.locator('#answer-0').fill(malicious)
        assert malicious in page.locator('#intro-output').input_value()
        assert page.locator('img').count()==1
        assert page.locator('#copy-intro').is_enabled()
        passed('One optional answer immediately creates a literal, editable draft')
        page.locator('#intro-output').fill('My own edited introduction.')
        page.locator('.optional summary').click()
        page.locator('#answer-1').fill('Learning to play the guitar.')
        assert page.locator('#intro-output').input_value()=='My own edited introduction.'
        page.locator('#rebuild-details summary').click()
        page.locator('#rebuild-draft').click()
        assert 'guitar' in page.locator('#intro-output').input_value()
        passed('Visitor edits survive further answers; rebuilding requires explicit action')
        before=page.locator('#intro-output').input_value()
        page.locator('#clear-draft').click()
        assert page.locator('#intro-output').input_value()==''
        page.locator('#undo-clear').click()
        assert page.locator('#intro-output').input_value()==before
        passed('Clear has a working in-memory undo')
        page.locator('#copy-intro').click()
        page.wait_for_function('text=>navigator.clipboard.readText().then(v=>v===text)',arg=before)
        with page.expect_download() as result:
            page.locator('#download-intro').click()
        assert Path(result.value.path()).read_text(encoding='utf-8').strip()==before.strip()
        passed('Clipboard and downloaded text exactly match the edited draft')
        page.evaluate("Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})")
        page.locator('#copy-intro').click()
        assert page.locator('#copy-fallback').is_visible()
        assert page.locator('#fallback-text').input_value()==before
        passed('Clipboard-denied path exposes selectable content')
        page.reload()
        assert page.locator('#answer-0').input_value()==''
        assert page.locator('#intro-output').input_value()==''
        assert page.evaluate('localStorage.length + sessionStorage.length')==0
        passed('Reload clears reflections; no persistent storage')
        page.locator('#work summary').click()
        page.locator('#work a[href="../dksr/atelier/"]').click()
        assert page.url.rstrip('/')==case.rstrip('/')
        assert page.locator('#answer-value').inner_text()=='415'
        page.locator('#all-claims summary').click()
        assert page.locator('#claim-rows tr').count()==9
        for claim in ['care','cooling','heat']:
            assert page.locator(f'[data-claim={claim}]').get_attribute('data-state')=='missing'
        passed('Real route connection and all operational conclusions remain unproven')
        page.locator('#source-care').focus()
        page.keyboard.press('Space')
        assert not page.locator('#source-care').is_checked()
        assert page.locator('[data-claim=site]').get_attribute('data-state')=='withheld'
        assert page.locator('[data-claim=climate]').get_attribute('data-state')=='supported'
        assert page.locator('[data-claim=green]').get_attribute('data-state')=='supported'
        assert page.locator('#answer-value').inner_text()=='—'
        assert '3 von 9' in page.locator('#source-delta').inner_text()
        passed('Hospital source withdrawal changes only its three dependent states')
        state_url=page.url
        assert 'off=care' in state_url
        page.screenshot(path=str(OUT/'dksr-source-withdrawn.png'),full_page=True)
        page.locator('[data-example=heat]').click()
        assert 'case=heat' in page.url
        assert not page.locator('#source-care').is_checked()
        page.locator('#source-justice').uncheck()
        assert page.locator('[data-claim=context]').get_attribute('data-state')=='withheld'
        assert page.locator('[data-claim=climate]').get_attribute('data-state')=='supported'
        passed('Two-input statement requires both sources while the climate fact remains')
        page.go_back()
        assert page.locator('#source-justice').is_checked()
        page.goto(state_url)
        assert not page.locator('#source-care').is_checked()
        page.locator('#reset-evidence').click()
        assert page.locator('#source-care').is_checked()
        for claim in ['care','cooling','heat']:
            assert page.locator(f'[data-claim={claim}]').get_attribute('data-state')=='missing'
        passed('Direct state URLs, browser Back and reset preserve evidence boundaries')
        page.locator('#share-state').click()
        # Clipboard was disabled only on the old personal-page document.
        page.wait_for_function("()=>navigator.clipboard.readText().then(v=>v.includes('/beyond-cv/dksr/atelier/?case=care'))")
        shared=page.evaluate('navigator.clipboard.readText()')
        assert 'I+cook' not in shared and 'answer' not in shared
        passed('Shared link contains only scenario and source selections')
        page.goto(case+'?case=%3Cscript%3E&off=care,nope')
        assert page.locator('#source-care').is_checked()==False
        assert '<script>' not in page.locator('h1').inner_text()
        passed('Unknown URL values are bounded and not injected')
        for width in [320,360,390,768,1440]:
            page.set_viewport_size({'width':width,'height':900})
            for key,url in [('personal',personal),('dksr',case)]:
                page.goto(url)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,url)
                assert page.locator('.nav-links a').last.is_visible()
                if width==390: page.screenshot(path=str(OUT/(key+'-mobile.png')),full_page=True)
            passed(f'No horizontal page overflow and contact visible at {width}px')
        page.set_viewport_size({'width':1440,'height':1000})
        page.goto(case)
        page.screenshot(path=str(OUT/'dksr-desktop.png'),full_page=True)
        page.screenshot(path=str(OUT/'dksr-first-screen.png'))
        page.emulate_media(reduced_motion='reduce')
        for url in [personal,case]:
            page.goto(url)
            assert page.evaluate('getComputedStyle(document.documentElement).scrollBehavior')=='auto'
        passed('Reduced-motion preference honoured on both routes')
        # Text enlargement is a targeted reflow check, not a complete browser-zoom audit.
        page.set_viewport_size({'width':390,'height':900})
        for url in [personal,case]:
            page.goto(url)
            page.add_style_tag(content='p,label,button,a,summary{font-size:150%!important}')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        passed('150% text enlargement has no horizontal page overflow at 390px')
        # Accessibility API snapshot + automated axe are evidence, not manual screen-reader certification.
        page.set_viewport_size({'width':1440,'height':1000})
        axe=os.environ.get('AXE_PATH')
        if axe:
            for key,url in [('personal',personal),('dksr',case)]:
                page.goto(url)
                page.add_script_tag(path=axe)
                result=page.evaluate("async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})")
                axe_results.append({'page':key,'violations':result['violations'],'incomplete':[{'id':x['id'],'impact':x['impact']} for x in result['incomplete']]})
                assert not result['violations'],[(x['id'],x['description']) for x in result['violations']]
            passed('Axe reports no tested WCAG A/AA violations on both initial pages')
        else:
            print('NOT RUN: axe requires AXE_PATH; no accessibility-conformance claim')
        nojs=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':900})
        fallback=nojs.new_page()
        fallback.goto(personal)
        fallback.locator('#prompt-details summary').click()
        assert fallback.locator('#gift-prompt').is_visible()
        assert fallback.locator('img').is_visible()
        fallback.goto(case+'?off=care')
        fallback.locator('#all-claims summary').click()
        assert fallback.locator('#claim-rows tr').count()==9
        assert fallback.locator('#source-care').is_disabled()
        assert 'Ausgangsfall' in fallback.locator('noscript').inner_text()
        passed('No-JavaScript reading, original baseline, clear inactive controls and free prompt')
        assert not errors,errors
        origin=urlparse(base).netloc
        assert all(urlparse(url).netloc==origin or url.startswith(('data:','blob:')) for url in requests),requests
        passed('No runtime errors or third-party requests during tested interactions')
        browser.close()
    report={'status':'passed','checks':len(checks),'passed':checks,'axe':axe_results,
      'scope':'Build/browser/dependency tests only. No field performance, manual screen-reader review, municipal validation or independent user study.',
      'source_commit':os.environ.get('GITHUB_SHA'),
      'sha256':{str(f.relative_to(ROOT)):hashlib.sha256(f.read_bytes()).hexdigest() for f in [ROOT/'beyond-cv/atelier/index.html',ROOT/'beyond-cv/atelier/evidence.js',ROOT/'beyond-cv/dksr/atelier/index.html']}}
    (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
finally:
    (OUT/'axe.json').write_text(json.dumps(axe_results,ensure_ascii=False,indent=2),encoding='utf-8')
    server.shutdown();server.server_close()
