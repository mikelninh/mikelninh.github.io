import {readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {analyze} from '../core.mjs';
const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url),'utf8'));
const fixtures=read('fixtures.json'),gold=read('gold.json');
export function evaluateBaseline(){
 const cases=[],started=performance.now();
 for(const entry of fixtures.cases){
  const start=performance.now(),result=analyze(entry.docs),labels=gold.labels[entry.id];
  const predicted=Object.fromEntries(result.fields.map(f=>[f.key,f.status]));
  const matches=Object.keys(labels).filter(k=>predicted[k]===labels[k]);
  cases.push({id:entry.id,title:entry.title,split:entry.difficulty,predicted,expected:labels,correct:matches.length,total:Object.keys(labels).length,
    disagreements:Object.keys(labels).filter(k=>predicted[k]!==labels[k]),latency_ms:Math.round((performance.now()-start)*1000)/1000,
    source_grounding:{accepted_hits:result.evidenceCount,missing_quotes:0},trace:[],});
 }
 const correct=cases.reduce((n,c)=>n+c.correct,0),total=cases.reduce((n,c)=>n+c.total,0);
 return {schema:'first-mile-benchmark/v2',generated_at:new Date().toISOString(),dataset:{name:'six synthetic cases',known:4,challenge:2,fields_per_case:8},
  engines:[{key:'rules',name:'Deterministic rules',status:'measured',model:null,mode:'rules',accuracy:{correct,total,rate:correct/total},
  elapsed_ms:Math.round((performance.now()-started)*1000)/1000,cost_usd:0,cost_status:'no_api_call',tokens:{input:0,output:0},cases}],
  disclaimer:'Synthetic label agreement, not accuracy on independent real pitch decks. Known cases were used during development; challenge cases also developer-authored.'};
}
if(process.argv[1]&&new URL(import.meta.url).pathname===process.argv[1]){
 const report=evaluateBaseline(),file=process.argv[2];
 if(file)writeFileSync(file,JSON.stringify(report,null,2)+'\n');
 else process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
