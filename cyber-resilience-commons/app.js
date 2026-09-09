import {CONTROL_CATALOG,TEMPLATES,SCENARIOS,RECOMMENDED_BASELINE} from './data.js'
import {cloneControls,simulate,compareRuns,recommendations,recoveryPlan} from './simulator.js'

const $=s=>document.querySelector(s)
const $$=s=>[...document.querySelectorAll(s)]
let template=TEMPLATES[0]
let scenario=SCENARIOS[0]
let baseline=cloneControls(template.defaults)
let controls=cloneControls(template.defaults)

const fmt=n=>Number(n).toLocaleString(undefined,{maximumFractionDigits:1})

function renderTemplateButtons(){
  $('#templates').innerHTML=TEMPLATES.map(t=>`<button class="choice ${t.id===template.id?'active':''}" data-template="${t.id}"><span>${t.shortLabel}</span><small>${t.description}</small></button>`).join('')
  $$('#templates .choice').forEach(b=>b.onclick=()=>{
    template=TEMPLATES.find(t=>t.id===b.dataset.template)
    baseline=cloneControls(template.defaults)
    controls=cloneControls(template.defaults)
    renderAll()
  })
}

function renderScenarioButtons(){
  $('#scenarios').innerHTML=SCENARIOS.map(s=>`<button class="scenario ${s.id===scenario.id?'active':''}" data-scenario="${s.id}"><strong>${s.label}</strong><small>${s.short}</small></button>`).join('')
  $$('#scenarios .scenario').forEach(b=>b.onclick=()=>{scenario=SCENARIOS.find(s=>s.id===b.dataset.scenario);renderAll()})
}

function renderAssets(){
  $('#orgTitle').textContent=template.label
  $('#orgDesc').textContent=template.description
  $('#assets').innerHTML=template.assets.map(([k,v])=>`<div class="asset"><span>${k}</span><b>${v}</b></div>`).join('')
}

function renderControls(){
  $('#controls').innerHTML=Object.entries(CONTROL_CATALOG).map(([key,c])=>`<label class="control ${controls[key]?'on':''}"><input type="checkbox" data-control="${key}" ${controls[key]?'checked':''}><span class="switch" aria-hidden="true"></span><span><b>${c.label}</b><small>${c.short}</small></span></label>`).join('')
  $$('#controls input').forEach(i=>i.onchange=()=>{controls[i.dataset.control]=i.checked;renderAll(false)})
}

function statusCopy(run){
  if(run.status==='contained') return ['CONTAINED','The first tested boundary stops this scenario before measured impact spreads.']
  if(run.status==='contained-after-impact') return ['CONTAINED AFTER IMPACT','The incident causes some impact before an enabled boundary stops further spread.']
  return ['UNCONTAINED','No enabled boundary stops the full synthetic path. This does not mean a real attack would succeed; it means this planning model has no stop condition configured.']
}

function renderRun(){
  const run=simulate(template,scenario,controls)
  const [label,desc]=statusCopy(run)
  $('#scenarioTitle').textContent=scenario.label
  $('#scenarioDesc').textContent=scenario.short
  $('#verdict').textContent=label
  $('#verdict').className=`verdict ${run.status}`
  $('#verdictDesc').textContent=desc
  const firstMissing=scenario.steps.find(s=>s.blockedBy && !controls[s.blockedBy])?.blockedBy
  $('#harden').disabled=!firstMissing
  $('#harden').textContent=firstMissing?`Enable next boundary: ${CONTROL_CATALOG[firstMissing].label}`:'Scenario already stops at the earliest available boundary'
  $('#harden').onclick=()=>{if(firstMissing){controls[firstMissing]=true;renderAll(false)}}

  $('#timeline').innerHTML=run.steps.map((step,i)=>{
    const gate=step.blockedBy?CONTROL_CATALOG[step.blockedBy]?.label:'Assumed foothold'
    return `<div class="step ${step.status}"><div class="stepNum">${i+1}</div><div><div class="stepTop"><b>${step.title}</b><span>${step.status.replace('-',' ')}</span></div><p>${step.detail}</p><small>${step.blockedBy?'Boundary: '+gate:'Scenario assumption: this step starts compromised'}</small></div></div>`
  }).join('')

  const m=run.metrics
  $('#impact').innerHTML=`
    <div class="metric"><strong>${fmt(m.identities)}</strong><span>identities touched</span></div>
    <div class="metric"><strong>${fmt(m.services)}</strong><span>services reached</span></div>
    <div class="metric"><strong>${fmt(m.datasets)}</strong><span>datasets reached</span></div>
    <div class="metric"><strong>${fmt(m.dataGB)} GB</strong><span>synthetic data exposure</span></div>
    <div class="metric"><strong>${fmt(m.downtimeHours)} h</strong><span>synthetic disruption</span></div>`
}

function renderRecommendations(){
  const recs=recommendations(template,SCENARIOS,controls).slice(0,3)
  $('#priorities').innerHTML=recs.length?recs.map((r,i)=>`<div class="priority"><span>0${i+1}</span><div><b>${CONTROL_CATALOG[r.control].label}</b><p>${CONTROL_CATALOG[r.control].why}</p><small>Changes the modeled outcome in ${r.scenariosImproved}/${SCENARIOS.length} scenarios.</small></div><button data-fix="${r.control}">Enable</button></div>`).join(''):`<div class="empty">All modeled boundaries are enabled. The next step is not another checkbox — it is testing whether these controls actually work in your own authorized environment.</div>`
  $$('#priorities [data-fix]').forEach(b=>b.onclick=()=>{controls[b.dataset.fix]=true;renderAll(false)})
}

function renderCompare(){
  const before=simulate(template,scenario,baseline)
  const after=simulate(template,scenario,controls)
  const d=compareRuns(before,after)
  $('#compare').innerHTML=`
    <div><span>Baseline</span><strong>${statusCopy(before)[0]}</strong></div>
    <div class="arrow">→</div>
    <div><span>Current controls</span><strong>${statusCopy(after)[0]}</strong></div>
    <div class="delta"><b>${Math.max(0,d.impactUnits).toFixed(0)}</b><span>modeled impact units reduced</span></div>`
}

function renderRecovery(){
  const r=recoveryPlan(controls)
  $('#recovery').innerHTML=`
    <div class="recoveryStat"><b>${r.detectAndIsolateMinutes} min</b><span>planning assumption: detect + isolate</span></div>
    <div class="recoveryStat"><b>${r.revokeSessionsMinutes} min</b><span>planning assumption: revoke sessions</span></div>
    <div class="recoveryStat"><b>${r.restoreCriticalServiceHours} h</b><span>planning assumption: restore critical service</span></div>`
}

function renderAll(rebuild=true){
  if(rebuild){renderTemplateButtons();renderScenarioButtons();renderAssets()}
  renderControls();renderRun();renderRecommendations();renderCompare();renderRecovery()
}

$('#recommended').onclick=()=>{controls=cloneControls(RECOMMENDED_BASELINE);renderAll(false)}
$('#reset').onclick=()=>{controls=cloneControls(baseline);renderAll(false)}
$('#print').onclick=()=>window.print()
$('#aboutMethod').onclick=()=>document.querySelector('#method').scrollIntoView({behavior:'smooth'})

renderAll()
