import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {analyze} from '../first-mile/core.mjs';import {demoCases,getDemoCase} from '../first-mile/cases.mjs';import {sampleDocs} from '../first-mile/samples.mjs';
const doc=(text,name='deck.pdf')=>[{name,pages:[{number:3,text}]}];
const f=(line,key)=>analyze(doc(line)).fields.find(x=>x.key===key);
test('01 funding found',()=>assert.equal(f('Funding ask: raising €2.4m','ask').status,'found'));
test('02 revenue found',()=>assert.equal(f('ARR: €240k','arr').status,'found'));
test('03 customers found',()=>assert.equal(f('Paying customers: 12','customers').status,'found'));
test('04 unsupported field missing',()=>assert.equal(f('Hello founder','ask').status,'missing'));
test('05 currency alone not funding',()=>assert.equal(f('Market size: €2m','ask').status,'missing'));
test('06 label without amount not funding',()=>assert.equal(f('Funding ask unknown','ask').status,'missing'));
test('07 market text detected',()=>assert.equal(f('Market size: €3bn','market').status,'found'));
test('08 tech text detected',()=>assert.equal(f('Technology: our platform','technology').status,'found'));
test('09 source page retained',()=>assert.equal(f('ARR: €100k','arr').evidence[0].page,3));
test('10 source filename retained',()=>assert.equal(f('ARR: €100k','arr').evidence[0].source,'deck.pdf'));
test('11 funding discrepancy',()=>assert.equal(analyze([...doc('Funding ask: raising €2m'),...doc('Funding ask: raising €3m','update.pdf')]).fields[0].status,'different'));
test('12 matching funding not flagged',()=>assert.equal(analyze([...doc('Funding ask: raising €2m'),...doc('Funding ask: raising €2m','update.pdf')]).fields[0].status,'found'));
test('13 ARR discrepancy',()=>assert.equal(analyze([...doc('ARR: €250k'),...doc('ARR: €180k','update.pdf')]).fields[1].status,'different'));
test('14 customer count discrepancy',()=>assert.equal(analyze([...doc('Paying customers: 12'),...doc('Paying customers: 18','update.pdf')]).fields[2].status,'different'));
test('15 no invented results for empty input',()=>{const r=analyze([]);assert.equal(r.missing.length,8);assert.equal(r.evidenceCount,0)});
test('16 every sample hit has provenance',()=>{const r=analyze(sampleDocs);for(const field of r.fields)for(const hit of field.evidence){assert.ok(hit.source);assert.ok(hit.page);assert.ok(hit.excerpt)}});
test('17 sample exposes numerical differences',()=>assert.ok(analyze(sampleDocs).differences.length>=2));
test('18 questions max five',()=>assert.ok(analyze(sampleDocs).questions.length<=5));

test('19 release story distinguishes sample outcomes from actual productivity measurements',()=>{const h=readFileSync(new URL('../first-mile/index.html',import.meta.url),'utf8');assert.match(h,/THE 60-SECOND RESEARCH TEST/);assert.match(h,/11 traceable observations/);assert.match(h,/3 differing figures/);assert.match(h,/not proven time savings/i)});

test('20 four selectable fictional cases are unique',()=>assert.deepEqual(demoCases.map(x=>x.id),['asterion','heliogrid','bioweave','orchid']));
test('21 selection returns intended documents',()=>assert.equal(getDemoCase('bioweave').docs[0].name.includes('BioWeave'),true));
test('22 Asterion shows three actual inconsistencies',()=>assert.equal(analyze(getDemoCase('asterion').docs).differences.length,3));
test('23 HelioGrid shows no detected gaps or differences',()=>{const r=analyze(getDemoCase('heliogrid').docs);assert.equal(r.differences.length,0);assert.equal(r.missing.length,0)});
test('24 BioWeave shows four missing fields',()=>{const r=analyze(getDemoCase('bioweave').docs);assert.deepEqual(r.missing.map(x=>x.key).sort(),['arr','ask','customers','ip'])});
test('25 Orchid projected revenue is explicitly not current revenue',()=>{const r=analyze(getDemoCase('orchid').docs);assert.equal(r.fields.find(x=>x.key==='arr').status,'forecast');assert.match(r.questions.join(' '),/forecast or target/)});
test('26 forecast only is not a discrepancy even with another date',()=>{const r=analyze([{name:'example',pages:[{number:1,text:'ARR: €2m projected for 2028\nARR: €4m target for 2029'}]}]);assert.equal(r.fields.find(x=>x.key==='arr').status,'forecast');assert.equal(r.differences.length,0)});
test('27 actual and future projections remain distinct',()=>{const r=analyze([{name:'example',pages:[{number:1,text:'ARR: €120k reported 2026\nARR: €2m projected for 2028'}]}]);assert.equal(r.fields.find(x=>x.key==='arr').status,'mixed')});
test('28 picker is interactive and presentation stays transparent',()=>{const h=readFileSync(new URL('../first-mile/index.html',import.meta.url),'utf8');assert.match(h,/id="case-picker"/);for(const id of ['asterion','heliogrid','bioweave','orchid'])assert.ok(h.includes('data-case="'+id+'"'));assert.match(h,/SYNTHETIC DOCUMENT FIXTURES/)});

test('29 a forecast header immediately before ARR is carried to the reported figure',()=>{
 const r=analyze([{name:'example',pages:[{number:1,text:'2028 TARGET — future performance, not current revenue\\nARR: €2m'}]}]);
 assert.equal(r.fields.find(x=>x.key==='arr').status,'forecast');
});
test('30 forecast context must not bleed from ARR into unrelated funding lines',()=>{
 const r=analyze([{name:'example',pages:[{number:1,text:'2028 TARGET\\nARR: €2m\\nFunding ask: raising €1m'}]}]);
 assert.equal(r.fields.find(x=>x.key==='arr').status,'forecast');
 assert.equal(r.fields.find(x=>x.key==='ask').status,'found');
});
test('31 heading context must not carry between pages or documents',()=>{
 const r=analyze([{name:'one',pages:[{number:1,text:'2028 TARGET'}, {number:2,text:'ARR: €2m'}]}]);
 assert.equal(r.fields.find(x=>x.key==='arr').status,'found');
});
