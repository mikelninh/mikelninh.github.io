import {cases,baseline} from '../lib/data.js';import {inferModel} from '../lib/providers.js';
const recent=new Map(); // Per-worker control only; must pair with distributed limits for public deployment.
export default async function handler(req,res){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 const {id,model}=req.body||{};if(typeof id!=='string'||typeof model!=='string'||JSON.stringify(req.body).length>200)return res.status(400).json({error:'invalid_input'});const item=cases.find(c=>c.id===id);if(!item||!['decisions','jev','llm'].includes(model))return res.status(400).json({error:'fixture_only'});
 if(process.env.PAID_REQUESTS_ENABLED!=='true'||!process.env.DEMO_ACCESS_TOKEN)return res.status(503).json({error:'paid_requests_disabled',message:'Live model tests are disabled until authenticated server configuration is ready.'});
 const access=req.headers['x-demo-token']||'';const expected=process.env.DEMO_ACCESS_TOKEN;if(access.length!==expected.length||!await secureEqual(access,expected))return res.status(401).json({error:'demo_access_required'});
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();const now=Date.now();const hits=(recent.get(ip)||[]).filter(x=>now-x<3600000);if(hits.length>=12)return res.status(429).json({error:'worker_rate_limited'});hits.push(now);recent.set(ip,hits);if(recent.size>1000)recent.clear();
 try{const result=await inferModel(model,item);return res.status(200).json({ok:true,id:item.id,model_type:model,...result,baseline:baseline(item.text),data:'synthetic',notice:'No customer actions. Scores are uncalibrated until an evaluation establishes suitable thresholds.'});}
 catch(err){
  // Classify failures without reflecting provider bodies, user input, or credentials.
  const known=new Set(['key_not_configured','model_refusal','no_model_output','invalid_probability','invalid_decision_response','missing_questions','invalid_jev_response','invalid_jev_answer','invalid_model_response_shape','invalid_model_categories']);
  const code=typeof err.code==='string'&&['provider_unavailable','provider_rate_limit','provider_network_error'].includes(err.code)?err.code:
    known.has(err.message)?err.message:
    err.name==='AbortError'?'provider_timeout':
    err instanceof SyntaxError?'invalid_model_json':
    err instanceof TypeError?'runtime_type_error':
    err instanceof ReferenceError?'runtime_reference_error':
    err instanceof RangeError?'runtime_range_error':
    'unclassified_runtime_error';
  console.error('inference_failure',{model,code}); // no secrets, request body, or provider payload
  return res.status(code==='key_not_configured'?503:502).json({error:code,message:'No model prediction is claimed. Please inspect server configuration or retry later.'});
}
}
async function secureEqual(a,b){const {timingSafeEqual}=await import('node:crypto');return timingSafeEqual(Buffer.from(a),Buffer.from(b));}
