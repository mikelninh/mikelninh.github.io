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
      id:'ST-104', title:'Summer escape', topic:'Cancellation check',
      caption:'Two cancellation records for the same summer trip.',
      docA:Object.freeze({type:'CUSTOMER NOTICE',title:'Stornierungsbestätigung',date:'11.07.2026',
        body:'Die Kundin meldet die Stornierung vor Reiseantritt.'}),
      docB:Object.freeze({type:'BOOKING RECORD',title:'Buchungssystem-Auszug',date:'12.07.2026',
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
      id:'ST-207', title:'City weekend', topic:'Evidence check',
      caption:'A customer message and an incomplete booking record.',
      docA:Object.freeze({type:'CUSTOMER NOTICE',title:'Stornierungsbestätigung',date:'18.08.2026',
        body:'Die Kundin nennt ein Stornierungsdatum.'}),
      docB:Object.freeze({type:'BOOKING RECORD',title:'Buchungssystem-Auszug',date:'NOT PROVIDED',
        body:'Das Stornierungsdatum ist in diesem Auszug nicht dokumentiert.'}),
      correct:'need_info',route:'NEED_INFO',signal:'DATE MISSING',
      heading:'A required date is missing.',
      explanation:'There is no second cancellation date to verify. Request reliable supporting information rather than guessing or treating it as a proven contradiction.',
      before:Object.freeze({label:'SOURCE STATUS · ILLUSTRATIVE',value:'INCOMPLETE',
        note:'One source includes a date; the second does not document one.'}),
      after:Object.freeze({label:'SAFE NEXT STEP · ILLUSTRATIVE',value:'NEED_INFO',
        note:'Ask for the missing information before returning to the other claim checks.'}),
      takeaway:'Not every blocked claim needs an investigation. Sometimes the right action is to ask.',
      provenance:'ST-207 is a new fictional control case; it is not a measured H-A-011 failure or independent model test.'
    }),
    Object.freeze({
      id:'ST-318', title:'Mountain getaway', topic:'Consistency check',
      caption:'Two sources report the same cancellation date.',
      docA:Object.freeze({type:'CUSTOMER NOTICE',title:'Stornierungsbestätigung',date:'06.09.2026',
        body:'Der Kunde meldet die Stornierung für dieses Datum.'}),
      docB:Object.freeze({type:'BOOKING RECORD',title:'Buchungssystem-Auszug',date:'06.09.2026',
        body:'Das Buchungssystem bestätigt das gleiche Datum.'}),
      correct:'continue',route:'CONTINUE_CHECKS',signal:'DATES MATCH',
      heading:'The dates agree — continue the remaining checks.',
      explanation:'No date discrepancy was found. The claim may proceed to coverage and other evidence checks, but this is not approval or a payment decision.',
      before:Object.freeze({label:'DOCUMENT CHECK · ILLUSTRATIVE',value:'DATES MATCH',
        note:'Both fictional sources state the same valid cancellation date.'}),
      after:Object.freeze({label:'SAFE NEXT STEP · ILLUSTRATIVE',value:'CONTINUE_CHECKS',
        note:'Only the cancellation-date consistency gate is clear. All other checks remain.'}),
      takeaway:'Good operations should not escalate every case. It should route attention where it is needed.',
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
      'mc-doc-a-type','mc-doc-a-title','mc-doc-a-date','mc-doc-a-body',
      'mc-doc-b-type','mc-doc-b-title','mc-doc-b-date','mc-doc-b-body',
      'mc-old-label','mc-old-route','mc-old-explanation','mc-new-label','mc-new-route',
      'mc-new-explanation','mc-difference','mc-takeaway-text','mc-provenance'];
    if(!reveal||!status||!heading||!explanation||!reset||!next||actions.length!==3||tabs.length!==3||
      required.some(id=>!get(id)))throw Error('challenge_markup_incomplete');
    const answers=new Map();
    let active=cases[0].id;
    function setText(id,value){get(id).textContent=value;}
    function render(){
      const c=byId[active],answer=answers.get(active);
      setText('mc-case-id',c.id);setText('mc-case-name',c.title);
      setText('mc-case-caption',c.caption);
      for(const [prefix,data] of [['mc-doc-a',c.docA],['mc-doc-b',c.docB]]){
        setText(prefix+'-type',data.type);setText(prefix+'-title',data.title);
        setText(prefix+'-date',data.date);setText(prefix+'-body',data.body);
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