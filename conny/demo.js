const stageNames = ['Intake','Extraktion','Validierung','Fachlogik','Legal Review','Dokument & Aktion'];

const state = { current: 0, maxVisited: 0, approved: false, started: false, autoplay: false };

const main = document.querySelector('#stageMain');
const side = document.querySelector('#stageSide');
const tabs = [...document.querySelectorAll('.step-tab')];
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');
const resetBtn = document.querySelector('#resetBtn');
const autoBtn = document.querySelector('#autoBtn');
const hint = document.querySelector('#stageHint');

function mainTemplate(stage){
  if(stage === 0) return `
    <span class="mini-label">01 / INTAKE</span>
    <h2>Ein Fall kommt rein.</h2>
    <p class="stage-lead">Die Demo startet bewusst mit einem kleinen, synthetischen Mietfall. Ziel: Daten und Dokumente früh so strukturieren, dass spätere Schritte überprüfbar bleiben.</p>
    <div class="card">
      <h3>Fallangaben</h3>
      <div class="case-grid">
        <div class="field"><label>Kundin</label><strong>Lea Hoffmann</strong></div>
        <div class="field"><label>Adresse</label><strong>Beispielstraße 17, Berlin</strong></div>
        <div class="field"><label>Mietbeginn</label><strong>01.06.2025</strong></div>
        <div class="field"><label>Nettokaltmiete</label><strong>1.120 € / Monat</strong></div>
        <div class="field"><label>Wohnfläche</label><strong>64 m²</strong></div>
        <div class="field missing"><label>Ausnahme-/Vormietdaten</label><strong>Noch nicht belegt</strong></div>
      </div>
    </div>
    <div class="card">
      <h3>Unterlagen</h3>
      <div class="doc-list">
        <div class="doc"><b>📄 Mietvertrag_Lea_Hoffmann.pdf</b><span class="tag ok">vorhanden</span></div>
        <div class="doc"><b>🖼️ Wohnungsanzeige.png</b><span class="tag ok">vorhanden</span></div>
        <div class="doc"><b>📄 Vormiet-/Ausnahmebeleg</b><span class="tag block">fehlt</span></div>
      </div>
    </div>`;

  if(stage === 1) return `
    <span class="mini-label">02 / EXTRAKTION</span>
    <h2>Dokumente werden zu Daten — mit Quelle.</h2>
    <p class="stage-lead">Nicht nur ein Wert, sondern Wert + Herkunft + Konfidenz. Niedrige Sicherheit wird sichtbar, statt unbemerkt weitergereicht zu werden.</p>
    <div class="extract-table">
      <div class="extract-row"><span class="key">Mietbeginn<span class="source">Mietvertrag · S.1 · §2</span></span><span class="value">01.06.2025</span><span class="confidence good">99%</span></div>
      <div class="extract-row"><span class="key">Nettokaltmiete<span class="source">Mietvertrag · S.2 · §4</span></span><span class="value">1.120 €</span><span class="confidence good">98%</span></div>
      <div class="extract-row"><span class="key">Wohnfläche<span class="source">Mietvertrag · S.1</span></span><span class="value">64 m²</span><span class="confidence good">97%</span></div>
      <div class="extract-row"><span class="key">Vermieter<span class="source">Mietvertrag · Kopfzeile</span></span><span class="value">Beispiel Immobilien GmbH</span><span class="confidence good">96%</span></div>
      <div class="extract-row"><span class="key">Vormiete<span class="source">kein belastbarer Beleg</span></span><span class="value">—</span><span class="confidence warn">OFFEN</span></div>
      <div class="extract-row"><span class="key">Ausnahmehinweise<span class="source">Unterlagen unvollständig</span></span><span class="value">—</span><span class="confidence warn">OFFEN</span></div>
    </div>`;

  if(stage === 2) return `
    <span class="mini-label">03 / VALIDIERUNG</span>
    <h2>Lieber gezielt nachfragen als still raten.</h2>
    <p class="stage-lead">Die Pipeline prüft Vollständigkeit, Widersprüche und Extraktionssicherheit. Aus offenen Punkten werden konkrete Arbeitsschritte.</p>
    <div class="check-list">
      <div class="check ok"><span class="check-icon">✓</span><div><strong>Kerndaten vollständig</strong><p>Mietbeginn, Miethöhe, Fläche, Parteien und Adresse sind belegt.</p></div><span class="tag ok">pass</span></div>
      <div class="check ok"><span class="check-icon">✓</span><div><strong>Keine offensichtlichen Dokumentwidersprüche</strong><p>Extrahierte Werte stimmen zwischen Formular und Mietvertrag überein.</p></div><span class="tag ok">pass</span></div>
      <div class="check warn"><span class="check-icon">?</span><div><strong>Vormietinformation fehlt</strong><p>Gezielte Rückfrage statt Annahme: Gibt es einen Beleg oder Angaben zur Vormiete?</p></div><span class="tag warn">fragen</span></div>
      <div class="check warn"><span class="check-icon">?</span><div><strong>Mögliche Ausnahmeinformationen ungeklärt</strong><p>Der Fall darf nicht automatisch zu einer fachlichen Schlussfolgerung springen.</p></div><span class="tag warn">review</span></div>
    </div>`;

  if(stage === 3) return `
    <span class="mini-label">04 / FACHLOGIK</span>
    <h2>Versionierte Regeln statt freier Modellentscheidung.</h2>
    <p class="stage-lead">Die Demo bildet keine echte CONNY-Rechtslogik ab. Sie zeigt die technische Form: definierte Inputs, versionierte Kriterien, nachvollziehbare Abbrüche und ein expliziter Review-Pfad.</p>
    <div class="rulebox">
      <div class="rule-head"><span>RULE PACK · RENT-CHECK-DEMO</span><span>v0.3 · SYNTHETISCH</span></div>
      <div class="logic">
        <div><span>required.core_fields</span><b>PASS</b></div>
        <div><span>source_anchors.present</span><b>PASS</b></div>
        <div><span>exception_inputs.complete</span><b>FALSE</b></div>
        <div><span>automatic_decision.allowed</span><b>FALSE</b></div>
      </div>
      <div class="decision"><b>→ Legal Review erforderlich</b><span>Grund: relevante Ausnahme-/Vormietinformationen sind noch nicht belastbar.</span></div>
    </div>`;

  if(stage === 4) return `
    <span class="mini-label">05 / HUMAN GATE</span>
    <h2>Der Mensch bekommt nicht den ganzen Fallberg — sondern das Entscheidende.</h2>
    <p class="stage-lead">Der Review-Punkt bündelt offene Fragen, Quellen und bisherigen Verlauf. Hier entscheidet ein Mensch, was als Nächstes passieren soll.</p>
    <div class="review-packet">
      <div class="card"><h3>Was sicher ist</h3><div class="doc-list"><div class="doc"><b>Mietbeginn</b><span class="tag ok">belegt</span></div><div class="doc"><b>Nettokaltmiete</b><span class="tag ok">belegt</span></div><div class="doc"><b>Wohnfläche</b><span class="tag ok">belegt</span></div></div></div>
      <div class="card"><h3>Was offen ist</h3><div class="doc-list"><div class="doc"><b>Vormietinformation</b><span class="tag warn">offen</span></div><div class="doc"><b>Ausnahmeinformationen</b><span class="tag warn">offen</span></div><div class="doc"><b>Nächster Schritt</b><span class="tag block">Freigabe</span></div></div></div>
    </div>
    <div class="review-actions">
      <button class="btn" id="clarifyBtn">Rückfrage als Entwurf ansehen</button>
      <button class="btn primary" id="approveBtn">Rückfrage freigeben ✓</button>
    </div>
    <div id="reviewFeedback" class="${state.approved ? 'approval' : 'hidden'}">Freigabe erfasst · Aktion darf vorbereitet werden.</div>`;

  return `
    <span class="mini-label">06 / DOKUMENT & AKTION</span>
    <h2>Aus strukturierten Daten wird ein freigegebener nächster Schritt.</h2>
    <p class="stage-lead">Hier bewusst kein juristisches Anspruchsschreiben: Die Demo erzeugt eine sichere Kundenrückfrage aus den tatsächlich offenen Feldern. Das gleiche Muster kann Vorlagen, Statuswechsel oder andere freigegebene Aktionen speisen.</p>
    <div class="generated">
      <div class="letter-head"><span>AUTOMATISCH VORBEREITET</span><span>HUMAN APPROVED ✓</span></div>
      <h3>Betreff: Zwei kurze Angaben zu deinem Mietfall</h3>
      <p>Hallo <span class="filled">Lea</span>,</p>
      <p>damit dein Fall weiter geprüft werden kann, fehlen uns noch zwei Informationen:</p>
      <p><strong>1.</strong> Gibt es Angaben oder einen Beleg zur Vormiete?<br><strong>2.</strong> Sind dir Umstände bekannt, die für mögliche Ausnahmen relevant sein könnten?</p>
      <p>Du kannst die Informationen einfach in deinem Fall ergänzen. Die bereits hochgeladenen Unterlagen musst du nicht noch einmal senden.</p>
      <p>Viele Grüße<br>CONNY · <em>Konzeptdemo</em></p>
    </div>`;
}

