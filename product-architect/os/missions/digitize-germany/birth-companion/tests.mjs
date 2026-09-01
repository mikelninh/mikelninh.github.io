import assert from 'node:assert/strict';
import {buildPlan} from './plan-engine.js';

const NOW=new Date('2026-09-01T12:00:00+02:00');
const base={state:'Berlin',birthDate:'2026-08-28',birthSetting:'hospital',married:'yes',paternityRecognized:'na',wantsJointCustody:'na',birthParentEmployment:'employed',birthParentInsurance:'statutory-member',wantsElterngeld:'yes',parentalLeave:'both'};
const ids=p=>buildPlan(p,NOW).map(x=>x.id);
const get=(p,id)=>buildPlan(p,NOW).find(x=>x.id===id);

// G1: ordinary Berlin hospital birth: relevant core services, no unmarried-parent tasks.
{
  const plan=buildPlan(base,NOW);
  assert.deepEqual(plan.map(x=>x.id).sort(),['birth-registration','elterngeld','health-insurance','kindergeld','maternity-benefit','parental-leave'].sort());
  assert.equal(plan.some(x=>x.id==='paternity'),false);
  assert.equal(plan.some(x=>x.id==='custody'),false);
  assert.match(get(base,'birth-registration').why,/Berlin/);
}

// G2: unmarried parents: paternity + joint custody are surfaced instead of silently omitted.
{
  const p={...base,married:'no',paternityRecognized:'no',wantsJointCustody:'yes',birthParentEmployment:'other',birthParentInsurance:'other',parentalLeave:'none'};
  const taskIds=ids(p);
  assert.equal(taskIds.includes('paternity'),true);
  assert.equal(taskIds.includes('custody'),true);
  assert.equal(taskIds.includes('maternity-benefit'),false);
}

// G3: home birth: registration deadline becomes the first hard urgency signal.
{
  const p={...base,birthDate:'2026-08-23',birthSetting:'home',birthParentEmployment:'other',birthParentInsurance:'other',parentalLeave:'none'};
  const reg=get(p,'birth-registration');
  assert.equal(reg.urgency,'overdue');
  assert.match(reg.title,/Standesamt/);
}

// G4: if Elterngeld is explicitly not wanted, do not create the task.
{
  const p={...base,wantsElterngeld:'no',birthParentEmployment:'other',birthParentInsurance:'other',parentalLeave:'none'};
  assert.equal(ids(p).includes('elterngeld'),false);
}

// G5: employed + private/family insurance takes the BAS branch, not statutory-insurer wording.
{
  const p={...base,birthParentInsurance:'private',parentalLeave:'none'};
  const m=get(p,'maternity-benefit');
  assert.ok(m);
  assert.match(m.title,/BAS/);
}

// Trust invariant: every generated action exposes an official source URL.
for(const p of [base,{...base,married:'no',paternityRecognized:'no',wantsJointCustody:'yes'},{...base,birthSetting:'home'}]){
  for(const t of buildPlan(p,NOW)) assert.match(t.source,/^https:\/\//,`${t.id} missing official source`);
}

console.log('Birth Companion: 5 scenario suites passed + official-source invariant passed.');
