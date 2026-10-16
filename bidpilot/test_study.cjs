const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
// Root package.json declares type:module. Execute the browser-friendly UMD file
// in a Node VM with a CommonJS module shim to inspect its pure session class.
const moduleShim={exports:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'study.js'),'utf8'),{module:moduleShim,globalThis:{}},{filename:'study.js'});
const {StudySession}=moduleShim.exports;
assert.equal(typeof StudySession,'function');

test('a real inspection is required before a session may report first value',()=>{
 let time=1000;
 const s=new StudySession({now:()=>time});s.start();time+=12000;
 assert.throws(()=>s.finish({useful:true,noticeId:'123456-2026'}),/must_inspect/);
 assert.equal(s.endMs,null);
 assert.equal(s.inspect('123456-2026'),true);
 const result=s.finish({useful:true,noticeId:'123456-2026'});
 assert.equal(result.success,true);
 assert.equal(result.firstRelevantNoticeId,'123456-2026');
 assert.equal(result.elapsedSeconds,12);
 assert.equal(result.firstInspectedAtSeconds,12);
 assert.equal(result.targetMet,true);
});

test('valid TED ID required; source IDs cannot be fabricated by an arbitrary string',()=>{
 const s=new StudySession({now:()=>200});s.start();
 assert.equal(s.inspect('not-a-source'),false);
 assert.equal(s.inspect('<script>alert(1)</script>'),false);
 assert.equal(s.inspect('123456-2026'),true);
 assert.equal(s.inspect('123456-2026'),true);
 assert.equal(s.inspected.length,1);
 const result=s.finish({useful:false});
 assert.equal(result.success,false);
 assert.equal(result.firstRelevantNoticeId,null);
});

test('honest failure records time and never pretends that target was met',()=>{
 let time=0;
 const s=new StudySession({variant:'baseline',now:()=>time});s.start();
 time+=245000;
 const report=s.finish({useful:false});
 assert.equal(report.elapsedSeconds,245);
 assert.equal(report.targetMet,false);
 assert.equal(report.inspectedCount,0);
 assert.equal(report.variant,'baseline');
});

test('three-minute target is evaluated rather than asserted',()=>{
 let time=1000;
 const s=new StudySession({variant:'guided',now:()=>time});s.start();s.inspect('123456-2026');time+=181000;
 const result=s.finish({useful:true,noticeId:'123456-2026'});
 assert.equal(result.targetMet,false);
 assert.equal(result.elapsedSeconds,181);
});

test('session cannot be double-finished or started twice',()=>{
 const s=new StudySession();s.start();
 assert.throws(()=>s.start(),/already_started/);
 assert.throws(()=>s.finish({useful:'yes'}),/explicit_outcome_required/);
 s.finish({useful:false});
 assert.throws(()=>s.finish({useful:false}),/already_finished/);
});

test('two arms measure the same outcome, no random business success is inserted',()=>{
 let time=0;
 const outputs=['guided','baseline'].map(variant=>{
   const s=new StudySession({variant,now:()=>time});
   s.start();time+=2000;s.inspect('707789-2026');time+=2000;
   const report=s.finish({useful:true,noticeId:'707789-2026'});
   time+=1000;
   return report;
 });
 assert.ok(outputs.every(x=>x.success===true&&x.inspectedCount===1&&x.completed===true));
 assert.deepEqual(outputs.map(x=>x.variant),['guided','baseline']);
 assert.ok(outputs.every(x=>x.dataDisclaimer.includes('not verified')));
});


test('optional feedback is validated and exported without storing private data centrally',()=>{
  const s=new StudySession({now:()=>500});s.start();s.inspect('123456-2026');
  const r=s.finish({useful:true,noticeId:'123456-2026',feedback:{reason:'unclear_fit',confidence:'unsure',note:'Need better fit explanation.'}});
  assert.equal(r.feedback.reason,'unclear_fit');
  assert.equal(r.feedback.confidence,'unsure');
  assert.equal(r.feedback.note,'Need better fit explanation.');
  assert.equal(r.feedbackConsent,'Participant-controlled local export only');
});
test('unexpected free-form values cannot invent a feedback category',()=>{
  const s=new StudySession();s.start();
  const r=s.finish({useful:false,feedback:{reason:'fabricated_benefit',confidence:'certain!',note:'<script>hello</script>'}});
  assert.equal(r.feedback.reason,null);assert.equal(r.feedback.confidence,null);
  assert.equal(r.feedback.note,'hello');
});
test('feedback is explicitly optional and an honest unsuccessful session can be exported',()=>{
  const s=new StudySession();s.start();const r=s.finish({useful:false});
  assert.equal(r.feedback.reason,null);assert.equal(r.success,false);
});
test('the research UI exposes explicit learning and stopping criteria',()=>{
  const h=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  assert.ok(h.includes('STOP / REWORK SIGNAL'));assert.ok(h.includes('studyReason'));assert.ok(h.includes('studyConfidence'));
});
