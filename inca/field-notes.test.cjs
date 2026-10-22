const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const at=n=>fs.readFileSync(path.join(__dirname,n),'utf8');
const hub=at('field-notes.html');
const study=at('jev-research.html');
const demo=at('agent-ops.html');
const proof=JSON.parse(at('jev-h1-h5.json'));

test('hiring manager first-person editorial story and perspectives',()=>{
 for(const phrase of ['What I built.','What worked.','What surprised me.','Hiring manager · 60 sec','Engineer · evidence & costs','Claims team · what\\'s next?','I would not automate']){
  assert.ok(hub.includes(phrase),phrase);
 }
 assert.match(hub,/role="tablist"/);
 assert.match(hub,/aria-selected="true"/);
 assert.match(hub,/data-show="engineer"/);
 assert.match(hub,/data-show="team"/);
 assert.match(hub,/AI tools helped me build and test/);
 assert.match(hub,/\/inca\/agent-ops\.html/);
 assert.doesNotMatch(hub,/\bwe built\b|\bwhat we built\b/i);
});
test('new report only claims recorded 208 calls and limited fixed fiction',()=>{
 assert.equal(proof.schema,'INCA-JEV-H1-H5-PUBLIC');
 assert.equal(proof.source_run,'https://github.com/mikelninh/mikelninh.github.io/actions/runs/39761548020');
 assert.equal(proof.holdout_n,30);
 assert.equal(proof.dev_n,10);
 assert.equal(proof.real_requests,208);
 assert.equal(proof.provider_errors,0);
 assert.equal(proof.observed_models.jev,'jev-1.14.0');
 assert.equal(proof.dataset_sha256,'153d73c39a5e329d254a721516d11c3c522b20e9721e53442c73b65af5616622');
 assert.ok(proof.limitations.length>=6);
});
test('H1 H5 correctness and matched twelve-case latency not cherry-picked',()=>{
 assert.equal(proof.h1.jev.correct,30);
 assert.equal(proof.h1.gpt.correct,10);
 assert.equal(proof.h1.deterministic_rules.correct,30);
 assert.equal(proof.h1.gpt.critical_under_escalations,20);
 assert.equal(proof.h5.jev_multi.correct_cases,28);
 assert.equal(proof.h5.gpt_multi.correct_cases,13);
 assert.equal(proof.h5.deterministic_rules.correct_cases,30);
 const q=proof.h5.matched_twelve_case_comparison;
 assert.equal(q.jev_multi.correct_cases,10);
 assert.equal(q.jev_four_serial.correct_cases,12);
 assert.equal(q.jev_multi.median_ms,94);
 assert.equal(q.jev_four_serial.median_ms,306.5);
 assert.ok(q.jev_multi.api_est_usd<q.jev_four_serial.api_est_usd);
});
test('recorded inference list-price estimate reconciles all 968 requests',()=>{
 const e=proof.overall_estimate_scope;
 assert.equal(e.total_requests_for_these_three_studies,968);
 assert.ok(Math.abs(e.h3_h4_600_requests_usd+e.h7_160_requests_usd+e.h1_h5_208_requests_usd-e.total_inference_est_usd)<1e-12);
 assert.ok(Math.abs(e.total_inference_est_usd-.048190632)<1e-12);
 assert.ok(Math.abs(proof.all_request_estimate_usd-.00814464)<1e-12);
 assert.match(hub,/\$0\.04819/);
 assert.match(hub,/earlier pilots excluded/i);
 assert.match(hub,/not paid invoices/i);
});
test('H1 H5 in detailed research, H7 German and English view now visible',()=>{
 for(const x of ['id="h1h5"','H1 learning','H5 learning','30 / 30','28 / 30','10/12','12/12','h7-routing-en-old','h7-routing-en-new','h7-fault-en-old','h7-time-en-new']){
  assert.ok(study.includes(x),x);
 }
 assert.match(demo,/href="\/inca\/field-notes\.html"/);
 assert.match(demo,/<h1>One claim/);
 const hero=demo.slice(demo.indexOf('<section class="hero">'),demo.indexOf('<section id="try">'));
 assert.doesNotMatch(hero,/H1\/H5|968|0\.04819/);
});
