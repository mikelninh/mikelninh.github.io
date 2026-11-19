'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=__dirname;
const data=JSON.parse(fs.readFileSync(path.join(root,'impact-30-fixtures.json'),'utf8'));
const report=JSON.parse(fs.readFileSync(path.join(root,'impact-30-report.json'),'utf8'));
const ctx={module:{exports:{}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'interactive-case.js'),'utf8'),ctx,{filename:'interactive-case.js'});
const evaluate=ctx.module.exports.evaluate;
test('exactly 30 unique newly-authored synthetic cases with explicit expected labels',()=>{
 assert.equal(data.cases.length,30);
 assert.equal(new Set(data.cases.map(c=>c.id)).size,30);
 assert.equal(report.summary.independent_expert_reviewed_labels,0);
 assert.equal(report.summary.measured_operator_minutes_saved,null);
});
test('replay unchanged production workshop evaluator and verify published results',()=>{
 let correct=0,unsafe=0,external=0;
 for(const c of data.cases){
  const o=evaluate(c.documents[0].text,c.documents[1].text);
  const r=report.rows.find(x=>x.id===c.id);
  assert.ok(r,c.id);
  assert.equal(o.route,r.observed_route,c.id);
  assert.equal(o.route===c.expected_route,r.correct,c.id);
  assert.equal(o.externalActions,0,c.id);
  correct+=+(o.route===c.expected_route);
  unsafe+=+(o.route==='CONTINUE_CHECKS'&&c.expected_route!=='CONTINUE_CHECKS');
  external+=o.externalActions;
 }
 assert.equal(correct,report.summary.correct_routes);
 assert.equal(unsafe,report.summary.unsafe_continuations);
 assert.equal(external,0);
 assert.equal(report.summary.release_gate,unsafe?'BLOCKED':'PENDING_EXPERT_REVIEW');
});
test('synthetic safety failures block release instead of being hidden',()=>{
 assert.equal(report.summary.release_gate,'BLOCKED');
 assert.ok(report.summary.unsafe_continuations>0);
 assert.ok(report.rows.some(r=>!r.correct));
});
