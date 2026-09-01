import{sources}from'./plan-engine.js';

const value=(v,k)=>String(v?.[k]??'').trim();
const field=(label,key,v,required=true)=>({label,key,value:value(v,key),required});
const joinName=(v,prefix)=>[value(v,`${prefix}FirstName`),value(v,`${prefix}LastName`)].filter(Boolean).join(' ');
const address=v=>[value(v,'street'),value(v,'houseNumber')].filter(Boolean).join(' ');

function commonApplicant(v){return[
  {label:'Antragstellende Person',key:'applicantName',value:joinName(v,'applicant'),required:true},
  field('Geburtsdatum antragstellende Person','applicantBirthDate',v),
  {label:'Adresse',key:'address',value:address(v),required:true},
  field('PLZ','postcode',v),field('Ort','city',v),field('E-Mail','email',v,false),field('Telefon','phone',v,false)
]}
function child(v,p){return[
  {label:'Name des Kindes',key:'childName',value:[value(v,'childFirstName'),value(v,'childLastName')].filter(Boolean).join(' '),required:true},
  {label:'Geburtsdatum des Kindes',key:'childBirthDate',value:p.birthDate||value(v,'childBirthDate'),required:true},
  field('Geburtsort des Kindes','childBirthPlace',v),field('Steuer-ID des Kindes','childTaxId',v,false)
]}
function bank(v){return[field('IBAN','iban',v,false),field('Kontoinhaber:in','accountHolder',v,false)]}
function coverage(fields){const required=fields.filter(f=>f.required);const filled=required.filter(f=>f.value);return{filled:filled.length,total:required.length,percent:required.length?Math.round(filled.length/required.length*100):100,missing:required.filter(f=>!f.value)}}

