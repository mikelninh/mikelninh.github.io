"""Two bounded checks of the actual GitLaw deployment, not the stale folder copy.
Uses only the page's public prepared example; never submits feedback, personal data,
an application or a legal action. One normal model request is allowed; the second
check aborts that request to exercise the actual source-only fallback.
This verifies interface behaviour, NOT legal correctness or general model quality.
"""
import json,re,time,traceback
from pathlib import Path
from datetime import datetime,timezone
from playwright.sync_api import sync_playwright,expect
OUT=Path('recruiter-review');OUT.mkdir(exist_ok=True)
report={'checkedAt':datetime.now(timezone.utc).isoformat(),'url':'https://mikelninh.github.io/gitlaw/#/mietrecht','scope':'One public prepared example, normal delivery and an explicitly induced model-request failure. No independent legal evaluation. No feedback submission.','cases':[]}
try:
  with sync_playwright() as p:
    browser=p.chromium.launch()
    for mode in ['normal','model-request-aborted']:
      ctx=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
      ctx.grant_permissions(['clipboard-read','clipboard-write'])
      mutations=[];api=[];runtime=[];case={'mode':mode};report['cases'].append(case)
      def guard(route):
        request=route.request
        if request.method not in ['GET','HEAD','OPTIONS']:
          mutations.append({'method':request.method,'url':request.url})
          if not request.url.endswith('/api/ask') or len(mutations)>1:
            route.abort();return
          if mode=='model-request-aborted':route.abort();return
        route.continue_()
      ctx.route('**/*',guard)
      page=ctx.new_page();page.set_default_timeout(40000)
      page.on('pageerror',lambda error:runtime.append(str(error)))
      page.on('response',lambda response:api.append({'url':response.url,'status':response.status}) if response.url.endswith('/api/ask') else None)
      response=page.goto(report['url'],wait_until='domcontentloaded',timeout=30000)
      assert response and response.status==200
      question=page.locator('textarea').first.input_value()
      assert question=='Ist meine Miete in Friedrichshain zu teuer? 2.000 Euro für 50 qm2.','Public prepared example changed; do not invent inputs.'
      started=time.monotonic();page.get_by_role('button',name='Fall einschätzen',exact=True).click()
      expect(page.get_by_role('heading',name='Das bedeutet für dich',exact=True)).to_be_visible()
      case['resultSeconds']=round(time.monotonic()-started,2)
      page.get_by_role('button',name='Zusammenfassung kopieren',exact=True).click()
      expect(page.get_by_role('button',name='Zusammenfassung kopiert ✓',exact=True)).to_be_visible()
      copied=page.evaluate('navigator.clipboard.readText()')
      assert question in copied and 'Noch offene Fragen:' in copied and 'Gefundene BGB-Quellen:' in copied and 'keine individuelle Rechtsberatung' in copied
      page.locator('summary').filter(has_text='Weitere Optionen und offene Fragen').click()
      expect(page.get_by_text('Was für eine genauere Prüfung noch fehlt',exact=True)).to_be_visible()
      page.locator('summary').filter(has_text='Gesetzesquellen und Grenzen ansehen').click()
      sources=page.locator('a[href^="https://www.gesetze-im-internet.de/bgb/"]')
      assert sources.count()>0
      first=sources.first
      first.locator('xpath=ancestor::details[1]/summary').click()
      expect(first).to_be_visible()
      urls=sources.evaluate_all('xs=>xs.map(x=>x.href)')
      check=page.request.get(urls[0],timeout=20000)
      assert check.status==200
      body=page.locator('body').inner_text()
      if mode=='model-request-aborted':assert 'Quellenmodus:' in body,'Fallback must disclose source-only mode.'
      page.screenshot(path=str(OUT/('gitlaw-'+mode+'-result.png')),full_page=True)
      page.set_viewport_size({'width':390,'height':844})
      assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1')
      page.screenshot(path=str(OUT/('gitlaw-'+mode+'-mobile.png')),full_page=True)
      assert not runtime,runtime
      assert len(mutations)<=1 and all(x['url'].endswith('/api/ask') for x in mutations),mutations
      case.update({'status':'passed','question':question,'sources':urls,'officialSourceHttp':check.status,'apiResponses':api,'sourceOnlyDisclosure':'Quellenmodus:' in body,'runtimeErrors':runtime,'requests':mutations,'resultText':body[:14000],'copyIncludesQuestionOpenFactsSourcesAndBoundary':True,'mobileOverflow':False})
      print('PASS GitLaw',mode,case['resultSeconds'],'seconds',len(urls),'sources; API',api,'source-only disclosure',case['sourceOnlyDisclosure'])
      ctx.close()
    browser.close()
  report['status']='passed'
except Exception as error:
  report['status']='failed';report['error']=str(error);report['traceback']=traceback.format_exc()
  raise
finally:
  (OUT/'gitlaw-interaction.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
