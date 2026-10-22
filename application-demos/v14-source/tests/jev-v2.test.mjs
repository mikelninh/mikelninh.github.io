import test from 'node:test';
import assert from 'node:assert/strict';
import {CHALLENGE,VERSION,THRESHOLD,TYPES,MODEL,getBatch,makeRequest,normalizeBatch,scoreBatch} from '../lib/jev_v2.js';
import {baseline} from '../lib/data.js';
import handler from '../api/jev-v2.js';
function mockResponse(){
 return{statusCode:200,headers:{},payload:null,setHeader(k,v){this.headers[k]=v;return this;},status(n){this.statusCode=n;return this;},json(p){this.payload=p;return this;}};
}
function sampleAnswers(rows,makeScore){
 const q=makeRequest(rows),answers={};
 for(const row of rows)for(const cls of TYPES){
  const key=row.id.replace(/[^A-Za-z0-9]/g,'')+'__'+cls;
  answers[key]={type:'noul',noul:makeScore(row,cls)};
 }
 return {q,answers};
}
function withEnv(vars,run){
 const keys=Object.keys(vars),original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 for(const [k,v] of Object.entries(vars))if(v===undefined)delete process.env[k];else process.env[k]=v;
 return Promise.resolve().then(run).finally(()=>{for(const [k,v] of Object.entries(original))if(v===undefined)delete process.env[k];else process.env[k]=v;});
}
test('frozen untouched challenge: sixteen distinct synthetic cases',()=>{
 assert.equal(CHALLENGE.length,16);assert.equal(new Set(CHALLENGE.map(c=>c.id)).size,16);
 assert.equal(CHALLENGE[0].id,'CH-001');assert.equal(CHALLENGE.at(-1).id,'CH-016');
 assert.deepEqual(CHALLENGE.map(x=>x.gold).flat().includes('quality'),true);
 assert.equal(VERSION,'jev-v2-frozen-2026-10-22');assert.equal(THRESHOLD,.8);
 assert.equal(MODEL,'jev-1.14.0');
});
test('baseline on the same challenge is 7/16 exact, 3 missed quality, 0 false alarms',()=>{
 const out=scoreBatch(CHALLENGE,CHALLENGE.map(x=>({id:x.id,categories:baseline(x.text)})));
 assert.deepEqual([out.exact,out.missed_quality,out.false_quality_alarms],[7,3,0]);
});
test('four batches of four cases; only twenty independent Noul questions',()=>{
 for(let i=0;i<4;i++){const rows=getBatch(i),body=makeRequest(rows);assert.equal(rows.length,4);
  assert.equal(Object.keys(body.questions).length,20);
  assert.ok(Object.values(body.questions).every(q=>q.type==='noul'&&q.instructions.length>80));
  assert.equal(JSON.stringify(body).includes('"gold"'),false);
  assert.equal(JSON.stringify(body).includes('"truth"'),false);}
 assert.throws(()=>getBatch(4),/invalid_batch/);
});
test('80 percent passes, 79 percent fails; other only as deterministic fallback',()=>{
 const rows=getBatch(0);
 let {answers}=sampleAnswers(rows,(row,cls)=>cls==='quality'?.8:.79);
 assert.ok(normalizeBatch(rows,{answers}).every(r=>r.categories.length===1&&r.categories[0]==='quality'));
 ({answers}=sampleAnswers(rows,()=>.79));
 assert.ok(normalizeBatch(rows,{answers}).every(r=>r.categories.length===1&&r.categories[0]==='other'));
});
test('incomplete, out-of-range, nonnumeric and malformed Jev answers fail closed',()=>{
 const rows=getBatch(0);
 assert.throws(()=>normalizeBatch(rows,{answers:{}}),/invalid_jev_answer/);
 for(const wrong of [1.2,-.1,NaN,'0.9',null]){
  const {answers}=sampleAnswers(rows,()=>.1);
  const firstKey=Object.keys(answers)[0];answers[firstKey]={type:'noul',noul:wrong};
  assert.throws(()=>normalizeBatch(rows,{answers}),/invalid_jev_answer/);
 }
});
test('GET metadata cannot launch billable provider calls',async()=>{
 const originalFetch=globalThis.fetch;globalThis.fetch=async()=>{throw Error('GET attempted network');};
 try{
  const res=mockResponse();await handler({method:'GET',headers:{}},res);
  assert.equal(res.statusCode,200);
  assert.equal(res.payload.threshold,.8);assert.equal(res.payload.challenge_cases,16);
  assert.equal(res.payload.rule_baseline.exact,7);
  assert.equal(res.payload.jev_measurement,'not_stored_on_server');
 }finally{globalThis.fetch=originalFetch}
});
test('unauthorized POST never calls TypeSafe',async()=>{
 await withEnv({TYPESAFE_API_KEY:'test-secret',DEMO_ACCESS_TOKEN:'test-password',PAID_REQUESTS_ENABLED:'true'},async()=>{
  const originalFetch=globalThis.fetch;globalThis.fetch=async()=>{throw Error('unauthenticated network called');};
  try{const res=mockResponse();await handler({method:'POST',headers:{'x-demo-token':'wrong'},body:{batch:0}},res);
   assert.equal(res.statusCode,401);assert.equal(res.payload.error,'demo_password_required');
  }finally{globalThis.fetch=originalFetch}
 });
});
test('authenticated mock validates schema, never submits hidden human gold labels',async()=>{
 await withEnv({TYPESAFE_API_KEY:'test-secret',DEMO_ACCESS_TOKEN:'test-password',PAID_REQUESTS_ENABLED:'true'},async()=>{
  const originalFetch=globalThis.fetch;let calls=0;globalThis.fetch=async(url,options)=>{
   calls++;assert.equal(url,'https://api.typesafe.ai/v1/systemone');assert.equal(options.headers.Authorization,'Bearer test-secret');
   const payload=JSON.parse(options.body);assert.equal(payload.model,'jev-1.14.0');
   assert.equal(Object.keys(payload.questions).length,20);assert.equal(JSON.stringify(payload).includes('"gold"'),false);
   const answers={};for(const row of getBatch(0))for(const cls of TYPES)
    answers[row.id.replace(/[^A-Za-z0-9]/g,'')+'__'+cls]={type:'noul',noul:row.gold.includes(cls)?.97:.01};
   return{ok:true,json:async()=>({model:'jev-1.14.0',answers,usage:{input_tokens:500,cost_usd:.000021}})};
  };
  try{
   const res=mockResponse();await handler({method:'POST',headers:{'x-demo-token':'test-password','x-forwarded-for':'192.0.2.42'},body:{batch:0}},res);
   assert.equal(res.statusCode,200);assert.equal(res.payload.ok,true);assert.equal(res.payload.threshold,.8);
   assert.equal(res.payload.metrics.exact,4);assert.equal(res.payload.cases.length,4);
   assert.equal(res.payload.cost_usd_reported,.000021);assert.equal(calls,1);
   assert.equal(JSON.stringify(res.payload).includes('test-secret'),false);
  }finally{globalThis.fetch=originalFetch}
 });
});
