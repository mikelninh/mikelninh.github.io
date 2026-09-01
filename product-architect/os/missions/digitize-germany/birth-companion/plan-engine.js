export const sources={
  checklist:'https://familienportal.de/familienportal/lebenslagen/schwangerschaft-geburt/checklisten/checkliste-nach-der-geburt-197882',
  berlinBirth:'https://service.berlin.de/dienstleistung/318957/',
  kindergeld:'https://www.arbeitsagentur.de/familie-und-kinder/infos-rund-um-kindergeld/kindergeld-anspruch-hoehe-dauer',
  kindergeldApply:'https://www.arbeitsagentur.de/familie-und-kinder/downloads-familie-und-kinder/formulare-kindergeld',
  elterngeld:'https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-kann-ich-elterngeld-beantragen--124762',
  elterngeldApply:'https://www.mein-elterngeldantrag.de/',
  maternity:'https://familienportal.de/familienportal/familienleistungen/mutterschaftsleistungen/wie-kann-ich-mutterschaftsgeld-der-gesetzlichen-krankenkasse-berechnen-und-beantragen--125038',
  paternity:'https://familienportal.de/familienportal/lebenslagen/schwangerschaft-geburt/vaterschaftanerkennung',
  custody:'https://familienportal.de/familienportal/lebenslagen/schwangerschaft-geburt/namensrecht-sorgerecht',
  parentalLeave:'https://familienportal.de/familienportal/familienleistungen/elternzeit/faq/wann-und-wie-muss-ich-elternzeit-beantragen--124810'
};

const task=(x)=>({priority:'soon',deadline:null,badge:'',details:[],scope:'official',...x});
export const addDays=(date,n)=>{const d=new Date(date);d.setDate(d.getDate()+n);return d};
export const addMonths=(date,n)=>{const d=new Date(date);d.setMonth(d.getMonth()+n);return d};
const daysBetween=(a,b)=>Math.ceil((new Date(b)-new Date(a))/86400000);
const rank=u=>({overdue:0,today:1,urgent:2,soon:3,later:4}[u]??5);
export const urgencyLabel=u=>({overdue:'Frist prüfen',today:'Heute',urgent:'Jetzt',soon:'Als Nächstes',later:'Später'}[u]||'Offen');

export function urgency(t,now=new Date()){
  const today=new Date(now);today.setHours(0,0,0,0);
  if(t.deadline){const n=daysBetween(today,t.deadline);if(n<0)return'overdue';if(n===0)return'today';if(n<=7)return'urgent';if(n<=30)return'soon';return'later'}
  return t.priority==='now'?'urgent':'soon';
}

