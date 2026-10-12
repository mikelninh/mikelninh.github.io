#!/usr/bin/env python3
"""GOOD QUESTION Slow Edition release smoke suite. Product QA, NOT expert scientific review."""
from pathlib import Path
from threading import Thread
from bs4 import BeautifulSoup
import json, xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
checks=[]
def check(name,condition,detail=''):
  checks.append((name,bool(condition),str(detail)))
  if not condition:print('FAIL',name,detail)
  return condition
def document(lang):
  soup=BeautifulSoup((ROOT/'index.html').read_text(),'html.parser')
  soup.html['lang']=lang
  for link in [l for l in soup.find_all('link',rel='stylesheet') if l.get('href','').startswith('./')]:
    style=soup.new_tag('style');style.string=(ROOT/link.get('href','').split('?')[0]).read_text();link.replace_with(style)
  scripts=list(soup.find_all('script',src=True))
  for script in scripts:
    script.extract()
  setter=soup.new_tag('script');setter.string=f'history.replaceState(null,"","about:blank?lang={lang}")';soup.body.append(setter)
  for old in scripts:
    injected=soup.new_tag('script');injected.string=(ROOT/old['src'].split('?')[0]).read_text();soup.body.append(injected)
  return str(soup)
def load(page,lang='en',story=None):
  body=document(lang)
  if story: body=body.replace(f'about:blank?lang={lang}',f'about:blank?lang={lang}&story={story}')
  page.set_content(body,wait_until='domcontentloaded');page.wait_for_timeout(100)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':850},locale='en-GB',accept_downloads=True)
 # Block only third party font and image requests, don't block localhost.
 context.route('**/*',lambda route: route.abort())
 page=context.new_page();page.set_default_timeout(6000);errors=[]
 page.on('pageerror',lambda err:errors.append(str(err)))
 for lang in ['de','en','vi']:
  for width in [360,390,768,1440]:
   page.set_viewport_size({'width':width,'height':900});before=len(errors)
   load(page,lang)
   label=f'{lang}/{width}'
   check(label+' no overflow',page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'),page.evaluate('[document.documentElement.scrollWidth,window.innerWidth]'))
   check(label+' no JS error',len(errors)==before,str(errors[before:]))
   check(label+' language',page.locator('html').get_attribute('lang')==lang)
   check(label+' five feature cards + playable experiment',page.locator('.story-card').count()==5 and page.locator('[data-choice]').count()==3)
   check(label+' five topic switches',page.locator('[data-topic]').count()==5)
   check(label+' at most five finite feed items',page.locator('.feed-item').count()<=5)
   check(label+' one h1',page.locator('h1').count()==1)
   check(label+' newsletter has four pages label','4' in page.locator('#page-counter').inner_text())
   if lang=='en' and width in [390,1440]:page.screenshot(path=str(ROOT.parent.parent.parent/f'GQ_Slow_{width}.png'),full_page=True)
 # interactive checks at wide width
 page.set_viewport_size({'width':1440,'height':950});load(page,'en');
 check('initial topics 3',len(page.evaluate('window.GQ_SLOW_TEST.getTopics()'))==3)
 check('initial feed matches selected topics',page.locator('.feed-item').count()==4)
 page.locator('[data-topic="culture"]').click();check('topic updates feed',page.locator('.feed-item').count()==5)
 check('topic selection shown',page.locator('[data-topic="culture"]').get_attribute('aria-pressed')=='true')
 page.locator('#reset-topics').click();check('topics reset',len(page.evaluate('window.GQ_SLOW_TEST.getTopics()'))==3)
 page.locator('[data-story="reef"]').first.click();check('reef dialog opens',page.locator('#article-dialog[open]').count()==1)
 check('reef source list present',page.locator('#article-view .source-row').count()==5)
 check('reef scene not portrayed as proof','not' in page.locator('.article-disclosure').inner_text().lower())
 check('deep-link URL updated','story=reef' in page.url)
 page.locator('#close-dialog').click();check('dialog closes',page.locator('#article-dialog[open]').count()==0 and 'story=' not in page.url)
 # Direct shareable story and source link
 load(page,'vi',story='meaning');check('Vietnamese deep link',page.locator('#article-dialog[open]').count()==1 and 'Vegan Society' in page.locator('#article-view').inner_text())
 page.keyboard.press('Escape');check('escape closes modal',page.locator('#article-dialog[open]').count()==0)
 # Language change: direct site UI update
 page.locator('[data-lang="de"]').click();check('language DE UI',page.locator('html').get_attribute('lang')=='de')
 page.locator('[data-lang="en"]').click();check('language EN UI',page.locator('html').get_attribute('lang')=='en')
 # Game multiple outcomes, no score
 page.locator('[data-choice="1"]').click();check('game displays qualitative effects','Might harm' in page.locator('#game-outcome').inner_text() and 'Still unknown' in page.locator('#game-outcome').inner_text())
 page.locator('[data-choice="2"]').click();check('third scenario distinct','market' in page.locator('#game-outcome').inner_text().lower())
 check('no score in game',not page.locator('#game-outcome').locator('[data-score]').count())
 # Newsletter navigation
 page.locator('#next-page').click();check('newsletter page 2','2 / 4' in page.locator('#page-counter').inner_text())
 for _ in range(2):page.locator('#next-page').click()
 check('newsletter finite ends at 4','4 / 4' in page.locator('#page-counter').inner_text() and page.locator('#next-page').is_disabled())
 # Product status and personal ranking persist
 check('4 pantry entries',page.locator('.product').count()==4)
 check('Toomba ingredient caution',page.locator('[data-brand=toomba]').count()==1 and 'NOT verified' in page.locator('[data-brand=toomba]').locator('xpath=..').locator('.label-status').inner_text())
 page.locator('[data-rate="alpro-soy"]').select_option('1');check('user personal rating selected',page.locator('[data-rate="alpro-soy"]').input_value()=='1')
 # Sources displayed
 urls={s['url'] for s in json.loads((ROOT/'content.json').read_text())['sources']}
 check('source URL presence',len(urls)>=9 and len(json.loads((ROOT/'content.json').read_text())['sources'])==10)
 check('no browser JS errors overall',not errors,str(errors))
 browser.close()
report={'suite':'GOOD QUESTION Slow Edition local smoke','timestamp':'2026-10-12','passed':sum(c[1] for c in checks),'total':len(checks),'failures':[{'name':n,'detail':d} for n,ok,d in checks if not ok],'scope':'browser/mobile/functionality checks; not independent scientific or linguistic review'}
(ROOT/'QA_RESULTS.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));raise SystemExit(bool(report['failures']))
