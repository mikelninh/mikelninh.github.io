/* BIDPILOT 1.2 shortlist. Deterministic triage only, never eligibility or win probability.
 * Works in the browser and in Node's built-in test runner.
 */
(function (root, factory) {
  const api=factory();
  if (typeof module==='object'&&module.exports) module.exports=api;
  else root.BidPilotPriority=api;
})(typeof globalThis==='object'?globalThis:this,function () {
  'use strict';
  const DAY=86400000;
  function safeDate(value) {
    const text=String(value||'').slice(0,10);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(text))return'';
    const dt=new Date(text+'T12:00:00Z');
    return Number.isNaN(dt.getTime())||dt.toISOString().slice(0,10)!==text?'':text;
  }
  function daysBetween(first,second) {
    const a=safeDate(first),b=safeDate(second);
    return a&&b?Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/DAY):null;
  }
  function nearestFutureDeadline(notice,currentDate) {
    const values=Array.isArray(notice.deadlines)&&notice.deadlines.length?
      notice.deadlines.map(item=>({date:safeDate(item?.date),kind:String(item?.kind||'unspecified'),lot:String(item?.lot||'')})):
      [{date:safeDate(notice.deadline),kind:'unspecified',lot:''}];
    return values.filter(entry=>entry.date&&entry.date>=currentDate).sort((a,b)=>a.date.localeCompare(b.date))[0]||null;
  }
  function selectShortlist(notices, options) {
    const {currentDate,fitFor,riskFor,decisions={}}=options||{};
    if(!safeDate(currentDate)||typeof fitFor!=='function'||typeof riskFor!=='function')return [];
    const candidates=[];
    for(const notice of notices||[]) {
      if(!notice||notice.stage!=='competition'||!/^[0-9]{1,8}-[0-9]{4}$/.test(String(notice.id||''))||
        notice.url!=='https://ted.europa.eu/en/notice/-/detail/'+notice.id)continue;
      if(decisions[notice.id]?.status==='no-bid')continue;
      const fit=fitFor(notice);
      if(!fit||fit.excluded||fit.score<40)continue;
      const deadline=nearestFutureDeadline(notice,currentDate);
      if(!deadline)continue; // No published future date -> never claim actionable.
      const days=daysBetween(currentDate,deadline.date);
      if(days===null||days<3||days>120)continue;
      const risks=riskFor(notice)||[];
      if(risks.some(item=>item.level==='high'))continue; // Framework call-offs etc.
      const medium=risks.filter(item=>item.level==='medium').length;
      const age=daysBetween(notice.published,currentDate);
      const freshness=age!==null&&age>=0&&age<=7?10:age!==null&&age<=30&&age>=0?5:0;
      const deadlineBonus=days<=6?5:days<=30?16:days<=60?10:4;
      // This number only determines order. Never display as winning odds or qualification.
      const priority=fit.score+deadlineBonus+freshness-Math.min(medium,2)*22+
        (decisions[notice.id]?.status==='review'?3:0);
      candidates.push({notice,fit,risks,deadline,days,priority,
        why:whyFor(fit,deadline,days,risks)});
    }
    candidates.sort((a,b)=>b.priority-a.priority||b.fit.score-a.fit.score||
      a.deadline.date.localeCompare(b.deadline.date)||a.notice.id.localeCompare(b.notice.id));
    // Avoid the same buyer dominating the three visible slots where alternatives exist.
    const chosen=[],usedBuyers=new Set();
    for(const candidate of candidates){
      const buyer=String(candidate.notice.buyer||'').trim().toLocaleLowerCase('de-DE');
      if(buyer&&usedBuyers.has(buyer))continue;
      chosen.push(candidate);if(buyer)usedBuyers.add(buyer);
      if(chosen.length===3)return chosen;
    }
    for(const candidate of candidates){
      if(chosen.some(item=>item.notice.id===candidate.notice.id))continue;
      chosen.push(candidate);if(chosen.length===3)break;
    }
    return chosen;
  }
  function whyFor(fit,deadline,days,risks) {
    const reasons=[];
    if(fit.reasons?.length)reasons.push('Matched: '+fit.reasons.slice(0,2).join(' · '));
    reasons.push('Published '+deadline.kind+' date: '+deadline.date+(deadline.lot?' ('+deadline.lot+')':''));
    if(risks.some(item=>item.level==='medium'))reasons.push('Other conditions still need checking');
    return reasons;
  }
  function nextAction(candidate,isStale=false){
    if(!candidate)return{
      heading:'Start with your company profile',
      detail:'Adjust the keywords and exclusions, or explore the full TED feed. No suitable dated competition was confirmed by this shortlist.',
      cta:'Edit your profile',kind:'profile'};
    if(isStale)return{
      heading:'Verify the published notice is still current',
      detail:'Our snapshot is older than three days. Check the latest amendments and submission date directly on TED before proceeding.',
      cta:'Verify on TED',kind:'source'};
    if(candidate.days<=14)return{
      heading:'Confirm the exact submission deadline',
      detail:'TED lists '+candidate.deadline.date+' in this feed. Verify the time, participation stage and documents for '+(candidate.notice.buyer||'the buyer')+'.',
      cta:'Check official notice',kind:'source'};
    if(candidate.risks.some(item=>item.level==='medium'))return{
      heading:'Check the participation conditions first',
      detail:'Before investing effort, verify the conditions flagged in this notice and check whether your studio can participate.',
      cta:'Inspect evidence',kind:'brief'};
    return{
      heading:'Check the mandatory eligibility requirements',
      detail:'Open the official procurement documents for '+(candidate.notice.buyer||'this buyer')+' and confirm references, turnover and required certifications.',
      cta:'Open source and review',kind:'source'};
  }
  return{safeDate,daysBetween,nearestFutureDeadline,selectShortlist,nextAction};
});