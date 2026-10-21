import test from 'node:test';
import assert from 'node:assert/strict';
import {cases} from '../lib/data.js';
import {inferModel} from '../lib/providers.js';

test('the LLM route builds a private, structured request and returns an editable draft (MOCK, not live)',async()=>{
 const originalFetch=globalThis.fetch;
 const oldKey=process.env.OPENAI_API_KEY;
 const oldModel=process.env.OPENAI_TEXT_MODEL;
 process.env.OPENAI_API_KEY='sk-test-only-not-a-real-key';
 process.env.OPENAI_TEXT_MODEL='gpt-4.1-mini';
 let calls=0;
 const result={
   categories:['quality'],defect_subtype:'premature_wear',
   evidence:'Nach zweimaligem Tragen',
   summary:'Möglicher Verschleiß',needs_human_review:true,
   review_reason:'Ungewöhnlicher Verschleiß muss menschlich geprüft werden',
   draft_reply:'Hallo, vielen Dank für deine Nachricht. Könntest du uns ein Foto der Ferse schicken? Wir prüfen dann den Hinweis. Viele Grüße, dein Support-Team'
 };
 try{
  globalThis.fetch=async (url,opts)=>{
   calls++;
   assert.equal(url,'https://api.openai.com/v1/responses');
   assert.equal(opts.method,'POST');
   assert.equal(opts.headers.Authorization,'Bearer sk-test-only-not-a-real-key');
   const body=JSON.parse(opts.body);
   assert.equal(body.model,'gpt-4.1-mini');
   assert.equal(body.store,false);
   assert.equal(body.text.format.type,'json_schema');
   assert.equal(body.text.format.strict,true);
   assert.equal(body.text.format.schema.required.includes('draft_reply'),true);
   return {ok:true,status:200,json:async()=>({
     id:'resp_synthetic_fake',model:'gpt-4.1-mini',
     output:[{content:[{type:'output_text',text:JSON.stringify(result)}]}],
     usage:{input_tokens:100,output_tokens:100}
   })};
  };
  const x=await inferModel('llm',cases[0]);
  assert.equal(calls,1);
  assert.deepEqual(x.categories,['quality']);
  assert.equal(x.review,true);
  assert.equal(x.draft_reply,result.draft_reply);
  assert.equal(x.evidence,'Nach zweimaligem Tragen');
 }finally{
  globalThis.fetch=originalFetch;
  if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;
  if(oldModel===undefined)delete process.env.OPENAI_TEXT_MODEL;else process.env.OPENAI_TEXT_MODEL=oldModel;
 }
});
