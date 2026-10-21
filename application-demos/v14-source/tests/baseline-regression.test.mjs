import test from 'node:test';
import assert from 'node:assert/strict';
import {cases,baseline} from '../lib/data.js';
import {baselineScore} from '../lib/arena.js';

test('all 24 synthetic fixtures have valid IDs and human labels',()=>{
 assert.equal(cases.length,24);
 assert.equal(new Set(cases.map(x=>x.id)).size,24);
 assert.ok(cases.every(x=>x.id.startsWith('RL-')&&Array.isArray(x.gold)&&x.gold.length));
});
test('the published rule benchmark stays reproducible',()=>{
 const score=baselineScore(cases);
 const exact=cases.filter(x=>x.gold.length===baseline(x.text).length&&x.gold.every(l=>baseline(x.text).includes(l))).length;
 assert.equal(exact,20);
 assert.equal(score.byClass.quality.fn,1);
 assert.equal(score.byClass.quality.fp,0);
 assert.equal(cases.find(x=>x.id==='RL-301').gold.includes('quality'),true);
 assert.equal(baseline(cases.find(x=>x.id==='RL-301').text).includes('quality'),false);
});
