import{buildPlan,urgencyLabel}from'./plan-engine.js';
import{buildPacket,allEvidence}from'./packets.js';
import{vaultExists,saveVault,loadVault,clearVault,vaultInfo}from'./vault.js';

const PROFILE='geburtslotse-profile-v2',DONE='geburtslotse-done-v2',EVIDENCE='geburtslotse-evidence-v1';
const oldProfile='birth-companion-profile-v1',oldDone='birth-companion-v1';
const states=['Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen','Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen','Sachsen-Anhalt','Schleswig-Holstein','Thüringen'];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const read=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k))??fallback}catch{return fallback}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let profile=read(PROFILE,read(oldProfile,null));let completed=read(DONE,read(oldDone,{}));let evidenceState=read(EVIDENCE,{});
let vaultData=null,vaultPassphrase=null;

const vaultFields=[
 ['applicantFirstName','Vorname antragstellende Person','text'],['applicantLastName','Nachname antragstellende Person','text'],['applicantBirthDate','Geburtsdatum antragstellende Person','date'],['applicantTaxId','Steuer-ID antragstellende Person','text'],
 ['street','Straße','text'],['houseNumber','Hausnummer','text'],['postcode','PLZ','text'],['city','Ort','text'],['email','E-Mail','email'],['phone','Telefon','tel'],
 ['childFirstName','Vorname Kind','text'],['childLastName','Nachname Kind','text'],['childBirthPlace','Geburtsort Kind','text'],['childTaxId','Steuer-ID Kind','text'],
 ['secondParentFirstName','Vorname zweiter Elternteil','text'],['secondParentLastName','Nachname zweiter Elternteil','text'],
 ['iban','IBAN','text'],['accountHolder','Kontoinhaber:in','text'],['healthInsurer','Krankenkasse','text'],['insuranceNumber','Versichertennummer','text'],
 ['employerName','Arbeitgeber','text'],['employerEmail','Arbeitgeber E-Mail','email'],['parentalLeaveStart','Beginn Elternzeit','date'],['parentalLeaveEnd','Ende Elternzeit','date']
];

function init(){
  $('#state').innerHTML='<option value="">Bitte wählen</option>'+states.map(x=>`<option>${x}</option>`).join('');
  if(profile)hydrateIntake(profile);
  $('#intake').addEventListener('submit',e=>{e.preventDefault();profile=Object.fromEntries(new FormData(e.target).entries());write(PROFILE,profile);showWorkspace()});
  $('#editProfile').onclick=()=>showIntake();$('#resetPlan').onclick=resetPlan;$('#printPlan').onclick=()=>window.print();$('#shareApp').onclick=shareApp;
  $$('.tab').forEach(b=>b.onclick=()=>activateTab(b.dataset.tab));
  $('#packetDialog').addEventListener('click',e=>{if(e.target.id==='packetDialog')e.target.close()});
  $('#closePacket').onclick=()=>$('#packetDialog').close();
  if(profile)showWorkspace();else showIntake();
}

function hydrateIntake(p){Object.entries(p).forEach(([k,v])=>{const els=document.querySelectorAll(`[name="${CSS.escape(k)}"]`);els.forEach(el=>{if(el.type==='radio')el.checked=el.value===v;else el.value=v})})}
function showIntake(){ $('#intakeView').hidden=false;$('#workspaceView').hidden=true;hydrateIntake(profile||{});window.scrollTo({top:0,behavior:'smooth'}) }
function showWorkspace(){ $('#intakeView').hidden=true;$('#workspaceView').hidden=false;renderAll();window.scrollTo({top:0,behavior:'smooth'}) }
function renderAll(){renderOverview();renderPlan();renderPackets();renderEvidence();renderVault();}

function renderOverview(){
  const plan=buildPlan(profile);const done=plan.filter(t=>completed[t.id]).length;const next=plan.find(t=>!completed[t.id]);
  $('#workspaceTitle').textContent=`Euer Geburtsplan`;
  $('#workspaceMeta').textContent=`${profile.state} · ${done}/${plan.length} Schritte markiert · Daten bleiben lokal`;
  $('#progressBar').style.width=`${plan.length?Math.round(done/plan.length*100):0}%`;
  $('#nextAction').innerHTML=next?`<div class="micro light">Das Nächste</div><div class="next-tag">${urgencyLabel(next.urgency)}</div><h2>${esc(next.title)}</h2><p>${esc(next.next)}</p><div class="next-actions"><button class="white" data-packet="${next.id}">Daten vorbereiten</button><a class="white ghost" target="_blank" rel="noopener" href="${next.apply||next.source}">Offizielle Stelle ↗</a></div>`:`<div class="micro light">Plan</div><h2>Alles markiert ✓</h2><p>Prüft weiterhin die Bestätigungen und Bescheide der offiziellen Stellen. „Erledigt“ im Lotse ist euer eigener Fortschrittsmarker.</p>`;
  $$('[data-packet]').forEach(b=>b.onclick=()=>openPacket(b.dataset.packet));
}

