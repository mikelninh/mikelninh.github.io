#!/usr/bin/env python3
"""Offline release QA. pip install playwright beautifulsoup4; Chromium required.
Runs without external network and does not weaken browser security policies.
It cannot certify science, accessibility compliance, live HTTP or real-store prices.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from urllib.parse import urlparse,unquote
import json, math, shutil, csv, io, xml.etree.ElementTree as ET, sys
ROOT=Path(__file__).resolve().parent
RESULTS=[]
D=json.loads((ROOT/'edition03-data.js').read_text().split('window.GQ3=',1)[1].rstrip(';\n')); OLD=json.loads((ROOT/'stories.json').read_text())
def check(name, passed, detail=''):
 RESULTS.append({'test':name,'pass':bool(passed),'detail':detail})
 print('PASS' if passed else 'FAIL',name,detail,flush=True)
def inline(view,lang):
 s=BeautifulSoup((ROOT/('feature.html' if view=='feature' else 'index.html')).read_text(),'html.parser');s.html['lang']=lang
 tag=s.new_tag('base',href='https://mikelninh.github.io/good-question/');s.head.insert(0,tag)
 for old in list(s.find_all('link',rel='stylesheet')):
  tag=s.new_tag('style');tag.string=(ROOT/old['href'].split('?')[0]).read_text();old.replace_with(tag)
 for old in list(s.find_all('script',src=True)):
  tag=s.new_tag('script');tag.string=(ROOT/old['src'].split('?')[0]).read_text();old.replace_with(tag)
 return str(s)
def val(page):return page.evaluate('window.GQ3_TEST.getCalculation()')
def near(a,b):return math.isclose(a,b,rel_tol=1e-9,abs_tol=1e-9)
def load(page,view='feature',lang='en'):
 page.evaluate("if(location.href.startsWith('about:blank'))history.replaceState(null,'','about:blank')")
 page.set_content(inline(view,lang),wait_until='domcontentloaded');page.add_style_tag(content='html{scroll-behavior:auto!important}');page.wait_for_timeout(10)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox'])
 context=browser.new_context(accept_downloads=True,viewport={'width':1440,'height':1000})
 # Only preview local HTML. External decorative imagery is deliberately not requested.
 context.route('**/*',lambda route:route.abort())
 page=context.new_page();page.set_default_timeout(3000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 expected=100/500*.85+75/500*1.45+200/690*1.05
 for view in ['home','feature']:
  for lang in ['de','en','vi']:
   for width in [360,390,768,1440]:
    page.set_viewport_size({'width':width,'height':900});before=len(errors);load(page,view,lang)
    key=f'{view}/{lang}/{width}'
    check(key+' no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
    check(key+' no script exceptions',len(errors)==before,str(errors[before:]))
    check(key+' locale',page.locator('html').get_attribute('lang')==lang)
    check(key+' one H1',page.locator('h1').count()==1)
    check(key+' named controls',page.evaluate("Array.from(document.querySelectorAll('button')).every(b=>b.textContent.trim()||b.getAttribute('aria-label'))"))
    if view=='feature':check(key+' calculation',near(val(page)['perPortion'],expected))
    if width in [390,1440] and lang=='en':page.screenshot(path=str(ROOT.parent/f'issue03-{view}-{lang}-{width}.png'),full_page=True)
 page.set_viewport_size({'width':1440,'height':1000});load(page,'feature')
 check('default checkout',near(val(page)['checkout'],3.35));check('default packs',val(page)['packs']==3)
 page.locator('#servings').fill('6');c=val(page);check('six portions preserve unit cost',near(c['perPortion'],expected));check('whole-pack ceiling six portions',near(c['checkout'],5.25) and c['packs']==5)
 page.locator('#servings').fill('1');page.locator('.own[data-item=pasta]').check();c=val(page);check('pantry checkout excludes owned item',near(c['checkout'],2.50));check('pantry consumed cost retained',near(c['perPortion'],expected))
 page.locator('.own[data-item=pasta]').uncheck();page.locator('.pack-price[data-item=pasta]').fill('1.70');c=val(page);check('edited prices reflected',c['edited'] and near(c['perPortion'],expected+.17))
 page.locator('[data-lang=vi]').click();c=val(page);check('language change retains calculation',near(c['perPortion'],expected+.17) and page.locator('html').get_attribute('lang')=='vi')
 page.locator('#reset-prices').click();check('reference reset',not val(page)['edited'] and near(val(page)['perPortion'],expected))
 for bad in ['', '0', '13']:
  page.locator('#servings').fill(bad);check('invalid portions '+repr(bad),val(page) is None and page.locator('#download-basket').is_disabled())
 page.locator('#servings').fill('1');page.locator('.pack-price[data-item=pasta]').fill('-1');check('negative price rejected',val(page) is None)
 page.locator('#reset-prices').click();page.locator('.amount[data-item=pasta]').fill('1001');check('quantity out of range rejected',val(page) is None)
 page.locator('.amount[data-item=pasta]').fill('100');page.locator('[data-preset=tofu]').click();c=val(page);check('tofu preset correct',near(c['perPortion'],150/200*.95+75/1000*3.15+200/690*1.05))
 page.locator('[data-preset=chickpea]').click();c=val(page);check('chickpea uses drained mass',c['rows'][0]['pack_g']==220 and near(c['perPortion'],.85+75/1000*3.15+200/690*1.05))
 for el in page.locator('.own').all():el.check()
 check('all pantry checkout zero',val(page)['checkout']==0 and val(page)['packs']==0 and val(page)['perPortion']>0)
 with page.expect_download() as event:page.locator('#download-basket').click()
 file=event.value.path(); rows=list(csv.reader(io.StringIO(Path(file).read_text(encoding='utf-8-sig'))))
 check('CSV contains headers, three rows and exclusion',len(rows)==5 and 'source_url' in rows[0] and rows[-1][0]=='NOTE')
 with page.expect_download() as event:page.locator('[data-download-chart]').click()
 rows=list(csv.reader(io.StringIO(Path(event.value.path()).read_text())));check('environment CSV five indicators',len(rows)==6 and rows[1][1]=='25.1' and rows[5][3]=='65.3')
 page.locator('[data-evidence=ENV-003]').first.click();check('inspect original source',page.locator('dialog[open] .source-entry').count()==1 and 's43016-023-00795-w' in page.locator('dialog').inner_html());page.keyboard.press('Escape');check('Escape closes and restores focus',page.locator('dialog[open]').count()==0 and page.evaluate("document.activeElement.dataset.evidence==='ENV-003'"))
 page.locator('#question-body').fill('Test question — never submitted.');page.locator('#question-source').fill('https://example.com/source');page.evaluate('window.open=(url)=>window.__draftURL=url');page.locator('#correction-form button[type=submit]').click();url=page.evaluate('window.__draftURL');check('correction is only a public issue draft',url.startswith('https://github.com/mikelninh/mikelninh.github.io/issues/new?') and 'Test%20question' in url)
 load(page,'home');check('three featured stories',page.locator('#featured-stories .story-card').count()==3);check('seven other stories',page.locator('#article-list .reading-item').count()==7)
 page.locator('[data-filter=planet]').click();check('environment filter',page.locator('#article-list .reading-item').count()==sum(a['cat']=='planet' for a in OLD['articles']))
 page.locator('[data-filter=all]').click();page.locator('#library-search').fill('zzzzunfindable');check('empty search state',page.locator('#no-match').is_visible());page.locator('#library-search').fill('');
 page.locator('[data-save=b12]').first.click();check('bookmark toggles',page.locator('[data-save=b12]').first.get_attribute('aria-pressed')=='true');page.locator('[data-open-saved]').click();check('reading-list item',page.locator('#dialog-results .reading-item').count()==1);page.locator('dialog [data-save=b12]').click();check('remove saved item',page.locator('#dialog-results .reading-item').count()==0);page.keyboard.press('Escape')
 page.keyboard.press('Control+k');check('keyboard search opens',page.locator('dialog[open] #dialog-search').count()==1);page.locator('#dialog-search').fill(next(a['en']['title'] for a in OLD['articles'] if a['id']=='b12'));check('search exact title',page.locator('#dialog-results .reading-item').count()==1,page.locator('html').get_attribute('lang')+' / '+page.locator('#dialog-results').inner_text());page.keyboard.press('Escape')
 # Browser storage in about:blank is unavailable: assert honest degradation, not a persistence test.
 page.locator('[data-save=b12]').first.click();check('unavailable storage communicated','session' in page.locator('#notice').inner_text().lower())
 # Check all rendered internal document links. Plant Table is intentionally an external companion.
 missing=[]
 for view in ['home','feature']:
  for lang in ['de','en','vi']:
   load(page,view,lang)
   for href in page.locator('a[href]').evaluate_all('(a)=>a.map(x=>x.getAttribute("href"))'):
    u=urlparse(href)
    if u.scheme or href.startswith('#'):continue
    path=ROOT/unquote(u.path or './');path=path/'index.html' if path.is_dir() else path
    if not path.is_file():missing.append(href)
 check('new page internal links resolve',not missing,str(missing))
 check('no accumulated JavaScript exceptions',not errors,str(errors))
 browser.close()
for lang,filename in [('de','feed.xml'),('en','feed-en.xml'),('vi','feed-vi.xml')]:
 channel=ET.parse(ROOT/filename).getroot().find('channel');check(lang+' RSS feed parses and has eleven articles',channel.findtext('language')==lang and len(channel.findall('item'))==11)
check('thirty old static reading pages preserved',len(list((ROOT/'read').glob('*/*/index.html')))==30)
check('all intervals ordered and common zero-to-100 axis',all(0<=m['low']<=m['estimate']<=m['high']<=100 for m in D['metrics']))
check('unique source identifiers',len({s['id'] for s in D['sources']})==len(D['sources']))
check('no independent review falsely claimed',D['independent_review'] is False and D['formal_grade'] is False and D['native_language_review'] is False)
check('all translations share same interface keys',set(D['translations']['de'])==set(D['translations']['en'])==set(D['translations']['vi']))
report={'edition':'03','date':'2026-10-11','mode':'offline Chromium via set_content with network requests blocked','technical_checks':len(RESULTS),'passed':sum(r['pass'] for r in RESULTS),'failed':sum(not r['pass'] for r in RESULTS),'results':RESULTS,'limitations':['Not an independent scientific or native-language review.','Not a formal WCAG conformance audit.','Does not verify live HTTP deployment, actual remote-image loading or current checkout prices.','Opaque-origin storage fallback tested; real-origin cross-reload localStorage persistence requires a live browser test.']}
(ROOT/'qa-issue03.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['results']},ensure_ascii=False,indent=2))
sys.exit(bool(report['failed']))
