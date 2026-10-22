/**
 * Authenticated, synthetic-only Jev v2 fixed CH-001..CH-016 experiment.
 * Fixed threshold .80; 4 batches x 4 cases x 5 questions = 20 judgments/request.
 * No arbitrary user text, no real customer / shop data, no automatic actions.
 */
import {timingSafeEqual,createHash} from 'node:crypto';
import {baseline} from '../lib/data.js';
import {VERSION,MODEL,THRESHOLD,CHALLENGE,getBatch,makeRequest,normalizeBatch,scoreBatch} from '../lib/jev_v2.js';
const recent=new Map();
const fingerprint=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const DATASET_SHA=fingerprint(CHALLENGE);
const READY=()=>!!process.env.TYPESAFE_API_KEY&&!!process.env.DEMO_ACCESS_TOKEN&&process.env.PAID_REQUESTS_ENABLED==='true';
export const config={maxDuration:30};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method==='GET'){
  const rules=scoreBatch(CHALLENGE,CHALLENGE.map(x=>({id:x.id,categories:baseline(x.text)})));
  return res.status(200).json({experiment:VERSION,model:MODEL,threshold:THRESHOLD,challenge_cases:CHALLENGE.length,
   n_batches:4,cases_per_batch:4,questions_per_batch:20,provider_ready:READY(),dataset_sha256:DATASET_SHA,
   rule_baseline:{n:rules.n,exact:rules.exact,missed_quality:rules.missed_quality,false_quality_alarms:rules.false_quality_alarms},
   jev_measurement:'not_stored_on_server',note:'This endpoint stores no test results and reveals no credentials. Only authenticated POST requests produce live Jev predictions.'});
 }
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 if(!READY())return res.status(503).json({error:'provider_not_ready'});
 const data=req.body;
 if(!data||typeof data!=='object'||Array.isArray(data)||!Number.isInteger(data.batch)||data.batch<0||data.batch>3||Object.keys(data).length!==1)return res.status(400).json({error:'invalid_batch'});
 const received=typeof req.headers['x-demo-token']==='string'?req.headers['x-demo-token']:'';
 const expected=process.env.DEMO_ACCESS_TOKEN;
 const ra=Buffer.from(received),ea=Buffer.from(expected);
 if(ra.length!==ea.length||!timingSafeEqual(ra,ea))return res.status(401).json({error:'demo_password_required'});
 // Worker-local spending brake. Not a replacement for provider quotas / distributed rate limiting.
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
 const now=Date.now(),hits=(recent.get(ip)||[]).filter(t=>now-t<3600000);
 if(hits.length>=8)return res.status(429).json({error:'worker_rate_limit'});
 hits.push(now);recent.set(ip,hits);if(recent.size>512)recent.clear();
 const rows=getBatch(data.batch),payload=makeRequest(rows),start=performance.now();
 if(Object.keys(payload.questions).length!==20)return res.status(500).json({error:'bad_test_configuration'});
 const ac=new AbortController();const timeout=setTimeout(()=>ac.abort(),21000);
 try{
  const response=await fetch('https://api.typesafe.ai/v1/systemone',{
   method:'POST',signal:ac.signal,
   headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.TYPESAFE_API_KEY.trim()},
   body:JSON.stringify(payload)
  });
  const body=await response.json().catch(()=>({}));
  if(!response.ok){
   console.error('jev_v2_provider_failure',{status:response.status,batch:data.batch});
   return res.status(502).json({error:response.status===429?'provider_rate_limited':'provider_unavailable',batch:data.batch});
  }
  const normalized=normalizeBatch(rows,body);const measured=scoreBatch(rows,normalized);
  const baselineMeasured=scoreBatch(rows,rows.map(x=>({id:x.id,categories:baseline(x.text)})));
  const usage=body?.usage||null;
  const cost=typeof usage?.cost_usd==='number'?usage.cost_usd:(typeof usage?.cost==='number'?usage.cost:null);
  return res.status(200).json({ok:true,experiment:VERSION,model:body.model||MODEL,threshold:THRESHOLD,batch:data.batch,
   dataset_sha256:DATASET_SHA,request_sha256:fingerprint(payload),n_cases:measured.n,
   provider_latency_ms:Math.round(performance.now()-start),cost_usd_reported:cost,
   input_tokens:typeof usage?.input_tokens==='number'?usage.input_tokens:null,
   metrics:{exact:measured.exact,missed_quality:measured.missed_quality,false_quality_alarms:measured.false_quality_alarms,additional_false_categories:measured.additional_false_categories,missing_expected_categories:measured.missing_expected_categories},
   baseline_metrics:{exact:baselineMeasured.exact,missed_quality:baselineMeasured.missed_quality,false_quality_alarms:baselineMeasured.false_quality_alarms,additional_false_categories:baselineMeasured.additional_false_categories,missing_expected_categories:baselineMeasured.missing_expected_categories},
   cases:measured.cases.map(x=>({...x,baseline:baselineMeasured.cases.find(b=>b.id===x.id)?.pred||[]})),limitations:['Synthetic previously authored challenge; not independent human annotation','Threshold and question policy locked before this run','Every batch is a distinct paid API request','No real customers or business actions']});
 }catch(e){
  const type=e?.name==='AbortError'?'provider_timeout':/^invalid_jev/.test(e?.message||'')?'invalid_provider_response':'provider_call_failed';
  console.error('jev_v2_request_failed',{type,batch:data.batch});
  return res.status(502).json({error:type,batch:data.batch});
 }finally{clearTimeout(timeout);}
}
