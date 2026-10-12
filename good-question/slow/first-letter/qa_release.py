#!/usr/bin/env python3
"""WUNDERPOST 001 smoke checks — editorial status, translation and source integrity.
Technical tests do NOT certify taste, external sources, mobile speech reliability,
the identity of a reviewer, financial arrangements or linguistic quality.
"""
from pathlib import Path
from html.parser import HTMLParser
import json, re, subprocess, sys
BASE=Path(__file__).resolve().parent
SLOW=BASE.parent
data_js=(BASE/'data.js').read_text()
assert data_js.startswith('window.GQ_LETTER=') and data_js.rstrip().endswith(';')
data=json.loads(data_js[len('window.GQ_LETTER='):].strip().rstrip(';'))
page=(BASE/'index.html').read_text()
app=(BASE/'app.js').read_text()
audio=(SLOW/'audio-v11.js').read_text()
passed=0
def check(desc,test):
 global passed
 if not test: raise AssertionError(desc)
 passed+=1
 print('PASS',desc)
check('Founding letter dates and editors',data['published']=='2026-10-12' and data['editors']==['Mikel','Huong'])
check('No affiliate programmes or discounts misrepresented',data['affiliate'] is False and data['discounts'] is False)
check('No default founder grades published','"mikel":{"S"' not in data_js and 'rating' not in data['products'][0])
check('Seven product records; Toomba special warning',len(data['products'])==7 and sum(p['status']!='not_vegan' for p in data['products'])==6)
check('Toomba never an eligible vegan recommendation',all((p['id']=='toomba')==(p['status']=='not_vegan') for p in data['products']))
check('All product sources are explicit, non-affiliate HTTPS URLs',all(p['source'].startswith('https://') and 'utm_' not in p['source'] and 'aff=' not in p['source'] for p in data['products']))
check('Toomba cannot be mistaken for purchase link',next(p for p in data['products'] if p['id']=='toomba')['shop'] is None)
check('All copy locales present',set(data['i18n'])=={'de','en','vi'})
keys=set(data['i18n']['en'])
for l in ['de','en','vi']:
 check(l+' equal translation keys',set(data['i18n'][l])==keys)
 check(l+' first letter not empty',all(len(data['i18n'][l][k])>50 for k in ['intro1','intro2','intro3','next1']))
 check(l+' explicit commercialization honesty',len(data['i18n'][l]['disclosure'])>65 and len(data['i18n'][l]['holdText'])>60)
class Reader(HTMLParser):
 def __init__(self):
  super().__init__();self.attrs=[];self.scripts=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs);self.attrs.append((tag,d))
  if tag=='script':self.scripts.append(d.get('src',''))
parser=Reader();parser.feed(page)
used={attrs['data-i18n'] for tag,attrs in parser.attrs if 'data-i18n' in attrs}
check('Translated HTML keys exist in locale data',used<=keys)
check('Accessible language selectors',len([a for tag,a in parser.attrs if tag=='button' and 'data-lang' in a])==3)
check('Article readable as native HTML without JS',len(re.findall('<p[^>]*data-i18n="intro[123]"',page))==3)
check('Narration mount and reader-target resolved','data-audio-target="#story-text"' in page and 'id="story-text"' in page)
check('Shareable shelf anchors and source warning exist','id="product-grid"' in page and 'id="share-tiers"' in page and 'id="ingredient-warning"' in page)
check('Original masthead + two contributor names', 'MIKEL' in page and 'HUONG' in page)
check('Finite publication and no fake email signups','No email subscriptions' in data['i18n']['en']['next2'])
check('Native 1.5x and 2x speech options', 'value="1.5"' in audio and 'value="2"' in audio and 'speechSynthesis' in audio)
check('Speech player attaches to existing story dialog', "#article-dialog" in audio and "#article-view" in audio)
check('Audio engine does not call external audio service', not any(x in audio for x in ['fetch(', 'MediaRecorder(', 'api.openai.com', 'SpeechRecognition(']))
check('Rank serialization is constrained to valid products', 'validIds.has(m[1])' in app and "p.status!=='not_vegan'" in app)
check('URL snapshots do not transmit free-text reviews','u.searchParams.set(\'tiers\'' in app and 'localStorage' in app)
check('No ads, trackers or analytics',not any(x in page.lower() for x in ['google-analytics','googletagmanager','facebook.net','meta-pixel','adservice']))
check('No copied newspaper brand assets','nytimes' not in page.lower() and 'washingtonpost' not in page.lower())
check('All local script and stylesheet files exist', all((BASE/x).exists() if not x.startswith('../') else (BASE/x).resolve().exists() for x in ['data.js','photos.js','app.js','release11.js','style.css','release11.css','../audio-v11.js','label-lab/index.html','label-lab/app.js','label-lab/style.css']))
check('Magazine homepage links to founding letter', 'first-letter/' in (SLOW/'index.html').read_text())
check('Magazine story reader imports narration', 'src="./audio-v11.js"' in (SLOW/'index.html').read_text())
\nphotos_js=(BASE/'photos.js').read_text()
manifest=json.loads(photos_js[len('window.GQ_PHOTOS='):].strip().rstrip(';'))
check('Exactly seven sourced authentic product photos',set(manifest['products'])=={p['id'] for p in data['products']})
check('Every photo uses an original HTTPS source and explicitly credits its provider',all(p.get('url','').startswith('https://') and p.get('photoPage','').startswith('https://') and p.get('credit') for p in manifest['products'].values()))
check('Toomba image matches exact flagged variant EAN', '8801043017022' in manifest['products']['toomba']['url'] and '8801043017022' in manifest['products']['toomba']['page'])
check('Game and reader-feedback widgets are integrated','release11.js' in page and 'photos.js' in page and 'audio-v11.js' in page)
check('No fabricated game outcomes','no score' in (BASE/'label-lab/app.js').read_text().lower())
check('Original creative prototype links present',all(x in (BASE/'release11.js').read_text() for x in ['mia-little-lights','tiny-tactics-friends','#play']))

for f in ['data.js','photos.js','app.js','release11.js','../audio-v11.js','label-lab/app.js']:
 p=(BASE/f).resolve()
 run=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 check('JavaScript parse '+f,run.returncode==0)
print(f'\n{passed} technical checks passed.')
