const $=s=>document.querySelector(s);
let state=null,brief=null;
const resolved=JSON.parse(localStorage.getItem('open-steward-resolved')||'{}');
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));

async function load(){
 const [healthRes,stateRes]=await Promise.all([fetch('/api/health'),fetch('/api/state')]);
 const health=await healthRes.json();state=await stateRes.json();
 const badge=$('#modeBadge');badge.textContent=health.mode==='live'?`Live · ${health.model}`:'Demo mode · add API secret';badge.className=`mode-badge ${health.mode}`;
 renderAgents();await runReview(true);
}

async function runReview(initial=false,prompt='Run the portfolio review and surface only material decisions.'){
 const btn=$('#runReview');btn.disabled=true;btn.textContent='Reviewing…';
 try{
  const r=await fetch('/api/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
  const data=await r.json();if(!r.ok)throw new Error(data.detail||data.error||'Review failed');
  brief=data;renderBrief();
  if(!initial)$('#assistantOutput').textContent=data.summary;
 }catch(e){$('#assistantOutput').textContent=`Steward error: ${e.message}`}
 finally{btn.disabled=false;btn.textContent='Run portfolio review'}
}

function renderBrief(){
 $('#briefSummary').textContent=brief.summary;
 const health=brief.portfolio_health;
 $('#metrics').innerHTML=`<div class="metric"><span>Active focus</span><b>${esc(health[0]?.project||'—')}</b><small>${esc(health[0]?.stage||'')}</small></div><div class="metric"><span>Portfolio health</span><b>${Math.round(health.reduce((a,p)=>a+p.score,0)/Math.max(1,health.length))}</b><small>Evidence-weighted demo score</small></div><div class="metric"><span>Decisions</span><b>${brief.decisions.length}</b><small>Waiting or recommended</small></div><div class="metric"><span>Autonomous actions</span><b>${brief.autonomous_actions.length}</b><small>Bounded and reversible</small></div>`;
 list('#actionsList',brief.autonomous_actions);list('#risksList',brief.risks);list('#opportunitiesList',brief.opportunities);
 renderProjects();renderDecisions();
}
function list(sel,items){$(sel).innerHTML=items.map(x=>`<li>${esc(x)}</li>`).join('')}
function renderProjects(){
 $('#projects').innerHTML=brief.portfolio_health.map(p=>`<article class="project"><div class="project-top"><div><h3>${esc(p.project)}</h3><p>${esc(p.current_focus)}</p></div><span class="score">${p.score}</span></div><div class="bar"><i style="width:${p.score}%"></i></div></article>`).join('');
}
function renderAgents(){
 $('#agents').innerHTML=state.agents.map((a,i)=>`<article class="agent"><span class="agent-icon">${esc(a.name[0])}</span><div><b>${esc(a.name)}</b><span>${esc(a.role)}</span><small>${esc(a.owns)}</small></div></article>`).join('');
}
function renderDecisions(){
 $('#decisionCount').textContent=`${brief.decisions.length} packets`;
 $('#decisions').innerHTML=brief.decisions.map(d=>`<article class="decision ${resolved[d.id]?'resolved':''}" data-id="${esc(d.id)}"><div><h3>${esc(d.title)}</h3><p>${esc(d.recommendation)}</p><div class="decision-meta"><span class="chip">${esc(d.project)}</span><span class="chip ${d.approval_level==='automatic'?'auto':'gated'}">${esc(d.approval_level.replace('_',' '))}</span><span class="chip">${esc(d.reversibility)} reversibility</span></div>${d.approval_level==='approval_required'&&!resolved[d.id]?`<div class="decision-actions"><button class="approve" data-action="approve" data-id="${esc(d.id)}">Approve</button><button class="reject" data-action="reject" data-id="${esc(d.id)}">Reject</button></div>`:''}</div><div class="confidence">${d.confidence}%</div></article>`).join('');
 document.querySelectorAll('.decision').forEach(el=>el.addEventListener('click',e=>{if(e.target.dataset.action)return;openDecision(el.dataset.id)}));
 document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();resolveDecision(b.dataset.id,b.dataset.action)}));
}
function resolveDecision(id,action){resolved[id]=action;localStorage.setItem('open-steward-resolved',JSON.stringify(resolved));renderDecisions();$('#assistantOutput').textContent=`Decision ${action}d locally. V0.1 records browser approval only; no external action was executed.`}
function openDecision(id){
 const d=brief.decisions.find(x=>x.id===id);if(!d)return;
 $('#dialogContent').innerHTML=`<p class="kicker">${esc(d.project)}</p><h2>${esc(d.title)}</h2><p>${esc(d.rationale)}</p><dl><dt>Recommendation</dt><dd>${esc(d.recommendation)}</dd><dt>Expected impact</dt><dd>${esc(d.expected_impact)}</dd><dt>Cost</dt><dd>${esc(d.cost)}</dd><dt>Reversibility</dt><dd>${esc(d.reversibility)}</dd><dt>Confidence</dt><dd>${d.confidence}%</dd><dt>Owner</dt><dd>${esc(d.owner)}</dd><dt>Approval</dt><dd>${esc(d.approval_level)}</dd></dl><h3>Next actions</h3><ul>${d.next_actions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
 $('#decisionDialog').showModal();
}
$('#decisionDialog .close').onclick=()=>$('#decisionDialog').close();
$('#runReview').onclick=()=>runReview(false);
$('#askForm').addEventListener('submit',async e=>{e.preventDefault();const prompt=$('#askInput').value.trim();if(!prompt)return;$('#assistantOutput').textContent='Aster is preparing a decision-focused review…';await runReview(false,prompt)});
load().catch(e=>{$('#briefSummary').textContent=`Could not load Open Steward: ${e.message}`});