function auditFor(stage){
  const events = [
    ['Fall angelegt','18:59:00'],
    ['2 Dokumente erfasst','18:59:04'],
    ['6 Felder extrahiert · 2 offen','18:59:09'],
    ['Validierung: Rückfrage + Review','18:59:12'],
    ['Rule Pack v0.3 ausgeführt','18:59:14'],
    [state.approved ? 'Human Gate: freigegeben' : 'Human Gate: wartet','18:59:18'],
    ['Rückfrage vorbereitet','18:59:20']
  ];
  const count = Math.min(stage + 2, events.length);
  return events.slice(0,count).map(([label,time])=>`<div><b>${label}</b><time>${time}</time></div>`).join('');
}

function sideTemplate(stage){
  const extracted = stage < 1 ? '0/6' : '4/6';
  const reviews = stage < 3 ? '0' : '1';
  const status = stage < 1 ? 'Intake' : stage < 4 ? 'In Prüfung' : stage === 4 && !state.approved ? 'Wartet auf Review' : stage < 5 ? 'Freigegeben' : 'Wartet auf Kund:in';
  return `
    <div class="side-section">
      <h3>Live-Status</h3>
      <div class="status-line"><strong>${status}</strong><span class="status">STEP ${stage+1}/6</span></div>
    </div>
    <div class="side-section">
      <h3>Fallmetriken</h3>
      <div class="metrics">
        <div class="metric"><strong>${extracted}</strong><span>Felder belegt</span></div>
        <div class="metric"><strong>${stage < 2 ? '0' : '2'}</strong><span>offene Punkte</span></div>
        <div class="metric"><strong>${reviews}</strong><span>Review Gate</span></div>
        <div class="metric"><strong>${stage < 5 ? '0' : '1'}</strong><span>Dokumente erzeugt</span></div>
      </div>
    </div>
    <div class="side-section">
      <h3>Audit Trail</h3>
      <div class="audit">${auditFor(stage)}</div>
    </div>
    <div class="side-section">
      <h3>Warum das zählt</h3>
      <p>${[
        'Saubere Eingaben verhindern spätere Nacharbeit.',
        'Extraktion bleibt bis zur Quelle überprüfbar.',
        'Fehler und Lücken werden zu gezielten Rückfragen.',
        'Fachlogik ist versionierbar und testbar.',
        'Unsicherheit wird an Menschen eskaliert.',
        'Freigegebene Daten können Dokumente und Status sicher speisen.'
      ][stage]}</p>
    </div>`;
}

