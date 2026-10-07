"""Bounded browser acceptance for this candidate. No real submissions or model requests.
ATELIER verify.py separately exercises source dependency and reflection journeys.
This is not a user study, legal/clinical validation, or field performance audit.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import unquote, urlparse
import hashlib, json, os, threading, traceback
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'recruiter-review';OUT.mkdir(exist_ok=True)
checks=[];errors=[];requests=[];axe_results=[]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=os.environ.get('JOURNEY_BASE',f'http://127.0.0.1:{server.server_port}').rstrip('/')
report={'status':'running','sourceCommit':os.environ.get('GITHUB_SHA'),'checkedAt':datetime.now(timezone.utc).isoformat(),'base':base,'scope':'Developer-authored browser journeys. No independent readers, full screen-reader audit, field performance, legal or clinical validation.'}
def ok(name):
    checks.append(name);print('PASS',name)
def overflow(page):
    return page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
try:
  with sync_playwright() as p:
    browser=p.chromium.launch()
    ctx=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    ctx.grant_permissions(['clipboard-read','clipboard-write'])
    page=ctx.new_page();page.set_default_timeout(10000)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:requests.append({'url':r.url,'method':r.method}))
    page.goto(base+'/selected-work/#careos')
    expect(page.locator('#tab-careos')).to_have_attribute('aria-selected','true')
    assert page.locator('.panel:visible').count()==1
    assert '/careos/sjk/' in page.locator('#careos .demo-link').get_attribute('href')
    page.locator('#tab-careos').focus();page.keyboard.press('ArrowRight')
    expect(page.locator('#tab-commons')).to_be_focused()
    assert page.url.endswith('#commons')
    page.keyboard.press('Home');assert page.url.endswith('#pruefpilot')
    page.keyboard.press('End');assert page.url.endswith('#commons')
    page.go_back();expect(page.locator('#tab-pruefpilot')).to_have_attribute('aria-selected','true')
    ok('Project deep links, four-way selection, arrow/Home/End keys and browser Back')
    for key in ['pruefpilot','gitlaw','careos','commons']:
      page.locator('#tab-'+key).click()
      assert page.locator('.panel:visible').count()==1
      assert page.locator('#'+key+' .boundary').is_visible()
      assert page.locator('#'+key+' .demo-link').get_attribute('target')=='_blank'
      assert page.locator('#contact-project').get_attribute('href').startswith('mailto:')
      assert 'subject=' in page.locator('#contact-project').get_attribute('href')
    ok('Every project has a task, a visible boundary, code and a user-controlled contact route')
    # Exercise the ACTUAL demo link and verify the originating tab stays open.
    page.locator('#tab-pruefpilot').click()
    page.route('https://mikelninh.github.io/pruefpilot/',lambda route:route.fulfill(status=200,body='<title>Link destination probe</title><p>Separate tab verified</p>',content_type='text/html'))
    with page.expect_popup() as popup:
      page.locator('#pruefpilot .demo-link').click()
    child=popup.value;child.wait_for_load_state();assert child.url=='https://mikelninh.github.io/pruefpilot/'
    assert page.url.startswith(base+'/selected-work/');child.close();page.unroute('https://mikelninh.github.io/pruefpilot/')
    ok('Demo link opens its stated destination in a separate tab (destination stub; real demo tested separately)')

    page.goto(base+'/pruefpilot/')
    assert 'Prepared browser simulation.' in page.locator('#review').inner_text()
    for key,title in [('funding','Not ready for approval'),('travel','Needs correction'),('clean','All checks passed')]:
      page.locator('[data-case='+key+']').click();page.locator('#run').click()
      expect(page.locator('#findingTitle')).to_have_text(title)
      expect(page.locator('#result')).to_be_visible()
      page.locator('#why').click();expect(page.locator('#evidence')).to_be_visible()
      expect(page.locator('#why')).to_have_attribute('aria-expanded','true')
      if key!='clean':
        assert not page.locator('#approveWrap').is_visible()
        page.locator('#resolve').click();expect(page.locator('#draftBody')).not_to_be_empty()
        assert 'simulate' in page.locator('#queue').inner_text()
        page.locator('#queue').click();assert 'simulated' in page.locator('#queueState').inner_text()
        page.evaluate("document.getElementById('approve').click()")
        assert not page.locator('#released').is_visible()
      else:
        assert not page.locator('#released').is_visible()
        page.locator('#approve').click();expect(page.locator('#released')).to_be_visible()
    ok('All three document cases: evidence, correct next step and explicit simulated human approval')
    page.locator('[data-case=funding]').click();page.locator('#run').click()
    page.locator('[data-case=clean]').click();page.wait_for_timeout(700)
    assert not page.locator('#result').is_visible()
    assert not page.locator('#approveWrap').is_visible()
    assert page.locator('#run').is_enabled()
    page.evaluate("document.getElementById('approve').click()")
    assert not page.locator('#released').is_visible()
    page.locator('#run').click();expect(page.locator('#findingTitle')).to_have_text('All checks passed')
    ok('Regression: switching cases during the delay cancels stale results and prevents a false approval')
    page.locator('#why').click();page.locator('[data-case=travel]').click()
    expect(page.locator('#why')).to_have_attribute('aria-expanded','false')
    ok('Case reset clears evidence state and accessibility announcement state')

    page.goto(base+'/careos/sjk/')
    page.locator('[data-source=src1]').click();expect(page.locator('#src1')).to_be_visible()
    assert 'pending' in page.locator('#src1').inner_text()
    page.locator('[data-go=handover]').click();expect(page.locator('#handover')).to_be_visible()
    handover=page.locator('#handoverText').inner_text()
    assert 'ausstehend' in handover and 'Allergieangaben widersprüchlich' in handover
    page.locator('#copyButton').click()
    page.wait_for_function('text=>navigator.clipboard.readText().then(v=>v===text)',arg=handover)
    ok('CareOS source to handover preserves pending result and conflict; clipboard equals visible draft')
    page.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('denied'))},configurable:true})")
    page.locator('#copyButton').click();expect(page.locator('#care-copy-fallback')).to_be_visible()
    assert page.locator('#care-copy-text').input_value()==handover
    assert page.locator('#care-copy-text').evaluate('e=>e.selectionEnd-e.selectionStart')==len(handover)
    ok('CareOS rejected clipboard permission exposes selected, exact fallback text')
    page.locator('[data-go=today]').focus();page.keyboard.press('Enter')
    expect(page.locator('[data-go=today]')).to_have_attribute('aria-pressed','true')
    ok('CareOS keyboard navigation and active-state announcement')

    page.goto(base+'/beyond-cv/atelier/')
    assert page.locator('#person').is_visible()
    assert 'AI-assisted collectible study' in page.locator('figcaption').inner_text()
    assert not page.locator('#work').get_attribute('open')
    page.locator('#next-question').click()
    assert page.locator('#question-text').inner_text() in unquote(page.locator('#reply-question').get_attribute('href'))
    assert 'body=' in page.locator('#reply-question').get_attribute('href')
    assert page.locator('.closing a[href^="mailto:"]').count()>=1
    ok('Beyond leads with the person, labels artwork, keeps work optional and carries the chosen question into an email draft')
    paths=['selected-work/','pruefpilot/','careos/sjk/','beyond-cv/atelier/','beyond-cv/dksr/atelier/']
    for width in [320,390,768,1440]:
      page.set_viewport_size({'width':width,'height':900})
      for path in paths:
        page.goto(base+'/'+path)
        assert not overflow(page),(path,width)
        if path=='selected-work/':
          for key in ['gitlaw','careos','commons']:
            page.locator('#tab-'+key).click();assert not overflow(page),(key,width)
        if width in (390,1440):
          name=path.strip('/').replace('/','-')
          page.screenshot(path=str(OUT/(name+'-'+str(width)+'.png')),full_page=True)
          if width==1440:page.screenshot(path=str(OUT/(name+'-first-screen.png')))
      ok(f'Five entry paths and all project tabs have no horizontal overflow at {width}px')
    # Strict automated accessibility on the newly authored selector. Existing atelier has its own strict axe checks.
    axe=os.environ.get('AXE_PATH')
    if axe:
      page.set_viewport_size({'width':1440,'height':1000});page.goto(base+'/selected-work/')
      page.add_script_tag(path=axe)
      for key in ['pruefpilot','gitlaw','careos','commons']:
        page.locator('#tab-'+key).click()
        a=page.evaluate("async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})")
        axe_results.append({'panel':key,'violations':a['violations']})
        assert not a['violations'],[(x['id'],x['description']) for x in a['violations']]
      ok('Axe: no tested A/AA violations in any of the four new project panels')
    nojs=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':900})
    fallback=nojs.new_page();fallback.goto(base+'/selected-work/')
    assert fallback.locator('.panel:visible').count()==4
    assert fallback.locator('.demo-link:visible').count()==4
    ok('No JavaScript: all four projects, boundaries and demo links remain readable')
    assert not errors,errors
    origin=urlparse(base).netloc
    assert all(r['method']=='GET' for r in requests),requests
    assert all(urlparse(r['url']).netloc in (origin,'mikelninh.github.io') or r['url'].startswith(('data:','blob:')) for r in requests),requests
    ok('No JavaScript runtime errors or mutating network requests in tested candidate journeys')

    # Inspect the actual independently deployed GitLaw app, not the stale root-folder copy.
    live=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    live_page=live.new_page();live_page.set_default_timeout(12000)
    live_errors=[];live_page.on('pageerror',lambda e:live_errors.append(str(e)))
    response=live_page.goto('https://mikelninh.github.io/gitlaw/#/mietrecht',wait_until='domcontentloaded',timeout=30000)
    live_page.wait_for_timeout(1800)
    assert response and response.status==200
    observed=live_page.evaluate("""()=>({title:document.title,body:document.body.innerText,links:[...document.querySelectorAll('a[href]')].map(x=>({text:x.innerText,url:x.href})),controls:[...document.querySelectorAll('button,input,select')].map(x=>({tag:x.tagName,id:x.id,text:x.innerText||x.getAttribute('placeholder')||'',type:x.type}))})""")
    observed.update({'url':live_page.url,'status':response.status,'errors':live_errors,'scope':'Read-only actual deployment inspection; no model call, upload, form submission or legal validation.'})
    (OUT/'gitlaw-live.json').write_text(json.dumps(observed,ensure_ascii=False,indent=2))
    live_page.screenshot(path=str(OUT/'gitlaw-live-desktop.png'),full_page=True)
    live_page.set_viewport_size({'width':390,'height':900});live_page.screenshot(path=str(OUT/'gitlaw-live-mobile.png'),full_page=True)
    assert not overflow(live_page) and not live_errors
    ok('Actual GitLaw tenancy deep link: public HTTP200, no runtime errors or mobile overflow (read-only inspection)')
    browser.close()
  report['status']='passed'
except Exception as exc:
  report['status']='failed';report['error']=str(exc);report['traceback']=traceback.format_exc()
  raise
finally:
  report['passed']=checks;report['checks']=len(checks);report['runtimeErrors']=errors;report['axe']=axe_results
  report['hashes']={f:hashlib.sha256((ROOT/f).read_bytes()).hexdigest() for f in ['selected-work/index.html','pruefpilot/index.html','careos/sjk/index.html','beyond-cv/atelier/index.html','beyond-cv/atelier/personal.js']}
  (OUT/'acceptance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
  server.shutdown();server.server_close()
