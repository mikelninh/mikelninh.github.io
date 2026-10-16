import {analyze} from './core.mjs';
import {demoCases,getDemoCase} from './cases.mjs';
const el=id=>document.getElementById(id);
let docs=[],report=null,fictional=true,activeCase=getDemoCase("asterion"),showAllFields=false;
const make=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const status=(msg,error=false)=>{el('status').textContent=msg;el('status').classList.toggle('error',error)};
function showSources(field){
 el('dialogTitle').textContent=field.label;el('sourceList').replaceChildren();
 if(!field.evidence.length)el('sourceList').append(make('p','', 'No matching extract found. The source may contain information this rule does not recognise.'));
 field.evidence.forEach(hit=>{const row=make('div','evidence');row.append(make('b','',hit.source+' · PAGE '+hit.page),make('blockquote','',hit.excerpt));el('sourceList').append(row)});
 el('dialog').showModal();
}
function render(){
 report=analyze(docs);el('workspace').hidden=false;el('doccount').textContent=String(report.sourceCount).padStart(2,'0');
 el('hitCount').textContent=String(report.evidenceCount).padStart(2,'0');el('diffCount').textContent=String(report.differences.length).padStart(2,'0');el('gapCount').textContent=String(report.missing.length).padStart(2,'0');
 el('case').textContent=fictional?activeCase.name.toUpperCase()+' · FICTIONAL':docs.map(x=>x.name).join(' + ');
 el('mode').textContent=fictional?'SYNTHETIC EXAMPLE · NOT A REAL STARTUP':'YOUR LOCAL DOCUMENTS · NOT UPLOADED';
 el('cards').replaceChildren();el('questions').replaceChildren();
 const priority={different:0,mixed:1,forecast:1,missing:2,found:3};
 const fields=[...report.fields].sort((a,b)=>(priority[a.status]??9)-(priority[b.status]??9));
 fields.slice(0,showAllFields?fields.length:4).forEach(f=>{
  const button=make('button','card');button.type='button';button.setAttribute('aria-label','Inspect '+f.label+' source excerpts');
  const row=make('div','card-row');const badges={different:'RECONCILE',missing:'NOT FOUND',forecast:'FORECAST ONLY',mixed:'ACTUAL + FORECAST',found:'EXCERPT FOUND'};row.append(make('h4','',f.label),make('span','tag '+f.status,badges[f.status]||'REVIEW'));
  const summary=f.status==='missing'?'No matching text found. This is not proof the topic is absent.':f.status==='different'?'Figures differ. Check definitions and reporting periods.':f.status==='forecast'?'Projected figure only. Do not confuse this with actual current revenue.':f.status==='mixed'?'Both reported and projected values appear. Keep them distinct.':f.evidence[0].excerpt.slice(0,135);
  button.append(row,make('p','',summary),make('span','inspect','Inspect sources →'));button.addEventListener('click',()=>showSources(f));el('cards').append(button);
 });
 if(fields.length>4){
  const expand=make('button','more-fields',showAllFields?'Show fewer findings ↑':'See all '+fields.length+' reviewed topics ↓');
  expand.type='button';expand.addEventListener('click',()=>{showAllFields=!showAllFields;render()});el('cards').append(expand);
 }
 report.questions.forEach((q,i)=>{const row=make('div','question');row.append(make('b','',String(i+1).padStart(2,'0')),make('p','',q));el('questions').append(row)});
 if(fictional){
   el('outcomeKind').textContent=activeCase.name.toUpperCase()+' · FICTIONAL EXCERPTS';
   el('outcomeBefore').textContent=activeCase.before;
   el('outcomeAction').textContent=report.differences.length?'Start with the differences.':report.forecasts.length?'Separate forecast from fact.':report.missing.length?'Make gaps visible.':'Go deeper than a clean deck.';
   el('outcomeProof').textContent=activeCase.name+' surfaces '+report.evidenceCount+' traceable observations, '+report.differences.length+' differing figures, '+report.missing.length+' topics not found and '+report.questions.length+' questions for review.';
   el('outcomeLesson').textContent=activeCase.lesson;
 }else{
   el('outcomeKind').textContent='UPLOADED DOCUMENTS · LOCAL REVIEW';
   el('outcomeBefore').textContent='Read uploaded PDFs, locate assertions, compare figures, and trace claims back to original pages.';
   el('outcomeAction').textContent='Inspect before deciding.';
   el('outcomeProof').textContent='The uploaded files surfaced '+report.evidenceCount+' rule-based observations, '+report.differences.length+' differences, '+report.missing.length+' topics not found and '+report.questions.length+' follow-up questions.';
   el('outcomeLesson').textContent='These observations are not external fact checks; verify dates, definitions and omissions.';
 }
}
function loadExample(id='asterion'){
 showAllFields=false;
 activeCase=getDemoCase(id);docs=JSON.parse(JSON.stringify(activeCase.docs));fictional=true;el('files').value='';el('notes').value='';
 document.querySelectorAll('[data-case]').forEach(button=>{const isSelected=button.dataset.case===activeCase.id;button.classList.toggle('active',isSelected);button.setAttribute('aria-pressed',String(isSelected))});
 render();status('Fictional '+activeCase.name+' case selected. Review '+report.evidenceCount+' source excerpts and '+report.questions.length+' questions.');
}
async function parsePdf(file){
 const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
 const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
 if(pdf.numPages>30)throw Error(file.name+': max 30 pages per PDF');
 const pages=[];
 for(let p=1;p<=pdf.numPages;p++){
  const page=await pdf.getPage(p),content=await page.getTextContent();
  const sorted=content.items.filter(item=>item.str&&item.str.trim()).map(item=>({text:item.str.trim(),x:item.transform?.[4]||0,y:item.transform?.[5]||0})).sort((a,b)=>b.y-a.y||a.x-b.x);
  const rows=[];for(const item of sorted){const row=rows[rows.length-1];if(row&&Math.abs(row.y-item.y)<2.5)row.parts.push(item.text);else rows.push({y:item.y,parts:[item.text]})}
  pages.push({number:p,text:rows.map(row=>row.parts.join(' ')).join('\n')});page.cleanup();
 }
 return {name:file.name,pages};
}
async function handle(files){
 if(!files.length)return;
 if(files.length>3){status('Please choose at most three files.',true);return}
 if(files.some(f=>f.size>8*1024*1024)){status('Maximum 8 MB per file.',true);return}
 status('Reading your files locally…');
 try{
  const next=[];
  for(const file of files){
   if(file.name.toLowerCase().endsWith('.txt'))next.push({name:file.name,pages:[{number:1,text:await file.text()}]});
   else if(file.name.toLowerCase().endsWith('.pdf'))next.push(await parsePdf(file));
   else throw Error('Only PDF and TXT files are supported.');
  }
  if(!next.some(d=>d.pages.some(p=>p.text.trim())))throw Error('No extractable text found. Scanned documents require OCR, which is not supported.');
  docs=next;showAllFields=false;fictional=false;document.querySelectorAll('[data-case]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});el('notes').value='';render();status('Read '+docs.length+' file(s). '+(report.evidenceCount?report.evidenceCount+' rule-based observations; inspect sources.':'No supported fields recognised. This does not imply the deck is complete.'));
  el('workspace').scrollIntoView({behavior:'smooth',block:'start'});
 }catch(error){status(error?.message||String(error),true)}
}
function exportBrief(){
 if(!report)return;
 const out=['# FIRST MILE — Conversation briefing','', 'Status: human-review draft; no investment recommendation.',
 'Sources: '+docs.map(x=>x.name).join('; '),'Mode: '+(fictional?'Fictional sample':'Browser-local files'),'','## Extracted observations'];
 report.fields.forEach(f=>{out.push('','### '+f.label+' — '+f.status.toUpperCase());if(!f.evidence.length)out.push('Not found by this limited extractor.');
 f.evidence.forEach(hit=>out.push('- '+hit.source+' · p. '+hit.page+': '+hit.excerpt.replace(/[\r\n]+/g,' ')))});
 out.push('','## Questions for founders');report.questions.forEach((q,i)=>out.push(String(i+1)+'. '+q));
 out.push('','## Reviewer notes',el('notes').value.trim()||'(none)','',
 '## Boundaries','Literal pattern matches only; not fact verification. Numerical differences may reflect dates, units or reporting definitions. No OCR or independent valuation. Human review required.');
 const blob=new Blob([out.join('\n')],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='first-mile-founder-brief.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
el('example').addEventListener('click',()=>el('case-picker').scrollIntoView({behavior:'smooth',block:'start'}));
document.querySelectorAll('[data-case]').forEach(button=>button.addEventListener('click',()=>{loadExample(button.dataset.case);el('workspace').scrollIntoView({behavior:'smooth',block:'start'})}));
el('files').addEventListener('change',event=>handle([...event.target.files]));
el('export').addEventListener('click',exportBrief);el('close').addEventListener('click',()=>el('dialog').close());
const drop=el('drop');drop.addEventListener('dragover',e=>e.preventDefault());drop.addEventListener('drop',e=>{e.preventDefault();handle([...e.dataTransfer.files])});
loadExample();