(() => {
  'use strict';
  // LifeBench 3.0 is a progressively enhanced, static civic workbench.
  // No keys, unattended outreach, or external political submissions occur here.
  const $ = id => document.getElementById(id);
  const REPO = 'https://github.com/mikelninh/mikelninh.github.io';
  const MISSION = ['animal','food','transparency','repair','ai','democracy'];
  const CHANNELS = {
    petition: { label:'Petition beim Bundestag', url:'https://www.bundestag.de/petitionen', note:'Das frühere E-Petitionsportal hat Einreichungen am 18.11.2026 beendet. Den aktuellen Weg bitte auf der Bundestag-Seite prüfen.' },
    ministry: { label:'Stellungnahme zu Ministerialentwurf', url:'https://www.bundesregierung.de/breg-de/service/gesetzgebungsvorhaben', note:'Ein Beteiligungsrecht oder eine offene Frist ist für einen konkreten Entwurf separat zu prüfen.' },
    european: { label:'EU-Kommission / öffentliche Konsultation', url:'https://have-your-say.ec.europa.eu/index_en', note:'Nur laufende, einschlägige Verfahren nutzen und Fristen selbst bestätigen.' },
    representative: { label:'Abgeordnete / Wahlkreis', url:'https://www.bundestag.de/abgeordnete', note:'Individuelle persönliche Kontaktaufnahme, keine automatisierten Seriennachrichten.' },
    public: { label:'Öffentliche LifeBench-Konsultation', url:REPO+'/issues/new?template=lifebench-consultation.yml', note:'GitHub Issues sind keine amtliche Konsultation.' }
  };
  const MAX_RECORDS = 25;
  let generated = '';
  let generatedBy = 'none';
  let feed = null;
  let registry = null;
  const storageKey = name => 'lifebench-v3:'+name+':'+mission();
  const mission = () => {
    const node = document.querySelector('#mission-list .mission-button.active');
    const buttons = [...document.querySelectorAll('#mission-list .mission-button')];
    const index = buttons.indexOf(node);
    return MISSION[Math.max(0,index)] || 'animal';
  };
  const value = id => ($(id)?.value || '').trim();
  const text = (tag, cls, content) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (content != null) el.textContent = String(content);
    return el;
  };
  const safeUrl = v => {try{const u=new URL(v);return u.protocol==='https:'?u.href:null;}catch{return null;}};
  const sources = () => value('policy-evidence').split(/\n/).map(x => safeUrl(x.trim())).filter(Boolean).slice(0,25);
  const policy = () => ({
    mission:mission(), title:value('policy-title'), goal:value('policy-goal'),
    route:value('legal-route'), targetYear:value('policy-deadline'),
    tradeoffs:value('policy-tradeoffs'), sources:sources(),
    officialCaseId:mission()==='animal'?'334563':null
  });
  const store = (key, data) => {try{localStorage.setItem(key, JSON.stringify(data));return true;}catch{return false;}};
  const load = (key, fallback) => {try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}};
  const stamp = () => new Date().toISOString();
  function download(filename,obj,media='application/json') {
    const content = typeof obj === 'string' ? obj : JSON.stringify(obj,null,2);
    const url = URL.createObjectURL(new Blob([content],{type:media+';charset=utf-8'}));
    const a=text('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  async function copy(s) {
    try {await navigator.clipboard.writeText(s);return true;}
    catch {return false;}
  }
  function officialSnapshot() {
    const x = feed?.cases?.find(c=>c.id==='334563');
    return x ? {id:x.id,status:x.status_raw||'unbekannt',updated:x.source_updated_at,
      source_url:x.source_url,stage:x.stage,
      promulgated:!!x.promulgation?.verified,
      inForce:!!x.entry_into_force?.verified,
      impactVerified:!!x.impact?.verified} : null;
  }
  function evidencePrompt() {
    const d=policy(),snapshot=officialSnapshot();
    return [
      'Du bist ein juristisches Rechercheteam und eine kritische Gegenprüfung. Antworte auf Deutsch.',
      'Ausschließlich ein nichtamtlicher Arbeitsentwurf für freiwillige öffentliche Beteiligung. Keine Rechtsberatung.',
      'WICHTIG: Lies die Links nicht als besucht, falls du sie nicht tatsächlich aufrufen kannst. Keine erfundenen Quellen oder Normzitate.',
      'Gesetzesentwurf oder Petition? '+value('ai-kind'),
      'Ziel: '+d.goal,'Arbeitstitel: '+d.title,'Rechtsweg als Hypothese: '+d.route,
      'Zieljahr: '+(d.targetYear||'offen'),'Kosten, Risiken und Gegenargumente: '+d.tradeoffs,
      'Quellen (vom Nutzer eingegeben, nicht automatisch geprüft): '+(d.sources.join(' | ')||'keine'),
      'Amtlicher Snapshot (KEINE automatische Gesetzeskraft): '+JSON.stringify(snapshot),
      'Erstelle klar getrennte Abschnitte:',
      '1. Ziel, Problem und mögliche Rechtsgrundlage; 2. geltende Rechtslage und Prüfbedarf;',
      '3. drei Ansätze inklusive Nicht-Gesetzesoption; 4. präziser juristisch zu prüfender Textvorschlag;',
      '5. Zuständigkeit, EU- und Verfassungsrecht, Umsetzbarkeit;',
      '6. Kosten, Finanzierung, Anreize, Verteilungswirkungen und stärkste Gegenargumente;',
      '7. Vorschlag zur offenen Beteiligung; 8. Wirkungshypothese, Baseline, Alternativerklärungen;',
      '9. Prüf- und Quellenliste. Kennzeichne Vermutungen als ungeprüft. Keine Ausgaben als offiziell, verabschiedet oder in Kraft.',
      'Keine automatisierten politischen Kontaktaktionen. Menschen entscheiden und prüfen.'
    ].join('\n');
  }
  function skeleton() {
    const d=policy();
    const kind=value('ai-kind');
    return [
      'NICHTAMTLICHES ENTWURFSGERÜST · kein KI-Ergebnis · '+new Date().toLocaleDateString('de-DE'),
      '',
      'ARBEITSTITEL: '+(d.title||'[Arbeitstitel ergänzen]'),
      'DOKUMENTTYP: '+kind,
      'ZIEL: '+(d.goal||'[Ziel ergänzen]'),
      'RECHTSWEG (ungeprüft): '+(d.route||'[Zuständigkeit klären]'),
      '',
      '§ 1 Regelungsziel (Textvorschlag, vor juristischer Prüfung)',
      '[Hier die genaue beabsichtigte Änderung im geltenden Recht benennen.]',
      '',
      '§ 2 Begriffe und Anwendungsbereich',
      '[Definitionen, betroffene Einrichtungen, Übergangsfristen und Ausnahmen prüfen.]',
      '',
      '§ 3 Umsetzung und Kontrolle',
      '[Zuständige Stellen, Kontrollmechanismen, Rechte der Betroffenen, Finanzierung.]',
      '',
      '§ 4 Inkrafttreten und Evaluation',
      '[Rechtlich zulässigen Termin und unabhängige Evaluationspflicht prüfen.]',
      '',
      'KOSTEN, RISIKEN UND GEGENARGUMENTE',
      d.tradeoffs||'[Noch offen]',
      '',
      'VORHANDENE BELEGE (vom Nutzer, noch nicht geprüft)',
      d.sources.length?d.sources.join('\n'):'[Keine Links eingetragen]',
      '',
      'OFFENE PRÜFFRAGEN',
      '• Bestehende deutsche und europäische Rechtslage? Konkrete Paragraphen?',
      '• Zuständiges Parlament/Ministerium und Instrument: Gesetz, Verordnung, Verwaltung oder Beschaffung?',
      '• Wirkung für Tiere, Menschen, Betriebe und öffentliche Haushalte?',
      '• Gibt es tragfähige Gegenargumente und Nebenwirkungen?',
      '• Was sind Baseline, Vergleichsgruppe und Evaluationszeitpunkt?',
      '',
      'BEWERTUNG: Dieses Dokument ist ein manuell anpassbares Gerüst, keine KI-Generierung und keine juristische Prüfung.'
    ].join('\n');
  }
  function setDraft(s,origin) {
    generated=s;generatedBy=origin;
    $('ai-output').value=s;
    $('ai-copy').disabled=!s;
    $('ai-export').disabled=!s;
    $('ai-status').textContent=origin==='on-device'?
      'Lokales KI-Ergebnis. Noch nicht quellen-, rechts- oder wirkungsgeprüft.':
      'Entwurfsgerüst erstellt. Keine KI wurde aufgerufen.';
    store(storageKey('generated'),{text:s,origin,at:stamp()});
  }
  async function draftWithAI() {
    const status=$('ai-status'), btn=$('ai-generate');
    const api=window.LanguageModel;
    if(!api || typeof api.availability!=='function' || typeof api.create!=='function') {
      status.textContent='Lokale KI ist auf diesem Gerät/Browser nicht verfügbar. „Gerüst erstellen“ funktioniert immer. Kein Text wurde an einen Dienst gesendet.';
      return;
    }
    const options={expectedInputs:[{type:'text',languages:['de']}],expectedOutputs:[{type:'text',languages:['de']}]};
    btn.disabled=true;
    let session;
    try{
      status.textContent='Lokales Modell wird geprüft…';
      const available=await api.availability(options);
      if(available==='unavailable')throw Error('Dieses Gerät unterstützt das lokale Modell nicht.');
      status.textContent=available==='available'?'Lokaler Entwurf wird erstellt…':'Modell-Download erforderlich. Fortschritt erscheint hier…';
      session=await api.create({...options,monitor(m) {
        m.addEventListener('downloadprogress',e=>status.textContent='Lokales Modell wird geladen: '+Math.round((e.loaded||0)*100)+' %');
      }});
      status.textContent='KI arbeitet lokal am nichtamtlichen Entwurf…';
      const result=await session.prompt(evidencePrompt());
      if(typeof result!=='string'||!result.trim())throw Error('Leere Modellantwort.');
      setDraft(result,'on-device');
    }catch(e){
      status.textContent='Lokale KI konnte nicht ausgeführt werden: '+String(e.message||e).slice(0,160)+'. Erstelle stattdessen das Gerüst.';
    }finally{
      try{session?.destroy?.();}catch{}
      btn.disabled=false;
    }
  }
  function currentDraft(){
    // Copy what was actually edited in the output area, not an older generation.
    return {text:value('ai-output'),origin:generatedBy,reviewed:false};
  }
  function reviewStatus() {
    const checks=['review-sources','review-jurisdiction','review-opposition','review-consent'];
    const done=checks.every(id=>$(id).checked);
    $('handoff-download').disabled=!done;
    $('review-status').textContent=done?'Vier Selbstprüfungen markiert. Das Dossier bleibt ein menschlich zu prüfender Arbeitsentwurf.':'Vor dem Export als Beteiligungspaket alle vier Prüfschritte bestätigen.';
  }
  async function exportHandoff() {
    if($('handoff-download').disabled)return;
    const p=policy(), d=currentDraft(), channel=value('submission-channel');
    const pack={
      schema:'lifebench-handoff-v1',created_at:stamp(),status:'unsubmitted_citizen_work_product',
      policy:p,draft:d,officialSnapshot:officialSnapshot(),
      channel:CHANNELS[channel]||CHANNELS.petition,
      reviewChecklist:['sources_checked_by_user','legal_route_checked_by_user','tradeoffs_reviewed_by_user','human_opt_in_confirmed'],
      disclaimer:'Human-attested checklist only. This app does not verify legal correctness, approve submissions, contact institutions or prove impact.'
    };
    const raw=JSON.stringify(pack);
    if(crypto?.subtle&&window.TextEncoder){
      const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));
      pack.local_content_sha256=[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
      pack.hash_note='Local integrity checksum, not official signature or evidence of legal correctness.';
    }
    download('lifebench-'+p.mission+'-beteiligungspaket.json',pack);
    $('handoff-status').textContent='Beteiligungspaket erstellt. Du entscheidest selbst, ob, wann und wo du es einreichst.';
  }
  function renderChannel(){
    const c=CHANNELS[value('submission-channel')]||CHANNELS.petition;
    const a=$('official-channel-link');
    a.href=c.url;a.textContent='Offiziellen bzw. öffentlichen Kanal öffnen ↗';
    $('channel-note').textContent=c.note;
  }
  function renderSubmissions(){
    const box=$('submission-list');box.replaceChildren();
    const records=load(storageKey('submissions'),[]);
    if(!records.length){box.append(text('p','small muted','Noch keine extern eingereichte Aktion dokumentiert.'));return;}
    records.slice().reverse().forEach((r,i)=>{
      const article=text('article','submission-record');
      article.append(text('strong','',r.channelLabel),text('span','small muted','Eigenangabe · nicht amtlich bestätigt · '+r.date));
      article.append(text('p','',r.reference?'Referenz: '+r.reference:'Noch keine Referenznummer'));
      if(r.responseUrl&&safeUrl(r.responseUrl)) {
        const a=text('a','textlink','Eingegebene Antwortquelle ↗');
        a.href=safeUrl(r.responseUrl);a.target='_blank';a.rel='noopener noreferrer';
        article.append(a);
      }
      if(r.note)article.append(text('p','small muted',r.note));
      box.append(article);
    });
  }
  function saveSubmission(){
    const c=CHANNELS[value('submission-channel')]||CHANNELS.petition;
    const date=value('submission-date');
    if(!date){$('submission-status').textContent='Bitte ein tatsächliches Einreichdatum eintragen. Dies dokumentiert nur deine Angabe.';return;}
    const entry={channel:value('submission-channel'),channelLabel:c.label,date,
      reference:value('submission-ref').slice(0,160),
      responseUrl:safeUrl(value('submission-response'))||null,
      note:value('submission-note').slice(0,400),createdAt:stamp(),verified:false};
    const entries=load(storageKey('submissions'),[]);
    entries.push(entry);
    if(!store(storageKey('submissions'),entries.slice(-MAX_RECORDS))){$('submission-status').textContent='Speichern in diesem Browser nicht möglich.';return;}
    $('submission-status').textContent='Privat dokumentiert, nicht als amtlicher Vorgang verifiziert.';
    renderSubmissions();
  }
  function observed() {
    return registry?.missions?.find(m=>m.id===mission())?.observed_indicators||[];
  }
  function renderImpactContext(){
    const label=$('measurement-baseline'),m=observed();
    if(!m.length){label.textContent='Noch kein quellengeprüfter Baseline-Datensatz für diese Mission im öffentlichen Register.';return;}
    const indicator=m[0],last=indicator.values?.at(-1);
    label.textContent=indicator.label+': '+(last?.value??'?')+' '+indicator.unit+' ('+(last?.year??'?')+'). Ein beobachteter Ausgangswert, kein Effekt des vorgeschlagenen Gesetzes.';
  }
  function impactDesign(){
    return {schema:'lifebench-evaluation-protocol-v1',created_at:stamp(),mission:mission(),policy_title:value('policy-title'),
      researchQuestion:value('impact-question'),
      targetMetric:value('impact-metric'),
      timeHorizon:value('impact-year'),
      methodology:value('impact-method'),
      comparison:value('impact-comparison'),
      confounders:value('impact-confounders'),
      measurementSources:sources(),
      officialIndicators:observed(),
      reviewed:false,observedEffect:null,causalClaimPermitted:false};
  }
  function saveImpact(){
    const d=impactDesign();
    if(!d.researchQuestion){$('impact-plan-status').textContent='Bitte zuerst die Forschungsfrage formulieren.';return;}
    const ok=store(storageKey('impact-plan'),d);
    $('impact-plan-status').textContent=ok?'Messplan privat gespeichert. Es wurde keine Wirkung behauptet.':'Speichern nicht möglich. Bitte Messplan herunterladen.';
  }
  function renderRoadmapStats(){
    if(!$('source-health'))return;
    const area=$('source-health');area.replaceChildren();
    const names={dip:'Bundestag / DIP',gazette:'Bundesgesetzblatt',gii:'Gesetze im Internet',consultations:'Öffentliche Beiträge'};
    for(const [key,label] of Object.entries(names)){
      const src=feed?.sources?.[key];
      const el=text('div','source-indicator');
      el.append(text('span','',label),text('strong',src?.status==='ok'?'Quelle erreichbar':'Nicht verfügbar / prüfen'));
      area.append(el);
    }
    $('source-time').textContent=feed?.generated_at?'Datenstand: '+new Date(feed.generated_at).toLocaleString('de-DE'):'Kein amtlicher Snapshot geladen';
    const changes=$('change-list');changes.replaceChildren();
    const list=feed?.changes||[];
    if(!list.length){changes.append(text('p','small muted','Seit dem letzten Lauf keine dokumentierte Veränderung.'));return;}
    list.slice(0,6).forEach(change=>{
      changes.append(text('div','change-record',(change.type||'Update')+': '+(change.title||change.id||change.description||'Änderung in offiziellen Daten')));
    });
  }
  async function loadData(){
    const get=async path=>{try{const r=await fetch(path,{cache:'no-store'});return r.ok?await r.json():null;}catch{return null;}};
    const [f,r]=await Promise.all([get('./data/law-feed.json'),get('./data/impact-registry.json')]);
    feed=f?.schema==='lifebench-official-monitor-v1'?f:null;
    registry=r?.schema==='lifebench-impact-registry-v1'?r:null;
    renderRoadmapStats();renderImpactContext();
  }
  function resetMissionUI(){
    const prior=load(storageKey('generated'),null);
    generatedBy=prior?.origin||'none';
    $('ai-output').value=prior?.text||'';
    $('ai-status').textContent=prior?'Letzter lokaler Arbeitsstand wiederhergestellt. Bitte neu prüfen.':'Bereit: Entwurfsgerüst funktioniert überall, lokale KI nur in unterstützten Browsern.';
    $('ai-copy').disabled=!prior?.text;$('ai-export').disabled=!prior?.text;
    ['review-sources','review-jurisdiction','review-opposition','review-consent'].forEach(id=>$(id).checked=false);
    reviewStatus();
    const plan=load(storageKey('impact-plan'),null);
    $('impact-question').value=plan?.researchQuestion||'';
    $('impact-metric').value=plan?.targetMetric||'';
    $('impact-year').value=plan?.timeHorizon||'';
    $('impact-method').value=plan?.methodology||'before_after';
    $('impact-comparison').value=plan?.comparison||'';
    $('impact-confounders').value=plan?.confounders||'';
    renderSubmissions();renderImpactContext();
  }
  function start(){
    $('ai-generate').addEventListener('click',draftWithAI);
    $('ai-skeleton').addEventListener('click',()=>setDraft(skeleton(),'structured_template'));
    $('ai-copy').addEventListener('click',async()=>{
      $('ai-status').textContent=await copy(value('ai-output'))?'Entwurf kopiert. Unabhängige Prüfung erforderlich.':'Kopieren fehlgeschlagen. Text auswählen oder als Datei exportieren.';
    });
    $('ai-export').addEventListener('click',()=>download('lifebench-'+mission()+'-arbeitsentwurf.txt',value('ai-output'),'text/plain'));
    $('ai-output').addEventListener('input',()=>{generated=$('ai-output').value; $('ai-copy').disabled=!generated;$('ai-export').disabled=!generated;});
    ['review-sources','review-jurisdiction','review-opposition','review-consent'].forEach(id=>$(id).addEventListener('change',reviewStatus));
    $('handoff-download').addEventListener('click',exportHandoff);
    $('submission-channel').addEventListener('change',renderChannel);
    $('submission-add').addEventListener('click',saveSubmission);
    $('impact-save').addEventListener('click',saveImpact);
    $('impact-export').addEventListener('click',()=>download('lifebench-'+mission()+'-evaluationsplan.json',impactDesign()));
    $('mission-list').addEventListener('click',()=>setTimeout(resetMissionUI,0));
    renderChannel();loadData();resetMissionUI();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();