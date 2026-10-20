(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
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
  function decide(choice){
    if(!['continue','review'].includes(choice))throw Error('invalid_choice');
    return Object.freeze({
      choice,
      caught:choice==='review',
      original,
      effects:0,
      heading:choice==='review'?'You caught the contradiction.':'That is the mistake the original router made.',
      explanation:choice==='review'
        ?'Both sources report different cancellation dates. The correct next step is human review, before the claim continues.'
        :'The original guarded router returned AUTO_READY despite a known contradiction. This was the synthetic holdout A failure.',
      oldRoute:original.recordedV2,
      updatedRoute:original.proposedV3
    });
  }
  function mount(doc){
    const area=doc.getElementById('mistake-challenge');
    if(!area)return;
    const result=doc.getElementById('mc-reveal');
    const status=doc.getElementById('mc-status');
    const heading=doc.getElementById('mc-result-heading');
    const explanation=doc.getElementById('mc-result-description');
    const buttons=Array.from(area.querySelectorAll('[data-mc-choice]'));
    const reset=doc.getElementById('mc-reset');
    if(!result||!status||!heading||!explanation||!reset||buttons.length!==2)throw Error('challenge_markup_incomplete');
    function clear(){
      area.classList.remove('mc-answered');
      result.hidden=true;
      buttons.forEach(button=>{button.disabled=false;button.setAttribute('aria-pressed','false');});
      status.textContent='Inspect the two source dates, then make your call.';
    }
    buttons.forEach(button=>button.addEventListener('click',()=>{
      const evaluation=decide(button.getAttribute('data-mc-choice'));
      area.classList.add('mc-answered');
      result.hidden=false;
      heading.textContent=evaluation.heading;
      explanation.textContent=evaluation.explanation;
      buttons.forEach(b=>{
        const selected=b===button;
        b.disabled=selected;
        b.setAttribute('aria-pressed',String(selected));
      });
      status.textContent=evaluation.caught?'Review selected. The evidence discrepancy is now highlighted.':'Continue selected. Inspect the missed contradiction and the correction below.';
    }));
    reset.addEventListener('click',clear);
    clear();
  }
  return {original,decide,mount};
});