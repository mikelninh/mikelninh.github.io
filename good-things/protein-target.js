/* GOOD THINGS 3.2 · Your protein, your costs.
 * A product-level price comparison, NOT a nutrition plan, personalised medical advice,
 * a guaranteed store price, or an estimate of all food spending.
 * Daily reference values follow DGE: 0.8g/kg for 19–64, 1.0g/kg from 65;
 * 1.2–2.0g/kg can be appropriate for intensive training depending on the situation.
 */
(function(){
'use strict';
const KEY='goodthings_protein_target_v31'; // keep opted-in preferences from v3.1
const MONTH_DAYS=30;
const FACTORS=[0.8,1,1.2,1.6,2];
const MODES=['example','weight','custom'];
const SOURCE_BARCODE='4067796251999'; // exact dmBio Tofu Natur 200g reference, if listed
const valid=(x,lo,hi)=>Number.isFinite(x)&&x>=lo&&x<=hi;
const parse=x=>{
 if(x===null||x===undefined||String(x).trim()==='')return null;
 const text=String(x).trim().replace(',','.');
 if(!/^\d+(?:\.\d+)?$/.test(text))return null;
 const n=Number(text);return Number.isFinite(n)?n:null;
};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=(n,d=1)=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:d}).format(n);
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Math.round((n+1e-9)*100)/100); // Round at display, not per day
const safeUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:''}catch(_){return ''}};
const defaults=()=>({mode:'example',weight:null,factor:0.8,custom:null,remember:false});
const state=defaults();
const listeners=new Set();
try{
 const stored=JSON.parse(localStorage.getItem(KEY)||'null');
 if(stored?.remember===true){
  state.remember=true;
  state.mode=MODES.includes(stored.mode)?stored.mode:'example';
  state.weight=valid(stored.weight,30,250)?stored.weight:null;
  state.factor=FACTORS.includes(stored.factor)?stored.factor:0.8;
  state.custom=valid(stored.custom,20,300)?stored.custom:null;
 }
}catch(_){}
// Query is an explicit preview from a shared link, not automatically persisted.
// A link containing ?weight=63&factor=1.2 opens the user's calculation directly.
try{
 if(typeof location!=='undefined'&&typeof URL!=='undefined'){
  const params=new URL(location.href).searchParams;
  const w=parse(params.get('weight')),f=parse(params.get('factor'));
  if(valid(w,30,250)){state.mode='weight';state.weight=w;}
  if(FACTORS.includes(f)&&state.mode==='weight')state.factor=f;
  const own=parse(params.get('protein_target'));
  if(valid(own,20,300)){state.mode='custom';state.custom=own;}
 }
}catch(_){}
function target(){
 if(state.mode==='example')return 50;
 if(state.mode==='weight')return valid(state.weight,30,250)?state.weight*state.factor:null;
 return valid(state.custom,20,300)?state.custom:null;
}
function cost(packPrice,packProtein){
 const g=target();
 if(!valid(g,1,500)||!valid(packPrice,0.00001,99999)||!valid(packProtein,0.00001,99999))return null;
 const dailyPacks=Math.ceil(g/packProtein-1e-10);
 const monthG=g*MONTH_DAYS;
 const monthPacks=Math.ceil(monthG/packProtein-1e-10);
 return {
  goal:g,packProtein,monthDays:MONTH_DAYS,monthProtein:monthG,
  pct:packProtein/g*100,
  equivalentCost:packPrice*g/packProtein,
  monthlyEquivalentCost:packPrice*monthG/packProtein,
  fullPacks:dailyPacks,fullPackCost:packPrice*dailyPacks,wholeProtein:packProtein*dailyPacks,
  monthlyFullPacks:monthPacks,monthlyFullPackCost:packPrice*monthPacks,monthlyWholeProtein:packProtein*monthPacks
 };
}
function save(){
 try{
  if(state.remember)localStorage.setItem(KEY,JSON.stringify(state));
  else localStorage.removeItem(KEY);
 }catch(_){}
}
function broadcast(){
 save();
 for(const callback of listeners)try{callback()}catch(err){console.warn('Protein target update failed',err)}
}
function set(name,x){
 if(name==='mode'&&MODES.includes(x))state.mode=x;
 else if(name==='weight'){
  const w=parse(x);state.weight=valid(w,30,250)?w:null;state.mode='weight';
 }
 else if(name==='factor'){
  const factor=parse(x);
  if(!FACTORS.includes(factor))return false;
  state.factor=factor;state.mode='weight';
 }
 else if(name==='custom'){
  const g=parse(x);state.custom=valid(g,20,300)?g:null;state.mode='custom';
 }
 else if(name==='remember')state.remember=Boolean(x);
 else if(name==='reset')Object.assign(state,defaults());
 else return false;
 broadcast();return true;
}
const shortcut=(mode,label)=>'<button type="button" data-gt-target-mode="'+mode+'" class="'+(state.mode===mode?'active':'')+'" aria-pressed="'+(state.mode===mode)+'">'+label+'</button>';
const gramOptions=[
 [0.8,'0,8 g/kg · DGE 19–64'],[1,'1,0 g/kg · DGE ab 65'],
 [1.2,'1,2 g/kg · Sport'],[1.6,'1,6 g/kg · Sport'],[2,'2,0 g/kg · Sport']
];
function gramsForPack(p){
 if(!p||!valid(p.nutrition?.protein,0.01,100))return null;
 const q=String(p.quantity||'').replaceAll(',','.').replaceAll('×','x').toLowerCase().trim().split('(')[0];
 let match=q.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|g|l|ml)\b/);
 let total=null;
 if(match)total=Number(match[1])*Number(match[2])*(['kg','l'].includes(match[3])?1000:1);
 else{
  match=q.match(/(\d+(?:\.\d+)?)\s*(kg|g|l|ml)\b/);
  if(match)total=Number(match[1])*(['kg','l'].includes(match[2])?1000:1);
 }
 return valid(total,1,200000)?p.nutrition.protein*total/100:null;
}
function reference(){
 const p=(window.GT_CATALOG||[]).find(x=>String(x.barcode||'')===SOURCE_BARCODE&&String(x.store||'').toUpperCase()==='DM'&&x.vegan_status==='source_checked');
 const source=(window.GT_RETAIL_PRICE_SNAPSHOTS||[]).find(x=>String(x.barcode||'')===SOURCE_BARCODE&&x.source_type==='official_online'&&String(x.store||'').toLowerCase()==='dm online');
 const protein=gramsForPack(p);
 if(!p||!source||!valid(protein,0.01,99999)||!valid(source.price,0.01,9999)||!safeUrl(source.source)||!/^\d{4}-\d\d-\d\d$/.test(source.date||''))return null;
 const c=cost(source.price,protein);
 return c?{p,price:source.price,source,c}:null;
}
function referenceHtml(){
 const ref=reference();
 if(!ref)return '<section class="gt-day-reference gt-day-reference-empty"><strong>Preisbeispiel noch nicht verfügbar.</strong><p>Zum Berechnen benötigen wir eine exakt zugeordnete Produktpackung, Proteingehalte und einen datierten Preis. Ergebnisse findest du bei den Produkten mit vollständig belegten Daten.</p></section>';
 const {p,price,source,c}=ref;
 return '<section class="gt-day-reference" aria-label="Beispielhafte Protein-Tages- und Monatskosten">'+
  '<div class="gt-day-reference-heading"><div><span class="gt-day-eyebrow">BEISPIEL · EIN PRODUKT, KEIN ERNÄHRUNGSPLAN</span><h3>'+esc(p.brand)+' · '+esc(p.name)+'</h3><p>'+esc(p.quantity)+' · '+number(c.packProtein)+' g Protein / Packung · '+euro(price)+' / Packung</p></div>'+
  '<a href="'+esc(safeUrl(source.source))+'" target="_blank" rel="noopener noreferrer">dm-Onlinepreis · '+esc(source.date)+' ↗</a></div>'+
  '<div class="gt-day-price-grid">'+
   '<div><span>Rechnerisch / Tag</span><strong>'+euro(c.equivalentCost)+'</strong><small>'+number(c.goal)+' g Protein</small></div>'+
   '<div><span>Rechnerisch / 30 Tage</span><strong>'+euro(c.monthlyEquivalentCost)+'</strong><small>'+number(c.monthProtein)+' g Protein</small></div></div>'+
  '<div class="gt-day-pack-note"><strong>Tatsächlich gekaufte Packungen:</strong> Für einen einzelnen Tag '+c.fullPacks+' Packungen ('+euro(c.fullPackCost)+'). Für 30 Tage zusammen '+c.monthlyFullPacks+' Packungen ('+euro(c.monthlyFullPackCost)+'), wenn du den Vorrat über den Monat verteilst.</div>'+
  '<p class="gt-day-disclaimer">Nur der rechnerische Preis für Protein aus diesem einen Produkt, <strong>nicht</strong> die Kosten für deine gesamte tägliche Ernährung. Kein bestätigter Filialpreis und keine Empfehlung, deinen Bedarf ausschliesslich mit diesem Lebensmittel zu decken.</p></section>';
}
function panel(){
 const t=target(),month=t===null?null:t*MONTH_DAYS;
 const description=state.mode==='weight'?'Körpergewicht × '+number(state.factor)+' g/kg.':'Gewicht und Protein pro kg sind jederzeit direkt änderbar.';
 return '<section class="gt-day-target" aria-label="Mein persönlicher Protein-Kostenrechner">'+
  '<div class="gt-day-target-top"><div><span class="gt-day-eyebrow">GOOD THINGS · MEIN PROTEIN-BUDGET</span><h2>How much does my <em>protein cost?</em></h2><p>Setze dein Gewicht und deinen Faktor. Sieh Tag und Monat sofort nebeneinander.</p></div>'+
  '<div class="gt-day-target-number"><strong aria-live="polite">'+(t===null?'–':number(t))+'<span> g</span></strong><small>'+(t===null?'Gewicht eingeben':'Protein / Tag')+'</small></div></div>'+
  '<div class="gt-day-fields gt-day-fields-visible">'+
   '<label for="gtGoalWeight">Dein Gewicht (kg)<input id="gtGoalWeight" type="number" min="30" max="250" step="0.1" inputmode="decimal" data-gt-target-field="weight" placeholder="z. B. 63" value="'+(state.weight??'')+'"></label>'+
   '<label for="gtGoalFactor">Protein pro kg Körpergewicht<select id="gtGoalFactor" data-gt-target-field="factor">'+gramOptions.map(([v,label])=>'<option value="'+v+'" '+(state.factor===v?'selected':'')+'>'+esc(label)+'</option>').join('')+'</select></label></div>'+
  '<div class="gt-day-modes" role="group" aria-label="Alternativen zum Körpergewicht">'+shortcut('weight','Mein Körpergewicht')+shortcut('example','50 g Beispiel')+shortcut('custom','Eigenes Gramm-Ziel')+'</div>'+
  (state.mode==='custom'?'<div class="gt-day-fields"><label for="gtGoalCustom">Eigenes Proteinziel (g pro Tag)<input id="gtGoalCustom" type="number" min="20" max="300" step="0.5" inputmode="decimal" data-gt-target-field="custom" placeholder="z. B. 100" value="'+(state.custom??'')+'"></label></div>':'')+
  '<div class="gt-day-target-summary" aria-live="polite"><div><span>Mein Tagesziel</span><strong>'+(t===null?'—':number(t)+' g')+'</strong></div><div><span>Für 30 Tage</span><strong>'+(month===null?'—':number(month)+' g')+'</strong></div></div>'+
  '<p class="gt-day-explain">'+esc(description)+' '+(state.mode==='weight'?'DGE: 0,8 g/kg bei Erwachsenen unter 65 bzw. 1,0 g/kg ab 65; Sportwerte können individuell abweichen.':'Das 50-g-Beispiel ist keine allgemeingültige Empfehlung.')+'</p>'+
  referenceHtml()+
  '<div class="gt-day-privacy"><label><input type="checkbox" data-gt-target-remember '+(state.remember?'checked':'')+'> Einstellung nur auf diesem Gerät merken</label><button type="button" data-gt-target-reset>Zurücksetzen</button></div>'+
  '<p class="gt-day-method"><strong>So rechnen wir:</strong> Packungspreis × Tagesprotein ÷ Protein je Packung. 30-Tage-Kosten = Tageskosten × 30; bei ganzen Packungen runden wir die Packungszahl auf. Getränke und Trockenware unterscheiden sich in Zubereitung und Gewicht. Das ist kein vollständiger Tagesernährungsplan. <a href="https://www.dge.de/wissenschaft/referenzwerte/protein/" target="_blank" rel="noopener noreferrer">DGE-Referenzwerte ↗</a> · <a href="https://www.dge.de/presse/meldungen/2020/positionspapier-zur-proteinzufuhr-im-sport/" target="_blank" rel="noopener noreferrer">Sport & Protein ↗</a></p>'+
 '</section>';
}
function metric(packPrice,packProtein,origin){
 const c=cost(packPrice,packProtein);
 if(!c)return '<span class="gt-day-empty">–</span><small>'+(target()===null?'Persönliches Ziel eingeben':'Preis oder Proteindaten fehlen')+'</small>';
 return '<div class="gt-day-metric-grid"><div><small>Tag · rechnerisch</small><strong class="gt-day-cost-main">'+euro(c.equivalentCost)+'</strong></div>'+
 '<div><small>30 Tage · rechnerisch</small><strong class="gt-day-cost-main">'+euro(c.monthlyEquivalentCost)+'</strong></div></div>'+
 '<small>für '+number(c.goal)+' g / Tag · '+number(c.monthProtein)+' g / 30 Tage</small>'+
 '<span class="gt-day-whole">Ganze Packungen: '+c.fullPacks+'/Tag ('+euro(c.fullPackCost)+') · '+c.monthlyFullPacks+'/30 Tage ('+euro(c.monthlyFullPackCost)+')</span>'+
 (origin?'<small>'+esc(origin)+'</small>':'');
}
function subscribe(fn){if(typeof fn==='function')listeners.add(fn);return()=>listeners.delete(fn)}
document.addEventListener('click',e=>{
 const mode=e.target.closest?.('[data-gt-target-mode]');
 const reset=e.target.closest?.('[data-gt-target-reset]');
 if(mode){e.preventDefault();set('mode',mode.dataset.gtTargetMode)}
 if(reset){e.preventDefault();set('reset')}
});
document.addEventListener('change',e=>{
 const field=e.target.closest?.('[data-gt-target-field]');
 const remember=e.target.closest?.('[data-gt-target-remember]');
 if(field)set(field.dataset.gtTargetField,field.value);
 if(remember)set('remember',remember.checked);
});
window.GT_PROTEIN_TARGET={state,target,cost,reference,referenceHtml,panel,metric,subscribe,set,number,euro,monthDays:MONTH_DAYS};
})();