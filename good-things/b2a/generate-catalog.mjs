#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'..');
const files=['catalog.js','catalog-extra-1.js','catalog-extra-2.js','catalog-extra-3.js','catalog-penny.js','catalog-vemondo.js'];
const seen=new Set(),products=[],sources={};
for(const file of files){
 const raw=readFileSync(resolve(root,file),'utf8'),start=raw.indexOf('[',raw.indexOf('window.GT_')),end=raw.indexOf('];',start);
 if(start<0||end<0)throw Error('No catalogue array: '+file);
 const entries=JSON.parse(raw.slice(start,end+1));let count=0;
 for(const p of entries){
  if(!p?.id||p.vegan_status==='non_vegan'||p.excluded===true||seen.has(p.id))continue;
  seen.add(p.id);count++;
  const nutrition={};
  for(const k of ['kcal','protein','carbs','sugar','fat','fiber','salt'])
   if(Number.isFinite(p.nutrition?.[k])&&p.nutrition[k]>=0)nutrition[k]=p.nutrition[k];
  products.push({
   id:p.id,name:p.name||null,brand:p.brand||null,store_reported:p.store||null,
   category:p.category||p.category_id||null,barcode:p.barcode||null,
   vegan_source_status:p.vegan_status||'not_independently_verified',
   nutrition_per_100g_or_ml:Object.keys(nutrition).length?nutrition:null,
   nutrition_unit:p.nutrition_basis||'check_source_label',
   source_url:p.source_url?.startsWith('https://')?p.source_url:null,
   image_provenance:p.image_status||'unknown',
   price_eur:null,live_stock:null,merchant_confirmed:false,source_dataset:file
  });
 }
 sources[file]=count;
}
const out={
 schema_version:'0.1.0',project:'GOOD THINGS',
 generated_from:'mikelninh/mikelninh.github.io/good-things catalog source',
 snapshot_date:new Date().toISOString().slice(0,10),
 snapshot_scope:'Pilot snapshot from six catalogue source arrays; excludes separately generated additions and final nutrition override scripts.',
 disclaimer:'Community/retailer product hints, not independent vegan certification; not current store inventory or pricing. Confirm packaging, allergens and stock with retailer.',
 price_policy:'null=unknown; never infer a €35 total',
 availability_policy:'null=unknown; do not promise pickup or in-store availability',
 nutrition_policy:'Reported label values per 100 g or ml only where source contains them. Check units and exact variant before aggregating.',
 source_attribution:'Open Food Facts ODbL for source_dataset catalog-extra-* and Vemondo, original retailer/manufacturer pages for other records',
 sources,products
};
writeFileSync(resolve(here,'catalog.json'),JSON.stringify(out,null,2)+'\n');
console.log('Wrote '+products.length+' source-derived records without invented stock or prices.');
