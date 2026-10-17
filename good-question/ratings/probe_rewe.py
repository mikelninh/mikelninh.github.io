#!/usr/bin/env python3
import requests,re
from bs4 import BeautifulSoup
targets=[
"https://www.rewe.de/shop/c/tofu",
"https://www.rewe.de/shop/c/haferdrinks/",
"https://www.rewe.de/shop/c/vegane-joghurt-alternativen/",
"https://www.rewe.de/shop/c/chips/?attribute=vegan"
]
for url in targets:
 try:
  r=requests.get(url,timeout=17,headers={"User-Agent":"Mozilla/5.0 (compatible; GQ editorial ratings research; +https://mikelninh.github.io/good-question/)"})
  s=BeautifulSoup(r.text,"html.parser")
  links=[(a.get_text(" ",strip=True)[:70],a.get("href"),(a.find("img").get("src") if a.find("img") else None)) for a in s.find_all("a") if "/shop/p/" in (a.get("href") or "")][:8]
  print("URL",url,"STATUS",r.status_code,"LEN",len(r.content),"images",r.text.count("img.rewe-static.de"),"candidate-links",len(links),"reweIDs",r.text.count("7905813"))
  print("SAMPLES",links)
  print("SRCSET_EXAMPLE",re.findall(r'.{0,170}7905813.{0,170}',r.text)[:1])
 except Exception as e: print("ERROR",url,str(e))

print("\n--- ENRICHMENT PROBE ---")
more=[
  "https://world.openfoodfacts.org/api/v2/search?search_terms=Taifun%20R%C3%A4uchertofu&fields=code,product_name,brands,image_front_url,nutriments,origins,manufacturing_places&json=1&page_size=5",
  "https://de.openfoodfacts.org/cgi/search.pl?search_terms=Alpro%20Soja%20Natur&search_simple=1&action=process&json=1&page_size=3",
  "https://www.dm.de/p/d/1457962/dmbio-tofu-natur"
]
for url in more:
 try:
  r=requests.get(url,timeout=14,headers={'User-Agent':'GOOD-QUESTION-Magazine/1.0 (data-check; contact via public GitHub repo)'})
  print('ENRICH',url[:85],r.status_code,len(r.content),r.text[:250])
 except Exception as e: print('ENRICH ERROR',str(e)[:180])
