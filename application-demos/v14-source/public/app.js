// RETURN LOOP v14 • UI is intentionally honest: model numbers appear only after real calls.
const $=id=>document.getElementById(id);
const CLASSES=['quality','fit','shipping','return','order_issue','other'];
const NAMES={quality:'Produktqualität',fit:'Grösse & Passform',shipping:'Versand',return:'Retoure',order_issue:'Falsche / fehlende Ware',other:'Sonstiges'};
const MODELS=[{id:'rules',name:'Keyword baseline',desc:'Kostenlos · deterministisch',meta:'Keine KI · stets verfügbar'},{id:'decisions',name:'OpenAI Decisions · Experiment',desc:'Experimentelle Integration · noch nicht verifiziert',meta:'OpenAI · echte API'},{id:'jev',name:'TypeSafe Jev 1.14',desc:'Strukturierte Jev-Entscheidungen · geschützter Live-Test',meta:'TypeSafe direct API / OpenRouter'},{id:'llm',name:'Generatives LLM',desc:'Structured Outputs · mehrere Anliegen',meta:'OpenAI Responses API'}];
const PRIVACY_NOTE='Synthetische Testdaten; keine Kundennachrichten oder Shop-Aktionen.';
let fullStudy=null,qualityAudit=null;
const studyRow=id=>fullStudy?.rows?.find(x=>x.id===id&&x.status==='ok');
const auditFlags=id=>qualityAudit?.flagged_cases?.find(x=>x.id===id)?.flags||[];
let inboxExpanded=false;
const replyDrafts={};
const replySources={};
let fixtures=[],selected='RL-301',results={},reviews={},busy='',threshold=.5,access='',live={paid_requests_enabled:false,providers:{}},calls=0;
try{reviews=JSON.parse(localStorage.getItem('return-loop-v14-reviews')||'{}')}catch{}
const baseline=text=>{let s=text.toLocaleLowerCase('de-DE'),hits=[];if(/loch|löcher|naht|gerissen|faden|franst|dünn|defekt|reißverschluss|verfärbt|kratzt|verarbeitung/.test(s))hits.push('quality');if(/zu klein|zu groß|passt mir nicht|sitzt|größe|grösse/.test(s))hits.push('fit');if(/paket|tracking|versand|zustell|verteilzentrum/.test(s))hits.push('shipping');if(/retoure|rücksendung|etikett|umtausch|widerruf|erstattung|rückzahlung/.test(s))hits.push('return');return hits.length?hits:['other']};
const el=(tag,cls,content)=>{let n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n};
const fmt=(n)=>Number.isFinite(n)?n.toFixed(2):'—';
function evaluate(rows){let byClass={};for(let c of CLASSES){let tp=0,fp=0,fn=0;for(let row of rows){let a=row.gold.includes(c),p=row.pred.includes(c);if(a&&p)tp++;if(!a&&p)fp++;if(a&&!p)fn++;}let prec=tp+fp?tp/(tp+fp):null,rec=tp+fn?tp/(tp+fn):null;byClass[c]={tp,fp,fn,precision:prec,recall:rec,f1:prec===null||rec===null||prec+rec===0?0:2*prec*rec/(prec+rec)};}return{n:rows.length,macroF1:CLASSES.reduce((a,c)=>a+byClass[c].f1,0)/CLASSES.length,qualityFN:byClass.quality.fn,byClass};}
const predicted=(p,model)=>model==='decisions'||model==='jev'?CLASSES.filter(c=>Number(p.scores?.[c])>=threshold):p.categories||[];
const record=()=>fixtures.find(c=>c.id===selected);
function renderInsights(){
 const x=record();if(!x)return;
 const actual=baseline(x.text),expected=x.gold||[];
 const observed=studyRow(x.id);
 $('live-proof').hidden=!observed;
 if(observed){
  $('proof-case').textContent='Echter API-Test · '+x.id+' · archiviert';
  $('proof-categories').textContent=(observed.llm||[]).map(c=>NAMES[c]||c).join(' + ');
  $('proof-evidence').textContent=observed.evidence_valid?'Beleg aus Originalnachricht: „'+observed.evidence+'“':'Kein belegtes Originalzitat';
  const agrees=observed.llm?.length===x.gold.length&&x.gold.every(c=>observed.llm.includes(c));
  $('proof-meta').textContent='OpenAI Responses API · '+observed.latency_ms+' ms · '+(agrees?'Stimmt mit dem menschlichen Testlabel überein.':'Abweichung vom menschlichen Testlabel – Prüfung nötig.')+' Vorher gemessen, kein neuer Live-Aufruf.';
 }
 $('insight-labels').replaceChildren(...expected.map(c=>el('span','insight-tag',NAMES[c]||c)));
 const missed=expected.filter(c=>!actual.includes(c));
 const extra=actual.filter(c=>!expected.includes(c));
 const quality=expected.includes('quality');
 const multiple=expected.length>1;
 $('insight-text').textContent=multiple?'Diese Nachricht enthält mehrere Anliegen. Eine einzige Kategorie wäre unvollständig.':quality?'Hier könnte ein Qualitätsproblem stecken. Das ist ein Hinweis, noch kein bestätigter Produktfehler.':'Diese Nachricht sollte an das passende Support-Thema weitergegeben werden.';
 $('simple-result').textContent=actual.map(c=>NAMES[c]||c).join(' + ');
 $('gap-message').textContent=missed.length?'Die einfache Regel übersieht hier: '+missed.map(c=>NAMES[c]||c).join(' + ')+'. Genau solche Fälle möchten wir besser erkennen.':extra.length?'Die Regel fügt ein möglicherweise unpassendes Thema hinzu: '+extra.map(c=>NAMES[c]||c).join(' + ')+'.':'Für diesen Fall stimmen Stichwortsuche und menschliche Kennzeichnung überein. KI muss hier erst einen zusätzlichen Nutzen beweisen.';
 $('handoff-message').textContent=quality?'Support sollte das Anliegen klären und den möglichen Qualitätshinweis menschlich prüfen. Keine automatische Fehlerbestätigung.':multiple?'Support sollte alle Teilanliegen prüfen und die jeweils zuständige Bearbeitung vorbereiten.':'Die Nachricht sollte menschlich geprüft und passend beantwortet werden. Keine automatische Shopaktion.';
 $('case-context').textContent=x.id+' · synthetisch';
}
const productGroup=x=>x.sku?.startsWith('SOCK-3-BLK')?'Everyday Socks · Black':x.sku?.startsWith('SOCK-3-NVY')?'Everyday Socks · Navy':x.product||'Anderes Produkt';
function renderInbox(){
 const filter=$('inbox-filter').value;
 const items=fixtures.filter(x=>{
  if(filter==='quality')return x.gold.includes('quality');
  if(filter==='multiple')return x.gold.length>1;
  if(filter==='missed')return x.gold.some(c=>!baseline(x.text).includes(c));
  if(filter==='reviewed')return !!reviews[x.id];
  return true;
 });
 const visible=inboxExpanded?items:items.slice(0,6);
 $('inbox-count').textContent=String(items.length);
 $('inbox-visible-count').textContent=visible.length+' von '+items.length+' Nachrichten';
 $('inbox-show-more').hidden=items.length<=6;
 $('inbox-show-more').textContent=inboxExpanded?'Weniger anzeigen ↑':'Weitere '+Math.max(0,items.length-6)+' anzeigen ↓';
 $('inbox-list').replaceChildren(...visible.map(x=>{
  const b=el('button','inbox-ticket');b.type='button';b.setAttribute('aria-pressed',String(x.id===selected));
  const top=el('span','inbox-ticket-top');top.append(el('strong','',x.id+' · '+x.product),el('small','',x.day||'Beispiel'));
  b.append(top,el('span','inbox-message',x.text));
  const meta=el('span','inbox-ticket-meta');
  meta.append(el('span','',x.gold.map(c=>NAMES[c]).join(' · ')));
  if(reviews[x.id])meta.append(el('b','','✓ dokumentiert'));
  else if(x.gold.some(c=>!baseline(x.text).includes(c)))meta.append(el('b','missed-note','Regel übersieht Hinweis'));
  b.append(meta);
  b.addEventListener('click',()=>{choose(x.id);$('case-number').scrollIntoView({behavior:'smooth',block:'center'});});
  return b;
 }));
}
function handoffData(x){
 const decision=reviews[x.id]?.decision||$('review-decision').value;
 const actions={manual:'Menschliche Prüfung anfordern',quality:'Produktqualität informieren (Notiz)',support:'Support-Nachfrage vorbereiten',none:'Kein zusätzliches Produktsignal'};
 const actual=baseline(x.text);
 const misses=x.gold.filter(c=>!actual.includes(c));
 return {id:x.id,product:x.product,sku:x.sku,message:x.text,
  signals:x.gold.map(c=>NAMES[c]||c),label_source:'Manuell gekennzeichnetes synthetisches Entwicklungsbeispiel – keine KI-Prognose',
  rule_result:actual.map(c=>NAMES[c]||c),missed_by_rules:misses.map(c=>NAMES[c]||c),
  human_decision:reviews[x.id]?actions[decision]:'Noch nicht dokumentiert',
  recommended_checks:x.gold.includes('quality')?'Kundenanliegen prüfen; mögliche Produktqualität dokumentieren; keine Ursache behaupten.':x.gold.length>1?'Beide Anliegen klären; Bearbeitung vorbereiten.':'Nachricht und passenden Support-Prozess prüfen.',
  limits:'Keine echte Bestellung, kein Kundenkonto, keine Rückerstattung, keine externe Mitteilung'};
}
function renderHandoff(){
 const x=record();if(!x)return;const d=handoffData(x);
 const lines=[['Fall',d.id+' · '+d.product],['Nachricht',d.message],['Relevante Hinweise',d.signals.join(' + ')],['Zu prüfen',d.recommended_checks],['Deine Entscheidung',d.human_decision]];
 $('handoff-content').replaceChildren(...lines.map(([k,v])=>{const row=el('div','handoff-row');row.append(el('span','',k),el('strong','',v));return row}));
}
function downloadHandoff(){
 const d=handoffData(record());
 const text=['RETURN LOOP · VORBEREITETE SUPPORT-ÜBERGABE','SYNTHEthisCHE DEMO – KEINE SHOPAKTION','',
 'Fall: '+d.id,'Produkt: '+d.product,'SKU: '+d.sku,'','Kundennachricht: '+d.message,'',
 'Manuelle Hinweise: '+d.signals.join(', '),'Regelbaseline: '+d.rule_result.join(', '),
 'Von der Regel übersehen: '+(d.missed_by_rules.join(', ')||'keine'),'',
 'Empfohlene Prüfung: '+d.recommended_checks,'Menschliche Entscheidung: '+d.human_decision,'',
 'Quelle: '+d.label_source,'Grenzen: '+d.limits].join('\n').replace('SYNTHEthisCHE','SYNTHETISCHE');
 const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='return-loop-uebergabe-'+d.id+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function renderSignals(){
 const groups=new Map();
 for(const x of fixtures){
  const key=productGroup(x);
  const g=groups.get(key)||{name:key,total:0,quality:0,ids:[],missed:0};
  g.total++;if(x.gold.includes('quality')){g.quality++;g.ids.push(x.id);if(!baseline(x.text).includes('quality'))g.missed++;}
  groups.set(key,g);
 }
 const data=[...groups.values()].filter(g=>g.quality>0).sort((a,b)=>b.quality-a.quality||b.total-a.total);
 $('signal-summary').textContent=fixtures.filter(x=>x.gold.includes('quality')).length+' mögliche Qualitätshinweise';
 $('signal-board').replaceChildren(...data.map(g=>{
  const item=el('div','signal-item');
  const head=el('div','signal-head');head.append(el('strong','',g.name),el('span','',g.quality+' von '+g.total+' Beispielen mit Qualitätshinweis'));
  item.append(head,el('div','signal-meter'));item.lastChild.append(el('span'));item.lastChild.firstChild.style.width=(g.quality/g.total*100)+'%';
  item.append(el('p','',g.missed?g.missed+' Hinweis(e) dieser Gruppe übersieht die einfache Regel.':'In diesen Beispielen erkennt die Regel die Qualitätshinweise.'));
  const btn=el('button','subtle-btn','Fälle dieser Gruppe anzeigen ↗');btn.type='button';
  btn.addEventListener('click',()=>{$('inbox-filter').value='quality';renderInbox();choose(g.ids[0]);$('workspace').scrollIntoView({behavior:'smooth'});});
  item.append(btn);return item;
 }));
}
function templateReply(x){
 const labels=x.gold||[];
 let message;
 if(labels.includes('quality')&&labels.includes('return'))message='Das klingt ärgerlich. Wir möchten sowohl den Artikel als auch deinen Rückgabewunsch prüfen. Könntest du uns ein Foto der betroffenen Stelle schicken? Dann klären wir gemeinsam die nächsten Schritte.';
 else if(labels.includes('quality'))message='Das klingt ärgerlich. Danke, dass du uns darauf aufmerksam machst. Könntest du uns ein Foto der betroffenen Stelle schicken? Wir schauen uns den Hinweis an und klären die nächsten Schritte.';
 else if(labels.includes('shipping'))message='Wir verstehen, dass du Klarheit zur Lieferung möchtest. Wir würden den Versandstatus gern prüfen. Falls noch nicht übermittelt, nenne uns bitte die Bestellnummer, damit wir den Fall zuordnen können.';
 else if(labels.includes('order_issue'))message='Es tut uns leid, dass die Lieferung nicht wie erwartet angekommen ist. Wir würden das gern überprüfen. Magst du uns kurz sagen, was genau fehlt oder welcher Artikel angekommen ist?';
 else if(labels.includes('return'))message='Gern schauen wir uns deinen Rückgabe- oder Erstattungswunsch an. Wir prüfen die Angaben zum Fall und melden uns mit den nächsten Schritten. Eine Entscheidung ist damit noch nicht getroffen.';
 else if(labels.includes('fit'))message='Vielen Dank für deine Rückmeldung zur Passform. Wir helfen dir gern dabei, die richtige Größe beziehungsweise eine mögliche Lösung zu finden. Magst du uns kurz erläutern, wo der Artikel nicht gut sitzt?';
 else if(x.sub==='positive_feedback')message='Es freut uns sehr, dass du eine gute Erfahrung gemacht hast. Vielen Dank, dass du dir die Zeit für diese Nachricht genommen hast!';
 else message='Wir kümmern uns gern um dein Anliegen. Wir prüfen deine Nachricht und geben dir eine passende Rückmeldung.';
 return 'Hallo,\n\nvielen Dank für deine Nachricht. '+message+'\n\nViele Grüße\nDein Support-Team';
}
function renderReply(){
 const x=record();if(!x)return;
 if(!Object.prototype.hasOwnProperty.call(replyDrafts,x.id)){
  const recorded=studyRow(x.id);
  if(recorded?.draft_present&&typeof recorded.draft_reply==='string'){
   replyDrafts[x.id]=recorded.draft_reply;
   replySources[x.id]=auditFlags(x.id).length?'⚠ Echt generierter KI-Entwurf · unbelegte Aussagen prüfen':'Echt generierter KI-Entwurf · menschliche Prüfung nötig';
  }else replyDrafts[x.id]=templateReply(x);
 }
 $('reply-text').value=replyDrafts[x.id];
 $('reply-source').textContent=replySources[x.id]||'Textvorlage · keine KI-Ausgabe';
 const flags=Array.isArray(results[x.id]?.llm?.draft_flags)?results[x.id].llm.draft_flags:auditFlags(x.id);
 $('reply-reviewed').checked=false;$('copy-reply').disabled=true;
 $('reply-draft').classList.toggle('risky',flags.length>0);
 $('reply-status').textContent=flags.length?'⚠ '+flags.length+' mögliche unbelegte Aussage(n). Vor Freigabe prüfen und korrigieren.':'Entwurf noch nicht freigegeben. Es wird nichts versendet.';
}
async function copyReply(){
 if(!$('reply-reviewed').checked){$('reply-status').textContent='Bitte Ton, Fakten und Zusagen prüfen und die Freigabe markieren.';return;}

 const value=$('reply-text').value;
 try{
  if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(value);
  else{$('reply-text').focus();$('reply-text').select();if(!document.execCommand('copy'))throw Error('copy_not_supported');}
  $('reply-status').textContent='✓ Antwortentwurf kopiert. Bitte vor dem Versenden prüfen.';
 }catch{$('reply-status').textContent='Kopieren nicht möglich. Du kannst den Text direkt markieren und kopieren.';}
}
function renderCase(){let x=record();if(!x)return;$('case-number').textContent=x.id;$('product-name').textContent=x.product;$('product-sku').textContent=x.sku;$('ticket-message').textContent='“'+x.text+'”';
 const suggested=[fixtures[0],fixtures[7],fixtures[13],fixtures[16]].filter(Boolean);
 $('case-picker').replaceChildren(...suggested.map(c=>{let b=el('button','ticket-tile');b.type='button';b.setAttribute('aria-pressed',String(selected===c.id));b.append(el('strong','',c.id),el('span','',c.preview||shortType(c)));b.addEventListener('click',()=>choose(c.id));return b}));renderInsights();renderModels();renderHandoff();renderInbox();renderReply();$('review-message').textContent=reviews[selected]?'✓ Bereits lokal dokumentiert':''}
function shortType(c){return c.id==='RL-301'?'Vorzeitige Abnutzung':c.gold.length>1?'Mehrere Anliegen':NAMES[c.gold[0]]||'Anderes Anliegen'}
function choose(id){selected=id;renderCase();$('run-status').textContent='';}
function renderModels(){let x=record();if(!x)return;$('models').replaceChildren(...MODELS.map(m=>{let box=el('div','model');let lead=el('div','');lead.append(el('div','model-name',m.name),el('div','model-desc',m.desc));let btn=el('button','model-btn',m.id==='rules'?'Anzeigen':results[x.id]?.[m.id]?'Erneut prüfen':'Jetzt testen');btn.type='button';btn.disabled=!!busy||(m.id!=='rules'&&(!live.paid_requests_enabled||live.providers?.[m.id]!==true));btn.title=m.id!=='rules'&&live.providers?.[m.id]!==true?'Anbieter derzeit nicht verbunden':m.id!=='rules'&&!live.paid_requests_enabled?'Live-Tests benötigen autorisierten Zugang':'';btn.addEventListener('click',()=>run(m.id));box.append(lead,btn);const result=results[x.id]?.[m.id];if(m.id==='rules'){box.classList.add('ready');box.append(el('div','model-result','Regelergebnis: '+baseline(x.text).map(c=>NAMES[c]).join(' + ')+' · 0 API-Aufrufe'));}else if(result?.ok){box.classList.add('ready');let cap=predicted(result,m.id).map(c=>NAMES[c]).join(' + ')||'Keine Kategorie über Schwelle';let detail=m.id==='llm'?` · ${result.evidence?'Beleg: „'+result.evidence+'“':'Kein gültiges Textzitat'}`:` · Scores: ${Object.entries(result.scores||{}).filter(([k,v])=>Number(v)>.25).map(([k,v])=>NAMES[k]+' '+Math.round(v*100)+'%').join(', ')}`;box.append(el('div','model-result',cap+detail+` · ${result.latency_ms} ms`));}else{box.append(el('div','model-result',live.providers?.[m.id]!==true?'Anbieter derzeit nicht verbunden – keine Vorhersage.':live.paid_requests_enabled?'Nicht ausgeführt. Optionaler geschützter Live-Test.':'Nicht getestet. Öffentliche Demo benötigt keine API-Kosten.'));}return box;}));}
async function run(model){if(model==='rules'){showStatus('Regelbaseline lokal berechnet – keine Modellkosten.');return;}if(!live.paid_requests_enabled||live.providers?.[model]!==true){showStatus('Dieser Live-Anbieter ist nicht freigeschaltet. Keine Modellvorhersage.');return;}if(!access){$('access-form').hidden=false;$('toggle-access').setAttribute('aria-expanded','true');$('token').focus();showStatus('Bitte zunächst das private Demo-Passwort eingeben.');return;}
 busy=model;renderModels();showStatus('Prüfe '+model+' über das Backend …');let id=selected;
 try{const r=await fetch('/api/infer',{method:'POST',headers:{'Content-Type':'application/json','X-Demo-Token':access},body:JSON.stringify({id,model})});const data=await r.json();if(!r.ok)throw Error(data.error||'HTTP '+r.status);results[id]??={};results[id][model]=data;if(model==='llm'&&typeof data.draft_reply==='string'&&data.draft_reply.trim()){replyDrafts[id]=data.draft_reply.trim();replySources[id]=data.draft_flags?.length?'⚠ Live-KI-Entwurf: potenziell unbelegte Aussagen':'Echter Live-KI-Entwurf · menschliche Freigabe nötig';if(selected===id)renderReply();}calls++;$('trial-count').textContent=calls+' real calls';if(model==='llm'&&PAIRED_IDS.includes(id))savePairedResults();showStatus('✓ Echte '+model+'-Antwort · '+data.latency_ms+' ms · Ergebnis nur in dieser Sitzung.');renderEvaluation();renderPaired();return true;}catch(e){showStatus('Kein gültiges Modellresultat: '+e.message+'. Nichts wurde als korrekt gewertet.');return false;}finally{busy='';renderModels();}}
function showStatus(txt){$('run-status').textContent=txt;}
function renderEvaluation(){const baselineRows=fixtures.map(c=>({gold:c.gold,pred:baseline(c.text)}));const sc=evaluate(baselineRows);$('baseline-f1').textContent=fmt(sc.macroF1);$('baseline-fn').textContent=sc.qualityFN+' / '+fixtures.filter(c=>c.gold.includes('quality')).length;
 const out=[{name:'Keyword rules',metric:sc.macroF1,n:fixtures.length}];let complete=0,covered=0;
 for(let m of MODELS.slice(1)){if(m.id==='llm'&&fullStudy?.successful===fixtures.length){out.push({name:m.name+' · archivierter Live-Test',metric:fullStudy.llm_on_same_successful_cases.macro_f1,n:fixtures.length,archived:true});continue;}let rows=fixtures.filter(c=>results[c.id]?.[m.id]?.ok).map(c=>({gold:c.gold,pred:predicted(results[c.id][m.id],m.id)}));if(rows.length===fixtures.length){let score=evaluate(rows);out.push({name:m.name,metric:score.macroF1,n:rows.length});complete++;}else out.push({name:m.name,metric:null,n:rows.length});if(m.id==='decisions'||m.id==='jev')covered+=rows.length;}
 $('leaderboard').replaceChildren(...out.map(r=>{let row=el('div','board-row');row.append(el('strong','',r.name));let bar=el('div','bar');if(r.metric!==null){let inner=el('span');inner.style.width=(r.metric*100).toFixed(1)+'%';bar.append(inner);}row.append(bar,el('small','',r.metric===null?`${r.n}/${fixtures.length} getestet`:`${Math.round(r.metric*100)}% · ${r.n}/${fixtures.length}${r.archived?' · archiviert':''}`));return row;}));
 const observed=fixtures.flatMap(c=>['decisions','jev'].filter(m=>results[c.id]?.[m]?.ok).map(m=>({gold:c.gold,pred:predicted(results[c.id][m],m),model:m})));$('threshold-note').textContent=observed.length===0?'Noch keine echten Decision-Scores gemessen. Der Regler beeinflusst deshalb keine Modellvorhersagen.':`Schwelle ${Math.round(threshold*100)}% · ${observed.length} echte Decision-Prognosen auf bekannten Entwicklungsfällen. Für faire Modellvergleiche werden Kennzahlen erst bei vollständiger Abdeckung (24/24 je Modell) veröffentlicht.`;
}

const PAIRED_IDS=['RL-301','RL-302','RL-308','RL-309','RL-314','RL-316','RL-317','RL-324'];
const PAIRED_STORAGE_KEY='return-loop-v14-real-llm-evaluation';
let pairedBatchRunning=false,pairedBatchCancel=false,pairedStatus='';
const exactMatch=(gold,pred)=>gold.length===pred.length&&gold.every(c=>pred.includes(c));
const pairedCases=()=>PAIRED_IDS.map(id=>fixtures.find(x=>x.id===id)).filter(Boolean);
const pairedDone=()=>pairedCases().filter(x=>results[x.id]?.llm?.ok);
function savePairedResults(){
 try{
  const entries=Object.fromEntries(pairedCases().filter(x=>results[x.id]?.llm?.ok).map(x=>[x.id,{llm:results[x.id].llm}]));
  localStorage.setItem(PAIRED_STORAGE_KEY,JSON.stringify({version:1,savedAt:new Date().toISOString(),entries}));
 }catch(e){$('paired-note').textContent='Ergebnisse nur in dieser Sitzung gespeichert. Bitte Bericht herunterladen.';}
}
function loadPairedResults(){
 try{
  const saved=JSON.parse(localStorage.getItem(PAIRED_STORAGE_KEY)||'null');
  if(!saved||saved.version!==1)return;
  for(const x of pairedCases()){
   const r=saved.entries?.[x.id]?.llm;
   if(r?.ok===true&&r.id===x.id&&Array.isArray(r.categories)&&typeof r.latency_ms==='number'){
    results[x.id]??={};results[x.id].llm=r;
    if(typeof r.draft_reply==='string'&&r.draft_reply.trim()){
     replyDrafts[x.id]=r.draft_reply;
     replySources[x.id]='Echter KI-Entwurf · menschliche Freigabe nötig';
    }
   }
  }
 }catch(e){/* Fail closed: corrupt local cache is ignored. */}
}
function pairedSummary(done){
 const rows=done.map(x=>({item:x,model:results[x.id].llm,base:baseline(x.text)}));
 const calc=which=>{
  let missed=0,alarms=0,exact=0,review=0;
  for(const r of rows){
   const pred=which==='rules'?r.base:r.model.categories;
   if(r.item.gold.includes('quality')&&!pred.includes('quality'))missed++;
   if(!r.item.gold.includes('quality')&&pred.includes('quality'))alarms++;
   if(exactMatch(r.item.gold,pred))exact++;
   if(which==='rules'?(pred.includes('quality')||pred.length>1):r.model.review)review++;
  }
  return {missed,alarms,exact,review};
 };
 const latencies=rows.map(r=>r.model.latency_ms).filter(Number.isFinite);
 const totalTokens=rows.reduce((sum,r)=>sum+(r.model.usage?.input_tokens||0)+(r.model.usage?.output_tokens||0),0);
 return {n:rows.length,baseline:calc('rules'),llm:calc('llm'),
  evidence:rows.filter(r=>r.model.evidence&&r.item.text.includes(r.model.evidence)).length,
  drafts:rows.filter(r=>typeof r.model.draft_reply==='string'&&r.model.draft_reply.trim()).length,
  mean_latency_ms:latencies.length?Math.round(latencies.reduce((a,b)=>a+b,0)/latencies.length):null,
  tokens:totalTokens,
  rows};
}
function renderPaired(){
 const done=pairedDone();
 const total=PAIRED_IDS.length;
 $('paired-progress').textContent=pairedStatus||done.length+' von '+total+' Fällen mit echter KI geprüft. '+(done.length===total?'Alle ausgewählten Fälle gemessen.':'');
 $('paired-next').disabled=pairedBatchRunning||!!busy||done.length===total||!live.paid_requests_enabled||!live.providers?.llm;
 $('paired-next').textContent=done.length===total?'Alle acht Fälle geprüft ✓':'Einen Fall testen ↗';
 $('paired-run-all').disabled=!!busy||(!pairedBatchRunning&&(done.length===total||!live.paid_requests_enabled||!live.providers?.llm));
 $('paired-run-all').textContent=pairedBatchRunning?'Messung läuft …':done.length?'Übrige '+(total-done.length)+' Fälle mit KI testen ↗':'Acht Fälle mit echter KI testen ↗';
 $('paired-cancel').hidden=!pairedBatchRunning;
 $('paired-download').disabled=done.length===0;
 if(!done.length){$('paired-results').textContent='Noch keine eigenen Wiederholungstests. Die Ergebnisse aus 24 echten KI-Aufrufen sind oben dokumentiert.';return;}
 const stats=pairedSummary(done),container=el('div','paired-metrics');
 const metricRows=[
  ['Alle Anliegen korrekt erkannt',stats.baseline.exact+' / '+stats.n,stats.llm.exact+' / '+stats.n],
  ['Qualitätshinweise übersehen',String(stats.baseline.missed),String(stats.llm.missed)],
  ['Falsche Qualitätsalarme',String(stats.baseline.alarms),String(stats.llm.alarms)],
  ['Vorgeschlagene menschliche Prüfungen',String(stats.baseline.review),String(stats.llm.review)]
 ];
 for(const [label,b,m] of metricRows){
  const row=el('div','paired-metric');
  row.append(el('strong','',label),el('span','','Regeln: '+b+' · KI: '+m));
  container.append(row);
 }
 const facts=el('p','paired-note','KI-Textbeleg aus Originalnachricht: '+stats.evidence+'/'+stats.n+' · KI-Antwortentwürfe: '+stats.drafts+'/'+stats.n+' · Ø Modellantwortzeit: '+(stats.mean_latency_ms===null?'—':stats.mean_latency_ms+' ms')+'.');
 const perCase=el('div','paired-case-list');
 for(const r of stats.rows){
  const ok=exactMatch(r.item.gold,r.model.categories);
  const row=el('div','paired-case');
  row.append(el('strong','',r.item.id+(ok?' ✓':' · prüfen')),el('span','',r.item.gold.map(c=>NAMES[c]||c).join(' + ')+' → KI: '+r.model.categories.map(c=>NAMES[c]||c).join(' + ')));
  perCase.append(row);
 }
 $('paired-results').replaceChildren(container,facts,perCase,el('p','paired-note','Explorative Messung an ausgewählten synthetischen Entwicklungsfällen. Keine unabhängige Validierung und keine gemessenen Zeitersparnisse. Review-Zahlen sind Policy-Empfehlungen.'));
}
async function pairedNext(){
 if(pairedBatchRunning)return;
 const next=PAIRED_IDS.find(id=>!results[id]?.llm?.ok);
 if(!next)return;
 if(!access){$('paired-note').textContent='Bitte das private Demo-Passwort oben eingeben. Noch kein kostenpflichtiger Aufruf.';$('paired-token').focus();return;}
 choose(next);pairedStatus='Prüfe '+next+' mit echter KI …';renderPaired();
 const ok=await run('llm');pairedStatus='';renderPaired();
 $('paired-note').textContent=ok?'Live-KI-Antwort erfolgreich; Ergebnis lokal gespeichert.':'Kein gültiges Modellresultat für '+next+'. Fehlermeldung im Technikbereich prüfen.';
}
async function pairedBatch(){
 if(pairedBatchRunning)return;
 if(!access){$('paired-note').textContent='Bitte zuerst das Demo-Passwort eingeben; noch keine API-Kosten.';$('paired-token').focus();return;}
 const missing=PAIRED_IDS.filter(id=>!results[id]?.llm?.ok);
 if(!missing.length)return;
 const approved=window.confirm('Jetzt '+missing.length+' echte kostenpflichtige OpenAI-Aufrufe starten? Nur synthetische Testfälle, keine Shopaktion. Jeder Fall wird maximal einmal aufgerufen; du kannst nach dem aktuellen Aufruf stoppen.');
 if(!approved)return;
 pairedBatchRunning=true;pairedBatchCancel=false;let failed=0;
 try{
  for(let i=0;i<missing.length;i++){
   if(pairedBatchCancel)break;
   const id=missing[i];choose(id);
   pairedStatus='Live-Test '+(i+1)+' / '+missing.length+': '+id+' … ('+pairedDone().length+'/8 erfolgreich)';
   renderPaired();
   const success=await run('llm');
   if(!success)failed++;
   pairedStatus='';
   renderPaired();
  }
 }finally{
  pairedBatchRunning=false;
  pairedStatus='';
  renderPaired();
  $('paired-note').textContent=pairedBatchCancel?'Gestoppt nach dem aktuellen Fall. Bereits gemessene Ergebnisse bleiben erhalten.':failed?'Testlauf beendet, '+failed+' Aufruf(e) ohne gültiges Modellresultat. Bericht enthält nur erfolgreiche Fälle.':'Testlauf beendet. Alle erfolgreichen Live-Antworten sind im Bericht enthalten.';
 }
}
function downloadPaired(){
 const done=pairedDone(),stats=pairedSummary(done);
 exportFile('return-loop-v14-reale-ki-auswertung.json',{
  project:'RETURN LOOP v14 – reale KI-Vergleichsmessung',
  created_at:new Date().toISOString(),
  design:'Fixed set of 8 preselected synthetic development cases; same cases for rules and LLM, not an independent holdout',
  n_successful:stats.n,n_selected:PAIRED_IDS.length,
  counts:{baseline:stats.baseline,llm:stats.llm,valid_quotes:stats.evidence,generated_drafts:stats.drafts,mean_latency_ms:stats.mean_latency_ms,token_usage_reported:stats.tokens},
  cases:stats.rows.map(r=>({
   id:r.item.id,product:r.item.product,message:r.item.text,human_labels:r.item.gold,
   rules_prediction:r.base,llm_prediction:r.model.categories,
   evidence:r.model.evidence||'',latency_ms:r.model.latency_ms,
   llm_model:r.model.model||null,draft_reply:r.model.draft_reply||null,
   human_review_recommended:!!r.model.review,usage:r.model.usage||null
  })),
  limitations:['Only preselected synthetic development data','AI results not independently audited','Draft replies require human approval','No real support integrations','No measured time savings','Costs require current provider pricing']
 });
}
function exportFile(name,obj){let blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function review(){let x=record();reviews[x.id]={decision:$('review-decision').value,at:new Date().toISOString(),basis:'synthetic',model_predictions:results[x.id]||{},note:'Manual demonstration only; no external action.'};try{localStorage.setItem('return-loop-v14-reviews',JSON.stringify(reviews))}catch{}$('review-message').textContent='✓ Entscheidung lokal dokumentiert – keine Shopaktion.';renderHandoff();renderInbox();}
function report(){let measured={};for(let m of MODELS.slice(1)){const r=fixtures.filter(c=>results[c.id]?.[m.id]?.ok);measured[m.id]={run_count:r.length,full_development_evaluation:r.length===fixtures.length?r.length:null,macro_f1:r.length===fixtures.length?evaluate(r.map(c=>({gold:c.gold,pred:predicted(results[c.id][m.id],m.id)}))).macroF1:null};}exportFile('return-loop-v14-model-arena-report.json',{project:'RETURN LOOP · Model Arena v14',created_at:new Date().toISOString(),dataset:'24 synthetic development fixtures — NOT independent external holdout',calibration:'None. Scores uncalibrated.',policy_threshold:threshold,baseline:evaluate(fixtures.map(c=>({gold:c.gold,pred:baseline(c.text)}))),models:measured,real_results:results,reviews,limitations:['No real customer data','Not a production quality rate','Thresholds not validated independently','No automated customer actions','Paid API limited to authenticated synthetic demo fixture calls']});}
async function init(){try{const embedded=document.getElementById('embedded-fixtures');if(embedded){fixtures=JSON.parse(embedded.textContent);}else{const response=await fetch('./fixtures.json',{cache:'no-store'});if(!response.ok)throw Error('Fixtures unavailable');fixtures=await response.json();}if(!Array.isArray(fixtures)||fixtures.length!==24)throw Error('Unexpected data length');}catch(e){$('run-status').textContent='Die lokalen synthetischen Fälle konnten nicht geladen werden.';return;}
 try{const r=await fetch('/api/status',{cache:'no-store'});if(!r.ok)throw Error('no backend');let v=await r.json();if(v.build!=='v14')throw Error('static preview');live=v;}catch{live={paid_requests_enabled:false,providers:{}}}
 try{
 const [studyResp,auditResp]=await Promise.all([fetch('./release-evaluation-full.json',{cache:'no-store'}),fetch('./release-quality-audit.json',{cache:'no-store'})]);
 if(studyResp.ok){const loaded=await studyResp.json();if(loaded.status==='complete'&&loaded.successful===24&&loaded.rows?.length===24)fullStudy=loaded;}
 if(auditResp.ok){const loaded=await auditResp.json();if(loaded.total_generated===24)qualityAudit=loaded;}
 }catch(e){/* Public demo still works offline with template answers. */}
 $('provider-badge').textContent=live.paid_requests_enabled?'Öffentliche Demo kostenlos · KI-Labor geschützt':'Öffentliche Demo kostenlos · Keine bezahlten Aufrufe';$('provider-badge').classList.toggle('ready',live.paid_requests_enabled);
 $('reply-text').addEventListener('input',e=>{replyDrafts[selected]=e.target.value;replySources[selected]=replySources[selected]||'Bearbeitete Textvorlage';$('reply-reviewed').checked=false;$('copy-reply').disabled=true;$('reply-status').textContent='Entwurf geändert. Bitte vor dem Kopieren erneut prüfen.';});
 $('reply-reviewed').addEventListener('change',e=>{$('copy-reply').disabled=!e.target.checked;});
 $('copy-reply').addEventListener('click',copyReply);
 $('open-ai-reply').addEventListener('click',()=>{$('tech-lab').open=true;$('tech-lab').scrollIntoView({behavior:'smooth',block:'center'});showStatus('Privater KI-Test: unter „Generatives LLM“ auf „Jetzt testen“ klicken. Falls erforderlich, vorher bei „Verbinden“ den Demo-Zugang eingeben. Der generierte Entwurf erscheint danach im Antwortfeld.');});
 $('open-evaluation').addEventListener('click',()=>{$('more').open=true;$('paired-study').scrollIntoView({behavior:'smooth',block:'start'});});
 $('proof-to-evaluation').addEventListener('click',()=>{$('more').open=true;$('paired-study').scrollIntoView({behavior:'smooth',block:'start'});});
 $('open-tech-lab').addEventListener('click',()=>{$('tech-lab').open=true;});
 $('paired-next').addEventListener('click',pairedNext);
 $('paired-run-all').addEventListener('click',pairedBatch);
 $('paired-cancel').addEventListener('click',()=>{pairedBatchCancel=true;$('paired-note').textContent='Stoppen angefordert. Der aktuelle Modellaufruf wird noch beendet.';});
 $('paired-download').addEventListener('click',downloadPaired);
 $('paired-token').addEventListener('input',e=>{access=e.target.value.trim();$('token').value=access;});
 $('inbox-filter').addEventListener('change',()=>{inboxExpanded=false;renderInbox();});$('inbox-show-more').addEventListener('click',()=>{inboxExpanded=!inboxExpanded;renderInbox();});$('download-handoff').addEventListener('click',downloadHandoff);renderSignals();
 $('next-case').addEventListener('click',()=>choose(fixtures[(fixtures.findIndex(x=>x.id===selected)+1)%fixtures.length].id));
 $('toggle-access').addEventListener('click',()=>{let open=$('access-form').hidden;$('access-form').hidden=!open;$('toggle-access').setAttribute('aria-expanded',String(open));});
 $('token').addEventListener('input',e=>{access=e.target.value.trim();$('paired-token').value=access;});$('save-review').addEventListener('click',review);$('download-report').addEventListener('click',report);
 $('threshold').addEventListener('input',e=>{threshold=Number(e.target.value)/100;$('threshold-value').textContent=Math.round(threshold*100)+'%';renderModels();renderEvaluation();});
 loadPairedResults();renderCase();renderEvaluation();renderPaired();}
init();
