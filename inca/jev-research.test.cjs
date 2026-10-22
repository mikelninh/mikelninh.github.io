const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'jev-research-v2.json'),'utf8'));
const html=fs.readFileSync(path.join(__dirname,'jev-research.html'),'utf8');
test('exact recorded API provenance, split and current model revisions',()=>{
 assert.equal(d.schema,'INCA-JEV-RESEARCH-V2-PUBLIC');
 assert.equal(d.source_run,'https://github.com/mikelninh/mikelninh.github.io/actions/runs/39691808881');
 assert.equal(d.dataset_sha256,'91fa068784770bf1e99a83fff42ddd78a6148e9108e4a3b7cdb720c990f12a19');
 assert.equal(d.total_cases,300);assert.equal(d.development_cases,60);assert.equal(d.holdout_cases,240);
 assert.equal(d.api_attempts.jev,300);assert.equal(d.api_attempts.gpt,300);
 assert.equal(d.api_failures.jev,0);assert.equal(d.api_failures.gpt,0);
 assert.equal(d.observed_models.jev,'jev-1.13.0');
});
test('source run H3 top-20% results and H4 route accuracy honest',()=>{
 const h=d.holdout;assert.equal(h.seeded_critical_faults,49);assert.equal(h.audit_budget,48);
 const x=Object.fromEntries(h.methods.map(y=>[y.id,y]));
 assert.equal(x.rules.critical_found,44);assert.equal(x.jev.critical_found,38);
 assert.equal(x.gpt.critical_found,15);assert.equal(x.random.critical_found,10);
 assert.equal(x.rules.tool_correct,240);assert.equal(x.jev.tool_correct,240);assert.equal(x.gpt.tool_correct,240);
 assert.equal(x.jev.model_p95_ms,129);assert.equal(x.gpt.model_p95_ms,927);
});
test('cost calculations and fault categories match actual recorded aggregate',()=>{
 const rates=d.estimated_cost_usd_on_public_rates;
 assert.ok(Math.abs(rates.jev-238815*.042/1e6)<1e-11);
 assert.ok(Math.abs(rates.gpt-(149963*.15+5274*.60)/1e6)<1e-11);
 const f=d.holdout.fault_types;
 assert.equal(f.reduce((a,b)=>a+b.total,0),49);
 assert.equal(f.reduce((a,b)=>a+b.rules,0),44);
 assert.equal(f.reduce((a,b)=>a+b.jev,0),38);
 assert.equal(f.reduce((a,b)=>a+b.gpt,0),15);
 assert.ok(d.limitations.some(s=>/structural/i.test(s)));
});
test('research page and main-app link are transparent and understandable',()=>{
 assert.match(html,/Can a small AI find the mistakes that matter/);
 assert.match(html,/simple rules/i);
 assert.match(html,/20%/);
 assert.match(html,/fictional/i);
 assert.match(html,/\/inca\/jev-research-v2\.json/);
 assert.match(html,/1\.13\.0/);
 const parent=fs.readFileSync(path.join(__dirname,'agent-ops.html'),'utf8');
 assert.match(parent,/href="\/inca\/jev-research\.html"/);
 assert.match(parent,/<h1>One claim/);
});

test('posthoc H2 filter savings and costs audited against real prior model requests',()=>{
 const a=JSON.parse(fs.readFileSync(path.join(__dirname,'jev-h2-h6.json'),'utf8'));
 assert.equal(a.source_run,'https://github.com/mikelninh/mikelninh.github.io/actions/runs/39691808881');
 assert.equal(a.h2.holdout_gpt_calls_baseline,240);
 assert.equal(a.h2.holdout_gpt_calls_with_jev,230);
 assert.equal(a.h2.critical_missed,5);
 assert.equal(a.h2.critical_found,44);
 assert.equal(a.h2.goal_met,false);
 assert.equal(a.h6.calibration_goal_met,false);
 assert.ok(a.h2.jev_first_cost_est_usd>a.h2.gpt_only_cost_est_usd);
 assert.match(a.repeat_holdout_warning,/already inspected/i);
});
test('recorded H7 160-call 1.13 vs 1.14 version pins and costs correctly reported',()=>{
 const b=JSON.parse(fs.readFileSync(path.join(__dirname,'jev-h7.json'),'utf8'));
 assert.equal(b.source_run,'https://github.com/mikelninh/mikelninh.github.io/actions/runs/39751482592');
 assert.equal(b.real_provider_calls,160);assert.equal(b.api_errors,0);
 for(const version of ['jev-1.13.0','jev-1.14.0']){
  for(const language of ['de','en']){
   const v=b.models[version][language];
   assert.equal(v.tool_correct,40);
   assert.equal(v.critical_found_at_0_5,15);
   assert.equal(v.critical_faults,20);
  }
 }
 assert.ok(Math.abs(b.cost.both_versions_estimated_usd-103736*.042/1e6)<1e-10);
 assert.match(html,/jev-h2-h6\.json/);
 assert.match(html,/jev-h7\.json/);
 assert.doesNotMatch(html,/not its newer releases/);
});
