(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  let trace=[],reviewed=false,runToken=0,started=false;
  const pad=n=>String(n).padStart(2,'0');
  const stamp=()=>{const d=new Date();return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`};

  function setStatus(text,cls){const s=$('#caseStatus');if(!s)return;s.textContent=text;s.className=`status-chip ${cls}`}
  function setStep(active,doneThrough=0){$$('.demo-progress li').forEach(li=>{const n=Number(li.dataset.step);li.classList.toggle('done',n<=doneThrough);li.classList.toggle('active',n===active)})}
  function addTrace(action,detail,kind='ok'){
    trace.push({time:stamp(),action,detail,kind});
    const log=$('#traceLog');if(!log)return;log.innerHTML='';
    trace.forEach(e=>{const row=document.createElement('div');row.className=`trace-event ${e.kind==='block'?'block':e.kind==='warn'?'warn':''}`;const t=document.createElement('span');t.className='trace-time';t.textContent=e.time;const a=document.createElement('span');a.className='trace-action';a.textContent=e.action;const d=document.createElement('span');d.className='trace-detail';d.textContent=e.detail;row.append(t,a,d);log.appendChild(row)});
    const count=$('#traceCount');if(count)count.textContent=`${trace.length} event${trace.length===1?'':'s'}`;log.scrollTop=log.scrollHeight;
  }
  function tab(name){$$('.tab').forEach(b=>{const active=b.dataset.tab===name;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});$$('.tab-panel').forEach(p=>p.classList.remove('active'));$(`#${name}Panel`)?.classList.add('active')}
  $$('.tab').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));

  $('#startCase')?.addEventListener('click',()=>{
    if(started)return;started=true;const token=++runToken;reviewed=false;trace=[];
    $('#demoComplete')?.classList.add('hidden');$('#traceLog').innerHTML='';$('#emptyState')?.classList.add('hidden');$('#facts')?.classList.remove('hidden');
    const approve=$('#approveDraft');if(approve){approve.disabled=true;approve.classList.add('disabled');approve.textContent='Review conflict first'}
    const resolve=$('#resolveConflict');if(resolve)resolve.textContent='2 · I reviewed this conflict';
    setStep(2,1);setStatus('review needed','review');
    addTrace('CONTEXT','Encounter bound to synthetic patient DEMO-1842');
    [[130,'ROUTE','Task routed to bounded discharge-prep workflow','ok'],[300,'READ','FHIR observations · patient binding verified','ok'],[470,'READ','LIS microbiology · pending/final state preserved','ok'],[640,'READ','KIS medication · documented medication only','ok'],[810,'EXTRACT','PDF parsed as untrusted evidence','ok'],[980,'RECONCILE','Allergy contradiction requires human review','warn'],[1160,'DRAFT','Source-linked discharge-prep draft prepared','ok']].forEach(([delay,action,detail,kind])=>setTimeout(()=>{if(token!==runToken||!started)return;addTrace(action,detail,kind)},delay));
  });

  $('#resetCase')?.addEventListener('click',()=>{
    runToken++;started=false;reviewed=false;trace=[];setStep(1,0);setStatus('ready','idle');tab('context');
    $('#emptyState')?.classList.remove('hidden');$('#facts')?.classList.add('hidden');$('#demoComplete')?.classList.add('hidden');
    const log=$('#traceLog');if(log)log.innerHTML='<div class="trace-placeholder">Start the case to populate the trace.</div>';const count=$('#traceCount');if(count)count.textContent='0 events';
    $$('.source-drawer').forEach(x=>x.classList.remove('show'));$$('.source-link').forEach(x=>x.textContent='See original source →');$$('.stress-button').forEach(x=>x.classList.remove('active'));
    const approve=$('#approveDraft');if(approve){approve.disabled=true;approve.classList.add('disabled');approve.textContent='Review conflict first'}
    const resolve=$('#resolveConflict');if(resolve)resolve.textContent='2 · I reviewed this conflict';
  });

  $$('.source-link').forEach(b=>b.addEventListener('click',()=>{const x=$(`#${b.dataset.source}`);if(!x)return;x.classList.toggle('show');b.textContent=x.classList.contains('show')?'Close source ×':'See original source →';if(x.classList.contains('show'))addTrace('SOURCE',`Reviewer opened ${b.dataset.source}`)}));

  $('#resolveConflict')?.addEventListener('click',()=>{
    if(!started)return;reviewed=true;$('#resolveConflict').textContent='✓ Conflict reviewed';const approve=$('#approveDraft');approve.disabled=false;approve.classList.remove('disabled');approve.textContent='3 · Approve reviewed draft';setStatus('ready for review','done');setStep(3,2);addTrace('HUMAN','Allergy conflict explicitly reviewed; source lineage retained');tab('draft');
  });

  $('#returnSource')?.addEventListener('click',()=>{tab('context');$$('.source-drawer').forEach(x=>x.classList.add('show'));$$('.source-link').forEach(x=>x.textContent='Close source ×');addTrace('VERIFY','Supporting sources opened from the draft')});

  $('#approveDraft')?.addEventListener('click',()=>{
    if(!reviewed)return;setStatus('approved locally','done');const approve=$('#approveDraft');approve.textContent='✓ Approved locally';approve.disabled=true;approve.classList.add('disabled');addTrace('APPROVAL','Human approved synthetic draft; no clinical write-back capability exists');setStep(4,3);tab('trace');$('#demoComplete')?.classList.remove('hidden');setTimeout(()=>setStep(5,4),450);
  });

  $$('mark[data-cite]').forEach(m=>m.addEventListener('click',()=>{tab('context');const source=$(`#${m.dataset.cite}`);if(source)source.classList.add('show');addTrace('VERIFY',`Citation jump → ${m.dataset.cite}`)}));

  const tests={
    'wrong-patient':{state:'BLOCKED',title:'Wrong-patient data is rejected before use.',cls:'blocked',policy:'Patient identity must match the encounter-bound patient.',user:'The foreign clinical fact is not shown.',audit:'FHIR resource quarantined · patient mismatch',kind:'block'},
    injection:{state:'QUARANTINED',title:'The PDF cannot rewrite system rules.',cls:'blocked',policy:'Document text is evidence, never authority.',user:'The PDF stays inspectable; the malicious instruction is isolated.',audit:'Prompt-injection pattern separated from authority context',kind:'block'},
    unavailable:{state:'DEGRADED',title:'Unavailable stays unavailable.',cls:'warned',policy:'Source failure must be visible.',user:'Microbiology shows “source unavailable”; dependent claims are suppressed.',audit:'LIS timeout · dependent claims suppressed',kind:'warn'},
    stale:{state:'REVIEW',title:'An old value cannot pretend to be today’s result.',cls:'warned',policy:'Clinical time and freshness are part of correctness.',user:'The historical value stays labelled old; the requested result remains pending.',audit:'Freshness gate prevented silent substitution',kind:'warn'},
    tool:{state:'DENIED',title:'The AI cannot give itself write permission.',cls:'blocked',policy:'Clinical write-back is outside the delegated capability set.',user:'No medication, order or document write occurs.',audit:'Tool request denied · clinical.write absent',kind:'block'}
  };
  $$('.stress-button').forEach(b=>b.addEventListener('click',()=>{$$('.stress-button').forEach(x=>x.classList.toggle('active',x===b));const t=tests[b.dataset.test],r=$('#stressResult');if(!t||!r)return;r.className=`stress-result ${t.cls}`;r.innerHTML=`<div class="shield" aria-hidden="true">◇</div><div class="card-overline">${t.state}</div><h3>${t.title}</h3><div class="result-list"><div><span>System rule</span><b>${t.policy}</b></div><div><span>What the clinician sees</span><b>${t.user}</b></div><div><span>Audit trail</span><b>${t.audit}</b></div></div>`;addTrace(t.state,b.querySelector('b')?.textContent||b.dataset.test,t.kind);setStep(0,5)}));

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches,reveals=$$('.reveal');if(reduced||!('IntersectionObserver'in window))reveals.forEach(x=>x.classList.add('visible'));else{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -40px 0px'});reveals.forEach(x=>observer.observe(x))}
  const anchors=$$('.nav-links a[href^="#"]'),sections=anchors.map(a=>$(a.getAttribute('href'))).filter(Boolean);if('IntersectionObserver'in window&&sections.length){const navObserver=new IntersectionObserver(entries=>{const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!active)return;anchors.forEach(a=>a.toggleAttribute('data-current',a.getAttribute('href')===`#${active.target.id}`))},{rootMargin:'-25% 0px -65% 0px',threshold:[0,.1,.5]});sections.forEach(s=>navObserver.observe(s))}
  setStep(1,0);
})();