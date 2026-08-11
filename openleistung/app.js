import {
  BENEFIT_LABELS,
  RULESET_VERSION,
  buildEvidencePlan,
  completionScore,
  createApplicationId,
  evaluateEligibility,
  transitionCase
} from "./rules.js";

const stepLabels = ["Familie", "Anspruch", "Nachweise", "Prüfen", "Gesendet"];
const nowLabel = () => new Intl.DateTimeFormat("de-DE", {dateStyle:"medium", timeStyle:"short"}).format(new Date());

const state = {
  started: false,
  step: 0,
  input: {
    jurisdiction: "BE",
    guardianName: "",
    childName: "",
    childAge: "",
    grade: "",
    school: "",
    postcode: "",
    attendsSchool: true,
    benefit: "",
    consent: false
  },
  registry: {},
  manualEvidence: {},
  declaration: false,
  applicationId: "",
  caseStatus: "draft",
  audit: [],
  submittedAt: ""
};

const intro = document.querySelector("#intro");
const workspace = document.querySelector("#workspace");
const applicationCard = document.querySelector("#application-card");
const progress = document.querySelector("#progress");
const statusView = document.querySelector("#status-view");
const caseworkerView = document.querySelector("#caseworker-view");
const architectureView = document.querySelector("#architecture-view");
const navButtons = [...document.querySelectorAll(".nav-button")];

document.querySelector("#start-demo").addEventListener("click", () => {
  Object.assign(state.input, {
    guardianName: "Lea Beispiel",
    childName: "Mila Beispiel",
    childAge: "13",
    grade: "8",
    school: "Gemeinschaftsschule am Sonnenweg",
    postcode: "12043",
    attendsSchool: true,
    benefit: "wohngeld",
    consent: true
  });
  state.started = true;
  addAudit("demo.started", "Synthetischer Demonstrationsfall angelegt");
  showView("citizen");
});

navButtons.forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));

function showView(view) {
  navButtons.forEach(button => button.classList.toggle("active", button.dataset.view === view));
  intro.hidden = view !== "citizen" || state.started;
  workspace.hidden = view !== "citizen" || !state.started;
  statusView.hidden = view !== "status";
  caseworkerView.hidden = view !== "caseworker";
  architectureView.hidden = view !== "architecture";
  document.querySelector("#why").hidden = view !== "citizen";
  if (view === "citizen" && state.started) renderApplication();
  if (view === "status") renderStatus();
  if (view === "caseworker") renderCaseworker();
  window.scrollTo({top: 34, behavior: "smooth"});
}

function renderApplication() {
  progress.innerHTML = stepLabels.map((label, index) => {
    const mode = index === state.step ? "active" : index < state.step ? "done" : "";
    const icon = index < state.step ? "✓" : index + 1;
    return `<li class="${mode}"><i>${icon}</i><span>${label}</span></li>`;
  }).join("");
  const renderers = [renderFamily, renderEligibility, renderEvidence, renderReview, renderReceipt];
  applicationCard.innerHTML = renderers[state.step]();
  bindStepEvents();
}

function renderFamily() {
  return `
    <p class="step-kicker">SCHRITT 1 VON 4 · FAMILIE UND SCHULE</p>
    <h3>Für wen wird das Mittagessen beantragt?</h3>
    <p class="step-intro">Die Angaben sind ausschließlich synthetisch und bleiben in diesem Browser. Für die Demo sind Beispieldaten bereits eingetragen.</p>
    <div class="form-grid">
      ${field("guardianName", "Antragstellende Person", state.input.guardianName)}
      ${field("childName", "Name des Kindes", state.input.childName)}
      ${numberField("childAge", "Alter des Kindes", state.input.childAge, 0, 24)}
      ${numberField("grade", "Klassenstufe", state.input.grade, 1, 13)}
      ${field("school", "Schule", state.input.school, "full")}
      ${field("postcode", "Postleitzahl", state.input.postcode)}
      <label class="check-row"><input type="checkbox" data-field="attendsSchool" ${state.input.attendsSchool ? "checked" : ""}><span><b>Das Kind besucht diese Schule.</b><small>Die Schulbestätigung kann später mit Einwilligung abgerufen oder manuell belegt werden.</small></span></label>
    </div>
    <div class="form-actions"><button class="primary" data-action="next">Weiter zum Anspruch</button><button class="quiet" data-action="reset">Demo zurücksetzen</button></div>`;
}

