const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'catch-the-mistake.js'),'utf8');
const context={module:{exports:{}}};
vm.runInNewContext(source,context,{filename:'catch-the-mistake.js'});
const api=context.module.exports;
test('known H-A-011 synthetic failure and proposed gate are not conflated',()=>{
  assert.equal(api.original.source,'H-A-011 · developer-authored synthetic holdout A');
  assert.equal(api.original.recordedV2,'AUTO_READY');
  assert.equal(api.original.proposedV3,'HUMAN_REVIEW');
  assert.match(api.original.note,/illustrative reconstruction/);
});
test('choosing continue reveals the recorded routing miss',()=>{
  const x=api.decide('continue');
  assert.equal(x.caught,false);
  assert.equal(x.oldRoute,'AUTO_READY');
  assert.equal(x.updatedRoute,'HUMAN_REVIEW');
  assert.match(x.heading,/mistake/);
  assert.equal(x.effects,0);
});
test('choosing human review identifies the contradiction',()=>{
  const x=api.decide('review');
  assert.equal(x.caught,true);
  assert.match(x.explanation,/human review/i);
  assert.equal(x.effects,0);
});
test('invalid choices do not receive a fabricated result',()=>{
  assert.throws(()=>api.decide('pay'),/invalid_choice/);
  assert.throws(()=>api.decide(null),/invalid_choice/);
});
test('visible HTML contains two sources, exact reconstructed dates, reveal and three-step story',()=>{
  const html=fs.readFileSync(path.join(__dirname,'60s.html'),'utf8');
  for(const x of ['id="mistake-challenge"','data-mc-choice="continue"','data-mc-choice="review"',
    'id="mc-reveal"','id="mc-reset"','id="mc-status"',
    '11.07.2026','12.07.2026','RECORDED GUARDED V2','PROPOSED V3 REPLAY',
    'id="case-workshop"','src="/inca/catch-the-mistake.js"']){
      assert.ok(html.includes(x), 'Missing challenge feature '+x);
  }
  assert.match(html,/illustrative reconstruction/);
  assert.match(html,/01 · PROBLEM/);
  assert.match(html,/02 · BUILT/);
  assert.match(html,/03 · TRY/);
});
test('existing case-editing route still works separately',()=>{
 const editor=fs.readFileSync(path.join(__dirname,'interactive-case.js'),'utf8');
 assert.match(editor,/function evaluate\(docA,docB\)/);
 assert.match(editor,/HUMAN_REVIEW/);
});
