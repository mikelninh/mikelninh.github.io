'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const browserSource=fs.readFileSync(path.join(__dirname,'reliability-loop.js'),'utf8');
// This repository is type=module: execute the classic browser script as a known local source
// with a CJS module shim to inspect the same pure functions without changing the website.
const shim={exports:{}};
new Function('module',browserSource)(shim);
const core=shim.exports;
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'reliability-loop-data.json'),'utf8'));
const page=fs.readFileSync(path.join(__dirname,'reliability-loop.html'),'utf8');
test('JS guardrail parity with Python for all twelve cases and both releases',()=>{
 assert.equal(data.schema,core.SCHEMA);assert.equal(data.cases.length,12);
 for(const c of data.cases)for(const phase of ['before','after']){
  const got=core.inspect(c,c[phase]),expected=c[phase+'_result'];
  assert.equal(got.pass,expected.pass,c.id+phase);
  assert.deepEqual(got.failures,expected.failures,c.id+phase);
  assert.equal(got.next_step,expected.next_step,c.id+phase);
  assert.equal(got.checks.length,6);
  for(let i=0;i<6;i++)assert.equal(got.checks[i].pass,expected.checks[i].pass);
 }
});
test('a real quotation from an obsolete policy is still blocked',()=>{
 const c=data.cases[0],src=c.before.documents.find(d=>d.id===c.before.trace.source_id);
 assert.ok(src.text.includes(c.before.trace.quote));
 assert.deepEqual(core.inspect(c,c.before).failures,['policy_revision']);
});
test('replay A fails five cases, local reviewed correction changes only selected case, B passes all',()=>{
 const m=core.createMachine(data);
 assert.equal(m.state.selected,'CASE-027');
 assert.equal(m.suite().blocked_cases,5);assert.equal(m.suite().unsafe_seeded_escapes,0);
 m.applyCorrection();assert.equal(m.result().pass,true);assert.equal(m.suite().blocked_cases,4);
 m.loadReleaseB();assert.equal(m.suite().passed,true);assert.equal(m.suite().passed_cases,12);
 m.loadReleaseA();assert.equal(m.suite().blocked_cases,5);
});
test('re-injected faults block corrected release in all five cases',()=>{
 for(const f of ['wrong_revision','invented_quote','external_action','missing_citation','skipped_verifier']){
  const m=core.createMachine(data);m.loadReleaseB();m.inject(f);
  assert.equal(m.result().pass,false,f);assert.equal(m.suite().blocked_cases,1,f);
  m.clearInjection();assert.equal(m.suite().passed,true,f);
 }
});
test('invalid cases and HTML injection are rejected or escaped',()=>{
 assert.throws(()=>core.createMachine({schema:core.SCHEMA,cases:[]}));
 assert.throws(()=>core.inspect(data.cases[0],{}));
 const m=core.createMachine(data);assert.throws(()=>m.inject('external_action'));
 assert.throws(()=>m.select('UNKNOWN'));
 assert.equal(core.escapeHTML('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
test('actual clickable controls and transparent simulated scope',()=>{
 for(const t of ['One exception.','A safer next release.','id="loop-app"','reliability-loop.js','Run 12-case regression gate','Apply reviewed correction','Load corrected release B','Inject test fault','No access to MARS','no production telemetry','no real agent integration'])assert.ok(page.includes(t),t);
 assert.match(page,/not connected to INCA/i);
 assert.match(page,/No AI API calls/i);
 assert.match(page,/never decides coverage or payment/i);
});
