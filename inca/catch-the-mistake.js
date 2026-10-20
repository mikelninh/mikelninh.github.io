(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{root.IncaMistakeChallenge=api;if(typeof document!=='undefined')api.mount(document);}
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const original=Object.freeze({
    source:'H-A-011 · developer-authored synthetic holdout A',
    recordedV2:'AUTO_READY',
    expected:'HUMAN_REVIEW',
    proposedV3:'HUMAN_REVIEW',
    issue:'cross-document contradiction flag ignored by guarded v2',
    note:'ST-104 document excerpts and dates are an illustrative reconstruction, not original H-A-011 documents.'
  });
  // All three documents are invented training examples. Only ST-104 is inspired by the
  // recorded H-A-011 rule-based miss. The other two are new illustrative controls.
  const cases=Object.freeze([
    Object.freeze({
      id:'ST-104', title:'Travel cancellation', claimType:'TRAVEL CLAIM', checkLabel:'CANCELLATION DATE', topic:'Cancellation check',
      caption:'Two cancellation records for the same summer trip.',
      docA:Object.freeze({type:'CUSTOMER NOTICE',title:'Stornierungsbestätigung',value:'11.07.2026',
        body:'Die Kundin meldet die Stornierung vor Reiseantritt.'}),
      docB:Object.freeze({type:'BOOKING RECORD',title:'Buchungssystem-Auszug',value:'12.07.2026',
        body:'Das Buchungssystem führt die Stornierung unter diesem Datum.'}),
      correct:'review',route:'HUMAN_REVIEW',signal:'1 DAY APART',
      heading:'Two dates, one claim — human review required.',
      explanation:'The cancellation dates conflict. Human review by a claims expert is needed before further processing.',
      before:Object.freeze({label:'BEFORE · RECORDED GUARDED V2',value:'AUTO_READY',
        note:'The recorded synthetic H-A-011 case passed the original router despite its contradiction flag.'}),
      after:Object.freeze({label:'AFTER · PROPOSED V3 REPLAY',value:'HUMAN_REVIEW',
        note:'A deterministic contradiction gate prevents automatic clearance on replay.'}),
      takeaway:'A failure becomes a concrete safeguard and a regression test.',
      provenance:'ST-104 reconstructs the documented synthetic H-A-011 routing failure; its displayed document excerpts and dates are illustrative, not original holdout evidence.'
    }),
    Object.freeze({
      id:'ST-207', title:'Water damage', claimType:'HOME CLAIM', checkLabel:'PHOTO EVIDENCE', topic:'Evidence check',
      caption:'A kitchen leak is reported, but the essential damage photos have not arrived.',
      docA:Object.freeze({type:'CUSTOMER REPORT',title:'Wasserschadenmeldung',value:'PROMISED',
        body:'Wasser trat unter der Spüle aus. Fotos kann ich später nachreichen.'}),
      docB:Object.freeze({type:'EVIDENCE CHECKLIST',title:'Eingangsprüfung',value:'NOT RECEIVED',
        body:'Schadensfotos fehlen im eingereichten Vorgang.'}),
      correct:'need_info',route:'NEED_INFO',signal:'PHOTOS MISSING',
      heading:'The claim needs supporting evidence.',
      explanation:'A promise to send photos is not the photos. Request the missing evidence and avoid deciding coverage from an incomplete file.',
      before:Object.freeze({label:'RECEIVED EVIDENCE · ILLUSTRATIVE',value:'INCOMPLETE',
        note:'The customer described a leak, but no damage photos were attached.'}),
      after:Object.freeze({label:'SAFE NEXT STEP · ILLUSTRATIVE',value:'NEED_INFO',
        note:'Ask for the missing photos, then resume the remaining policy and damage checks.'}),
      takeaway:'A helpful assistant knows when to ask for information instead of guessing.',
      provenance:'ST-207 is a new fictional control case; it is not a measured H-A-011 failure or independent model test.'
    }),
    Object.freeze({
      id:'ST-318', title:'Bicycle theft', claimType:'THEFT CLAIM', checkLabel:'FRAME NUMBER', topic:'Consistency check',
      caption:'The police report and purchase receipt show the same bicycle frame number.',
      docA:Object.freeze({type:'POLICE REPORT',title:'Diebstahlanzeige',value:'BIKE-4832',
        body:'Das entwendete Fahrrad wird mit dieser Rahmennummer gemeldet.'}),
      docB:Object.freeze({type:'PURCHASE RECEIPT',title:'Kaufbeleg',value:'BIKE-4832',
        body:'Die Rechnung weist dieselbe Rahmennummer aus.'}),
      correct:'continue',route:'CONTINUE_CHECKS',signal:'FRAME MATCH',
      heading:'Both sources match — continue the remaining checks.',
      explanation:'The bicycle frame numbers agree. The file can continue to coverage, ownership and other checks. This is not approval or a payment decision.',
      before:Object.freeze({label:'IDENTITY CHECK · ILLUSTRATIVE',value:'FRAME MATCH',
        note:'The police report and purchase receipt share the same frame number.'}),
      after:Object.freeze({label:'SAFE NEXT STEP · ILLUSTRATIVE',value:'CONTINUE_CHECKS',
        note:'Only the document consistency check is clear. Coverage and further evidence still need review.'}),
      takeaway:'Good operations also knows when not to escalate: agreeing evidence can continue to the next gate.',
      provenance:'ST-318 is a new fictional control case, not a measured AI prediction or permission to pay.'
    })
  ]);
  const byId=Object.fromEntries(cases.map(c=>[c.id,c]));
  const choices=Object.freeze(['continue','need_info','review']);
  const choiceNames=Object.freeze({continue:'Continue checks',need_info:'Request information',review:'Human review'});
  function decide(choice,caseId='ST-104'){
    if(!choices.includes(choice))throw Error('invalid_choice');
    const example=byId[caseId];
    if(!example)throw Error('invalid_case');
    const caught=choice===example.correct;
    return Object.freeze({
      choice,caseId,caught,correct:caught,expected:example.correct,route:example.route,
      example,original:caseId==='ST-104'?original:null,effects:0,
      heading:caught?example.heading:(caseId==='ST-104'&&choice==='continue'?'That was the mistake the original router made.':'Not quite — this case needs: '+choiceNames[example.correct]+'.'),
      explanation:example.explanation,
      oldRoute:example.before.value,updatedRoute:example.after.value
    });
  }
  function mount(doc){
    const area=doc.getElementById('mistake-challenge');
    if(!area)return;
    const get=id=>doc.getElementById(id);
    const reveal=get('mc-reveal'),status=get('mc-status'),heading=get('mc-result-heading');
    const explanation=get('mc-result-description'),reset=get('mc-reset'),next=get('mc-next');
    const actions=Array.from(area.querySelectorAll('[data-mc-choice]'));
    const tabs=Array.from(area.querySelectorAll('[data-mc-case]'));
    const required=['mc-case-id','mc-case-name','mc-case-caption','mc-case-progress','mc-correct-count',
      'mc-claim-type','mc-doc-a-check','mc-doc-b-check','mc-doc-a-type','mc-doc-a-title','mc-doc-a-date','mc-doc-a-body',
      'mc-doc-b-type','mc-doc-b-title','mc-doc-b-date','mc-doc-b-body',
      'mc-old-label','mc-old-route','mc-old-explanation','mc-new-label','mc-new-route',
      'mc-new-explanation','mc-difference','mc-takeaway-text','mc-provenance','mc-finish','mc-finish-score','mc-finish-copy'];
    if(!reveal||!status||!heading||!explanation||!reset||!next||actions.length!==3||tabs.length!==3||
      required.some(id=>!get(id)))throw Error('challenge_markup_incomplete');
    const answers=new Map();
    let active=cases[0].id;
    function setText(id,value){get(id).textContent=value;}
    function render(){
      const c=byId[active],answer=answers.get(active);
      setText('mc-case-id',c.id);setText('mc-case-name',c.title);setText('mc-claim-type',c.claimType);
      setText('mc-case-caption',c.caption);setText('mc-doc-a-check',c.checkLabel);setText('mc-doc-b-check',c.checkLabel);
      for(const [prefix,data] of [['mc-doc-a',c.docA],['mc-doc-b',c.docB]]){
        setText(prefix+'-type',data.type);setText(prefix+'-title',data.title);
        setText(prefix+'-date',data.value);setText(prefix+'-body',data.body);
      }
      tabs.forEach(tab=>{
        const id=tab.getAttribute('data-mc-case');
        tab.setAttribute('aria-pressed',String(id===active));
        tab.classList.toggle('mc-case-done',answers.has(id));
      });
      setText('mc-case-progress',answers.size+' / '+cases.length+' decisions');
      setText('mc-correct-count',Array.from(answers.values()).filter(a=>a.correct).length+' correct');
      const progress=get('mc-progress-bar');
      if(progress)progress.value=answers.size;
      const finished=answers.size===cases.length;
      get('mc-finish').hidden=!finished;
      if(finished){
        const correctCount=Array.from(answers.values()).filter(a=>a.correct).length;
        setText('mc-finish-score',correctCount+' / '+cases.length);
        setText('mc-finish-copy',correctCount===cases.length?
          'Three distinct cases, three defensible next steps. You kept the checks moving without approving a payout.':
          'Three cases reviewed. Revisit a decision to learn why each route matters — no automatic payments or messages were sent.');
      }
      actions.forEach(button=>{
        button.disabled=!!answer;
        button.setAttribute('aria-pressed',String(!!answer&&answer.choice===button.getAttribute('data-mc-choice')));
      });
      area.classList.toggle('mc-answered',!!answer);
      area.classList.toggle('mc-clean-case',!!answer&&c.correct==='continue');
      area.classList.toggle('mc-success',!!answer&&answer.correct);
      reveal.hidden=!answer;
      status.textContent=answer?'Decision recorded. '+(answer.correct?'Correct!':'See the correct route below.'):'Inspect both sources, then make your call.';
      if(!answer)return;
      heading.textContent=answer.heading;explanation.textContent=answer.explanation;
      setText('mc-difference',c.signal);
      setText('mc-old-label',c.before.label);setText('mc-old-route',c.before.value);
      setText('mc-old-explanation',c.before.note);
      setText('mc-new-label',c.after.label);setText('mc-new-route',c.after.value);
      setText('mc-new-explanation',c.after.note);
      setText('mc-takeaway-text',c.takeaway);
      setText('mc-provenance',c.provenance);
      next.textContent=answers.size===cases.length?'Replay all three ↻':'Next case →';
    }
    tabs.forEach(tab=>tab.addEventListener('click',()=>{
      const id=tab.getAttribute('data-mc-case');
      if(!byId[id])return;
      active=id;render();
    }));
    actions.forEach(button=>button.addEventListener('click',()=>{
      if(answers.has(active))return;
      answers.set(active,decide(button.getAttribute('data-mc-choice'),active));
      render();
    }));
    reset.addEventListener('click',()=>{answers.delete(active);render();});
    next.addEventListener('click',()=>{
      if(answers.size===cases.length){answers.clear();active=cases[0].id;}
      else active=cases.find(c=>!answers.has(c.id)).id;
      render();
      get('mc-heading').focus({preventScroll:true});
    });
    render();
  }
  return {original,cases,choices,choiceNames,decide,mount};
});