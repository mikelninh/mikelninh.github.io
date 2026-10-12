#!/usr/bin/env python3
"""Static editorial lint; never confuses link presence with scientific validation."""
from pathlib import Path
import json,sys
ROOT=Path(__file__).resolve().parent.parent
issues=[]
def test(condition,message):
    if not condition:issues.append(message)
content=json.loads((ROOT/'slow/content.json').read_text())
backlog=json.loads((ROOT/'newsroom/BACKLOG.json').read_text())
test(set(content['sources'][0].keys())>= {'id','url','limit'},'Source records missing keys')
test(len(set(s['id'] for s in content['sources']))==len(content['sources']),'Duplicate source ids')
test(len(set(s['id'] for s in content['stories']))==len(content['stories']),'Duplicate story ids')
test(len(set(s['id'] for s in backlog['items']))==len(backlog['items']),'Duplicate backlog ids')
test(all(s['sources'] is not None and all(id in {x['id'] for x in content['sources']} for id in s['sources']) for s in content['stories']),'Story with missing source id')
test(all(p['source'] in {x['id'] for x in content['sources']} for p in content['products']),'Product missing source id')
test(all(all(l in s['title'] and l in s['deck'] for l in ['de','en','vi']) for s in content['stories']),'Incomplete trilingual story')
test(all(all(l in p['name'] and l in p['explanation'] for l in ['de','en','vi']) for p in content['pillars']),'Incomplete trilingual topic')
test(content['newsletter']['pages']==4 and content['newsletter']['cadence_days']==14,'Newsletter deviates from 4-page/14-day contract')
test(content['newsletter']['language']=='en','Newsletter not English-first')
test(all('://' in s['url'] for s in content['sources']),'Source without absolute link')
test(all(b['status'] in backlog['status_legend'] and b['priority'] in [1,2,3] for b in backlog['items']),'Invalid status or priority')
test(any(p['id']=='toomba' and p['label']=='unverified' for p in content['products']),'Toomba must remain unverified until SKU proof exists')
test(not any(p.get('affiliate_url') for p in content['products']),'Affiliate links active without contracts/disclosures')
if issues:
    print('EDITORIAL LINT FAIL:\n- '+'\n- '.join(issues));sys.exit(1)
print('EDITORIAL LINT PASS — 14 schema/ethics checks (not an expert source review).')
