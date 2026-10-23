'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const js=fs.readFileSync(path.join(__dirname,'live-stress-eval.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'reliability-loop.html'),'utf8');
test('new stress results are hidden before real model results exist',()=>{
 assert.ok(html.includes('id="stress-evaluation" hidden'));
 assert.ok(html.includes('live-stress-eval.js'));
 assert.ok(html.includes('id="stress-before"')&&html.includes('id="stress-after"'));
});
test('recorded results produce route changes without double-counting model cost',async()=>{
 const n={};function el(id){return n[id]??={textContent:'',hidden:true};}
 const rows=Array.from({length:20},(_,i)=>({id:'ST-'+i,changed:i===0}));
 const report={schema:'INCA-LIVE-STRESS-ROUTE-1',status:'REAL_MODEL_RESULTS',
  actual_model_requests:20,api_or_schema_errors:0,estimated_api_cost_usd:.003,
  rows,metrics:{
   previous_route:{correct_routes:18,unsafe_continuations:0,unnecessary_escalations:0},
   critical_review_first:{correct_routes:19,unsafe_continuations:0,unnecessary_escalations:0}}};
 new Function('document','fetch',js)({getElementById:el},async()=>({ok:true,json:async()=>report}));
 await new Promise(setImmediate);
 assert.equal(el('stress-evaluation').hidden,false);
 assert.equal(el('stress-before').textContent,'18/20');
 assert.equal(el('stress-after').textContent,'19/20');
 assert.match(el('stress-takeaway').textContent,/1 of 20/);
 assert.match(el('stress-cost').textContent,/20 actual API requests/);
});
test('missing stress results stay hidden',async()=>{
 const n={};function el(id){return n[id]??={textContent:'',hidden:true};}
 new Function('document','fetch',js)({getElementById:el},async()=>({ok:false}));
 await new Promise(setImmediate);
 assert.equal(el('stress-evaluation').hidden,true);
});
