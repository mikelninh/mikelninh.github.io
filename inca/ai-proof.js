'use strict';
 function simulateQueue(){
   const records=[];
   const classes=[
     {n:9,kind:'CRITICAL REVIEW',route:'HUMAN_REVIEW',priority:1,reason:'Deadline / safety-sensitive exception'},
     {n:17,kind:'CONTRADICTION',route:'HUMAN_REVIEW',priority:2,reason:'Conflicting source evidence'},
     {n:26,kind:'MISSING EVIDENCE',route:'NEED_INFO',priority:3,reason:'Required evidence absent'},
     {n:48,kind:'ROUTINE CHECK',route:'CONTINUE_CHECKS',priority:4,reason:'No contradiction in the sampled document gate'}
   ];
   for(const c of classes)for(let i=0;i<c.n;i++)records.push({
      id:'SYN-'+String(records.length+1).padStart(3,'0'),
      kind:c.kind,route:c.route,priority:c.priority,reason:c.reason,fictional:true
   });
   return records;
 }
 function summarize(report){
   if(!report||report.status!=='RECORDED_REAL_OPENAI_API_RUN'||!Array.isArray(report.rows))return null;
   const rows=report.rows;
   const matched=rows.filter(r=>r.matches_authored_expected===true).length;
   const unsafe=rows.filter(r=>r.expected!=='CONTINUE_CHECKS'&&r.route==='CONTINUE_CHECKS').length;
   const invalid=rows.filter(r=>!r.evidence_valid).length;
   return {n:rows.length,matched,unsafe,invalid,rows};
 }
 function comparison(caseItem,observed){
   if(!caseItem||!observed)return null;
   const expected=caseItem.expected;
   return {expected,predicted:observed.route,match:expected===observed.route};
 }
 async function mount(doc){
   const root=doc.getElementById('ai-evidence');
   if(!root)return;
   const $=id=>doc.getElementById(id);
   const set=(id,t)=>{const e=$(id);if(e)e.textContent=String(t);};
   const status=$('ai-status'),select=$('ai-case-select');
   if(!status||!select)return;
   // 100 generated scenarios are an illustrative workload, not model runs or real cases.
   const queue=simulateQueue();
   set('ai-queue-count',queue.length);
   set('ai-queue-critical',queue.filter(r=>r.kind==='CRITICAL REVIEW').length);
   set('ai-queue-review',queue.filter(r=>r.route==='HUMAN_REVIEW').length);
   set('ai-queue-info',queue.filter(r=>r.route==='NEED_INFO').length);
   set('ai-queue-continue',queue.filter(r=>r.route==='CONTINUE_CHECKS').length);
   const rows=queue.slice(0,5);
   const q=$('ai-queue-preview');
   if(q){q.replaceChildren();for(const r of rows){
      const e=doc.createElement('div');e.className='ai-queue-row';
      const id=doc.createElement('span');id.textContent=r.id;
      const why=doc.createElement('span');why.textContent=r.reason;
      const route=doc.createElement('strong');route.textContent=r.route;
      e.append(id,why,route);q.appendChild(e);
   }}
   let report,fixtures;
   try{
      const [data,source]=await Promise.all([
       fetch('/inca/ai-evidence.json',{cache:'no-store'}),
       fetch('/inca-proof/model-eval/shift_cases.json')
      ]);
      if(!source.ok)throw Error('Synthetic case fixtures unavailable');
      fixtures=(await source.json()).cases;
      if(!data.ok)throw Error('No recorded API result published yet');
      report=await data.json();
      const metrics=summarize(report);
      if(!metrics)throw Error('Recorded API result is not valid');
      status.textContent='Recorded real API run · '+report.model;
      set('ai-model',report.model);
      set('ai-run-date',(report.generated_at_utc||'').slice(0,10));
      set('ai-score',metrics.matched+' / '+metrics.n);
      set('ai-unsafe',metrics.unsafe);
      set('ai-source',metrics.n-metrics.invalid+' / '+metrics.n);
      set('ai-run-note','These '+metrics.n+' outputs were returned by the OpenAI API in a separate bounded GitHub Actions run. The displayed result does NOT change when you edit the workshop documents. Labels were developer-authored, not expert verified.');
      select.replaceChildren();
      for(const c of fixtures){
         const op=doc.createElement('option');op.value=c.id;op.textContent=c.id+' · '+c.name;
         select.appendChild(op);
      }
      const render=()=>{
        const id=select.value;const c=fixtures.find(x=>x.id===id);const r=report.rows.find(x=>x.id===id);
        if(!c||!r)return;
        set('ai-doc-a',c.a);set('ai-doc-b',c.b);
        set('ai-expected',c.expected);set('ai-result',r.route);
        set('ai-result-reason',r.reason);
        set('ai-latency',r.latency_ms===null?'API error':r.latency_ms+' ms');
        set('ai-extract-a',r.extraction?.source_a?.date||'Not found');
        set('ai-extract-b',r.extraction?.source_b?.date||'Not found');
        set('ai-quote-a',r.extraction?.source_a?.quote||'No quoted date');
        set('ai-quote-b',r.extraction?.source_b?.quote||'No quoted date');
        set('ai-model-uncertainty',r.extraction?.uncertainty||'No uncertainty note supplied');
        set('ai-source-valid',r.evidence_valid?'Quote validation passed':'Evidence invalid or incomplete – fail closed');
        set('ai-row-match',r.matches_authored_expected?'Matches developer-authored expected route':'Disagrees with developer-authored expected route');
        const badge=$('ai-row-match');if(badge)badge.dataset.tone=r.matches_authored_expected?'ok':'warn';
        const engine=window.IncaCaseWorkshop;
        if(engine&&typeof engine.evaluate==='function'){
          const baseline=engine.evaluate(c.a,c.b);
          set('ai-rules-only',baseline.route);
          set('ai-rule-comparison',baseline.route===r.route?
            'Both paths suggest the same next step (for different reasons).':
            'The simple date regex and recorded LLM path differ here. Inspect the source quotes; this is not proof either is production-correct.');
        }
      };
      select.addEventListener('change',render);
      select.value='ST-421'; // An illustrative natural-language contrast with the regex-only baseline
      render();
      $('ai-snapshot').hidden=false;
      $('ai-loading').hidden=true;
   }catch(err){
      $('ai-loading').textContent='The recorded OpenAI run is not available yet. The rule-based Operator Shift above still works. No model results are being invented.';
      status.textContent='No verified recorded model run';
      $('ai-snapshot').hidden=true;
   }
 }
const IncaAiEvidence = {simulateQueue,summarize,comparison,mount};
if (typeof module === 'object' && module.exports) module.exports=IncaAiEvidence;
if (typeof window !== 'undefined') window.IncaAiEvidence=IncaAiEvidence;
if (typeof document !== 'undefined') mount(document);