function bindReviewActions(){
  const clarify = document.querySelector('#clarifyBtn');
  const approve = document.querySelector('#approveBtn');
  if(clarify) clarify.addEventListener('click',()=>{
    const feedback = document.querySelector('#reviewFeedback');
    feedback.classList.remove('hidden');
    feedback.textContent = 'Entwurf geprüft · zwei gezielte Rückfragen, keine fachliche Schlussfolgerung.';
  });
  if(approve) approve.addEventListener('click',()=>{
    state.approved = true;
    state.maxVisited = Math.max(state.maxVisited,5);
    render();
  });
}

function render(){
  main.innerHTML = mainTemplate(state.current);
  side.innerHTML = sideTemplate(state.current);
  tabs.forEach((tab,i)=>{
    tab.classList.toggle('active',i===state.current);
    tab.classList.toggle('done',i<state.current || (i===4 && state.approved));
    tab.disabled = i > state.maxVisited;
  });
  prevBtn.disabled = state.current === 0;
  nextBtn.disabled = state.current === 5 || (state.current === 4 && !state.approved);
  nextBtn.textContent = state.current === 4 ? 'Nach Freigabe weiter →' : state.current === 5 ? 'Demo abgeschlossen ✓' : 'Weiter →';
  hint.textContent = state.current === 4 && !state.approved ? 'Hier stoppt die Automatisierung bewusst: erst menschliche Freigabe.' : `${stageNames[state.current]} · ${state.current+1} von 6`;
  bindReviewActions();
}

function goTo(index){
  if(index < 0 || index > 5) return;
  if(index > state.maxVisited) return;
  state.current = index;
  render();
}

function advance(){
  if(state.current === 4 && !state.approved) return;
  if(state.current < 5){
    state.current += 1;
    state.maxVisited = Math.max(state.maxVisited,state.current);
    render();
  }
}

prevBtn.addEventListener('click',()=>goTo(state.current-1));
nextBtn.addEventListener('click',advance);
resetBtn.addEventListener('click',()=>{
  state.current=0; state.maxVisited=0; state.approved=false; state.autoplay=false; render();
});
tabs.forEach((tab,i)=>tab.addEventListener('click',()=>goTo(i)));

autoBtn.addEventListener('click', async ()=>{
  if(state.autoplay) return;
  state.autoplay = true;
  state.current = 0; state.maxVisited = 0; state.approved = false; render();
  document.querySelector('#caseflow').scrollIntoView({behavior:'smooth',block:'start'});
  for(let i=1;i<=4;i++){
    await new Promise(r=>setTimeout(r,720));
    if(!state.autoplay) return;
    state.current=i; state.maxVisited=i; render();
  }
  state.autoplay=false;
  hint.textContent='Auto-Run pausiert am Human Gate. Jetzt bist du dran: Freigabe oder Rückfrage.';
});

render();