export function buildPlan(p,now=new Date()){
  const birth=new Date(p.birthDate+'T12:00:00');
  const isBerlin=p.state==='Berlin';
  const items=[];

  if(p.birthSetting==='home') items.push(task({
    id:'birth-registration',title:'Geburt beim Standesamt melden',priority:'now',deadline:addDays(birth,7),badge:'Zuerst',
    why:isBerlin?'Bei einer Hausgeburt müssen die Eltern die Geburtsbescheinigung beim zuständigen Standesamt vorlegen. Berlin nennt dafür eine Frist von einer Woche.':'Die Bundes-Checkliste sieht die Anmeldung des Kindes beim Standesamt innerhalb von 7 Werktagen vor.',
    next:'Geburtsbescheinigung bereithalten und die Meldung beim Standesamt des Geburtsortes erledigen.',
    source:isBerlin?sources.berlinBirth:sources.checklist,apply:isBerlin?sources.berlinBirth:sources.checklist,
    details:['Zuständig ist grundsätzlich das Standesamt des Geburtsortes.','Bei einer Hausgeburt ist dieser Schritt nicht automatisch durch ein Krankenhaus erledigt.']
  }));
  else items.push(task({
    id:'birth-registration',title:'Beurkundung der Geburt prüfen',priority:'now',badge:isBerlin?'Berlin':'Standesamt',
    why:isBerlin?'In Berlin übermittelt das Krankenhaus oder Geburtshaus die Geburtsanzeige an das Standesamt. Du musst die Beurkundung trotzdem im Blick behalten und ggf. angeforderte Unterlagen liefern.':'Die Bundes-Checkliste nennt die Anmeldung beim Standesamt als ersten formalen Schritt. Bei Klinik- oder Geburtshausgeburten übernimmt die Einrichtung häufig die Geburtsanzeige; der genaue Ablauf ist lokal.',
    next:isBerlin?'Prüfe, ob das Standesamt noch Unterlagen von euch braucht. Berlin stellt drei kostenfreie zweckgebundene Urkunden für Elterngeld, Kindergeld und Krankenkasse aus.':'Prüfe den Ablauf des Standesamts am Geburtsort und ob noch Unterlagen von euch benötigt werden.',
    source:isBerlin?sources.berlinBirth:sources.checklist,apply:isBerlin?sources.berlinBirth:sources.checklist,
    details:isBerlin?['Krankenhaus/Geburtshaus meldet die Geburt.','3 kostenfreie zweckgebundene Urkunden: Elterngeld, Kindergeld, Krankenkasse.']:[]
  }));

  items.push(task({id:'health-insurance',title:'Krankenkasse über die Geburt informieren',priority:'now',badge:'Gesundheit',why:'Die Bundes-Checkliste nennt die Information der Krankenkasse als Aufgabe direkt nach der Geburt.',next:'Öffne die App oder Website deiner Krankenkasse beziehungsweise kontaktiere sie und melde die Geburt. Halte die Geburtsurkunde bzw. den geforderten Nachweis bereit.',source:sources.checklist,details:['Der genaue digitale Prozess hängt von eurer Krankenkasse ab.','Der Companion sendet keine Gesundheits- oder Versicherungsdaten an Dritte.']}));
  items.push(task({id:'kindergeld',title:'Kindergeld beantragen',priority:'now',badge:'259 € / Monat',why:'Kindergeld wird für anspruchsberechtigte Kinder gezahlt. 2026 beträgt es 259 € monatlich pro Kind. Der Antrag bei der Familienkasse ist kostenlos.',next:'Starte den offiziellen Kindergeld-Antrag der Familienkasse. Mit BundID kann der Online-Antrag ohne Ausdrucken und Unterschrift übermittelt werden.',source:sources.kindergeld,apply:sources.kindergeldApply,details:['Nur die Familienkasse entscheidet über den Anspruch.','Keine kostenpflichtigen Drittanbieter nötig.']}));

  if(p.wantsElterngeld==='yes') items.push(task({id:'elterngeld',title:'Elterngeld beantragen',priority:'now',deadline:addMonths(birth,3),badge:'3 Lebensmonate',why:'Elterngeld kann erst nach der Geburt beantragt werden. Das Familienportal empfiehlt den Antrag direkt nach der Geburt und innerhalb der ersten 3 Lebensmonate, weil höchstens 3 Lebensmonate rückwirkend gezahlt werden.',next:'Starte den aktuellen offiziellen Online-Antrag. Für Geburten ab Mitte August 2026 wurde der bisherige ElterngeldDigital-Prozess auf den neuen Dienst mein-elterngeldantrag umgestellt.',source:sources.elterngeld,apply:sources.elterngeldApply,details:['Der Companion berechnet hier keinen Leistungsanspruch.','Die zuständige Elterngeldstelle entscheidet.']}));

  if(p.birthParentEmployment==='employed'&&p.birthParentInsurance==='statutory-member') items.push(task({id:'maternity-benefit',title:'Mutterschaftsgeld nach der Geburt fortführen',priority:'now',badge:'Krankenkasse',why:'Berufstätige Mitglieder einer gesetzlichen Krankenkasse können Mutterschaftsgeld der Krankenkasse erhalten. Nach der Geburt wird die Geburtsurkunde für die Fortzahlung benötigt.',next:'Prüfe den laufenden Antrag bei deiner Krankenkasse und reiche den Geburtsnachweis ein, falls noch nicht geschehen.',source:sources.maternity,details:['Die gesetzliche Krankenkasse ist hier die zuständige Stelle.','Arbeitgeberzuschuss kann zusätzlich relevant sein.']}));
  else if(p.birthParentEmployment==='employed'&&['family-insured','private'].includes(p.birthParentInsurance)) items.push(task({id:'maternity-benefit',title:'Mutterschaftsgeld beim BAS prüfen',priority:'soon',badge:'BAS',why:'Wer privat oder familienversichert ist und wegen der Mutterschutzfristen nicht arbeiten darf, kann unter Voraussetzungen Mutterschaftsgeld des Bundesamtes für Soziale Sicherung erhalten.',next:'Prüfe über die offizielle Familienportal-Information, ob die Voraussetzungen auf dich passen und welche Unterlagen das BAS verlangt.',source:sources.maternity,details:['Der Höchstbetrag dieser BAS-Leistung wird im Familienportal mit insgesamt 210 € beschrieben.','Die konkrete Anspruchsprüfung bleibt bei der zuständigen Stelle.']}));

  if(p.married==='no'&&p.paternityRecognized!=='yes') items.push(task({id:'paternity',title:'Vaterschaft anerkennen',priority:'now',badge:'Falls gewünscht / nötig',why:'Bei unverheirateten Eltern ist eine Vaterschaftsanerkennung erforderlich, damit der Vater rechtlich anerkannt wird; die Mutter muss zustimmen.',next:'Termin beim Jugendamt, Standesamt, Amtsgericht oder Notar organisieren. Die Anerkennung ist auch schon vor der Geburt möglich.',source:sources.paternity,details:['Vaterschaftsanerkennung allein erzeugt noch kein gemeinsames Sorgerecht.']}));
  if(p.married==='no'&&p.wantsJointCustody==='yes') items.push(task({id:'custody',title:'Gemeinsame Sorge erklären',priority:'soon',badge:'Sorgerecht',why:'Bei unverheirateten Eltern führt die Vaterschaftsanerkennung nicht automatisch zu gemeinsamem Sorgerecht.',next:'Sorgeerklärung zum Beispiel beim Jugendamt oder Notar vorbereiten beziehungsweise prüfen, ob sie bereits abgegeben wurde.',source:sources.custody,details:['Wenn die Erklärung bereits erfolgt ist, kannst du diesen Schritt als erledigt markieren.']}));
  if(p.parentalLeave!=='none') items.push(task({id:'parental-leave',title:'Elternzeit beim Arbeitgeber sauber anmelden',priority:'now',badge:'7-Wochen-Regel',why:'Elternzeit wird nicht bei einer Behörde beantragt, sondern dem Arbeitgeber in Textform angekündigt. Grundsätzlich gilt eine Frist von 7 Wochen vor dem gewünschten Beginn.',next:'Prüfe für jeden Elternteil den gewünschten Beginn. Wenn die Elternzeit des nicht gebärenden Elternteils schon ab Geburt laufen soll und noch nicht angemeldet wurde, kläre das sofort mit dem Arbeitgeber.',source:sources.parentalLeave,details:['Für den gebärenden Elternteil beginnt Elternzeit typischerweise erst nach der Mutterschutzfrist.','Lass dir die Anmeldung vom Arbeitgeber bestätigen.']}));

  return items.map(x=>({...x,urgency:urgency(x,now)})).sort((a,b)=>rank(a.urgency)-rank(b.urgency));
}
