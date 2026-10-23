'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'live-model-eval.js'),'utf8');
const page=fs.readFileSync(path.join(__dirname,'reliability-loop-archive.html'),'utf8');
test('real evidence viewer promises no invented default scores',()=>{
 for(const word of ['id="live-eval-app"','id="live-pending"','id="live-data" hidden','id="live-before"',
  'id="live-after"','id="live-docs"','id="live-baseline-json"','id="live-revised-json"','live-model-eval.js'])
  assert.ok(page.includes(word),word);
});
test('viewer renders paired measured results and safely escapes source text',async()=>{
 const nodes={};function el(id){return nodes[id]??={textContent:'',innerHTML:'',hidden:false,value:'',addEventListener(k,f){this['on_'+k]=f;}};}
 const rows=[];
 for(let i=0;i<20;i++)for(const variant of ['baseline','revised'])
   rows.push({id:'CASE-'+i,variant,split:i<10?'dev':'holdout',family:'test_family',
   expected_route:'HUMAN_REVIEW',actual_route:'HUMAN_REVIEW',route_correct:i!==0,
   unsafe_continue:false,unnecessary_escalation:false,api_or_schema_error:false,latency_ms:1000,
   gate_reason:'MODEL_FLAGS_AND_DETERMINISTIC_ROUTER',
   raw_model_extraction:{uncertainty:'<script>bad</script>'},
   documents:[{id:'DOC-1',kind:'test',text:'<script>bad</script>'}]});
 const report={schema:'INCA-LIVE-RELEASE-EVAL-1',status:'REAL_MODEL_RESULTS',model_requested:'gpt-4o-mini',
  generated_at_utc:'2026-10-23T12:00:00Z',run_total_estimated_usd:0.017,
  metrics:{dev:{baseline:{},revised:{}},holdout:{
    baseline:{correct_routes:7,cases:10,unsafe_continuations:2,unnecessary_escalations:1,mean_latency_ms:1200},
    revised:{correct_routes:8,cases:10,unsafe_continuations:1,unnecessary_escalations:1,mean_latency_ms:1600}}},
  selection:{dev:rows.filter(x=>x.split==='dev'&&x.variant==='baseline').map(x=>x.id),
  holdout:rows.filter(x=>x.split==='holdout'&&x.variant==='baseline').map(x=>x.id)},
  limitations:'Invented and developer-authored; no independent blind test.',rows};
 new Function('document','fetch',source)({getElementById:el},async()=>({ok:true,json:async()=>report}));
 await new Promise(setImmediate);
 assert.equal(el('live-data').hidden,false);
 assert.equal(el('live-pending').hidden,true);
 assert.equal(el('live-before').textContent,'7/10');
 assert.equal(el('live-after').textContent,'8/10');
 assert.match(el('live-baseline-json').textContent,/<script>/);
 assert.ok(!el('live-docs').innerHTML.includes('<script>'));
 assert.ok(el('live-docs').innerHTML.includes('&lt;script&gt;'));
});
test('missing live report fails closed without fake scores',async()=>{
 const nodes={};function el(id){return nodes[id]??={textContent:'',innerHTML:'',hidden:false,value:'',addEventListener(){}};}
 new Function('document','fetch',source)({getElementById:el},async()=>({ok:false}));
 await new Promise(setImmediate);
 assert.equal(el('live-data').hidden,true);
 assert.match(el('live-pending').innerHTML,/No verified full live run/);
});