export function buildPacket(taskId,profile,vault={}){
  const byId={
    'birth-registration':()=>{
      const fields=[...commonApplicant(vault),...child(vault,profile),field('Familienstand','maritalStatus',vault,false)];
      return packet('Standesamt / Geburtsbeurkundung','registration',fields,[
        'Geburtsbescheinigung bzw. Unterlagen des Krankenhauses/Geburtshauses',
        'Identitäts- und Personenstandsurkunden nach Anforderung des zuständigen Standesamts'
      ],profile.state==='Berlin'?sources.berlinBirth:sources.checklist,'Wir bereiten die Stammdaten vor; die konkreten Unterlagen unterscheiden sich je Standesamt und Familienkonstellation.');
    },
    'health-insurance':()=>{
      const fields=[...commonApplicant(vault),...child(vault,profile),field('Versichertennummer Elternteil','insuranceNumber',vault,false),field('Krankenkasse','healthInsurer',vault,false)];
      return packet('Krankenkasse','insurance',fields,['Geburtsurkunde / Geburtsnachweis nach Vorgabe der Krankenkasse'],sources.checklist,'Der digitale Meldeweg ist kassenabhängig. Der Lotse bereitet wiederverwendbare Daten vor und öffnet anschließend die offizielle Kasse.');
    },
    'kindergeld':()=>{
      const fields=[...commonApplicant(vault),field('Steuer-ID antragstellende Person','applicantTaxId',vault),...child(vault,profile),...bank(vault)];
      return packet('Kindergeld','benefit',fields,['Steuer-ID der antragstellenden Person','Steuer-ID des Kindes, sobald vorhanden','Weitere Nachweise nur, wenn die Familienkasse sie für den Einzelfall verlangt'],sources.kindergeldApply,'Mit BundID kann der offizielle Online-Antrag ohne Ausdrucken und Unterschrift übermittelt werden. Wir übertragen nichts automatisch an die Familienkasse.');
    },
    'elterngeld':()=>{
      const fields=[...commonApplicant(vault),...child(vault,profile),...bank(vault),field('Steuer-ID antragstellende Person','applicantTaxId',vault,false),field('Arbeitgeber','employerName',vault,false)];
      return packet('Elterngeld','benefit',fields,['Geburtsurkunde für Elterngeld','Einkommensnachweise je nach Erwerbssituation','Nachweise zu Mutterschaftsleistungen, falls relevant','Weitere Unterlagen nach Vorgabe der Elterngeldstelle'],sources.elterngeldApply,'Die genaue Unterlagenliste hängt von Bundesland und Situation ab. Neue Online-Anträge laufen 2026 über mein-elterngeldantrag.de.');
    },
    'maternity-benefit':()=>{
      const fields=[...commonApplicant(vault),...child(vault,profile),field('Versichertennummer','insuranceNumber',vault,false),field('Krankenkasse','healthInsurer',vault,false),...bank(vault)];
      return packet('Mutterschaftsleistungen','benefit',fields,['Geburtsurkunde / Geburtsnachweis','Unterlagen der Krankenkasse oder des Bundesamtes für Soziale Sicherung je nach Versicherungsstatus'],sources.maternity,'Der zuständige Weg hängt vom Versicherungsstatus ab.');
    },
    'paternity':()=>{
      const fields=[...commonApplicant(vault),...child(vault,profile),{label:'Zweiter Elternteil',key:'secondParentName',value:joinName(vault,'secondParent'),required:true}];
      return packet('Vaterschaftsanerkennung','family-law',fields,['Personalausweise/Reisepässe','Geburtsurkunden bzw. weitere Personenstandsurkunden nach Vorgabe der Stelle'],sources.paternity,'Die Anerkennung braucht die erforderlichen Erklärungen der Beteiligten und findet bei einer zuständigen öffentlichen Stelle oder Notar:in statt.');
    },
    'custody':()=>{
      const fields=[...commonApplicant(vault),{label:'Zweiter Elternteil',key:'secondParentName',value:joinName(vault,'secondParent'),required:true},...child(vault,profile)];
      return packet('Gemeinsame Sorge','family-law',fields,['Identitätsnachweise','Vaterschaftsanerkennung bzw. passende Personenstandsnachweise'],sources.custody,'Eine Sorgeerklärung ist eine rechtliche Erklärung und wird nicht durch den Lotse abgegeben.');
    },
    'parental-leave':()=>{
      const fields=[...commonApplicant(vault),field('Arbeitgeber','employerName',vault),field('Arbeitgeber E-Mail','employerEmail',vault,false),field('Beginn Elternzeit','parentalLeaveStart',vault),field('Ende Elternzeit','parentalLeaveEnd',vault),...child(vault,profile)];
      const p=packet('Elternzeit','employment',fields,[],sources.parentalLeave,'Elternzeit wird in Textform beim Arbeitgeber angemeldet. Wenn die Pflichtfelder vorhanden sind, kann der Lotse die fertige Mitteilung erzeugen.');
      p.generatedText=parentalLeaveText(profile,vault,p.coverage.percent===100);
      return p;
    }
  };
  return(byId[taskId]||(()=>packet(taskId,'other',[],[],null,'Kein Paket definiert.')))();
}

function packet(title,category,fields,documents,officialUrl,note){return{title,category,fields,documents,officialUrl,note,coverage:coverage(fields)}}

function parentalLeaveText(profile,v,ready){
  if(!ready)return'';
  const name=joinName(v,'applicant');
  const childName=[value(v,'childFirstName'),value(v,'childLastName')].filter(Boolean).join(' ');
  const start=value(v,'parentalLeaveStart'),end=value(v,'parentalLeaveEnd');
  return `Betreff: Anmeldung meiner Elternzeit\n\nGuten Tag,\n\nhiermit melde ich Elternzeit für mein Kind ${childName || '[Name des Kindes]'}, geboren am ${profile.birthDate}, für den Zeitraum vom ${start} bis einschließlich ${end} an.\n\nBitte bestätigen Sie mir die Anmeldung sowie den angegebenen Zeitraum in Textform.\n\nFreundliche Grüße\n${name}`;
}

export function allEvidence(plan,profile,vault={}){
  const out=[];const seen=new Set();
  plan.forEach(t=>{const p=buildPacket(t.id,profile,vault);p.documents.forEach(d=>{if(!seen.has(d)){seen.add(d);out.push({id:slug(d),label:d,services:[p.title]})}else{const x=out.find(x=>x.id===slug(d));if(x&&!x.services.includes(p.title))x.services.push(p.title)}})});
  return out;
}
function slug(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)}
