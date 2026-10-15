/* GOOD THINGS · Photo Rescue Lab
 * Evidence-backed manual review tool for the unsourced catalogue. No guesswork,
 * no cross-product substitutions, local approvals only until a maintainer merges.
 * Open Food Facts structured data ODbL, community photos CC BY-SA.
 */
(function(){
'use strict';
const KEY='goodthings_exact_barcode_photo_repair_v21';
const $=selector=>document.querySelector(selector);
const list=Array.isArray(window.GT_CATALOG)?window.GT_CATALOG:[];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','&quot;': '&quot;',"'":'&#39;'}[c]));
const safe=s=>{try{const u=new URL(s);return u.protocol==='https:'&&u.hostname==='images.openfoodfacts.org'?u.href:''}catch(_){return ''}};
const norm=s=>String(s||'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return {}}};
const accepted=read();
const reviewQueue=list.filter(p=>p.vegan_status!=='non_vegan'&&(!p.image_url||p.photo_blocked)&&!accepted[p.id]?.reviewed);
let selected=null,candidate=null,busy=false,searchBusy=false,searchSuggestions=[],searchError='';
for(const p of list){
 const d=accepted[p.id];
 if(d?.reviewed!==true||!d.barcode||!safe(d.url)||p.image_url||p.barcode&&p.barcode!==d.barcode)continue;
 p.barcode=d.barcode;p.image_url=d.url;p.image_status='barcode';
 p.image_source_url='https://world.openfoodfacts.org/product/'+d.barcode;
 p.photo_attribution='Open Food Facts · CC BY-SA (lokal überprüft)';
}
const ids=()=>list.filter(p=>p.vegan_status!=='non_vegan'&&!p.image_url).map(p=>p.id);
const barcodeValid=s=>{
 if(!/^\d{8}$|^\d{12,14}$/.test(s))return false;
 const a=s.split('').map(Number),last=a.pop(),sum=a.reverse().reduce((acc,n,i)=>acc+n*(i%2===0?3:1),0);
 return (10-sum%10)%10===last;
};
function panel(){
 let el=$('#gtRescueOverlay');
 if(el)return el;
 el=document.createElement('div');el.id='gtRescueOverlay';el.className='gt-rescue-overlay';el.setAttribute('role','presentation');
 el.innerHTML='<section class="gt-rescue-dialog" role="dialog" aria-modal="true" aria-labelledby="gtRescueTitle">'+
 '<div class="gt-rescue-top"><span class="eyebrow">✳ GOOD THINGS / PHOTO DETECTIVE</span><button type="button" class="gt-rescue-close" data-gt-rescue="close" aria-label="Schließen">×</button></div>'+
 '<div id="gtRescueBody"></div></section>';
 document.body.appendChild(el);
 el.addEventListener('click',e=>{if(e.target===el)close()});
 return el;
}
function close(){const el=$('#gtRescueOverlay');if(el)el.remove();document.body.classList.remove('gt-rescue-open');selected=null;candidate=null}
function open(id){
 const p=list.find(x=>x.id===id),el=panel();if(!p){close();return}
 selected=p;candidate=null;searchSuggestions=[];searchError='';document.body.classList.add('gt-rescue-open');
 render();
 el.querySelector('[data-gt-rescue="close"]')?.focus({preventScroll:true});
}
function render(){
 if(!selected)return;const p=selected;
 const src='https://de.openfoodfacts.org/cgi/search.pl?search_terms='+encodeURIComponent([p.brand,p.name].filter(Boolean).join(' '))+'&search_simple=1&action=process';
 const b=$('#gtRescueBody');if(!b)return;
 const confirmed=accepted[p.id]?.reviewed===true;
 b.innerHTML='<h2 id="gtRescueTitle">Rette dieses Produktfoto.</h2><p class="gt-rescue-product"><strong>'+esc(p.brand)+' · '+esc(p.name)+'</strong><small>'+esc(p.quantity||p.category||'')+' · '+esc(p.id)+'</small></p>'+
 '<p>Schritt 1: Finde den genauen Barcode auf der Verpackung oder einer belastbaren Hersteller-/Händlerseite. Wir prüfen dann den zugehörigen Datensatz und das Frontfoto. <strong>Ähnliche Produkte zählen nicht.</strong></p>'+
 '<div class="gt-rescue-guides"><button type="button" class="button button-lime button-small" data-gt-rescue="search" '+(searchBusy?'disabled':'')+'>'+(searchBusy?'Suche …':'✳ EAN-Kandidaten automatisch finden')+'</button><a href="'+esc(src)+'" target="_blank" rel="noopener noreferrer">Open Food Facts ↗</a><a href="https://www.google.com/search?q='+encodeURIComponent(p.brand+' '+p.name+' EAN GTIN')+'" target="_blank" rel="noopener noreferrer">Alternative Suche ↗</a></div>'+ '<div class="gt-rescue-suggestions" id="gtRescueSuggestions">'+suggestionMarkup()+'</div>'+
 '<form id="gtRescueForm"><label for="gtRescueEAN">EAN / GTIN auf der echten Packung</label><div class="gt-rescue-formline"><input inputmode="numeric" autocomplete="off" pattern="[0-9]{8}|[0-9]{12,14}" maxlength="14" class="control" id="gtRescueEAN" placeholder="z. B. 4012359711106" value="'+esc(p.barcode||'')+'" required><button type="submit" class="button button-dark" '+(busy?'disabled':'')+'>'+(busy?'Prüfe …':'EAN prüfen →')+'</button></div></form>'+
 '<div id="gtRescueResult">'+(candidate?candidateView(candidate):'<p class="gt-rescue-note">Noch kein Bild zugeordnet. Ein ungelöster Eintrag bleibt ehrlich ohne Packshot.</p>')+'</div>'+
 '<div class="gt-rescue-foot"><small>Lokale Zuordnungen sind nur auf deinem Gerät sichtbar, bis sie unabhängig für den öffentlichen Katalog geprüft und veröffentlicht wurden. Bildrechte und Varianten werden nicht allein durch die EAN garantiert.</small>'+
 (confirmed?'<button class="button button-ghost button-small" data-gt-rescue="undo">Lokale Zuordnung zurücknehmen</button>':'')+
 '</div>';
 const form=$('#gtRescueForm');form?.addEventListener('submit',e=>{e.preventDefault();lookup($('#gtRescueEAN').value.trim())});
}
function suggestionMarkup(){
 if(searchError)return '<div class="gt-rescue-warning">'+esc(searchError)+'</div>';
 if(searchBusy)return '<p class="gt-rescue-note">Durchsuche Barcode-Datensätze …</p>';
 if(!searchSuggestions.length)return '';
 return '<div class="gt-rescue-suggestion-list"><strong>Kandidaten – noch NICHT bestätigt</strong><p>Sorten, Verpackungsgrößen und Länder können abweichen. Wähle nur eine tatsächlich passende EAN.</p>'+
 searchSuggestions.map(v=>'<button type="button" data-gt-rescue="choose" data-barcode="'+esc(v.code)+'" class="gt-rescue-suggestion">'+
 (v.image?'<img src="'+esc(v.image)+'" loading="lazy" referrerpolicy="no-referrer" alt="" onerror="this.hidden=true">':'<span>◌</span>')+
 '<span><strong>'+esc(v.brand)+' · '+esc(v.name)+'</strong><small>'+esc(v.quantity||'Größe nicht angegeben')+' · EAN '+esc(v.code)+'</small></span><span>Prüfen ↗</span></button>').join('')+'</div>';
}
const searchWord=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(x=>x.length>3&&!['vegan','vegane','veganer','bioland','pflanzlich','pflanzliche','alternative','original'].includes(x));
const escapeLucene=s=>String(s||'').replace(/[+"\\]/g,' ').trim();
async function searchCandidates(){
 if(!selected||searchBusy)return;
 const p=selected;
 searchBusy=true;searchError='';searchSuggestions=[];render();
 try{
  const brand=escapeLucene(p.brand),tokens=searchWord(p.name);
  const search=brand.includes(' ')?'brands:"'+brand+'" '+(tokens[0]||''): 'brands:'+brand+' '+(tokens[0]||'');
  const endpoint='https://search.openfoodfacts.org/search?q='+encodeURIComponent(search)+'&page_size=60&page=1&fields=code,product_name,brands,quantity,image_front_url';
  const ctrl=typeof AbortController!=='undefined'?new AbortController():null;
  const timer=ctrl?setTimeout(()=>ctrl.abort(),9500):null;
  let resp;
  try{resp=await fetch(endpoint,{headers:{Accept:'application/json'},signal:ctrl?.signal})}
  finally{if(timer)clearTimeout(timer)}
  if(!resp.ok)throw Error('Suche momentan nicht verfügbar ('+resp.status+').');
  const body=await resp.json(),hits=Array.isArray(body.hits)?body.hits:[];
  const normName=x=>String(x||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
  const brandSlug=normName(p.brand);
  searchSuggestions=hits.filter(h=>/^\d{8}$|^\d{12,14}$/.test(h.code||'')&&safe(h.image_front_url))
   .filter(h=>(Array.isArray(h.brands)?h.brands:[h.brands]).some(b=>normName(b).includes(brandSlug)||brandSlug.includes(normName(b))&&normName(b).length>4))
   .map(h=>{
    const words=searchWord(h.product_name),overlap=tokens.filter(t=>words.some(w=>w.includes(t)||t.includes(w))).length,score=overlap/Math.max(tokens.length,1);
    return {code:String(h.code),brand:(h.brands||[]).join(', '),name:String(h.product_name||''),quantity:String(h.quantity||''),image:safe(h.image_front_url),score};
   })
   .sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'de')).slice(0,18);
  if(!searchSuggestions.length)searchError='Keine ausreichend passenden Kandidaten gefunden. Bitte EAN manuell recherchieren oder die Produktbezeichnung prüfen.';
 }catch(e){searchError='Automatische Suche gerade nicht erreichbar. Nutze den direkten Open-Food-Facts-Link oder suche nach EAN: '+String(e.message||e).slice(0,100)}
 finally{searchBusy=false;render()}
}
function candidateView(v){
 if(v.error)return '<div class="gt-rescue-warning" role="alert">'+esc(v.error)+'</div>';
 const nameOk=v.nameOk,brandOk=v.brandOk,source='https://world.openfoodfacts.org/product/'+v.code;
 const warning=(!nameOk||!brandOk)?'<div class="gt-rescue-warning">⚠ Marke oder Produktbezeichnung stimmt nicht ausreichend überein. Nicht automatisch übernehmen – richtige Variante zuerst klären.</div>':'<div class="gt-rescue-success">✓ Marke und Produktname plausibel. Bitte Größe, Verpackung und EAN selbst vergleichen.</div>';
 return '<div class="gt-rescue-candidate">'+warning+
 '<div class="gt-rescue-candidate-grid"><div class="gt-rescue-preview"><img src="'+esc(v.url)+'" alt="Open Food Facts Kandidat, Verpackung unbedingt prüfen" loading="eager" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div hidden>Foto konnte nicht geladen werden.</div></div>'+
 '<div><h3>'+esc(v.brands)+' · '+esc(v.name)+'</h3><p>'+esc(v.quantity||'Größe unbekannt')+' · EAN '+esc(v.code)+'</p><a href="'+source+'" target="_blank" rel="noopener noreferrer">Originaldatensatz überprüfen ↗</a><p class="gt-rescue-license">Community-Bild: Open Food Facts · CC BY-SA. Produktdaten: ODbL. Quelle wird gespeichert.</p></div></div>'+
 '<label class="gt-rescue-confirm"><input type="checkbox" id="gtRescueConfirm"> Ich habe <strong>Marke, Sorte, Größe, Barcode und Packungsbild</strong> selbst abgeglichen; genau dieses Produkt ist gemeint.</label>'+
 '<button class="button button-lime" data-gt-rescue="approve" '+(!v.imageOkay?'disabled title="Bildauflösung unzureichend"':'')+'>Dieses Foto nur für mein Gerät übernehmen ✓</button>'+
 (!v.imageOkay?'<p class="gt-rescue-warning">Fotoquelle nicht ausreichend hochauflösend oder vorübergehend unerreichbar. Kein unscharfer Packshot wird übernommen.</p>':'')+
 '</div>';
}
function sharp(url){
 return new Promise(resolve=>{
  const image=new Image();let settled=false;
  const done=ok=>{if(settled)return;settled=true;clearTimeout(timer);resolve(ok)};
  const timer=setTimeout(()=>done(false),5800);
  image.onload=()=>done(Math.max(image.naturalWidth,image.naturalHeight)>=600&&Math.min(image.naturalWidth,image.naturalHeight)>=260);
  image.onerror=()=>done(false);image.src=url;
 });
}
async function lookup(code){
 if(busy||!selected)return;
 if(!barcodeValid(code)){candidate={error:'Die Nummer ist keine gültige EAN/GTIN (Prüfziffer fehlerhaft). Bitte auf der Verpackung nachsehen.'};render();return}
 busy=true;const p=selected;render();
 try{
  const controller=typeof AbortController!=='undefined'?new AbortController():null;
  const timer=controller?setTimeout(()=>controller.abort(),9000):null;
  let res;
  try{res=await fetch('https://de.openfoodfacts.org/api/v2/product/'+encodeURIComponent(code)+'.json?fields=code,product_name,product_name_de,brands,quantity,image_front_url',{headers:{Accept:'application/json'},signal:controller?.signal})}
  finally{if(timer)clearTimeout(timer)}
  if(!res.ok)throw Error('Die Produktdatenbank antwortet gerade nicht ('+res.status+').');
  const d=await res.json();if(d.status!==1||String(d.code||d.product?.code)!==code)throw Error('Keine eindeutige Produktseite für diese EAN gefunden.');
  const item=d.product||{},image=safe(item.image_front_url);
  if(!image)throw Error('EAN ist vorhanden, aber es gibt kein belegtes Front-Packshot zu dieser Nummer.');
  const full=image.replace(/\.400\.jpg(?=\?|$)/,'.full.jpg');
  const tested=await sharp(full)?full:await sharp(image)?image:'';
  const brand=norm(p.brand),maker=norm(item.brands),target=norm(p.name),name=norm(item.product_name_de||item.product_name);
  const nameTokens=String(p.name||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').split(/[^a-z0-9]+/).filter(x=>x.length>=4&&!['vegan','vegane','veganer','pflanzliche','pflanzlicher','alternative','original','bioland'].includes(x));
  const common=nameTokens.filter(x=>name.includes(x)),nameOk=common.length>=Math.max(1,Math.ceil(nameTokens.length*.5));
  candidate={code,url:tested||image,brands:String(item.brands||'').slice(0,120),name:String(item.product_name_de||item.product_name||'Unbekannt').slice(0,150),quantity:String(item.quantity||'').slice(0,80),brandOk:!!brand&&maker.includes(brand),nameOk,imageOkay:!!tested,originalImage:image};
 }catch(e){candidate={error:String(e.message||e).slice(0,220)}}
 finally{busy=false;render()}
}
function approve(){
 const p=selected,d=candidate;
 if(!p||!d||d.error||!d.imageOkay)return;
 if(!$('#gtRescueConfirm')?.checked){alert('Bitte erst den Abgleich von Marke, Sorte, Größe und EAN bestätigen.');return}
 if(!d.brandOk||!d.nameOk){alert('Produktidentität ist unklar. Bitte die passende EAN oder Variante recherchieren.');return}
 const record={reviewed:true,barcode:d.code,url:d.url,brand:d.brands,name:d.name,quantity:d.quantity,source:'https://world.openfoodfacts.org/product/'+d.code,license:'CC BY-SA',reviewed_at:new Date().toISOString(),match_method:'human_confirmed_variant_and_gtin'};
 try{const all=read();all[p.id]=record;localStorage.setItem(KEY,JSON.stringify(all));Object.assign(accepted,all)}
 catch(e){alert('Dein Browser erlaubt das Speichern momentan nicht. '+String(e.message||''));return}
 location.reload();
}
function undo(){
 if(!selected)return;
 const id=selected.id;try{const all=read();delete all[id];localStorage.setItem(KEY,JSON.stringify(all))}catch(_){}
 location.reload();
}
function exportReviewed(){
 const data=Object.entries(read()).filter(([id,x])=>list.some(p=>p.id===id)&&x?.reviewed===true).map(([id,x])=>({catalog_id:id,...x}));
 if(!data.length){alert('Noch keine lokalen, geprüften Bildzuordnungen vorhanden.');return}
 const blob=new Blob([JSON.stringify({project:'GOOD THINGS',version:'photo-rescue-1',exported_at:new Date().toISOString(),items:data},null,2)],{type:'application/json'});
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='good-things-photo-rescue-reviewed.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1200);
}
function rescueNext(){
 const p=list.find(p=>p.vegan_status!=='non_vegan'&&!p.image_url&&!accepted[p.id]?.reviewed)||list.find(p=>!p.image_url&&!accepted[p.id]?.reviewed);
 if(!p){alert('Alle aktuell fehlenden Produktbilder haben einen gespeicherten lokalen Vorschlag. Bitte den Bericht exportieren und öffentlich prüfen lassen.');return}
 open(p.id);
}
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-gt-rescue]');
 if(!btn)return;
 e.preventDefault();
 const action=btn.dataset.gtRescue;
 if(action==='close')close();
 else if(action==='open')open(btn.dataset.id);
 else if(action==='next')rescueNext();
 else if(action==='export')exportReviewed();
 else if(action==='search')searchCandidates();
 else if(action==='choose'){const id=String(btn.dataset.barcode||'');if(barcodeValid(id)){const field=$('#gtRescueEAN');if(field)field.value=id;lookup(id)}}
 else if(action==='approve')approve();
 else if(action==='undo')undo();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#gtRescueOverlay')){e.stopPropagation();close()}},true);
window.GT_PHOTO_RESCUE={open,exportReviewed,barcodeValid};
})();