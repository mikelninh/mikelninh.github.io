/* INCA independent work sample · evidence-first recorded experiment.
   No visitor API calls, no customer data, no model training, no external actions.
   Everything here is derived from two immutable recorded fictional model reports.
*/
(function(){
  'use strict';
  const MAIN_SCHEMA='INCA-LIVE-RELEASE-EVAL-1';
  const STRESS_SCHEMA='INCA-LIVE-STRESS-ROUTE-1';
  const RESCUED='DOC-EVAL-067';
  const REMAINING='DOC-EVAL-070';
  const FIXED='DOC-EVAL-089';
  function requireCondition(condition,message){
    if(!condition)throw new Error(message);
  }
  function findRow(rows,id,variant){
    return rows.find(r=>r.id===id&&(variant===undefined||r.variant===variant));
  }
  function routeLabel(route){
    return ({AUTO_READY:'Continue checks',HUMAN_REVIEW:'Human review',NEED_INFO:'Request information'})[route]||'Not scored';
  }
  function verify(first,second){
    requireCondition(first&&first.schema===MAIN_SCHEMA&&first.status==='REAL_MODEL_RESULTS','Incorrect first report schema or status');
    requireCondition(second&&second.schema===STRESS_SCHEMA&&second.status==='REAL_MODEL_RESULTS','Incorrect stress report schema or status');
    requireCondition(Array.isArray(first.rows)&&first.rows.length===40&&first.total_model_calls_planned===40&&first.all_api_or_schema_errors===0,'Incomplete 40-call measured experiment');
    requireCondition(Array.isArray(second.rows)&&second.rows.length===20&&second.actual_model_requests===20&&second.api_or_schema_errors===0,'Incomplete 20-call measured stress experiment');
    requireCondition(second.model_requested===first.model_requested,'Results must use the same model ID');
    for(const stage of ['dev','holdout'])
      for(const variant of ['baseline','revised'])
        requireCondition(first.metrics?.[stage]?.[variant]?.cases===10,'Expected ten actual model outputs per first experiment cell');
    requireCondition(second.metrics?.previous_route?.cases===20&&second.metrics?.critical_review_first?.cases===20,'Missing measured stress comparison');
    const baseline=findRow(first.rows,RESCUED,'baseline'),revised=findRow(first.rows,RESCUED,'revised');
    const remaining=findRow(second.rows,REMAINING),fixed=findRow(second.rows,FIXED);
    requireCondition(baseline&&revised&&remaining&&fixed,'Missing recorded cases for the main story');
    requireCondition(baseline.split==='holdout'&&revised.split==='holdout','Rescued case must belong to held-out split');
    requireCondition(baseline.expected_route==='HUMAN_REVIEW'&&baseline.actual_route==='AUTO_READY'&&baseline.unsafe_continue===true,'Claimed baseline safety miss not recorded');
    requireCondition(revised.actual_route==='HUMAN_REVIEW'&&revised.route_correct===true,'Claimed improvement not recorded');
    requireCondition(baseline.raw_model_extraction?.sensitive===false&&revised.raw_model_extraction?.sensitive===true,'Model-extraction sensitivity contrast not recorded');
    requireCondition(remaining.expected_route==='HUMAN_REVIEW'&&remaining.after_route==='AUTO_READY','Remaining stress failure not recorded');
    requireCondition(second.release_gate?.status==='BLOCKED'&&second.release_gate?.unsafe_case_ids?.includes(REMAINING),'Release not actually blocked in report');
    requireCondition(fixed.before_route==='NEED_INFO'&&fixed.after_route==='HUMAN_REVIEW','Coverage routing improvement not recorded');
    const combinedCost=Number(first.run_total_estimated_usd)+Number(second.estimated_api_cost_usd);
    requireCondition(Number.isFinite(combinedCost)&&combinedCost>=0,'Missing measured token-based cost estimates');
    return {first,second,baseline,revised,remaining,fixed,combinedCost,model:first.model_requested};
  }
  function caseView(verified,id){
    if(id===RESCUED){
      const b=verified.baseline,r=verified.revised;
      return {id,kind:'paired-model',
        context:'Held-out case. The two workflow variants made separate real model calls on the same fictional documents. The authored expected next step is human review.',
        docs:b.documents,
        left:{label:'BASELINE · ACTUAL MODEL OUTPUT',route:routeLabel(b.actual_route),
          explain:'sensitive: false · Misrouted to further mandatory checks. '+b.latency_ms+' ms',
          json:b.raw_model_extraction},
        right:{label:'REVISED · ACTUAL MODEL OUTPUT',route:routeLabel(r.actual_route),
          explain:'sensitive: true · Correctly escalated for a person. '+r.latency_ms+' ms',
          json:r.raw_model_extraction}};
    }
    if(id===REMAINING||id===FIXED){
      const r=id===REMAINING?verified.remaining:verified.fixed;
      const expected=routeLabel(r.expected_route);
      return {id,kind:'same-model-replayed',
        context:(id===REMAINING
          ?'New stress case. The single recorded model output missed another request for a person. Both routing rules failed; research release blocked.'
          :'New stress case. The single recorded model output flagged a coverage concern and missing evidence. The corrected deterministic rule prioritised human review.')+
          ' Authored expected route: '+expected+'.',
        docs:r.documents,
        left:{label:'ONE ACTUAL MODEL OUTPUT · ROUTED BEFORE',route:routeLabel(r.before_route),
          explain:'Original deterministic routing policy; no extra model call.',json:r.raw_model_extraction},
        right:{label:'SAME MODEL OUTPUT · ROUTED AFTER',route:routeLabel(r.after_route),
          explain:'Changed routing decision only; not a second AI response.',
          json:{recorded_model_output_reused:true,before_route:r.before_route,
            after_route:r.after_route,gate_reason:r.after_reason,
            outcome_matches_authored_route:r.after_correct}}};
    }
    throw new Error('Unknown documented case');
  }
  function summary(v){
    const h=v.first.metrics.holdout,s=v.second.metrics;
    return {
      rescuedBefore:routeLabel(v.baseline.actual_route),rescuedAfter:routeLabel(v.revised.actual_route),
      beforeSensitive:v.baseline.raw_model_extraction.sensitive,
      afterSensitive:v.revised.raw_model_extraction.sensitive,
      heldout:h.baseline.correct_routes+'/10 → '+h.revised.correct_routes+'/10',
      stress:s.previous_route.correct_routes+'/20 → '+s.critical_review_first.correct_routes+'/20',
      gateStatus:v.second.release_gate.status,
      unsafe:v.second.release_gate.observed_unsafe_continuations,
      calls:v.first.total_model_calls_planned+v.second.actual_model_requests,
      costUsd:v.combinedCost,
      averageHoldoutMs:h.revised.mean_latency_ms,
      averageStressMs:s.critical_review_first.mean_latency_ms,
      model:v.model
    };
  }
  function start(doc,read){
    const $=id=>doc.getElementById(id);
    const showWarning=()=>{
      $('story-verdict').textContent='Recorded reports could not be independently verified in this browser. Inspect the linked raw evidence instead.';
      $('run-metrics').textContent='Recorded metrics unavailable · Reports and source remain linked below.';
      $('inspect-context').textContent='Source evidence could not be loaded. Open the linked recorded JSON reports to inspect the experiment.';
    };
    return Promise.all(['./live-model-eval.json','./live-stress-eval.json'].map(url=>
      read(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Cannot fetch '+url);return r.json();})))
      .then(([a,b])=>{
        const v=verify(a,b),s=summary(v);
        $('story-before').textContent=s.rescuedBefore;
        $('story-after').textContent=s.rescuedAfter;
        $('story-before-flag').textContent='sensitive: '+String(s.beforeSensitive);
        $('story-after-flag').textContent='sensitive: '+String(s.afterSensitive);
        $('story-verdict').textContent='Verified from the recorded API output · '+RESCUED+' · Corrected routing to human review';
        $('holdout-metric').textContent=s.heldout;
        $('stress-metric').textContent=s.stress;
        $('run-metrics').textContent=s.calls+' actual '+s.model+' API calls · $'+s.costUsd.toFixed(4)+
          ' combined estimated token cost · '+(s.averageHoldoutMs/1000).toFixed(2)+'s mean revised holdout latency';
        $('release-detail').textContent=s.unsafe+' known unsafe continuation'+(s.unsafe===1?'':'s')+
          ' remaining in 20 new fictional stress cases. Research release: '+s.gateStatus+'. No real claims approved.';
        const select=id=>{
          const x=caseView(v,id);
          $('inspect-case').value=id;
          $('inspect-context').textContent=x.context;
          const area=$('inspect-docs');area.replaceChildren();
          for(const source of x.docs){
            const el=doc.createElement('article'),heading=doc.createElement('strong'),p=doc.createElement('p');
            heading.textContent=source.id+' · '+(source.kind||'Source document');
            p.textContent=source.text;
            el.appendChild(heading);el.appendChild(p);area.appendChild(el);
          }
          for(const side of ['left','right']){
            $('inspect-'+side+'-label').textContent=x[side].label;
            $('inspect-'+side+'-route').textContent=x[side].route;
            $('inspect-'+side+'-explain').textContent=x[side].explain;
            $('inspect-'+side+'-json').textContent=JSON.stringify(x[side].json,null,2);
          }
        };
        $('inspect-case').addEventListener('change',e=>select(e.target.value));
        $('inspect-open')?.addEventListener('click',()=>{$('engineering-evidence').open=true;});
        select(RESCUED);
        return v;
      })
      .catch(e=>{showWarning();return null;});
  }
  const API={verify,caseView,summary,start};
  if(typeof module!=='undefined'&&module.exports)module.exports=API;
  if(typeof document!=='undefined'){
    const run=()=>start(document,fetch);
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);
    else run();
  }
})();