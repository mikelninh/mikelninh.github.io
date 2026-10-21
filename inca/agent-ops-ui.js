(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else {root.IncaAgentOpsUI=api;if(typeof document!=='undefined')api.mount(document);}
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const tools=['read_source','read_source','extract_field','extract_field','compare_facts','draft_handoff','enforce_boundary'];
const routes=['HUMAN_REVIEW','NEED_INFO','CONTINUE_CHECKS'];
function validate(report){
  if(!report||report.release!=='agent-ops-v1.1'||report.execution_mode!=='offline'||report.case_count!==6||
    !Array.isArray(report.runs)||report.runs.length!==6)return null;
  const ids=new Set();
  for(const r of report.runs){
    if(!r||typeof r.case_id!=='string'||ids.has(r.case_id)||!routes.includes(r.route)||
      !Array.isArray(r.events)||r.events.length!==7||r.external_actions!==0||
      !r.handoff||r.handoff.status!=='UNSENT_DRAFT'||r.handoff.external_actions!==0||
      !['AWAITING_HUMAN_REVIEW','AWAITING_INFORMATION','AWAITING_NEXT_GATE'].includes(r.status))return null;
    ids.add(r.case_id);
    for(let i=0;i<7;i++){
      const e=r.events[i];
      if(!e||e.tool!==tools[i]||e.status!=='completed'||e.step!==i+1||typeof e.agent!=='string')return null;
    }
    const s=r.events[6].output;
    if(s?.payment!==false||s?.coverage_approval!==false||s?.customer_message_sent!==false||s?.route!==r.route)return null;
    if(!Array.isArray(r.evidence)||r.evidence.length!==2||!r.evidence.every(x=>typeof x.source_ref==='string'))return null;
  }
  return report;
}
const $=(id,doc)=>doc.getElementById(id);
function safeText(value){return value===null||value===undefined?'—':typeof value==='string'?value:JSON.stringify(value,null,2);}
function download(doc,filename,data){
  const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=doc.createElement('a');
  link.href=url;link.download=filename;doc.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function mount(doc){
  const app=$('agent-ops-app',doc);if(!app)return;
  let report=null,current=0,step=0;
  const set=(id,value)=>{$(id,doc).textContent=safeText(value);};
  const casePicker=$('case-picker',doc);
  const timeline=$('timeline',doc);
  function selectCase(index){
    current=index;step=0;
    const r=report.runs[current];
    casePicker.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));
    set('case-head',r.label);set('case-ref',r.case_id+' · '+r.claim_type);
    set('current-route',r.route);$('current-route',doc).dataset.route=r.route;
    set('current-reason',r.reason.replaceAll('_',' ').toLowerCase());
    set('current-next',r.next_action.replaceAll('_',' ').toLowerCase());
    set('input-a',r.events[0].output.excerpt);
    set('input-b',r.events[1].output.excerpt);
    set('human-state',r.status.replaceAll('_',' ').toLowerCase());
    $('feedback-reason',doc).value='';
    $('feedback-route',doc).value=r.route;
    set('feedback-note','Feedback is local and has not been independently validated.');
    renderTimeline();
  }
  function renderTimeline(){
    const r=report.runs[current];
    timeline.replaceChildren();
    r.events.forEach((e,i)=>{
      const b=doc.createElement('button');b.type='button';b.className='trace-step';
      b.setAttribute('aria-pressed',String(i===step));
      b.setAttribute('aria-label','Inspect step '+(i+1)+': '+e.agent);
      const n=doc.createElement('span');n.className='trace-number';n.textContent=String(i+1).padStart(2,'0');
      const body=doc.createElement('span');body.className='trace-step-body';
      const who=doc.createElement('strong');who.textContent=e.agent;
      const what=doc.createElement('small');what.textContent=e.tool.replaceAll('_',' ');
      body.append(who,what);b.append(n,body);
      b.addEventListener('click',()=>{step=i;renderTimeline()});
      timeline.appendChild(b);
    });
    const e=r.events[step];
    set('selected-step',(step+1)+' / '+r.events.length);
    set('event-role',e.agent);set('event-tool',e.tool);
    set('event-output',JSON.stringify(e.output,null,2));
    const prev=$('previous-step',doc),next=$('next-step',doc);
    prev.disabled=step===0;next.disabled=step===r.events.length-1;
  }
  $('previous-step',doc).addEventListener('click',()=>{if(step>0){step--;renderTimeline()}});
  $('next-step',doc).addEventListener('click',()=>{if(report&&step<report.runs[current].events.length-1){step++;renderTimeline()}});
  $('replay',doc).addEventListener('click',()=>{if(report){step=0;renderTimeline()}});
  $('download-trace',doc).addEventListener('click',()=>{if(report){const r=report.runs[current];download(doc,'inca-'+r.case_id+'-trace.json',r)}});
  $('feedback-download',doc).addEventListener('click',()=>{
    if(!report)return;
    const reason=$('feedback-reason',doc).value.trim();
    if(reason.length<8){set('feedback-note','Please explain the proposed route in at least 8 characters.');return;}
    const r=report.runs[current];
    download(doc,'inca-'+r.case_id+'-feedback-candidate.json',{
      case_id:r.case_id,run_id:r.run_id,observed_route:r.route,
      proposed_route:$('feedback-route',doc).value,reviewer_reason:reason,
      source_refs:r.evidence.map(x=>x.source_ref),reviewer_identity:'USER_SIMULATED',
      expert_verified:false,added_to_ci:false,external_actions:0
    });
    set('feedback-note','Downloaded locally. No case was updated and no message was sent.');
  });
  fetch('/inca/agent-ops-traces.json',{cache:'no-store'}).then(async response=>{
    if(!response.ok)throw Error('No recorded Python trace available');
    const data=validate(await response.json());
    if(!data)throw Error('Invalid or unsafe recorded trace schema');
    report=data;
    set('summary-cases',report.case_count);
    set('summary-steps',report.runs.reduce((n,r)=>n+r.events.length,0));
    set('summary-reviews',report.runs.filter(r=>r.route==='HUMAN_REVIEW').length);
    set('summary-actions',report.runs.reduce((n,r)=>n+r.external_actions,0));
    set('trace-status','Recorded Python tool execution · offline scripted planner · no paid API requests');
    casePicker.replaceChildren();
    report.runs.forEach((r,i)=>{
      const b=doc.createElement('button');b.type='button';b.className='case-pick';
      b.setAttribute('aria-pressed','false');b.textContent=r.case_id+'  '+r.label;
      b.addEventListener('click',()=>selectCase(i));casePicker.appendChild(b);
    });
    $('workspace',doc).hidden=false;
    selectCase(0);
  }).catch(()=>{
    set('trace-status','The verified Python trace is unavailable or invalid. Agent results are not simulated.');
    $('workspace',doc).hidden=true;
  });
}
return {validate,safeText,mount};
});
