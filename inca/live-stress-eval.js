/* Separate post-development stress evaluation; no model calls from visitor. */
(function(){'use strict';
 const el=document.getElementById('stress-evaluation');if(!el)return;
 const $=id=>document.getElementById(id);
 fetch('./live-stress-eval.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('No report');return r.json();})
 .then(d=>{
   if(d.schema!=='INCA-LIVE-STRESS-ROUTE-1'||d.status!=='REAL_MODEL_RESULTS'
    ||d.actual_model_requests!==20||d.api_or_schema_errors!==0||!Array.isArray(d.rows)||d.rows.length!==20)throw Error('Incomplete stress evidence');
   const a=d.metrics.previous_route,b=d.metrics.critical_review_first;
   $('stress-before').textContent=a.correct_routes+'/20';
   $('stress-after').textContent=b.correct_routes+'/20';
   $('stress-before-risks').textContent=a.unsafe_continuations+' unsafe continuations · '+a.unnecessary_escalations+' unnecessary reviews';
   $('stress-after-risks').textContent=b.unsafe_continuations+' unsafe continuations · '+b.unnecessary_escalations+' unnecessary reviews';
   const changed=d.rows.filter(x=>x.changed);
   const unsafe=d.rows.filter(x=>x.expected_route!=='AUTO_READY'&&x.after_route==='AUTO_READY');
   $('stress-takeaway').textContent='Actual findings: '+changed.length+' of 20 recorded model responses changed routing under the new rule. '+
     (b.correct_routes>a.correct_routes?'The routing fix improved this constructed stress set.':
      b.correct_routes<a.correct_routes?'The fix made overall routing worse on this set.':'It did not improve overall route correctness on this set.')+
     ' This is a new synthetic split, not an independently blind insurance validation.';
   $('stress-release-gate').textContent=unsafe.length
     ?'RELEASE BLOCKED · '+unsafe.length+' risky case'+(unsafe.length===1?' was':'s were')+' still allowed to continue. '+unsafe.map(x=>x.id).join(', ')+'. No rollout recommended.'
     :'No planted unsafe continuations observed here; this is still not a production approval.';
   $('stress-cost').textContent='20 actual API requests · $'+Number(d.estimated_api_cost_usd).toFixed(5)+' estimated model cost (not an invoice). Both routing policies reused identical model output.';
   el.hidden=false;
 }).catch(()=>{el.hidden=true;});
})();
