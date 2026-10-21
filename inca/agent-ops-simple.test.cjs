const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const sandbox={module:{exports:{}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'agent-ops-simple.js'),'utf8'),sandbox);
const app=sandbox.module.exports;
const report=()=>JSON.parse(fs.readFileSync(path.join(__dirname,'agent-ops-traces.json'),'utf8'));

test('nontechnical view accepts real verified offline Python trace only',()=>{
 const r=report();
 assert.ok(app.validate(r));
 const first=app.describe(r.runs[0]);
 assert.equal(first.name,'Travel cancellation');
 assert.equal(first.decision,'A person should review this');
 assert.equal(first.evidence[0].value,'11.07.2026');
 assert.equal(first.evidence[1].value,'12.07.2026');
 assert.equal(first.kind,'review');
 assert.equal(first.guard,false);
 const last=app.describe(r.runs[5]);
 assert.equal(last.guard,true);
 assert.equal(last.route,'HUMAN_REVIEW');
});

test('six real claim routes are presented in clear business language',()=>{
 const r=report();
 const views=r.runs.map(app.describe);
 assert.equal(views.length,6);
 assert.equal(new Set(views.map(x=>x.id)).size,6);
 assert.equal(views.filter(x=>x.kind==='review').length,4);
 assert.equal(views.filter(x=>x.kind==='info').length,1);
 assert.equal(views.filter(x=>x.kind==='clear').length,1);
 assert.ok(views.every(x=>x.decision&&x.next&&x.evidence.length===2));
});

test('unsafe, missing, forged or live-model snapshots never display',()=>{
 for(const mutate of [
  x=>{x.execution_mode='openai'},
  x=>{x.runs[0].external_actions=1},
  x=>{x.runs[0].events[6].output.payment=true},
  x=>{x.runs[0].events.pop()},
  x=>{x.runs[0].handoff.status='SENT'},
 ]){
  const r=report();mutate(r);assert.equal(app.validate(r),null);
 }
});

test('the first screen contains no agent jargon metrics or engineering timeline',()=>{
 const page=fs.readFileSync(path.join(__dirname,'agent-ops.html'),'utf8');
 for(const marker of ['One claim.','One detail that matters.','id="claim-options"',
    'id="show-decision"','id="decision-panel"','How the agent workflow works',
    'agent-ops-technical.html','nothing sent','fictional']){
   assert.ok(page.toLowerCase().includes(marker.toLowerCase()),marker);
 }
 const hero=page.slice(page.indexOf('<section class="hero">'),page.indexOf('<section id="try">'));
 assert.doesNotMatch(hero,/Flight recorder|Orchestrator|token|workflow traces|Seven visible steps|42 recorded/i);
 assert.match(page,/public demo replays offline/i);
});

test('technical debug trace remains accessible but secondary',()=>{
 const tech=fs.readFileSync(path.join(__dirname,'agent-ops-technical.html'),'utf8');
 assert.match(tech,/id="timeline"/);
 assert.match(tech,/agent-ops-ui.js/);
});
