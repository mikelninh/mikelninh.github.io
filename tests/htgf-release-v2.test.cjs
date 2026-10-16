const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('all three application proofs share editorial design and proof boundaries',()=>{
 for(const p of ['agents/index.html','gitlaw/index.html','pruefpilot/index.html']){
  const html=read(p);
  assert.match(html,/application-showcase-v2\.css/);
  assert.match(html,/class="as-release-evidence"/);
  assert.match(html,/What is real\. What stays human\./);
  assert.match(html,/No production claims/);
  assert.match(html,/Inspect source code/);
  assert.match(html,/See tested evidence/);
 }
});
test('DWF exposes the meaningful case and a real reproducible safety test',()=>{
 const html=read('agents/index.html');
 assert.match(html,/A tenant needs help/);
 assert.match(html,/Try the 60-second case/);
 assert.match(html,/Run worker/);
 assert.match(html,/Remove property record/);
 assert.match(html,/Retry same request/);
 assert.match(html,/proofs\/htgf-boundary-release\.test\.mjs/);
 assert.match(html,/38720612981/);
});
test('GitLaw case still opens sources and cannot claim to be a lawyer',()=>{
 const html=read('gitlaw/index.html');
 assert.match(html,/When someone checks a rent increase/);
 assert.match(html,/id="sourceBtn"/);
 assert.match(html,/id="sources"/);
 assert.match(html,/gesetze-im-internet\.de\/bgb\/__558/);
 assert.match(html,/legal professional/);
});
test('PruefPilot still supports three actual synthetic branches and review',()=>{
 const html=read('pruefpilot/index.html');
 for(const mode of ['funding','travel','clean'])assert.match(html,new RegExp('data-case="'+mode+'"'));
 assert.match(html,/id="run"/);
 assert.match(html,/id="why"/);
 assert.match(html,/id="approve"/);
 assert.match(html,/person remains responsible for approval and release/);
});