function renderEligibility() {
  const choices = Object.entries(BENEFIT_LABELS).map(([value,label]) => `<label class="choice"><input type="radio" name="benefit" data-field="benefit" value="${value}" ${state.input.benefit===value?"checked":""}><span>${label}</span></label>`).join("");
  return `
    <p class="step-kicker">SCHRITT 2 VON 4 · ANSPRUCH UND EINWILLIGUNG</p>
    <h3>Welche Unterstützung erhält der Haushalt?</h3>
    <p class="step-intro">Diese Angabe dient nur dem vorläufigen Anspruchshinweis. Die endgültige Entscheidung trifft immer eine zuständige Fachkraft.</p>
    <div class="choice-grid">${choices}</div>
    <label class="check-row"><input type="checkbox" data-field="consent" ${state.input.consent?"checked":""}><span><b>Vorhandene Nachweise mit meiner Einwilligung abrufen.</b><small>Die Demo simuliert eID-, NOOTS- und Schuldaten. Es findet kein echter Registerzugriff statt.</small></span></label>
    <div class="notice"><b>Once Only bedeutet Kontrolle, nicht heimlichen Datenaustausch.</b>Vor jedem Abruf werden Zweck, Datenquelle und Umfang sichtbar gemacht.</div>
    <div class="form-actions"><button class="secondary" data-action="back">Zurück</button><button class="primary" data-action="next">Nachweise zusammenstellen</button></div>`;
}

function renderEvidence() {
  const result = evaluateEligibility(state.input);
  const registryReady = Object.keys(state.registry).length > 0;
  const plan = evidencePlan();
  const tone = result.status === "eligible" ? "" : "review";
  return `
    <p class="step-kicker">SCHRITT 3 VON 4 · NACHWEISE</p>
    <h3>Nichts einreichen, was bereits vorhanden ist.</h3>
    <p class="step-intro">Mit Einwilligung kann OpenLeistung vorhandene Nachweise anfragen. Ohne Einwilligung bleibt immer ein manueller Weg.</p>
    <div class="result-card ${tone}"><small>VORLÄUFIGER ANSPRUCHSHINWEIS · REGELWERK ${RULESET_VERSION}</small><h4>${result.status === "eligible" ? "Anspruch wahrscheinlich" : "Fachliche Prüfung erforderlich"}</h4><p>${result.explanation}</p></div>
    ${state.input.consent && !registryReady ? `<div class="notice"><b>Bereit für den simulierten Abruf</b>Identität, Leistungsbezug, Schulbesuch und Mittagessenteilnahme werden nur für diesen Demo-Fall abgefragt.</div><button class="primary" data-action="lookup">Demo-Nachweise sicher abrufen</button>` : ""}
    ${registryReady ? `<ul class="data-sources">${plan.map(item => `<li><i class="state-icon">${isVerified(item)?"✓":"!"}</i><span><b>${item.label}</b><small>${isVerified(item)?"Verifiziert":"Noch offen"}</small></span><em class="source-tag">${item.source || "manuell"}</em></li>`).join("")}</ul>` : ""}
    ${!state.input.consent ? `<div class="notice warn"><b>Manueller Weg gewählt</b>Markiere die Nachweise, die für die Demo als vorhanden gelten.</div><ul class="evidence-list">${plan.map(item => `<li><span class="state-icon">${isVerified(item)?"✓":"·"}</span><label><input type="checkbox" data-evidence="${item.id}" ${isVerified(item)?"checked":""}><span>${item.label}</span></label></li>`).join("")}</ul>` : ""}
    <div class="form-actions"><button class="secondary" data-action="back">Zurück</button><button class="primary" data-action="next">Angaben prüfen</button></div>`;
}

