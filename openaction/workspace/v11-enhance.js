(()=>{
  // V12: mission + shared truth + current constraint set + one next action per person.
  // The constraint set is a derived UX view. It does not remove required legal, safety or authority gates.
  if(!cases.building){
    cases.building={
      label:'Baugenehmigung',title:'Baugenehmigung',goal:'Den Antrag bis zu einer nachvollziehbaren, autoritativen Entscheidung bringen — ohne unnötige Wartezeit zwischen notwendigen Prüfungen.',outcome:'Entscheidung dokumentiert und Zustellung ausgelöst',outcomeDod:'Antragsreife bestätigt, erforderliche Fachprüfungen abgeschlossen und autoritative Entscheidung dokumentiert.',note:'Synthetisches Bürokratie-Beispiel. Konkrete Anforderungen, Zuständigkeiten und Fristen unterscheiden sich nach Bundesland, Kommune und Vorhaben.',past:['Antrag eingegangen'],forecast:['nach Nachreichung','Fachprüfungen · parallel soweit zulässig','nach vollständigen Fachvoten'],
      stages:[{label:'Antragsreife',eta:'nach Nachreichung',tasks:['plans']},{label:'Fachprüfungen',eta:'abhängig von zuständigen Stellen',tasks:['fire','environment','access']},{label:'Entscheidung',eta:'nach vollständigen Fachvoten',tasks:['decision']}],
      roles:{applicant:R('AN','Antragsteller:in / Planung','public','verifizierter Antrag / Vollmacht'),clerk:R('SB','Bauaufsicht · Vollständigkeit','internal','Behörden-IAM'),fire:R('BR','Brandschutzprüfung','internal','zuständige Fachstelle'),environment:R('UM','Umweltprüfung','internal','zuständige Fachstelle'),access:R('ER','Erschließung','internal','zuständige Fachstelle'),authority:R('BE','Entscheidungsstelle','restricted','Entscheidungsbefugnis im Fachverfahren')},
      tasks:{
        plans:T('applicant','Planung','clerk','Bauaufsicht','Brandschutznachtrag einreichen','angeforderter Nachtrag lesbar, eindeutig dem Vorgang zugeordnet und vollständig eingegangen','Nachtrag + Eingangsbeleg','Dokumenten-/Fachverfahren','durch Antragsteller','dieser Antrag','bis relevante Planänderung'),
        fire:T('fire','Brandschutz','authority','Entscheidungsstelle','Brandschutz fachlich prüfen','erforderliche Prüfpunkte abgearbeitet + Votum dokumentiert','Fachvotum Brandschutz','Fachverfahren','Fachstellen-SLA','dieser Antrag','bis relevante Planänderung'),
        environment:T('environment','Umwelt','authority','Entscheidungsstelle','Umweltbelange fachlich prüfen','erforderliche Prüfpunkte abgearbeitet + Votum dokumentiert','Fachvotum Umwelt','Fachverfahren','Fachstellen-SLA','dieser Antrag','bis relevante Planänderung'),
        access:T('access','Erschließung','authority','Entscheidungsstelle','Erschließung fachlich prüfen','erforderliche Prüfpunkte abgearbeitet + Votum dokumentiert','Fachvotum Erschließung','Fachverfahren','Fachstellen-SLA','dieser Antrag','bis relevante Planänderung'),
        decision:T('authority','Entscheidungsstelle',null,'Autoritativer Bescheid','Entscheidung dokumentieren','erforderliche Fachvoten berücksichtigt, Entscheidung erzeugt und Zustellung ausgelöst','Bescheid / Zustellnachweis','Fachverfahren / Zustelldienst','nach vollständigen Fachvoten','dieser Antrag','autoritativer Outcome',{receipt:true})
      },
      initial:{plans:I('assigned','Nachforderung Brandschutznachtrag versendet','24.08. 08:30'),fire:I('assigned','Wartet auf Antragsreife','24.08. 08:31'),environment:I('assigned','Wartet auf Antragsreife','24.08. 08:31'),access:I('assigned','Wartet auf Antragsreife','24.08. 08:31'),decision:I('assigned','Wartet auf erforderliche Fachvoten','24.08. 08:31')},
      financeFlow:null,changes:[['relevante Planänderung','betroffene Fachprüfungen gezielt neu öffnen'],['nur Kontaktangabe geändert','keine Fachprüfung neu öffnen']],disputes:[]
    };
  }

  const META={
    careos:{icon:'✚',sub:'Hospital AI · bounded pilot'},
    naturalization:{icon:'◎',sub:'Verwaltung · Bürgerantrag'},
    housing:{icon:'⌂',sub:'Public benefits · applicant case'},
    company:{icon:'▥',sub:'Business services · incorporation'},
    gov:{icon:'◫',sub:'Government · public digital project'},
    building:{icon:'⌂',sub:'Verwaltung · Baugenehmigung · synthetisch'}
  };
  const CONSTRAINT_META={
    careos:{clinical:['Safety','required safeguard',true],privacy:['Privacy','required review',true],contract:['Legal / contract','required review',true],security:['Security','required safeguard',true],finance:['Budget','required decision',true],sponsor:['Decision','authoritative decision',false],shadow:['Evidence','real-world evidence gate',false]},
    naturalization:{citizenDoc:['Evidence','required input',false],review:['Review','required case review',false],decision:['Decision','authoritative outcome',false]},
    housing:{paySlip:['Evidence','required input',false],income:['Review','required case review',false],decision:['Decision','authoritative outcome',false]},
    company:{bank:['Evidence','required input',false],file:['Formal filing','required handoff',false],register:['Decision','authoritative outcome',false]},
    gov:{procurement:['Procurement','required control',true],budget:['Budget','required control',true],delivery:['Delivery','contracted work',false],acceptance:['Independent QA','required verification',false],outcome:['Outcome','public value evidence',false]},
    building:{plans:['Evidence','required input',false],fire:['Technical review','required for demo scope',true],environment:['Technical review','required for demo scope',true],access:['Technical review','required for demo scope',true],decision:['Decision','authoritative outcome',false]}
  };
  const STEPS=[['Approved','budget'],['Committed','committed'],['Invoiced','invoiced'],['Paid','paid'],['Reconciled','reconciled']];
  const fmt=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n||0);
  const STORAGE_KEY='openaction-v12-local-demo-state';
  const qs=new URLSearchParams(location.search);
  const requestedCase=qs.get('case');
  const requestedRole=qs.get('role');
  if(requestedCase&&cases[requestedCase]) currentCase=requestedCase;
  if(requestedRole&&cases[currentCase]?.roles?.[requestedRole]) currentRole=requestedRole;

  function loadLocalState(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      for(const [caseId,value] of Object.entries(saved)) if(cases[caseId]&&value&&typeof value==='object') stateByCase[caseId]=value;
    }catch(_){/* stale demo state falls back to deterministic fixture */}
  }
  function persistLocalState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(stateByCase));}catch(_){/* storage is optional */}}
  loadLocalState();
  const baseSetStatus=setStatus;
  setStatus=function(...args){baseSetStatus(...args);persistLocalState();};
  const reset=document.querySelector('#resetBtn'),baseReset=reset?.onclick;
  if(reset&&baseReset) reset.onclick=e=>{baseReset.call(reset,e);persistLocalState();};

  function latestEvidenceFor(c){
    const items=[];
    for(const [id,t] of Object.entries(c.tasks)){const s=state()[id];if(s?.evidenceRef)items.push({updated:s.updated,label:s.evidenceRef,task:t.title});}
    items.sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));
    return items[0]||null;
  }

  function ensureConstraintPanel(){
    if(document.querySelector('#constraintPanel'))return;
    const shared=document.querySelector('.shared'),top=document.querySelector('.shared-top');if(!shared||!top)return;
    const panel=document.createElement('section');panel.id='constraintPanel';panel.className='constraint-panel';panel.setAttribute('aria-label','Current constraint set');
    panel.innerHTML='<div class="constraint-head"><div><small>CURRENT CONSTRAINT SET</small><strong id="constraintSummary"></strong></div><span id="constraintParallel"></span></div><div class="constraint-list" id="constraintList"></div><details class="constraint-rule"><summary>Why this matters in bureaucracy</summary><p>Required legal, safety and authority checks stay. OpenAction targets avoidable waiting, duplicate evidence, unclear ownership and unnecessary sequencing around them.</p></details>';
    top.insertAdjacentElement('afterend',panel);
  }
  function renderConstraints(){
    ensureConstraintPanel();const panel=document.querySelector('#constraintPanel');if(!panel)return;
    const c=cases[currentCase],i=currentStageIndex(c),complete=i===-1;
    if(complete){document.querySelector('#constraintSummary').textContent='No required constraints remain';document.querySelector('#constraintParallel').textContent='Outcome verified';document.querySelector('#constraintList').innerHTML='<div class="constraint-complete">✓ Terminal Definition of Done is satisfied for this synthetic case.</div>';return;}
    const ids=c.stages[i].tasks.filter(id=>taskStatus(id)!=='verified');const metas=CONSTRAINT_META[currentCase]||{};
    const parallel=ids.filter(id=>metas[id]?.[2]).length;
    document.querySelector('#constraintSummary').textContent=ids.length===1?'1 thing blocks the next unlock':`${ids.length} things block the next unlock`;
    document.querySelector('#constraintParallel').textContent=parallel>1?`${parallel} can move in parallel`:parallel===1&&ids.length>1?'1 can move independently':'follow real dependencies';
    document.querySelector('#constraintList').innerHTML=ids.map(id=>{const t=c.tasks[id],s=taskStatus(id),m=metas[id]||['Work','required for this case',false];return `<div class="constraint-item s-${s}"><span class="constraint-dot"></span><div class="constraint-main"><b>${t.title}</b><span>${t.owner} · ${STATUS[s]}</span></div><div class="constraint-tags"><span>${m[0]}</span><span>${m[1]}</span>${m[2]?'<span class="parallel-tag">parallel</span>':''}</div></div>`}).join('');
  }

  function renderMoneyVisual(){
    const c=cases[currentCase],f=c.financeFlow,el=document.querySelector('#moneyVisual'),strip=document.querySelector('#moneyStrip');if(!el||!strip)return;
    if(!f){el.innerHTML='<div style="grid-column:1/-1;padding:14px 2px;color:var(--oa-muted);font-size:14px">Kein separates Projektbudget ist für diesen Case als relevanter OpenAction-Flow hinterlegt.</div>';document.querySelector('#moneyTruth').textContent='evidence still traceable';}
    else{el.innerHTML=STEPS.map(([label,key],i)=>`<div class="money-step ${Number(f[key])>0?'has':''}"><div class="money-node">${i+1}</div><b>${label}</b><span>${fmt(f[key])}</span></div>`).join('');document.querySelector('#moneyTruth').textContent=f.forecast>f.budget?'forecast above budget · amounts ≠ completion':'amounts ≠ completion';}
    const latest=latestEvidenceFor(c);document.querySelector('#latestEvidence').textContent=latest?`${latest.label} · ${latest.task}`:'Noch kein Evidence-Receipt';
  }

  function renderMeta(){
    document.title='OpenAction — Mission Control V12';
    const c=cases[currentCase],m=META[currentCase]||{icon:'●',sub:'OpenAction case'};
    document.querySelector('#caseIcon').textContent=m.icon;document.querySelector('#caseSub').textContent=m.sub;document.querySelector('#roleChip').textContent=c.roles[currentRole]?.name||'Current role';document.querySelector('#demoLabel').textContent=`Synthetic · ${c.label} · ${c.roles[currentRole]?.name||''}`;
    const host=document.querySelector('.case-head>div:last-child');if(host&&!document.querySelector('#demoTruth')){const badge=document.createElement('div');badge.id='demoTruth';badge.className='demo-truth';badge.textContent='Synthetic interactive demo · local browser state · no real approval';host.appendChild(badge);}
    const url=new URL(location.href);url.searchParams.set('case',currentCase);url.searchParams.set('role',currentRole);history.replaceState({},'',url);
  }
  function renderPlanTruth(){
    const c=cases[currentCase],i=currentStageIndex(c),complete=i===-1,eta=document.querySelector('#etaText'),note=document.querySelector('#etaNote');if(!eta||!note)return;
    eta.textContent=complete?'Erreicht':`Illustrativ · ${c.stages[i].eta}`;note.textContent=complete?'Alle Completion-Kriterien dieses synthetischen Cases erfüllt.':'Synthetischer Planwert · keine Garantie · lokaler Demo-State';
  }
  function renderProofTruth(){
    const proof=document.querySelector('#proof');if(!proof||!proofMode||proof.querySelector('.demo-proof-note'))return;
    const note=document.createElement('div');note.className='demo-proof-note';note.textContent='Demo proof only — Evidence-IDs, hashes, signatures and authorities shown here are synthetic unless an external source is explicitly linked.';proof.prepend(note);
  }

  const originalRender=render;
  render=function(){originalRender();renderMeta();renderPlanTruth();renderConstraints();renderMoneyVisual();renderProofTruth();persistLocalState();};
  render();
})();
