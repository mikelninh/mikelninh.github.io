'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const browserSource=fs.readFileSync(path.join(__dirname,'reliability-loop.js'),'utf8');
const shim={exports:{}};new Function('module',browserSource)(shim);
const core=shim.exports;
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'reliability-loop-data.json'),'utf8'));
const page=fs.readFileSync(path.join(__dirname,'reliability-loop-archive.html'),'utf8');
test('routing gates measure unsafe misses and needless human reviews separately',()=>{
 const quick=core.assessGate(data,'source_only');
 const blanket=core.assessGate(data,'review_all');
 const balanced=core.assessGate(data,'six_checks');
 assert.deepEqual([quick.misses,quick.needless,quick.continues,quick.reviews],[4,0,11,1]);
 assert.deepEqual([blanket.misses,blanket.needless,blanket.continues,blanket.reviews],[0,7,0,12]);
 assert.deepEqual([balanced.misses,balanced.needless,balanced.continues,balanced.reviews],[0,0,7,5]);
 assert.equal(balanced.passed,true);assert.equal(quick.passed,false);assert.equal(blanket.passed,false);
 assert.equal(balanced.rows.filter(r=>r.expected==='review').length,5);
 assert.throws(()=>core.assessGate(data,'unknown_strategy'));
});
test('same six rules agree with Python for all 12 before and after snapshots',()=>{
  assert.equal(data.schema,core.SCHEMA);assert.equal(data.cases.length,12);
  for(const c of data.cases)for(const phase of ['before','after']){
    const result=core.inspect(c,c[phase]),expected=c[phase+'_result'];
    assert.equal(result.pass,expected.pass,c.id+phase);
    assert.deepEqual(result.failures,expected.failures,c.id+phase);
    assert.equal(result.next_step,expected.next_step,c.id+phase);
    assert.equal(result.checks.length,6);
    for(let i=0;i<6;i++)assert.equal(result.checks[i].pass,expected.checks[i].pass);
  }
});
test('a genuine quotation from the wrong policy is blocked',()=>{
 const c=data.cases[0],source=c.before.documents.find(d=>d.id===c.before.trace.source_id);
 assert.ok(source.text.includes(c.before.trace.quote));
 assert.deepEqual(core.inspect(c,c.before).failures,['policy_revision']);
});
test('baseline catches five deliberately seeded failures, corrected fixtures pass',()=>{
 const m=core.createMachine(data),baseline=m.suite();
 assert.equal(baseline.blocked_cases,5);
 assert.equal(baseline.passed_cases,7);
 assert.equal(baseline.seeded_faults,5);
 assert.equal(baseline.unsafe_seeded_escapes,0);
 m.applyCorrection();assert.equal(m.suite().blocked_cases,4);
 m.loadReleaseB();assert.equal(m.suite().passed_cases,12);
 m.loadReleaseA();assert.equal(m.suite().blocked_cases,5);
});
test('reintroducing each deliberately planted fault fails a corrected trace',()=>{
 for(const fault of ['wrong_revision','invented_quote','external_action','missing_citation','skipped_verifier']){
  const m=core.createMachine(data);m.loadReleaseB();m.inject(fault);
  assert.equal(m.result().pass,false,fault);assert.equal(m.suite().blocked_cases,1,fault);
  m.clearInjection();assert.equal(m.suite().passed,true,fault);
 }
});
test('safe escaping and invalid fixture handling',()=>{
 assert.throws(()=>core.createMachine({schema:core.SCHEMA,cases:[]}));
 assert.throws(()=>core.inspect(data.cases[0],{}));
 const m=core.createMachine(data);assert.throws(()=>m.inject('external_action'));
 assert.throws(()=>m.select('UNKNOWN'));
 assert.equal(core.escapeHTML('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
test('the first screen communicates problem solution proof and limits',()=>{
 for(const phrase of [
  'The AI missed a request for human help.','01 / Problem','02 / Build','03 / Prove',
  'id="live-eval-app"','id="live-pending"','id="live-data" hidden',
  'id="decision-app"','id="gate-misses"','id="gate-needless"','id="gate-six_checks"',
  'id="loop-app"','Run the independent check','id="proof-caught"','id="engineering-details"',
  'id="case-select"','id="audit-checks"','id="audit-documents"',
  'No AI model, human reviewer','not an INCA or MARS integration','not a claim about real-world accuracy'
 ])assert.ok(page.includes(phrase),phrase);
 assert.ok(page.indexOf('id="engineering-details"')<page.indexOf('id="audit-checks"'));
 assert.ok(page.includes('[hidden]{display:none!important}'));
 assert.ok(!page.includes('id="remaining-review"'));
 assert.ok(!page.includes('Apply sample fix'));
});
test('complete hiring-manager two-click path and optional regression proof',async()=>{
 const nodes={};
 function el(id){return nodes[id]??={textContent:'',innerHTML:'',value:'',style:{},hidden:false,disabled:false,className:'',attributes:{},
   setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this['on_'+k]=fn;},getAttribute(k){return this.attributes[k];}};
 }
 const doc={readyState:'complete',getElementById:el,addEventListener(){}};
 const shim={exports:{}},fetchMock=async()=>({ok:true,json:async()=>data});
 new Function('module','window','fetch',browserSource)(shim,{document:doc},fetchMock);
 await new Promise(setImmediate);
 const host=el('loop-app');
 assert.equal(el('gate-misses').textContent,'4');
 assert.equal(el('gate-needless').textContent,'0');
 assert.match(el('gate-headline').textContent,/4 risky examples/);
 el('gate-review_all').on_click();
 assert.equal(el('gate-misses').textContent,'0');
 assert.equal(el('gate-needless').textContent,'7');
 el('gate-six_checks').on_click();
 assert.equal(el('gate-misses').textContent,'0');
 assert.equal(el('gate-needless').textContent,'0');
 assert.match(el('gate-routes').textContent,/7 continue further checks · 5 to human review/);
 assert.match(el('gate-status').textContent,/PASSES/);
 el('gate-source_only').on_click();
 assert.match(el('gate-examples').innerHTML,/Wrong policy version/);
 const action=name=>host.on_click({target:{closest:q=>q==='[data-action]'?{getAttribute:()=>name}:null}});
 assert.equal(el('primary-action').textContent,'Run the independent check →');
 assert.equal(el('primary-action').attributes['data-action'],'run');
 assert.equal(el('verdict').hidden,true);
 assert.equal(el('proof-caught').textContent,'5 / 5');
 assert.equal(el('agent-year').textContent,'Policy 2024');
 action('run');
 assert.equal(el('primary-action').attributes['data-action'],'fix');
 assert.match(el('verdict-title').textContent,/BLOCKED/);
 assert.match(el('verdict-explain').textContent,/policy 2024/);
 assert.equal(el('verdict').hidden,false);
 assert.equal(el('audit-suite-result').textContent.includes('7/12'),true);
 action('fix');
 assert.equal(el('agent-year').textContent,'Policy 2025');
 assert.equal(el('compare-symbol').textContent,'=');
 assert.match(el('verdict-title').textContent,/PASS/);
 assert.match(el('verdict-explain').textContent,/Four other fictional cases remain blocked/);
 assert.equal(el('audit-suite-result').textContent.includes('8/12'),true);
 assert.equal(el('challenge-action').hidden,false);
 assert.equal(el('primary-action').hidden,true);
 action('regress');
 assert.equal(el('agent-year').textContent,'Policy 2024');
 assert.match(el('verdict-title').textContent,/BLOCKED AGAIN/);
 assert.equal(el('primary-action').attributes['data-action'],'restore');
 action('restore');
 assert.match(el('verdict-title').textContent,/PASS/);
 assert.equal(el('agent-year').textContent,'Policy 2025');
 el('case-select').on_change({target:{value:'CASE-029'}});
 assert.equal(el('case-audit-status').textContent,'Blocked for review');
 assert.equal(el('audit-action').textContent,'initiate_payment');
 action('all-examples');
 assert.equal(el('audit-suite-result').textContent.includes('12/12'),true);
 assert.match(el('verdict-title').textContent,/12 \/ 12/);
 assert.equal(el('challenge-action').hidden,true);
 action('reset');
 assert.equal(el('agent-year').textContent,'Policy 2024');
 assert.equal(el('verdict').hidden,true);
 assert.equal(el('proof-caught').textContent,'5 / 5');
 assert.equal(el('audit-suite-result').textContent.includes('7/12'),true);
});
