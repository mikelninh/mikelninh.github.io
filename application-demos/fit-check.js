/* BIDPILOT: cite-backed suitability pre-check for one inspected TED notice.
 * Based on published summaries of TED 714363-2026 (not a substitute for primary docs).
 * User answers are local and never transmitted.
 */
(function(root){
'use strict';
const noticed='714363-2026';
const source='https://app.zuschlagsreif.de/ausschreibung/1406624-deutschland-entwicklung-von-kundenspezifischer-software-konzeption-entwicklung';
const secondary='https://bidfix.ai/tender/konzeption-entwicklung-implementierung-integration-und-f2cc4a2d-89db-46c5-a205-353f20649c40';
const requirements=[
{id:'references',name:'Vergleichbare Unternehmensreferenzen',description:'Mindestens eine Referenz aus öffentlicher Daseinsvorsorge: digitales Portal mit Nutzerkonto, Barrierefreiheit und einem Nettoauftragswert ab 150.000 €. Zusätzliche Nachweise umfassen Authentifizierung, Integration, sensible Daten und mindestens 12 Monate Betrieb.',source:'Referenzen über Dienstleistungen',kind:'critical'},
{id:'turnover',name:'Umsätze der letzten Geschäftsjahre',description:'Angaben zu vergleichbaren Leistungen aus den letzten drei abgeschlossenen Geschäftsjahren mit Eigenerklärung zu Umsätzen.',source:'Allgemeiner Jahresumsatz',kind:'required'},
{id:'company',name:'Firmenprofil und Personalkapazität',description:'Firmenprofil mit zuständigen Bereichen, Personal und möglicher Einbindung von Dritten; die veröffentlichte Zusammenfassung nennt maximal fünf A4-Seiten.',source:'Durchschnittliche jährliche Beschäftigtenzahl',kind:'required'},
{id:'insurance',name:'Berufshaftpflicht',description:'Nachweis oder zulässige Verpflichtungserklärung. Genannt werden 3 Mio. € Personenschäden, 1 Mio. € Vermögensschäden und 0,5 Mio. € sonstige Schäden je Versicherungsfall.',source:'Berufshaftpflichtversicherung',kind:'critical'},
{id:'iso',name:'Informationssicherheits-Nachweis',description:'ISO 27001 auf Basis IT-Grundschutz oder als gleichwertig nachgewiesene Maßnahmen – Gleichwertigkeit ist zu belegen.',source:'Qualitätssicherungszertifikate unabhängiger Stellen',kind:'critical'}
];
const answers={};
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function link(label,url){const a=el('a','simplelink',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
function status(){const ans=requirements.map(r=>answers[r.id]||'unknown');const nos=ans.filter(x=>x==='no').length;const yes=ans.filter(x=>x==='yes').length;const unk=ans.length-yes-nos;return{yes,nos,unknown:unk,decision:nos?'Blocker gefunden – vorerst nicht als geeignet einstufen':unk?'Offen – erst Nachweise verifizieren':'Vorprüfung ohne offene Selbstauskünfte (keine rechtsverbindliche Eignungsbestätigung)'}}
function build(notice){
const node=el('section','qualification');
const head=el('div','source-note');head.append(el('strong','','NEU: Eignung anhand veröffentlichter Anforderungen prüfen'));head.append(el('p','','Hier sind fünf wichtige Anforderungen für TED 714363-2026. Die Antworten stammen von dir; das System kennt deine Nachweise nicht.'));node.append(head);
const list=el('div','');
for(const item of requirements){
 const row=el('div','resultrow');
 const label=el('h3','',item.name);row.append(label,el('p','',item.description));
 const details=el('div','resultmeta');details.append(link('Quelle: '+item.source+' ↗',source));row.append(details);
 const ctrl=el('div','decision-row');
 for(const [value,caption] of [['yes','Nachweis vorhanden'],['no','Kann ich nicht erfüllen'],['unknown','Noch offen']]){
  const button=el('button','choice',caption);button.type='button';
  const selected=(answers[item.id]||'unknown')===value;button.setAttribute('aria-pressed',String(selected));
  if(selected)button.style.background='var(--wash)';
  button.addEventListener('click',()=>{answers[item.id]=value;for(const b of ctrl.children){b.setAttribute('aria-pressed',String(b===button));b.style.background=b===button?'var(--wash)':''}update()});ctrl.append(button)
 }
 row.append(ctrl);list.append(row);
}node.append(list);
const verdict=el('div','safe');node.append(verdict);
const extra=el('p','field-help','Die veröffentlichte Sekundärquelle fasst die Bekanntmachung zusammen. Verbindlich sind die Primärunterlagen im Vergabeportal. Fehlende Nachweise und Gleichwertigkeit sind zu klären.');node.append(extra);
const original=el('div','linkrow');original.append(link('TED Original ↗','https://ted.europa.eu/en/notice/-/detail/'+noticed));original.append(link('Veröffentlichte Eignungsdetails ↗',source));node.append(original);
function update(){const s=status();verdict.textContent=s.yes+' / '+requirements.length+' selbst als vorhanden markiert · '+s.unknown+' offen · '+s.nos+' nicht erfüllbar. '+s.decision}
update();
return node;
}
root.BidQualification={id:noticed,source,secondary,requirements,answers,status,build};
})(window);