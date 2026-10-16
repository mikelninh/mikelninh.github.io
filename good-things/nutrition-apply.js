/* GOOD THINGS 2.8 · Bind independently sourced macro data to the exact EAN and catalogue record.
 * Missing ≠ zero. Community nutrition per 100 g / 100 ml is not medical advice.
 */
(function(){
'use strict';
const catalog=Array.isArray(window.GT_CATALOG)?window.GT_CATALOG:[];
const additions=Array.isArray(window.GT_VALUE_EXTRA_PRODUCTS)?window.GT_VALUE_EXTRA_PRODUCTS:[];
const existingIds=new Set(catalog.map(p=>p.id)),existingBarcodes=new Set(catalog.map(p=>String(p.barcode||'')).filter(Boolean));
for(const p of additions){
 if(!p?.id||!p?.barcode||existingIds.has(p.id)||existingBarcodes.has(String(p.barcode)))continue;
 existingIds.add(p.id);existingBarcodes.add(String(p.barcode));catalog.push(p);
 const group=(window.GT_GROUPS||[]).find(g=>g.id===p.category_id);
 if(group)group.count=(group.count||0)+1;
}
const supplement=Array.isArray(window.GT_NUTRITION_OVERRIDES)?window.GT_NUTRITION_OVERRIDES:[];
const byId=new Map(catalog.map(p=>[p.id,p]));
const keys=['kcal','protein','carbs','sugar','fat','satFat','fiber','salt'];
const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=10000;
let count=0,guarded=0;
for(const row of supplement){
 const p=byId.get(row.id);
 if(!p||!p.barcode||String(p.barcode)!==String(row.barcode)){guarded++;continue}
 const facts={...(p.nutrition||{})};
 let changed=false;
 for(const key of keys){
  const n=row.nutrition?.[key];
  if(valid(n)&&!valid(facts[key])){facts[key]=Math.round(n*100)/100;changed=true}
 }
 if(!changed)continue;
 p.nutrition=facts;
 p.nutrition_source_url=p.nutrition_source_url||row.nutrition_source_url;
 p.nutrition_checked_at='2026-10-16';
 p.nutrition_match_method='exact_ean_open_food_facts';
 count++;
}
window.GT_NUTRITION_META={linked:count,skipped_identity_mismatch:guarded,source:'Open Food Facts per-EAN nutriments',date:'2026-10-16'};
})();