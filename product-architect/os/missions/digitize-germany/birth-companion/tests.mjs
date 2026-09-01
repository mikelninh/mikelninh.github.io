import assert from 'node:assert/strict';
import {buildPlan} from './plan-engine.js';
import {buildPacket,allEvidence} from './packets.js';

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

// G3: Berlin home birth: the one-week registration rule creates a hard urgency signal.
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

// G5: employed + private insurance takes the BAS branch.
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

// Reuse proof: one vault fills the same canonical data into several different service packets.
const vaultData={
  applicantFirstName:'Mia',applicantLastName:'Mustermann',applicantBirthDate:'1992-05-11',applicantTaxId:'11122233344',
  street:'Beispielstraße',houseNumber:'7',postcode:'10115',city:'Berlin',email:'mia@example.test',phone:'030000000',
  childFirstName:'Lina',childLastName:'Mustermann',childBirthPlace:'Berlin',childTaxId:'99988877766',
  iban:'DE02120300000000202051',accountHolder:'Mia Mustermann',healthInsurer:'Beispielkasse',insuranceNumber:'A123456789',
  employerName:'Beispiel GmbH',employerEmail:'hr@example.test',parentalLeaveStart:'2026-10-23',parentalLeaveEnd:'2027-10-22'
};
{
  const kg=buildPacket('kindergeld',base,vaultData);
  const eg=buildPacket('elterngeld',base,vaultData);
  assert.equal(kg.coverage.percent,100);
  assert.equal(eg.coverage.percent,100);
  assert.equal(kg.fields.find(f=>f.key==='childName').value,'Lina Mustermann');
  assert.equal(eg.fields.find(f=>f.key==='childName').value,'Lina Mustermann');
  assert.equal(kg.fields.find(f=>f.key==='address').value,'Beispielstraße 7');
  assert.equal(eg.fields.find(f=>f.key==='address').value,'Beispielstraße 7');
}

// End-to-end controllable action: Elternzeit can be generated as finished text-form notice.
{
  const p=buildPacket('parental-leave',base,vaultData);
  assert.equal(p.coverage.percent,100);
  assert.match(p.generatedText,/hiermit melde ich Elternzeit/i);
  assert.match(p.generatedText,/Lina Mustermann/);
  assert.match(p.generatedText,/2026-10-23/);
}

// Evidence is deduplicated across service packets.
{
  const plan=buildPlan(base,NOW);
  const items=allEvidence(plan,base,vaultData);
  const ids=items.map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length);
  assert.ok(items.length>=3);
}

// Encrypted local vault round-trip. No backend is involved.
{
  const store=new Map();
  globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
  const {saveVault,loadVault,vaultExists,clearVault}=await import('./vault.js');
  const pass='correct-horse-2026';
  await saveVault(pass,{applicantFirstName:'Mia',childTaxId:'99988877766'});
  assert.equal(vaultExists(),true);
  const raw=store.values().next().value;
  assert.equal(raw.includes('99988877766'),false,'vault must not store plaintext sensitive value');
  assert.deepEqual(await loadVault(pass),{applicantFirstName:'Mia',childTaxId:'99988877766'});
  await assert.rejects(()=>loadVault('wrong-passphrase'));
  clearVault();assert.equal(vaultExists(),false);
}

console.log('Geburtslotse proof: 5 journey suites + official-source invariant + cross-service reuse + generated Elternzeit notice + evidence dedupe + encrypted-vault round-trip passed.');
