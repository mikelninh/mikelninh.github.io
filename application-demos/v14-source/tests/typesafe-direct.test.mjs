import test from 'node:test';
import assert from 'node:assert/strict';
import {inferModel,normalizeJev} from '../lib/providers.js';
import {CLASSES} from '../lib/arena.js';

test('direct TypeSafe API uses the official endpoint, pinned Jev 1.14 model and a server-side secret',async()=>{
 const originalKey=process.env.TYPESAFE_API_KEY,originalOpenRouter=process.env.OPENROUTER_API_KEY,originalFetch=globalThis.fetch;
 process.env.TYPESAFE_API_KEY='test-secret-not-a-real-token';
 delete process.env.OPENROUTER_API_KEY;
 let requests=0;
 globalThis.fetch=async(url,options)=>{
   requests++;
   assert.equal(url,'https://api.typesafe.ai/v1/systemone');
   assert.equal(options.headers.Authorization,'Bearer test-secret-not-a-real-token');
   assert.equal(options.method,'POST');
   const payload=JSON.parse(options.body);
   assert.equal(payload.model,'jev-1.14.0');
   assert.deepEqual(Object.keys(payload.questions),CLASSES);
   assert.ok(!('gold' in payload.state));
   return {ok:true,json:async()=>({model:'jev-1.14.0',answers:Object.fromEntries(CLASSES.map(c=>[c,{type:'noul',noul:c==='quality'?0.91:0.03}])),usage:{input_tokens:150}})};
 };
 try{
   const result=await inferModel('jev',{product:'Fictional Socks',text:'Das Material reißt am Zeh.'});
   assert.equal(requests,1);
   assert.deepEqual(result.categories,['quality']);
   assert.equal(result.scores.quality,0.91);
   assert.equal(result.provider,'jev');
   assert.equal(result.model,'jev-1.14.0');
   assert.ok(result.estimated_cost_usd>=0);
 }finally{
   globalThis.fetch=originalFetch;
   if(originalKey===undefined)delete process.env.TYPESAFE_API_KEY;else process.env.TYPESAFE_API_KEY=originalKey;
   if(originalOpenRouter===undefined)delete process.env.OPENROUTER_API_KEY;else process.env.OPENROUTER_API_KEY=originalOpenRouter;
 }
});
test('malformed Jev answer is never accepted as a prediction',()=>{
 assert.throws(()=>normalizeJev({answers:{quality:{type:'noul',noul:1.7}}}),/invalid_jev_answer|invalid_probability/);
});
