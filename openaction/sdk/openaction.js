/* OpenAction SDK 0.2 — zero dependencies, browser + Node-friendly. AGPL-3.0-or-later. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.OpenAction=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const VERSION='0.2';
  const RISKS=new Set(['low','medium','high','critical']);
  const STATUSES=new Set(['proposed','ready','approved','executing','succeeded','failed','cancelled']);

  function uid(prefix='oa'){
    const id=(typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36);
    return `${prefix}_${id}`;
  }
  function evidence(input){
    if(typeof input==='string') return {id:uid('ev'),kind:'other',source:input};
    return {id:input.id||uid('ev'),kind:input.kind||'other',source:input.source||'unknown',...(input.excerpt?{excerpt:input.excerpt}:{}),...(input.uri?{uri:input.uri}:{}),...(input.locator?{locator:input.locator}:{})};
  }
  function create(input){
    if(!input||!input.kind||!input.label||!input.reason) throw new Error('kind, label and reason are required');
    const risk=input.risk||'low';
    if(!RISKS.has(risk)) throw new Error('invalid risk');
    const high=risk==='high'||risk==='critical';
    const approval=input.approval||{required:high,mode:high?'qualified_human':'human',status:high?'pending':'pending'};
    if(high && (!approval.required || !['human','qualified_human'].includes(approval.mode))) throw new Error('high/critical actions require human approval');
    return {
      openaction:VERSION,
      id:input.id||uid('oa'),
      ...(input.case_id?{case_id:input.case_id}:{}),
      kind:input.kind,
      label:input.label,
      status:input.status||'proposed',
      reason:input.reason,
      actor:input.actor||{type:'service',id:'local'},
      ...(input.target?{target:input.target}:{}),
      ...(input.inputs?{inputs:input.inputs}:{}),
      ...(input.deadline?{deadline:input.deadline}:{}),
      evidence:(input.evidence||[]).map(evidence),
      risk,
      permissions:input.permissions||[],
      approval,
      reversible:Boolean(input.reversible),
      ...(input.idempotency_key?{idempotency_key:input.idempotency_key}:{}),
      ...(input.extensions?{extensions:input.extensions}:{})
    };
  }
  function assertValid(a){
    const errors=[];
    if(!a||a.openaction!==VERSION) errors.push('openaction must be 0.2');
    if(!a?.id?.startsWith('oa_')) errors.push('id must start oa_');
    if(!a?.kind||!a.kind.includes('.')) errors.push('kind must be namespaced, e.g. care.follow_up');
    if(!STATUSES.has(a?.status)) errors.push('invalid status');
    if(!Array.isArray(a?.evidence)||!a.evidence.length) errors.push('at least one evidence item required');
    if(!RISKS.has(a?.risk)) errors.push('invalid risk');
    if(['high','critical'].includes(a?.risk) && (!a?.approval?.required || !['human','qualified_human'].includes(a?.approval?.mode))) errors.push('high/critical requires human approval');
    return {ok:errors.length===0,errors};
  }
  function approve(action,by){
    const copy=structuredCloneSafe(action);
    copy.status='approved';
    copy.approval={...copy.approval,required:true,status:'approved',by:by||{type:'human',id:'user'},at:new Date().toISOString()};
    return copy;
  }
  function complete(action,outcome){
    const copy=structuredCloneSafe(action);
    copy.status=outcome?.status==='failed'?'failed':'succeeded';
    copy.outcome={status:outcome?.status||'succeeded',summary:outcome?.summary||'Completed',completed_at:new Date().toISOString(),...(outcome?.receipt?{receipt:outcome.receipt}:{}),...(outcome?.metrics?{metrics:outcome.metrics}:{})};
    return copy;
  }
  function toCloudEvent(action,source='urn:openaction:local'){
    const suffix=action.status==='succeeded'?'completed':action.status==='failed'?'failed':action.status==='executing'?'executing':action.status==='approved'?'approved':'proposed';
    return {specversion:'1.0',id:uid('evt'),source,type:`org.openaction.action.${suffix}`,time:new Date().toISOString(),datacontenttype:'application/vnd.openaction+json',openactionversion:VERSION,subject:action.id,data:action};
  }
  function fromFHIRTask(task,opts={}){
    if(!task||task.resourceType!=='Task') throw new Error('FHIR Task required');
    const desc=task.description||task.code?.text||task.intent||'FHIR task';
    const ref=task.id?`Task/${task.id}`:'FHIR Task';
    return create({
      case_id:opts.case_id,
      kind:opts.kind||'health.fhir_task.review',
      label:opts.label||desc,
      reason:opts.reason||`Mapped from ${ref}; clinical meaning remains in FHIR.`,
      actor:opts.actor||{type:'service',id:'fhir-adapter'},
      target:opts.target,
      evidence:[{kind:'system',source:opts.fhirBase||'FHIR',locator:ref,excerpt:desc}],
      risk:opts.risk||'high',
      permissions:opts.permissions||[],
      approval:opts.approval||{required:true,mode:'qualified_human',status:'pending'},
      extensions:{fhir:{resourceType:'Task',id:task.id||null,status:task.status||null}}
    });
  }
  function structuredCloneSafe(x){return typeof structuredClone==='function'?structuredClone(x):JSON.parse(JSON.stringify(x));}
  return {VERSION,create,assertValid,approve,complete,toCloudEvent,fromFHIRTask};
});
