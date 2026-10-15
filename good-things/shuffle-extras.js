/* GOOD THINGS 2.1 — playful shuffle, factual product cards & exact-barcode photo recovery.
   No wagers, no fabricated health scores, no guessed packshots. */
(function(){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const url=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:''}catch(_){return ''}};
const fmt=v=>Number.isFinite(v)?new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(v):'–';
const meta=new Map(), pending=new Map(), pricePending=new Map(), repairPending=new Map();
const photoStorageKey='goodthings_exact_barcode_photo_repair_v21';
let spinner=false;
function getCachedPhotos(){try{return JSON.parse(localStorage.getItem(photoStorageKey)||'{}')}catch(_){return {}}}
function saveCachedPhoto(p,u){
 try{const d=getCachedPhotos();d[p.id]={barcode:p.barcode,url:u};localStorage.setItem(photoStorageKey,JSON.stringify(d))}catch(_){}
}
const savedPhotos=getCachedPhotos();
for(const p of window.GT_CATALOG||[]){
 const saved=savedPhotos[p.id];
 const communityImage=Boolean(saved?.reviewed===true&&!p.barcode&&/^\d{8,14}$/.test(saved?.barcode||''));
 if((communityImage||(p.barcode&&saved?.barcode===p.barcode))&&url(saved?.url)&&new URL(saved.url).hostname==='images.openfoodfacts.org'){
  if(communityImage)p.barcode=saved.barcode;
  p.image_url=saved.url;p.image_status='barcode';p.photo_blocked=false;
  p.image_source_url='https://world.openfoodfacts.org/product/'+p.barcode;
  p.photo_attribution='Open Food Facts · EAN';p.photo_match_method=communityImage?'locally_reviewed_exact_barcode':'barcode_recovery';
 }
}
const units=[['Energie','kcal','kcal'],['Protein','protein','g'],['Kohlenhydrate','carbs','g'],['davon Zucker','sugar','g'],['Fett','fat','g'],['davon gesättigte Fettsäuren','satFat','g'],['Ballaststoffe','fiber','g'],['Salz','salt','g']];
function factsNutrition(p,info){const fresh=info?.nutrition;return fresh&&Object.values(fresh).some(Number.isFinite)?fresh:p.nutrition||null}
function bullets(n){
 const plus=[],minus=[];
 if(!n)return {plus:['Nährwertangaben sind noch nicht verifiziert.'],minus:['Ohne Nährwerte ist keine Einordnung möglich.']};
 if(Number.isFinite(n.protein)&&n.protein>=10)plus.push(fmt(n.protein)+' g Protein / 100 g bzw. ml');
 if(Number.isFinite(n.fiber)&&n.fiber>=3)plus.push(fmt(n.fiber)+' g Ballaststoffe / 100 g bzw. ml');
 if(Number.isFinite(n.sugar)&&n.sugar<=2.5)plus.push('Wenig Zucker in den erfassten Werten ('+fmt(n.sugar)+' g)');
 if(Number.isFinite(n.sugar)&&n.sugar>=15)minus.push('Zucker: '+fmt(n.sugar)+' g / 100 g bzw. ml');
 if(Number.isFinite(n.salt)&&n.salt>=1.5)minus.push('Salz: '+fmt(n.salt)+' g / 100 g bzw. ml');
 if(Number.isFinite(n.satFat)&&n.satFat>=5)minus.push('Gesättigte Fettsäuren: '+fmt(n.satFat)+' g');
 if(Number.isFinite(n.kcal)&&n.kcal>=450)minus.push('Energiedicht: '+fmt(n.kcal)+' kcal / 100 g bzw. ml');
 if(!plus.length)plus.push('Keine eindeutige Stärke anhand der vorhandenen Kennzahlen.');
 if(!minus.length)minus.push('Keine der hier geprüften Schwellen überschritten – kein Gesundheitsurteil.');
 return {plus:plus.slice(0,3),minus:minus.slice(0,3)};
}
function scoreBadge(grade){
 const score=String(grade||'').toUpperCase();
 if(!/^[A-E]$/.test(score))return '<div class="gt-score-empty"><strong>Nutri-Score unbekannt</strong><small>Ohne belastbaren Score zeigen wir keinen geschätzten Buchstaben.</small></div>';
 return '<div class="gt-score"><div class="gt-score-scale" aria-label="Nutri-Score '+score+'">'+['A','B','C','D','E'].map((g,i)=>'<span class="gt-score-'+g.toLowerCase()+(g===score?' chosen':'')+'" aria-label="'+g+(g===score?' ausgewählt':'')+'">'+g+'</span>').join('')+'</div><small>Nutri-Score '+score+' · laut Open Food Facts, bitte aktuelle Verpackung vergleichen</small></div>';
}
function nutritionMarkup(n){
 if(!n)return '<p class="gt-missing">Noch keine zugeordnete Nährwerttabelle.</p>';
 return '<div class="gt-nutri-grid">'+units.map(([label,key,unit])=>'<div><span>'+label+'</span><strong>'+fmt(n[key])+(Number.isFinite(n[key])?' '+unit:'')+'</strong></div>').join('')+'</div>';
}
function storeMarkup(p,info){
 const s=[p.store,info?.stores].filter(Boolean).map(String);
 return '<span>'+esc(s.length?s.join(' · '):'Keine Händlerangabe')+'</span><small>Gemeldete Bezugsquellen, keine Live-Verfügbarkeitsprüfung.</small>';
}
function priceMarkup(info,p){
 const price=info?.price;
 if(price)return '<strong>'+fmt(price.value)+' €</strong><small>'+esc(price.place)+' · '+esc(price.date)+' · beobachteter Preis, kein Live-Angebot</small>';
 if(!p.barcode)return '<small>Kein belegter Preis ohne passende EAN.</small>';
 return '<small>'+(info?.priceDone?'Kein aktueller belegter EUR-Preis gefunden.':'Datierten Preisbeleg suchen …')+'</small>';
}
function facts(p){
 if(!p)return '';
 const info=meta.get(p.barcode)||{},n=factsNutrition(p,info),pm=bullets(n);
 const grade=info?.nutriscore_grade,manufacturer=info?.brand_owner||info?.manufacturer||'',ingredients=info?.ingredients||'';
 const allergens=info?.allergens||'';
 const id=esc(p.id),src=url(p.barcode?'https://world.openfoodfacts.org/product/'+p.barcode:p.source_url);
 return '<section class="gt-fact-card" data-gt-fact="'+id+'" aria-label="Produktinformationen vor der Bewertung">'+
 '<div class="gt-fact-top"><div><span class="eyebrow">BEVOR DU BEWERTEST</span><h4>Was steckt drin?</h4></div><span class="gt-fact-tag">'+esc(p.quantity||'je 100 g/ml')+'</span></div>'+
 '<div class="gt-quick-facts"><div><span>Marke</span><strong>'+esc(p.brand||'Unbekannt')+'</strong></div><div><span>Protein</span><strong>'+fmt(n?.protein)+' g</strong></div><div><span>Zucker</span><strong>'+fmt(n?.sugar)+' g</strong></div><div><span>Salz</span><strong>'+fmt(n?.salt)+' g</strong></div></div>'+
 '<div class="gt-pro-con"><div class="gt-pro"><strong>↗ Pro</strong><ul>'+pm.plus.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><div class="gt-con"><strong>↘ Contra / zu beachten</strong><ul>'+pm.minus.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div></div>'+
 '<div class="gt-score-section"><div><strong>Und der Nutri-Score?</strong><small>A–E misst Nährstoffzusammensetzung, nicht Geschmack oder Vegan-Status.</small></div>'+scoreBadge(grade)+'</div>'+
 '<details class="gt-fact-details"><summary>Mehr erfahren · Zutaten, Hersteller, Preis &amp; alle Nährwerte <span>⌄</span></summary>'+
 '<div class="gt-fact-more"><p><strong>Hersteller / Markeninhaber</strong><span>'+esc(manufacturer||'Nicht eindeutig belegt – Marke ≠ Hersteller')+'</span></p>'+
 '<p><strong>Zutaten</strong><span>'+esc(ingredients||(!p.barcode?'Keine EAN zugeordnet.':'Nicht verfügbar oder noch nicht geladen.'))+'</span></p>'+
 '<p><strong>Allergene laut Quelle</strong><span>'+esc(allergens||'Keine zuverlässige Angabe verfügbar. Verpackung prüfen – das bedeutet NICHT allergenfrei.')+'</span></p>'+
 '<div class="gt-fact-subtitle">Nährwerte je 100 g bzw. 100 ml (Quelleneinheit)</div>'+nutritionMarkup(n)+
 '<div class="gt-fact-subtitle">Preis und Bezugsquellen</div><div class="gt-source-row"><div>'+priceMarkup(info,p)+'</div><div>'+storeMarkup(p,info)+'</div></div>'+
 '<p class="gt-explain">Nutri-Score: A steht für eine eher günstige, E für eine weniger günstige Nährstoffzusammensetzung. Am sinnvollsten vergleichst du ähnliche Produkte. Zucker, Salz, gesättigte Fette und Energie werden unter anderem gegen Protein, Ballaststoffe und Anteile bestimmter pflanzlicher Zutaten abgewogen. Der Score sagt nichts über Allergene, Bioqualität oder die gesamte Ernährung aus. <a target="_blank" rel="noopener noreferrer" href="https://www.bmel.de/DE/themen/ernaehrung/lebensmittel-kennzeichnung/freiwillige-angaben-und-label/nutri-score/nutri-score_node.html">Offizielle Erklärung ↗</a></p>'+
 (src?'<a href="'+esc(src)+'" target="_blank" rel="noopener noreferrer" class="gt-fact-link">Produkt- und Datenquelle prüfen ↗</a>':'')+
 '<p class="gt-explain">Pro / Contra sind transparente Orientierungshilfen anhand einzelner Grenzwerte, kein Gesamturteil. Nährwerte und Zutaten können sich ändern; Etikett vor Kauf prüfen.</p>'+
 '</div></details></section>';
}
function repaint(p){
 document.querySelectorAll('[data-gt-fact]').forEach(el=>{
  if(el.getAttribute('data-gt-fact')!==p.id)return;
  const wasOpen=!!el.querySelector('details')?.open,html=facts(p);
  const shell=document.createElement('div');shell.innerHTML=html;
  const next=shell.firstElementChild;if(!next)return;
  if(wasOpen)next.querySelector('details').open=true;
  el.replaceWith(next);
 });
}
async function fetchJSON(u,ms){
 if(!url(u))throw Error('insecure source');
 const ctl=typeof AbortController==='function'?new AbortController():null;
 const timer=ctl?setTimeout(()=>ctl.abort(),ms):null;
 try{const response=await fetch(u,{headers:{Accept:'application/json'},signal:ctl?.signal});if(!response.ok)throw Error('source unavailable');return await response.json()}
 finally{if(timer)clearTimeout(timer)}
}
function nutritionFromApi(n){
 if(!n)return null;
 const val=k=>{const v=Number(n[k]);return Number.isFinite(v)&&v>=0&&v<10000?v:null};
 return {kcal:val('energy-kcal_100g'),protein:val('proteins_100g'),carbs:val('carbohydrates_100g'),sugar:val('sugars_100g'),fat:val('fat_100g'),satFat:val('saturated-fat_100g'),fiber:val('fiber_100g'),salt:val('salt_100g')};
}
function ensure(p){
 if(!p?.barcode)return;
 const barcode=String(p.barcode);
 if(!pending.has(barcode)){
  pending.set(barcode,(async()=>{
   let info={...meta.get(barcode)};
   try{
    const fields='code,brand_owner,manufacturer,ingredients_text_de,ingredients_text,allergens,allergens_tags,nutriscore_grade,nutriments,stores';
    const out=await fetchJSON('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(barcode)+'.json?fields='+fields,7000);
    if(out.status===1&&String(out.code||out.product?.code)===barcode){
     const data=out.product||{};
     info={...info,brand_owner:String(data.brand_owner||'').slice(0,160),manufacturer:String(data.manufacturer||'').slice(0,160),
      ingredients:String(data.ingredients_text_de||data.ingredients_text||'').slice(0,1500),
      allergens:String(data.allergens||((data.allergens_tags||[]).map(x=>x.replace(/^[a-z]{2}:/,'')).join(', '))||'').slice(0,260),
      nutriscore_grade:/^[a-e]$/i.test(data.nutriscore_grade||'')?data.nutriscore_grade.toUpperCase():null,
      nutrition:nutritionFromApi(data.nutriments),stores:String(data.stores||'').slice(0,180)};
    }
   }catch(_){info.infoError=true}
   meta.set(barcode,info);repaint(p);
  })());
 }
 if(!pricePending.has(barcode)){
  pricePending.set(barcode,(async()=>{
   let info={...meta.get(barcode)};
   try{
    const out=await fetchJSON('https://prices.openfoodfacts.org/api/v1/prices?product_code='+encodeURIComponent(barcode)+'&size=12&order_by=-date',7000);
    const records=(out.items||[]).filter(x=>x?.type==='PRODUCT'&&x.currency==='EUR'&&Number.isFinite(x.price)&&x.price>0&&x.location?.osm_address_country_code==='DE'&&/^\d{4}-\d{2}-\d{2}$/.test(x.date||'')&&Date.parse(x.date)<=Date.now()).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    const x=records[0];
    if(x)info.price={value:x.price,date:x.date,place:x.location.osm_brand||x.location.osm_name||'Händler'};
   }catch(_){}
   info.priceDone=true;meta.set(barcode,{...meta.get(barcode),...info});repaint(p);
  })());
 }
}
function afterRender(p){if(p)ensure(p)}

const MOTION_KEY='goodthings_shuffle_motion_v22';
const MOTION_MODES=['booster','party','off'];
let inMemoryMotion=null;
function motionSetting(){
 if(MOTION_MODES.includes(inMemoryMotion))return inMemoryMotion;
 let stored;
 try{stored=localStorage.getItem(MOTION_KEY)}catch(_){}
 return stored==='arcade'||stored==='quick'?'party':MOTION_MODES.includes(stored)?stored:'booster';
}
function reduceMotion(){return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)}
function motionControls(){
 const active=motionSetting(),reduced=reduceMotion();
 return '<div class="gt-motion-controls" role="group" aria-label="Animation beim Zufallsprodukt wählen">'+
 '<span class="gt-motion-label">✳ Reveal</span>'+
 [['booster','✨ Booster Pack'],['party','🎉 Party Surprise'],['off','◌ Aus']].map(([mode,label])=>
 '<button type="button" data-action="shuffle-motion" data-value="'+mode+'" aria-pressed="'+(active===mode)+'" class="gt-motion-option'+(active===mode?' is-selected':'')+'">'+label+'</button>').join('')+
 (reduced?'<span class="gt-motion-os-note" title="Die Betriebssystem-Einstellung für weniger Bewegung hat Vorrang">System: reduziert</span>':'')+
 '</div>';
}
function setMotion(mode){
 if(!MOTION_MODES.includes(mode))return false;
 inMemoryMotion=mode;
 try{localStorage.setItem(MOTION_KEY,mode)}catch(_){}
 return true;
}
const drawEmojis=['🍫','🥛','🥑','🍱','🫘','🍜','🍪','🌱','🍓','🥜','🫛','🍿','🍋','🍕'];
const drawLines=['Das Universum mischt die Snacks …','Eine ernsthafte Prüfung für deine Geschmacksknospen.','Was kommt jetzt – S-Tier oder kulinarischer Frevel?','Die Bohnen haben sich beraten …'];
function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
async function spin(task){
 if(spinner)return;
 spinner=true;
 const motion=motionSetting();
 if(motion==='off'||reduceMotion()){
  try{return await task()}finally{spinner=false}
 }
 const booster=motion==='booster';const fast=false;
 const overlay=document.createElement('div');
 overlay.className='gt-spin-overlay gt-spin-v22'+(booster?' gt-spin-booster':' gt-spin-party');
 overlay.setAttribute('role','dialog');
 overlay.setAttribute('aria-modal','true');
 overlay.setAttribute('aria-label','Überraschungsprodukt wird gezogen');
 const reel=(i)=>'<div class="gt-reel" data-gt-reel="'+i+'"><span>'+drawEmojis[(i*4)%drawEmojis.length]+'</span></div>';
 overlay.innerHTML='<div class="gt-draw-card">'+
 '<div class="gt-draw-corner">GOOD THINGS <span>✳</span> MYSTERY DRAW</div>'+
 '<div class="gt-draw-orbit gt-draw-orbit-a" aria-hidden="true">✺</div><div class="gt-draw-orbit gt-draw-orbit-b" aria-hidden="true">✴</div>'+
 '<div class="gt-draw-headline"><span class="gt-draw-badge">100% SURPRISE · 0% WAGER</span><h2 id="gt-draw-title">'+(booster?'One pack. One surprise.':'And the snack is...')+'</h2></div>'+
 '<div class="gt-draw-reel-frame"><div class="gt-draw-frame-top">'+(booster?'✦ UNSEAL YOUR NEXT DISCOVERY ✦':'✦ THE GREAT VEGAN MYSTERY ✦')+'</div>'+(booster?'<div class="gt-booster-opening"><div class="gt-booster-pack"><span class="gt-booster-foil">✴ ✳ ✴</span><span class="gt-booster-mark">GOOD<br>THINGS</span><span class="gt-booster-star">✳</span><span class="gt-booster-sub">A LITTLE PACK OF SURPRISE</span><span class="gt-booster-edition">TASTE EDITION · Nº 002</span><span class="gt-booster-seal">✺ RIP & REVEAL ✺</span></div><div class="gt-booster-shine"></div></div>':'<div class="gt-draw-reels" aria-hidden="true">'+[0,1,2].map(reel).join('')+'</div>')+
 '<div class="gt-draw-reveal" hidden><div class="gt-draw-reveal-halo"></div><div class="gt-draw-product-image">✳</div><div class="gt-draw-found-label">TODAY’S LITTLE DISCOVERY</div><strong id="gt-draw-product-name">Surprise!</strong><small id="gt-draw-product-brand"></small></div>'+
 '<div class="gt-draw-frame-bottom">NO SPOILERS. JUST TASTE.</div></div>'+
 '<div class="gt-draw-ticker" id="gt-draw-line" role="status" aria-live="polite">'+(booster?'Das nächste Produkt wartet hinter dem Siegel …':'Das Universum mischt die Snacks …')+'</div>'+
 '<button type="button" class="gt-draw-skip" aria-label="Animation überspringen">Überspringen ↗</button>'+
 '<div class="gt-draw-confetti" aria-hidden="true">'+Array.from({length:16},(_,i)=>'<i style="--i:'+i+'"></i>').join('')+'</div>'+
 '</div>';
 document.body.appendChild(overlay);
 const lastFocus=document.activeElement;
 let ticks=0;
 const reels=[...overlay.querySelectorAll('[data-gt-reel]')];
 const timers=booster?[]:reels.map((el,j)=>setInterval(()=>{
  if(!el.isConnected)return;
  const symbol=el.querySelector('span');
  if(symbol)symbol.textContent=drawEmojis[(ticks*(j+3)+j*5+drawEmojis.length)%drawEmojis.length];
  ticks++;
 },fast?75:92));
 const messages=setInterval(()=>{
  const label=overlay.querySelector('#gt-draw-line');
  if(label)label.textContent=drawLines[Math.floor(ticks/17)%drawLines.length];
 },fast?230:410);
 let skipDelay=()=>{};
 const skipped=new Promise(resolve=>{skipDelay=resolve});
 const skipButton=overlay.querySelector('.gt-draw-skip');
 skipButton.addEventListener('click',()=>{skipDelay();skipButton.disabled=true;skipButton.textContent='Produkt wird geladen …'});
 const escape=e=>{if(e.key==='Escape'){e.stopPropagation();skipButton.click()}};
 document.addEventListener('keydown',escape,true);
 const stopReels=()=>timers.forEach(clearInterval);
 const before=document.querySelector('#contentView .duo-product')?.dataset.gtProductId||'';
 try{
  // Work happens while the reels run; the animation never delays the network request.
  const job=Promise.resolve().then(task).then(value=>({value}),error=>({error}));
  await Promise.race([wait(fast?510:1750),skipped]);
  stopReels();
  const line=overlay.querySelector('#gt-draw-line');
  if(line)line.textContent='Wir prüfen noch das Produktfoto …';
  const done=await job;
  if(done.error)throw done.error;
  const product=document.querySelector('#contentView .duo-product');
  const name=product?.querySelector('h3')?.textContent||'';
  if(!name||product.dataset.gtProductId===before){
   overlay.classList.add('gt-draw-dismiss');
   await wait(fast?70:180);
   return;
  }
  const brand=product.querySelector('p')?.textContent||'';
  const source=product.querySelector('.duo-hero-photo img');
  const visual=overlay.querySelector('.gt-draw-product-image');
  if(source?.complete&&source.naturalWidth>0&&source.naturalHeight>0){
   const img=document.createElement('img');
   img.src=source.currentSrc||source.src;
   img.alt='';
   img.referrerPolicy='no-referrer';
   img.onerror=()=>{img.remove();visual.textContent='✳'};
   visual.textContent='';visual.appendChild(img);
  }else visual.textContent='✳';
  overlay.querySelector('#gt-draw-product-name').textContent=name;
  overlay.querySelector('#gt-draw-product-brand').textContent=brand;
  overlay.querySelector('#gt-draw-title').textContent=booster?'PACK OPENED! ✳':'TA-DAAA! ✳';
  const revealer=overlay.querySelector('.gt-draw-reveal');
  revealer.hidden=false;
  if(booster){overlay.classList.add('gt-draw-tear');await wait(470)}
  overlay.classList.add('gt-draw-winner');
  if(line)line.textContent='Jetzt bist du dran. S, A, B, C, D oder F?';
  if(!skipButton.disabled){
   await Promise.race([wait(fast?240:780),skipped]);
  }
  overlay.classList.add('gt-draw-dismiss');
  await wait(fast?70:180);
 }finally{
  stopReels();clearInterval(messages);
  document.removeEventListener('keydown',escape,true);
  overlay.remove();spinner=false;
  const product=document.querySelector('#contentView .duo-product');
  if(product&&!reduceMotion())product.classList.add('gt-product-entrance');
  if(lastFocus?.isConnected&&typeof lastFocus.focus==='function')lastFocus.focus({preventScroll:true});
 }
}
const fallback=img=>{
 if(!img)return;
 img.hidden=true;
 const sibling=img.nextElementSibling;
 if(sibling&&sibling.hidden)sibling.hidden=false;
};
function goodImage(u,min=140){
 return new Promise(resolve=>{
  if(!url(u))return resolve(false);
  const pic=new Image(),tid=setTimeout(()=>{pic.onload=null;pic.onerror=null;resolve(false)},4500);
  pic.onload=()=>{clearTimeout(tid);resolve(pic.naturalWidth>=min&&pic.naturalHeight>=min)};
  pic.onerror=()=>{clearTimeout(tid);resolve(false)};
  pic.src=u;
 });
}
async function exactBarcodePhoto(p,old){
 if(!p?.barcode)return '';
 const b=String(p.barcode);
 if(!repairPending.has(b))repairPending.set(b,(async()=>{
  try{
   const fields='code,image_front_url,image_front_small_url,image_url';
   const r=await fetchJSON('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(b)+'.json?fields='+fields,6500);
   if(r.status!==1||String(r.code||r.product?.code)!==b)return '';
   const options=[r.product?.image_front_url,r.product?.image_url].map(url).filter(u=>u&&new URL(u).hostname==='images.openfoodfacts.org'&&u!==old);
   for(const candidate of options)if(await goodImage(candidate))return candidate;
  }catch(_){}
  return '';
 })());
 return repairPending.get(b);
}
async function repairImage(img,p){
 if(!img||!p?.barcode||img.dataset.gtRepairing==='yes')return false;
 img.dataset.gtRepairing='yes';fallback(img);
 const replacement=await exactBarcodePhoto(p,img.src);
 if(!replacement)return false;
 p.image_url=replacement;p.photo_blocked=false;p.image_status='barcode';p.image_source_url='https://world.openfoodfacts.org/product/'+p.barcode;
 p.photo_attribution='Open Food Facts · EAN';
 saveCachedPhoto(p,replacement);
 img.onload=()=>{img.hidden=false;if(img.nextElementSibling?.hidden===false)img.nextElementSibling.hidden=true};
 img.src=replacement;
 return true;
}
async function onPackError(img){
 const id=img?.dataset?.packId;
 const p=(window.GT_CATALOG||[]).find(p=>p.id===id);
 fallback(img);
 if(!p)return;
 if(p.barcode){
  const repaired=await repairImage(img,p);
  if(!repaired)p.photo_blocked=true;
 }else p.photo_blocked=true;
}
window.GT_EXTRAS={facts,afterRender,spin,motionControls,setMotion,motionSetting,onPackError,repairImage,scoreBadge};
})();