/* GOOD THINGS — verified barcode-linked community catalogue expansion.
   Open Food Facts data is licensed ODbL. A crowdsourced vegan tag, photo or retailer
   does NOT certify the recipe or guarantee availability. Existing product IDs remain stable. */
(function(){
'use strict';
const original=Array.isArray(window.GT_CATALOG)?window.GT_CATALOG:[];
const batches=[window.GT_EXTRA_BATCH1,window.GT_EXTRA_BATCH2,window.GT_EXTRA_BATCH3].filter(Array.isArray);
const bad=/multivitamin|vitaminkomplex|tabletten|kapsel|supplement|magnesium|nahrungsergänzung|gesichtscreme|shampoo|duschgel|vitamin\s*(b|c|d|k)(\b|\d)|vitaminspray|hundefutter|katzenfutter|katzenstreu|zahnpasta|seife|mückenspray|bier\b|wein\b|spirituosen|whisky|vodka|baby\s*nahrung/i;
const exactURL=p=>{try{const u=new URL(p.image_url);return u.protocol==='https:'&&u.hostname==='images.openfoodfacts.org'}catch(_){return false}};
const seenId=new Set(original.map(p=>p.id));
const seenBarcode=new Set(original.map(p=>p.barcode).filter(Boolean));
let accepted=0;
for(const p of batches.flat()){
 if(!p||!p.id?.startsWith('off-')||!/^\d{8,14}$/.test(p.barcode||'')||p.id!=='off-'+p.barcode||seenId.has(p.id)||seenBarcode.has(p.barcode)||!exactURL(p)||!p.name||!p.brand||bad.test(p.name))continue;
 if(p.vegan_status!=='source_checked'||p.source_type!=='openfoodfacts'||p.nutrition?.kcal==null&&p.nutrition?.protein==null)continue;
 p.verified=false; p.image_status='barcode';
 p.source_url='https://world.openfoodfacts.org/product/'+p.barcode;
 p.image_source_url=p.source_url;
 p.nutrition_source_url=p.source_url;
 p.store=String(p.store||'').toUpperCase();
 original.push(p);accepted++;seenId.add(p.id);seenBarcode.add(p.barcode);
}
const newCategories=[
 {id:'pantry',label:'Vorrat & Basics',emoji:'🫘',tone:'mint'},
 {id:'breakfast',label:'Frühstück & Müsli',emoji:'🥣',tone:'oat'},
 {id:'nuts',label:'Nüsse & Kerne',emoji:'🥜',tone:'peach'},
 {id:'sweet',label:'Süsses & Kekse',emoji:'🍪',tone:'rose'},
 {id:'sauces',label:'Saucen & Gewürze',emoji:'🍅',tone:'peach'},
 {id:'pasta',label:'Pasta & Reis',emoji:'🍝',tone:'oat'},
 {id:'drinks',label:'Getränke',emoji:'🧃',tone:'mint'},
 {id:'frozen',label:'Fertiggerichte',emoji:'🍛',tone:'rose'}
];
const groups=Array.isArray(window.GT_GROUPS)?window.GT_GROUPS:[];
for(const g of newCategories)if(original.some(p=>p.category_id===g.id)&&!groups.some(x=>x.id===g.id))groups.push(g);
for(const g of groups)g.count=original.filter(p=>p.category_id===g.id&&p.vegan_status!=='non_vegan').length;
window.GT_CATALOG=original;
window.GT_GROUPS=groups;
window.GT_EXPANSION_META={accepted,totalRankable:original.filter(p=>p.vegan_status!=='non_vegan').length,source:'Open Food Facts',license:'ODbL',disclaimer:'Community-contributed ingredients, nutrition and store reports. Check the pack and local shelf.'};
})();