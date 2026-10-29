/* Human-first guided entry: preserves existing workflow, authority checks and data. */
(()=>{
const guide=document.getElementById('oaGuide');
if(!guide||typeof cases==='undefined'||typeof render!=='function')return;
const $=id=>document.getElementById(id);
const label=(value)=>String(value||'').trim();
const originalRender=render;
function syncGuide(){
 const c=cases[currentCase], r=c?.roles?.[currentRole];
 if(!c||!r)return;
 $('guideCase').textContent=c.title;
 $('guideGoal').textContent=label(c.goal);
 const select=$('guideRole');const options=Object.entries(c.roles);
 if(select.dataset.case!==currentCase||select.options.length!==options.length){
   select.replaceChildren();
   for(const [id,data] of options){const o=document.createElement('option');o.value=id;o.textContent=data.name;select.appendChild(o);}
   select.dataset.case=currentCase;
 }
 select.value=currentRole;
 const title=$('taskTitle')?.textContent||'Nächste Aufgabe ermitteln';
 const action=$('actionBtn');
 const actionable=action&&!action.disabled&&!!action.dataset.task;
 $('guideNext').textContent=actionable?title:'Hier wird sichtbar, wer jetzt gebraucht wird.';
 $('guideAction').textContent=actionable?'Meine Aufgabe ansehen →':'Aktuellen Status ansehen →';
 const state=$('sharedCount')?.textContent||'';
 $('guideProgress').textContent=state;
}
render=function(){originalRender();syncGuide();};
$('guideRole').addEventListener('change',e=>{
 const role=$('roleSelect');role.value=e.target.value;role.dispatchEvent(new Event('change',{bubbles:true}));
});
$('guideAction').addEventListener('click',()=>{
 const target=$('action');target?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
 target?.classList.add('oa-focus');setTimeout(()=>target?.classList.remove('oa-focus'),2300);
});
$('guideReset').addEventListener('click',()=>{$('resetBtn')?.click();syncGuide();});
$('simpleMode').textContent='Einfach';$('proofMode').textContent='Nachweise';
const fold=document.createElement('details');fold.className='oa-details-fold';fold.id='oaDetailsFold';
const summary=document.createElement('summary');summary.textContent='Prozessschritte, Geldfluss und Prüfnachweise ansehen';fold.appendChild(summary);
const shell=document.querySelector('.case-shell');
const strips=[...shell.querySelectorAll(':scope > .info-strip,:scope > .details')];
if(strips.length){shell.insertBefore(fold,strips[0]);for(const strip of strips)fold.appendChild(strip);}
syncGuide();
})();