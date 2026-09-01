import {buildPlan,urgencyLabel} from './plan-engine.js';

const STORAGE_KEY='birth-companion-v1';
const PROFILE_KEY='birth-companion-profile-v1';
const stateNames=['Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen','Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen','Sachsen-Anhalt','Schleswig-Holstein','Thüringen'];
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const saveJSON=(key,val)=>localStorage.setItem(key,JSON.stringify(val));
const fmt=d=>new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'short',year:'numeric'}).format(d);
let profile=readJSON(PROFILE_KEY,null);
let completed=readJSON(STORAGE_KEY,{});

function collectProfile(){return Object.fromEntries(new FormData($('#intake')).entries())}
function validProfile(p){return p.state&&p.birthDate&&p.birthSetting&&p.married&&p.birthParentEmployment&&p.birthParentInsurance&&p.wantsElterngeld&&p.parentalLeave&&p.wantsJointCustody&&p.paternityRecognized}

function renderPlan(){
  if(!profile){showIntake();return}
  const plan=buildPlan(profile,new Date());
  const done=plan.filter(t=>completed[t.id]).length;
  const open=plan.length-done;
  $('#intakeView').hidden=true;$('#planView').hidden=false;
  $('#planTitle').textContent=`Dein Plan: ${open} offen`;
  $('#planMeta').textContent=`${profile.state} · Geburt ${fmt(new Date(profile.birthDate+'T12:00:00'))} · ${done}/${plan.length} erledigt`;
  $('#progressBar').style.width=`${plan.length?Math.round(done/plan.length*100):0}%`;
  const next=plan.find(t=>!completed[t.id]);
  $('#nextCard').innerHTML=next?`<div class="micro">Das Nächste</div><div class="next-kicker">${urgencyLabel(next.urgency)}${next.deadline?` · ungefähr bis ${fmt(next.deadline)}`:''}</div><h2>${next.title}</h2><p>${next.next}</p><a class="primary" href="${next.apply||next.source}" target="_blank" rel="noopener">Offizielle Stelle öffnen ↗</a>`:`<div class="micro">Stand</div><h2>Alles in diesem Plan ist markiert ✓</h2><p>Das heißt nicht automatisch, dass jede Behörde den Vorgang abgeschlossen hat. Prüfe Bescheide und Status der offiziellen Stellen.</p>`;
  $('#taskList').innerHTML=plan.map(renderTask).join('');
  $$('.check').forEach(btn=>btn.addEventListener('click',()=>{completed[btn.dataset.id]=!completed[btn.dataset.id];saveJSON(STORAGE_KEY,completed);renderPlan()}));
  $$('.task-toggle').forEach(btn=>btn.addEventListener('click',()=>btn.closest('.task-card').classList.toggle('open')));
}

function renderTask(t){
  const isDone=!!completed[t.id];
  const deadline=t.deadline?`<span>ca. ${fmt(t.deadline)}</span>`:'';
  return `<article class="task-card ${isDone?'done':''}"><button class="check" data-id="${t.id}" aria-label="${isDone?'Als offen markieren':'Als erledigt markieren'}">${isDone?'✓':''}</button><div class="task-main"><div class="task-top"><span class="urgency u-${t.urgency}">${isDone?'Erledigt':urgencyLabel(t.urgency)}</span><span class="badge">${t.badge}</span>${deadline}</div><h3>${t.title}</h3><p>${t.next}</p><button class="task-toggle secondary">Warum / Details</button><div class="task-details"><p><strong>Warum:</strong> ${t.why}</p>${t.details.map(x=>`<div class="detail-row">${x}</div>`).join('')}<div class="official-actions"><a href="${t.source}" target="_blank" rel="noopener">Quelle ↗</a>${t.apply?`<a href="${t.apply}" target="_blank" rel="noopener">Offiziell erledigen ↗</a>`:''}</div></div></div></article>`;
}

function showIntake(){
  $('#planView').hidden=true;$('#intakeView').hidden=false;
  if(profile)Object.entries(profile).forEach(([k,v])=>{const r=$(`[name="${k}"][value="${v}"]`);if(r)r.checked=true;else{const el=$(`[name="${k}"]`);if(el)el.value=v}})
}
function resetAll(){if(confirm('Lokale Antworten und Fortschritt auf diesem Gerät löschen?')){localStorage.removeItem(PROFILE_KEY);localStorage.removeItem(STORAGE_KEY);profile=null;completed={};showIntake()}}

async function init(){
  try{const catalog=await fetch('./service-catalog.json').then(r=>r.json());$('#reviewDate').textContent=`Quellen geprüft: ${new Intl.DateTimeFormat('de-DE').format(new Date(catalog.lastReviewed+'T12:00:00'))}`}catch{$('#reviewDate').textContent='Quellenkatalog konnte nicht geladen werden.'}
  $('#state').innerHTML='<option value="">Bundesland wählen</option>'+stateNames.map(s=>`<option>${s}</option>`).join('');
  $('#intake').addEventListener('submit',e=>{e.preventDefault();const p=collectProfile();if(!validProfile(p)){alert('Bitte beantworte alle Fragen.');return}profile=p;saveJSON(PROFILE_KEY,profile);renderPlan();window.scrollTo({top:0,behavior:'smooth'})});
  $('#editProfile').addEventListener('click',showIntake);$('#reset').addEventListener('click',resetAll);$('#print').addEventListener('click',()=>window.print());
  renderPlan();
}
init();