function renderReview() {
  const result = evaluateEligibility(state.input);
  const plan = evidencePlan();
  const score = completionScore(plan.map(item => ({...item, verified:isVerified(item)})));
  return `
    <p class="step-kicker">SCHRITT 4 VON 4 · PRÜFEN UND SENDEN</p>
    <h3>Alles auf einen Blick.</h3>
    <p class="step-intro">Nach dem Absenden wird ein strukturierter Fall erzeugt. Es entsteht noch kein rechtswirksamer Bescheid.</p>
    <ul class="summary-list">
      <li><i class="state-icon">1</i><span><b>${escapeHtml(state.input.childName)}</b><small>${state.input.childAge} Jahre · Klasse ${state.input.grade} · ${escapeHtml(state.input.school)}</small></span><em class="source-tag">Familie</em></li>
      <li><i class="state-icon">2</i><span><b>${BENEFIT_LABELS[state.input.benefit] || "Nicht angegeben"}</b><small>${result.explanation}</small></span><em class="source-tag">Regelhinweis</em></li>
      <li><i class="state-icon">3</i><span><b>${score}% der Demo-Nachweise vorhanden</b><small>${plan.filter(item=>isVerified(item)).length} von ${plan.length} Nachweisen</small></span><em class="source-tag">Evidenz</em></li>
    </ul>
    <label class="check-row"><input type="checkbox" data-field="declaration" ${state.declaration?"checked":""}><span><b>Ich bestätige, dass dies ein synthetischer Demonstrationsfall ist.</b><small>Es werden keine echten personenbezogenen Daten oder Dokumente übermittelt.</small></span></label>
    <div class="notice ${score < 100 ? "warn" : ""}"><b>${score === 100 ? "Fall vollständig für die Demo" : "Der Fall kann mit offenen Nachweisen gesendet werden"}</b>Offene Punkte werden transparent an die Sachbearbeitung übergeben – nicht stillschweigend geraten.</div>
    <div class="form-actions"><button class="secondary" data-action="back">Zurück</button><button class="primary" data-action="submit" ${state.declaration?"":"disabled"}>Demo-Antrag verbindlich simulieren</button></div>`;
}

function renderReceipt() {
  return `
    <p class="step-kicker">ANTRAG SYNTHETISCH ÜBERMITTELT</p>
    <h3>Der Fall ist angekommen.</h3>
    <div class="submission-receipt"><small>VORGANGSNUMMER</small><p class="receipt-id">${state.applicationId}</p><p>Der Antrag wartet auf eine menschliche Prüfung. Im echten System würde FIT-Connect den strukturierten Fall an die zuständige Stelle übertragen und ZaPuk über Statusänderungen informieren.</p></div>
    <div class="form-actions"><button class="primary" data-action="status">Status ansehen</button><button class="secondary" data-action="caseworker">Sachbearbeitung öffnen</button></div>
    <div class="notice"><b>Kein automatischer Bescheid</b>Die Regelprüfung strukturiert den Fall. Verantwortung und Entscheidung bleiben bei der zuständigen Stelle.</div>`;
}

function bindStepEvents() {
  applicationCard.querySelectorAll("[data-field]").forEach(control => {
    control.addEventListener("change", () => {
      const field = control.dataset.field;
      const value = control.type === "checkbox" ? control.checked : control.value;
      if (field === "declaration") state.declaration = value;
      else state.input[field] = value;
      if (field === "consent" && !value) state.registry = {};
      renderApplication();
    });
  });
  applicationCard.querySelectorAll("[data-evidence]").forEach(control => control.addEventListener("change", () => {
    state.manualEvidence[control.dataset.evidence] = control.checked;
    renderApplication();
  }));
  applicationCard.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => handleAction(button.dataset.action)));
}

function handleAction(action) {
  if (action === "next") {
    if (!validateStep()) return;
    state.step = Math.min(3, state.step + 1);
    renderApplication();
  } else if (action === "back") {
    state.step = Math.max(0, state.step - 1);
    renderApplication();
  } else if (action === "lookup") {
    state.registry = {identityVerified:true, schoolVerified:true, benefitVerified:true, mealVerified:true};
    addAudit("evidence.lookup", "Vier synthetische Nachweise mit Einwilligung abgerufen");
    renderApplication();
  } else if (action === "submit") {
    submitApplication();
  } else if (action === "status") {
    showView("status");
  } else if (action === "caseworker") {
    showView("caseworker");
  } else if (action === "reset") {
    window.location.reload();
  }
}

