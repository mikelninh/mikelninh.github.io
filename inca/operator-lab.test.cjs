const test=require('node:test'),assert=require('node:assert/strict');
const {cases,route,check}=require('./operator-lab.js');
test('recorded error remains',()=>{const r=route(cases['H-A-011']);assert.equal(r.v2,'AUTO_READY');assert.equal(r.expected,'HUMAN_REVIEW')});
test('contradiction requires review',()=>assert.equal(route(cases['H-A-011']).v3,'HUMAN_REVIEW'));
test('clean case not escalated',()=>assert.equal(route(cases['H-A-012']).v3,'AUTO_READY'));
test('no external effects',()=>{for(const c of Object.values(cases))assert.equal(route(c).effects,0)});
test('unknown inputs fail closed',()=>assert.throws(()=>route({}),/invalid_claim/));
test('two separate local checks not reused as measured fresh test',()=>{assert.deepEqual(check(),{passed:2,total:2});assert.match(route(cases['H-A-011']).method,/already inspected/)});