function renderPlan(){
  const plan=buildPlan(profile);$('#taskList').innerHTML=plan.map(t=>`<article class="task ${completed[t.id]?'done':''}"><button class="check" data-done="${t.id}" aria-label="Status ändern">${completed[t.id]?'✓':''}</button><div><div class="task-meta"><span class="urg ${t.urgency}">${completed[t.id]?'Erledigt':urgencyLabel(t.urgency)}</span><span>${esc(t.badge||'')}</span></div><h3>${esc(t.title)}</h3><p>${esc(t.why)}</p><div class="task-actions"><button class="linkbtn" data-packet="${t.id}">Paket vorbereiten</button><a href="${t.apply||t.source}" target="_blank" rel="noopener">Offizielle Stelle ↗</a><a href="${t.source}" target="_blank" rel="noopener">Quelle</a></div></div></article>`).join('');
  $$('[data-done]').forEach(b=>b.onclick=()=>{completed[b.dataset.done]=!completed[b.dataset.done];write(DONE,completed);renderAll()});
  $$('[data-packet]').forEach(b=>b.onclick=()=>openPacket(b.dataset.packet));
}

function renderPackets(){
  const plan=buildPlan(profile);const packets=plan.map(t=>({task:t,packet:buildPacket(t.id,profile,vaultData||{})}));
  let occurrences=0;packets.forEach(x=>occurrences+=x.packet.fields.filter(f=>f.value).length);
  const unique=new Set(packets.flatMap(x=>x.packet.fields.filter(f=>f.value).map(f=>f.key))).size;
  $('#reuseStats').innerHTML=`<strong>${occurrences}</strong><span>vorbereitete Feldnutzungen aus <b>${unique}</b> einmal gespeicherten Angaben</span>`;
  $('#packetGrid').innerHTML=packets.map(({task,packet:p})=>`<article class="packet-card"><div class="packet-top"><span>${esc(task.badge||p.category)}</span><b>${p.coverage.percent}% vorbereitet</b></div><h3>${esc(p.title)}</h3><div class="meter"><i style="width:${p.coverage.percent}%"></i></div><p>${p.coverage.missing.length?`${p.coverage.missing.length} Pflichtangaben im Paket fehlen noch.`:'Die gemeinsamen Pflichtangaben im Paket sind vorhanden.'}</p><button class="secondary" data-packet="${task.id}">${p.generatedText?'Fertige Mitteilung öffnen':'Paket öffnen'}</button></article>`).join('');
  $$('[data-packet]').forEach(b=>b.onclick=()=>openPacket(b.dataset.packet));
}

function renderEvidence(){
  const plan=buildPlan(profile),items=allEvidence(plan,profile,vaultData||{});const done=items.filter(x=>evidenceState[x.id]).length;
  $('#evidenceSummary').textContent=`${done}/${items.length} Nachweise als vorhanden markiert`;
  $('#evidenceList').innerHTML=items.length?items.map(x=>`<label class="evidence ${evidenceState[x.id]?'done':''}"><input type="checkbox" data-evidence="${x.id}" ${evidenceState[x.id]?'checked':''}><span><b>${esc(x.label)}</b><small>Relevant für: ${x.services.map(esc).join(', ')}</small></span></label>`).join(''):'<p>Für diesen Plan sind keine zusätzlichen Nachweis-Hinweise hinterlegt.</p>';
  $$('[data-evidence]').forEach(c=>c.onchange=()=>{evidenceState[c.dataset.evidence]=c.checked;write(EVIDENCE,evidenceState);renderEvidence()});
}

