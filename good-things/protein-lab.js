/* GOOD THINGS · Protein per Euro Lab, v2.8.
 * No guessed numbers: source-backed food nutrients plus clearly labeled user-entered shelf prices.
 */
(function(){
'use strict';
const KEY='goodthings_protein_lab_v28';
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=(window.GT_CATALOG||[]).filter(p=>p.vegan_status!=='non_vegan');
const store=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}};
let values=store(),filter='all',query=(()=>{try{const id=new URL(location.href).searchParams.get('product');return (window.GT_CATALOG||[]).find(p=>p.id===id)?.name||''}catch(_){return''}})(),onlyComplete=false,loadBusy=false;const OFF_KEY='goodthings_protein_source_v28';let sourceValues={};try{sourceValues=JSON.parse(localStorage.getItem(OFF_KEY)||'{}')||{}}catch(_){}
const num=v=>{if(v===null||v===undefined||v==='')return null;const x=Number(String(v).replace(',','.'));return Number.isFinite(x)&&x>=0?x:null};
const local=p=>values[p.id]||{};
function quantity(p){
 const q=String(p.quantity||'').replace(/,/g,'.').toLowerCase().replace(/\s+/g,'');
 const match=q.match(/(?:(\d+(?:\.\d+)?)x)?(\d+(?:\.\d+)?)(kg|g|ml|l)(?![a-z])/);
 if(!match)return null;
 const multiplier=Number(match[1]||1),amount=Number(match[2]);
 const factor={kg:1000,g:1,ml:1,l:1000}[match[3]];
 const total=multiplier*amount*factor;
 return total>0&&total<15000?total:null;
}
function protein(p){return num(local(p).protein??p.nutrition?.protein??sourceValues[p.barcode]?.protein)}
function mass(p){return num(local(p).quantity)??quantity(p)}
function price(p){return num(local(p).price)}
function score(p){const v=protein(p),w=mass(p),eur=price(p);return v!==null&&w!==null&&eur>0?v*w/(100*eur):null}
function fmt(x,d=1){return x===null||!Number.isFinite(x)?'—':new Intl.NumberFormat('de-DE',{maximumFractionDigits:d}).format(x)}
function updated(p){
 const x=local(p);
 if(x.protein!=null)return 'Nährwert: eigene Etikettangabe';
 return p.nutrition?.protein!=null?'Nährwert: '+(p.nutrition_source_url?'Open Food Facts / Quelle':'Katalogquelle'):sourceValues[p.barcode]?.protein!=null?'Nährwert: live Open Food Facts, EAN '+esc(p.barcode):'Nährwert fehlt';
}
function render(){
 const items=list.filter(p=>(filter==='all'||p.category_id===filter)&&(!query||(p.brand+' '+p.name+' '+p.store).toLowerCase().includes(query.toLowerCase())))
 .map(p=>({p,ratio:score(p)})).filter(x=>!onlyComplete||x.ratio!==null)
 .sort((a,b)=>a.ratio!==null&&b.ratio!==null?b.ratio-a.ratio:a.ratio!==null?-1:b.ratio!==null?1:a.p.brand.localeCompare(b.p.brand,'de')||a.p.name.localeCompare(b.p.name,'de'));
 const ready=items.filter(x=>x.ratio!==null).length;
 const categories=[...new Map(list.map(p=>[p.category_id,p.category])).entries()].sort((a,b)=>a[1].localeCompare(b[1],'de'));
 $('#proteinRoot').innerHTML='<section class="pl-hero"><span>✳ GOOD THINGS · THE SMART PANTRY</span><h1>More protein.<br><em>Less money.</em></h1><p>Der faire Vergleich: Wie viele Gramm Protein bekommst du für einen Euro? Wir zeigen nur berechenbare Werte. Preise ohne aktuelle Quellen sind nicht erfunden – du kannst deinen eigenen Kassenbonpreis eingeben.</p></section>'+
 '<section class="pl-explainer"><div><strong>Protein pro Euro</strong><p>(Protein je 100 g × Packungsinhalt / 100) ÷ Packungspreis. Für Getränke rechnen wir mit ml statt g; die Rechnung ist eine Näherung auf Grundlage der Deklaration je 100 ml.</p></div><div><strong>Wirklich vergleichbar?</strong><p>Vergleiche Tofu eher mit Tofu und Drinks mit Drinks. Berücksichtige Portionsgröße, Qualität, Geschmack, Zubereitung und ggf. den Preis je Kilogramm. Kein Gesundheitsranking.</p></div></section>'+
 '<div class="pl-filters"><label>Kategorie<select id="plCategory"><option value="all">Alle Kategorien</option>'+categories.map(([id,name])=>'<option value="'+esc(id)+'" '+(id===filter?'selected':'')+'>'+esc(name)+'</option>').join('')+'</select></label><label>Produkt suchen<input id="plSearch" type="search" value="'+esc(query)+'" placeholder="Tofu, Seitan, Linsen, Vemondo..."></label><label class="pl-check"><input id="plOnly" type="checkbox" '+(onlyComplete?'checked':'')+'> Nur berechenbare Produkte</label></div>'+
 '<div class="pl-count"><strong>'+ready+'</strong> berechenbare Produkte in dieser Auswahl · <strong>'+items.length+'</strong> insgesamt · Preise von dir eingegeben, keine Live-Angebote</div><button class="pl-nutrition-button" id="plFetchNutrition" type="button" '+(loadBusy?'disabled':'')+'>'+(loadBusy?'Prüfe Open Food Facts …':'✳ 25 fehlende EAN-Nährwerte aus Open Food Facts prüfen')+'</button>'+
 '<div class="pl-table-wrap"><table class="pl-table"><thead><tr><th>Produkt</th><th>Protein / 100 g/ml</th><th>Packungsinhalt</th><th>Preis €</th><th>Protein / €</th><th></th></tr></thead><tbody>'+
 items.slice(0,180).map(({p,ratio})=>{const v=local(p),can=ratio!==null;return '<tr><td><strong>'+esc(p.name)+'</strong><small>'+esc(p.brand)+' · '+esc(p.store)+'</small><small>'+esc(updated(p))+'</small></td>'+
 '<td><input aria-label="Protein in g je 100 für '+esc(p.name)+'" data-pl="protein" data-id="'+esc(p.id)+'" placeholder="'+(p.nutrition?.protein!=null?fmt(p.nutrition.protein):'unbekannt')+'" value="'+esc(v.protein??'')+'" inputmode="decimal"></td>'+
 '<td><input aria-label="Packungsmenge für '+esc(p.name)+'" data-pl="quantity" data-id="'+esc(p.id)+'" placeholder="'+(quantity(p)??'g/ml?')+'" value="'+esc(v.quantity??'')+'" inputmode="decimal"></td>'+
 '<td><input aria-label="Dein Kaufpreis in Euro für '+esc(p.name)+'" data-pl="price" data-id="'+esc(p.id)+'" placeholder="€ vom Bon" value="'+esc(v.price??'')+'" inputmode="decimal"></td>'+
 '<td class="pl-score">'+(can?'<strong>'+fmt(ratio,2)+' g</strong>':'<span>—</span>')+'</td>'+
 '<td><a href="./?view=discover&product='+encodeURIComponent(p.id)+'">Produkt ↗</a></td></tr>'}).join('')+'</tbody></table></div>'+
 '<p class="pl-disclaimer">Die Eingaben werden nur in diesem Browser gespeichert und nicht als offiziell verifizierte Produktdaten ausgegeben. Eine Packung, ein Rezept oder ein Preis kann sich ändern. Fehlende Proteinzahlen kannst du direkt vom Nährwertetikett ergänzen.</p>';
}

