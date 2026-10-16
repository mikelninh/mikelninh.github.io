/* GOOD THINGS 2.6 · brand assortment extension.
 * PENNY records: individual official product pages, not live shelf availability.
 * Vemondo: barcode-linked OFF German-market vegan-labelled subset, not official full Lidl inventory.
 * Brand product IDs stable; never merge by name or flavor and never invent photos.
 */
(function(){
'use strict';
const original=Array.isArray(window.GT_CATALOG)?window.GT_CATALOG:[];
const penny=Array.isArray(window.GT_PENNY_PRODUCTS)?window.GT_PENNY_PRODUCTS:[];
const vemondo=Array.isArray(window.GT_VEMONDO_PRODUCTS)?window.GT_VEMONDO_PRODUCTS:[];
const officialBurger=[
 {id:'lidl-vemondo-burger-chicken-style-2025',name:'Burger Patty Chicken Style',category_id:'mains',emoji:'🍔'},
 {id:'lidl-vemondo-burger-fish-style-2025',name:'Burger Patty Fisch-Style',category_id:'mains',emoji:'🍔'},
 {id:'lidl-vemondo-burger-vegetable-2025',name:'Burger Patty Gemüse',category_id:'mains',emoji:'🥦'},
 {id:'lidl-vemondo-burger-spicy-bean-2025',name:'Burger Patty Spicy Bean',category_id:'mains',emoji:'🌶️'}
].map(x=>({...x,brand:'Vemondo',store:'LIDL',quantity:'',category:'Fleischalternativen',tone:'mint',
 image_url:null,image_status:'missing',image_source_url:'',source_url:'https://unternehmen.lidl.de/pressemitteilungen/2025/251015_vegane-burger',
 photo_attribution:'',vegan_status:'source_checked',brand_collection:'vemondo',verified:false,source_type:'lidl_official_press',
 availability_note:'Lidl launch 15.10.2025; current store availability unverified',listing_verified_at:'2026-10-16',
 variant_quality:'official_announced_product_name_pending_gtin_photo',
 search_terms:'burger not burger not chicken chicken-style lidl vemondo'}));
const knownId=new Set(original.map(p=>p.id)),knownEAN=new Set(original.map(p=>String(p.barcode||'')).filter(Boolean));
let acceptedPenny=0,acceptedVemondo=0,officialCount=0,duplicates=0;
for(const [collection,items] of [['penny',penny],['vemondo',vemondo],['official',officialBurger]]){
 for(const p of items){
  if(!p||!p.id||!p.name||!p.brand||knownId.has(p.id)||p.barcode&&knownEAN.has(String(p.barcode))){duplicates++;continue}
  if(collection==='vemondo'&&(!p.barcode||!/^https:\/\/images\.openfoodfacts\.org\/images\/products\//.test(p.image_url||'')||p.vegan_status!=='source_checked'))continue;
  if(collection==='penny'&&(!p.source_url?.startsWith('https://www.penny.de/sortiment/food-for-future/')||!p.image_url?.startsWith('https://cdn.penny.de/dam/')))continue;
  knownId.add(p.id);if(p.barcode)knownEAN.add(String(p.barcode));
  original.push(p);
  if(collection==='penny')acceptedPenny++;
  else if(collection==='vemondo')acceptedVemondo++;
  else officialCount++;
 }
}
const groups=Array.isArray(window.GT_GROUPS)?window.GT_GROUPS:[];
for(const g of groups)g.count=original.filter(p=>p.category_id===g.id&&p.vegan_status!=='non_vegan').length;
window.GT_CATALOG=original;
window.GT_GROUPS=groups;
window.GT_BRAND_META={updated_at:'2026-10-16',penny_official_listed:penny.length,penny_imported:acceptedPenny,vemondo_off_candidates:vemondo.length,vemondo_imported:acceptedVemondo,lidl_official_burger_count:officialCount,duplicates_skipped:duplicates,
 caveat:'A brand catalogue is not a live inventory. Open Food Facts entries are community data. Product identity, recipe, local availability and images may change.'};
})();