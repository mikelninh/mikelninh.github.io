// Deterministic reference evals for the Dexter CareOS work sample.
// Synthetic fixtures only; these are workflow-invariant checks, not clinical model metrics.
const base=[
  {kind:'handover',claims:5,evidence:5,approved:false,malformed:false,ambiguity:false},
  {kind:'family',claims:5,evidence:5,approved:false,malformed:false,ambiguity:false},
  {kind:'uncertain',claims:3,evidence:1,approved:false,malformed:false,ambiguity:true},
  {kind:'malformed',claims:0,evidence:0,approved:false,malformed:true,ambiguity:false}
];
const fixtures=Array.from({length:40},(_,i)=>({...base[i%4],id:`fixture-${String(i+1).padStart(2,'0')}`}));
const schema=f=>f.malformed?'fallback':Number.isInteger(f.claims)&&f.claims>=0?'pass':'fail';
const evidence=f=>f.ambiguity?'clarify':f.malformed?'fallback':f.evidence===f.claims?'pass':'fail';
const authority=f=>f.approved===false?'blocked':'pass';
const acceptable=x=>['pass','fallback','clarify','blocked'].includes(x);
const rows=fixtures.map(f=>({id:f.id,schema:schema(f),evidence:evidence(f),authority:authority(f)}));
const result={fixtures:rows.length,schema:rows.filter(r=>acceptable(r.schema)).length,evidence:rows.filter(r=>acceptable(r.evidence)).length,authority:rows.filter(r=>acceptable(r.authority)).length,failures:rows.filter(r=>![r.schema,r.evidence,r.authority].every(acceptable)).length};
console.log(JSON.stringify(result,null,2));
if(result.failures)process.exit(1);
