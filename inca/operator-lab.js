(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else{root.IncaOperatorLab=api;if(typeof document!=='undefined')api.mount(document)}
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const cases={
  'H-A-011':{id:'H-A-011',title:'Conflicting cancellation dates',policy:'REI-COV-01',contradiction:true,v2:'AUTO_READY',expected:'HUMAN_REVIEW'},
  'H-A-012':{id:'H-A-012',title:'No contradiction flag',policy:'REI-COV-01',contradiction:false,v2:'AUTO_READY',expected:'AUTO_READY'}
 };
 const route=c=>{
  if(!c||typeof c.contradiction!=='boolean'||!['AUTO_READY','HUMAN_REVIEW'].includes(c.v2))throw Error('invalid_claim');
  const v3=c.contradiction?'HUMAN_REVIEW':c.v2;
  return Object.freeze({id:c.id,v2:c.v2,v3,expected:c.expected,match:v3===c.expected,reason:c.contradiction?'cross_document_date_conflict':'guarded_checks_pass',effects:0,method:'already inspected holdout replay, not fresh test'});
 };
 const check=()=>({passed:Object.values(cases).filter(x=>route(x).match&&route(x).effects===0).length,total:Object.keys(cases).length});
 function mount(doc){
  const $=id=>doc.getElementById(id);if(!$('opReplay'))return;
  let selected=cases['H-A-011'],played=false;
  const render=()=>{
   let r=route(selected);$('opId').textContent=selected.id;$('opName').textContent=selected.title;
   $('opIntro').textContent=selected.contradiction?'A cross-document cancellation-date conflict requires human review.':'No contradictory-date marker in this developer-authored synthetic record.';
   $('opBefore').textContent=r.v2;$('opAfter').textContent=r.v3;
   $('opReceipt').textContent=JSON.stringify({caseId:selected.id,policy:selected.policy,contradiction:selected.contradiction,recordedV2:r.v2,proposedV3:r.v3,expected:r.expected,externalEffects:0,warning:r.method},null,2);
   $('opRunTests').disabled=!played;
  };
  doc.querySelectorAll('[data-op-case]').forEach(b=>b.addEventListener('click',()=>{
   selected=cases[b.getAttribute('data-op-case')]||cases['H-A-011'];played=false;
   doc.querySelectorAll('[data-op-case]').forEach(x=>{const active=x.getAttribute('data-op-case')===selected.id;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active))});
   $('opFeedback').textContent='Selected '+selected.id+'. Replay the deterministic guard.';render();
  }));
  $('opReplay').addEventListener('click',()=>{
   played=true;let r=route(selected);render();
   $('opFeedback').textContent=r.v2+' → '+r.v3+' · '+r.reason+' · expected route matches: '+(r.match?'yes':'no')+' · no external action.';
  });
  $('opRunTests').addEventListener('click',()=>{
   if(!played)return;let result=check();
   $('opFeedback').textContent='Local replay: '+result.passed+'/'+result.total+' synthetic checks. This is NOT the independent 12/12 regression B result.';
  });render();
 }
 return {cases,route,check,mount};
});