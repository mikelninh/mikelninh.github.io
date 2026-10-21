const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const js=fs.readFileSync(path.join(__dirname,'agent-ops-ui.js'),'utf8');
const sandbox={module:{exports:{}}};
vm.runInNewContext(js,sandbox,{filename:'agent-ops-ui.js'});
const ui=sandbox.module.exports;
const tracesPath=path.join(__dirname,'agent-ops-traces.json');
function fixture(){
  const report=JSON.parse(fs.readFileSync(tracesPath,'utf8'));
  return report;
}
test('Python-recorded trace validates under strict read-only UI contract',()=>{
  const report=fixture();
  assert.equal(report.release,'agent-ops-v1.1');
  assert.equal(report.case_count,6);
  assert.ok(ui.validate(report));
  for(const r of report.runs){
    assert.equal(r.events.length,7);
    assert.equal(r.external_actions,0);
    assert.equal(r.events[6].output.payment,false);
    assert.equal(r.handoff.status,'UNSENT_DRAFT');
  }
});
test('wrong planner, missing safety step and forbidden payment all reject playback',()=>{
  const a=fixture();a.execution_mode='openai';
  assert.equal(ui.validate(a),null);
  const b=fixture();b.runs[0].events.pop();
  assert.equal(ui.validate(b),null);
  const c=fixture();c.runs[1].events[6].output.payment=true;
  assert.equal(ui.validate(c),null);
});
test('swapped tool sequence invalidates recorded trace',()=>{
  const a=fixture();[a.runs[0].events[2],a.runs[0].events[4]]=[a.runs[0].events[4],a.runs[0].events[2]];
  assert.equal(ui.validate(a),null);
});
test('six true case IDs exist with no duplicate or execution effects',()=>{
  const r=fixture();const ids=r.runs.map(x=>x.case_id);
  assert.deepEqual(ids,['TR-101','HM-202','TH-303','LI-404','EL-505','TR-606']);
  assert.equal(new Set(ids).size,6);
  assert.equal(r.runs.filter(x=>x.route==='HUMAN_REVIEW').length,4);
  assert.equal(r.runs.filter(x=>x.route==='NEED_INFO').length,1);
  assert.equal(r.runs.filter(x=>x.route==='CONTINUE_CHECKS').length,1);
});
test('dashboard tells users it replays real offline Python outputs, not a live LLM',()=>{
  const html=fs.readFileSync(path.join(__dirname,'agent-ops.html'),'utf8');
  for(const marker of ['id="agent-ops-app"','id="case-picker"','id="timeline"',
    'id="feedback-download"','id="event-output"','id="workspace"','agent-ops-ui.js',
    'independent safety supervisor','offline scripted planner','read-only playback']){
    assert.ok(html.toLowerCase().includes(marker.toLowerCase()),marker);
  }
  assert.match(html,/no real reviewer assigned/i);
});