function validateStep() {
  if (state.step === 0) {
    const required = ["guardianName","childName","childAge","grade","school","postcode"];
    if (required.some(key => !String(state.input[key]).trim())) return showInlineError("Bitte fülle alle Angaben zu Familie und Schule aus.");
  }
  if (state.step === 1 && !state.input.benefit) return showInlineError("Bitte wähle eine Antwort zum Leistungsbezug.");
  return true;
}

function showInlineError(message) {
  const error = document.createElement("div");
  error.className = "notice block";
  error.innerHTML = `<b>Bitte noch einmal prüfen</b>${message}`;
  applicationCard.prepend(error);
  error.scrollIntoView({behavior:"smooth", block:"center"});
  return false;
}

function submitApplication() {
  if (!state.declaration) return showInlineError("Bitte bestätige den Demonstrationshinweis.");
  state.applicationId = createApplicationId();
  state.caseStatus = transitionCase(state.caseStatus, "submitted");
  state.submittedAt = nowLabel();
  addAudit("case.submitted", `Fall ${state.applicationId} strukturiert übermittelt`);
  state.step = 4;
  renderApplication();
}

function evidencePlan() {
  return buildEvidencePlan(state.input, state.registry);
}

function isVerified(item) {
  return item.verified || Boolean(state.manualEvidence[item.id]);
}

function renderStatus() {
  if (!state.applicationId) {
    statusView.innerHTML = emptyPanel("◎", "Noch kein Antrag vorhanden", "Starte den synthetischen Antrag. Danach bleiben jeder Schritt, jede Rückfrage und jede Entscheidung hier sichtbar.", "Antrag starten", "citizen");
    bindViewLinks(statusView);
    return;
  }
  const status = statusInfo(state.caseStatus);
  const items = timelineItems();
  statusView.innerHTML = `
    <div class="section-head"><div><p class="eyebrow">MEIN VORGANG</p><h2>${state.applicationId}</h2></div><p>Eine gemeinsame Sicht auf Status, offene Punkte und nächste Schritte – statt Hotline-Lotterie.</p></div>
    <div class="status-layout">
      <article class="panel-card"><div class="case-banner"><div><small>AKTUELLER STATUS</small><h3>${status.title}</h3><p>${status.copy}</p></div><span class="status-pill">${status.code}</span></div><ol class="timeline">${items.map(item=>`<li><i></i><div><b>${item.title}</b><span>${item.copy}</span><small>${item.time}</small></div></li>`).join("")}</ol></article>
      <aside class="panel-card"><h3>Nächster Schritt</h3><p>${status.next}</p><div class="notice"><b>Erreichbar bleiben</b>In einer echten Integration kämen Rückfragen und Bescheide über das staatliche Postfach.</div><button class="secondary" data-view-link="citizen">Antrag ansehen</button></aside>
    </div>`;
  bindViewLinks(statusView);
}

