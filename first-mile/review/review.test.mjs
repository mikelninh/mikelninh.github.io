import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyze} from '../core.mjs';
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const benchmark=load('benchmark-public.json'),fixtures=load('../lab/fixtures.json'),gold=load('../lab/gold.json');
const get=id=>fixtures.cases.find(c=>c.id===id);
const prediction=c=>Object.fromEntries(analyze(c.docs).fields.map(f=>[f.key,f.status]));
const total=()=>fixtures.cases.reduce((n,c)=>n+Object.entries(gold.labels[c.id]).filter(([k,status])=>prediction(c)[k]===status).length,0);

test('1 public evidence snapshot is tied to the actual authenticated run',()=>{
 assert.equal(benchmark.experiment.requests,36);
 assert.equal(benchmark.experiment.estimated_spend_usd,.355237);
 assert.match(benchmark.source,/38906414912/);
});
test('2 published three finalists preserve source totals and costs',()=>{
 const f=benchmark.experiment.finalists;
 assert.deepEqual(f.map(m=>m.correct),[45,45,43]);
 assert.deepEqual(f.map(m=>m.rejected_quotes),[2,2,2]);
 assert.deepEqual(f.map(m=>m.total),[48,48,48]);
 assert.ok(f[0].cost_usd<f[1].cost_usd&&f[1].cost_usd<f[2].cost_usd);
});
test('3 historical 42/48 baseline remains immutable, not silently overwritten',()=>{
 assert.deepEqual(benchmark.experiment.historical_rules_v2,{correct:42,total:48});
});
test('4 narrow forecast fix is independently executable as a development regression',()=>{
 assert.equal(prediction(get('forecast-split')).arr,'forecast');
});
test('5 all six authored cases are rescored by current actual engine',()=>{
 assert.equal(total(),43);
});
test('6 unrepaired recall gaps remain honestly visible',()=>{
 const p=prediction(get('riverbend'));
 const failures=Object.keys(gold.labels.riverbend).filter(k=>p[k]!==gold.labels.riverbend[k]);
 assert.ok(failures.includes('technology'));
 assert.ok(failures.includes('team'));
 assert.equal(failures.length,5);
});
test('7 known Asterion contradiction still preserved',()=>{
 assert.equal(analyze(get('asterion').docs).differences.length,3);
});
test('8 forecast context does not contaminate later funding',()=>{
 const doc=[{name:'synthetic',pages:[{number:1,text:'2028 TARGET\nARR: €2m\nFunding ask: raising €1m'}]}];
 const fields=prediction({docs:doc});
 assert.equal(fields.arr,'forecast');assert.equal(fields.ask,'found');
});
test('9 forecast context is page-scoped',()=>{
 const fields=prediction({docs:[{name:'synthetic',pages:[{number:1,text:'2028 TARGET'},{number:2,text:'ARR: €2m'}]}]});
 assert.equal(fields.arr,'found');
});
test('10 review UI does not embed credentials, send actions or fake production status',()=>{
 const h=readFileSync(new URL('index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('app.mjs',import.meta.url),'utf8');
 assert.match(h,/id="runChecks"/);
 assert.match(h,/Hold for production/);
 assert.match(h,/FastAPI\/Pydantic/);
 assert.doesNotMatch(js,/OPENAI_API_KEY|Authorization|api\.openai\.com|investmentDecision/);
});
