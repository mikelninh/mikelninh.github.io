'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('./reliability-story.js');
const page=fs.readFileSync(path.join(__dirname,'reliability-loop.html'),'utf8');
const old=JSON.parse(fs.readFileSync(path.join(__dirname,'live-model-eval.json'),'utf8'));
const stress=JSON.parse(fs.readFileSync(path.join(__dirname,'live-stress-eval.json'),'utf8'));
test('main story only: problem, real rescued example, measurement, release verdict, optional engineering',()=>{
 for(const phrase of ['The AI missed a human','DOC-EVAL-067','id="story-proof"',
   'id="holdout-metric"','id="stress-metric"','DOC-EVAL-070','id="release-detail"',
   'id="engineering-evidence"','id="inspect-case"','id="inspect-docs"',
   'id="engineering-method"','reliability-story.js','reliability-loop-archive.html'])
   assert.ok(page.includes(phrase),phrase);
 assert.ok(!page.includes('id="decision-app"'),'previous mini-app belongs in archive');
 assert.ok(!page.includes('id="loop-app"'),'previous replay belongs in archive');
 assert.ok(!page.includes('id="live-eval-app"'),'redundant model-viewer app removed from the primary page');
 assert.ok(page.indexOf('id="story-proof"')<page.indexOf('id="engineering-evidence"'));
});
test('real recorded report is required: never accept missing or invented model evidence',()=>{
 const r=core.verify(old,stress),s=core.summary(r);
 assert.equal(s.rescuedBefore,'Continue checks');
 assert.equal(s.rescuedAfter,'Human review');
 assert.equal(s.beforeSensitive,false);
 assert.equal(s.afterSensitive,true);
 assert.equal(s.heldout,'8/10 → 9/10');
 assert.equal(s.stress,'17/20 → 19/20');
 assert.equal(s.calls,60);
 assert.equal(s.gateStatus,'BLOCKED');
 assert.equal(s.unsafe,1);
 assert.ok(Math.abs(s.costUsd-0.007898)<1e-9);
 assert.throws(()=>core.verify({...old,rows:[]},stress),/Incomplete/);
});

test('three case types show exact recorded facts, never confuse router change with new model call',()=>{
 const v=core.verify(old,stress);
 const rescued=core.caseView(v,'DOC-EVAL-067');
 assert.equal(rescued.kind,'paired-model');
 assert.equal(rescued.left.route,'Continue checks');
 assert.equal(rescued.right.route,'Human review');
 assert.equal(rescued.left.json.sensitive,false);
 assert.equal(rescued.right.json.sensitive,true);
 const unsafe=core.caseView(v,'DOC-EVAL-070');
 assert.equal(unsafe.kind,'same-model-replayed');
 assert.equal(unsafe.left.route,'Continue checks');
 assert.equal(unsafe.right.route,'Continue checks');
 assert.equal(unsafe.right.json.recorded_model_output_reused,true);
 const fixed=core.caseView(v,'DOC-EVAL-089');
 assert.equal(fixed.left.route,'Request information');
 assert.equal(fixed.right.route,'Human review');
 assert.equal(fixed.right.json.gate_reason,'CRITICAL_COVERAGE_REVIEW_PRIORITY');
 assert.throws(()=>core.caseView(v,'UNKNOWN'),/Unknown/);
});
test('viewer works in one pass with real reports and escapes untrusted source text',async()=>{
 const nodes={};
 function el(id){return nodes[id]??={id,textContent:'',value:'',hidden:false,open:false,children:[],handlers:{},
  addEventListener(type,fn){this.handlers[type]=fn;},
  replaceChildren(){this.children=[];},
  appendChild(n){this.children.push(n);}};}
 const doc={getElementById:el,createElement(tag){const v=el('anon-'+Math.random());return {...v,tag,children:[],appendChild(n){this.children.push(n);}}}};
 const fetch=async url=>({ok:true,json:async()=>url.includes('stress')?stress:old});
 const v=await core.start(doc,fetch);
 assert.ok(v);
 assert.equal(el('holdout-metric').textContent,'8/10 → 9/10');
 assert.equal(el('stress-metric').textContent,'17/20 → 19/20');
 assert.match(el('run-metrics').textContent,/60 actual/);
 assert.match(el('release-detail').textContent,/BLOCKED/);
 assert.equal(el('inspect-case').value,'DOC-EVAL-067');
 assert.match(el('inspect-docs').children[0].children[1].textContent,/überfordert/);
 el('inspect-case').handlers.change({target:{value:'DOC-EVAL-070'}});
 assert.equal(el('inspect-case').value,'DOC-EVAL-070');
 assert.match(el('inspect-right-explain').textContent,/not a second AI response/);
 el('inspect-open').handlers.click();
 assert.equal(el('engineering-evidence').open,true);
});
test('broken evidence never renders fabricated result stats',async()=>{
 const nodes={};const doc={getElementById:id=>nodes[id]??={textContent:'',open:false,addEventListener(){}}};
 const result=await core.start(doc,async()=>({ok:false}));
 assert.equal(result,null);
 assert.match(doc.getElementById('run-metrics').textContent,/unavailable/);
 assert.match(doc.getElementById('story-verdict').textContent,/could not be independently verified/);
});
