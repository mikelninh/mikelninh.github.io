(()=>{
  const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  let started=null,timer=null,elapsed=0,trace=[],reviewed=false;
  const pad=n=>String(n).padStart(2,'0');
  const fmt=s=>`${pad(Math.floor(s/60))}:${pad(s%60)}`;
  function renderTimer(){ $('#caseTimer').textContent=fmt(elapsed); $('#heroTimer').textContent=fmt(elapsed); }
  function tick(){ if(!started)return; elapsed=Math.floor((Date.now()-started)/1000); renderTimer(); }
  function stamp(){ const d=new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
  function addTrace(action,detail,kind='ok'){
    trace.push({time:stamp(),action,detail,kind});
    const log=$('#traceLog'); log.innerHTML='';
    trace.forEach(e=>{ const row=document.createElement('div'); row.className=`trace-event ${e.kind==='block'?'block':e.kind==='warn'?'warn':''}`; row.innerHTML=`<span class="trace-time">${e.time}</span><span class="trace-action">${e.action}</span><span class="trace-detail">${e.detail}</span>`; log.appendChild(row); });
    $('#traceCount').textContent=`${trace.length} event${trace.length===1?'':'s'}`;
  }
  function setStatus(text,cls){ const s=$('#caseStatus'); s.textContent=text; s.className=`status-chip ${cls}`; }
  function tab(name){ $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name)); $$('.tab-panel').forEach(p=>p.classList.remove('active')); $(`#${name}Panel`).classList.add('active'); }
  $$('.tab').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));

  $('#startCase').addEventListener('click',()=>{
    if(started)return;
    elapsed=0; renderTimer(); started=Date.now(); timer=setInterval(tick,250); reviewed=false; trace=[];
    $('#traceLog').innerHTML=''; $('#emptyState').classList.add('hidden'); $('#facts').classList.remove('hidden');
    $('#approveDraft').disabled=true; $('#approveDraft').classList.add('disabled'); $('#approveDraft').textContent='Resolve conflict to approve';
    $('#resolveConflict').textContent='Mark reviewed'; setStatus('reconciling','running');
    addTrace('CONTEXT','Encounter bound to synthetic patient DEMO-1842');
    setTimeout(()=>addTrace('READ','FHIR observations · patient binding verified'),180);
    setTimeout(()=>addTrace('READ','LIS microbiology · status semantics preserved'),360);
    setTimeout(()=>addTrace('READ','KIS medication · documented therapy only'),540);
    setTimeout(()=>addTrace('EXTRACT','PDF parsed as untrusted evidence'),720);
    setTimeout(()=>{addTrace('RECONCILE','Allergy contradiction requires human review','warn');setStatus('review required','review');},900);
    setTimeout(()=>addTrace('DRAFT','Source-linked discharge-prep draft prepared'),1080);
  });
  $('#resetCase').addEventListener('click',()=>{
    clearInterval(timer); timer=null; started=null; elapsed=0; reviewed=false; trace=[]; renderTimer();
    $('#emptyState').classList.remove('hidden'); $('#facts').classList.add('hidden'); $('#traceLog').innerHTML='<div class="trace-placeholder">Start the case or trigger a stress test to populate the trace.</div>'; $('#traceCount').textContent='0 events';
    $$('.source-drawer').forEach(x=>x.classList.remove('show')); setStatus('ready','idle'); tab('context');
  });
  $$('.source-link').forEach(b=>b.addEventListener('click',()=>{ const x=$(`#${b.dataset.source}`); x.classList.toggle('show'); if(x.classList.contains('show')) addTrace('SOURCE',`Reviewer opened ${b.dataset.source}`); }));
  $('#resolveConflict').addEventListener('click',()=>{
    reviewed=true; $('#resolveConflict').textContent='✓ Reviewed · current KIS preserved';
    $('#approveDraft').disabled=false; $('#approveDraft').classList.remove('disabled'); $('#approveDraft').textContent='Approve synthetic draft';
    setStatus('reviewed','done'); addTrace('HUMAN','Allergy conflict explicitly reviewed; source lineage retained');
  });
  $('#returnSource').addEventListener('click',()=>{tab('context');$$('.source-drawer').forEach(x=>x.classList.add('show'));addTrace('VERIFY','Supporting source drawers opened from draft');});
  $('#approveDraft').addEventListener('click',()=>{
    if(!reviewed)return; clearInterval(timer); timer=null; started=null; setStatus('approved locally','done'); $('#approveDraft').textContent='✓ Approved locally'; $('#approveDraft').disabled=true; addTrace('APPROVAL','Human approved synthetic draft; no write-back capability exists'); tab('trace');
  });
  $$('mark[data-cite]').forEach(m=>m.addEventListener('click',()=>{tab('context');$(`#${m.dataset.cite}`).classList.add('show');addTrace('VERIFY',`Citation jump → ${m.dataset.cite}`);}));

  const tests={
    'wrong-patient':{state:'BLOCKED',title:'Wrong-patient resource rejected before use.',cls:'blocked',policy:'patient_id must equal encounter-bound identity',user:'No foreign clinical fact is surfaced.',audit:'FHIR resource quarantined · patient mismatch',kind:'block'},
    injection:{state:'QUARANTINED',title:'Document instruction treated as data, not authority.',cls:'blocked',policy:'document text cannot modify agent policy or tool scope',user:'PDF remains viewable; malicious span is flagged.',audit:'prompt-injection pattern isolated from reasoning context',kind:'block'},
    unavailable:{state:'DEGRADED',title:'Unavailable is shown as unavailable — never as negative.',cls:'warned',policy:'source failure must fail visibly',user:'Microbiology panel shows “source unavailable”; draft cannot assert a result.',audit:'LIS timeout · dependent claims suppressed',kind:'warn'},
    stale:{state:'REVIEW',title:'Old renal value cannot satisfy a current pending order.',cls:'warned',policy:'clinical time and freshness are part of correctness',user:'Historical value remains visible and labelled stale; current result stays pending.',audit:'freshness gate prevented silent substitution',kind:'warn'},
    tool:{state:'DENIED',title:'Agent cannot escalate itself into a writer.',cls:'blocked',policy:'write-back is not in delegated capability set',user:'No medication/order/document write occurs.',audit:'tool request denied · capability=clinical.write absent',kind:'block'}
  };
  $$('.stress-button').forEach(b=>b.addEventListener('click',()=>{
    const t=tests[b.dataset.test],r=$('#stressResult'); r.className=`stress-result ${t.cls}`;
    r.innerHTML=`<div class="shield">◇</div><div class="case-label">${t.state}</div><h3>${t.title}</h3><div class="result-list"><div><span>Policy</span><b>${t.policy}</b></div><div><span>User-visible state</span><b>${t.user}</b></div><div><span>Audit</span><b>${t.audit}</b></div></div>`;
    addTrace(t.state,b.querySelector('b').textContent,t.kind);
  }));

  const architecture=$('.architecture');
  if(architecture){
    const section=document.createElement('section'); section.className='capstone-proof'; section.id='proof';
    section.innerHTML=`<div class="shell"><div class="section-kicker">05 · What this capstone proves</div><div class="proof-intro"><h2>One workflow, the full relevant skill stack.</h2><p>I am deliberately not adding unrelated tricks. Every layer below serves the same outcome: useful AI in a high-stakes environment that can be inspected, tested and safely constrained.</p></div><div class="proof-grid">
      <article class="proof-card"><code>GENAI / AGENTS</code><b>Agentic systems</b><p>Tool routing, structured context, source-linked drafting, bounded capabilities, approval states and observable traces.</p></article>
      <article class="proof-card"><code>PYTHON / API</code><b>Backend engineering</b><p>Underlying CareOS uses FastAPI + Pydantic typed contracts, synthetic APIs, readiness endpoints and deployment-mode locks.</p></article>
      <article class="proof-card"><code>FHIR / ISiK</code><b>Healthcare interoperability</b><p>Patient/encounter binding, source-state semantics, FHIR adapters and a provider-side context-layer architecture.</p></article>
      <article class="proof-card"><code>GROUNDING</code><b>Evidence & provenance</b><p>Consequential facts retain source, clinical time, lifecycle state, contradiction status and inspectable evidence.</p></article>
      <article class="proof-card"><code>SECURITY</code><b>Zero-trust AI boundary</b><p>Wrong-patient rejection, deny-by-default tools, no silent write escalation, hostile-document handling and visible source failure.</p></article>
      <article class="proof-card"><code>EVALS</code><b>Evaluation engineering</b><p>Paired clinician tests, synthetic benchmarks, regression scenarios, pending-item retention and safety-stop criteria.</p></article>
      <article class="proof-card"><code>TEST / CI</code><b>Reliability discipline</b><p>Platform and agent red-team suites, locked dependencies, CI checks, CodeQL/SBOM foundations and replayable failures.</p></article>
      <article class="proof-card"><code>PRODUCT / UX</code><b>End-to-end product thinking</b><p>Start from clinician friction, make uncertainty legible, design for fast source checking and measure time returned to care.</p></article>
    </div><div class="proof-footer"><p><strong>Important boundary:</strong> this page is a static interactive application work sample. The linked CareOS repository contains the deeper backend, architecture and test evidence. Neither is approved for clinical use.</p><a href="https://github.com/mikelninh/care-os" target="_blank" rel="noreferrer">Inspect engineering evidence ↗</a></div></div>`;
    architecture.insertAdjacentElement('afterend',section);
  }
  renderTimer();
})();