function renderCaseworker() {
  if (!state.applicationId) {
    caseworkerView.innerHTML = emptyPanel("◇", "Keine Fälle in der Demo-Warteschlange", "Sende zuerst einen synthetischen Antrag ab. Anschließend erscheint hier der strukturierte Arbeitsplatz.", "Demo-Antrag öffnen", "citizen");
    bindViewLinks(caseworkerView);
    return;
  }
  const result = evaluateEligibility(state.input);
  const plan = evidencePlan();
  const verifiedPlan = plan.map(item=>({...item,verified:isVerified(item)}));
  const score = completionScore(verifiedPlan);
  const status = statusInfo(state.caseStatus);
  caseworkerView.innerHTML = `
    <div class="section-head"><div><p class="eyebrow">SACHBEARBEITUNG · SYNTHETISCH</p><h2>Ein Fall, nicht vier Systeme.</h2></div><p>Regelhinweis, Quellen, offene Nachweise, Kommunikation und Entscheidung erscheinen in einer gemeinsamen Arbeitsfläche.</p></div>
    <div class="case-layout">
      <article class="panel-card">
        <div class="case-banner"><div><small>${state.applicationId}</small><h3>${escapeHtml(state.input.childName)} · Klasse ${state.input.grade}</h3><p>${escapeHtml(state.input.school)}</p></div><span class="status-pill">${status.code}</span></div>
        <div class="case-facts"><div><small>Leistungsbezug</small><b>${BENEFIT_LABELS[state.input.benefit]}</b></div><div><small>Vollständigkeit</small><b>${score}%</b></div><div><small>Regelhinweis</small><b>${result.status === "eligible" ? "Anspruch wahrscheinlich" : "Prüfung erforderlich"}</b></div><div><small>Regelversion</small><b>${RULESET_VERSION}</b></div></div>
        <div class="result-card ${result.status === "eligible" ? "" : "review"}"><small>ERKLÄRBARER REGELHINWEIS</small><h4>${result.explanation}</h4><p>${result.legalReferences.join(" · ")}</p></div>
        <ul class="data-sources">${verifiedPlan.map(item=>`<li><i class="state-icon">${item.verified?"✓":"!"}</i><span><b>${item.label}</b><small>${item.verified?"Nachweis vorhanden":"Nachweis offen"}</small></span><em class="source-tag">${item.source||"manuell"}</em></li>`).join("")}</ul>
      </article>
      <aside class="panel-card"><h3>Menschliche Entscheidung</h3><p>Die Demo automatisiert Vorbereitung und Dokumentation – nicht die hoheitliche Entscheidung.</p>${decisionControls()}<h3 style="margin-top:32px">Audit Trail</h3><ul class="audit-list">${state.audit.slice().reverse().map(item=>`<li><time>${item.time}</time><b>${item.event}</b><span>${item.detail}</span></li>`).join("")}</ul></aside>
    </div>`;
  caseworkerView.querySelectorAll("[data-case-action]").forEach(button=>button.addEventListener("click",()=>handleCaseAction(button.dataset.caseAction)));
}

function decisionControls() {
  if (["approved","rejected"].includes(state.caseStatus)) return `<div class="notice"><b>Entscheidung dokumentiert</b>${statusInfo(state.caseStatus).copy}</div><button class="secondary" data-case-action="notify">Benachrichtigung simulieren</button>`;
  if (state.caseStatus === "notified") return `<div class="notice"><b>Vorgang abgeschlossen</b>Die synthetische Benachrichtigung wurde zugestellt.</div>`;
  if (state.caseStatus === "submitted") return `<div class="decision-actions"><button class="primary" data-case-action="take">Fall übernehmen</button><button class="secondary" data-case-action="info">Nachweis anfordern</button></div>`;
  if (state.caseStatus === "needs_information") return `<div class="notice warn"><b>Rückfrage läuft</b>Der Fall wartet auf einen fehlenden Nachweis.</div><button class="primary" data-case-action="resume">Nachweis als eingegangen simulieren</button>`;
  return `<div class="decision-actions"><button class="primary" data-case-action="approve">Anspruch bestätigen</button><button class="secondary" data-case-action="info">Rückfrage stellen</button><button class="danger" data-case-action="reject">Ablehnung begründet vormerken</button></div>`;
}

function handleCaseAction(action) {
  const moves = {take:"in_review",info:"needs_information",resume:"in_review",approve:"approved",reject:"rejected",notify:"notified"};
  try {
    state.caseStatus = transitionCase(state.caseStatus, moves[action]);
    const details = {take:"Fall durch Sachbearbeitung übernommen",info:"Strukturierte Nachweisanforderung erstellt",resume:"Nachweis eingegangen; Prüfung fortgesetzt",approve:"Positiver Demo-Bescheid vorgemerkt",reject:"Begründete menschliche Ablehnung vorgemerkt",notify:"Synthetische Benachrichtigung zugestellt"};
    addAudit(`case.${moves[action]}`, details[action]);
    renderCaseworker();
  } catch (error) {
    console.error(error);
  }
}

