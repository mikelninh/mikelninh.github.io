#!/usr/bin/env python3
"""GOOD THINGS photo atlas: deterministic safety and catalogue checks.
This validates records and web UI wiring, not real-world labels, product
availability, image redistribution rights or a human-approved taste test.
"""
from pathlib import Path
import json, re, subprocess, collections
root=Path(__file__).resolve().parent
raw=(root/'catalog.js').read_text()
assert raw.startswith('window.GQ_TIER_CATALOG=') and raw.rstrip().endswith(';')
data=json.loads(raw.split('=',1)[1].strip().rstrip(';'))
items=data['items']
assert len(items)>=51, len(items)
rated=[p for p in items if p['cat']!='watch']
assert len(rated)>=50, len(rated)
assert len(items)==len({x['id'] for x in items}),"Duplicate ids"
for p in items:
 assert all(isinstance(p[k],str) and p[k] for k in ['id','name','brand','img','source','cat','store','region'])
 assert p['img'].startswith('https://') and p['source'].startswith('https://')
 assert not any(k in p['source'].lower() for k in ['refid=','aff_id=','affiliate_id='])
 assert p['review']=='unrated' or p['cat']=='watch'
 assert p['vegan']!='verified', "Unreviewed product must not be branded verified vegan"
assert len([p for p in items if p['cat']=='watch'])==1
assert items[-1]['vegan']=='animal-ingredients'
counts=collections.Counter(p['cat'] for p in rated)
assert len(counts)>=8 and all(n>=3 for n in counts.values()),counts
assert any('Lidl' in p['store'] for p in rated)
assert any('REWE' in p['store'] for p in rated)
assert any('dm' in p['store'] for p in rated)
html=(root/'index.html').read_text()
assert 'catalog.js' in html and 'app.js' in html
assert 'data-lang="de"' in html and 'data-lang="en"' in html and 'data-lang="vi"' in html
assert 'id="search"' in html and 'id="store"' in html and 'id="products-grid"' in html
assert 'id="warning-product"' in html and 'id="mikel-ranking"' in html and 'id="huong-ranking"' in html
assert 'id="copy-list"' in html and 'id="share-list"' in html
for path in ['app.js','catalog.js']:
 p=subprocess.run(['node','--check',str(root/path)],capture_output=True,text=True)
 assert p.returncode==0,p.stderr
for index in [root.parent/'index.html',root.parent.parent/'index.html',root.parents[3]/'vegan'/'index.html']:
 assert index.is_file(),index
assert 'staples-atlas/' in (root.parent/'index.html').read_text()
assert 'staples-atlas/' in (root.parent.parent/'index.html').read_text()
assert 'staples-atlas/' in (root.parents[3]/'vegan'/'index.html').read_text()
print(json.dumps({'tests':'PASS','products':len(items),'rateable':len(rated),'categories':dict(counts),'image_urls':len([x for x in items if x['img'].startswith('https://')]),'limits':'Image availability/rights and regional vegan labels need external/manual verification.'},ensure_ascii=False,indent=2))
