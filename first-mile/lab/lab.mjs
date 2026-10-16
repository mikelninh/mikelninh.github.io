import {analyze} from '../core.mjs';
import {getDemoCase} from '../cases.mjs';
const $=id=>document.getElementById(id);
const fixture=await(await fetch('./fixtures.json')).json(),gold=await(await fetch('./gold.json')).json();
const names=[['rules','Deterministic rules'],['gpt','GPT'],['claude','Claude'],['agent-gpt','Verified workflow · GPT'],['agent-claude','Verified workflow · Claude']];
const slots=[['rules','Rules'],['gpt','GPT'],['claude','Claude'],['agent-gpt','Verified workflow']];
let output=null,selection=fixture.cases[0].id;
const calc=()=>fixture.cases.map(c=>({id:c.id,predicted:Object.fromEntries(analyze(c.docs).fields.map(f=>[f.key,f.status]))}));
const base=calc();
function localBaseline(){
 const correct=base.reduce((n,c)=>n+Object.keys(gold.labels[c.id]).filter(k=>c.predicted[k]===gold.labels[c.id][k]).length,0);
 return {key:'rules',name:'Deterministic rules',status:'measured',mode:'rules',accuracy:{correct,total:fixture.cases.length*8,rate:correct/(fixture.cases.length*8)},cases:base.map(c=>({id:c.id,predicted:c.predicted})),cost_usd:0,cost_status:'no_api_call'};
}
function safeReport(v){if(!v||v.schema!=='first-mile-benchmark/v2'||!Array.isArray(v.engines)||v.engines.length>8)throw Error('Not a FIRST MILE benchmark report');for(const e of v.engines){if(!names.some(x=>x[0]===e.key)||!Array.isArray(e.cases))throw Error('Unknown benchmark format');if(!e.cases.every(c=>fixture.cases.some(f=>f.id===c.id)&&c.predicted&&typeof c.predicted==='object'))throw Error('Unrecognised case in imported report')}return v}
function engine(key){return key==='rules'?localBaseline():(output?.engines?.find(x=>x.key===key)||null)}
function renderCards(){
 const holder=$('engineCards');holder.replaceChildren();
 for(const [key,name] of names){
  const e=engine(key);if(key==='agent-claude'&&output===null)continue;
  const card=document.createElement('article');card.className='engine'+(!e||e.status!=='measured'?' not-run':'');
  const tag=document.createElement('span');tag.className='engine-state';tag.textContent=!e||e.status!=='measured'?'NOT RUN · API REQUIRED':(e.mode==='rules'?'LOCAL RULE BASELINE':'MEASURED MODEL RUN');
  const title=document.createElement('h3');title.textContent=name;const score=document.createElement('div');score.className='engine-score';
  score.textContent=e?.status==='measured'&&e.accuracy?e.accuracy.correct+'/'+e.accuracy.total:'Not run';
  const meta=document.createElement('div');meta.className='engine-meta';meta.textContent=e?.status==='measured'?('Synthetic status match · '+(e.model||'no model')+(e.tokens?.input?' · '+e.tokens.input+' in tokens':'')):('Needs a real '+(key.startsWith('agent-')?'two-stage':'single-stage')+' run');
  card.append(tag,title,score,meta);holder.append(card);
 }
}
function addCell(tr,text,klass=''){const td=document.createElement('td');td.textContent=text;td.className=klass;tr.append(td)}
function renderMatrix(){
 const c=fixture.cases.find(x=>x.id===selection);$('scenarioLabel').textContent=c.difficulty==='challenge'?'CHALLENGE CASE · developer-authored':'KNOWN DEMO CASE · developer-authored';$('rows').replaceChildren();
 for(const [key,expected] of Object.entries(gold.labels[c.id])){
  const tr=document.createElement('tr');addCell(tr,key);addCell(tr,expected);
  for(const [engineKey] of slots){
   const result=engine(engineKey),caseRow=result?.cases?.find(x=>x.id===c.id);
   const actual=caseRow?.predicted?.[key];
   addCell(tr,actual||'—',!actual?'pending':actual===expected?'pass':'fail');
  }
  $('rows').append(tr)
 }
}
for(const c of fixture.cases){const option=document.createElement('option');option.value=c.id;option.textContent=c.title+(c.difficulty==='challenge'?' · challenge':'');$('scenario').append(option)}
$('scenario').addEventListener('change',e=>{selection=e.target.value;renderMatrix()});
$('reportFile').addEventListener('change',async e=>{
 try{const file=e.target.files[0];if(!file)return;if(file.size>2e6)throw Error('Report over 2 MB');
  output=safeReport(JSON.parse(await file.text()));$('importMessage').textContent='Imported local report with '+output.engines.length+' recorded engine results. Please verify source and provider configuration before interpreting model scores.';renderCards();renderMatrix();
 }catch(err){$('importMessage').textContent='Import rejected: '+err.message}
});
renderCards();renderMatrix();
