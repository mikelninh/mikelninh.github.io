#!/usr/bin/env node
/* Deterministic catalogue contract tests. NOT an AI model benchmark. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const doc=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url),'utf8'));
const p=doc.products;
const cases=[
 ['01 Source records available',()=>p.length>=600],
 ['02 Stable unique IDs',()=>new Set(p.map(x=>x.id)).size===p.length],
 ['03 DM candidates found',()=>p.some(x=>x.store_reported==='DM')],
 ['04 Protein candidates found',()=>p.some(x=>x.nutrition_per_100g_or_ml?.protein>=15)],
 ['05 Protein with source URL',()=>p.some(x=>x.nutrition_per_100g_or_ml?.protein!=null&&x.source_url)],
 ['06 No invented €35 pricing',()=>p.every(x=>x.price_eur===null)],
 ['07 No fictional Netto listings',()=>!p.some(x=>String(x.store_reported).toUpperCase().includes('NETTO'))],
 ['08 No allergy clearance claims',()=>p.every(x=>x.allergen_clearance!==true)],
 ['09 No confirmed merchant claims',()=>p.every(x=>x.merchant_confirmed===false)],
 ['10 No false live inventory',()=>p.every(x=>x.live_stock===null)]
];
let passed=0;
for(const [name,fn] of cases){
 const ok=fn();console.log((ok?'PASS':'FAIL')+' '+name);if(ok)passed++;
}
assert.equal(passed,cases.length,'One or more B2A safety gates failed');
console.log(passed+'/10 deterministic contract checks passed.');
