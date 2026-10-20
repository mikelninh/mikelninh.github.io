/* BIDPILOT · Fünf verständliche Prüffragen zu einem öffentlichen Auftrag.
   Nur veröffentlichte Zusammenfassungen eines echten Auftrags; verbindlich sind die Originalunterlagen.
   Keine Übertragung von Selbstauskünften. */
(function(root){
'use strict';
const id='714363-2026';
const source='https://app.zuschlagsreif.de/ausschreibung/1406624-deutschland-entwicklung-von-kundenspezifischer-software-konzeption-entwicklung';
const secondary='https://bidfix.ai/tender/konzeption-entwicklung-implementierung-integration-und-f2cc4a2d-89db-46c5-a205-353f20649c40';
const requirements=[
{id:'references',name:'Ähnliches Projekt umgesetzt?',short:'Mindestens ein ähnlicher Auftrag ab 150.000 € netto',description:'Mindestens eine vergleichbare Portalreferenz aus dem Bereich der öffentlichen Daseinsvorsorge mit mindestens 150.000 € Nettoauftragswert. Weitere öffentlich aufgeführte Merkmale umfassen Authentifizierung, Fachverfahrensintegration, Datenschutz und zwölf Monate Betrieb.',source:'Referenzen über Dienstleistungen'},
{id:'turnover',name:'Umsätze nachweisbar?',short:'Umsätze aus vergleichbaren Aufträgen angeben',description:'Eigenerklärung zu Umsätzen mit vergleichbaren Leistungen aus den letzten drei abgeschlossenen Geschäftsjahren; bei kürzerer Geschäftstätigkeit für den entsprechenden Zeitraum.',source:'Allgemeiner Jahresumsatz'},
{id:'company',name:'Passendes Team vorhanden?',short:'Teamgröße, Fähigkeiten und mögliche Partner beschreiben',description:'Firmenprofil mit zuständigen Bereichen, jahresdurchschnittlicher Beschäftigtenzahl und ggf. Einbindung Dritter; die veröffentlichte Zusammenfassung nennt eine Grenze von fünf einseitigen A4-Seiten.',source:'Durchschnittliche jährliche Beschäftigtenzahl'},
{id:'insurance',name:'Passende Versicherung?',short:'Versicherung mit den genannten Deckungssummen nachweisen',description:'Versicherungsnachweis oder zulässige Verpflichtungserklärung. Details und Jahresmaximaldeckung im Original prüfen.',source:'Berufshaftpflichtversicherung'},
{id:'iso',name:'IT-Sicherheit nachweisbar?',short:'Anerkannte Sicherheitsprüfung oder gleichwertige Nachweise',description:'Nachweis nach ISO 27001 auf Basis IT-Grundschutz oder als gleichwertig belegte Maßnahmen. Die Gleichwertigkeit muss bei einer Alternative nachgewiesen werden.',source:'Qualitätssicherungszertifikate unabhängiger Stellen'}
];
const answers={};
function create(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n}
function link(title,url){const a=create('a','simplelink',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
function status(){const values=requirements.map(r=>answers[r.id]||'unknown'),yes=values.filter(x=>x==='yes').length,nos=values.filter(x=>x==='no').length,unknown=values.length-yes-nos;return {yes,nos,unknown,decision:nos?'Mindestens eine wichtige Anforderung nicht erfüllt – vor einer Bewerbung klären':unknown?'Einige Antworten fehlen noch – erst Anforderungen prüfen':'Alle Antworten gegeben – jetzt Belege und Originalunterlagen überprüfen'}}
function build(){
 const wrap=create('section','qualification');
 const heading=create('div','qual-head');
 heading.append(create('div','eyebrow','02 / ANFORDERUNGEN'));
 heading.append(create('h3','','Was müsste dein Unternehmen mitbringen?'));
 heading.append(create('p','fine','Fünf veröffentlichte Anforderungen. Wähle, was dein Team erfüllen kann. Wir überprüfen deine Angaben nicht.'));
 wrap.append(heading);
 const list=create('div','qual-list');
 const verdict=create('div','qual-status');verdict.setAttribute('role','status');verdict.setAttribute('aria-live','polite');
 for(const item of requirements){
  const row=create('div','qual-row');
  const label=create('label','qual-label',item.name);
  const sel=create('select','qual-select');
  sel.id='qualification-'+item.id;label.htmlFor=sel.id;
  [['unknown','Weiß ich noch nicht'],['yes','Ja, vorhanden'],['no','Nein, fehlt']].forEach(([value,caption])=>{const opt=create('option','',caption);opt.value=value;sel.append(opt)});
  sel.value=answers[item.id]||'unknown';
  sel.addEventListener('change',()=>{answers[item.id]=sel.value;update()});
  const line=create('div','qual-line');line.append(label,sel);row.append(line);
  const details=create('details','qual-detail');
  details.append(create('summary','','Details und Quelle ansehen'));
  details.append(create('p','',item.description));
  details.append(link('Veröffentlichte Fundstelle: '+item.source+' ↗',source));
  row.append(create('p','qual-short',item.short),details);list.append(row);
 }
 wrap.append(list,verdict);
 const trace=create('details','qual-sources');
 trace.append(create('summary','','Woher kommen diese Anforderungen?'));
 trace.append(create('p','','Die Angaben stammen aus einer öffentlich zugänglichen Zusammenfassung des Auftrags. Wir zeigen nur fünf Punkte. Was wirklich gilt, steht in den vollständigen Unterlagen der Behörde. Ein Klick auf „Ja“ ersetzt keinen Nachweis.'));
 const refs=create('div','linkrow');refs.append(link('Original-Auftrag ansehen ↗','https://ted.europa.eu/en/notice/-/detail/'+id),link('Zusammenfassung der Anforderungen ↗',source));trace.append(refs);wrap.append(trace);
 function update(){const s=status();verdict.textContent=s.yes+' mit Ja · '+s.nos+' mit Nein · '+s.unknown+' unklar. '+s.decision;}
 update();
 return wrap;
}
root.BidQualification={id,source,secondary,requirements,answers,status,build};
})(window);