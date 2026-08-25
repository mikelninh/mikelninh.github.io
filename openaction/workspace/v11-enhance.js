(()=>{
  const META={
    careos:{icon:'✚',sub:'Hospital AI · bounded pilot'},
    naturalization:{icon:'◎',sub:'Verwaltung · Bürgerantrag'},
    housing:{icon:'⌂',sub:'Public benefits · applicant case'},
    company:{icon:'▥',sub:'Business services · incorporation'},
    gov:{icon:'◫',sub:'Government · public digital project'}
  };
  const STEPS=[['Approved','budget'],['Committed','committed'],['Invoiced','invoiced'],['Paid','paid'],['Reconciled','reconciled']];
  const fmt=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n||0);
  const qs=new URLSearchParams(location.search);
  const requestedCase=qs.get('case');
  const requestedRole=qs.get('role');
  if(requestedCase&&cases[requestedCase]) currentCase=requestedCase;
  if(requestedRole&&cases[currentCase]?.roles?.[requestedRole]) currentRole=requestedRole;

  function latestEvidenceFor(c){
    const items=[];
    for(const [id,t] of Object.entries(c.tasks)){
      const s=state()[id];
      if(s?.evidenceRef) items.push({updated:s.updated,label:s.evidenceRef,task:t.title});
    }
    items.sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));
    return items[0]||null;
  }

  function renderMoneyVisual(){
    const c=cases[currentCase],f=c.financeFlow,el=document.querySelector('#moneyVisual'),strip=document.querySelector('#moneyStrip');
    if(!el||!strip)return;
    if(!f){
      el.innerHTML='<div style="grid-column:1/-1;padding:14px 2px;color:var(--oa-muted);font-size:11px">Kein separates Projektbudget ist für diesen Case als relevanter OpenAction-Flow hinterlegt.</div>';
      document.querySelector('#moneyTruth').textContent='evidence still traceable';
    }else{
      el.innerHTML=STEPS.map(([label,key],i)=>`<div class="money-step ${Number(f[key])>0?'has':''}"><div class="money-node">${i+1}</div><b>${label}</b><span>${fmt(f[key])}</span></div>`).join('');
      document.querySelector('#moneyTruth').textContent=f.forecast>f.budget?'forecast above budget · amounts ≠ completion':'amounts ≠ completion';
    }
    const latest=latestEvidenceFor(c);
    document.querySelector('#latestEvidence').textContent=latest?`${latest.label} · ${latest.task}`:'Noch kein Evidence-Receipt';
  }

  function renderMeta(){
    const c=cases[currentCase],m=META[currentCase]||{icon:'●',sub:'OpenAction case'};
    document.querySelector('#caseIcon').textContent=m.icon;
    document.querySelector('#caseSub').textContent=m.sub;
    document.querySelector('#roleChip').textContent=c.roles[currentRole]?.name||'Current role';
    document.querySelector('#demoLabel').textContent=`${c.label} · ${c.roles[currentRole]?.name||''}`;
    const url=new URL(location.href);url.searchParams.set('case',currentCase);url.searchParams.set('role',currentRole);history.replaceState({},'',url);
  }

  const originalRender=render;
  render=function(){originalRender();renderMeta();renderMoneyVisual();};
  render();
})();
