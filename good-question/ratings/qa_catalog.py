#!/usr/bin/env python3
"""GOOD THINGS editor/source QA. Verifies metadata and honesty, not label truth."""
from pathlib import Path
import json,subprocess
R=Path(__file__).resolve().parent
d=json.loads((R/'products.json').read_text())
ps=d['products'];ids=[p['id'] for p in ps]
tests=[]
def check(name,ok):
 tests.append((name,bool(ok)))
 print(('PASS ' if ok else 'FAIL ')+name)
check('120+ products',len(ps)>=120)
check('No duplicate product IDs',len(ids)==len(set(ids)))
check('At least 100 genuine source-linked image URLs',sum(bool(p['image']['url']) for p in ps)>=100)
check('Every product has its own name and brand',all(p['name'] and p['brand'] and p['category'] for p in ps))
check('Every product has a cited source URL',all(p['source']['url'].startswith('https://') for p in ps))
check('Images use exact SKU original CDN or documented manufacturer source',all((not p['image']['url'] or p['image']['url'].startswith('https://')) for p in ps))
check('Image credit & source link attached for each mapped image',all(not p['image']['url'] or (p['image']['credit'] and p['image']['source_url']) for p in ps))
check('No invented prices, affiliate URLs or ratings',all(p['price_eur'] is None and p['affiliate_url'] is None and 'rating' not in p for p in ps))
check('Nutrition fields present on all records',all('protein_g' in p['nutrition'] and 'sugars_g' in p['nutrition'] for p in ps))
check('Sugar and protein are nullable (unknown is never zero)',sum(p['nutrition']['protein_g'] is None for p in ps)>30)
check('Nutrition source for every non-null protein/sugar',all((p['nutrition']['protein_g'] is None and p['nutrition']['sugars_g'] is None) or (p['nutrition']['source_url'] and p['nutrition']['checked']) for p in ps))
check('Reference values restricted to plausible label ranges',all((p['nutrition']['protein_g'] is None or 0<=p['nutrition']['protein_g']<=100) and (p['nutrition']['sugars_g'] is None or 0<=p['nutrition']['sugars_g']<=100) for p in ps))
check('Origin separated into production, ingredient origin, legal address',all(set(['made_in','ingredients_origin','legal_company','legal_address'])<=set(p['production']) for p in ps))
check('No manufactured location inferred from a legal address',all(not p['production']['made_in'] for p in ps if p['production'].get('legal_address')))
check('Verified smoked tofu has protein and sugar',next(p for p in ps if p['sku']=='8583362')['nutrition']['protein_g']==15 and next(p for p in ps if p['sku']=='8583362')['nutrition']['sugars_g']==0.5)
check('Verified tempeh fibre and origin label retained',next(p for p in ps if p['sku']=='7310953')['nutrition']['fibre_g']==7.2 and 'Italian' in next(p for p in ps if p['sku']=='7310953')['production']['ingredients_origin'])
check('Alpro soy ingredient nutrition is in 100ml',next(p for p in ps if p['id']=='alpro-soya-original')['nutrition']['per']=='100ml')
check('Lidl Vemondo scout does not pretend to be exact SKU',all(p['sku'] is None and p['nutrition']['protein_g'] is None for p in ps if p['brand']=='Vemondo'))
check('Chocolate, chips, tofu, spreads, cold cuts, milks and cheese represented',all(any(word.lower() in p['category'].lower() for p in ps) for word in ['chocolate','chips','tofu','spreads','cold cuts','milk','cheese']))
check('No actual published Mikel or Huong ratings',all('mikel' not in p and 'huong' not in p for p in ps))
for file in ['app.js']:
 process=subprocess.run(['node','--check',str(R/file)],capture_output=True,text=True)
 check(file+' parses',process.returncode==0)
page=(R/'index.html').read_text()
check('Public downloadable JSON linked', 'href="./products.json"' in page)
check('User consent before import, not automatic cloud sync', 'id="import-snapshot"' in page and 'no' in d['scoring_policy'].lower()+' no')
check('Mobile responsive CSS', '@media(max-width:730px)' in (R/'style.css').read_text())
report={'total':len(tests),'passed':sum(ok for _,ok in tests),'failed':[n for n,ok in tests if not ok],'catalog_count':len(ps),'image_urls':sum(bool(p['image']['url']) for p in ps),'nutrition_verified':sum(p['nutrition']['protein_g'] is not None for p in ps),'disclosure':'Technical metadata checks only; actual pack accuracy requires human review, images may be blocked, no identity verification.'}
(R/'qa_catalog_results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
raise SystemExit(bool(report['failed']))
