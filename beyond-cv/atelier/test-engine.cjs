'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const E = require('./evidence.js');
let checks = 0;
function test(label, run) { run(); checks++; console.log('PASS ' + label); }
const receipt = JSON.parse(fs.readFileSync(path.join(__dirname,'source-receipt.json'),'utf8'));
test('Snapshot projection matches archived receipt', () => {
 assert.equal(E.SNAPSHOT.climate.pet, receipt.heat.properties.pet14h);
 assert.equal(E.SNAPSHOT.climate.id, receipt.heat.layers.pet14h.feature_id);
 assert.equal(E.SNAPSHOT.justice.id, receipt.justice.feature_id);
 assert.equal(E.SNAPSHOT.justice.burden, receipt.justice.multiple_burden);
 assert.equal(E.SNAPSHOT.care.beds, Number(receipt.nearest_hospital.properties.betten_insgesamt));
 assert.equal(E.SNAPSHOT.care.name, receipt.nearest_hospital.name);
 assert.equal(E.SNAPSHOT.green.distance, receipt.nearest_green.distance_m);
 assert.equal(E.SNAPSHOT.green.id, receipt.nearest_green.feature_id);
 assert.equal(E.SNAPSHOT.retrievedAt, receipt.retrieved_at);
});
const baseline = E.evaluateAll(E.SOURCE_IDS);
for (let mask=0; mask<16; mask++) test('Source mask ' + mask + ': exact dependency behaviour', () => {
 const active=E.SOURCE_IDS.filter((_, i) => mask & (1<<i));
 const result=E.evaluateAll(active);
 for (const [id, claim] of Object.entries(E.CLAIMS)) {
  const off=claim.requires.some(f => !active.includes(f.split('.')[0]));
  assert.equal(result[id].state, off ? 'withheld' : claim.gaps.length ? 'missing' : 'supported');
  assert.deepEqual(result[id].gaps, claim.gaps);
 }
 for (const id of ['care','cooling','heat']) assert.notEqual(result[id].state,'supported');
 const parsed=E.readState(E.stateQuery('heat',active));
 assert.deepEqual(parsed,{example:'heat',enabled:active});
});
test('Withdraw hospital source leaves independent statements identical', () => {
 const changed=E.changed(baseline,E.evaluateAll(['climate','justice','green']));
 assert.deepEqual(changed,['site','beds','care']);
});
test('Joint climate/quartier claim needs both inputs', () => {
 assert.equal(E.evaluate('context',['climate']).state,'withheld');
 assert.equal(E.evaluate('context',['justice']).state,'withheld');
 assert.equal(E.evaluate('context',['climate','justice']).state,'supported');
});
test('Empty or corrupt source data fail closed', () => {
 assert.equal(E.evaluate('site',E.SOURCE_IDS,{}).state,'invalid');
 assert.equal(E.evaluate('site',E.SOURCE_IDS,null).state,'invalid');
 for (const value of [null, true, '415', NaN, Infinity, -1, 416]) {
  const s=JSON.parse(JSON.stringify(E.SNAPSHOT)); s.care.beds=value;
  assert.equal(E.evaluate('beds',E.SOURCE_IDS,s).state,'invalid');
 }
});
test('Unknown claim and invalid source array never grant support', () => {
 assert.equal(E.evaluate('invented',E.SOURCE_IDS).state,'invalid');
 assert.equal(E.evaluate('site',null).state,'withheld');
 assert.equal(E.evaluate('site',['unexpected']).state,'withheld');
});
test('Untrusted URL values are bounded and never echoed', () => {
 assert.deepEqual(E.readState('?case=%3Cscript%3E&off=nope,care,care'),{example:'care',enabled:['climate','justice','green']});
 assert(!E.stateQuery('<script>',E.SOURCE_IDS).includes('<'));
});
test('Every gap persists after reset', () => {
 for(const id of ['care','heat','cooling']) assert.equal(E.evaluate(id,[...E.SOURCE_IDS]).state,'missing');
});
test('Reference objects are deeply immutable', () => {
 assert(Object.isFrozen(E.SNAPSHOT.care));
 assert.throws(()=>{E.SNAPSHOT.care.beds=900;},TypeError);
 const before=JSON.stringify(E.SNAPSHOT);
 E.evaluateAll([]); assert.equal(JSON.stringify(E.SNAPSHOT),before);
});
console.log(JSON.stringify({engine:'deterministic-evidence-dependencies',checks,status:'passed'}));
