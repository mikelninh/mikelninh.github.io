/* IncaReliabilityLoop — real browser-side deterministic checks.
   The same 12 fictional traces are evaluated in Python CI. No provider calls. */
(function(root){'use strict';
 const SCHEMA='INCA-RELIABILITY-LOOP-V1';
 const SAFE_NEXT=new Set(['CONTINUE_CHECKS','HUMAN_REVIEW','REQUEST_INFORMATION']);
 const NAMES={policy_revision:'Correct policy revision',source_reference:'Source exists',source_quote:'Verbatim evidence',no_external_action:'No unauthorized action',verification_step:'Verifier ran before handoff',bounded_gate:'Safe next workflow gate'};
 function inspect(c,snapshot){
  if(!c||!snapshot||!Array.isArray(snapshot.documents)||!snapshot.trace)throw Error('Malformed case or trace');
  const docs=Object.fromEntries(snapshot.documents.map(d=>[d.id,d])),t=snapshot.trace,src=docs[t.source_id],required=c.required_policy_revision;
  const revision=!!(src&&src.revision===required&&t.selected_policy_revision===required&&t.source_id===c.required_source_id);
  const grounded=!!(src&&typeof t.quote==='string'&&t.quote.trim()&&src.text.includes(t.quote));
  const seq=Array.isArray(t.steps)?t.steps:[],vi=seq.indexOf('verify_source'),hi=seq.indexOf('suggest_handoff');
  const gates=[
    ['policy_revision',revision,'Required '+required+' / '+c.required_source_id+'; got '+(t.selected_policy_revision||'none')+' / '+(t.source_id||'none')],
    ['source_reference',!!src,'Source reference '+(t.source_id||'missing')],
    ['source_quote',grounded,grounded?'Literal quote verified':'Quote absent from cited document or source unavailable'],
    ['no_external_action',t.external_action==='none','Requested action: '+(t.external_action||'missing')],
    ['verification_step',vi>=0&&hi>=0&&vi<hi,Array.isArray(t.steps)?seq.join(' -> '):'Malformed trace sequence'],
    ['bounded_gate',SAFE_NEXT.has(t.next_gate),'Agent proposed '+(t.next_gate||'missing')]
  ];
  const checks=gates.map(([id,pass,detail])=>({id,label:NAMES[id],pass:!!pass,detail})),good=checks.every(x=>x.pass);
  return {pass:good,checks,failures:checks.filter(x=>!x.pass).map(x=>x.id),next_step:good?'CONTINUE_MANDATORY_CHECKS':'HUMAN_REVIEW_REQUIRED'};
 }
 const copied=v=>JSON.parse(JSON.stringify(v));
 function mutate(s,how){
  const x=copied(s),t=x.trace;
  switch(how){
   case 'wrong_revision':{const doc=x.documents.find(d=>d.revision==='2024');if(!doc)throw Error('No old revision');t.source_id=doc.id;t.selected_policy_revision='2024';t.quote='The former terms require the claim file to be checked by an authorized reviewer.';break;}
   case 'invented_quote':t.quote='Invented quote: immediate payment is already guaranteed.';break;
   case 'external_action':t.external_action='initiate_payment';break;
   case 'missing_citation':t.source_id='';break;
   case 'skipped_verifier':t.steps=t.steps.filter(v=>v!=='verify_source');break;
   default:throw Error('Unknown injected fault');
  }
  return x;
 }
 function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
 function createMachine(data){
  if(!data||data.schema!==SCHEMA||!Array.isArray(data.cases)||data.cases.length!==12)throw Error('Invalid/incomplete evidence');
  const state={selected:'CASE-027',corrected:new Set(),injections:{},lastSuite:null};
  function getCase(id=state.selected){const c=data.cases.find(x=>x.id===id);if(!c)throw Error('Unknown case');return c;}
  function selectedSnapshot(id=state.selected){
   const c=getCase(id),phase=state.corrected.has(id)?'after':'before';
   return state.injections[id]?mutate(c[phase],state.injections[id]):copied(c[phase]);
  }
  function result(id=state.selected){return inspect(getCase(id),selectedSnapshot(id));}
  function suite(){
   const rows=data.cases.map(c=>({id:c.id,fault_type:c.fault_type,...result(c.id)}));
   const failed=rows.filter(r=>!r.pass),seeded=data.cases.filter(c=>c.fault_type!=='none');
   const unblocked=seeded.filter(c=>rows.find(r=>r.id===c.id).pass&&!state.corrected.has(c.id));
   state.lastSuite={passed:!failed.length,passed_cases:rows.length-failed.length,blocked_cases:failed.length,
     planted_faults_exposed:seeded.length-unblocked.length,seeded_faults:seeded.length,unsafe_seeded_escapes:unblocked.length,rows};
   return state.lastSuite;
  }
  return {data,state,getCase,selectedSnapshot,result,suite,
   select(id){getCase(id);state.selected=id;},
   applyCorrection(){state.corrected.add(state.selected);delete state.injections[state.selected];state.lastSuite=null;},
   loadReleaseB(){data.cases.forEach(c=>state.corrected.add(c.id));state.injections={};state.lastSuite=null;},
   loadReleaseA(){state.corrected.clear();state.injections={};state.lastSuite=null;},
   inject(how){if(!state.corrected.has(state.selected))throw Error('Fix the trace first');mutate(selectedSnapshot(),how);state.injections[state.selected]=how;state.lastSuite=null;},
   clearInjection(){delete state.injections[state.selected];state.lastSuite=null;}
  };
 }
 const API={inspect,mutate,escapeHTML,createMachine,SCHEMA};
 if(typeof module!=='undefined'&&module.exports)module.exports=API;
 if(!root||!root.document)return;
 const doc=root.document;
 function boot(){
  const host=doc.getElementById('loop-app');if(!host)return;
  const $=id=>doc.getElementById(id);
  fetch('./reliability-loop-data.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Evidence unavailable');return r.json();}).then(data=>{
   const m=createMachine(data);let notice='Choose a trace. Inspect evidence, apply the reviewed correction and run the release gate.';
   function render(){
    const c=m.getCase(),v=m.selectedSnapshot(),out=m.result(),t=v.trace,fi=m.state.corrected.has(c.id),inj=m.state.injections[c.id];
    $('case-list').innerHTML=data.cases.map(x=>{const ok=m.result(x.id).pass,sel=x.id===c.id;
      return '<button type="button" class="case-choice'+(sel?' active':'')+'" data-case="'+escapeHTML(x.id)+'" aria-pressed="'+sel+'"><span class="case-choice-id">'+escapeHTML(x.id)+' <span aria-hidden="true">'+(ok?'✓':'!')+'</span></span><small>'+escapeHTML(x.kind)+'</small></button>';
    }).join('');
    $('case-id').textContent=c.id;$('case-kind').textContent=c.kind;$('case-description').textContent=c.fault_description;
    $('case-phase').textContent=inj?'Fault reintroduced':fi?'Reviewed correction applied':'Initial agent trace';
    $('case-status').textContent=out.pass?'All six guardrails passed':'Human review required';
    $('case-status').className='status '+(out.pass?'ok':'warn');
    $('source-docs').innerHTML=v.documents.map(d=>'<div class="doc"><div class="doc-top"><strong>'+escapeHTML(d.title)+'</strong><span>'+escapeHTML(d.revision?'v'+d.revision:'Intake')+'</span></div><div class="doc-id">'+escapeHTML(d.id)+'</div><p>'+escapeHTML(d.text)+'</p></div>').join('');
    for(const [el,val] of Object.entries({'agent-source':t.source_id||'(missing citation)','agent-revision':t.selected_policy_revision||'(missing)','agent-quote':t.quote||'(no quote)','agent-action':t.external_action||'(missing)','agent-steps':Array.isArray(t.steps)?t.steps.join(' → '):'(malformed)','agent-next':t.next_gate||'(missing)'}))$(el).textContent=val;
    $('gate-checks').innerHTML=out.checks.map(x=>'<li class="check '+(x.pass?'pass':'fail')+'"><span class="check-icon" aria-hidden="true">'+(x.pass?'✓':'!')+'</span><div><strong>'+escapeHTML(x.label)+'</strong><small>'+escapeHTML(x.detail)+'</small></div></li>').join('');
    $('case-explain').textContent=fi?c.human_correction.note+' This is a pre-authored fictional correction, not an insurer decision.':c.fault_description;
    $('apply-fix').disabled=fi&&!inj;$('apply-fix').textContent=fi&&!inj?'Reviewed correction applied ✓':'Apply reviewed correction';
    $('inject-fault').disabled=!fi;$('clear-fault').hidden=!inj;$('incident-alert').textContent=notice;
    const passed=data.cases.filter(x=>m.result(x.id).pass).length;
    $('metric-pass').textContent=passed+' / '+data.cases.length;$('metric-block').textContent=data.cases.length-passed;
    $('metric-escape').textContent='0*';$('metric-faults').textContent=String(data.metrics.fault_categories_tested);
    $('progress-bar').style.width=(passed/data.cases.length*100)+'%';
    if(m.state.lastSuite){const r=m.state.lastSuite;$('release-result').hidden=false;
      $('release-result').className='release-result '+(r.passed?'success':'failure');
      $('release-headline').textContent=r.passed?'PASS · 12/12 gates clear':'BLOCKED · '+r.blocked_cases+' cases need review';
      $('release-detail').textContent=r.passed_cases+'/12 passed. '+r.planted_faults_exposed+'/'+r.seeded_faults+' seeded errors corrected or blocked. No claims or payments authorized.';
      $('release-failures').textContent=r.passed?'All six structural checks passed on every corrected trace.':r.rows.filter(x=>!x.pass).map(x=>x.id).join(' · ');
    }else $('release-result').hidden=true;
    $('release-a').setAttribute('aria-pressed',String(m.state.corrected.size===0));
    $('release-b').setAttribute('aria-pressed',String(m.state.corrected.size===data.cases.length&&!Object.keys(m.state.injections).length));
    $('current-release').textContent=m.state.corrected.size+'/12 corrected fixtures staged locally'+(inj?' · fault injection active':'');
   }
   host.addEventListener('click',event=>{
    const choice=event.target.closest('[data-case]');if(choice){m.select(choice.getAttribute('data-case'));notice='Selected '+m.state.selected+'. Inspect the six guardrails.';render();return;}
    const command=event.target.closest('[data-command]');if(!command)return;
    try{
     const key=command.getAttribute('data-command');
     if(key==='fix'){m.applyCorrection();notice='Pre-authored expert correction replayed locally. Run the gate to verify.';}
     else if(key==='release-a'){m.loadReleaseA();notice='Loaded release A: five deliberately faulty synthetic traces.';}
     else if(key==='release-b'){m.loadReleaseB();notice='Loaded pre-authored release B. Run the regression gate to verify all twelve.';}
     else if(key==='gate'){const x=m.suite();notice=x.passed?'Every trace passed the deterministic suite.':'The regression gate blocked unverified traces.';}
     else if(key==='inject'){m.inject($('fault-select').value);notice='Fault reintroduced. Run the gate to see release blocked.';}
     else if(key==='clear'){m.clearInjection();notice='Injected fault removed. Re-run gate to verify.';}
     else if(key==='reset'){m.loadReleaseA();m.select('CASE-027');notice='Lab reset to initial fictional release A.';}
     render();
    }catch(e){notice='Action failed: '+String(e.message||e);render();}
   });
   render();
  }).catch(e=>{host.innerHTML='<div class="load-failed"><strong>Could not load recorded fixtures.</strong><p>'+escapeHTML(e.message)+'</p><a href="./reliability-loop-data.json">Inspect the evidence JSON ↗</a></div>';});
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot);else boot();
})(typeof window!=='undefined'?window:null);
