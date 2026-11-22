#!/usr/bin/env node
// Read-only production checks: no customer data and no paid AI calls.
// Run from CI: node scripts/product-live-readiness.mjs
const checks=[
 {id:'return-loop-pages',url:'https://mikelninh.github.io/application-demos/return-loop/',expects:/RETURN LOOP/i,contentType:'text/html'},
 {id:'return-loop-v14-pages',url:'https://mikelninh.github.io/application-demos/v14/',expects:/RETURN LOOP/i,contentType:'text/html'},
 {id:'return-loop-vercel',url:'https://return-loop-model-arena.vercel.app/',expects:/RETURN LOOP/i,contentType:'text/html'},
 {id:'return-loop-api-status',url:'https://return-loop-model-arena.vercel.app/api/status',expects:/"build"\s*:\s*"v14"/i,contentType:'application/json'},
 {id:'hauspilot-public-demo',url:'https://mikelninh.github.io/agents/',expects:/HausPilot|Digital Worker Factory|human/i,contentType:'text/html'}
];
const results=[];
for(const check of checks){
 const begin=Date.now();
 try{
  const r=await fetch(check.url,{headers:{'user-agent':'Mikel-Product-Release-Smoke/1.0','accept':'text/html,application/json'},redirect:'follow',signal:AbortSignal.timeout(18000)});
  const data=await r.text();const ct=r.headers.get('content-type')||'';
  const ok=r.ok&&ct.toLowerCase().includes(check.contentType)&&check.expects.test(data);
  results.push({id:check.id,ok,http:r.status,ms:Date.now()-begin,finalUrl:r.url,contentType:ct,reason:ok?'verified':!r.ok?'http_'+r.status:!ct.includes(check.contentType)?'unexpected_content_type':'missing_expected_content'});
 }catch(e){results.push({id:check.id,ok:false,ms:Date.now()-begin,reason:e.name+': '+e.message});}
}
console.log(JSON.stringify({schema:'product-live-smoke-v1',measuredAt:new Date().toISOString(),results,passed:results.every(r=>r.ok)},null,2));
if(results.some(x=>!x.ok))process.exitCode=1;