async function loadMissingNutrition(){
 if(loadBusy)return;loadBusy=true;render();
 const ids=list.filter(p=>/^\d{8,14}$/.test(String(p.barcode||''))&&protein(p)===null).slice(0,25);
 let checked=0,found=0;
 for(let i=0;i<ids.length;i+=5){
  await Promise.all(ids.slice(i,i+5).map(async p=>{
   const barcode=String(p.barcode);
   try{
    const ctrl=typeof AbortController!=='undefined'?new AbortController():null;
    const timer=ctrl?setTimeout(()=>ctrl.abort(),9000):null;
    let res;try{res=await fetch('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(barcode)+'.json?fields=code,nutriments',{signal:ctrl?.signal})}finally{if(timer)clearTimeout(timer)}
    if(!res.ok)return;
    const json=await res.json();
    if(json.status!==1||String(json.code||json.product?.code)!==barcode)return;
    const n=json.product?.nutriments,v=num(n?.proteins_100g);
    if(v===null||v>100)return;
    sourceValues[barcode]={protein:v,verified_at:new Date().toISOString().slice(0,10),source_url:'https://world.openfoodfacts.org/product/'+barcode};found++;
   }catch(_){}
   finally{checked++}
  }));
 }
 try{localStorage.setItem(OFF_KEY,JSON.stringify(sourceValues))}catch(_){}
 loadBusy=false;render();
 alert('Geprüft: '+checked+' Barcode-Datensätze; '+found+' zusätzliche Proteinangaben gefunden. Fehlende Werte bleiben unbekannt.');
}
document.addEventListener('click',e=>{if(e.target.closest('#plFetchNutrition'))loadMissingNutrition()});
document.addEventListener('change',e=>{
 if(e.target.id==='plCategory'){filter=e.target.value;render();return}
 if(e.target.id==='plOnly'){onlyComplete=e.target.checked;render();return}
 const i=e.target.closest('[data-pl]');if(!i)return;
 const id=i.dataset.id,field=i.dataset.pl,val=i.value.trim(),n=num(val);
 if(val&&(!Number.isFinite(n)||n<0||field==='protein'&&n>100||field==='quantity'&&n>15000||field==='price'&&n>10000)){alert('Bitte eine plausible positive Zahl eingeben.');return}
 values[id]={...(values[id]||{})};
 if(val==='')delete values[id][field];else values[id][field]=n;
 try{localStorage.setItem(KEY,JSON.stringify(values))}catch(_){}
 render();
});
document.addEventListener('input',e=>{if(e.target.id==='plSearch'){query=e.target.value;render();$('#plSearch')?.focus()}});
render();
})();