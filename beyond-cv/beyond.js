(function () {
  'use strict';
  var byId = function (id) { return document.getElementById(id); };
  var mode = new URLSearchParams(window.location.search).get('for');
  function applyMode(value) {
    var targeted = value === 'dksr';
    document.body.classList.toggle('dksr', targeted);
    document.title = targeted ? 'Michael Ninh × DKSR — Semantic City' : 'Beyond the CV — Michael Ninh';
    byId('contact-link').href = targeted
      ? 'mailto:mikel_ninh@yahoo.de?subject=Gespr%C3%A4ch%20zu%20Semantic%20City'
      : 'mailto:mikel_ninh@yahoo.de?subject=Beyond%20the%20CV%20%E2%80%94%20lass%20uns%20sprechen';
  }
  applyMode(mode);
  document.querySelectorAll('[data-view]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      applyMode(link.dataset.view);
      if (/^https?:$/.test(window.location.protocol)) {
        var next = new URL(window.location.href);
        next.hash = '';
        if (link.dataset.view === 'dksr') next.searchParams.set('for', 'dksr');
        else next.searchParams.delete('for');
        window.history.pushState({}, '', next);
      }
      window.scrollTo({top:0,behavior:'instant'});
    });
  });
  window.addEventListener('popstate', function () {
    applyMode(new URLSearchParams(window.location.search).get('for'));
  });
  // Authored replay of a pinned, previously retrieved example. Not a live query.
  var sources = {
    climate: ['PET · 14:00 · Klimaanalyse 2022','40,56 °C','Struktureller Modellwert für thermisches Empfinden — keine Messung der heutigen Lufttemperatur.','ua_klimaanalyse_2022','pb_ua_pet_str_2022.0000000001000265'],
    justice: ['Umweltgerechtigkeit · 2023/24','Dreifach','Alexanderplatzviertel: Bioklima hoch, Grünversorgung mittel, mittlerer Status-Index. Das beschreibt einen Planungsraum, nicht einzelne Menschen.','ua_umweltgerechtigkeit2023','z_gesamt_umwelt2023.01100310'],
    green: ['Erfasste öffentliche Grünanlage','≈ 249 m','Fernsehturmanlage zwischen Fernsehturm und Spandauer Straße. Näherung zur Geometrie; kein Gehweg und kein Nachweis nutzbaren Schattens.','gruenanlagen','gruenanlagen.00008100_0014b7f7'],
    care: ['Erfasster Krankenhausstandort','≈ 1,10 km','St. Hedwig-Krankenhaus. 415 gemeldete Betten sind keine Aussage über freie Kapazität oder aktuell geeignete Versorgung.','krankenhaeuser','plankrankenhaeuser.1']
  };
  var topics = {
    cooking: 'Ich koche gern vegan und für andere. Ein gemeinsamer Tisch ist für mich ein ziemlich guter Ort, um zuzuhören, zu lachen und aus einem gewöhnlichen Abend etwas Schönes zu machen.',
    play: 'Ich mag Spiele, Sammelobjekte und Interfaces, die sich gut anfühlen. Mich fasziniert dieser Moment, in dem eine kleine Interaktion überrascht — und man einfach noch einmal drücken möchte.',
    learning: 'Musik und Kampfkunst sind Dinge, in denen ich weiterlernen möchte. Ich mag Bruce Lees Idee der Anpassungsfähigkeit. Und ich möchte mir erlauben, auch als Erwachsener wieder Anfänger zu sein.',
    stories: 'Beim Schreiben interessieren mich Menschen: ihre Widersprüche, ihr Mut, ihre kleinen Entscheidungen. Geschichten können uns eine andere Perspektive anbieten, ohne uns vorzuschreiben, was wir denken müssen.'
  };
  function tabs(attribute, render) {
    var buttons = Array.from(document.querySelectorAll('button[' + attribute + ']'));
    function activate(button, moveFocus) {
      buttons.forEach(function (item) {
        var selected = item === button;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      render(button.getAttribute(attribute), button.id);
      if (moveFocus) button.focus();
    }
    buttons.forEach(function (button, index) {
      button.addEventListener('click', function () { activate(button, false); });
      button.addEventListener('keydown', function (event) {
        var target = index;
        if (event.key === 'ArrowRight') target = (index + 1) % buttons.length;
        else if (event.key === 'ArrowLeft') target = (index + buttons.length - 1) % buttons.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = buttons.length - 1;
        else return;
        event.preventDefault(); activate(buttons[target], true);
      });
    });
  }
  tabs('data-source', function (key, id) {
    var source = sources[key];
    if (!source) return;
    byId('metric-label').textContent = source[0];
    byId('metric-value').textContent = source[1];
    byId('metric-caption').textContent = source[2];
    byId('feature-id').textContent = 'Feature: ' + source[4];
    byId('source-link').href = 'https://gdi.berlin.de/services/wfs/' + source[3] + '?SERVICE=WFS&REQUEST=GetCapabilities';
    byId('evidence-panel').setAttribute('aria-labelledby', id);
  });
  tabs('data-topic', function (key, id) {
    if (!topics[key]) return;
    byId('topic-panel').textContent = topics[key];
    byId('topic-panel').setAttribute('aria-labelledby', id);
  });
  var prompt = byId('prompt-text').textContent.trim();
  byId('copy-prompt').addEventListener('click', async function () {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(prompt);
      byId('copy-status').textContent = 'Kopiert. Jetzt in deinem Schreibassistenten einfügen.';
    } catch (error) {
      byId('prompt-details').open = true;
      byId('copy-status').textContent = 'Kopieren ist hier gesperrt. Der Text ist geöffnet und lässt sich markieren.';
      var range = document.createRange(); range.selectNodeContents(byId('prompt-text'));
      var selection = window.getSelection();
      if (selection) { selection.removeAllRanges(); selection.addRange(range); }
    }
  });
  byId('download-prompt').addEventListener('click', function () {
    var url = URL.createObjectURL(new Blob([prompt + '\n'], {type:'text/plain;charset=utf-8'}));
    var link = document.createElement('a');
    link.href = url; link.download = 'Beyond_CV_Prompt.txt';
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    byId('copy-status').textContent = 'Der Text-Download wurde gestartet.';
  });
}());