function timelineItems() {
  const items = [{title:"Antrag eingegangen",copy:"Strukturierter Demo-Fall wurde übermittelt.",time:state.submittedAt}];
  if (["in_review","approved","rejected","notified"].includes(state.caseStatus)) items.unshift({title:"Fachliche Prüfung",copy:"Eine Sachbearbeitung hat den Fall übernommen.",time:latestTime("case.in_review")});
  if (state.caseStatus === "needs_information") items.unshift({title:"Rückfrage",copy:"Ein Nachweis wurde strukturiert angefordert.",time:latestTime("case.needs_information")});
  if (["approved","rejected","notified"].includes(state.caseStatus)) items.unshift({title:state.caseStatus==="rejected"?"Ablehnung vorgemerkt":"Anspruch bestätigt",copy:"Die Entscheidung wurde menschlich geprüft und dokumentiert.",time:latestTime(state.caseStatus==="rejected"?"case.rejected":"case.approved")});
  if (state.caseStatus === "notified") items.unshift({title:"Benachrichtigung zugestellt",copy:"Die Demo-Nachricht wurde an das Statuspostfach übergeben.",time:latestTime("case.notified")});
  return items;
}

function statusInfo(status) {
  const map = {
    draft:{code:"ENTWURF",title:"Noch nicht gesendet",copy:"Der Antrag befindet sich in Bearbeitung.",next:"Antrag vervollständigen und absenden."},
    submitted:{code:"EINGEGANGEN",title:"Antrag eingegangen",copy:"Der Fall wartet auf die fachliche Prüfung.",next:"Nichts zu tun. Die Sachbearbeitung übernimmt den Fall."},
    in_review:{code:"IN PRÜFUNG",title:"Der Fall wird geprüft",copy:"Nachweise und Regelhinweis werden menschlich bewertet.",next:"Bei einer Rückfrage erscheint hier genau, was fehlt und warum."},
    needs_information:{code:"RÜCKFRAGE",title:"Ein Nachweis wird benötigt",copy:"Die Sachbearbeitung hat eine strukturierte Rückfrage erstellt.",next:"Den angeforderten Nachweis ergänzen. In dieser Demo geschieht das in der Sachbearbeitungsansicht."},
    approved:{code:"POSITIV",title:"Anspruch bestätigt",copy:"Eine menschliche Demo-Entscheidung wurde dokumentiert.",next:"Die formale Benachrichtigung wird vorbereitet."},
    rejected:{code:"ABLEHNUNG",title:"Ablehnung vorgemerkt",copy:"Eine begründete menschliche Demo-Entscheidung wurde dokumentiert.",next:"Im echten Dienst wären Begründung, Rechtsbehelf und Beratung sichtbar."},
    notified:{code:"ABGESCHLOSSEN",title:"Entscheidung zugestellt",copy:"Die synthetische Benachrichtigung wurde übergeben.",next:"Der Vorgang ist in der Demo abgeschlossen."}
  };
  return map[status] || map.draft;
}

function addAudit(event, detail) {
  state.audit.push({event, detail, time:nowLabel()});
}

function latestTime(event) {
  return state.audit.slice().reverse().find(item=>item.event===event)?.time || nowLabel();
}

function emptyPanel(icon,title,copy,button,view) {
  return `<div class="empty-state"><div><div class="big">${icon}</div><h2>${title}</h2><p>${copy}</p><button class="primary" data-view-link="${view}">${button}</button></div></div>`;
}

function bindViewLinks(root) {
  root.querySelectorAll("[data-view-link]").forEach(button=>button.addEventListener("click",()=>showView(button.dataset.viewLink)));
}

function field(name,label,value,extra="") {
  return `<label class="field ${extra}"><span>${label}</span><input type="text" data-field="${name}" value="${escapeHtml(value)}" autocomplete="off"></label>`;
}

function numberField(name,label,value,min,max) {
  return `<label class="field"><span>${label}</span><input type="number" data-field="${name}" value="${escapeHtml(value)}" min="${min}" max="${max}"></label>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
}

showView("citizen");
