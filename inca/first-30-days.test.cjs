const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const page=fs.readFileSync(path.join(__dirname,'first-30-days.html'),'utf8');
const main=fs.readFileSync(path.join(__dirname,'agent-ops.html'),'utf8');
test('future-in-role section presents practical questions without assuming INCA inside information',()=>{
 assert.match(page,/If I joined INCA/);
 assert.match(page,/Not a description of INCA's internal processes/);
 assert.match(page,/Claims Experts/);
 assert.match(page,/Which handoff or missing-document question/);
 assert.match(page,/which must always remain under explicit human control/);
});
test('three concrete tests preserve human control and operational measurement',()=>{
 for(const s of ['Missing-evidence assistant','Better human handoffs','Selective quality audits','shadow mode','total cost including human effort','If rules win, keep rules'])assert.ok(page.includes(s),s);
 assert.match(page,/without increasing missed required evidence/);
 assert.match(page,/never let model confidence replace source verification/);
});
test('main recruiter work sample stays simple, with optional followup link',()=>{
 assert.match(main,/href="\/inca\/first-30-days\.html"/);
 const hero=main.slice(main.indexOf('<section class="hero">'),main.indexOf('<section id="try">'));
 assert.doesNotMatch(hero,/WEEK 01|selective quality|Which handoff/i);
 assert.match(main,/<h1>One claim/);
});
