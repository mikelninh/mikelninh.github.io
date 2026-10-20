/* BIDPILOT · kompakter, quellverlinkter Eignungs-Schnellcheck.
   Nur veröffentlichte Auszüge der TED 714363-2026; verbindlich sind Primärunterlagen.
   Keine Übertragung von Selbstauskünften. */
(function(root){
'use strict';
const id='714363-2026';
const source='https://app.zuschlagsreif.de/ausschreibung/1406624-deutschland-entwicklung-von-kundenspezifischer-software-konzeption-entwicklung';
const secondary='https://bidfix.ai/tender/konzeption-entwicklung-implementierung-integration-und-f2cc4a2d-89db-46c5-a205-353f20649c40';
const requirements=[
{id:'references',name:'Vergleichbare Referenz',short:'Mind. 150.000 € netto · Portal mit Nutzerkonto, öffentlicher Bezug und Barrierefreiheit',description:'Mindestens eine vergleichbare Portalreferenz aus dem Bereich der öffentlichen Daseinsvorsorge mit mindestens 150.000 € Nettoauftragswert. Weitere öffentlich aufgeführte Merkmale umfassen Authentifizierung, Fachverfahrensintegration, Datenschutz und zwölf Monate Betrieb.',source:'Referenzen über Dienstleistungen'},
{id:'turnover',name:'Vergleichbare Umsätze',short:'Eigenerklärung zu Leistungen der vergangenen Geschäftsjahre',description:'Eigenerklärung zu Umsätzen mit vergleichbaren Leistungen aus den letzten drei abgeschlossenen Geschäftsjahren; bei kürzerer Geschäftstätigkeit für den entsprechenden Zeitraum.',source:'Allgemeiner Jahresumsatz'},
{id:'company',name:'Team & Kapazität',short:'Firmenprofil, Beschäftigtenzahl und Einbindung Dritter',description:'Firmenprofil mit zuständigen Bereichen, jahresdurchschnittlicher Beschäftigtenzahl und ggf. Einbindung Dritter; die veröffentlichte Zusammenfassung nennt eine Grenze von fünf einseitigen A4-Seiten.',source:'Durchschnittliche jährliche Beschäftigtenzahl'},
{id:'insurance',name:'Berufshaftpflicht',short:'3 Mio. € Personen- / 1 Mio. € Vermögens- / 0,5 Mio. € sonstige Schäden',description:'Versicherungsnachweis oder zulässige Verpflichtungserklärung. Details und Jahresmaximaldeckung im Original prüfen.',source:'Berufshaftpflichtversicherung'},
{id:'iso',name:'Informationssicherheit',short:'ISO 27001 auf Basis IT-Grundschutz oder gleichwertiger Nachweis',description:'Nachweis nach ISO 27001 auf Basis IT-Grundschutz oder als gleichwertig belegte Maßnahmen. Die Gleichwertigkeit muss bei einer Alternative nachgewiesen werden.',source:'Qualitätssicherungszertifikate unabhängiger Stellen'}
];
const answers={};
function create(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n}
function link(title,url){const a=create('a','simplelink',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
function status(){const values=requirements.map(r=>answers[r.id]||'unknown'),yes=values.filter(x=>x==='yes').length,nos=values.filter(x=>x==='no').length,unknown=values.length-yes-nos;return {yes,nos,unknown,decision:nos?'Möglicher Ausschluss – Anforderungen gezielt klären':unknown?'Noch keine belastbare Eignungsaussage – offene Nachweise prüfen':'Selbstauskunft vollständig – Originalunterlagen und Belege noch verifizieren'}}
function build(){
 const wrap=create('section','qualification');
 const heading=create('div','qual-head');
 heading.append(create('div','eyebrow','02 / EIGNUNGSCHECK'));
 heading.append(create('h3','','Kann das Studio die Anforderungen erfüllen?'));
 heading.append(create('p','fine','Fünf belegte Kriterien. Deine Antworten bleiben lokal und werden nicht automatisch überprüft.'));
 wrap.append(heading);
 const list=create('div','qual-list');
 const verdict=create('div','qual-status');verdict.setAttribute('role','status');verdict.setAttribute('aria-live','polite');
 for(const item of requirements){
  const row=create('div','qual-row');
  const label=create('label','qual-label',item.name);
  const sel=create('select','qual-select');
  sel.id='qualification-'+item.id;label.htmlFor=sel.id;
  [['unknown','Noch offen'],['yes','Vorhanden'],['no','Nicht erfüllbar']].forEach(([value,caption])=>{const opt=create('option','',caption);opt.value=value;sel.append(opt)});
  sel.value=answers[item.id]||'unknown';
  sel.addEventListener('change',()=>{answers[item.id]=sel.value;update()});
  const line=create('div','qual-line');line.append(label,sel);row.append(line);
  const details=create('details','qual-detail');
  details.append(create('summary','','Warum wird das verlangt?'));
  details.append(create('p','',item.description));
  details.append(link('Veröffentlichte Fundstelle: '+item.source+' ↗',source));
  row.append(create('p','qual-short',item.short),details);list.append(row);
 }
 wrap.append(list,verdict);
 const trace=create('details','qual-sources');
 trace.append(create('summary','','Quellen & rechtliche Grenzen'));
 trace.append(create('p','','Die Kriterien stammen aus einer veröffentlichten Sekundärzusammenfassung zu TED 714363-2026. Sie sind eine Auswahl und können die vollständigen Vergabeunterlagen nicht ersetzen. Selbstauskünfte sind keine Eignungsnachweise.'));
 const refs=create('div','linkrow');refs.append(link('TED-Original ↗','https://ted.europa.eu/en/notice/-/detail/'+id),link('Eignungskriterien ↗',source));trace.append(refs);wrap.append(trace);
 function update(){const s=status();verdict.textContent=s.yes+' vorhanden · '+s.nos+' nicht erfüllbar · '+s.unknown+' offen. '+s.decision;}
 update();
 return wrap;
}
root.BidQualification={id,source,secondary,requirements,answers,status,build};
})(window);