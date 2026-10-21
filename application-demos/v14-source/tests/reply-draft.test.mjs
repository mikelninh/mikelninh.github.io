import test from 'node:test';
import assert from 'node:assert/strict';
import {schema,validateLLM} from '../lib/providers.js';

const customer='Nach zweimaligem Tragen ist die Ferse sehr dünn.';
const valid={
 categories:['quality'],defect_subtype:'premature_wear',
 evidence:'die Ferse sehr dünn',summary:'Möglicher Qualitätshinweis',
 needs_human_review:true,review_reason:'Kein bestätigter Defekt',
 draft_reply:'Hallo, danke für deine Nachricht. Magst du uns ein Foto schicken? Wir prüfen den Hinweis. Viele Grüße, dein Support-Team'
};
test('Structured Output schema requires customer reply draft',()=>{
 assert.equal(schema.additionalProperties,false);
 assert.equal(schema.required.includes('draft_reply'),true);
 assert.equal(schema.properties.draft_reply.type,'string');
});
test('safe LLM response preserves verifiable evidence and editable draft',()=>{
 const output={output:[{content:[{type:'output_text',text:JSON.stringify(valid)}]}]};
 const parsed=validateLLM(output,customer);
 assert.deepEqual(parsed.categories,['quality']);
 assert.equal(parsed.evidence,'die Ferse sehr dünn');
 assert.equal(parsed.review,true);
 assert.equal(parsed.draft_reply,valid.draft_reply);
});
test('an invented quote is removed from extracted evidence',()=>{
 const output={output:[{content:[{type:'output_text',text:JSON.stringify({...valid,evidence:'Serienfehler bestätigt'})}]}]};
 assert.equal(validateLLM(output,customer).evidence,'');
});
test('missing model output is a failure, not a simulated answer',()=>{
 assert.throws(()=>validateLLM({output:[]},customer),/no_model_output/);
});
