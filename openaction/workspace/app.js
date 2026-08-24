(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  let pilot, passport;
  let activeRole = new URLSearchParams(location.search).get('role') || 'all';
  let onlyBlockers = false;

  const statusLabel = {approved:'Approved',in_review:'In review',todo:'To do',blocked:'Blocked'};
  const roleNames = {};
  const readinessWeight = {approved:1,in_review:.55,todo:.2,blocked:0};

  async function load(){
    [pilot, passport] = await Promise.all([
      fetch('./data/careos-pilot.json').then(r=>r.json()),
      fetch('./data/careos-trust-passport.json').then(r=>r.json())
    ]);
    pilot.roles.forEach(r=>roleNames[r.id]=r.label);
    if(!roleNames[activeRole]) activeRole='all';
    renderAll();
    bind();
  }

  function renderAll(){
    renderMetrics();
    renderRoles();
    renderGraph();
    renderPassport();
    renderPackage();
    renderBenefits();
  }

  function renderMetrics(){
    const blocking=pilot.gates.filter(g=>g.blocking);
    const readiness=Math.round(blocking.reduce((s,g)=>s+readinessWeight[g.status],0)/blocking.length*100);
    const open=blocking.filter(g=>g.status!=='approved').length;
    const ready=pilot.gates.reduce((s,g)=>s+g.ready,0), total=pilot.gates.reduce((s,g)=>s+g.total,0);
    const parallel=pilot.gates.filter(g=>g.parallel && g.status!=='approved').length;
    $('#readinessValue').textContent=readiness+'%';
    $('#readinessBar').style.width=readiness+'%';
    $('#blockerCount').textContent=open;
    $('#evidenceValue').textContent=`${ready}/${total}`;
    $('#parallelValue').textContent=parallel;
  }

  function renderRoles(){
    $('#rolePills').innerHTML=pilot.roles.map(r=>`<button class="role-pill ${r.id===activeRole?'active':''}" data-role="${r.id}">${r.label}</button>`).join('');
    $$('.role-pill').forEach(btn=>btn.onclick=()=>{activeRole=btn.dataset.role;history.replaceState(null,'',activeRole==='all'?location.pathname:`?role=${encodeURIComponent(activeRole)}`);renderRoles();renderGraph();});
  }

  function renderGraph(){
    const open=pilot.gates.filter(g=>g.status!=='approved').length;
    const blockers=pilot.gates.filter(g=>g.blocking&&g.status!=='approved').length;
    const ready=pilot.gates.reduce((s,g)=>s+g.ready,0), total=pilot.gates.reduce((s,g)=>s+g.total,0);
    $('#graphSummary').innerHTML=`<span class="summary-chip"><strong>${pilot.gates.length}</strong> gates total</span><span class="summary-chip"><strong>${open}</strong> open</span><span class="summary-chip"><strong>${blockers}</strong> blocking</span><span class="summary-chip"><strong>${ready}/${total}</strong> evidence items ready</span>`;
    $('#gateGrid').innerHTML=pilot.gates.filter(g=>g.id!=='pilot_governance').map(g=>{
      const match=activeRole==='all'||g.roles.includes(activeRole);
      const hidden=onlyBlockers && (!g.blocking || g.status==='approved');
      const pct=Math.round(g.ready/g.total*100);
      return `<article class="gate-card ${match&&activeRole!=='all'?'role-match':''} ${!match&&activeRole!=='all'?'dimmed':''} ${hidden?'hidden-gate':''}" data-gate="${g.id}" tabindex="0">
        <div class="gate-top"><div><p class="eyebrow">${g.category.replaceAll('_',' ')}</p><h3>${g.title}</h3></div><span class="state ${g.status}">${statusLabel[g.status]}</span></div>
        <p>${g.question}</p>
        <div class="gate-meta"><span>${g.ready}/${g.total} evidence</span><div class="mini-progress"><span style="width:${pct}%"></span></div><span>${g.parallel?'parallel':'dependent'}</span></div>
        <div class="owner">Owner · <strong>${g.owner}</strong></div>
      </article>`;
    }).join('');
    $$('.gate-card').forEach(card=>{const open=()=>showGate(card.dataset.gate);card.onclick=open;card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}}});
    const final=pilot.gates.find(g=>g.id==='pilot_governance');
    $('#finalGateState').textContent=statusLabel[final.status];
    $('#finalGateState').className='state '+final.status;
    $('#focusBlockersBtn').textContent=onlyBlockers?'Alle Gates zeigen':'Nur Blocker zeigen';
  }

  function showGate(id){
    const g=pilot.gates.find(x=>x.id===id); if(!g) return;
    const deps=(g.depends_on||[]).map(id=>pilot.gates.find(x=>x.id===id)?.title).filter(Boolean);
    $('#gateDetail').innerHTML=`
      <span class="state ${g.status} detail-status">${statusLabel[g.status]}</span>
      <h2 class="detail-title">${g.title}</h2>
      <p class="detail-question">${g.question}</p>
      <div class="detail-grid"><div class="detail-box"><small>Owner</small><strong>${g.owner}</strong></div><div class="detail-box"><small>Relevant for</small><strong>${g.roles.map(r=>roleNames[r]||r).join(', ')}</strong></div><div class="detail-box"><small>Blocking</small><strong>${g.blocking?'Yes':'No'}</strong></div><div class="detail-box"><small>Review mode</small><strong>${g.parallel?'Can run in parallel':'Depends on other gates'}</strong></div></div>
      <h3>Evidence needed</h3><ul class="evidence-list">${g.evidence.map((e,i)=>`<li>${i<g.ready?'✓':'○'} ${e}</li>`).join('')}</ul>
      ${deps.length?`<p class="muted"><strong>Depends on:</strong> ${deps.join(', ')}</p>`:''}
      <div class="next-step"><strong>Next best step</strong><br>${g.next}</div>`;
    $('#gateDialog').showModal();
  }

  function passportSections(){
    const sections=[];
    sections.push({title:'Purpose',status:'ready',items:[passport.intended_use,...passport.explicit_non_goals.slice(0,2)]});
    sections.push({title:'Architecture',status:'review',items:[passport.architecture.summary,...passport.architecture.dependencies]});
    sections.push({title:'Data & privacy',status:passport.data.dpia_status==='approved'?'ready':'review',items:[`Special-category data: ${passport.data.special_category_data?'yes':'no'}`,`DPA: ${passport.data.dpa_status}`,`DPIA: ${passport.data.dpia_status}`]});
    sections.push({title:'Models',status:'todo',items:passport.models.map(m=>`${m.name} · ${m.provider} · ${m.region}`)});
    sections.push({title:'Security',status:passport.security.security_review_status==='approved'?'ready':'review',items:[passport.security.authn,passport.security.authz,passport.security.logging]});
    sections.push({title:'Regulation & TI',status:'review',items:passport.domain_regulation.map(d=>`${d.framework}: ${d.status}`)});
    sections.push({title:'Workforce',status:'todo',items:[`Consultation: ${passport.workforce.consultation_status}`,passport.workforce.training_plan]});
    sections.push({title:'Procurement',status:'todo',items:[`Route: ${passport.procurement.route}`,`Vendor review: ${passport.procurement.vendor_review_status}`]});
    sections.push({title:'Evaluations',status:'todo',items:passport.evaluations.map(e=>`${e.name}: ${e.status}`)});
    return sections;
  }

  function renderPassport(){
    const sections=passportSections();
    const weights={ready:1,review:.55,todo:.2};
    const score=Math.round(sections.reduce((s,x)=>s+weights[x.status],0)/sections.length*100);
    $('#passportProduct').textContent=`${passport.product.name} ${passport.product.version}`;
    $('#passportPurpose').textContent=passport.intended_use;
    $('#passportScore').textContent=score+'%';
    $('#passportGrid').innerHTML=sections.map(s=>`<article class="passport-card"><h3>${s.title}</h3><ul>${s.items.map(i=>`<li>${escapeHtml(String(i))}</li>`).join('')}</ul><div class="passport-status" style="color:${s.status==='ready'?'var(--green)':s.status==='review'?'var(--blue)':'var(--amber)'}">${s.status==='ready'?'READY':s.status==='review'?'IN REVIEW':'TO DO'}</div></article>`).join('');
  }

  function renderPackage(){
    const blocking=pilot.gates.filter(g=>g.blocking&&g.status!=='approved');
    const reusable=pilot.gates.reduce((s,g)=>s+g.ready,0);
    $('#packagePreview').innerHTML=`
      <div class="package-section"><p class="eyebrow">01 · Purpose</p><h3>${pilot.name}</h3><p>${pilot.intended_use}</p></div>
      <div class="package-section"><p class="eyebrow">02 · Safe pilot boundary</p><h3>Bounded before broad</h3><p>${pilot.pilot_boundary}</p></div>
      <div class="package-section"><p class="eyebrow">03 · Reusable evidence</p><h3>${reusable} evidence items already prepared</h3><p>Architecture, privacy, security, clinical quality, interoperability/TI scope, workforce and procurement are tracked in one shared evidence model.</p></div>
      <div class="package-section"><p class="eyebrow">04 · Decisions still required</p><div class="package-list">${blocking.map(g=>`<div class="package-item"><strong>${g.title}</strong><br>${g.owner}</div>`).join('')}</div></div>
      <div class="package-section"><p class="eyebrow">05 · What we ask the hospital</p><h3>Do not approve CareOS today.</h3><p>Confirm the approval path, identify the right owners, tell us which evidence is missing, and agree the smallest safe pilot we can evaluate together.</p></div>`;
  }

  function renderBenefits(){
    const b=pilot.synthetic_benefits;
    $('#benefitCompare').innerHTML=`
      <article class="benefit-card"><span class="badge synthetic">Synthetic today</span><h3>${b.today.model}</h3><div class="benefit-stat"><span>Illustrative lead time</span><strong>${b.today.weeks} wk</strong></div><div class="benefit-stat"><span>Separate questionnaires</span><strong>${b.today.duplicate_questionnaires}</strong></div><div class="benefit-stat"><span>Late blockers</span><strong>${b.today.late_blockers}</strong></div></article>
      <article class="benefit-card after"><span class="badge synthetic">Synthetic OpenAction</span><h3>${b.openaction.model}</h3><div class="benefit-stat"><span>Illustrative critical path</span><strong>${b.openaction.weeks} wk</strong></div><div class="benefit-stat"><span>Reusable core evidence pack</span><strong>${b.openaction.duplicate_questionnaires}</strong></div><div class="benefit-stat"><span>Late blockers</span><strong>${b.openaction.late_blockers}</strong></div></article>`;
    $('#benefitWarning').textContent=b.label+'. '+b.assumption;
    $('#proofGrid').innerHTML=pilot.pilot_metrics.map((m,i)=>`<div class="proof-item"><strong>${String(i+1).padStart(2,'0')}</strong>${m}</div>`).join('');
  }

  function adoptionMarkdown(){
    const blocking=pilot.gates.filter(g=>g.blocking&&g.status!=='approved');
    return `# CareOS Adoption Package — synthetic pilot\n\n> This package is a synthetic OpenAction demonstration, not an approval, legal assessment, clinical determination, or production-readiness claim.\n\n## Intended use\n${pilot.intended_use}\n\n## Pilot boundary\n${pilot.pilot_boundary}\n\n## Current approval path\n${pilot.gates.map(g=>`- [${g.status==='approved'?'x':' '}] **${g.title}** — ${statusLabel[g.status]} — owner: ${g.owner}${g.blocking?' — BLOCKING':''}`).join('\n')}\n\n## Blocking decisions still required\n${blocking.map(g=>`### ${g.title}\nOwner: ${g.owner}\n\nQuestion: ${g.question}\n\nEvidence needed:\n${g.evidence.map(e=>`- ${e}`).join('\n')}\n\nNext step: ${g.next}`).join('\n\n')}\n\n## Trust Passport\n- Purpose and non-goals\n- Architecture and dependencies\n- Data, privacy and retention\n- Model/runtime inventory\n- Security controls and rollback\n- Domain / TI scope assessment\n- Workforce and training\n- Procurement and licensing\n- Evaluations and known limitations\n\n## First meeting objective\nConfirm the path, owners and missing evidence. Do not request blanket approval. Agree the smallest safe pilot that can generate real evidence.\n\n## Metrics to measure\n${pilot.pilot_metrics.map(m=>`- ${m}`).join('\n')}\n`;
  }

  function download(filename,content,type='text/plain'){
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }
  function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1800)}
  function escapeHtml(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

  function bind(){
    $$('.tab').forEach(btn=>btn.onclick=()=>{$$('.tab').forEach(x=>x.classList.toggle('active',x===btn));$$('.panel').forEach(p=>p.classList.toggle('active',p.id===`panel-${btn.dataset.tab}`));});
    $('#focusBlockersBtn').onclick=()=>{onlyBlockers=!onlyBlockers;renderGraph();};
    $('#closeDialog').onclick=()=>$('#gateDialog').close();
    $('#gateDialog').onclick=e=>{if(e.target===$('#gateDialog'))$('#gateDialog').close();};
    $('#exportPassportBtn').onclick=()=>download('careos-trust-passport.synthetic.json',JSON.stringify(passport,null,2),'application/json');
    $('#downloadPackageBtn').onclick=()=>download('careos-adoption-package.synthetic.md',adoptionMarkdown(),'text/markdown');
    $('#copyOpenerBtn').onclick=async()=>{await navigator.clipboard.writeText('Welche dieser Entscheidungen müssen Sie treffen — und welche Nachweise fehlen Ihnen dafür noch?');toast('Opener copied');};
    $('#shareBtn').onclick=async()=>{await navigator.clipboard.writeText(location.href);toast('Share link copied');};
  }

  load().catch(err=>{console.error(err);document.body.innerHTML='<main style="font-family:system-ui;padding:40px"><h1>Workspace could not load.</h1><p>Please reload the page.</p></main>';});
})();