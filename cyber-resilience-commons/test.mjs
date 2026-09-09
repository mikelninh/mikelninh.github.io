import assert from 'node:assert/strict'
import {test} from 'node:test'
import {TEMPLATES,SCENARIOS,RECOMMENDED_BASELINE} from './data.js'
import {simulate,recommendations,recoveryPlan} from './simulator.js'

const city=TEMPLATES.find(x=>x.id==='city')
const stolen=SCENARIOS.find(x=>x.id==='stolen-credentials')
const ransomware=SCENARIOS.find(x=>x.id==='ransomware')

test('weak synthetic city baseline leaves stolen-credential path uncontained',()=>{
  const run=simulate(city,stolen,city.defaults)
  assert.equal(run.status,'uncontained')
  assert.ok(run.metrics.dataGB>0)
})

test('recommended baseline blocks stolen credentials at first boundary',()=>{
  const run=simulate(city,stolen,RECOMMENDED_BASELINE)
  assert.equal(run.status,'contained')
  assert.equal(run.metrics.dataGB,0)
  assert.equal(run.firstBlocked,'mfa')
})

test('ransomware assumes one compromised endpoint even with strong controls',()=>{
  const run=simulate(city,ransomware,RECOMMENDED_BASELINE)
  assert.equal(run.status,'contained-after-impact')
  assert.equal(run.steps[0].status,'escaped')
  assert.equal(run.steps[1].status,'blocked')
})

test('recommendations only propose disabled controls that change modeled outcomes',()=>{
  const recs=recommendations(city,SCENARIOS,city.defaults)
  assert.ok(recs.length>=3)
  assert.ok(recs.every(r=>city.defaults[r.control]===false))
  assert.ok(recs.every(r=>r.prevented>0 && r.scenariosImproved>0))
})

test('restore-tested backups improve the recovery planning assumption',()=>{
  const weak=recoveryPlan({...city.defaults,backups:false})
  const strong=recoveryPlan({...city.defaults,backups:true})
  assert.ok(strong.restoreCriticalServiceHours<weak.restoreCriticalServiceHours)
})
