/* Recorded, real model responses; no public API calls and no client-side secrets. */
(function(){'use strict';
 const root=document.getElementById('live-eval-app');if(!root)return;
 const $=id=>document.getElementById(id);
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const formatted=n=>Number.isFinite(n)?n.toLocaleString('en-US'):'—';
 function routeText(route){return route==='AUTO_READY'?'Continue checks':route==='HUMAN_REVIEW'?'Human review':route==='NEED_INFO'?'Need more evidence':String(route||'Unscored');}
 function render(d){
  if(d.schema!=='INCA-LIVE-RELEASE-EVAL-1'||d.status!=='REAL_MODEL_RESULTS')throw Error('Invalid evidence format');
  const needed=['dev','holdout'];
  if(!needed.every(x=>d.metrics?.[x]?.baseline&&d.metrics?.[x]?.revised))throw Error('Incomplete measured comparison');
  if(!Array.isArray(d.rows)||d.rows.length!==40)throw Error('Incomplete output evidence');
  $('live-pending').hidden=true;$('live-data').hidden=false;
  const before=d.metrics.holdout.baseline,after=d.metrics.holdout.revised;
  $('live-model').textContent='Actual OpenAI responses · '+d.model_requested;
  $('live-meta').textContent='10 development + 10 held-out fictional cases · 2 workflows · '+d.generated_at_utc.slice(0,10);
  $('live-status').textContent='RECORDED API OUTPUTS';
  $('live-before').textContent=before.correct_routes+'/'+before.cases;
  $('live-after').textContent=after.correct_routes+'/'+after.cases;
  $('live-before-risk').textContent=before.unsafe_continuations+' unsafe continuations · '+before.unnecessary_escalations+' unnecessary escalations';
  $('live-after-risk').textContent=after.unsafe_continuations+' unsafe continuations · '+after.unnecessary_escalations+' unnecessary escalations';
  const avg= n=>Number.isFinite(n)?(n/1000).toFixed(2)+' s':'—';
  $('live-latency').textContent=avg(after.mean_latency_ms)+' revised / '+avg(before.mean_latency_ms)+' baseline';
  $('live-cost').textContent='$'+Number(d.run_total_estimated_usd).toFixed(4);
  const change=after.correct_routes-before.correct_routes;
  $('live-interpretation').textContent=change>0
    ?'Held-out routing improved on these developer-authored examples. Inspect individual outputs: a small test is not proof of production reliability.'
    :change<0
    ?'Held-out routing became worse. This is a meaningful failed experiment—not a result to hide or ship as an improvement.'
    :'Held-out routing did not improve. The revised workflow must justify any additional checks, latency and cost.';
  const family=Object.fromEntries(d.rows.map(x=>[x.id,x.family]));
  const names=[...new Set(d.rows.map(x=>x.id))];
  const devCases=new Set(d.selection.dev||[]);
  $('live-case').innerHTML=names.map(id=>'<option value="'+safe(id)+'">'+safe(id)+' · '+safe(devCases.has(id)?'DEV':'HELD-OUT')+' · '+safe(family[id])+'</option>').join('');
  const score=x=>x.route_correct?'Matches authored route':x.unsafe_continue?'Unsafe continuation':x.unnecessary_escalation?'Unnecessary escalation':x.api_or_schema_error?'API or schema error':'Different route';
  function display(id){
    const rows=d.rows.filter(x=>x.id===id),b=rows.find(x=>x.variant==='baseline'),r=rows.find(x=>x.variant==='revised');
    if(!b||!r)throw Error('Paired measurements absent');
    $('live-case').value=id;
    $('live-case-context').textContent=(devCases.has(id)?'DEVELOPMENT':'HELD-OUT')+' · '+b.family+' · Authored expected route: '+routeText(b.expected_route);
    $('live-docs').innerHTML=(b.documents||[]).map(doc=>'<article><strong>'+safe(doc.id)+' · '+safe(doc.kind)+'</strong>'+safe(doc.text)+'</article>').join('');
    for(const [variant,record] of [['baseline',b],['revised',r]]){
      $('live-'+variant+'-route').textContent=routeText(record.actual_route);
      $('live-'+variant+'-check').textContent=score(record)+' · '+formatted(record.latency_ms)+' ms · '+record.gate_reason;
      $('live-'+variant+'-json').textContent=record.raw_model_extraction
        ?JSON.stringify(record.raw_model_extraction,null,2)
        :(record.response_error||'No model extraction recorded');
    }
  }
  const rescued=d.rows.find(x=>x.variant==='baseline'&&x.split==='holdout'&&x.unsafe_continue
    &&d.rows.some(y=>y.id===x.id&&y.variant==='revised'&&y.route_correct&&!y.unsafe_continue));
  const impactful=d.rows.filter(x=>x.variant==='baseline'&&(!x.route_correct||x.api_or_schema_error));
  const picked=rescued||impactful.find(x=>x.split==='dev')||impactful.find(x=>x.split==='holdout')||d.rows.find(x=>x.variant==='baseline'&&x.split==='holdout');
  const unresolved=d.rows.filter(x=>x.variant==='revised'&&x.split==='holdout'&&!x.route_correct);
  $('live-discovery').textContent=rescued
    ?'Failure caught: '+rescued.id+' originally let a risky case continue. The revised extraction sent it to human review. '+(unresolved.length?unresolved.length+' held-out case still has the wrong next route; see the next iteration.':'No held-out route mismatches remained in this small run.')
    :'No rescued unsafe case was observed on this small held-out set. The recorded differences and errors remain visible below.';
  display(picked.id);
  $('live-case').addEventListener('change',e=>display(e.target.value));
  $('live-scope').textContent=d.limitations+' · Cost uses public token prices, not an invoice. No end-user model calls.';
 }
 fetch('./live-model-eval.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('No complete live evaluation has been published');return r.json();})
 .then(render).catch(err=>{
   $('live-pending').hidden=false;
   $('live-pending').innerHTML='<strong>No verified full live run is published yet.</strong><p>Recorded measurements will appear only after a complete API run. No synthetic results are substituted. The experiment code and existing earlier measured runs remain inspectable on GitHub.</p>';
   $('live-data').hidden=true;
 });
})();
