(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{
    root.IncaOperatorShift=api;
    if(typeof document!=='undefined')api.mount(document,root.IncaCaseWorkshop);
  }
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const sample=Object.freeze({
    id:'ST-104',sourceCase:'H-A-011',policy:'REI-COV-01',kind:'Reisestorno',fictional:true,
    a:'Reise ST-104 | Kundenmitteilung\nStornierungsdatum: 11.07.2026\nHinweis: Kundin meldet Stornierung vor Reiseantritt.',
    b:'Reise ST-104 | Buchungssystem-Auszug\nStornierungsdatum: 12.07.2026\nHinweis: Buchungssystem nennt einen anderen Tag.'
  });
  const validRoutes=Object.freeze(['HUMAN_REVIEW','NEED_INFO','CONTINUE_CHECKS']);
  const labels=Object.freeze({
    HUMAN_REVIEW:'Escalate to claims expert',
    NEED_INFO:'Request missing information',
    CONTINUE_CHECKS:'Continue remaining checks'
  });
  const nextSteps=Object.freeze({
    HUMAN_REVIEW:'Claims expert verifies conflicting dates against the originals before any further routing.',
    NEED_INFO:'Request reliable dated evidence from the customer or booking provider.',
    CONTINUE_CHECKS:'Complete policy, coverage and other outstanding checks. No payout or clearance.'
  });
  function analyze(core,docA,docB){
    if(!core||typeof core.evaluate!=='function')throw Error('missing_evaluation_engine');
    const result=core.evaluate(docA,docB);
    if(!validRoutes.includes(result.route)||result.externalActions!==0)throw Error('unsafe_evaluation_result');
    return Object.freeze({result, route:result.route,reason:result.reason,
      snippets:[
        result.sourceA.length?result.sourceA.map(x=>x.excerpt).join(' | '):'No date identified in source A',
        result.sourceB.length?result.sourceB.map(x=>x.excerpt).join(' | '):'No date identified in source B'
      ],
      action:nextSteps[result.route],
      reviewRequired:result.route==='HUMAN_REVIEW',
      externalActions:0,
      boundary:'A browser-local labelled-date check. Not a PDF parser, LLM decision, coverage judgment or real insurer route.'
    });
  }
  function prepareHandoff(core,{a,b,owner,notes,route,verified}){
    const latest=analyze(core,a,b);
    if(!verified)throw Error('source_verification_required');
    const reviewer=String(owner||'').trim();
    const comment=String(notes||'').trim();
    if(reviewer.length<2||reviewer.length>100)throw Error('review_owner_required');
    if(comment.length<8||comment.length>2000)throw Error('substantive_reviewer_note_required');
    if(!validRoutes.includes(route)||route!==latest.route)throw Error('unsafe_route_override_change_sources_and_recheck');
    const header=[
      '# ST-104 | Synthetic operator handoff',
      '',
      'Status: PREPARED FOR HUMAN HANDOFF — NOT SENT',
      'Case representation: fictional ST-104 documents inspired by a separate H-A-011 synthetic routing failure',
      'Policy reference: REI-COV-01 (illustrative only)',
      'Reviewed next step: '+route+' — '+labels[route],
      'Reviewer / proposed owner: '+reviewer,
      'Owner acceptance: NOT CONFIRMED (local demo only)',
      'Review action: '+latest.action,
      'Hand-back condition: original dates verified or missing evidence resolved before further checks',
      'Verified by operator in browser: YES (self-attested, not independently audited)',
      'Operator note: '+comment,
      '',
      '## Next action and communication',
      'Customer draft: NOT SENT, requires insurer policy review',
      latest.result.customerUpdate,
      '',
      '## Technical evidence'
    ].join('\n');
    const trace=core.makeNote(latest.result,a,b,comment);
    const footer=[
      '',
      '## Evidence and validation boundary',
      'Known prior synthetic failure H-A-011: guarded v2 AUTO_READY with contradiction flag true.',
      'This ST-104 document check is a reconstruction; its dates and documents were not used to produce the historical v2 score.',
      'The check is deterministic labelled-date matching, not an LLM or actual insurance claim adjudication.',
      'Actual handoff acceptance, resolution time, operator correction rate, and insurance outcomes were NOT measured.',
      'No external messages, payments or case-management writes occurred.'
    ].join('\n');
    return Object.freeze({route,reviewer,comment,text:header+'\n\n'+trace+'\n'+footer,externalActions:0,
      preview:{owner:reviewer,route,nextAction:latest.action,sourceQuotes:latest.snippets,
        draft:latest.result.customerUpdate,handBack:'Confirm the original cancellation date with a claims expert.'}});
  }
  function regression(core,{a,b,expected,why}){
    if(!validRoutes.includes(expected))throw Error('invalid_expected_route');
    if(String(why||'').trim().length<8)throw Error('explain_expected_route');
    const out=core.makeRegressionCase(a,b,expected,why);
    if(out.production_case!==false)throw Error('unsafe_fixture_type');
    return Object.freeze({...out,
      prepared_by:'INCA Operator Shift synthetic workshop',
      note:'Candidate only. Not a verified correction, not part of the independently held-out evaluation, and not automatically added to CI.',
      external_actions:0});
  }
  function mount(doc,core){
    const root=doc.getElementById('shift-app');
    if(!root)return;
    const $=id=>doc.getElementById(id);
    if(!core||typeof core.evaluate!=='function')throw Error('missing_evaluation_engine');
    const a=$('sh-a'),b=$('sh-b'),owner=$('sh-owner'),notes=$('sh-notes');
    const required=['sh-scan','sh-review','sh-export','sh-regression','sh-status','sh-route','sh-reason',
      'sh-quote-a','sh-quote-b','sh-old','sh-new','sh-preview','sh-review-step','sh-export-step','sh-qa-step',
      'sh-confirm','sh-next','sh-draft','sh-route-next','sh-fixture-expected','sh-fixture-why','sh-a','sh-b'];
    if(required.some(id=>!$(id)))throw Error('operator_shift_markup_incomplete');
    let analysis=null,receipt=null;
    const set=(id,text)=>$(id).textContent=text;
    function setStage(number,status){
      const el=$('sh-stage-'+number);if(el){el.setAttribute('data-status',status);el.textContent=status==='done'?'✓':String(number);}
    }
    function invalidate(){
      analysis=null;receipt=null;
      $('sh-review').disabled=true;$('sh-export').disabled=true;$('sh-regression').disabled=true;
      $('sh-preview').hidden=true;$('sh-review-step').hidden=true;$('sh-export-step').hidden=true;$('sh-qa-step').hidden=true;
      $('sh-scan').disabled=false;
      for(const step of [2,3,4,5])setStage(step,'pending');
      set('sh-status','Source text changed. Run the evidence check again; previous decisions are invalidated.');
      set('sh-route','NOT CHECKED');set('sh-reason','No evidence check has run on the current documents.');
      set('sh-quote-a','—');set('sh-quote-b','—');
      set('sh-next','Run the check before routing.');
    }
    function scan(){
      analysis=analyze(core,a.value,b.value);receipt=null;
      $('sh-preview').hidden=false;$('sh-review-step').hidden=false;$('sh-export-step').hidden=true;$('sh-qa-step').hidden=true;
      $('sh-review').disabled=false;
      $('sh-export').disabled=true;$('sh-regression').disabled=true;
      set('sh-route',analysis.route);set('sh-reason',analysis.reason);
      set('sh-next',analysis.action);
      set('sh-quote-a',analysis.snippets[0]);set('sh-quote-b',analysis.snippets[1]);
      set('sh-old','AUTO_READY');set('sh-new',analysis.route);
      set('sh-draft',analysis.result.customerUpdate);
      set('sh-route-next',labels[analysis.route]);
      $('sh-fixture-expected').value=analysis.route;
      set('sh-status','Evidence checked locally. Proposed route: '+analysis.route+'. No claim was sent or approved.');
      setStage(2,'done');setStage(3,'pending');setStage(4,'pending');setStage(5,'pending');
    }
    function review(){
      if(!analysis)return;
      try{
        receipt=prepareHandoff(core,{a:a.value,b:b.value,owner:owner.value,notes:notes.value,
          route:analysis.route,verified:$('sh-confirm').checked});
        $('sh-export-step').hidden=false;$('sh-qa-step').hidden=false;
        $('sh-export').disabled=false;$('sh-regression').disabled=false;
        set('sh-status','Review prepared for '+receipt.reviewer+'. Handoff is local and unsent.');
        set('sh-review-error','');
        setStage(3,'done');setStage(4,'done');
        set('sh-preview-owner',receipt.preview.owner);
        set('sh-preview-route',receipt.route);
        set('sh-preview-action',receipt.preview.nextAction);
        set('sh-preview-draft',receipt.preview.draft);
      }catch(e){receipt=null;$('sh-export').disabled=true;$('sh-regression').disabled=true;
        set('sh-review-error',String(e.message).replace(/_/g,' '));}
    }
    function download(name,text,mime){
      const blob=new Blob([text],{type:mime});
      const url=URL.createObjectURL(blob);
      const link=doc.createElement('a');
      link.href=url;link.download=name;doc.body.appendChild(link);link.click();link.remove();
      URL.revokeObjectURL(url);
    }
    $('sh-scan').addEventListener('click',scan);
    $('sh-review').addEventListener('click',review);
    $('sh-export').addEventListener('click',()=>{
      if(!receipt)return;
      download('ST-104-human-review-handoff.md',receipt.text,'text/markdown;charset=utf-8');
      set('sh-status','Handoff file downloaded locally. No external case or customer action occurred.');
    });
    $('sh-regression').addEventListener('click',()=>{
      if(!receipt)return;
      try{
        const fixture=regression(core,{a:a.value,b:b.value,expected:$('sh-fixture-expected').value,
          why:$('sh-fixture-why').value});
        download('ST-104-regression-CANDIDATE.json',JSON.stringify(fixture,null,2)+'\n','application/json;charset=utf-8');
        set('sh-qa-status','Candidate downloaded for independent review. Not installed in CI.');
        setStage(5,'done');
      }catch(e){set('sh-qa-status',String(e.message).replace(/_/g,' '));}
    });
    [a,b].forEach(el=>el.addEventListener('input',invalidate));
    [owner,notes,$('sh-confirm')].forEach(el=>el.addEventListener('input',()=>{
      if(receipt){receipt=null;$('sh-export').disabled=true;$('sh-regression').disabled=true;setStage(4,'pending');setStage(5,'pending');}
    }));
    $('sh-reset').addEventListener('click',()=>{
      a.value=sample.a;b.value=sample.b;owner.value='';notes.value='';$('sh-confirm').checked=false;
      $('sh-fixture-why').value='';set('sh-review-error','');set('sh-qa-status','');
      invalidate();set('sh-status','Case reset. Start with the two fictional source excerpts.');
    });
    invalidate();
    set('sh-status','Start here: read the two synthetic documents, then run the evidence check.');
  }
  return {sample,validRoutes,labels,nextSteps,analyze,prepareHandoff,regression,mount};
});