function renderVault(){
  const host=$('#vaultHost');
  if(!vaultExists()){
    host.innerHTML=`<div class="vault-intro"><div><div class="micro">Optional · nur wenn ihr Wiederverwendung wollt</div><h2>Einmal eingeben. Für mehrere Anträge wiederverwenden.</h2><p>Der Guide funktioniert ohne persönliche Daten. Für Antragspakete könnt ihr zusätzlich einen lokalen Tresor anlegen. Er wird mit eurer Passphrase per AES-GCM verschlüsselt im Browser gespeichert.</p></div><div class="security"><b>Wichtig</b><p>Das ist kein amtliches Wallet. Speichert hier keine Dokumentdateien. Wer Zugriff auf Gerät + Passphrase hat, kann die Daten entschlüsseln.</p></div></div><form id="createVault" class="vault-form"><label>Neue Passphrase <input name="passphrase" type="password" minlength="8" required autocomplete="new-password" placeholder="mindestens 8 Zeichen"></label>${vaultFields.map(vaultField).join('')}<button class="primary" type="submit">Verschlüsselt speichern</button></form>`;
    $('#createVault').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target),pass=fd.get('passphrase');const data={};vaultFields.forEach(([k])=>data[k]=fd.get(k)||'');try{await saveVault(pass,data);vaultPassphrase=pass;vaultData=data;toast('Lokaler Tresor gespeichert');renderAll()}catch(err){toast(err.message)}};
    return;
  }
  if(!vaultData){const info=vaultInfo();host.innerHTML=`<div class="vault-lock"><div><div class="micro">Lokaler Datentresor</div><h2>Gesperrt 🔒</h2><p>${info?.cipher||'AES-GCM'} · eure Passphrase verlässt dieses Gerät nicht.</p></div><form id="unlockVault"><input name="passphrase" type="password" required autocomplete="current-password" placeholder="Passphrase"><button class="primary">Entsperren</button></form><button class="danger-link" id="deleteVault">Tresor löschen</button></div>`;
    $('#unlockVault').onsubmit=async e=>{e.preventDefault();try{vaultPassphrase=new FormData(e.target).get('passphrase');vaultData=await loadVault(vaultPassphrase);toast('Tresor entsperrt');renderAll()}catch(err){vaultPassphrase=null;toast(err.message)}};
    $('#deleteVault').onclick=()=>{if(confirm('Verschlüsselten Tresor auf diesem Gerät wirklich löschen?')){clearVault();vaultData=null;vaultPassphrase=null;renderAll()}};return;
  }
  host.innerHTML=`<div class="vault-intro"><div><div class="micro">Entsperrt · lokal</div><h2>Eure wiederverwendbaren Angaben</h2><p>Ändert eine Angabe hier einmal; alle Antragspakete werden sofort neu vorbereitet.</p></div><button class="secondary" id="lockVault">Tresor sperren</button></div><form id="saveVault" class="vault-form">${vaultFields.map(([k,l,t])=>vaultField([k,l,t],vaultData[k]||'')).join('')}<button class="primary" type="submit">Änderungen verschlüsselt speichern</button></form>`;
  $('#lockVault').onclick=()=>{vaultData=null;vaultPassphrase=null;renderAll()};
  $('#saveVault').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target),data={};vaultFields.forEach(([k])=>data[k]=fd.get(k)||'');await saveVault(vaultPassphrase,data);vaultData=data;toast('Gespeichert und in allen Paketen aktualisiert');renderAll()};
}
function vaultField([k,l,t],v=''){return`<label>${esc(l)} <input name="${k}" type="${t}" value="${escAttr(v)}" autocomplete="off"></label>`}

function openPacket(taskId){
  const p=buildPacket(taskId,profile,vaultData||{});const d=$('#packetDialog');
  $('#packetTitle').textContent=p.title;$('#packetNote').textContent=p.note;
  $('#packetCoverage').textContent=`${p.coverage.percent}% vorbereitet · ${p.coverage.filled}/${p.coverage.total} gemeinsame Pflichtangaben vorhanden`;
  $('#packetFields').innerHTML=p.fields.map(f=>`<div class="packet-field ${!f.value&&f.required?'missing':''}"><span>${esc(f.label)}${f.required?' *':''}</span><b>${f.value?esc(f.value):'noch nicht im Tresor'}</b>${f.value?`<button data-copy="${escAttr(f.value)}">kopieren</button>`:''}</div>`).join('');
  $('#packetDocs').innerHTML=p.documents.length?'<h4>Nachweise / Unterlagen im Blick behalten</h4>'+p.documents.map(x=>`<div>□ ${esc(x)}</div>`).join(''):'<p>Keine zusätzlichen Unterlagen-Hinweise in diesem Paket.</p>';
  $('#generatedText').innerHTML=p.generatedText?`<h4>Fertige Mitteilung</h4><textarea readonly>${esc(p.generatedText)}</textarea><button class="secondary" id="copyGenerated">Text kopieren</button>`:'';
  $('#officialHandoff').href=p.officialUrl||'#';$('#officialHandoff').style.display=p.officialUrl?'inline-flex':'none';
  $('#copyPacket').onclick=()=>copyText(p.fields.filter(f=>f.value).map(f=>`${f.label}: ${f.value}`).join('\n'));
  $$('[data-copy]').forEach(b=>b.onclick=()=>copyText(b.dataset.copy));if(p.generatedText)$('#copyGenerated').onclick=()=>copyText(p.generatedText);
  d.showModal();
}

function activateTab(name){$$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));$$('.tab-panel').forEach(p=>p.hidden=p.id!==`tab-${name}`);if(name==='vault')renderVault();if(name==='packets')renderPackets();if(name==='evidence')renderEvidence()}
function resetPlan(){if(confirm('Guide-Antworten und Fortschritt auf diesem Gerät zurücksetzen? Der verschlüsselte Tresor bleibt erhalten.')){profile=null;completed={};evidenceState={};localStorage.removeItem(PROFILE);localStorage.removeItem(DONE);localStorage.removeItem(EVIDENCE);showIntake()}}
async function shareApp(){try{await navigator.clipboard.writeText(location.origin+location.pathname);toast('Öffentlicher Link kopiert — ohne eure Daten')}catch{toast('Link: '+location.href)}}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast('Kopiert')}catch{toast('Kopieren nicht möglich')}}
function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2200)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function escAttr(s){return esc(s).replace(/`/g,'&#096;')}
init();
