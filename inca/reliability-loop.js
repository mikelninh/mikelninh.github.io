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
    const m=createMachine(data);
    const firstId='CASE-027',first=m.getCase(firstId);
    let phase='initial',detailId=firstId;
    const baseline=m.suite(); // Deterministic check on all original fixtures, before any correction.
    const caught=baseline.planted_faults_exposed; // Already excludes any planted faults that escaped.
    $('proof-total').textContent=String(data.cases.length);
    $('proof-planted').textContent=String(baseline.seeded_faults);
    $('proof-caught').textContent=caught+' / '+baseline.seeded_faults;
    $('case-select').innerHTML=data.cases.map(c=>'<option value="'+escapeHTML(c.id)+'">'+escapeHTML(c.id)+' · '+escapeHTML(c.kind)+'</option>').join('');
    function renderAudit(){
      const c=m.getCase(detailId),snap=m.selectedSnapshot(detailId),t=snap.trace,result=m.result(detailId);
      $('case-select').value=detailId;
      $('case-audit-status').textContent=result.pass?'Checks passed':'Blocked for review';
      $('audit-checks').innerHTML=result.checks.map(k=>'<li class="'+(k.pass?'pass':'fail')+'"><strong>'+(k.pass?'✓ ':'! ')+escapeHTML(k.label)+'</strong><small>'+escapeHTML(k.detail)+'</small></li>').join('');
      $('audit-documents').innerHTML=snap.documents.map(d=>'<div class="document-row"><strong>'+escapeHTML(d.title)+'</strong> · '+escapeHTML(d.id)+'<br>'+escapeHTML(d.text)+'</div>').join('');
      const vals={'audit-source':t.source_id||'(missing)','audit-revision':t.selected_policy_revision||'(missing)','audit-quote':t.quote||'(missing)','audit-action':t.external_action||'(missing)','audit-steps':t.steps.join(' → '),'audit-gate':t.next_gate};
      for(const [id,value] of Object.entries(vals))$(id).textContent=value;
    }
    function render(){
      const snap=m.selectedSnapshot(firstId),used=snap.trace.selected_policy_revision,one=m.result(firstId),suite=m.suite();
      $('agent-year').textContent='Policy '+used;
      $('required-year').textContent='Policy '+first.required_policy_revision;
      $('compare-symbol').textContent=used===first.required_policy_revision?'=':'≠';
      $('verdict').hidden=phase==='initial';
      $('verdict').className='outcome'+(one.pass&&phase!=='initial'?' passed':'');
      $('primary-action').hidden=phase==='fixed'||phase==='all';
      $('primary-action').setAttribute('data-action',phase==='initial'?'run':phase==='blocked'?'fix':phase==='regressed'?'restore':'run');
      $('challenge-action').hidden=phase!=='fixed';
      $('restart-action').hidden=phase==='initial';
      if(phase==='initial'){
        $('step-label').textContent='Before the check';
        $('primary-action').textContent='Run the independent check →';
      }else if(phase==='blocked'){
        $('step-label').textContent='Caught by safety check';
        $('verdict-title').textContent='BLOCKED · Human review required';
        $('verdict-explain').textContent='The quote exists, but policy 2024 does not apply. The verifier refuses to let this example continue.';
        $('primary-action').textContent='Replay saved fix & retest →';
      }else if(phase==='fixed'){
        $('step-label').textContent='Rechecked';
        $('verdict-title').textContent='PASS · Correct policy verified';
        $('verdict-explain').textContent='This saved correction passes all six structural checks. Four other fictional cases remain blocked. No claim was approved or paid.';
      }else if(phase==='regressed'){
        $('step-label').textContent='Mistake reintroduced';
        $('verdict-title').textContent='BLOCKED AGAIN · Regression caught';
        $('verdict-explain').textContent='The old policy was reintroduced into the corrected example. The same check catches it again.';
        $('primary-action').textContent='Restore corrected example →';
      }else if(phase==='all'){
        $('step-label').textContent='All saved examples retested';
        $('verdict-title').textContent='12 / 12 scripted cases pass';
        $('verdict-explain').textContent='All five pre-written sample corrections pass the six structural checks. This is not a real-world approval or AI performance score.';
      }
      $('audit-suite-result').textContent=suite.passed_cases+'/'+data.cases.length+' fictional traces pass; '+suite.blocked_cases+' remain blocked. '+(suite.passed?'All saved examples pass these rules.':'Unsafe traces cannot proceed under these rules.');
      renderAudit();
    }
    host.addEventListener('click',event=>{
      const control=event.target.closest('[data-action]');
      if(!control)return;
      const action=control.getAttribute('data-action');
      try{
        if(action==='run'&&phase==='initial'){m.select(firstId);m.suite();phase='blocked';}
        else if(action==='fix'&&phase==='blocked'){m.select(firstId);m.applyCorrection();m.suite();phase='fixed';}
        else if(action==='regress'&&phase==='fixed'){m.select(firstId);m.inject('wrong_revision');m.suite();phase='regressed';}
        else if(action==='restore'&&phase==='regressed'){m.select(firstId);m.clearInjection();m.suite();phase='fixed';}
        else if(action==='reset'){m.loadReleaseA();m.select(firstId);m.suite();phase='initial';detailId=firstId;}
        else if(action==='all-examples'){m.loadReleaseB();m.select(firstId);m.suite();phase='all';}
        render();
      }catch(e){$('audit-suite-result').textContent='The demonstration action failed: '+String(e.message||e);}
    });
    $('case-select').addEventListener('change',event=>{detailId=event.target.value;renderAudit();});
    render();
  }).catch(e=>{
    host.innerHTML='<div class="demo"><strong>Could not load fictional test fixtures.</strong><p>'+escapeHTML(e.message)+'</p><a href="./reliability-loop-data.json">View the test data ↗</a></div>';
  });
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot);else boot();
})(typeof window!=='undefined'?window:null);
