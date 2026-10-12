/* WUNDERPOST 001 / Mikel & Huong. One browser, two editable personal columns.
   User-entered ratings are not identity-verified or a verified product review.
   No ad tracker, affiliate redirect, subscriber database or remote rating API. */
(()=>{
'use strict';
const data=window.GQ_LETTER; if(!data){document.body.insertAdjacentHTML('afterbegin','<p role="alert">The letter data could not load.</p>');return}
const $=(q,base=document)=>base.querySelector(q), $$=(q,base=document)=>Array.from(base.querySelectorAll(q));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const current=new URL(location.href);
const validLang=s=>['de','en','vi'].includes(s)?s:'en';
const storageKey='gq-wunderpost-001-duo-draft';
const safeGet=k=>{try{return localStorage.getItem(k)}catch{return null}};
const safeSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
let lang=validLang(current.searchParams.get('lang')||safeGet('gq-letter-lang')||'en');
const validIds=new Set(data.products.filter(p=>p.status!=='not_vegan').map(p=>p.id));
const ranks=['','S','A','B','C'];
let ratings={mikel:{},huong:{}};
try{const prev=JSON.parse(safeGet(storageKey)||'{}');for(const who of ['mikel','huong'])for(const [id,value]of Object.entries(prev[who]||{}))if(validIds.has(id)&&ranks.includes(value))ratings[who][id]=value}catch(e){}
let snapshot=false;
const shared=current.searchParams.get('tiers');
if(shared&&shared.length<=380){
  const parsed={mikel:{},huong:{}};
  const parts=shared.split(',');
  if(parts.length<=validIds.size){
   for(const item of parts){const m=item.match(/^([a-z]+):([SABC-])([SABC-])$/);if(!m||!validIds.has(m[1]))continue;if(m[2]!=='-')parsed.mikel[m[1]]=m[2];if(m[3]!=='-')parsed.huong[m[1]]=m[3];snapshot=true;}
   if(snapshot){ratings=parsed;safeSet(storageKey,JSON.stringify(ratings));}
  }
}
function t(key){return data.i18n[lang][key]||data.i18n.en[key]||key}
function announce(message){const el=$('#toast');el.textContent=message;clearTimeout(announce.timer);announce.timer=setTimeout(()=>el.textContent='',3200)}
function relabel(){
  document.documentElement.lang=lang;$('#story-text').lang=lang;
  $$('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;el.textContent=t(key)});
  $$('[data-lang]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===lang)));
  document.title=t('hero')+' '+t('heroEm')+' — WUNDERPOST 001 · Mikel & Huong';
}
function productArt(p){
 const photo=p.photo?.src;
 const usable=photo&&/\.(png|jpg|jpeg|webp)(?:\?|$)/i.test(photo);
 const safePhoto=usable?esc(photo):'';
 const imageBlock=usable?`<img class="real-packshot" src="${safePhoto}" alt="${esc(p.brand+' '+p.name+' — product packaging photo; check actual pack before purchase')}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.hidden=true;this.parentElement.classList.add('image-unavailable')">`:'';
 return `<div class="product-art photo-art" style="--tile:${esc(p.tone)}">${imageBlock}<span class="photo-fallback" aria-hidden="true">${esc(p.brand+' '+p.name)}</span><a class="photo-credit" href="${esc(p.photo?.url||p.source)}" target="_blank" rel="noopener noreferrer">Image/source ↗</a></div>`;
}
function options(selected){
  const labels=[t('noGrade'),t('sTier'),t('aTier'),t('bTier'),t('cTier')];
  return ranks.map((value,i)=>`<option value="${value}" ${selected===value?'selected':''}>${esc(labels[i])}</option>`).join('');
}
function makeCards(){
 const eligible=data.products.filter(p=>validIds.has(p.id));
 $('#product-grid').innerHTML=eligible.map(p=>`<article class="product-card" data-product="${esc(p.id)}">${productArt(p)}
   <div class="product-info"><span class="brand-label">${esc(p.brand.toUpperCase())} · ${esc(p.category)}</span><h3>${esc(p.name)}</h3>
   <p class="desc">${esc(p.summary[lang]||p.summary.en)}</p><p class="evidence-tag">${esc(t(p.status==='manufacturer'?'statusManufacturer':p.status==='market'?'statusMarket':'statusRetailer'))}</p>
   <a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">${t('productLink')} ↗</a></div>
   <div class="ratings">${['mikel','huong'].map(who=>`<label>${who==='mikel'?'MIKEL':'HUONG'}<select data-tier-person="${who}" data-tier-product="${esc(p.id)}" aria-label="${who} · ${esc(p.name)} · ${esc(t('grade'))}" data-has-tier="${Boolean(ratings[who][p.id])}">${options(ratings[who][p.id]||'')}</select></label>`).join('')}</div></article>`).join('');
 $$('select[data-tier-person]').forEach(select=>select.addEventListener('change',e=>{const {tierPerson,tierProduct}=e.target.dataset,value=e.target;
 if(value.value&&!ranks.includes(value.value))return;ratings[tierPerson][tierProduct]=value.value; if(!value.value)delete ratings[tierPerson][tierProduct];
 value.dataset.hasTier=String(Boolean(value.value)); const saved=safeSet(storageKey,JSON.stringify(ratings)); snapshot=false;$('#snapshot-note').hidden=true;updateComparison();$('#share-output').hidden=true;if(!saved)announce(t('ratingNote'));
 }));
}
function updateComparison(){
 for(const who of ['mikel','huong']){
  const el=$('#'+who+'-summary');const rows=data.products.filter(p=>validIds.has(p.id)&&ratings[who][p.id]).sort((a,b)=>ranks.indexOf(ratings[who][a.id])-ranks.indexOf(ratings[who][b.id]));
  el.innerHTML=rows.length?rows.map(p=>`<div class="tier-entry"><b>${esc(ratings[who][p.id])}</b><span>${esc(p.name)}</span></div>`).join(''):`<p class="empty">${esc(t('noRatings'))}</p>`;
 }
}
function makeShareURL(){
 const u=new URL(location.href);u.hash='shelf';u.searchParams.set('lang',lang);
 const grades=data.products.filter(p=>validIds.has(p.id)).map(p=>{const one=ratings.mikel[p.id]||'-',two=ratings.huong[p.id]||'-';return one==='-'&&two==='-'?null:`${p.id}:${one}${two}`}).filter(Boolean);
 if(grades.length)u.searchParams.set('tiers',grades.join(','));else u.searchParams.delete('tiers');
 return u.href;
}
async function shareLink(url,title){
 if(navigator.share){
  try{await navigator.share({title,url});return}catch(e){if(e.name==='AbortError')return}
 }
 try{if(!navigator.clipboard)throw Error('unavailable');await navigator.clipboard.writeText(url);announce(t('copied'));return}catch(e){}
 $('#share-output').hidden=false;$('#share-url').value=url;$('#share-url').focus();$('#share-url').select();announce(t('shareFallback'));
}
$('#share-letter').addEventListener('click',()=>{const u=new URL(location.href);u.hash='letter';u.searchParams.set('lang',lang);u.searchParams.delete('tiers');shareLink(u.href,'WUNDERPOST 001 · Mikel & Huong')});
$('#share-tiers').addEventListener('click',()=>shareLink(makeShareURL(),'Mikel & Huong — Good Things Tier List'));
$('#copy-share-url').addEventListener('click',async()=>{const x=$('#share-url');try{await navigator.clipboard.writeText(x.value);announce(t('copied'))}catch{x.focus();x.select()}});
$('#reset-tiers').addEventListener('click',()=>{if(!window.confirm(lang==='de'?'Alle Bewertungen dieses Entwurfs löschen?':lang==='vi'?'Xóa mọi điểm trong bản nháp này?':'Remove all grades in this local draft?'))return;ratings={mikel:{},huong:{}};safeSet(storageKey,JSON.stringify(ratings));snapshot=false;$('#snapshot-note').hidden=true;$('#share-output').hidden=true;makeCards();updateComparison()});
$$('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>{lang=validLang(btn.dataset.lang);safeSet('gq-letter-lang',lang);const u=new URL(location.href);u.searchParams.set('lang',lang);try{history.replaceState({},'',u)}catch(e){}relabel();makeCards();updateComparison();window.dispatchEvent(new Event('gq:language-changed'))}));
relabel();makeCards();updateComparison();$('#snapshot-note').hidden=!snapshot;
window.GQ_LETTER_TEST={getRatings:()=>structuredClone(ratings),getLanguage:()=>lang,shareURL:makeShareURL,productIds:()=>[...validIds],getSnapshot:()=>snapshot};
})();