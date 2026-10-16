import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateBaseline} from './baseline.mjs';
const load=name=>JSON.parse(readFileSync(new URL(name,import.meta.url),'utf8'));
const docs=load('fixtures.json'),gold=load('gold.json');
test('six authored cases are separate and independently labelled',()=>{
 assert.equal(docs.cases.length,6);
 for(const c of docs.cases)assert.equal(Object.keys(gold.labels[c.id]).length,8);
});
test('baseline reuses the real frontend core and scores 48 outcomes',()=>{
 const r=evaluateBaseline();
 assert.equal(r.schema,'first-mile-benchmark/v2');
 assert.equal(r.engines[0].cases.length,6);
 assert.equal(r.engines[0].accuracy.total,48);
 assert.ok(r.engines[0].accuracy.correct>=0);
 assert.equal(r.engines[0].cost_usd,0);
});
test('challenge cases do not pretend to be sampled real customer decks',()=>{
 assert.deepEqual(docs.cases.filter(c=>c.difficulty==='challenge').map(c=>c.id),['riverbend','forecast-split']);
 assert.match(docs.origin,/synthetic/);
});
test('every case uses synthetic source identifiers and page numbers',()=>{
 for(const c of docs.cases)for(const d of c.docs){
  assert.match(d.name,/fictional|synthetic/);
  assert.ok(d.pages.every(p=>Number.isInteger(p.number)&&typeof p.text==='string'));
 }
});
test('browser comparison does not expose provider credentials',()=>{
 const script=readFileSync(new URL('lab.mjs',import.meta.url),'utf8');
 const html=readFileSync(new URL('index.html',import.meta.url),'utf8');
 assert.doesNotMatch(script,/OPENAI_API_KEY|ANTHROPIC_API_KEY|api\.openai\.com/);
 assert.match(html,/No invented model scores/);
 assert.match(html,/Import measured run/);
});
