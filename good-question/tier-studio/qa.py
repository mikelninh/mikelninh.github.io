#!/usr/bin/env python3
from pathlib import Path
import json, subprocess
p=Path(__file__).resolve().parent
d=json.loads((p/'products.json').read_text())
products=d['products']
assert len(products)>=100 and len({x['id'] for x in products})==len(products)
assert len({x['category'] for x in products})>=10
assert all(x['source_url'].startswith('https://') and x['mikel_rating'] is None and x['huong_rating'] is None for x in products)
assert all('image_url' in x and 'image_source_url' in x and x['image_status']=='needs_exact_packshot' for x in products)
assert all(x['store'] in ('REWE','Lidl') for x in products)
page=(p/'index.html').read_text()
for identifier in ['cards','mikel-list','huong-list','search','category','status','import','export','share-head']:
 assert f'id="{identifier}"' in page
for name in ['app.js','style.css']:
 assert (p/name).is_file()
r=subprocess.run(['node','--check',str(p/'app.js')],capture_output=True,text=True)
assert r.returncode==0,r.stderr
assert 'Open Food Facts' in page
print('PASS: 102 distinct source-listed product candidates, 10 categories, separate empty ratings, image/provenance fields, UI controls, JS syntax.')
print('NOTE: Does not certify image matches, actual tasting, exact vegan status, or browser CORS. External photo loading requires live QA.')
