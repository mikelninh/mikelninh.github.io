
(function(){
'use strict';
const shops=[['DM','dm'],['NETTO','Netto Marken-Discount'],['REWE','REWE'],['EDEKA','EDEKA'],['KAUFLAND','Kaufland'],['PENNY','PENNY'],['GOASIA','go asia']];
const extras=[
 {id:'netto-biobio-tofu-2x200-official',store:'NETTO',brand:'BioBio',name:'Tofu Natur schnittfest',quantity:'2 × 200 g',emoji:'🍱',category:'Tofu',vegan_status:'source_checked',source_url:'https://www.netto-online.de/ueber-netto/Eigenmarken-BioBio.chtm',source_note:'Offiziell als 100 % vegan gelistet; EAN, Eiweiß und Ladenpreis noch offen'},
 {id:'netto-biobio-soja-1l-official',store:'NETTO',brand:'BioBio',name:'Sojagetränk Naturell',quantity:'1 l',emoji:'🥛',category:'Pflanzendrink',vegan_status:'source_checked',source_url:'https://www.netto-online.de/ueber-netto/Eigenmarken-BioBio.chtm',source_note:'Offiziell rein pflanzlich; EAN, Eiweiß und Ladenpreis noch offen'},
 {id:'goasia-foison-rice-cakes-official',store:'GOASIA',brand:'FOISON BRAND',name:'Reiskuchen getrocknet',quantity:'400 g',emoji:'🍚',category:'Vorrat',vegan_status:'source_checked',nutrition:{protein:7.3},source_url:'https://goasia.net/de/weiteres/14123-foison-brand-reiskuchen-getrocknet-400g-.html',source_note:'Zutaten: Reis und Wasser; Onlinepreis nicht als aktueller Ladenpreis übernommen'}
];
const products=[...(window.GT_CATALOG||[]),...extras].filter(p=>p.id&&p.vegan_status==='source_checked'&&p.vegan_status!=='non_vegan');
const byId=new Map(products.map(p=>[p.id,p]));
const snapshots=(window.GT_RETAIL_PRICE_SNAPSHOTS||[]).filter(x=>x.source_type==='official_online'&&x.price>0);
const KEY='goodthings_shops_v29', read=()=>{try{let x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}};
const data=read();data.lists=data.lists||{};data.ownPrices=data.ownPrices||{};
let shop='DM',query='',sort='name',replace=null;
const $=id=>document.getElementById(id);
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:''}catch(_){return''}};
const euros=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n);
const decimal=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(n);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch(_){say('Speichern nicht möglich. Kopiere die Liste vor dem Verlassen.')}};
function say(s){$('toast').textContent=s;$('toast').hidden=false;clearTimeout(say.timer);say.timer=setTimeout(()=>$('toast').hidden=true,3500)}
function weight(p){let s=String(p.quantity||'').replaceAll(',','.').replace('×','x');let m=s.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|g)\b/i);if(m)return +m[1]*+m[2]*(m[3]==='kg'?1000:1);m=s.match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/i);return m?+m[1]*(m[2]==='kg'?1000:1):null}
function protein(p){const n=p.nutrition?.protein,w=weight(p);return typeof n==='number'&&Number.isFinite(n)&&w?n*w/100:null}
function price(p){const own=data.ownPrices[shop+':'+p.id];if(own&&Number(own.amount)>0)return{amount:+own.amount,date:own.date,type:'Privater Preis'};if(shop!=='DM'||!p.barcode)return null;const o=snapshots.find(s=>String(s.barcode)===String(p.barcode)&&String(s.store).toLowerCase()==='dm online');return o?{amount:+o.price,date:o.date,type:'dm-Onlinepreis'}:null}
function list(){return data.lists[shop]||{}}
function rating(p){let g={};try{g=JSON.parse(localStorage.getItem('goodthings_v13_guest')||'{}')}catch(_){}const t=name=>{const r=g[name]?.[p.id];return r?.status==='not_tried'?'◌':r&&'SABCDF'.includes(r.tier)&&r.tier?.length===1?r.tier:'–'};return 'Mikel '+t('mikel')+' · Huong '+t('huong')+' · Du '+t('you')}
function image(p){return ['retailer','brand','barcode'].includes(p.image_status)&&!p.photo_blocked&&url(p.image_url)?'<img data-pack="1" loading="lazy" src="'+h(url(p.image_url))+'" alt="'+h(p.brand+' '+p.name)+'"><span class="fallback" hidden>'+h(p.emoji||'✳')+'</span>':'<span class="fallback">'+h(p.emoji||'✳')+'</span>'}
function drawShops(){$('shops').innerHTML=shops.map(([id,name])=>'<button data-shop="'+id+'" class="'+(id===shop?'selected':'')+'" aria-pressed="'+(id===shop)+'">'+h(name)+'</button>').join('');$('currentStore').textContent=shops.find(x=>x[0]===shop)[1]}
function drawProducts(){
 let rows=products.filter(p=>String(p.store||'').toUpperCase()===shop).filter(p=>(p.brand+' '+p.name+' '+p.category+' '+(p.barcode||'')).toLowerCase().includes(query.toLowerCase()));
 rows.sort((a,b)=>sort==='protein'?(protein(b)??-1)-(protein(a)??-1)||a.name.localeCompare(b.name,'de'):sort==='value'?((protein(b)&&price(b)?protein(b)/price(b).amount:-1)-(protein(a)&&price(a)?protein(a)/price(a).amount:-1))||a.name.localeCompare(b.name,'de'):a.name.localeCompare(b.name,'de'));
 $('count').textContent=rows.length+' passende Produkte · Quellenzuordnung, kein Livebestand';
 $('products').innerHTML=rows.length?rows.slice(0,140).map(p=>{
   const q=price(p),pr=protein(p),v=q&&pr?decimal(pr/q.amount)+' g Protein/€':'';
   const linked=extras.some(x=>x.id===p.id);
   return '<article class="product"><div class="picture">'+image(p)+'</div><div class="about"><div class="over">'+h(p.brand)+' · '+h(p.quantity||p.category||'')+'</div><h3>'+h(p.name)+'</h3><div class="facts">'+(Number.isFinite(p.nutrition?.protein)?'<span>💪 '+decimal(p.nutrition.protein)+' g / 100g*</span>':'<span>Protein offen</span>')+(v?'<span>'+v+'</span>':'')+'</div><p class="taste">'+h(rating(p))+'</p><div class="source">'+(p.source_type==='openfoodfacts'?'Community-Daten · ':'Produktquelle · ')+'<a href="'+h(url(p.source_url))+'" target="_blank" rel="noopener noreferrer">Beleg ↗</a>'+(p.source_note?' · '+h(p.source_note):'')+'</div></div><div class="operations"><div class="amount"><strong>'+(q?euros(q.amount):'Preis offen')+'</strong><small>'+(q?h(q.type)+' · '+h(q.date):'Kein verifizierter Filialpreis')+'</small></div><button data-price="'+h(p.id)+'" class="outline">✎ Mein Preis</button><button data-add="'+h(p.id)+'" class="green">'+(replace?'Als Ersatz wählen':'Zur Liste +')+'</button>'+(linked?'<small>Noch nicht im Tier-Board</small>':'<a href="./?view=board&product='+encodeURIComponent(p.id)+'">Tier List bewerten ↗</a>')+'</div></article>'
 }).join(''):'<div class="empty">Noch keine belegten Produktzuordnungen für diesen Filter. Keine erfundenen Preise oder Packungen. ✳</div>';
}
function drawBag(){
 const entries=Object.entries(list()).filter(([id,n])=>byId.has(id)&&String(byId.get(id).store).toUpperCase()===shop&&Number.isInteger(n)&&n>0);
 const unknown=entries.filter(([id])=>!price(byId.get(id))).length;
 const sum=entries.reduce((a,[id,n])=>a+(price(byId.get(id))?.amount||0)*n,0);
 $('bagName').textContent=shops.find(x=>x[0]===shop)[1];
 $('bagTotal').textContent=entries.length&&!unknown?euros(sum):'–';
 $('bagDescription').textContent=entries.length?unknown?unknown+' Preis(e) offen. Kein belastbarer Gesamtpreis.':(sum>20?'Über 20 € · ':'')+'Nur Online-/Privatpreise, nicht als Filialkorb bestätigt.':'Noch leer. Füge deine Lieblingsprodukte hinzu. ♡';
 $('bagItems').innerHTML=entries.map(([id,n])=>{const p=byId.get(id);return '<li><div><strong>'+h(p.name)+'</strong><small>'+n+' × '+h(p.brand)+' · '+(price(p)?euros(price(p).amount)+'/Packung':'Preis offen')+'</small></div><div class="bag-buttons"><button data-less="'+h(id)+'" aria-label="Entfernen">−</button><b>'+n+'</b><button data-more="'+h(id)+'" aria-label="Mehr">+</button><button data-swap="'+h(id)+'" aria-label="Ersetzen">↔</button></div></li>'}).join('')||'<li class="empty">Dein Einkaufszettel wartet. ✳</li>';
 $('swap').hidden=!replace;$('swap').textContent=replace?'Wähle einen Ersatz für '+byId.get(replace)?.name+' aus demselben Laden.':'';
}
function render(){drawShops();drawProducts();drawBag()}
function add(id){const p=byId.get(id);if(!p||String(p.store).toUpperCase()!==shop)return;const x={...list()};if(replace&&replace!==id&&x[replace]){delete x[replace];x[id]=(x[id]||0)+1;replace=null;say('Ausgetauscht ♡')}else{x[id]=Math.min(99,(x[id]||0)+1);replace=null;say('Auf der Einkaufsliste!')}data.lists[shop]=x;save();drawProducts();drawBag()}
function qty(id,n){const x={...list()};if(!x[id])return;x[id]=Math.min(99,x[id]+n);if(x[id]<=0)delete x[id];data.lists[shop]=x;save();drawProducts();drawBag()}
document.addEventListener('error',e=>{if(e.target?.dataset?.pack==='1'){e.target.hidden=true;if(e.target.nextElementSibling)e.target.nextElementSibling.hidden=false}},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-shop],[data-add],[data-more],[data-less],[data-swap],[data-price]');if(!b)return;if(b.dataset.shop){shop=b.dataset.shop;replace=null;render()}else if(b.dataset.add)add(b.dataset.add);else if(b.dataset.more)qty(b.dataset.more,1);else if(b.dataset.less)qty(b.dataset.less,-1);else if(b.dataset.swap){replace=b.dataset.swap;drawProducts();drawBag();say('Jetzt Ersatz im selben Markt auswählen.')}else if(b.dataset.price){const p=byId.get(b.dataset.price);if(!p)return;$('priceId').value=p.id;$('priceLabel').textContent=p.brand+' '+p.name;$('priceValue').value=data.ownPrices[shop+':'+p.id]?.amount||'';$('priceDate').value=data.ownPrices[shop+':'+p.id]?.date||new Date().toISOString().slice(0,10);$('dialog').showModal();}});
$('search').addEventListener('input',e=>{query=e.target.value;drawProducts()});
$('sort').addEventListener('change',e=>{sort=e.target.value;drawProducts()});
$('cancelSwap').addEventListener('click',()=>{replace=null;drawProducts();drawBag()});
$('clear').addEventListener('click',()=>{if(Object.keys(list()).length&&confirm('Diese Einkaufsliste wirklich leeren?')){data.lists[shop]={};save();replace=null;render()}});
$('copy').addEventListener('click',async()=>{const rows=Object.entries(list());const lines=['GOOD THINGS ✳ · '+shops.find(x=>x[0]===shop)[1],'Onlinepreise und eigene Preise sind keine Filialgarantie.','',...rows.map(([id,n])=>{const p=byId.get(id),q=p&&price(p);return p?n+' × '+p.brand+' '+p.name+' ('+(p.quantity||'Größe offen')+') — '+(q?euros(q.amount)+'/Packung · '+q.type:'Preis offen'):''})];const out=lines.join('\n');$('share').value=out;$('share').hidden=false;try{await navigator.clipboard.writeText(out);say('Einkaufsliste kopiert ♡')}catch(_){say('Liste ist zum Kopieren geöffnet.')}});
$('priceForm').addEventListener('submit',e=>{e.preventDefault();const id=$('priceId').value,p=byId.get(id),n=Number($('priceValue').value),date=$('priceDate').value;if(!p||String(p.store).toUpperCase()!==shop||!Number.isFinite(n)||n<=0||n>1000||!/^20\d\d-\d\d-\d\d$/.test(date)||date>new Date().toISOString().slice(0,10)){say('Bitte Preis und Datum prüfen.');return}data.ownPrices[shop+':'+id]={amount:Math.round(n*100)/100,date};save();$('dialog').close();drawProducts();drawBag();say('Privater Preis gespeichert, nicht unabhängig bestätigt.')});
render();
})();