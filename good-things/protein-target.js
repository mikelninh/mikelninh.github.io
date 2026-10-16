/* GOOD THINGS · Protein target value lab
 * Educational cost-equivalent, NOT a nutritional recommendation or daily meal budget.
 * DGE: adults 19–64 0.8g/kg, >=65 1.0g/kg estimate. High-volume sport 1.2–2.0g/kg.
 * Default 50g is an illustrative comparison baseline, not a personal recommendation.
 */
(function(){
'use strict';
const KEY='goodthings_protein_target_v31';
const FACTORS=[0.8,1,1.2,1.6,2];
const allowedMode=['example','weight','custom'];
const valid=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=(n,places=1)=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:places}).format(n);
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n);
const defaultState=()=>({mode:'example',weight:null,factor:0.8,custom:null,remember:false});
const state=defaultState();
try{
 const r=JSON.parse(localStorage.getItem(KEY)||'null');
 if(r?.remember===true){
  state.remember=true;
  state.mode=allowedMode.includes(r.mode)?r.mode:'example';
  state.weight=valid(r.weight,30,250)?r.weight:null;
  state.factor=FACTORS.includes(r.factor)?r.factor:0.8;
  state.custom=valid(r.custom,20,300)?r.custom:null;
 }
}catch(_){}
const listeners=new Set();
function target(){
 if(state.mode==='example')return 50;
 if(state.mode==='weight')return valid(state.weight,30,250)?state.weight*state.factor:null;
 return valid(state.custom,20,300)?state.custom:null;
}
function cost(packPrice,packProtein){
 const goal=target();
 if(!valid(goal,1,500)||!Number.isFinite(packPrice)||packPrice<=0||!Number.isFinite(packProtein)||packProtein<=0)return null;
 const units=Math.ceil(goal/packProtein-1e-9);
 return {goal,packProtein,pct:packProtein/goal*100,equivalentCost:packPrice*goal/packProtein,fullPacks:units,fullPackCost:packPrice*units,wholeProtein:packProtein*units};
}
function save(){
 try{
  if(state.remember)localStorage.setItem(KEY,JSON.stringify(state));
  else localStorage.removeItem(KEY);
 }catch(_){}
}
function broadcast(){save();for(const fn of listeners)try{fn()}catch(e){console.warn('Protein target listener failed',e)}}
function set(name,v){
 if(name==='mode'&&allowedMode.includes(v))state.mode=v;
 else if(name==='factor'&&FACTORS.includes(Number(v)))state.factor=Number(v);
 else if(name==='weight')state.weight=v!==''&&v!==null&&valid(Number(v),30,250)?Number(v):null;
 else if(name==='custom')state.custom=v!==''&&v!==null&&valid(Number(v),20,300)?Number(v):null;
 else if(name==='remember')state.remember=Boolean(v);
 else if(name==='reset')Object.assign(state,defaultState());
 else return false;
 broadcast();return true;
}
const button=(mode,label)=>'<button type="button" data-gt-target-mode="'+mode+'" class="'+(state.mode===mode?'active':'')+'" aria-pressed="'+(state.mode===mode)+'">'+label+'</button>';
function panel(){
 const goal=target();
 const description=state.mode==='example'?'Vergleichswert, kein allgemeingültiger persönlicher Bedarf.':state.mode==='weight'?'Körpergewicht × '+number(state.factor)+' g/kg als Orientierung.':'Dein selbst gewähltes Vergleichsziel, keine medizinische Empfehlung.';
 return '<section class="gt-day-target" aria-label="Protein-Tagesziel und Preisvergleich">'+
 '<div class="gt-day-target-top"><div><span class="gt-day-eyebrow">GOOD THINGS · MEIN PROTEINZIEL</span><h2>Was kosten <em>100 %</em> meines Protein-Tagesziels?</h2><p>Ein nachvollziehbarer Preisvergleich — mit Beispielziel oder eigenem Wert.</p></div>'+
 '<div class="gt-day-target-number"><strong aria-live="polite">'+(goal===null?'–':number(goal))+'<span> g</span></strong><small>'+(goal===null?'Bitte Ziel eingeben':'Protein / Tag')+'</small></div></div>'+
 '<div class="gt-day-modes" role="group" aria-label="Proteinziel festlegen">'+button('example','50 g Beispiel')+button('weight','Nach Körpergewicht')+button('custom','Eigenes Ziel')+'</div>'+
 (state.mode==='weight'?'<div class="gt-day-fields"><label>Bezugsgewicht in kg<input type="number" min="30" max="250" step="0.1" inputmode="decimal" data-gt-target-field="weight" placeholder="z. B. 70" value="'+(state.weight??'')+'"></label>'+
 '<label>Orientierungswert<select data-gt-target-field="factor">'+
 [['0.8','0,8 g/kg · Erwachsene 19–64 (DGE)'],['1','1,0 g/kg · ab 65 (DGE-Schätzwert)'],['1.2','1,2 g/kg · intensiver Sport'],['1.6','1,6 g/kg · intensiver Sport'],['2','2,0 g/kg · intensiver Sport']].map(([v,label])=>'<option value="'+v+'" '+(state.factor===Number(v)?'selected':'')+'>'+esc(label)+'</option>').join('')+'</select></label></div>':'')+
 (state.mode==='custom'?'<div class="gt-day-fields"><label>Dein Vergleichsziel in Gramm pro Tag<input type="number" min="20" max="300" step="1" inputmode="numeric" data-gt-target-field="custom" value="'+(state.custom??'')+'" placeholder="z. B. 110"></label></div>':'')+
 '<p class="gt-day-explain">'+esc(description)+(state.mode==='weight'?' Bei Übergewicht kann das Normalgewicht als Berechnungsgrundlage geeigneter sein. Sportwerte hängen von Trainingsumfang und Ziel ab.':'')+'</p>'+
 '<div class="gt-day-privacy"><label><input type="checkbox" data-gt-target-remember '+(state.remember?'checked':'')+'> Einstellung nur in diesem Browser merken</label><button type="button" data-gt-target-reset>Zurücksetzen</button></div>'+
 '<p class="gt-day-method"><strong>Rechnerisch:</strong> Packungspreis × Tagesziel ÷ Protein pro Packung. Dazu zeigen wir die Kosten für ganze Packungen. <strong>Kein Tagesmenü:</strong> Proteingehalt allein berücksichtigt weder Energie, Portionsgrößen, Proteinqualität noch eine ausgewogene Ernährung. Preise mit Datum und Herkunft prüfen. <a href="https://www.dge.de/wissenschaft/referenzwerte/protein/" target="_blank" rel="noopener noreferrer">DGE-Referenzwerte ↗</a> · <a href="https://www.dge.de/presse/meldungen/2020/positionspapier-zur-proteinzufuhr-im-sport/" target="_blank" rel="noopener noreferrer">DGE-Sport ↗</a></p>'+
 '</section>';
}
function metric(packPrice,packProtein,origin){
 const result=cost(packPrice,packProtein);
 if(!result)return '<span class="gt-day-empty">—</span><small>'+(target()===null?'Tagesziel eingeben':'Preis oder Proteindaten fehlen')+'</small>';
 return '<strong class="gt-day-cost-main">'+euro(result.equivalentCost)+'</strong>'+
 '<small>für '+number(result.goal)+' g Protein · rechnerisch</small>'+
 '<span class="gt-day-whole">Ganze Packungen: '+result.fullPacks+' × '+euro(packPrice)+' = '+euro(result.fullPackCost)+'</span>'+
 (origin?'<small>'+esc(origin)+'</small>':'');
}
function subscribe(fn){if(typeof fn==='function')listeners.add(fn);return()=>listeners.delete(fn)}
// Delegated inputs work in dynamically re-rendered protein pages without duplicate hooks.
document.addEventListener('click',e=>{
 const mode=e.target.closest?.('[data-gt-target-mode]'),reset=e.target.closest?.('[data-gt-target-reset]');
 if(mode){e.preventDefault();set('mode',mode.dataset.gtTargetMode);}
 if(reset){e.preventDefault();set('reset');}
});
document.addEventListener('change',e=>{
 const field=e.target.closest?.('[data-gt-target-field]'),remember=e.target.closest?.('[data-gt-target-remember]');
 if(field){set(field.dataset.gtTargetField,field.value);}
 if(remember){set('remember',remember.checked);}
});
window.GT_PROTEIN_TARGET={state,target,cost,panel,metric,subscribe,set,number,euro};
})();
