/* GOOD THINGS Photo Lab · Client-side resolution inspection, no invented packshots.
 * This is a browser visual QA aid, not an automated claim of correct product identity.
 * Open Food Facts images: CC BY-SA; structured product data: ODbL.
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const all=(window.GT_CATALOG||[]).filter(p=>p.vegan_status!=='non_vegan');
const groups=window.GT_GROUPS||[];
const STORE_KEY='goodthings_photo_audit_v18';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:''}catch(_){return''}};
const hasImage=p=>Boolean(safeUrl(p.image_url)&&['retailer','brand','barcode'].includes(p.image_status));
const view={query:'',category:'all',filter:'all',visible:48,auditing:false,checked:{}};
try{const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');if(saved&&typeof saved==='object'&&saved.checked)view.checked=saved.checked}catch(_){}
function getState(p){
 if(!hasImage(p))return 'missing';
 const item=view.checked[p.id];
 if(!item||item.url!==p.image_url)return 'unchecked';
 return item.status;
}
function photoFor(p){
 if(!hasImage(p))return '';
 const url=safeUrl(p.image_url);
 if(p.source_type==='openfoodfacts'&&/\/front_[a-z]{2}\.\d+\.400\.jpg(?:\?.*)?$/.test(url)){
  return url.replace(/\.400\.jpg(?=\?|$)/,'.full.jpg');
 }
 return url;
}
const placeholder=p=>'<div class="photo-placeholder" aria-label="Kein gesichertes Produktbild">◌</div>';
function card(p){
 const url=safeUrl(p.image_url),state=getState(p),check=view.checked[p.id];
 const source=safeUrl(p.image_source_url||p.source_url);
 const label={missing:'Kein Packshot',unchecked:'Auflösung nicht geprüft',good:'Auflösung ausreichend',low:'Kleine Auflösung / nicht erreichbar'}[state];
 const dims=check&&check.url===p.image_url&&check.width&&check.height?' · '+check.width+'×'+check.height+' px':'';
 return '<article class="photo-entry" data-id="'+esc(p.id)+'">'+(url?'<img src="'+esc(url)+'" loading="lazy" alt="Quellenbild: '+esc(p.brand+' '+p.name)+'" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="photo-placeholder" hidden>◌</div>':placeholder(p))+
 '<span class="photo-status '+state+'">'+label+esc(dims)+'</span>'+
 '<h3>'+esc(p.name)+'</h3><p>'+esc(p.brand)+' · '+esc(p.store)+'</p>'+
 '<div class="photo-links">'+(source?'<a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">Quelle ↗</a>':'')+
 '<a href="./?view=discover&product='+encodeURIComponent(p.id)+'">Produkt ↗</a></div></article>';
}
function filtered(){
 const query=view.query.trim().toLocaleLowerCase('de');
 return all.filter(p=>
 (view.category==='all'||p.category_id===view.category)&&
 (view.filter==='all'||getState(p)===view.filter)&&
 (!query||(p.name+' '+p.brand+' '+p.barcode+' '+p.category+' '+p.store).toLocaleLowerCase('de').includes(query))
 ).sort((a,b)=>{
 const order={missing:0,low:1,unchecked:2,good:3};
 return order[getState(a)]-order[getState(b)]||a.brand.localeCompare(b.brand,'de')||a.name.localeCompare(b.name,'de');
 });
}
function stats(){
 const total=all.length;
 const count=s=>all.filter(p=>getState(p)===s).length;
 const counts={total,linked:total-count('missing'),missing:count('missing'),good:count('good'),low:count('low'),unchecked:count('unchecked')};
 $('photoStats').innerHTML=[
  ['Produkte',counts.total],['Bildquellen',counts.linked],['Auflösung geprüft',counts.good+counts.low],['Bild fehlt',counts.missing]
 ].map(([name,n])=>'<div class="photo-stat"><strong>'+n+'</strong><span>'+name+'</span></div>').join('');
 $('photoProgress').style.width=(counts.linked?(counts.good+counts.low)/counts.linked*100:0)+'%';
 $('photoHelp').textContent=(counts.good+counts.low)+' von '+counts.linked+' vorhandenen Bildquellen geprüft · '+counts.good+' ausreichend aufgelöst · '+counts.low+' unscharf/unerreichbar · '+counts.missing+' fehlen. Auflösung ersetzt keine manuelle Variantenprüfung.';
}
function render(){
 stats();
 const a=filtered();
 $('photoResults').innerHTML=a.slice(0,view.visible).map(card).join('')||'<div class="empty">Keine Produkte für diesen Filter.</div>';
 $('photosMore').hidden=a.length<=view.visible;
 $('photosMore').textContent='Weitere anzeigen ('+Math.max(0,a.length-view.visible)+' übrig) ↓';
}
function persist(){
 try{localStorage.setItem(STORE_KEY,JSON.stringify({checked:view.checked,updated_at:new Date().toISOString()}))}
 catch(_) { /* optional local cache; inspection still works */ }
}
function checkOne(p){
 return new Promise(resolve=>{
  const direct=photoFor(p);
  if(!direct)return resolve({status:'low',width:0,height:0});
  const attempt=(url,next)=>{
   const img=new Image();let finished=false;
   const done=(value)=>{if(finished)return;finished=true;clearTimeout(timer);resolve(value)};
   const timer=setTimeout(()=>next?attempt(next,''):done({status:'low',width:0,height:0}),6500);
   img.onload=()=>{
    if(finished)return;finished=true;clearTimeout(timer);
    const width=img.naturalWidth,height=img.naturalHeight;
    // A full 400px thumbnail is not adequate for a premium large packshot.
    if(width>=450&&height>=450)resolve({status:'good',width,height});
    else if(next)attempt(next,'');
    else resolve({status:'low',width,height});
   };
   img.onerror=()=>{if(finished)return;finished=true;clearTimeout(timer);if(next)attempt(next,'');else resolve({status:'low',width:0,height:0})};
   img.src=url;
  };
  attempt(direct,direct===p.image_url?'':safeUrl(p.image_url));
 });
}
async function auditNext(){
 if(view.auditing)return;
 view.auditing=true;
 const btn=$('auditNext');btn.disabled=true;btn.textContent='Prüfe gerade Packshots …';
 const todo=all.filter(p=>hasImage(p)&&getState(p)==='unchecked').slice(0,30);
 if(!todo.length){btn.textContent='Alle verlinkten Bilder geprüft';btn.disabled=false;view.auditing=false;return}
 for(let i=0;i<todo.length;i+=6){
  const batch=todo.slice(i,i+6);
  const checked=await Promise.all(batch.map(checkOne));
  batch.forEach((p,j)=>{view.checked[p.id]={url:p.image_url,...checked[j],checkedAt:new Date().toISOString()}});
  persist();render();
  btn.textContent='Prüfe '+Math.min(todo.length,i+6)+' / '+todo.length+' …';
 }
 btn.disabled=false;btn.textContent='Nächste 30 Bilder prüfen ↗';view.auditing=false;
}
function exportAudit(){
 const cols=['id','brand','name','store','barcode','image_status','resolution_state','width','height','image_url','image_source_url'];
 const rows=[cols,...all.map(p=>{
 const state=getState(p),c=view.checked[p.id]||{};
 return [p.id,p.brand,p.name,p.store,p.barcode||'',p.image_status||'',state,
 c.url===p.image_url?(c.width||''):'',c.url===p.image_url?(c.height||''):'',p.image_url||'',p.image_source_url||''];
 })];
 const csv=rows.map(row=>row.map(v=>'"'+String(v==null?'':v).replaceAll('"','""')+'"').join(',')).join('\r\n');
 const blob=new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='good-things-photo-audit.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('photoCategory').innerHTML+=[...groups].map(g=>'<option value="'+esc(g.id)+'">'+esc(g.emoji+' '+g.label)+'</option>').join('');
$('photoSearch').addEventListener('input',e=>{view.query=e.target.value;view.visible=48;render()});
$('photoCategory').addEventListener('change',e=>{view.category=e.target.value;view.visible=48;render()});
$('photoFilter').addEventListener('change',e=>{view.filter=e.target.value;view.visible=48;render()});
$('photosMore').addEventListener('click',()=>{view.visible+=48;render()});
$('auditNext').addEventListener('click',auditNext);
$('exportAudit').addEventListener('click',exportAudit);
render();
})();