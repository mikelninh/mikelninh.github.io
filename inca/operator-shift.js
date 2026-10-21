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
  const handBack=Object.freeze({
    HUMAN_REVIEW:'Original cancellation date verified by claims expert; outcome logged before returning to checks.',
    NEED_INFO:'Required dated source received and reviewed before running verification again.',
    CONTINUE_CHECKS:'Coverage, eligibility and other outstanding evidence checks finished by authorized operators.'
  });
  const nextSteps=Object.freeze({
    HUMAN_REVIEW:'Claims expert verifies conflicting dates against the originals before any further routing.',
    NEED_INFO:'Request reliable dated evidence from the customer or booking provider.',
    CONTINUE_CHECKS:'Complete policy, coverage and other outstanding checks. No payout or clearance.'
  });
  const proposalTemplates=Object.freeze({
    HUMAN_REVIEW:Object.freeze({
      owner:'Claims expert · Travel queue',
      questions:Object.freeze([
        'Which cancellation date is supported by the original documents?',
        'Could one date be a booking-system update rather than the cancellation itself?',
        'Who verifies the source of truth and records the final date?'
      ])}),
    NEED_INFO:Object.freeze({
      owner:'Claims intake · Evidence request',
      questions:Object.freeze([
        'Which original dated booking or cancellation document is still missing?',
        'Who should request the missing evidence and from which source?',
        'What must be received before we rerun the document check?'
      ])}),
    CONTINUE_CHECKS:Object.freeze({
      owner:'Claims operations · Coverage checks',
      questions:Object.freeze([
        'Which coverage and policy checks remain open?',
        'Which required documents must be checked before settlement?',
        'Who records completion of the remaining checks?'
      ])})
  });
  function suggestHandoff(analysis){
    if(!analysis||!validRoutes.includes(analysis.route))throw Error('invalid_route_for_proposal');
    const t=proposalTemplates[analysis.route];
    return Object.freeze({
      owner:t.owner,
      note:t.questions[0],
      questions:t.questions.slice(),
      route:analysis.route,
      action:analysis.action,
      handBack:handBack[analysis.route],
      evidence:analysis.snippets.slice(),
      draft:analysis.result.customerUpdate,
      status:'AUTO-DRAFT · UNVERIFIED · NOT SENT'
    });
  }
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
      'Status: PREPARED OPERATOR HANDOFF — NOT SENT',
      'Case representation: fictional ST-104 documents inspired by a separate H-A-011 synthetic routing failure',
      'Policy reference: REI-COV-01 (illustrative only)',
      'Reviewed next step: '+route+' — '+labels[route],
      'Reviewer / proposed owner: '+reviewer,
      'Owner acceptance: NOT CONFIRMED (local demo only)',
      'Review action: '+latest.action,
      'Hand-back condition: '+handBack[route],
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
        draft:latest.result.customerUpdate,handBack:handBack[route]}});
  }
  function regression(core,{a,b,expected,why}){
    if(!validRoutes.includes(expected))throw Error('invalid_expected_route');
    if(String(why||'').trim().length<8)throw Error('explain_expected_route');
    const out=core.makeRegressionCase(a,b,expected,why);
    if(out.production_case!==false)throw Error('unsafe_fixture_type');
    return Object.freeze({...out,
      prepared_by:'INCA Operator Shift synthetic workshop',
      note:'Candidate only. Simulated reviewer feedback; not a real expert response, not a verified correction, not independent holdout and not automatically added to CI.',
      feedback_origin:'USER-SIMULATED · NOT AN INCA CLAIMS EXPERT',
      candidate_kind:out.disagreement?'CORRECTION_PROPOSAL':'AGREEMENT_CONTROL',
      improvement_steps:Object.freeze([
        '1. Candidate recorded locally: completed',
        '2. Independent expert validates source and expected label: NOT DONE',
        '3. Approved test fixture added to repository and CI: NOT DONE',
        '4. Fix passes regression and separately held-out validation: NOT DONE',
        '5. Shadow-mode expert corrections and false escalations measured: NOT DONE'
      ]),
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
      'sh-confirm','sh-next','sh-draft','sh-route-next','sh-fixture-expected','sh-fixture-why','sh-a','sh-b','sh-preview-handback',
      'sh-suggested-owner','sh-suggested-note','sh-auto-preview','sh-auto-owner','sh-auto-question','sh-auto-action',
      'sh-auto-a','sh-auto-b','sh-feedback-result','sh-feedback-next','sh-feedback-title'];
    if(required.some(id=>!$(id)))throw Error('operator_shift_markup_incomplete');
    let analysis=null,receipt=null,proposal=null;
    const set=(id,text)=>$(id).textContent=text;
    function setStage(number,status){
      const el=$('sh-stage-'+number);if(el){el.setAttribute('data-status',status);el.textContent=status==='done'?'✓':String(number);}
    }
    function invalidate(){
      analysis=null;receipt=null;proposal=null;
      $('sh-feedback-result').hidden=true;$('sh-feedback-next').textContent='';$('sh-auto-preview').hidden=true;
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
      analysis=analyze(core,a.value,b.value);receipt=null;proposal=suggestHandoff(analysis);
      owner.value=proposal.owner;notes.value=proposal.note;$('sh-confirm').checked=false;
      set('sh-suggested-owner',proposal.owner);set('sh-suggested-note',proposal.note);
      set('sh-auto-owner',proposal.owner);set('sh-auto-question',proposal.note);
      set('sh-auto-action',proposal.action);
      set('sh-auto-a',proposal.evidence[0]);set('sh-auto-b',proposal.evidence[1]);
      $('sh-auto-preview').hidden=false;$('sh-feedback-result').hidden=true;
      const chips=Array.from(doc.querySelectorAll('[data-sh-question]'));
      chips.forEach((chip,i)=>{chip.textContent=proposal.questions[i]||'';chip.hidden=!proposal.questions[i];});
      $('sh-preview').hidden=false;$('sh-review-step').hidden=false;$('sh-export-step').hidden=true;$('sh-qa-step').hidden=true;
      $('sh-review').disabled=false;
      $('sh-export').disabled=true;$('sh-regression').disabled=true;
      set('sh-review-error','');set('sh-qa-status','');
      set('sh-route',analysis.route);set('sh-reason',analysis.reason);
      set('sh-next',analysis.action);
      set('sh-quote-a',analysis.snippets[0]);set('sh-quote-b',analysis.snippets[1]);
      set('sh-old','AUTO_READY');set('sh-new',analysis.route);
      set('sh-draft',analysis.result.customerUpdate);
      set('sh-route-next',labels[analysis.route]);
      $('sh-fixture-expected').value=analysis.route;
      set('sh-status','Evidence checked. A proposed owner, review question and evidence-linked handoff draft were prepared automatically. Verify them before exporting; nothing has been sent.');
      setStage(2,'done');setStage(3,'pending');setStage(4,'pending');setStage(5,'pending');
    }
    function review(){
      if(!analysis)return;
      try{
        receipt=prepareHandoff(core,{a:a.value,b:b.value,owner:owner.value,notes:notes.value,
          route:analysis.route,verified:$('sh-confirm').checked});
        $('sh-export-step').hidden=false;$('sh-qa-step').hidden=false;
        $('sh-feedback-result').hidden=true;
        $('sh-export').disabled=false;$('sh-regression').disabled=false;
        set('sh-status','Operator confirmed the local handoff draft for '+receipt.reviewer+'. No real assignment, message or case update occurred.');
        set('sh-review-error','');
        setStage(3,'done');setStage(4,'done');
        set('sh-preview-owner',receipt.preview.owner);
        set('sh-preview-route',receipt.route);
        set('sh-preview-action',receipt.preview.nextAction);
        set('sh-preview-handback',receipt.preview.handBack);
        set('sh-draft',receipt.preview.draft);
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
      download('ST-104-'+receipt.route.toLowerCase().replace(/_/g,'-')+'-handoff.md',receipt.text,'text/markdown;charset=utf-8');
      set('sh-status','Handoff file downloaded locally. No external case or customer action occurred.');
    });
    $('sh-regression').addEventListener('click',()=>{
      if(!receipt)return;
      try{
        const fixture=regression(core,{a:a.value,b:b.value,expected:$('sh-fixture-expected').value,
          why:$('sh-fixture-why').value});
        download('ST-104-'+(fixture.disagreement?'correction':'agreement')+'-CANDIDATE.json',JSON.stringify(fixture,null,2)+'\n','application/json;charset=utf-8');
        $('sh-feedback-result').hidden=false;
        set('sh-feedback-title',fixture.disagreement?'Simulated disagreement captured':'Simulated agreement captured');
        set('sh-feedback-next',fixture.disagreement
          ? 'The simulated reviewer suggests '+fixture.expected_route+' rather than '+fixture.observed_route+'. This does NOT modify the rule. A real expert must validate the evidence and label, an engineer must approve the change, and CI plus fresh holdout tests must pass before any rollout.'
          : 'The simulated reviewer agrees with '+fixture.observed_route+'. This control candidate helps prevent future unintended changes only after independent validation and integration into CI. Nothing has been deployed.');
        set('sh-qa-status','Local candidate downloaded. Expert review → versioned test → CI → shadow mode are still pending.');
        setStage(5,'done');
      }catch(e){set('sh-qa-status',String(e.message).replace(/_/g,' '));}
    });
    [a,b].forEach(el=>el.addEventListener('input',invalidate));
    Array.from(doc.querySelectorAll('[data-sh-question]')).forEach((chip,i)=>chip.addEventListener('click',()=>{
      if(!proposal||!proposal.questions[i])return;
      notes.value=proposal.questions[i];
      notes.dispatchEvent(new Event('input',{bubbles:true}));
    }));
    const useOwner=$('sh-use-owner');
    if(useOwner)useOwner.addEventListener('click',()=>{
      if(!proposal)return;owner.value=proposal.owner;owner.dispatchEvent(new Event('input',{bubbles:true}));
    });
    [owner,notes,$('sh-confirm')].forEach(el=>el.addEventListener('input',()=>{
      if(receipt){receipt=null;$('sh-export').disabled=true;$('sh-regression').disabled=true;$('sh-export-step').hidden=true;$('sh-qa-step').hidden=true;$('sh-feedback-result').hidden=true;setStage(3,'pending');setStage(4,'pending');setStage(5,'pending');set('sh-status','Reviewer details changed. Reconfirm the handoff before exporting.');}
    }));
    $('sh-reset').addEventListener('click',()=>{
      a.value=sample.a;b.value=sample.b;owner.value='';notes.value='';$('sh-confirm').checked=false;$('sh-auto-preview').hidden=true;
      $('sh-fixture-why').value='';set('sh-review-error','');set('sh-qa-status','');
      invalidate();set('sh-status','Case reset. Start with the two fictional source excerpts.');
    });
    invalidate();
    set('sh-status','Start here: read the two synthetic documents, then run the evidence check.');
  }
  return {sample,validRoutes,labels,nextSteps,proposalTemplates,suggestHandoff,analyze,prepareHandoff,regression,mount};
});