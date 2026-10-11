from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse,unquote
import json,re
from playwright.sync_api import sync_playwright
base=Path(__file__).parent
D=json.loads((base/'stories.json').read_text())
audit=json.loads((base/'issue02-evidence.json').read_text())
assert len(D['articles'])==10 and len(D['sources'])==13
assert len(audit['claims'])==10
for i,a in enumerate(D['articles']):
 assert a['ref'] and all(k in D['sources'] for k in a['ref'])
 assert audit['claims'][i]['article_id']==a['id']
 for l in ('de','en','vi'):
  p=base/'read'/a['id']/l/'index.html'
  assert p.is_file(),str(p)
  soup=BeautifulSoup(p.read_text(), 'html.parser')
  assert soup.html.attrs.get('lang')==l
  assert soup.find('h1').get_text(strip=True)==a[l]['title']
  assert soup.find('main',id='story')
  assert len(soup.select('.story-receipts li'))==len(a['ref'])
  assert len(soup.select('link[rel="alternate"]'))==3
  assert 'story-deeper' in p.read_text()
  assert len(' '.join(a[l][k] for k in ('lead','best','finding','closer','uncertainty','action')).split())>=235,(a['id'],l)
  for elem in soup.select('a[href],link[rel="stylesheet"]'):
   href=elem.get('href')
   if href and not href.startswith(('http:','https:','#','mailto:')):
    target=(p.parent/href.split('#')[0].split('?')[0]).resolve()
    if target.is_dir():target=target/'index.html'
    assert target.is_file(),(p,href,target)
index=BeautifulSoup((base/'index.html').read_text(),'html.parser')
for src in ['stories.js','issue02.js','issue02.css']:
 assert any(x.get('src')=='./'+src or x.get('href')=='./'+src for x in index.find_all(['link','script'])),src
for w in (320,360,768,1024):
 with sync_playwright() as p:
  b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-web-security'])
  for a in D['articles']:
   l=['de','en','vi'][len(a['id'])%3]
   page=(base/'read'/a['id']/l/'index.html').read_text()
   page=re.sub(r'<link href="https://fonts.googleapis.com[^>]*>','',page)
   page=page.replace('<link rel="stylesheet" href="../../../reader.css">','')
   pg=b.new_page(viewport={'width':w,'height':760})
   pg.set_content(page)
   pg.add_style_tag(content=(base/'reader.css').read_text())
   assert pg.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'),(w,a['id'],l,'overflow')
   assert pg.locator('h1').is_visible(),(w,a['id'],l,'h1 not visible')
   pg.close()
  b.close()
print('PASS: 30 articles, all citations and internal links, 4 viewport widths × 10 article samples, localized, 10 evidence records.')
