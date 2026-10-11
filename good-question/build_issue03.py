#!/usr/bin/env python3
"""Export inspectable JSON and multilingual RSS from canonical editorial content.
No network access. A build does not refresh or verify sources. Edit source dates
only after actually checking the original source; never infer expert approval.
"""
from pathlib import Path
import json
import xml.etree.ElementTree as ET
R=Path(__file__).resolve().parent
D=json.loads((R/'edition03-data.js').read_text().split('window.GQ3=',1)[1].rstrip(';\n'))
OLD=json.loads((R/'stories.json').read_text())
BASE='https://mikelninh.github.io/good-question/'
(R/'issue03.json').write_text(json.dumps(D,ensure_ascii=False,indent=2)+'\n')
audit={
 'version':D['version'],'edition':'03','retrieved_at':D['retrieved_at'],
 'verification':{'method':D['reviewed_by'],'independent_expert_review':False,'native_language_review':False,'formal_GRADE':False,'systematic_review':False,'raw_data_reanalysis':False,'original_field_reporting':False},
 'claims':[{'id':s['id'],'claim':s['claim']['en'],'limits':s['limit']['en'],'url':s['url'],'doi':s.get('doi'),'source_type':s['type'],'read_level':s['read_level'],'locator':s['locator']} for s in D['sources']],
 'chart':{'source':'ENV-003','population':'55,504 UK participants; study published 2023','reference':'High-meat group >=100 g meat/day = 100 for each indicator','unit':'Vegan group as percent of high-meat reference','uncertainty':'95% uncertainty intervals, not a confidence score for the article','domain':[0,100],'add_indicators':False,'data':D['metrics']},
 'retail_reference':{'region':'Germany','merchant':'dm.de','retrieved_at':D['retrieved_at'],'method':'Original retailer pages opened via web retrieval; responses may be cached. No live price API, checkout or in-store purchase.','products':[{'id':p['id'],'product':p['product'],'pack_g':p['pack_g'],'price_eur':p['price_eur'],'url':p['url']} for p in D['products']],'drained_weight':'Chickpeas: 220 g drained, not 350 g gross fill.'},
 'calculation':{'consumed_cost':'grams_per_portion * portions / pack_g * price_eur, sum over ingredients','checkout':'ceil(grams_per_portion * portions / pack_g) * price_eur, sum over unowned ingredients','pantry':'Owned ingredients reduce checkout cost, not allocated consumed cost. Amount of existing pantry stock is not tracked.','rounding':'Round final display totals only. CSV also includes unrounded quantities and costs to six decimal places.','default_ingredients_g':{'pasta':100,'lentils':75,'passata':200},'default_per_portion_eur':100/500*.85+75/500*1.45+200/690*1.05,'default_checkout_eur':3.35,'exclusions':['Extra vegetables','Oil','Seasonings','Energy','Water','Delivery'],'limits':['Recipe bases, not complete meals or nutrition plans','Not kitchen-tested','One retailer is not representative of a whole market','No meat-based comparison was priced','No payment for product inclusion or active affiliate links']},
 'corrections':'feature.html#corrections opens a prefilled public GitHub issue draft; nothing auto-submitted.',
 'photo':D['photo']}
(R/'issue03-evidence.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
for locale,filename in [('de','feed.xml'),('en','feed-en.xml'),('vi','feed-vi.xml')]:
 rss=ET.Element('rss',version='2.0');c=ET.SubElement(rss,'channel')
 for tag,text in [('title','GOOD QUESTION / '+locale.upper()),('link',BASE+'?lang='+locale),('description',D['translations'][locale]['tagline']),('language',locale),('lastBuildDate','Sun, 11 Oct 2026 21:00:00 GMT')]:ET.SubElement(c,tag).text=text
 entries=[(D['translations'][locale]['plainTitle'],BASE+'feature.html?lang='+locale,D['translations'][locale]['deck'],'03')]+[(a[locale]['title'],BASE+'read/'+a['id']+'/'+locale+'/',a[locale]['sub'],'02') for a in OLD['articles']]
 for title,url,description,edition in entries:
  item=ET.SubElement(c,'item')
  for tag,text in [('title',title),('link',url),('description',description),('category','Issue '+edition),('pubDate','Sun, 11 Oct 2026 21:00:00 GMT')]:ET.SubElement(item,tag).text=text
  ET.SubElement(item,'guid',isPermaLink='true').text=url
 ET.indent(rss);ET.ElementTree(rss).write(R/filename,encoding='utf-8',xml_declaration=True)
print('Exported content, evidence register and three feeds. No new source verification performed.')
