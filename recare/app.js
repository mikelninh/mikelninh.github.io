(()=>{
  const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  let started=null,timer=null,elapsed=0,trace=[],reviewed=false;
  const pad=n=>String(n).padStart(2,'0'); const fmt=s=>`${pad(Math.floor(s/60))}:${pad(s%60)}`;
  function renderTimer(){ $('#caseTimer').textContent=fmt(elapsed); $('#heroTimer').textContent=fmt(elapsed); }
  function tick(){ if(!started)return; elapsed=Math.floor((Date.now()-started)/1000); renderTimer(); }
  function stamp(){ const d=new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
  function addTrace(action,detail,kind='ok'){
    trace.push({time:stamp(),action,detail,kind}); const log=$('#traceLog'); log.innerHTML='';
    trace.forEach(e=>{ const row=document.createElement('div'); row.className=`trace-event ${e.kind==='block'?'block':e.kind==='warn'?'warn':''}`; row.innerHTML=`<span class="trace-time">${e.time}</span><span class="trace-action">${e.action}</span><span class="trace-detail">${e.detail}</span>`; log.appendChild(row); });
    $('#traceCount').textContent=`${trace.length} event${trace.length===1?'':'s'}`;
  }
  function setStatus(text,cls){ const s=$('#caseStatus'); s.textContent=text; s.className=`status-chip ${cls}`; }
  function tab(name){ $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name)); $$('.tab-panel').forEach(p=>p.classList.remove('active')); $(`#${name}Panel`).classList.add('active'); }
  $$('.tab').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));
  $('#startCase').addEventListener('click',()=>{
    if(started)return; elapsed=0; renderTimer(); started=Date.now(); timer=setInterval(tick,250); reviewed=false; trace=[];
    $('#traceLog').innerHTML=''; $('#emptyState').classList.add('hidden'); $('#facts').classList.remove('hidden');
    $('#approveDraft').disabled=true; $('#approveDraft').classList.add('disabled'); $('#approveDraft').textContent='Resolve conflict to approve'; $('#resolveConflict').textContent='Mark reviewed'; setStatus('reconciling','running');
    addTrace('CONTEXT','Encounter bound to synthetic patient DEMO-1842');
    setTimeout(()=>addTrace('ROUTE','Task routed to bounded discharge-prep workflow'),120);
    setTimeout(()=>addTrace('READ','FHIR observations · patient binding verified'),260);
    setTimeout(()=>addTrace('READ','LIS microbiology · status semantics preserved'),420);
    setTimeout(()=>addTrace('READ','KIS medication · documented therapy only'),580);
    setTimeout(()=>addTrace('EXTRACT','PDF parsed as untrusted evidence'),740);
    setTimeout(()=>{addTrace('RECONCILE','Allergy contradiction requires human review','warn');setStatus('review required','review');},900);
    setTimeout(()=>addTrace('DRAFT','Source-linked discharge-prep draft prepared'),1080);
  });
  $('#resetCase').addEventListener('click',()=>{ clearInterval(timer);timer=null;started=null;elapsed=0;reviewed=false;trace=[];renderTimer();$('#emptyState').classList.remove('hidden');$('#facts').classList.add('hidden');$('#traceLog').innerHTML='<div class="trace-placeholder">Start the case or trigger a stress test to populate the trace.</div>';$('#traceCount').textContent='0 events';$$('.source-drawer').forEach(x=>x.classList.remove('show'));setStatus('ready','idle');tab('context'); });
  $$('.source-link').forEach(b=>b.addEventListener('click',()=>{const x=$(`#${b.dataset.source}`);x.classList.toggle('show');if(x.classList.contains('show'))addTrace('SOURCE',`Reviewer opened ${b.dataset.source}`);}));
  $('#resolveConflict').addEventListener('click',()=>{reviewed=true;$('#resolveConflict').textContent='✓ Reviewed · current KIS preserved';$('#approveDraft').disabled=false;$('#approveDraft').classList.remove('disabled');$('#approveDraft').textContent='Approve synthetic draft';setStatus('reviewed','done');addTrace('HUMAN','Allergy conflict explicitly reviewed; source lineage retained');});
  $('#returnSource').addEventListener('click',()=>{tab('context');$$('.source-drawer').forEach(x=>x.classList.add('show'));addTrace('VERIFY','Supporting source drawers opened from draft');});
  $('#approveDraft').addEventListener('click',()=>{if(!reviewed)return;clearInterval(timer);timer=null;started=null;setStatus('approved locally','done');$('#approveDraft').textContent='✓ Approved locally';$('#approveDraft').disabled=true;addTrace('APPROVAL','Human approved synthetic draft; no write-back capability exists');tab('trace');});
  $$('mark[data-cite]').forEach(m=>m.addEventListener('click',()=>{tab('context');$(`#${m.dataset.cite}`).classList.add('show');addTrace('VERIFY',`Citation jump → ${m.dataset.cite}`);}));
  const tests={
    'wrong-patient':{state:'BLOCKED',title:'Wrong-patient resource rejected before use.',cls:'blocked',policy:'patient_id must equal encounter-bound identity',user:'No foreign clinical fact is surfaced.',audit:'FHIR resource quarantined · patient mismatch',kind:'block'},
    injection:{state:'QUARANTINED',title:'Document instruction treated as data, not authority.',cls:'blocked',policy:'document text cannot modify agent policy or tool scope',user:'PDF remains viewable; malicious span is flagged.',audit:'prompt-injection pattern isolated from reasoning context',kind:'block'},
    unavailable:{state:'DEGRADED',title:'Unavailable is shown as unavailable — never as negative.',cls:'warned',policy:'source failure must fail visibly',user:'Microbiology panel shows “source unavailable”; draft cannot assert a result.',audit:'LIS timeout · dependent claims suppressed',kind:'warn'},
    stale:{state:'REVIEW',title:'Old renal value cannot satisfy a current pending order.',cls:'warned',policy:'clinical time and freshness are part of correctness',user:'Historical value remains visible and labelled stale; current result stays pending.',audit:'freshness gate prevented silent substitution',kind:'warn'},
    tool:{state:'DENIED',title:'Agent cannot escalate itself into a writer.',cls:'blocked',policy:'write-back is not in delegated capability set',user:'No medication/order/document write occurs.',audit:'tool request denied · capability=clinical.write absent',kind:'block'}
  };
  $$('.stress-button').forEach(b=>b.addEventListener('click',()=>{const t=tests[b.dataset.test],r=$('#stressResult');r.className=`stress-result ${t.cls}`;r.innerHTML=`<div class="shield">◇</div><div class="case-label">${t.state}</div><h3>${t.title}</h3><div class="result-list"><div><span>Policy</span><b>${t.policy}</b></div><div><span>User-visible state</span><b>${t.user}</b></div><div><span>Audit</span><b>${t.audit}</b></div></div>`;addTrace(t.state,b.querySelector('b').textContent,t.kind);}));

  const architecture=$('.architecture');
  if(architecture){
    const section=document.createElement('section');section.className='capstone-proof';section.id='proof';
    section.innerHTML=`<div class="shell"><div class="section-kicker">05 · What this capstone proves</div><div class="proof-intro"><h2>One workflow, the full relevant skill stack.</h2><p>This is deliberately matched to the work of a healthcare AI engineer: agents, integration, observability, evaluation, privacy, APIs and product judgment. I am not adding unrelated tricks merely to make the stack look longer.</p></div><div class="proof-grid">
      <article class="proof-card"><code>AGENTS</code><b>Agentic application design</b><p>Task routing, tool calls, context handling, structured drafting, bounded capabilities and explicit human approval.</p></article>
      <article class="proof-card"><code>GROUNDING / RAG</code><b>Grounded AI patterns</b><p>Source-linked claims and citation jumps here; deeper hybrid retrieval + citation verification is proven separately in GitLaw.</p></article>
      <article class="proof-card"><code>PYTHON / FASTAPI</code><b>Backend engineering</b><p>CareOS uses FastAPI + Pydantic typed contracts, synthetic APIs, FHIR routes, readiness endpoints and deployment-mode locks.</p></article>
      <article class="proof-card"><code>FHIR / ISiK</code><b>Healthcare interoperability</b><p>Patient/encounter binding, source-state semantics, FHIR adapters and a provider-side context-layer architecture.</p></article>
      <article class="proof-card"><code>OBSERVABILITY</code><b>Traceable agent behaviour</b><p>Visible routing, reads, extraction, reconciliation, review, denials and approvals — the basis for logs, traces and evaluation metrics.</p></article>
      <article class="proof-card"><code>EVALS</code><b>Evaluation engineering</b><p>Paired clinician tests, task-time metrics, source-check behaviour, safety stops, pending-item retention and regression scenarios.</p></article>
      <article class="proof-card"><code>SECURITY / PRIVACY</code><b>Zero-trust AI boundary</b><p>Wrong-patient rejection, deny-by-default tools, hostile-document handling, no silent write escalation and visible source failure.</p></article>
      <article class="proof-card"><code>TEST / CI</code><b>Reliability discipline</b><p>Platform + agent red-team suites, pinned dependencies, GitHub Actions, CodeQL/SBOM foundations and replayable failures.</p></article>
      <article class="proof-card"><code>WEB / UX</code><b>Cross-stack product delivery</b><p>Responsive interactive UI, async-like state changes, review workflows, edge states and a clinician-first information hierarchy.</p></article>
      <article class="proof-card"><code>PRODUCT</code><b>Outcome-driven thinking</b><p>Start with a real user burden, reduce cognitive/admin work, preserve trust, then measure whether time actually returns to care.</p></article>
      <article class="proof-card"><code>ARCHITECTURE</code><b>Systems thinking</b><p>Separate systems of record, trusted context, untrusted reasoning, policy enforcement, permissions, audit and human authority.</p></article>
      <article class="proof-card"><code>COMMUNICATION</code><b>Technical clarity</b><p>One problem explained at three depths: 90-second demo, engineering evidence and proposal-grade architecture documentation.</p></article>
    </div><div class="proof-footer"><p><strong>Boundary, intentionally explicit:</strong> this browser experience is deterministic and credential-free. The linked CareOS repository now contains a runnable FastAPI capstone engine that executes the real Agent Gateway, trusted Tool Proxy, draft firewall, traces and evals. I have not yet operated it at Recare-scale production healthcare traffic; that is the experience I want to earn next.</p><a href="https://github.com/mikelninh/care-os/blob/main/docs/RECARE_CAPSTONE.md" target="_blank" rel="noreferrer">Run the engineering proof ↗</a></div><div class="proof-footer"><p><strong>Supporting proofs:</strong> GitLaw → hybrid retrieval/citation verification · Digital Worker Factory → reusable agent runtime/evals · PrüfPilot → document AI + versioned evidence workflows.</p><a href="https://mikelninh.github.io/" target="_blank" rel="noreferrer">Open portfolio ↗</a></div></div>`;
    architecture.insertAdjacentElement('afterend',section);

    const engine=document.createElement('section');engine.className='capstone-proof';engine.id='engine';
    engine.innerHTML=`<div class="shell"><div class="section-kicker">06 · Runnable agent engine</div><div class="proof-intro"><h2>The browser demo is the UX. This is the executable systems proof underneath it.</h2><p>The capstone API composes existing CareOS components rather than faking backend events: an untrusted reasoning worker proposes tools, the deterministic Agent Gateway authorizes each request, the Tool Proxy executes trusted handlers, and an explicit draft firewall decides whether output is even eligible for human review.</p></div><div class="proof-grid">
      <article class="proof-card"><code>POST /api/run</code><b>End-to-end execution</b><p>Returns run ID, worker/model identity, execution status, draft, evidence IDs, per-step trace events, tool latency and automatic eval results.</p></article>
      <article class="proof-card"><code>GET /api/eval-suite</code><b>Six-case containment matrix</b><p>Happy path, wrong patient, prompt injection, source outage, stale result and unauthorised write. Correct blocking counts as a successful safety outcome.</p></article>
      <article class="proof-card"><code>MODEL GATEWAY</code><b>Real-model switch</b><p>Deterministic by default; an approved HTTPS model gateway can replace the test worker for synthetic/deidentified runs without moving patient authority or credentials into the model.</p></article>
      <article class="proof-card"><code>OBSERVABILITY</code><b>Machine-readable traces</b><p>Model/tool/policy phases, duration, tool ID, model version and evidence IDs are emitted per run rather than existing only as UI decoration.</p></article>
      <article class="proof-card"><code>FAIL CLOSED</code><b>Authority stays outside AI</b><p>No live PHI mode, no autonomous break-glass, no patient search, no production write-back and no model-controlled policy.</p></article>
      <article class="proof-card"><code>pytest</code><b>Regression proof</b><p>The capstone has dedicated tests for grounding, pending-work retention, prompt injection, wrong-patient containment, source failure and write escalation.</p></article>
    </div><div class="proof-footer"><p><strong>Run locally:</strong> <code>uvicorn app.recare_api:app --reload --port 8010</code> · then inspect <code>/api/eval-suite</code>. The external-model mode requires an explicitly configured approved model gateway and remains locked to synthetic/deidentified evaluation.</p><a href="https://github.com/mikelninh/care-os/blob/main/app/recare_capstone.py" target="_blank" rel="noreferrer">Inspect executable engine ↗</a></div></div>`;
    section.insertAdjacentElement('afterend',engine);
  }
  renderTimer();
})();