(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  else{root.IncaCaseWorkshop=api;if(typeof document!=='undefined')api.mount(document)}
})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const examples=Object.freeze({
    conflict:[
      'Reise ST-104 | Kundenmitteilung\nStornierungsdatum: 11.07.2026\nHinweis: Kundin meldet die Stornierung vor Reiseantritt.',
      'Reise ST-104 | Buchungssystem-Auszug\nStornierungsdatum: 12.07.2026\nHinweis: Buchungssystem nennt ein abweichendes Datum.'
    ],
    consistent:[
      'Reise ST-104 | Kundenmitteilung\nStornierungsdatum: 11.07.2026\nHinweis: Kundin meldet die Stornierung vor Reiseantritt.',
      'Reise ST-104 | Buchungssystem-Auszug\nStornierungsdatum: 11.07.2026\nHinweis: Datum bestätigt, weitere Deckungsprüfung erforderlich.'
    ],
    missing:[
      'Reise ST-104 | Kundenmitteilung\nStornierungsdatum: 11.07.2026\nHinweis: Kundin meldet die Stornierung vor Reiseantritt.',
      'Reise ST-104 | Buchungssystem-Auszug\nHinweis: Zum Stornierungsdatum liegt keine Angabe vor.'
    ]
  });
  function normalizeDate(value){
    const s=String(value||'').trim();
    let y,m,d;
    let a=s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if(a){d=Number(a[1]);m=Number(a[2]);y=Number(a[3])}
    else{
      a=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if(!a)return null;
      y=Number(a[1]);m=Number(a[2]);d=Number(a[3]);
    }
    if(y<1900||y>2200)return null;
    const dt=new Date(Date.UTC(y,m-1,d));
    if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)return null;
    return [y,String(m).padStart(2,'0'),String(d).padStart(2,'0')].join('-');
  }
  function extract(source){
    const text=String(source||'');
    const regex=/(?:Stornierungsdatum|cancellation date)\s*:\s*([0-9]{2}\.[0-9]{2}\.[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/gi;
    const found=[];let m;
    while((m=regex.exec(text))!==null){
      found.push({date:normalizeDate(m[1]),raw:m[1],excerpt:m[0].trim()});
    }
    return found;
  }
  function evaluate(docA,docB){
    const a=extract(docA),b=extract(docB);
    const all=[...a,...b];
    let route,reason,action;
    if(!all.length||!a.length||!b.length||all.some(x=>!x.date)){
      route='NEED_INFO';reason='The required cancellation date is missing or invalid in at least one document.';
      action='Request a dated source document or clarification before routing the claim.';
    }else if(new Set(all.map(x=>x.date)).size>1){
      route='HUMAN_REVIEW';reason='The supplied documents contain conflicting cancellation dates.';
      action='Pause automatic clearance; ask a claims specialist to confirm the date against the originals.';
    }else{
      route='CONTINUE_CHECKS';reason='Both texts contain the same valid cancellation date.';
      action='Proceed to the remaining policy, coverage and evidence checks. This is not payment approval.';
    }
    return {route,reason,action,sourceA:a,sourceB:b,externalActions:0,
      method:'deterministic browser-local text matching; not LLM inference or insurance validation'};
  }
  function makeNote(result,docA,docB,notes){
    const quote=arr=>arr.length?arr.map(x=>x.excerpt+' [normalized: '+(x.date||'invalid')+']').join('; '):'NOT FOUND';
    return [
      '# Synthetic case ST-104 — review handoff',
      '',
      'Route: '+result.route,
      'Reason: '+result.reason,
      'Recommended next step: '+result.action,
      '',
      '## Traceable text evidence',
      '- Source A (customer notice): '+quote(result.sourceA),
      '- Source B (booking record): '+quote(result.sourceB),
      '',
      '## Operator notes',
      String(notes||'No additional notes.').trim().slice(0,2000),
      '',
      '## Original synthetic snippets',
      '### Source A',
      String(docA||'').slice(0,4000),
      '',
      '### Source B',
      String(docB||'').slice(0,4000),
      '',
      '## Limitations',
      'Synthetic training data only. Date extraction uses transparent regex rules, not a model.',
      'This is not a real claim, insurer integration, coverage decision or payment approval.',
      'No external actions were executed and the handoff is downloaded locally.',
      ''
    ].join('\n');
  }
  function mount(doc){
    const get=id=>doc.getElementById(id);
    if(!get('cw-run'))return;
    const a=get('cw-doc-a'),b=get('cw-doc-b'),notes=get('cw-notes');
    const btn=get('cw-run'),download=get('cw-export'),feedback=get('cw-result');
    let latest=null;
    const applyExample=name=>{
      const pair=examples[name]||examples.conflict;
      a.value=pair[0];b.value=pair[1];invalidate();
    };
    const invalidate=()=>{
      latest=null;download.disabled=true;
      feedback.hidden=true;get('cw-status').textContent='Ready to check · no decision yet.';
    };
    const render=result=>{
      const tone=result.route==='HUMAN_REVIEW'?'warn':result.route==='NEED_INFO'?'info':'ok';
      get('cw-route').textContent=result.route;
      get('cw-route').className='cw-route '+tone;
      get('cw-reason').textContent=result.reason;
      get('cw-action').textContent=result.action;
      const label=items=>items.length?items.map(x=>x.excerpt+' → '+(x.date||'INVALID')).join(' · '):'No cancellation date found';
      get('cw-evidence-a').textContent=label(result.sourceA);
      get('cw-evidence-b').textContent=label(result.sourceB);
      feedback.hidden=false;
      get('cw-status').textContent='Check complete. A review handoff can now be downloaded.';
      download.disabled=false;
    };
    doc.querySelectorAll('[data-cw-example]').forEach(button=>button.addEventListener('click',()=>{
      doc.querySelectorAll('[data-cw-example]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
      applyExample(button.getAttribute('data-cw-example'));
    }));
    [a,b].forEach(el=>el.addEventListener('input',invalidate));
    btn.addEventListener('click',()=>{latest=evaluate(a.value,b.value);render(latest)});
    download.addEventListener('click',()=>{
      if(!latest)return;
      const txt=makeNote(latest,a.value,b.value,notes.value);
      const blob=new Blob([txt],{type:'text/markdown;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const anchor=doc.createElement('a');anchor.href=url;anchor.download='ST-104-'+latest.route.toLowerCase()+'-handoff.md';
      doc.body.appendChild(anchor);anchor.click();anchor.remove();
      URL.revokeObjectURL(url);
      get('cw-status').textContent='Downloaded locally. No case was sent, stored on a server, or approved.';
    });
    applyExample('conflict');
  }
  return {examples,normalizeDate,extract,evaluate,makeNote,mount};
});