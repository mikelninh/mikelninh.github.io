/* A bounded evidence-dependency experiment, not the COMMONS backend, an LLM,
   a spatial engine or an operational heat policy. No original record is edited. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EvidenceAtelier = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function freeze(value) {
    Object.values(value).forEach(item => { if (item && typeof item === 'object') freeze(item); });
    return Object.freeze(value);
  }
  const SOURCE_IDS = freeze(['climate', 'justice', 'green', 'care']);
  const SNAPSHOT = freeze({
    retrievedAt: '2026-10-06T09:33:14.708187Z',
    provenance: 'https://github.com/mikelninh/COMMONS/actions/runs/37443678058/artifacts/11401809646',
    climate: {id: 'pb_ua_pet_str_2022.0000000001000265', pet: 40.56, modelYear: '2022'},
    justice: {id: 'z_gesamt_umwelt2023.01100310', area: 'Alexanderplatzviertel', burden: 'dreifach', reference: '2023/24'},
    green: {id: 'gruenanlagen.00008100_0014b7f7', name: 'Fernsehturmanlage zw. Fernsehturm u. Spandauer Str.', distance: 248.6},
    care: {id: 'plankrankenhaeuser.1', name: 'St. Hedwig-Krankenhaus', beds: 415, distance: 1096.3}
  });
  const SOURCES = freeze({
    climate: {name:'Klimamodell', date:'Bezugsjahr 2022', endpoint:'ua_klimaanalyse_2022'},
    justice: {name:'Quartierskontext', date:'Umweltgerechtigkeit 2023/24', endpoint:'ua_umweltgerechtigkeit2023'},
    green: {name:'Grünanlagen', date:'Gespeicherter Bestand', endpoint:'gruenanlagen'},
    care: {name:'Krankenhäuser', date:'Gespeicherter Bestand', endpoint:'krankenhaeuser'}
  });
  const CLAIMS = freeze({
    site: {label:'Krankenhausstandort erfasst', requires:['care.site'], gaps:[]},
    beds: {label:'415 Betten im Datensatz gemeldet', requires:['care.beds'], gaps:[]},
    climate: {label:'PET-Modellwert 40,56 °C gespeichert', requires:['climate.pet'], gaps:[]},
    justice: {label:'Planungsraum: dreifache Belastung', requires:['justice.context'], gaps:[]},
    green: {label:'Grünanlage: ungefähr 249 m Geometrieabstand', requires:['green.distance'], gaps:[]},
    context: {label:'Klima und Quartier gemeinsam im Beispiel', requires:['climate.pet','justice.context'], gaps:[]},
    care: {label:'Geeignete Hilfe ist jetzt erreichbar', requires:['care.site','care.beds'], gaps:['Aktuelle Kapazität','Passendes Versorgungsangebot','Tatsächliche Erreichbarkeit']},
    cooling: {label:'Nutzbare Abkühlung ist erreichbar', requires:['green.distance'], gaps:['Nutzbarer Schatten oder Kühlung','Zugänglichkeit und Öffnung','Tatsächlicher Weg']},
    heat: {label:'Heute besteht eine Hitzegefährdung', requires:['climate.pet','justice.context'], gaps:['Aktuelle Warnung oder Prognose','Aktuelle Exposition betroffener Menschen']}
  });
  // Exact reference checks: a changed value may not support a fixed numeric claim.
  const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  function facts(snapshot) {
    const s = snapshot && typeof snapshot === 'object' ? snapshot : {};
    const c=s.care || {}, g=s.green || {}, t=s.climate || {}, j=s.justice || {};
    return {
      'care.site': c.id === SNAPSHOT.care.id && c.name === SNAPSHOT.care.name,
      'care.beds': c.id === SNAPSHOT.care.id && number(c.beds) && c.beds === SNAPSHOT.care.beds,
      'climate.pet': t.id === SNAPSHOT.climate.id && number(t.pet) && t.pet === SNAPSHOT.climate.pet && t.modelYear === '2022',
      'justice.context': j.id === SNAPSHOT.justice.id && j.area === SNAPSHOT.justice.area && j.burden === SNAPSHOT.justice.burden,
      'green.distance': g.id === SNAPSHOT.green.id && g.name === SNAPSHOT.green.name && number(g.distance) && g.distance === SNAPSHOT.green.distance
    };
  }
  function evaluate(id, enabled, snapshot = SNAPSHOT) {
    const claim = CLAIMS[id];
    if (!claim) return {id, state:'invalid', disabled:[], invalid:['Unbekannte Aussage'], gaps:[], dependencies:[]};
    const active = new Set(Array.isArray(enabled) ? enabled.filter(x => SOURCE_IDS.includes(x)) : []);
    const dependencies = [...new Set(claim.requires.map(f => f.split('.')[0]))];
    const disabled = dependencies.filter(s => !active.has(s));
    const available = facts(snapshot);
    const invalid = claim.requires.filter(f => active.has(f.split('.')[0]) && !available[f]);
    const state = disabled.length ? 'withheld' : invalid.length ? 'invalid' : claim.gaps.length ? 'missing' : 'supported';
    return {id, state, dependencies, disabled, invalid, gaps:[...claim.gaps]};
  }
  function evaluateAll(enabled, snapshot = SNAPSHOT) {
    return Object.fromEntries(Object.keys(CLAIMS).map(id => [id, evaluate(id, enabled, snapshot)]));
  }
  function changed(before, after) {
    return Object.keys(CLAIMS).filter(id => before[id].state !== after[id].state);
  }
  function readState(search) {
    const query = new URLSearchParams(search);
    const example = ['care','cooling','heat'].includes(query.get('case')) ? query.get('case') : 'care';
    const off = new Set((query.get('off') || '').split(',').filter(id => SOURCE_IDS.includes(id)));
    return {example, enabled: SOURCE_IDS.filter(id => !off.has(id))};
  }
  function stateQuery(example, enabled) {
    const safeExample = ['care','cooling','heat'].includes(example) ? example : 'care';
    const q = new URLSearchParams(); q.set('case', safeExample);
    const active = new Set(Array.isArray(enabled) ? enabled : []);
    const off = SOURCE_IDS.filter(id => !active.has(id));
    if (off.length) q.set('off', off.join(','));
    return '?' + q.toString();
  }
  return freeze({SNAPSHOT,SOURCE_IDS,SOURCES,CLAIMS,evaluate,evaluateAll,changed,readState,stateQuery});
});
