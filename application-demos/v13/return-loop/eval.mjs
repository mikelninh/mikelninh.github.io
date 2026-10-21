/** Independent, deliberately synthetic evaluation; no actual customer accuracy claims.
 * Run explicitly: OPENAI_API_KEY=... npm run eval -- --confirm-cost
 * Costed calls: up to 12, no automatic sending. Outputs only metrics and messages from fictional examples.
 */
import {schema,SYSTEM} from './api/classify.js';
import {baseline,labels} from './lib/data.js';
import fs from 'node:fs/promises';
const holdout=[
['Nach vier Tagen ist die Ferse hauchdünn, als wäre der Stoff praktisch weg.',['quality']],
['Die Nähte am Bündchen haben sich nach dem Joggen getrennt.',['quality']],
['Das Shirt wird beim ersten Waschen fleckig und verliert die Farbe.',['quality']],
['Der Metallzipper bleibt immer wieder hängen und ist jetzt gebrochen.',['quality']],
['Ich hab die Größe M bestellt, aber XS erhalten; bitte umtauschen.',['order_issue','return']],
['Ich bin 1,78 und der Schnitt spannt unangenehm an den Armen.',['fit']],
['Wo bleibt meine Sendung? Die Tracking-Seite hat seit Freitag kein Update.',['shipping']],
['Das Paket wurde als geliefert markiert, ist aber nirgends zu finden.',['shipping']],
['Ich brauche das Rücksendeetikett und möchte dann eine Erstattung.',['return']],
['Mir fehlen zwei Artikel in der Box, sonst alles super.',['order_issue']],
['Die Hose ist zu eng, außerdem platzt die Seitennaht auf.',['fit','quality']],
['Das Paket kam sehr spät und das Shirt ist am Kragen zerrissen.',['shipping','quality']],
];
const cats=Object.keys(labels);
function scores(rows){const out={};for(const c of cats){let tp=0,fp=0,fn=0;for(const r of rows){const a=r.gold.includes(c),b=r.pred.includes(c);if(a&&b)tp++;if(!a&&b)fp++;if(a&&!b)fn++}const precision=tp+fp?tp/(tp+fp):0,recall=tp+fn?tp/(tp+fn):0;out[c]={tp,fp,fn,precision:+precision.toFixed(3),recall:+recall.toFixed(3),f1:+(precision+recall?2*precision*recall/(precision+recall):0).toFixed(3)}}return{by_class:out,macro_f1:+(Object.values(out).reduce((s,r)=>s+r.f1,0)/cats.length).toFixed(3),critical_defect_misses:out.quality.fn}}
if(!process.argv.includes('--confirm-cost')){console.error('No calls made. To spend API credit on 12 synthetic holdout cases, use: npm run eval -- --confirm-cost');process.exit(2)}
if(!process.env.OPENAI_API_KEY){console.error('OPENAI_API_KEY not found. No calls made.');process.exit(2)}
const model=process.env.OPENAI_MODEL||'gpt-4.1-mini',result=[];
for(let i=0;i<holdout.length;i++){
 const [message,gold]=holdout[i];const request={model,store:false,temperature:0,max_output_tokens:400,instructions:SYSTEM,input:[{role:'user',content:[{type:'input_text',text:JSON.stringify({product:'synthetischer Testartikel',sku:'TEST-000',message})}]}],text:{format:{type:'json_schema',name:'return_loop_support_triage',strict:true,schema}}};
 const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(request)});
 if(!res.ok)throw Error(`OpenAI HTTP ${res.status} – evaluation stopped; no score claimed`);
 const body=await res.json(),raw=body.output.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('');const parsed=JSON.parse(raw);const pred=[...new Set(parsed.categories.filter(x=>cats.includes(x)))];result.push({index:i+1,message,gold,pred,baseline:baseline(message),model:body.model,usage:body.usage});console.log(`${i+1}/${holdout.length}: ${gold.join('+')} -> ${pred.join('+')}`);
}
const summary={dataset:'12 independent hand-authored synthetic holdout messages (NOT real production data)',n:result.length,model,measured_at:new Date().toISOString(),llm:scores(result),rules:scores(result.map(r=>({...r,pred:r.baseline}))),rows:result};
await fs.writeFile('eval-results-v13.json',JSON.stringify(summary,null,2));console.log(JSON.stringify({llm:summary.llm,rules:summary.rules},null,2));console.log('Saved eval-results-v13.json. Numbers must not be presented as real-customer accuracy.');
