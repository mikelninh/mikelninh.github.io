/* GOOD QUESTION · GOOD THINGS Index 1.0
   Local-first two-person tasting notebook.
   No user accounts, automatic sync, affiliate tracking, or fabricated ratings.
   Unknown nutrition = null, never zero. Submitted package values are private,
   self-entered and distinct from verified reference sources.
*/
(()=>{'use strict';
const $=(q,base=document)=>base.querySelector(q);
const $$=(q,base=document)=>Array.from(base.querySelectorAll(q));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
const names={mikel:'Mikel',huong:'Huong'};
const validRank=['','S','A','B','C','D'];
const tiers=['S','A','B','C','D'];
const storeKey='gq-good-things-v1';
const noData='Nicht geprüft';
const fmt=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(n);
const safeURL=u=>typeof u==='string'&&/^https:\/\//i.test(u)&&u.length<1600?u:null;
function fresh(){return {version:1,active:'mikel',profiles:{mikel:{},huong:{}},labels:{},custom:[]}}
let data=null,catalog=[],state=fresh(),pageLimit=24,filters={query:'',category:'all',store:'all',rating:'all',protein:'any',sugar:'any',sort:'curated'},pendingLink=null,pendingFile=null,detailId=null;
let toastTimer=null;
function toast(s){const el=$('#toast');el.textContent=s;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.textContent='',3800)}
function readLocal(){try{return localStorage.getItem(storeKey)}catch{return null}}
function persist(){try{localStorage.setItem(storeKey,JSON.stringify(state));return true}catch{toast('Browser-Speicher blockiert – bitte JSON exportieren, um deine Bewertungen zu behalten.');return false}}
function numberOrNull(v,max=100){if(v===null||v===undefined||v==='')return null;const n=Number(v);return Number.isFinite(n)&&n>=0&&n<=max?n:null}
function validateProfile(p){const o={};if(!p||typeof p!=='object'||Array.isArray(p))return o;
for(const [id,r] of Object.entries(p).slice(0,500)){if(!/^[-a-z0-9]{2,120}$/i.test(id)||!r||typeof r!=='object')continue;
const grade=validRank.includes(r.grade)?r.grade:'';
const tried=Boolean(r.tried)||Boolean(grade);
const rebuy=['','yes','maybe','no'].includes(r.rebuy)?r.rebuy:'';
const notes=typeof r.notes==='string'?r.notes.slice(0,500):'';
const store=typeof r.store==='string'?r.store.slice(0,80):'';
if(tried||grade||rebuy||notes||store)o[id]={tried,grade,rebuy,notes,store,updated:typeof r.updated==='string'?r.updated.slice(0,30):''};
}return o}
function validateLabel(l){const o={};if(!l||typeof l!=='object'||Array.isArray(l))return o;for(const [id,x]of Object.entries(l).slice(0,500)){
if(!x||typeof x!=='object'||!/^[-a-z0-9]{2,120}$/i.test(id))continue;
o[id]={protein_g:numberOrNull(x.protein_g),sugars_g:numberOrNull(x.sugars_g),per:x.per==='100ml'?'100ml':'100g',made_in:String(x.made_in||'').slice(0,100),ingredients_origin:String(x.ingredients_origin||'').slice(0,100),updated:String(x.updated||'').slice(0,30),source:'reader-submitted package information (not independently verified)'};
}return o}
function validateCustom(raw){
if(!Array.isArray(raw))return [];return raw.slice(0,250).filter(p=>p&&typeof p==='object'&&typeof p.name==='string'&&p.name.length>=3).map(p=>{
 const id=/^custom-[a-z0-9-]{4,70}$/.test(p.id||'')?p.id:'custom-'+Math.random().toString(36).slice(2,12);
 const brand=String(p.brand||'Own label').slice(0,50),name=String(p.name).slice(0,100);
 const image=safeURL(p.image?.url),source=safeURL(p.source?.url);
 return {id,sku:null,barcode:null,name,brand,category:String(p.category||'My additions').slice(0,60),store:Array.isArray(p.store)?p.store.filter(x=>typeof x==='string').slice(0,5).map(s=>s.slice(0,40)):['Unknown'],size:null,
  image:{url:image,source_url:source||image,credit:'Reader supplied (unverified)',checked:null,verification:'User-provided photo URL; not independently checked'},
  source:{url:source,type:'reader submission',checked:null},
  vegan:{status:'not-verified',note:'Please check the exact package.'},
  nutrition:{per:p.nutrition?.per==='100ml'?'100ml':'100g',protein_g:numberOrNull(p.nutrition?.protein_g),sugars_g:numberOrNull(p.nutrition?.sugars_g),sugars_less_than:false,energy_kcal:null,fibre_g:null,salt_g:null,calcium_mg:null,b12_ug:null,source_url:source,checked:null},
  production:{made_in:String(p.production?.made_in||'').slice(0,100)||null,ingredients_origin:String(p.production?.ingredients_origin||'').slice(0,100)||null,legal_company:null,legal_address:null,source_url:source,checked:null,note:'Self-entered, not verified'},
  allergens:null,ingredients:null,editorial_review:'user-entry-unverified',affiliate_url:null,price_eur:null};
});}
function hydrate(){let raw;try{raw=JSON.parse(readLocal()||'null')}catch{};if(!raw||raw.version!==1)return;
state.active=names[raw.active]?raw.active:'mikel';
for(const who of ['mikel','huong'])state.profiles[who]=validateProfile(raw.profiles?.[who]);
state.labels=validateLabel(raw.labels);state.custom=validateCustom(raw.custom)}
function getById(id){return catalog.find(p=>p.id===id)}
function score(id,who){return state.profiles[who][id]||{tried:false,grade:'',rebuy:'',notes:'',store:''}}
function hasTried(id,who){const o=score(id,who);return o.tried||Boolean(o.grade)}
function changeProfile(who){if(!names[who])return;state.active=who;persist();render()}
function numberField(v,lt=false){if(v===null||v===undefined||!Number.isFinite(Number(v)))return '—';return (lt?'<':'')+fmt(Number(v))}
function effectiveNutrition(p){const x=state.labels[p.id];if(x&&(x.protein_g!==null||x.sugars_g!==null))return {value:{...p.nutrition,...x},type:'self'};const q=p.nutrition||{};return {value:q,type:q.protein_g!==null||q.sugars_g!==null?'sourced':'unknown'}}
function cellMetric(v,less=false){return v===null||v===undefined?'—':numberField(v,less)+' g'}
function imageBlock(p,extra=''){const url=safeURL(p.image?.url),credit=safeURL(p.image?.source_url||p.source?.url)||'#';
const alt=escape(p.name+' — Händler-Produktfoto, Packungsdesign kann abweichen');
return `<div class="product-image ${url?'':'has-error'} ${extra}">${url?`<img src="${escape(url)}" alt="${alt}" loading="lazy" decoding="async" referrerpolicy="no-referrer" width="310" height="210">`:''}<span class="fallback-photo" aria-hidden="true">✳<br>${escape(p.brand)}<small>Foto ausstehend · Etikett prüfen</small></span>${credit!=='#'?`<a class="image-credit" href="${escape(credit)}" target="_blank" rel="noopener noreferrer" title="Bild-/Produktquelle öffnen">Bildquelle ↗</a>`:''}</div>`}
function ratingLabel(p,who){const r=score(p.id,who);return `<span class="review-person"><b>${names[who].toUpperCase()}</b><span class="rank-small ${r.grade?'filled':''}">${escape(r.grade|| (r.tried?'✓':'—'))}</span></span>`}
function prettyCategory(s){return s.replace(' & ',' / ')}
function card(p){const n=effectiveNutrition(p),q=n.value;
const flagged=p.editorial_review==='candidate-unverified'||p.vegan?.status==='brand-range-only';
const note=n.type==='self'?'Eigener Etiketten-Eintrag':n.type==='sourced'?'Quellen-Nährwerte':'Nährwerte noch nicht geprüft';
return `<article class="product-card" data-id="${escape(p.id)}" aria-label="${escape(p.name)}">
 ${imageBlock(p)}
 <div class="product-body"><div class="brand-line">${escape(p.brand.toUpperCase())} / ${escape(p.store?.join(' · ')||'')}</div><h3>${escape(p.name)}</h3><p class="product-meta">${escape(p.category)}${p.size?' · '+escape(p.size):''}</p>
 <div class="nutrition-chips"><span class="nutri-chip ${q.protein_g===null?'unknown':''}"><small>PROTEIN / ${escape(q.per||'100g')}</small><strong>${cellMetric(q.protein_g)}</strong></span><span class="nutri-chip ${q.sugars_g===null?'unknown':''}"><small>ZUCKER / ${escape(q.per||'100g')}</small><strong>${cellMetric(q.sugars_g,q.sugars_less_than)}</strong></span></div>
 <p class="nutri-source">${escape(note)}</p>${flagged?'<p class="photo-note">Produktversion/Etikett noch bestätigen</p>':''}
 </div><div class="review-mini">${ratingLabel(p,'mikel')}${ratingLabel(p,'huong')}</div>
 <div class="card-actions"><button type="button" data-detail="${escape(p.id)}">Bewerten & Fakten <span aria-hidden="true">↗</span></button><span class="status-note">${hasTried(p.id,state.active)?'✓ Probiert':'○ Offen'}</span></div></article>`}
function showCategories(){const categories=['all',...new Set(catalog.map(p=>p.category))];const cats=$('#filter-category');const original=cats.value||'all';cats.innerHTML='<option value="all">Alle Kategorien</option>'+categories.slice(1).map(c=>`<option value="${escape(c)}">${escape(c)}</option>`).join('');
cats.value=categories.includes(original)?original:'all';filters.category=cats.value;
const dest=$('#category-tabs');dest.innerHTML=categories.map(c=>`<button type="button" data-cat="${escape(c)}" aria-pressed="${filters.category===c}">${escape(c==='all'?'Alles':prettyCategory(c))} <small>${c==='all'?catalog.length:catalog.filter(p=>p.category===c).length}</small></button>`).join('');
const stores=[...new Set(catalog.flatMap(p=>Array.isArray(p.store)?p.store:[]))].sort();$('#filter-store').innerHTML='<option value="all">Alle Händler</option>'+stores.map(s=>`<option value="${escape(s)}">${escape(s)}</option>`).join('');$('#filter-store').value=stores.includes(filters.store)?filters.store:'all';
$('#custom-category').innerHTML=[...new Set([...categories.slice(1),'My additions'])].map(c=>`<option value="${escape(c)}">${escape(c)}</option>`).join('');}
function scoreCompare(p){const a=score(p.id,'mikel').grade,b=score(p.id,'huong').grade;
if(!a&&!b)return 99;const aa=a?tiers.indexOf(a):6,bb=b?tiers.indexOf(b):6;return Math.min(aa,bb)}
function allFiltered(){let list=catalog.slice();
if(filters.query){const query=normalize(filters.query);list=list.filter(p=>normalize([p.name,p.brand,p.category,p.store?.join(' '),p.ingredients].join(' ')).includes(query))}
if(filters.category!=='all')list=list.filter(p=>p.category===filters.category);
if(filters.store!=='all')list=list.filter(p=>p.store?.includes(filters.store));
switch(filters.rating){
case 'tried':list=list.filter(p=>hasTried(p.id,'mikel')||hasTried(p.id,'huong'));break;
case 'untried':list=list.filter(p=>!hasTried(p.id,'mikel')&&!hasTried(p.id,'huong'));break;
case 'rated':list=list.filter(p=>score(p.id,'mikel').grade||score(p.id,'huong').grade);break;
case 'top':list=list.filter(p=>['S','A'].includes(score(p.id,'mikel').grade)||['S','A'].includes(score(p.id,'huong').grade));break;
case 'duo':list=list.filter(p=>score(p.id,'mikel').grade&&score(p.id,'huong').grade);break;
case 'self':list=list.filter(p=>p.id.startsWith('custom-'));break;
}
if(filters.protein!=='any'){const limit=Number(filters.protein);list=list.filter(p=>{const n=effectiveNutrition(p).value;return n.protein_g!==null&&n.protein_g!==undefined&&n.protein_g>=limit})}
if(filters.sugar!=='any'){const limit=Number(filters.sugar);list=list.filter(p=>{const n=effectiveNutrition(p).value;return n.sugars_g!==null&&n.sugars_g!==undefined&&n.sugars_g<=limit})}
if(filters.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'de'));
if(filters.sort==='protein')list.sort((a,b)=>((effectiveNutrition(b).value.protein_g??-1)-(effectiveNutrition(a).value.protein_g??-1)));
if(filters.sort==='sugar')list.sort((a,b)=>((effectiveNutrition(a).value.sugars_g??Infinity)-(effectiveNutrition(b).value.sugars_g??Infinity)));
if(filters.sort==='ours')list.sort((a,b)=>scoreCompare(a)-scoreCompare(b));
return list}
function renderGrid(){const list=allFiltered(),visible=list.slice(0,pageLimit);$('#product-grid').innerHTML=list.length?visible.map(card).join(''):`<div class="empty-results"><h3>Still a good question.</h3><p>Keine passenden Produkte. Entferne einen Filter oder füge dein eigenes Produkt hinzu.</p></div>`;
$('#result-count').textContent=`${fmt(list.length)} von ${fmt(catalog.length)} Produkten · ${fmt(visible.length)} sichtbar`;
const btn=$('#load-more');btn.hidden=visible.length===list.length;btn.textContent=`${Math.min(24,list.length-visible.length)} weitere Produkte laden ↓`;
$$('.product-image img').forEach(img=>{img.addEventListener('error',()=>{img.hidden=true;img.parentElement.classList.add('has-error')},{once:true});if(img.complete&&img.naturalWidth===0){img.hidden=true;img.parentElement.classList.add('has-error')}})
}
function summary(){const totals={};for(const who of ['mikel','huong']){let tried=0,rated=0,top=[];for(const p of catalog){const r=score(p.id,who);if(hasTried(p.id,who))tried++;if(r.grade){rated++;if(['S','A'].includes(r.grade))top.push(p.name)}}totals[who]={tried,rated,top};}
$('#duo-table').innerHTML=['mikel','huong'].map(who=>`<section class="duo-column"><h3>${names[who].toUpperCase()}</h3><div class="duo-count">${totals[who].tried}</div><p class="duo-meta">Produkte probiert · ${totals[who].rated} bewertet</p><p class="duo-toptier">${totals[who].top.length?'S/A: '+escape(totals[who].top.slice(0,2).join(' · ')):'S-Tier? Wird noch entdeckt.'}</p></section>`).join('');
const t=totals[state.active];$('#profile-stats').innerHTML=`<div class="stat"><b>${t.tried}</b><small>PROBIERT</small></div><div class="stat"><b>${t.rated}</b><small>BEWERTET</small></div><div class="stat"><b>${t.top.length}</b><small>S + A FAVOURITES</small></div>`;
$$('[data-profile]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.profile===state.active)));
$('#profile-explainer').textContent=`Du bearbeitest ${names[state.active]}s Bewertungen auf diesem Gerät. Keine automatische Synchronisierung.`;
$('#catalog-description').textContent=`${fmt(catalog.length)} Produkte · ${fmt(catalog.filter(p=>Boolean(safeURL(p.image?.url))).length)} Bilder mit Quellen · ${fmt(catalog.filter(p=>p.nutrition?.protein_g!==null).length)} Produkte mit nachgeprüftem Protein/Zucker. Unbekannte Werte bleiben leer.`;
}
function render(){summary();renderGrid();$$('[data-cat]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cat===filters.category)))}
function fullRefresh(){showCategories();render()}
function recordChange(id,who,patch){if(!names[who]||!getById(id))return;
const last=score(id,who);const next={...last,...patch};
if(next.grade)next.tried=true;
next.updated=new Date().toISOString();
state.profiles[who][id]=next;persist();render();
if(detailId===id)updateDetail(false)}
function openDialog(dialog){if(dialog.open)return;dialog.showModal();}
function labelValue(v,unit){return v===null||v===undefined?'Nicht geprüft':fmt(v)+' '+(unit||'g')}
function detail(p){
const x=effectiveNutrition(p),n=x.value,o=p.production||{},own=state.labels[p.id];
const details=(label,value)=>`<div class="detail-list"><strong>${escape(label)}</strong><span>${escape(value||noData)}</span></div>`;
const reviewers=['mikel','huong'].map(who=>{
 const r=score(p.id,who);
 return `<section><h3>${names[who].toUpperCase()}</h3>
 <button type="button" data-tried="${escape(p.id)}" data-who="${who}">${r.tried?'✓ Schon probiert':'○ Noch nicht probiert'}</button>
 <div class="detail-grade" role="group" aria-label="Tier von ${names[who]}">${validRank.map(rank=>`<button type="button" data-grade="${escape(rank)}" data-id="${escape(p.id)}" data-who="${who}" aria-pressed="${r.grade===rank}">${rank||'—'}</button>`).join('')}</div>
 <label>Wieder kaufen?<select data-note-field="rebuy" data-id="${escape(p.id)}" data-who="${who}">
 <option value="" ${!r.rebuy?'selected':''}>Noch offen</option>
 <option value="yes" ${r.rebuy==='yes'?'selected':''}>Ja, immer wieder!</option>
 <option value="maybe" ${r.rebuy==='maybe'?'selected':''}>Vielleicht</option>
 <option value="no" ${r.rebuy==='no'?'selected':''}>Lieber nicht</option></select></label>
 <label>Deine Notizen<textarea maxlength="500" data-note-field="notes" data-id="${escape(p.id)}" data-who="${who}" placeholder="Geschmack, Textur, Verwendung …">${escape(r.notes)}</textarea></label>
 <label>Wo gekauft?<input type="text" maxlength="80" data-note-field="store" data-id="${escape(p.id)}" data-who="${who}" value="${escape(r.store)}" placeholder="z.B. REWE, Lidl, Asia Markt"></label>
 <button type="button" data-save-notes="${escape(p.id)}" data-who="${who}" style="margin-top:12px">Notizen speichern ↗</button></section>`}).join('');
const source=safeURL(p.source?.url),imgSrc=safeURL(p.image?.url),per=n.per||'100g';
const originMade=o.made_in||null,originAg=o.ingredients_origin||null,originCompany=o.legal_company?o.legal_company+(o.legal_address?' · '+o.legal_address:''):null;
return `<div class="dialog-inside"><div class="detail-cover">${imgSrc?`<img src="${escape(imgSrc)}" alt="${escape(p.name)}" loading="eager" onerror="this.hidden=true">`:`<div class="fallback-photo" style="display:block">✳ ${escape(p.brand)}</div>`}
 <div><span class="detail-tag">${escape(p.brand)} · ${escape(p.category)}</span><h2 id="product-dialog-title">${escape(p.name)}</h2><p class="fine">${escape(p.store?.join(', ')||'Keine Händlerangabe')}${p.sku?' · REWE Artikel-Nr. '+escape(p.sku):''}</p><p class="fine">Tier-Listen sind persönliche Urteile, keine wissenschaftlichen Zertifikate.</p></div></div>
 <p class="eyebrow accent">NUTRITION / ${escape(per)} ${x.type==='sourced'?'· QUELLE':x.type==='self'?'· EIGENE PACKUNGSANGABE':'· OFFEN'}</p>
 <div class="detail-statgrid">
 <div class="detail-stat"><strong>${cellMetric(n.protein_g)}</strong><span>PROTEIN / ${escape(per)}</span></div>
 <div class="detail-stat"><strong>${cellMetric(n.sugars_g,n.sugars_less_than)}</strong><span>ZUCKER / ${escape(per)}</span></div>
 <div class="detail-stat"><strong>${n.energy_kcal===null?'—':fmt(n.energy_kcal)}</strong><span>KCAL / ${escape(per)}</span></div>
 <div class="detail-stat"><strong>${cellMetric(n.salt_g)}</strong><span>SALZ / ${escape(per)}</span></div>
 </div>
 <p class="fine">${x.type==='self'?'Selbst eingetragene Packungsangabe – nicht unabhängig überprüft.':x.type==='sourced'?'Aus konkret verlinkter Produkt-/Herstellerangabe, Stand Oktober 2026.':'Noch kein belegter Wert für diese Packungsvariante.'}</p>
 <div class="detail-reviews">${reviewers}</div>
 <p class="eyebrow accent" style="margin-top:18px">MORE THAN THE NUMBERS</p>
 ${details('Zutaten',p.ingredients)}
 ${details('Allergene',p.allergens)}
 ${details('Ballaststoffe',labelValue(n.fibre_g,'g / '+per))}
 ${details('Kalzium',labelValue(n.calcium_mg,'mg / '+per))}
 ${details('B12',labelValue(n.b12_ug,'µg / '+per))}
 ${details('Hergestellt in',own?.made_in||originMade)}
 ${details('Landwirtschaft / Rohstoff',own?.ingredients_origin||originAg)}
 ${details('Rechtlicher Ansprechpartner',originCompany)}
 <p class="fine" style="padding-top:14px">Ein Firmensitz beweist keinen Produktionsstandort. „EU-Landwirtschaft“ benennt keine einzelne Fabrik. Die Herkunft von Soja, Hafer oder Kakao kann sich zwischen Chargen ändern.</p>
 <div class="detail-links">${source?`<a href="${escape(source)}" target="_blank" rel="noopener noreferrer">Originalprodukt & Nährwertquelle ↗</a>`:''}${safeURL(p.image?.source_url)?`<a href="${escape(p.image.source_url)}" target="_blank" rel="noopener noreferrer">Bildquelle ↗</a>`:''}${safeURL(n.source_url)&&n.source_url!==source?`<a href="${escape(n.source_url)}" target="_blank" rel="noopener noreferrer">Nährwert-Beleg ↗</a>`:''}</div>
 <div class="label-entry"><h3>Ein besseres Etiketten-Archiv.</h3><p class="fine">Wenn du die Packung vor dir hast, kannst du die Werte lokal ergänzen. Deine Angabe wird klar als selbst eingetragen markiert und ersetzt nicht die publizierte Quelle.</p>
 <div class="label-grid"><label>Protein / 100 g oder ml<input data-label-key="protein_g" type="number" min="0" max="100" step="0.1" placeholder="unbekannt" value="${own?.protein_g??''}"></label>
 <label>Zucker / 100 g oder ml<input data-label-key="sugars_g" type="number" min="0" max="100" step="0.1" placeholder="unbekannt" value="${own?.sugars_g??''}"></label>
 <label>Basis<select data-label-key="per"><option value="100g" ${(own?.per||n.per)==='100g'?'selected':''}>100 g</option><option value="100ml" ${(own?.per||n.per)==='100ml'?'selected':''}>100 ml</option></select></label>
 <label>Hergestellt in<input data-label-key="made_in" type="text" maxlength="100" value="${escape(own?.made_in||'')}" placeholder="nur wenn auf der Packung"></label>
 <label>Rohstoff-Herkunft<input data-label-key="ingredients_origin" type="text" maxlength="100" value="${escape(own?.ingredients_origin||'')}" placeholder="nur wenn belegt"></label></div>
 <button class="button button-dark" type="button" data-save-label="${escape(p.id)}">Packungsdaten lokal speichern ↗</button></div></div>`}
function updateDetail(keepFocus=true){if(!detailId)return;const p=getById(detailId);if(!p)return;
const dialog=$('#product-dialog');const active=keepFocus?document.activeElement:null;
$('#product-dialog-content').innerHTML=detail(p);
if(!dialog.open)openDialog(dialog);
if(active&&active.hasAttribute('data-grade')){const id=active.dataset.id,who=active.dataset.who,rank=active.dataset.grade;$('#product-dialog-content').querySelector(`[data-id="${id}"][data-who="${who}"][data-grade="${rank}"]`)?.focus()}
}
function closeDialog(d){if(d.open)d.close();if(d.id==='product-dialog')detailId=null}
function encodeShare(text){const bytes=new TextEncoder().encode(text);return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function decodeShare(t){const binary=atob(t.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-t.length%4)%4));return new TextDecoder().decode(Uint8Array.from(binary,c=>c.charCodeAt(0)))}
function shareSnapshot(){
 const who=state.active;const registered=new Set(data.products.map(p=>p.id));
 const items=Object.entries(state.profiles[who]).filter(([id,r])=>registered.has(id)&&(r.tried||r.grade)).map(([id,r])=>[id,r.grade||'',r.tried?1:0,r.rebuy==='yes'?'y':r.rebuy==='no'?'n':r.rebuy==='maybe'?'m':'']);
 if(!items.length){toast('Bewerte oder markiere zuerst ein Produkt als probiert.');return}
 const payload={v:1,from:who,date:new Date().toISOString().slice(0,10),items};
 const u=new URL(location.href);u.hash='share='+encodeShare(JSON.stringify(payload));
 if(u.href.length>6900){toast('Zu viele Bewertungen für einen sicheren Link. Bitte stattdessen die JSON-Datei exportieren.');return}
 const url=u.href;
 if(navigator.share){navigator.share({title:names[who]+"'s GOOD THINGS ratings",url}).catch(e=>{if(e.name!=='AbortError')fallbackCopy(url)});}else fallbackCopy(url);
}
async function fallbackCopy(url){try{if(!navigator.clipboard)throw Error('clipboard');await navigator.clipboard.writeText(url);toast('Link kopiert – sende ihn der anderen Person.');}catch{window.prompt('Link kopieren:',url);}}
function incoming(){
 const fragment=new URLSearchParams(location.hash.slice(1));const raw=fragment.get('share');if(!raw||raw.length>10000)return;
 let obj;try{obj=JSON.parse(decodeShare(raw))}catch{return}
 if(obj?.v!==1||!names[obj.from]||!Array.isArray(obj.items)||obj.items.length>500)return;
 const ids=new Set(data.products.map(p=>p.id)),items=[];
 for(const row of obj.items){if(!Array.isArray(row)||row.length<3)continue;const [id,grade,tried,rebuy]=row;if(typeof id!=='string'||!ids.has(id)||!validRank.includes(grade))continue;
 items.push([id,grade,Boolean(tried),rebuy==='y'?'yes':rebuy==='n'?'no':rebuy==='m'?'maybe':'']);}
 if(!items.length)return;
 pendingLink={who:obj.from,items};
 const banner=$('#share-import');banner.hidden=false;
 $('#share-title').textContent=`${names[obj.from]} · ${items.length} geteilte Produktnotizen`;
 $('#share-description').textContent=`Dieser Link enthält ${items.length} Bewertungen oder Probiermarkierungen. Du kannst die noch freien Einträge in ${names[obj.from]}s lokaler Spalte übernehmen und deine eigenen Notizen behalten.`;
}
function consumeSnapshot(){if(!pendingLink)return;let added=0,skipped=0;const {who,items}=pendingLink;
for(const [id,grade,tried,rebuy]of items){if(state.profiles[who][id]){skipped++;continue}
state.profiles[who][id]={tried:tried||Boolean(grade),grade,rebuy,notes:'',store:'',updated:new Date().toISOString()};added++}
persist();pendingLink=null;$('#share-import').hidden=true;history.replaceState({},'',location.pathname+location.search);
render();toast(`${added} freie Einträge importiert, ${skipped} bestehende geschützt.`)}
function replaceSnapshot(){
 if(!pendingLink)return;
 const {who,items}=pendingLink;
 const count=items.filter(([id])=>Boolean(state.profiles[who][id])).length;
 const message=`Der Link behauptet, von ${names[who]} zu stammen. Es gibt keine Identitätsprüfung. Willst du ${items.length} Bewertungen in ${names[who]}s Spalte übernehmen (davon ${count} bestehende Bewertungen ändern)? Deine privaten Textnotizen bleiben erhalten.`;
 if(!window.confirm(message))return;
 for(const [id,grade,tried,rebuy] of items){
  const previous=score(id,who);
  state.profiles[who][id]={...previous,tried:tried||Boolean(grade),grade,rebuy,updated:new Date().toISOString()};
 }
 persist();pendingLink=null;$('#share-import').hidden=true;history.replaceState({},'',location.pathname+location.search);render();toast(`${items.length} Bewertungen bewusst aktualisiert. Lokale Textnotizen bleiben erhalten.`);
}
function download(filename,dataText){const blob=new Blob([dataText],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000)}
function exportData(){download('GOOD_THINGS_Mikel_Huong_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({kind:'good-things-v1',exported_at:new Date().toISOString(),...state},null,2)+'\n');toast('Deine vollständige private JSON-Datei ist exportiert.')}
function openFile(ev){const file=ev.target.files?.[0];ev.target.value='';if(!file)return;if(file.size>1000000){toast('Importdatei zu groß (max. 1 MB).');return}
const reader=new FileReader();reader.onload=()=>{let raw;try{raw=JSON.parse(String(reader.result))}catch{toast('Ungültige JSON-Datei.');return}
if(raw.kind!=='good-things-v1'||!raw.profiles){toast('Keine kompatible GOOD THINGS-Datei.');return}
pendingFile={profiles:{mikel:validateProfile(raw.profiles.mikel),huong:validateProfile(raw.profiles.huong)},labels:validateLabel(raw.labels),custom:validateCustom(raw.custom)};
$('#import-preview').textContent=`Import enthält ${Object.keys(pendingFile.profiles.mikel).length} Mikel-, ${Object.keys(pendingFile.profiles.huong).length} Huong-Einträge, ${pendingFile.custom.length} eigene Produkte und ${Object.keys(pendingFile.labels).length} eigene Packungsnotizen. Bestehende Daten werden nicht überschrieben.`;openDialog($('#import-dialog'))};
reader.readAsText(file)}
function importFile(){if(!pendingFile)return;let added=0,skipped=0;for(const who of ['mikel','huong'])for(const [id,r]of Object.entries(pendingFile.profiles[who])){if(state.profiles[who][id]){skipped++;continue}
state.profiles[who][id]=r;added++}
const existing=new Set([...data.products,...state.custom].map(p=>p.id));for(const p of pendingFile.custom)if(!existing.has(p.id)){state.custom.push(p);added++}
for(const [id,v]of Object.entries(pendingFile.labels))if(!state.labels[id])state.labels[id]=v;
catalog=[...data.products,...state.custom];persist();pendingFile=null;closeDialog($('#import-dialog'));fullRefresh();toast(`${added} Einträge importiert; ${skipped} bestehende geschützt.`)}
function saveLabel(id){const box=$('#product-dialog-content');const current=state.labels[id]||{};const result={};
for(const name of ['protein_g','sugars_g','per','made_in','ingredients_origin']){const el=box.querySelector(`[data-label-key="${name}"]`);if(!el)continue;result[name]=name==='protein_g'||name==='sugars_g'?numberOrNull(el.value):el.value.trim()}
state.labels[id]={...current,...result,updated:new Date().toISOString(),source:'reader-submitted package information (not independently verified)'};persist();render();updateDetail();toast('Packungswerte lokal gespeichert — nicht unabhängig geprüft.')}
function saveNotes(id,who){const root=$('#product-dialog-content');const v={};for(const name of ['rebuy','notes','store']){const el=root.querySelector(`[data-note-field="${name}"][data-id="${id}"][data-who="${who}"]`);if(el)v[name]=el.value.slice(0,name==='notes'?500:80)}
recordChange(id,who,v);toast(`${names[who]}s Notizen lokal gespeichert.`)}
function customForm(event){event.preventDefault();if(state.custom.length>=250){toast('Maximal 250 eigene Produkte pro Browser. Bitte exportieren.');return}
const f=new FormData(event.target);const name=String(f.get('name')||'').trim().slice(0,100),brand=String(f.get('brand')||'').trim().slice(0,50);
if(name.length<3||!brand){toast('Bitte Produktname und Marke eintragen.');return}
const custom=validateCustom([{id:'custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),name,brand,category:String(f.get('category')||'My additions'),store:[String(f.get('store')||'')].filter(Boolean),image:{url:safeURL(f.get('image'))},source:{url:safeURL(f.get('source'))},nutrition:{per:f.get('basis'),protein_g:numberOrNull(f.get('protein')),sugars_g:numberOrNull(f.get('sugar'))},production:{made_in:String(f.get('made')||''),ingredients_origin:String(f.get('origin')||'')}}])[0];
if(!custom)return;state.custom.push(custom);catalog=[...data.products,...state.custom];persist();filters.query='';filters.category='all';filters.rating='self';$('#search-products').value='';$('#filter-rating').value='self';pageLimit=24;event.target.reset();closeDialog($('#custom-dialog'));fullRefresh();toast('Produkt zu deinem privaten Regal hinzugefügt.')}
function bind(){
$$('[data-profile]').forEach(btn=>btn.addEventListener('click',()=>changeProfile(btn.dataset.profile)));
$('#hero-share').addEventListener('click',shareSnapshot);$('#share-profile').addEventListener('click',shareSnapshot);
$('#export-list').addEventListener('click',exportData);$('#download-catalog').addEventListener('click',()=>download('GOOD_THINGS_catalog_2026-10-12.json',JSON.stringify(data,null,2)));
$('#import-list').addEventListener('click',()=>$('#import-file').click());$('#import-file').addEventListener('change',openFile);
$('#add-product').addEventListener('click',()=>openDialog($('#custom-dialog')));$('#custom-form').addEventListener('submit',customForm);
$('#confirm-import').addEventListener('click',importFile);
$('#import-snapshot').addEventListener('click',consumeSnapshot);
$('#replace-snapshot').addEventListener('click',replaceSnapshot);
$('#dismiss-snapshot').addEventListener('click',()=>{$('#share-import').hidden=true;pendingLink=null;history.replaceState({},'',location.pathname+location.search)});
$('#load-more').addEventListener('click',()=>{pageLimit+=24;renderGrid()});
$('#search-products').addEventListener('input',e=>{filters.query=e.target.value.trim();pageLimit=24;renderGrid()});
for(const [control,key]of [['filter-category','category'],['filter-store','store'],['filter-rating','rating'],['filter-protein','protein'],['filter-sugar','sugar'],['sort-products','sort']])$('#'+control).addEventListener('change',e=>{filters[key]=e.target.value;pageLimit=24;render()});
$('#category-tabs').addEventListener('click',e=>{const btn=e.target.closest('[data-cat]');if(!btn)return;filters.category=btn.dataset.cat;$('#filter-category').value=filters.category;pageLimit=24;render()});
$('#product-grid').addEventListener('click',e=>{const btn=e.target.closest('[data-detail]');if(!btn)return;detailId=btn.dataset.detail;updateDetail()});
$('#product-dialog-content').addEventListener('click',e=>{
const b=e.target.closest('button');if(!b)return;
if(b.hasAttribute('data-grade')){recordChange(b.dataset.id,b.dataset.who,{grade:b.dataset.grade,tried:Boolean(b.dataset.grade)||score(b.dataset.id,b.dataset.who).tried});return}
if(b.hasAttribute('data-tried')){const id=b.dataset.tried,who=b.dataset.who,r=score(id,who);recordChange(id,who,{tried:!r.tried,grade:r.tried?'':r.grade});return}
if(b.hasAttribute('data-save-notes')){saveNotes(b.dataset.saveNotes,b.dataset.who);return}
if(b.hasAttribute('data-save-label'))saveLabel(b.dataset.saveLabel);
});
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog($('#'+b.dataset.close))));
$$('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d)d.close()});d.addEventListener('close',()=>{if(d.id==='product-dialog')detailId=null})});
window.addEventListener('hashchange',incoming);
}
async function init(){
bind();
try{const response=await fetch('./products.json',{cache:'no-store'});if(!response.ok)throw Error(String(response.status));const json=await response.json();
if(!Array.isArray(json.products)||json.products.length<80)throw Error('catalog malformed');
const ids=new Set();for(const p of json.products){if(!p.id||ids.has(p.id))throw Error('duplicate product '+p.id);ids.add(p.id)}
data=json;hydrate();catalog=[...data.products,...state.custom];showCategories();render();incoming();
}catch(err){$('#product-grid').innerHTML=`<div class="empty-results"><h3>Unser Regal ist gerade nicht erreichbar.</h3><p>Die Daten kannst du weiterhin <a href="./products.json">als JSON herunterladen</a>. ${escape(err.message)}</p></div>`;}
}
window.GQ_RATING_TEST={state:()=>JSON.parse(JSON.stringify(state)),all:()=>catalog.length,filtered:()=>allFiltered().length,nutrition:()=>catalog.filter(p=>p.nutrition?.protein_g!==null).length,score:(id,w)=>score(id,w),sharePreview:()=>{const r=state.profiles[state.active];return Object.entries(r).filter(([id,v])=>v.tried||v.grade).length}};
init();
})();