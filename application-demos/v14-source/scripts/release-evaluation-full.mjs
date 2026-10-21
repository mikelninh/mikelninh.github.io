import {writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {cases,baseline} from '../lib/data.js';
import {score} from '../lib/arena.js';
import {inferModel} from '../lib/providers.js';

// Explicitly bounded build-time evaluation. Only eight fictional cases, one call each.
const IDS=cases.map(x=>x.id);
const selected=IDS.map(id=>cases.find(x=>x.id===id));
if(selected.some(x=>!x))throw Error('missing_fixture');
const rows=[];
const started=new Date().toISOString();
const config={prompt_revision:'v3 – measured category rules and SNOCKS du-tone',model:process.env.OPENAI_TEXT_MODEL||'gpt-4.1-mini',sample:'All 24 synthetic development cases (NOT independent holdout)',method:'One live OpenAI Responses API inference per case, compared to the same deterministic keyword rules',measured_at:started};
for(const item of selected){
 const entry={id:item.id,product:item.product,gold:item.gold,baseline:baseline(item.text),input_sha256:createHash('sha256').update(item.text).digest('hex'),status:'not_tested'};
 try{
  if(!process.env.OPENAI_API_KEY)throw Error('key_not_configured');
  const x=await inferModel('llm',item);
  if(!Array.isArray(x.categories))throw Error('invalid_model_categories');
  entry.status='ok';entry.llm=x.categories;
  entry.evidence_valid=Boolean(x.evidence&&item.text.includes(x.evidence));
  entry.evidence=x.evidence||'';
  entry.latency_ms=x.latency_ms;
  entry.review_recommended=Boolean(x.review);
  entry.draft_present=typeof x.draft_reply==='string'&&x.draft_reply.trim().length>0;
  entry.draft_word_count=entry.draft_present?x.draft_reply.trim().split(/\s+/).length:0;
  entry.draft_reply=entry.draft_present?x.draft_reply.slice(0,950):null;
  entry.model=x.model||null;
  entry.usage=x.usage?{input_tokens:x.usage.input_tokens??null,output_tokens:x.usage.output_tokens??null}:null;
 }catch(err){entry.status='error';entry.error=err.code||err.message||'inference_failed';}
 rows.push(entry);
 console.log('EVAL_CASE '+entry.id+' '+entry.status+(entry.error?' '+entry.error:''));
}
const success=rows.filter(x=>x.status==='ok');
const statsFor=pred=>success.length?score(success.map(x=>({gold:x.gold,pred:pred(x)}))):null;
const b=statsFor(x=>x.baseline),m=statsFor(x=>x.llm);
const asStats=o=>o&&({exact_match:o.exactMatch,macro_f1:o.macroF1,quality_false_negatives:o.byClass.quality.fn,quality_false_positives:o.byClass.quality.fp});
const report={
 status:success.length===IDS.length?'complete':success.length?'partial':'failed',
 type:'exploratory_live_test',
 label:'All 24 hand-labelled fictional DEVELOPMENT cases – NOT independently blinded and not a production benchmark',
 config,selected_ids:IDS,attempted:rows.length,successful:success.length,
 errors:rows.filter(x=>x.status!=='ok').map(x=>({id:x.id,error:x.error})),
 quality_cases_in_successful_subset:success.filter(x=>x.gold.includes('quality')).length,
 baseline_on_same_successful_cases:asStats(b),llm_on_same_successful_cases:asStats(m),
 human_review_recommendations:success.filter(x=>x.review_recommended).length,
 supported_evidence_quotes:success.filter(x=>x.evidence_valid).length,
 generated_draft_count:success.filter(x=>x.draft_present).length,
 mean_latency_ms:success.length?Math.round(success.reduce((a,x)=>a+x.latency_ms,0)/success.length):null,
 limitations:['24 synthetic development cases; 8 were used for prompt tuning; not blinded or independent','Reply drafts not independently checked by a human','Review flags are not measured workload or time savings','No customer/shop integration','Token counts are not precise invoice costs'],
 du_form_violations:success.filter(x=>x.draft_present&&/\b(?:Sie|Ihnen|Ihre|Ihr)\b/.test(x.draft_reply)).length,
 rows
};
mkdirSync('public',{recursive:true});
writeFileSync('public/release-evaluation-full.json',JSON.stringify(report,null,2)+'\n');
console.log('EVAL_RESULT status='+report.status+' completed='+report.successful+'/'+report.attempted);
