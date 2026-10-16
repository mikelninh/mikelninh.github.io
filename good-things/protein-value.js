/* GOOD THINGS 2.8 · Honest protein-per-euro calculator.
 * Price and nutriment evidence must match exact GTIN and pack. No invented zeros.
 * All calculations use food AS SOLD (dry vs wet not nutritionally interchangeable).
 */
(function(){
'use strict';
const STORE='goodthings_personal_protein_prices_v28',CACHE='goodthings_open_prices_cache_v28',TODAY=new Date().toISOString().slice(0,10);
const fmt=(x,d=1)=>Number.isFinite(x)?new Intl.NumberFormat('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d}).format(x):'–';
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tiers={S:6,A:5,B:4,C:3,D:2,F:1};
const daysAgo=date=>{const t=Date.parse(String(date||'')+'T12:00:00Z');return Number.isFinite(t)?(Date.parse(TODAY+'T12:00:00Z')-t)/86400000:Infinity};
const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:''}catch(_){return ''}};
function quantity(q){
 const s=String(q||'').toLowerCase().replaceAll('×','x').replace(/,/g,'.').replace(/\b(i)\b/g,'l');
 // Main stated net quantity takes precedence over breakdowns in parentheses.
 const main=s.split('(')[0].trim();
 let m=main.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|g|ml|l|liter|litre)\b/);
 if(m){const unit=m[3];return {amount:+m[1]*+m[2]*(['kg','l','liter','litre'].includes(unit)?1000:1),basis:['l','liter','litre','ml'].includes(unit)?'ml':'g'}}
 m=main.match(/(\d+(?:\.\d+)?)\s*(kg|g|gram|ml|l|liter|litre)\b/);
 if(!m)return null;
 const unit=m[2];
 const amount=+m[1]*(['kg','l','liter','litre'].includes(unit)?1000:1);
 return Number.isFinite(amount)&&amount>0&&amount<=150000?{amount,basis:['l','liter','litre','ml'].includes(unit)?'ml':'g'}:null;
}
function nutrition(p){const n=p?.nutrition||{};return Number.isFinite(n.protein)&&n.protein>=0&&n.protein<=100? n:null}
function amountProtein(p){const n=nutrition(p),qty=quantity(p?.quantity);return n&&qty?n.protein*qty.amount/100:null}
function value(p,price){
 const total=amountProtein(p);
 if(!total||!Number.isFinite(price)||price<=0)return null;
 return {totalProtein:total,euroPer100:price*100/total,proteinPerEuro:total/price,euroFor25:price*25/total,kcalFor25:Number.isFinite(p.nutrition?.kcal)?p.nutrition.kcal/nutrition(p).protein*25:null};
}
const sources=[...(window.GT_RETAIL_PRICE_SNAPSHOTS||[]),...(window.GT_PRICE_OBSERVATIONS||[])];
const goodSource=p=>p&&/^\d{8,14}$/.test(String(p.barcode||''))&&typeof p.price==='number'&&Number.isFinite(p.price)&&p.price>0&&p.price<5000&&p.date<=TODAY&&p.date>='2020-01-01'&&safeUrl(p.source);
const verifiedByBarcode=new Map();
for(const p of sources.filter(goodSource)){
 const old=verifiedByBarcode.get(String(p.barcode));
 if(!old||p.date>old.date||p.date===old.date&&p.source_type==='official_online')verifiedByBarcode.set(String(p.barcode),p);
}
const cacheRead=()=>{try{const x=JSON.parse(localStorage.getItem(CACHE)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}};
let seen=cacheRead(),checking=false;
const personalRead=()=>{try{const x=JSON.parse(localStorage.getItem(STORE)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}};
let personal=personalRead();
let ctx=null,state={sort:'euro100',category:'all',min:10,showOld:false,limit:20,pendingLimit:12,search:''};
function latest(p){
 if(!p?.barcode)return null;
 const list=[verifiedByBarcode.get(String(p.barcode)),seen[String(p.barcode)]?.price].filter(goodSource);
 const sorted=list.sort((a,b)=>b.date.localeCompare(a.date)||Number(a.source_type==='official_online')-Number(b.source_type==='official_online'));
 return sorted[0]||null;
}
function own(id){return personal[id]||null}
function reviewed(p){
 const tier=(ctx?.ratings||[]).find(r=>r.product_id===p.id);
 return tier&&tier.status!=='not_tried'?tiers[tier.tier]||0:0;
}
function eligible(p){
 if(!p||p.vegan_status==='non_vegan')return false;
 const n=nutrition(p);
 if(!n||n.protein<state.min||!quantity(p.quantity))return false;
 if(state.category!=='all'&&p.category_id!==state.category)return false;
 if(state.search&&!String(p.brand+' '+p.name+' '+p.store).toLowerCase().includes(state.search.toLowerCase()))return false;
 return true;
}
function sourceList(){
 if(!ctx)return[];
 const rows=ctx.products.filter(eligible).map(p=>{
  const fact=latest(p),worth=fact&&value(p,fact.price);
  return {p,fact,worth,tier:reviewed(p)};
 });
 return rows;
}
function sorted(list){
 const sort=state.sort;
 return list.slice().sort((a,b)=>{
  if(sort==='protein')return b.p.nutrition.protein-a.p.nutrition.protein||a.p.name.localeCompare(b.p.name,'de');
  if(sort==='calories')return (a.worth?.kcalFor25??Infinity)-(b.worth?.kcalFor25??Infinity)||a.p.name.localeCompare(b.p.name,'de');
  if(sort==='taste')return b.tier-a.tier||(a.worth?.euroPer100??Infinity)-(b.worth?.euroPer100??Infinity);
  return (a.worth?.euroPer100??Infinity)-(b.worth?.euroPer100??Infinity)||b.tier-a.tier;
 });
}
function picture(p){
 const image=safeUrl(p.image_url);
 if(!image||!['retailer','brand','barcode'].includes(p.image_status))return '<span class="gt-value-fallback">'+esc(p.emoji||'🌱')+'</span>';
 return '<img src="'+esc(image)+'" alt="'+esc(p.brand+' '+p.name)+'" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="gt-value-fallback" hidden>'+esc(p.emoji||'🌱')+'</span>';
}
function row(x,index,local=false){
 const p=x.p,priced=local?own(p.id):x.fact,w=local?priced&&value(p,priced.price):x.worth;
 const grade=x.tier?" · Your grade "+Object.entries(tiers).find(v=>v[1]===x.tier)?.[0]:'';
 const link=safeUrl(priced?.source),priceDate=priced?.date;
 const origin=local?'Dein eingetragener Preis · nicht extern bestätigt':(priced?.source_type==='official_online'?'Offizieller Online-Listenpreis':'Open Prices · belegte Ladenbeobachtung')+(priced&&daysAgo(priced.date)>365?' · VERALTET (älter als 12 Monate)':'');
 return '<article class="gt-value-item"><span class="gt-value-rank">'+(index+1)+'</span><div class="gt-value-art">'+picture(p)+'</div><div class="gt-value-product"><span class="gt-value-category">'+esc(p.brand)+' · '+esc(p.category||'')+'</span><strong>'+esc(p.name)+'</strong><small>'+esc(p.quantity||'')+' · '+fmt(p.nutrition.protein)+' g Protein / 100 '+(quantity(p.quantity)?.basis||'g')+grade+'</small>'+
 '<div class="gt-value-row-foot">'+(priced?'<span>'+esc(origin)+' · '+esc(priceDate)+'</span>':'<span>Preis noch nicht belegt</span>')+(link?' · <a href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">Quelle ↗</a>':'')+'</div></div>'+
 '<div class="gt-value-numbers"><strong>'+(w?fmt(w.euroPer100,2)+' €':'–')+'</strong><small>pro 100 g Protein</small><span>'+(w?fmt(w.proteinPerEuro)+' g Protein / €':'Kein Preisnachweis')+'</span><small>'+(w?fmt(w.euroFor25,2)+' € / 25 g Protein':'')+'</small></div>'+
 '<button class="gt-value-price-btn" data-action="protein-price-edit" data-id="'+esc(p.id)+'" title="Eigenen aktuellen Preis als privaten Vergleich eintragen">✎ Preis</button></article>';
}
function resultHtml(){
 const rows=sourceList(),valid=rows.filter(x=>x.worth&&(state.showOld||daysAgo(x.fact?.date)<=365)),local=rows.filter(x=>own(x.p.id)&&value(x.p,own(x.p.id).price)),pending=rows.filter(x=>!valid.some(y=>y.p.id===x.p.id)).sort((a,b)=>b.p.nutrition.protein-a.p.nutrition.protein);
 const rowsValid=sorted(valid).slice(0,state.limit),self=sorted(local).slice(0,10);
 const rest=pending.slice(0,state.pendingLimit);
 const coverage=rows.filter(x=>x.worth).length;
 return '<div class="gt-value-count"><strong>'+valid.length+'</strong> belegte Vergleiche ('+coverage+' mit irgendeinem datierten Preis) · '+pending.length+' weitere Kandidaten ohne aktuellen Preis</div>'+
 '<div class="gt-value-list">'+(rowsValid.length?rowsValid.map((x,i)=>row(x,i)).join(''):'<div class="gt-value-empty">Noch keine datierten, höchstens 12 Monate alten Preisbelege für diesen Filter. Proteinwerte bleiben trotzdem vergleichbar. Schalte bei Bedarf historische Preise dazu oder erfasse deinen eigenen Einkaufsbeleg.</div>')+'</div>'+
 (valid.length>state.limit?'<button class="button button-ghost" data-action="protein-more">Mehr Preisvergleiche ↓</button>':'')+
 (self.length?'<section class="gt-value-personal"><h3>✳ Mein privater Preisvergleich</h3><p>Diese Preise hast du selbst erfasst. Sie sind keine unabhängige Preisstatistik.</p>'+self.map((x,i)=>row(x,i,true)).join('')+'</section>':'')+
 '<section class="gt-value-pending"><div class="gt-value-pending-header"><div><h3>Proteinreich – Preis noch offen.</h3><p>Diese Produkte haben einen belastbaren Proteinwert und eine Packungsgröße, aber keinen aktuell belegten Kaufpreis.</p></div><button data-action="protein-check-prices" class="button button-lime button-small" '+(checking?'disabled':'')+'>'+(checking?'Preisquellen werden geprüft …':'🔎 Weitere Preisbelege suchen')+'</button></div>'+
 '<div class="gt-value-missing">'+rest.map(x=>'<div><span>'+esc(x.p.brand)+' · '+esc(x.p.name)+'</span><strong>'+fmt(x.p.nutrition.protein)+' g/100 g/ml</strong><button data-action="protein-price-edit" data-id="'+esc(x.p.id)+'">Eigenen Preis eintragen ↗</button></div>').join('')+'</div>'+
 (state.pendingLimit<pending.length?'<button class="gt-value-more-candidates" data-action="protein-more-candidates">Weitere '+Math.min(20,pending.length-state.pendingLimit)+' Proteinquellen anzeigen ↓</button>':'')+
 (rows.length?'<small>'+rows.length+' Proteinprodukte in diesem Filter. Ranking-Plätze ohne belegten Preis werden bewusst nicht erfunden.</small>':'<p>Keine passende Proteinquelle gefunden. Versuche einen niedrigeren Proteingrenzwert.</p>')+'</section>';
}
function render(context){
 ctx=context;
 const cats=[...new Set(context.products.filter(p=>nutrition(p)&&quantity(p.quantity)).map(p=>p.category_id))];
 const all=context.products.filter(p=>p.vegan_status!=='non_vegan'),complete=all.filter(p=>Number.isFinite(p.nutrition?.protein)).length;
 const sortedKnown=sourceList().filter(x=>x.worth&&daysAgo(x.fact.date)<=365);
 const top=sortedKnown.sort((a,b)=>a.worth.euroPer100-b.worth.euroPer100)[0];
 const example=top?'Aktuell günstigster verfügbarer Quellennachweis in dieser Liste: '+esc(top.p.brand)+' '+esc(top.p.name)+' · '+fmt(top.worth.euroPer100,2)+' € je 100 g Protein.':'Noch kein belegter aktueller Preis in diesem Filter.';
 return '<section class="gt-value-hero"><span class="gt-value-eyebrow">GOOD THINGS · THE REAL DEAL</span><h1>More protein.<br><em>Less money.</em></h1><p>Wie viel Eiweiß bekomme ich wirklich für einen Euro? Mit datierten Quellen, deinem Geschmack und einer ehrlichen Rechnung – statt Marketing-Schlagworten.</p>'+
 '<div class="gt-value-hero-stats"><span><strong>'+complete+'</strong> Produkte mit Proteinwert</span><span><strong>'+all.length+'</strong> bewertbare Produkte</span><span><strong>'+verifiedByBarcode.size+'</strong> datierte Preisquellen im ersten Datensatz</span></div></section>'+
 '<section class="gt-value-lesson"><div><span>SO RECHNEN WIR</span><h3>€ je 100 g Protein = Packungspreis ÷ Packungsprotein × 100</h3><p>Beispiel: 200 g Tofu mit 12 g Protein pro 100 g liefern 24 g Protein. Kostet die Packung 0,95 €, entspricht das <strong>3,96 € pro 100 g Protein</strong>.</p></div><div class="gt-value-mini-equation"><span>ALSO SEE</span><strong>Protein pro 1 €</strong><small>Und den Preis einer 25-g-Proteinportion</small></div></section>'+
 '<div class="gt-value-toolbar"><label>Find a source<input class="control" id="gtProteinSearch" type="search" value="'+esc(state.search)+'" placeholder="Tofu, Soja, Hack, Vemondo …"></label>'+
 '<label>Category<select class="control" id="gtProteinCategory"><option value="all">All types</option>'+cats.map(id=>'<option value="'+esc(id)+'" '+(state.category===id?'selected':'')+'>'+esc(context.products.find(p=>p.category_id===id)?.category||id)+'</option>').join('')+'</select></label>'+
 '<label>Min. Protein / 100 g<select class="control" id="gtProteinMin">'+[0,5,10,15,20,30].map(n=>'<option value="'+n+'" '+(state.min===n?'selected':'')+'>'+n+' g</option>').join('')+'</select></label>'+
 '<label>Sort by<select class="control" id="gtProteinSort">'+[['euro100','€ / 100 g Protein ↑'],['protein','Protein density ↓'],['calories','kcal per 25 g protein ↑'],['taste','My S–F opinion first']].map(([id,label])=>'<option value="'+id+'" '+(state.sort===id?'selected':'')+'>'+label+'</option>').join('')+'</select></label></div>'+
 '<label class="gt-value-old"><input type="checkbox" id="gtProteinOld" '+(state.showOld?'checked':'')+'> Historische Preise über 12 Monate anzeigen (als veraltet kennzeichnen, kein heutiges Angebot)</label>'+
 '<div class="gt-value-snapshot" id="gtValueSnapshot">'+example+'</div><div id="gtValueResults">'+resultHtml()+'</div>'+
 '<section class="gt-value-method"><h3>Warum „günstig“ nicht alles ist.</h3><p><strong>Trocken vs. essfertig:</strong> Nährwerte beziehen sich auf die jeweilige Packung im Verkaufszustand. Trockenes Sojagranulat hat durch Wasserverlust eine hohe Proteindichte; nach dem Einweichen bleibt die absolute Proteinmenge unverändert. <strong>Geschmack:</strong> Deine Tier-Wertung bleibt eine separate Dimension. <strong>Weitere Faktoren:</strong> Eiweißqualität, Ballaststoffe, Salz, Verträglichkeit, Zubereitung, Packungsgröße und aktuelle Verfügbarkeit.</p><p>Offene Produktdaten: <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer">Open Food Facts ↗</a> · datierte Preise: <a href="https://prices.openfoodfacts.org/" target="_blank" rel="noopener noreferrer">Open Prices ↗</a>. Keine bezahlten Rankings. Ladenpreise sind regional unterschiedlich. Nichts wird als kostenlos oder 0 g Protein interpretiert, wenn Angaben fehlen.</p></section>';
}
function refresh(){
 if(!ctx)return;
 const target=document.querySelector('#gtValueResults');if(target)target.innerHTML=resultHtml();
 const snap=document.querySelector('#gtValueSnapshot');if(snap){const valid=sourceList().filter(x=>x.worth&&daysAgo(x.fact.date)<=365).sort((a,b)=>a.worth.euroPer100-b.worth.euroPer100);snap.textContent=valid.length?'Günstigster beobachteter Proteinpreis im aktuellen Filter: '+valid[0].p.brand+' '+valid[0].p.name+' · '+fmt(valid[0].worth.euroPer100,2)+' € je 100 g Protein.':'Noch kein ausreichend aktueller Preisbeleg im Filter.'}
}
function select(name,value){if(name==='category')state.category=String(value||'all');if(name==='search')state.search=String(value||'').slice(0,100);if(name==='sort'&&['euro100','protein','calories','taste'].includes(value))state.sort=value;if(name==='min'&&[0,5,10,15,20,30].includes(Number(value)))state.min=Number(value);if(name==='old')state.showOld=!!value;state.limit=20;state.pendingLimit=12;refresh()}
function more(){state.limit+=20;refresh()}
function moreCandidates(){state.pendingLimit+=20;refresh()}
function editor(p){
 const old=own(p.id),date=old?.date||TODAY,price=old?.price;
 return '<button class="close" data-action="close-modal" aria-label="Close">×</button><span class="eyebrow">MY PROTEIN PRICE NOTE</span><h2>'+esc(p.brand)+' · '+esc(p.name)+'</h2>'+
 '<p>Nur ein echter Packungspreis für die hier angegebene Größe ('+esc(p.quantity||'unbekannt')+'). Keine geschätzten Preise für andere Varianten.</p>'+
 '<form id="gtProteinPriceForm"><input type="hidden" name="product_id" value="'+esc(p.id)+'">'+
 '<div class="field"><label>Preis in € für die gesamte Packung<input class="control" required name="price" inputmode="decimal" type="text" placeholder="z. B. 1,49" value="'+(Number.isFinite(price)?fmt(price,2):'')+'"></label></div>'+
 '<div class="field"><label>Händler / Belegnotiz<input class="control" required name="store" maxlength="75" placeholder="z. B. Lidl Berlin oder Kassenbon" value="'+esc(old?.store||'')+'"></label></div>'+
 '<div class="field"><label>Datum des Preises<input type="date" class="control" name="date" max="'+TODAY+'" value="'+esc(date)+'" required></label></div>'+
 '<p class="small muted">Dieser Preis wird ausschließlich lokal für deinen Vergleich gespeichert. Er wird nicht ungeprüft für andere Menschen veröffentlicht.</p>'+
 '<button type="submit" class="button button-lime">Privaten Preis speichern ↗</button></form>';
}
function save(form,products){
 const id=String(form.elements.namedItem('product_id')?.value||''),p=products.find(x=>x.id===id);
 if(!p||!nutrition(p)||!quantity(p.quantity))return false;
 const raw=String(form.elements.namedItem('price')?.value||'').trim().replace(',','.'),price=Number(raw),date=String(form.elements.namedItem('date')?.value||''),store=String(form.elements.namedItem('store')?.value||'').trim().slice(0,75);
 if(!/^\d+(?:\.\d{1,2})?$/.test(raw)||!Number.isFinite(price)||price<=0||price>999||!/^\d{4}-\d\d-\d\d$/.test(date)||date>TODAY||date<'2020-01-01'||!store)return false;
 const rec={price,date,store,source_type:'self_reported'};
 personal[id]=rec;try{localStorage.setItem(STORE,JSON.stringify(personal));return true}catch(_){delete personal[id];return false}
}
async function fetchMore(){
 if(checking||!ctx||typeof fetch!=='function')return 0;
 checking=true;refresh();
 const todo=sourceList().filter(x=>x.p.barcode&&!latest(x.p)&&(!seen[String(x.p.barcode)]||daysAgo(seen[String(x.p.barcode)].checked_at)>7)).slice(0,12);
 let got=0;
 async function one(x){
  const code=String(x.p.barcode);
  try{
   const control=typeof AbortController!=='undefined'?new AbortController():null;
   const timer=control?setTimeout(()=>control.abort(),5500):null;
   let response;try{response=await fetch('https://prices.openfoodfacts.org/api/v1/prices?product_code='+encodeURIComponent(code)+'&size=20&order_by=-date',{headers:{Accept:'application/json'},signal:control?.signal})}finally{if(timer)clearTimeout(timer)}
   if(!response.ok)throw Error('fetch '+response.status);
   const data=await response.json(),records=(data.items||[]).filter(p=>p.type==='PRODUCT'&&p.currency==='EUR'&&Number.isFinite(p.price)&&p.price>0&&String(p.product_code)===code&&p.location?.osm_address_country_code==='DE'&&p.date<=TODAY&&/^\d{4}-\d\d-\d\d$/.test(p.date)).sort((a,b)=>b.date.localeCompare(a.date));
   const first=records[0];
   const rec=first?{barcode:code,price:first.price,date:first.date,store:String(first.location?.osm_brand||first.location?.osm_name||'Shop').slice(0,80),city:String(first.location?.osm_address_city||'Deutschland').slice(0,80),source:'https://prices.openfoodfacts.org/prices/'+first.id,source_type:'open_prices_de'}:null;
   seen[code]={checked_at:TODAY,price:rec};if(rec)got++;
  }catch(_){/* Unavailable endpoint is not evidence of no price. Retry later. */}
 }
 for(let i=0;i<todo.length;i+=4)await Promise.all(todo.slice(i,i+4).map(one));
 try{localStorage.setItem(CACHE,JSON.stringify(seen))}catch(_){}
 checking=false;refresh();return got;
}
window.GT_PROTEIN={quantity,amountProtein,value,latest,daysAgo,render,refresh,select,more,moreCandidates,editor,save,fetchMore,state};
})();