(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else {root.IncaSimpleCase=api;if(typeof document!=='undefined')api.mount(document)}
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const expected=['TR-101','HM-202','TH-303','LI-404','EL-505','TR-606'];
const routes={HUMAN_REVIEW:{title:'A person should review this',kind:'review',next:'Send a clear, evidence-linked draft to a claims specialist. Nothing is sent automatically.'},
 NEED_INFO:{title:'We need one more piece of information',kind:'info',next:'Prepare a specific information request. A human checks it before sending.'},
 CONTINUE_CHECKS:{title:'This check is clear — keep going',kind:'clear',next:'Continue the remaining insurance checks. This is not claim approval.'}};
const friendly={
 'TR-101':{srcA:'Customer email',srcB:'Travel provider confirmation',name:'Travel cancellation',topic:'Two documents, two dates',context:'The customer and booking system disagree about when the trip was cancelled.',field:'Cancellation date'},
 'HM-202':{srcA:'Customer damage report',srcB:'Claims portal evidence checklist',name:'Water damage',topic:'Something is missing',context:'There is a reported kitchen leak, but the required photographs are missing.',field:'Damage photographs'},
 'TH-303':{srcA:'Police report',srcB:'Bicycle purchase receipt',name:'Bicycle theft',topic:'The details agree',context:'The police report and purchase receipt show the same bicycle identification number.',field:'Frame number'},
 'LI-404':{srcA:'Insured person’s statement',srcB:'Other party’s statement',name:'Liability claim',topic:'Two people disagree',context:'The two accounts give conflicting answers about responsibility.',field:'Liability'},
 'EL-505':{srcA:'Customer reimbursement request',srcB:'Repair shop invoice',name:'Phone repair',topic:'The invoice does not match',context:'The repair claim and workshop invoice contain different amounts.',field:'Repair total'},
 'TR-606':{srcA:'Forwarded customer email',srcB:'Hotel cancellation receipt',name:'Suspicious document',topic:'A hidden instruction',context:'The dates match, but the customer document contains instructions directed at the AI.',field:'Cancellation date'}
};
function validate(report){
 if(!report||report.release!=='agent-ops-v1.1'||report.execution_mode!=='offline'||report.case_count!==6||
    !Array.isArray(report.runs)||report.runs.length!==6)return null;
 const observed=report.runs.map(r=>r.case_id);
 if(JSON.stringify(observed)!==JSON.stringify(expected))return null;
 const tools=['read_source','read_source','extract_field','extract_field','compare_facts','draft_handoff','enforce_boundary'];
 for(const r of report.runs){
  if(!routes[r.route]||r.external_actions!==0||r.events?.length!==7||
     r.evidence?.length!==2||r.handoff?.status!=='UNSENT_DRAFT')return null;
  if(!r.events.every((ev,i)=>ev.tool===tools[i]&&ev.status==='completed'&&ev.step===i+1))return null;
  if(r.events[6].output?.payment!==false||r.events[6].output?.coverage_approval!==false||r.events[6].output?.customer_message_sent!==false)return null;
  if(r.evidence.some(e=>!e.source_ref?.startsWith(r.case_id+':')||!Array.isArray(e.quotes)))return null;
 }
 return report;
}
function describe(r){
 if(!r||!friendly[r.case_id]||!routes[r.route])return null;
 const f=friendly[r.case_id], route=routes[r.route];
 const evidence=r.evidence.map(x=>({value:x.value||'Not found',quote:x.quotes?.[0]||'No matching field found',ref:x.source_ref}));
 const guard=r.events[4]?.output?.guard_triggered===true;
 return {id:r.case_id,name:f.name,topic:f.topic,context:f.context,field:f.field,route:r.route,decision:route.title,
 kind:route.kind,next:route.next,evidence,guard,reason:r.events[4]?.output?.why||r.reason,
 status:r.status,sourceA:r.events[0]?.output?.excerpt||'',sourceB:r.events[1]?.output?.excerpt||''};
}
function mount(doc){
 const get=id=>doc.getElementById(id);
 if(!get('case-experience'))return;
 const picker=get('claim-options'),panel=get('decision-panel'),primary=get('show-decision');
 const set=(id,value)=>{get(id).textContent=String(value??'—')};
 let report=null,current=0,revealed=false;
 function choose(index){
  current=index;revealed=false;
  const v=describe(report.runs[current]);
  for(const el of picker.querySelectorAll('button'))el.setAttribute('aria-pressed',String(Number(el.dataset.index)===index));
  set('case-name',v.name);set('case-context',v.context);set('case-topic',v.topic);
  set('doc-title-a',friendly[v.id].srcA);set('doc-title-b',friendly[v.id].srcB);
  set('case-a',v.evidence[0].value);set('case-b',v.evidence[1].value);
  set('field-a',v.field);set('field-b',v.field);
  get('case-documents').dataset.case=v.id;
  panel.hidden=true;get('case-action').hidden=false;
  set('interaction-state','Read the two records. What should happen next?');
 }
 function show(){
  if(!report)return;
  const v=describe(report.runs[current]);
  revealed=true;get('case-action').hidden=true;panel.hidden=false;
  set('outcome-headline',v.decision);set('outcome-reason',v.reason);set('outcome-next',v.next);
  set('source-evidence-a',v.evidence[0].quote);
  set('source-evidence-b',v.evidence[1].quote);
  const badge=get('outcome-badge');badge.textContent=v.route==='HUMAN_REVIEW'?'Needs a person':v.route==='NEED_INFO'?'Request information':'Continue checking';
  badge.dataset.kind=v.kind;
  get('injection-explanation').hidden=!v.guard;
  set('interaction-state','Suggested next step ready. No claim, email or payment was changed.');
 }
 primary.addEventListener('click',show);
 get('case-reset').addEventListener('click',()=>choose(current));
 get('see-another').addEventListener('click',()=>choose((current+1)%report.runs.length));
 fetch('/inca/agent-ops-traces.json',{cache:'no-store'}).then(async res=>{
  if(!res.ok)throw Error('Agent replay unavailable');
  const parsed=validate(await res.json());
  if(!parsed)throw Error('Invalid recorded run');
  report=parsed;
  picker.replaceChildren();
  parsed.runs.forEach((r,i)=>{
   const b=doc.createElement('button');b.type='button';b.className='option';
   b.dataset.index=String(i);b.setAttribute('aria-pressed','false');
   const label=doc.createElement('strong');label.textContent=friendly[r.case_id].name;
   const sub=doc.createElement('small');sub.textContent=friendly[r.case_id].topic;
   b.append(label,sub);b.addEventListener('click',()=>choose(i));picker.appendChild(b);
  });
  get('case-experience').hidden=false;get('loading-state').hidden=true;choose(0);
 }).catch(()=>{
  get('loading-state').textContent='The verified case recording is temporarily unavailable. No results are being simulated.';
  get('case-experience').hidden=true;
 });
}
return {friendly,routes,validate,describe,mount};
});