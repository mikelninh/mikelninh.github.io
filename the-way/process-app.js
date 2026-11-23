/* THE WAY / PEACE LEDGER
 * Dated public editorial research. A document is NOT proof of implementation.
 * No automated peace score, conflict actor ranking, user tracking or persistent IDs. */
(function(){"use strict";
 const records=Array.isArray(window.WAY_PROCESSES)?window.WAY_PROCESSES:[];
 const meta=window.WAY_PROCESS_META||{};
 const $=s=>document.getElementById(s);
 const safe=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const date=s=>{const d=new Date(String(s)+"T12:00:00Z");return Number.isNaN(d.getTime())?String(s):d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"})};
 const st={record:null,view:"story"};
 function showToast(t){const el=$("toast");el.textContent=t;el.classList.add("shown");setTimeout(()=>el.classList.remove("shown"),3200)}
 function getRecord(){return records.find(r=>r.id===st.record)}
 function choose(id,updateUrl=true){
  const r=records.find(c=>c.id===id);if(!r)return;
  st.record=id;
  renderNav();renderMain();renderSources();
  if(updateUrl){const u=new URL(location.href);u.searchParams.set("process",id);history.replaceState(null,"",u.pathname+u.search+u.hash)}
 }
 function setView(v){if(!["story","commitments","timeline"].includes(v))return;st.view=v;
  document.querySelectorAll("[data-view]").forEach(b=>{const active=b.dataset.view===v;b.classList.toggle("selected",active);b.setAttribute("aria-pressed",active?"true":"false")});
  renderMain();
 }
 function renderNav(){
  const el=$("process-list");
  el.innerHTML=records.map((r,i)=>'<button type="button" class="process-option'+(r.id===st.record?' active':'')+'" data-process="'+safe(r.id)+'" aria-pressed="'+(r.id===st.record)+'"><span class="no">'+String(i+1).padStart(2,"0")+'</span><span><strong>'+safe(r.title)+'</strong><small>'+safe(r.type)+'</small></span><span class="arrow">↗</span></button>').join("");
 }
 function source(r,key){
  const s=r.sources[key];
  return s?'<a href="'+safe(s.url)+'" target="_blank" rel="noopener noreferrer" class="evidence-link" title="'+safe(s.org+": "+s.title)+'">OPEN THE SOURCE ↗</a>':"";
 }
 function inlineSources(r,keys){
  return '<div class="source-buttons">'+keys.filter(x=>r.sources[x]).map(k=>'<a href="'+safe(r.sources[k].url)+'" target="_blank" rel="noopener noreferrer">'+safe(r.sources[k].org)+' ↗</a>').join("")+'</div>';
 }
 function renderOverview(r){
  const flags=r.signals.map(x=>'<div class="signal '+safe(x.type)+'"><span><i></i>'+safe(x.label.toUpperCase())+'</span><strong>'+safe(x.detail)+'</strong></div>').join("");
  return '<span class="record-tag">'+safe(r.type.toUpperCase())+'</span>'+
  '<h3>'+safe(r.title)+'<br><em>'+safe(r.subtitle)+'</em></h3>'+
  '<p class="story-lead">'+safe(r.intro)+'</p>'+
  '<div class="record-date"><div><span>DOCUMENTED INSTRUMENT · '+safe(date(r.agreement.date)).toUpperCase()+'</span><strong>'+safe(r.agreement.name)+'</strong></div><a class="open-source" href="'+safe(r.agreement.url)+'" target="_blank" rel="noopener noreferrer">READ ↗</a></div>'+
  '<div class="focus-card"><span>THE VERIFICATION QUESTION</span><p>'+safe(r.focus)+'</p></div>'+
  '<div class="signals">'+flags+'</div>'+
  '<p class="explain-note"><strong>Editorial boundary:</strong> '+safe(r.caveat)+'</p>'+
  '<button class="view-cta" data-goto="commitments">EXAMINE THE COMMITMENTS ↗</button>';
 }
 function renderCommitments(r){
  return '<span class="record-tag">THREE COMMITMENTS TO INVESTIGATE</span>'+
  '<h3>What was<br><em>actually promised?</em></h3><p class="story-lead">Each card separates the commitment, an observable test and what the cited records currently support. None is an automatic compliance verdict.</p>'+
  '<div class="commitment-list">'+r.commitments.map((x,i)=>
    '<details class="commitment" '+(i===0?'open':'')+'><summary><span class="number">'+String(i+1).padStart(2,"0")+'</span><span class="heading">'+safe(x.title)+'</span><span class="plus">+</span></summary>'+
    '<div class="commitment-body"><p>'+safe(x.text)+'</p><div class="question"><span>WHAT WOULD VERIFY PROGRESS?</span><p>'+safe(x.test)+'</p></div><p class="finding"><strong>What the evidence says:</strong> '+safe(x.finding)+'</p>'+inlineSources(r,x.evidence)+'</div></details>').join("")+'</div>'+
  '<p class="explain-note">No points, scores, progress percentages or unverified event totals are assigned to parties. Absence of documentation is shown as an evidence gap.</p>';
 }
 function renderTimeline(r){
  const order={agreement:0,institution:1,monitoring:2};
  const list=[...r.milestones].sort((a,b)=>a.date.localeCompare(b.date)||(order[a.kind]||0)-(order[b.kind]||0));
  return '<span class="record-tag">TIMELINE · DOCUMENTED EVENTS ONLY</span>'+
  '<h3>The paper trail.<br><em>Dates you can check.</em></h3><p class="story-lead">This is a chronology of selected public records, not a real-time combat event feed or a complete negotiation history.</p>'+
  '<div class="timeline-legend">● AGREEMENTS & INSTITUTIONAL DOCUMENTS &nbsp; ● MONITORING REPORTS</div>'+
  '<ol class="timeline">'+list.map(x=>'<li class="timeline-item"><time class="date" datetime="'+safe(x.date)+'">'+safe(date(x.date).toUpperCase())+'</time><h4>'+safe(x.title)+'</h4><p>'+safe(x.note)+'</p>'+source(r,x.source)+'</li>').join("")+'</ol>'+
  '<button class="view-cta" data-goto="commitments">FOLLOW THE PROMISES ↗</button>';
 }
 function renderMain(){
  const r=getRecord();if(!r)return;
  $("story-region").textContent=r.region.toUpperCase()+"  /  "+r.stage.toUpperCase();
  $("story-content").innerHTML=st.view==="story"?renderOverview(r):st.view==="commitments"?renderCommitments(r):renderTimeline(r);
  $("story-updated").textContent="EDITORIAL REVIEW · "+date(meta.reviewed).toUpperCase();
 }
 function renderSources(){
  const r=getRecord();if(!r)return;
  const list=Object.entries(r.sources).sort((a,b)=>b[1].date.localeCompare(a[1].date));
  $("source-count").textContent=String(list.length).padStart(2,"0");
  $("source-list").innerHTML=list.map(([key,s])=>'<a class="source-item" href="'+safe(s.url)+'" target="_blank" rel="noopener noreferrer"><div class="top"><span class="source-date">'+safe(date(s.date).toUpperCase())+'</span><span class="out">↗</span></div><h4>'+safe(s.title)+'</h4><p>'+safe(s.org)+' · '+safe(s.role)+'</p></a>').join("");
 }
 function copyLink(){
  const u=new URL(location.href);u.searchParams.set("process",st.record);
  const text=u.toString();
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(()=>showToast("Source-linked case URL copied")).catch(()=>showToast("Copy the address from your browser"));
  else showToast("Copy the address from your browser");
 }
 function exportRecord(){
  const r=getRecord();if(!r)return;
  const payload={project:"THE WAY",edition:meta.edition,reviewed:meta.reviewed,evidenceType:"Curated documentary source ledger; not a verification certificate",record:r,licenseWarning:"Source materials have independent rights. Links are supplied; their content is not republished."};
  const b=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="the-way-"+r.id+"-evidence.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
 }
 function init(){
  const p=$("process-list");if(!records.length){p.textContent="The process source file could not be loaded.";return}
  $("count-processes").textContent=String(records.length).padStart(2,"0");
  $("process-number").textContent=String(records.length).padStart(2,"0");
  $("count-commitments").textContent=String(records.reduce((n,r)=>n+r.commitments.length,0));
  p.addEventListener("click",e=>{const b=e.target.closest("button[data-process]");if(b)choose(b.dataset.process)});
  document.querySelector(".view-buttons").addEventListener("click",e=>{const b=e.target.closest("button[data-view]");if(b)setView(b.dataset.view)});
  $("story-content").addEventListener("click",e=>{const b=e.target.closest("button[data-goto]");if(b)setView(b.dataset.goto)});
  $("share-process").addEventListener("click",copyLink);
  $("export-process").addEventListener("click",exportRecord);
  const param=new URL(location.href).searchParams.get("process");
  choose(records.some(r=>r.id===param)?param:records[0].id,!!param===false);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.activeElement?.tagName==="BUTTON")document.activeElement.blur()});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();