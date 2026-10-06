(function () {
  'use strict';
  const E = window.EvidenceAtelier;
  if (!E) {
    const notice = document.getElementById('change-status');
    if (notice) notice.textContent = 'Der interaktive Prüfmodus konnte nicht geladen werden. Sichtbar bleibt der gespeicherte Ausgangsfall; Quellensteuerung ist deaktiviert.';
    return;
  }
  document.documentElement.classList.add('js');
  const $ = id => document.getElementById(id);
  // Visible feedback near controls; only the footer live region announces changes.
  $('source-delta').removeAttribute('role');
  $('source-delta').setAttribute('aria-live', 'off');
  const examples = {
    care: {
      title:'Ein Krankenhaus ist nah. Ist Hilfe damit gesichert?', intro:'Ein erfasster Standort ist ein Beleg. Verfügbare Versorgung ist eine andere Aussage.',
      kicker:'Im gespeicherten Krankenhausdatensatz', value:'415', answer:'Gemeldete Betten. Nicht freie Betten.',
      boundary:'St. Hedwig-Krankenhaus. Aus diesem Wert folgt keine Aussage über freie Kapazität oder die passende Hilfe heute.',
      trace:'Standort → Versorgung?', origin:'Standort + 415 Betten', note:'Krankenhausdatensatz → erfasster Standort und gemeldete Bettenzahl.',
      target:'Hilfe ist verfügbar', targetNote:'Kapazität · passendes Angebot · tatsächliche Erreichbarkeit fehlen.',
      unrelated:'Klima, Quartier und Grünraum bleiben eigenständige Belege. Sie ersetzen keine aktuelle Versorgungskapazität.'
    },
    cooling: {
      title:'Eine Grünanlage ist nah. Gibt es dort Abkühlung?', intro:'Eine erfasste Fläche ist ein Beleg. Nutzbarer Schatten und Zugang sind andere Aussagen.',
      kicker:'Näherung im gespeicherten Beispiel', value:'≈ 249 m', answer:'Abstand zur Geometrie. Kein Nachweis von Kühlung.',
      boundary:'Fernsehturmanlage. Der frühere Prototyp berechnete eine geometrische Näherung — keinen Gehweg und keine Kühlleistung.',
      trace:'Grünfläche → Abkühlung?', origin:'Grünanlage · ≈ 249 m', note:'Erfasste Grünanlage → gespeicherte geometrische Abstandsnäherung.',
      target:'Abkühlung ist nutzbar', targetNote:'Kühlwirkung · Zugang und Öffnung · tatsächlicher Weg fehlen.',
      unrelated:'Krankenhaus- und Klimadatensätze ersetzen keine Prüfung, ob diese Grünanlage heute nutzbare Abkühlung bietet.'
    },
    heat: {
      title:'Ein Modell zeigt Wärme. Ist es heute gefährlich?', intro:'Ein struktureller Modellwert ist ein Beleg. Ein heutiges Hitzeereignis ist eine andere Aussage.',
      kicker:'Klimaanalyse · Modellbezugsjahr 2022', value:'40,56 °C', answer:'PET-Modellwert. Nicht heutige Lufttemperatur.',
      boundary:'Das gespeicherte Beispiel verbindet Klimamodell und Quartierskontext. Es enthält keine aktuelle Hitzewarnung.',
      trace:'Modell + Quartier → Heute?', origin:'PET + Planungsraum', note:'Klimaanalyse 2022 + Umweltgerechtigkeit 2023/24 → gemeinsamer Kontext im Beispiel.',
      target:'Heute ist Hitzegefahr', targetNote:'Aktuelle Warnung oder Prognose · aktuelle Exposition fehlen.',
      unrelated:'Ein 2022er Modell wird durch ein neues Abrufdatum nicht zur heutigen Messung. Quellen behalten ihren eigenen Zeitbezug.'
    }
  };
  const labels = {supported:'Im Beispiel belegt', missing:'Nicht belegt', withheld:'Quelle ausgeblendet', invalid:'Beleg ungültig'};
  let state = E.readState(location.search);
  let previous = E.evaluateAll(state.enabled);
  const controls = E.SOURCE_IDS.map(id => $('source-' + id));
  $('source-fieldset').disabled = false;
  function text(id, value) { $(id).textContent = value; }
  function render(message, updateURL) {
    const ex = examples[state.example];
    const all = E.evaluateAll(state.enabled);
    const result = all[state.example];
    document.querySelectorAll('[data-example]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.example === state.example)));
    controls.forEach(input => {
      input.checked = state.enabled.includes(input.value);
      input.closest('label').querySelector('.mini').textContent = input.checked ? 'an' : 'aus';
    });
    text('hero-title', ex.title); text('hero-intro', ex.intro); text('answer-kicker', ex.kicker);
    const focalOff = result.disabled.length > 0;
    text('answer-value', focalOff ? '—' : ex.value);
    text('answer-title', focalOff ? 'Im Prüfmodus ausgeblendet.' : ex.answer);
    text('answer-boundary', focalOff ? 'Der Originaldatensatz bleibt unverändert. Seine ausgeblendeten Belege werden in diesem Prüfstand nicht verwendet.' : ex.boundary);
    text('trace-title', ex.trace);
    text('trace-label', result.dependencies.length + ' Datenfamilie' + (result.dependencies.length > 1 ? 'n' : '') + ' · ' + result.gaps.length + ' offene Voraussetzungen');
    $('evidence-path').dataset.state = result.state;
    text('origin-tag', focalOff ? 'Im Prüfmodus fehlt' : result.invalid.length ? 'Ungültiger Beleg' : 'Gespeicherter Beleg');
    text('origin-value', focalOff ? result.disabled.map(id => E.SOURCES[id].name).join(' + ') : ex.origin);
    text('origin-note', focalOff ? 'Der dazugehörige Aussagepfad hat jetzt keine vollständige Grundlage.' : ex.note);
    text('target-value', ex.target); text('target-note', ex.targetNote); text('remaining', ex.unrelated);
    text('conclusion', focalOff
      ? 'Jetzt fehlen schon gespeicherte Ausgangsbelege. Die offenen operativen Voraussetzungen bleiben zusätzlich offen.'
      : result.invalid.length ? 'Ein Beleg ist ungültig. Die Aussage wird nicht gestützt.'
      : 'Nicht belegt heißt nicht „falsch“. Diese Daten reichen für die Schlussfolgerung nicht aus.');
    $('gaps-list').replaceChildren(...result.gaps.map(gap => { const li = document.createElement('li'); li.textContent = gap; return li; }));
    $('claim-rows').replaceChildren(...Object.keys(E.CLAIMS).map(id => {
      const row = document.createElement('tr'); row.dataset.claim = id; row.dataset.state = all[id].state;
      const label = document.createElement('td'); label.textContent = E.CLAIMS[id].label;
      const status = document.createElement('td'); const badge = document.createElement('span');
      badge.className = 'badge'; badge.dataset.state = all[id].state; badge.textContent = labels[all[id].state]; status.append(badge);
      const deps = document.createElement('td'); deps.textContent = all[id].dependencies.map(x => E.SOURCES[x].name).join(' + ') + (all[id].gaps.length ? '; zusätzlich: ' + all[id].gaps.join(', ') : '');
      row.append(label, status, deps); return row;
    }));
    if (message) { text('change-status', message); text('source-delta', message); }
    if (updateURL && /^https?:$/.test(location.protocol)) {
      const next = new URL(location.href); next.search = E.stateQuery(state.example, state.enabled);
      history.pushState({}, '', next);
    }
    previous = all;
  }
  controls.forEach(input => input.addEventListener('change', () => {
    state.enabled = controls.filter(x => x.checked).map(x => x.value);
    const next = E.evaluateAll(state.enabled);
    const delta = E.changed(previous, next);
    const message = E.SOURCES[input.value].name + (input.checked ? ' wieder eingeblendet. ' : ' ausgeblendet. ') + delta.length + ' von ' + Object.keys(E.CLAIMS).length + ' Aussagezuständen geändert. Unabhängige Aussagen bleiben unverändert.';
    render(message, true);
  }));
  document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
    state.example = button.dataset.example;
    render('Andere Frage, derselbe Prüfstand. Ausgeblendete Quellen bleiben ausgeblendet.', true);
  }));
  $('reset-evidence').addEventListener('click', () => {
    state.enabled = [...E.SOURCE_IDS]; render('Alle vier Quellen wieder eingeblendet. Aktuelle Kapazität, Kühlung und Hitzeereignis bleiben nicht belegt.', true);
  });
  window.addEventListener('popstate', () => { state = E.readState(location.search); render('Vorheriger Prüfstand wiederhergestellt.', false); });
  $('share-state').addEventListener('click', async () => {
    const link = new URL('https://mikelninh.github.io/beyond-cv/dksr/atelier/');
    link.search = E.stateQuery(state.example, state.enabled);
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(link.href); text('change-status', 'Link zu diesem Prüfstand kopiert. Er enthält nur Fragestellung und ausgeblendete Quellen.');
    } catch (_) {
      $('share-fallback').hidden = false; $('share-fallback').open = true; $('state-link').value = link.href;
      text('change-status', 'Kopieren nicht verfügbar. Der auswählbare Link steht direkt unter der Prüfansicht.');
    }
  });
  render(state.enabled.length < 4 ? 'Verlinkter Prüfstand geladen. Ausgeblendete Quellen werden nur hier nicht verwendet.' : '', false);
}());
