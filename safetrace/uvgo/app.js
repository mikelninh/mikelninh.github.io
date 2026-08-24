const D = window.SAFETRACE_DATA;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const source = id => D.sources[id];
const esc = s => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function countdown(){
  const node=$('#countdown'); if(!node) return;
  const diff=new Date(D.meta.consultationDeadline)-new Date();
  if(diff<=0){node.textContent='Frist beendet'; return;}
  const d=Math.floor(diff/86400000), h=Math.floor(diff%86400000/3600000);
  node.textContent=`Noch ${d} Tage · ${h} Std.`;
}
function renderChanges(filter='all'){
  const rows=D.changes.filter(x=>filter==='all'||x.type===filter);
  $('#changeCards').innerHTML=rows.map(x=>{const s=source(x.source);return `<article class="change-card ${x.type}"><div class="card-meta"><span class="pill ${x.type}">${esc(x.status)}</span><span>Confidence: ${esc(x.confidence)}</span></div><h3>${esc(x.title)}</h3><div class="compare"><div><small>Vorher / Ausgangspunkt</small><b>${esc(x.before)}</b></div><div class="arrow">→</div><div><small>Entwurf / Prüfziel</small><b>${esc(x.after)}</b></div></div><p>${esc(x.evidence)}</p><a href="${s.url}" target="_blank" rel="noreferrer">Quelle: ${esc(s.label)} ↗</a></article>`}).join('');
}
function renderTimeline(){
  $('#timeline').innerHTML=D.evidence.map(e=>{const s=source(e.source);return `<article class="event ${e.kind}"><time>${new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(e.date+'T12:00:00'))}</time><div><span class="pill ${e.kind}">${esc(e.kind)}</span><h3>${esc(e.title)}</h3><p>${esc(e.detail)}</p><a href="${s.url}" target="_blank" rel="noreferrer">${esc(s.label)} ↗</a></div></article>`}).join('');
  $('#evidenceCount').textContent=D.evidence.length;
}
function renderStakeholders(q=''){
  q=q.toLowerCase().trim();
  const rows=D.stakeholders.filter(x=>!q||[x.name,x.role,x.stance,...x.topics].join(' ').toLowerCase().includes(q));
  $('#stakeholderCards').innerHTML=rows.map(x=>{const s=source(x.source);return `<article class="stakeholder"><div class="card-meta"><span class="pill ${x.type}">${esc(x.type)}</span><span>${esc(x.role)}</span></div><h3>${esc(x.name)}</h3><p>${esc(x.stance)}</p><div class="tags">${x.topics.map(t=>`<span>${esc(t)}</span>`).join('')}</div><a href="${s.url}" target="_blank" rel="noreferrer">Beleg ↗</a></article>`}).join('') || '<p class="empty">Keine belegten Einträge für diese Suche.</p>';
}
function renderSources(){
  $('#sources').innerHTML=Object.entries(D.sources).map(([id,s],i)=>`<a href="${s.url}" target="_blank" rel="noreferrer"><span>${String(i+1).padStart(2,'0')}</span><div><b>${esc(s.label)}</b><small>Tier ${s.tier} · ${esc(s.note)}</small></div><i>↗</i></a>`).join('');
}
function download(name, text, mime){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:mime}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function csv(){const rows=[['date','kind','title','detail','source'],...D.evidence.map(e=>[e.date,e.kind,e.title,e.detail,source(e.source).url])];return rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n')}
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderChanges(b.dataset.filter)}));
$('#stakeholderSearch').addEventListener('input',e=>renderStakeholders(e.target.value));
$('#exportJson').addEventListener('click',()=>download(`safetrace-${D.meta.caseId}-evidence.json`,JSON.stringify({meta:D.meta,evidence:D.evidence,sources:D.sources},null,2),'application/json'));
$('#exportCsv').addEventListener('click',()=>download(`safetrace-${D.meta.caseId}-evidence.csv`,csv(),'text/csv;charset=utf-8'));
$('#theme').addEventListener('click',()=>{const v=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=v;localStorage.setItem('theme',v)});
const saved=localStorage.getItem('theme'); if(saved) document.documentElement.dataset.theme=saved;
countdown(); setInterval(countdown,60000); renderChanges(); renderTimeline(); renderStakeholders(); renderSources();