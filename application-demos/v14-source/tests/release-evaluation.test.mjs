import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {assessDraft} from '../lib/reply_guard.js';
import {cases,baseline} from '../lib/data.js';
import {score} from '../lib/arena.js';
const report=JSON.parse(readFileSync(new URL('../public/release-evaluation-full.json',import.meta.url),'utf8'));

test('Archived 24 real predictions map to exactly 24 fictional fixtures',()=>{
 assert.equal(report.status,'complete');
 assert.equal(report.attempted,24);
 assert.equal(report.successful,24);
 assert.equal(report.rows.length,cases.length);
 assert.equal(new Set(report.rows.map(r=>r.id)).size,24);
 for(const row of report.rows){
  const fixture=cases.find(x=>x.id===row.id);
  assert.ok(fixture);
  assert.equal(row.input_sha256,createHash('sha256').update(fixture.text).digest('hex'));
  assert.deepEqual(row.gold,fixture.gold);
  assert.deepEqual(row.baseline,baseline(fixture.text));
  assert.ok(row.evidence_valid);
  assert.ok(fixture.text.includes(row.evidence));
  assert.ok(row.draft_present);
 }
});

test('Published 24-case metrics are reproducible from individual predictions',()=>{
 const same=report.rows.map(r=>({gold:r.gold,pred:r.llm}));
 const llm=score(same);
 const rules=score(report.rows.map(r=>({gold:r.gold,pred:r.baseline})));
 assert.ok(Math.abs(llm.exactMatch-report.llm_on_same_successful_cases.exact_match)<1e-10);
 assert.ok(Math.abs(rules.exactMatch-report.baseline_on_same_successful_cases.exact_match)<1e-10);
 assert.equal(llm.byClass.quality.fn,report.llm_on_same_successful_cases.quality_false_negatives);
 assert.equal(rules.byClass.quality.fn,report.baseline_on_same_successful_cases.quality_false_negatives);
});

test('Model replies are never auto-approved and critical unsupported claims are flagged',()=>{
 for(const row of report.rows){
  const audit=assessDraft(row.draft_reply);
  assert.equal(audit.auto_send_allowed,false);
  assert.equal(audit.human_approval_required,true);
 }
 const byId=new Map(report.rows.map(x=>[x.id,x]));
 assert.ok(assessDraft(byId.get('RL-310').draft_reply).flags.some(x=>x.code==='unperformed_external_action'));
 assert.ok(assessDraft(byId.get('RL-317').draft_reply).flags.some(x=>x.code==='unverified_policy'));
 assert.ok(assessDraft(byId.get('RL-320').draft_reply).flags.some(x=>x.code==='unsupported_size_recommendation'));
});

test('Safety checks reject unverified support claims without inventing external actions',()=>{
 assert.ok(assessDraft('Klar, ich schicke dir schnell ein Etikett.').flags.length>0);
 assert.ok(assessDraft('Dein Widerruf ist angekommen.').flags.length>0);
 assert.equal(assessDraft('Danke für deine Nachricht. Kannst du uns bitte ein Foto schicken?').flags.length,0);
});
