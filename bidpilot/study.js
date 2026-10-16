/* BIDPILOT 1.3 – voluntary first-value usability pilot.
 * No analytics backend, no experiment assignment tricks, no fabricated results.
 * A = current experience; B = guided instructions. Both use identical TED ranking.
 */
(function(root, factory){
  const api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  else {
    root.BidPilotStudy = api
    if (typeof document !== 'undefined') api.mount(document, root)
  }
})(typeof globalThis==='object'?globalThis:this, function(){
  'use strict'
  const pattern=/^[0-9]{1,8}-[0-9]{4}$/
  class StudySession {
    constructor({variant='guided',now=()=>Date.now()}={}){
      if (!['guided','baseline'].includes(variant))throw new Error('invalid_variant')
      this.variant=variant;this.now=now;this.startMs=null;this.endMs=null
      this.inspected=[];this.firstInspectedAt=null;this.chosenId=null;this.success=null;this.feedback={reason:null,confidence:null,note:null}
      this.events=[]
    }
    start(){if(this.startMs!==null)throw new Error('already_started');this.startMs=this.now();this.events.push({event:'task_started',atMs:0});return this}
    seconds(){if(this.startMs===null)return 0;return Math.max(0,Math.round(((this.endMs??this.now())-this.startMs)/1000))}
    inspect(id){
      if(this.startMs===null||this.endMs!==null)return false
      if(!pattern.test(String(id||'')))return false
      if(!this.inspected.includes(id)){this.inspected.push(id);if(this.firstInspectedAt===null)this.firstInspectedAt=this.seconds();this.events.push({event:'notice_inspected',noticeId:id,atSec:this.seconds()})}
      return true
    }
    finish({useful,noticeId=null,feedback={}}={}){
      if(this.startMs===null)throw new Error('not_started')
      if(this.endMs!==null)throw new Error('already_finished')
      if(typeof useful!=='boolean')throw new Error('explicit_outcome_required')
      if(useful&&(!noticeId||!this.inspected.includes(noticeId)))throw new Error('must_inspect_notice_before_success')
      this.endMs=this.now();this.success=useful;this.chosenId=useful?noticeId:null;
      const reasons=['clear_fit','unclear_fit','weak_source','hard_to_scan','no_match'];
      const confidences=['unsure','somewhat','confident'];
      this.feedback={
        reason:reasons.includes(feedback?.reason)?feedback.reason:null,
        confidence:confidences.includes(feedback?.confidence)?feedback.confidence:null,
        note:typeof feedback?.note==='string'?feedback.note.replace(/[<>]/g,'').slice(0,180).trim()||null:null
      }
      this.events.push({event:useful?'relevant_notice_confirmed':'no_relevant_notice',atSec:this.seconds(),noticeId:this.chosenId})
      return this.report()
    }
    report(){
      if(this.endMs===null)throw new Error('not_completed')
      return Object.freeze({
        schemaVersion:1,product:'BIDPILOT 1.3',researchType:'qualitative_single_session',
        variant:this.variant,completed:true,success:this.success,goalSeconds:180,
        elapsedSeconds:this.seconds(),targetMet:this.success&&this.seconds()<=180,
        inspectedCount:this.inspected.length,inspectedNoticeIds:[...this.inspected],
        firstInspectedAtSeconds:this.firstInspectedAt,
        firstRelevantNoticeId:this.chosenId,
        feedback:{...this.feedback},feedbackConsent:'Participant-controlled local export only',
        dataDisclaimer:'Volunteer report only; notice relevance self-reported; eligibility and time savings not verified; no statistical AB significance.',
        events:[...this.events]
      })
    }
  }
  function mount(doc,win){
    const $=id=>doc.getElementById(id)
    if(!$('studyStart')||!$('studyLive')||!$('focusList'))return
    let current=null,selected=null,interval=null,lastReport=null
    const readable=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0')
    function renderLive(){
      if(!current||current.endMs!==null)return
      $('studyClock').textContent=readable(current.seconds())
      const guided=current.variant==='guided'
      $('studySteps').textContent=guided?
        '1. Check the top three source-backed opportunities. 2. Open a promising notice. 3. Tell us if it is worth reviewing.':
        'Find and inspect an opportunity that fits your business, then report your decision.'
      const count=current.inspected.length
      $('studyStatus').textContent=selected?
        'Inspected TED '+selected+'. Would you actually review this opportunity?':
        count?'You inspected '+count+' notice(s). Choose one from the shortlist to confirm relevance.':
          'Open a source-backed opportunity to begin. Use “Inspect opportunity” or “TED source”.'
      $('studySuccess').disabled=!selected
    }
    function stopTimer(){if(interval!==null){clearInterval(interval);interval=null}}
    function start(){
      stopTimer()
      const variant=$('studyVariant').value
      current=new StudySession({variant})
      current.start();selected=null;lastReport=null
      $('studyVariant').disabled=true;$('studyStart').hidden=true
      $('studyLive').hidden=false;$('studyResult').hidden=true;$('studyReset').hidden=false
      renderLive();interval=setInterval(renderLive,1000)
      $('shortlist')?.scrollIntoView?.({behavior:'smooth',block:'start'})
    }
    function done(useful){
      if(!current||current.endMs!==null)return
      try{
        lastReport=current.finish({useful,noticeId:useful?selected:null,feedback:{
          reason:$('studyReason')?.value,confidence:$('studyConfidence')?.value,note:$('studyNote')?.value
        }})
      }catch(err){$('studyStatus').textContent=err.message;return}
      stopTimer();$('studyLive').hidden=true;$('studyResult').hidden=false
      const status=lastReport.success?
        'You found one that seems worth reviewing.':'No relevant opportunity found in this session.'
      const details='Elapsed: '+readable(lastReport.elapsedSeconds)+' · Notices inspected: '+lastReport.inspectedCount+
       ' · 3-minute pilot target: '+(lastReport.targetMet?'met':'not met')
      $('studyResult').replaceChildren()
      const heading=doc.createElement('h3');heading.textContent=status
      const p=doc.createElement('p');p.textContent=details
      const extra=doc.createElement('p');extra.textContent='This is your opinion, not eligibility verification. The report is kept only in this tab until you download it.'
      const btn=doc.createElement('button');btn.type='button';btn.textContent='Download honest pilot result (.json) ↗'
      btn.addEventListener('click',download)
      const insight=doc.createElement('div');insight.className='study-insight';
      const insightTitle=doc.createElement('strong');insightTitle.textContent='One interview, one learning signal';
      const reasonMap={
        clear_fit:'The person recognised fit quickly. In a next test, verify they can explain why this notice matters.',
        unclear_fit:'Fit remains unclear. Next test: show explicit inclusion and exclusion reasons before deeper inspection.',
        weak_source:'Evidence was not sufficient. Next test: make original notice detail and deadline context easier to verify.',
        hard_to_scan:'Scanning caused friction. Next test: reduce noise around the three highest priority notices.',
        no_match:'No useful match. Next test: tune the business profile and inspect missed/false-positive opportunities.'
      };
      const hypothesis=doc.createElement('p');hypothesis.textContent=reasonMap[lastReport.feedback.reason]||'This one session is not a product verdict. Ask what was confusing, then repeat with another consented participant.';
      const reminder=doc.createElement('p');reminder.textContent='Next decision: repeat or revise the hypothesis based on several observed sessions — never infer A/B significance from one voluntary report.';
      insight.append(insightTitle,hypothesis,reminder);
      $('studyResult').append(heading,p,extra,insight,btn)
    }
    function download(){
      if(!lastReport)return
      const blob=new Blob([JSON.stringify(lastReport,null,2)+'\n'],{type:'application/json;charset=utf-8'})
      const uri=URL.createObjectURL(blob),a=doc.createElement('a')
      a.href=uri;a.download='bidpilot-first-value-'+lastReport.variant+'-'+Date.now()+'.json'
      doc.body.appendChild(a);a.click();a.remove()
      setTimeout(()=>URL.revokeObjectURL(uri),500)
    }
    function reset(){
      stopTimer();current=null;selected=null;lastReport=null
      $('studyVariant').disabled=false;$('studyStart').hidden=false
      $('studyLive').hidden=true;$('studyResult').hidden=true;$('studyReset').hidden=true
      $('studyStatus').textContent='Explore a source-backed notice.'
      if($('studyReason'))$('studyReason').value='';
      if($('studyConfidence'))$('studyConfidence').value='';
      if($('studyNote'))$('studyNote').value='';
    }
    function track(ev){
      if(!current||current.endMs!==null)return
      const target=ev.target
      if(!target||typeof target.closest!=='function')return
      const card=target.closest('[data-notice-id]')
      const linkOrButton=target.closest('button, a')
      if(!card||!linkOrButton)return
      const id=card.getAttribute('data-notice-id')||card.dataset?.noticeId
      if(current.inspect(id)){selected=id;renderLive()}
    }
    $('studyStart').addEventListener('click',start)
    $('studyReset').addEventListener('click',reset)
    $('studySuccess').addEventListener('click',()=>done(true))
    $('studyNotFit').addEventListener('click',()=>done(false))
    $('focusList').addEventListener('click',track,true)
    $('results')?.addEventListener('click',track,true)
    return {getSession:()=>current,getResult:()=>lastReport}
  }
  return {StudySession,mount}
});
