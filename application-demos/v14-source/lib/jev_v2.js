/**
 * Jev v2 — frozen, synthetic supplemental challenge.
 * Policy frozen from errors in RL-302, RL-308, RL-316, RL-324 before first CH-* Jev run.
 * NEVER modify policy/threshold based on CH-* outputs. A change requires a new blind set.
 * Original challenge snapshot SHA256 (raw ZIP file): 384252e0fbd45a23f8399e9123f0fea4298a292837f47e0bea344e1a81c73ac0.
 */
export const VERSION='jev-v2-frozen-2026-10-22';
export const MODEL='jev-1.14.0';
export const THRESHOLD=.8;
export const TYPES=['quality','fit','shipping','return','order_issue'];
export const BATCH_SIZE=4;
export const CHALLENGE=Object.freeze([
  {
    "id": "CH-001",
    "text": "Zum dritten Mal tritt das Garn an der gleichen Stelle hervor.",
    "gold": [
      "quality"
    ]
  },
  {
    "id": "CH-002",
    "text": "Die Socken halten kaum zwei Spaziergänge, obwohl ich sie kaum wasche.",
    "gold": [
      "quality"
    ]
  },
  {
    "id": "CH-003",
    "text": "Beim Yoga ist die Seitennaht aufgerissen.",
    "gold": [
      "quality"
    ]
  },
  {
    "id": "CH-004",
    "text": "Der Hoodie bleicht bereits nach der ersten Reinigung aus.",
    "gold": [
      "quality"
    ]
  },
  {
    "id": "CH-005",
    "text": "Die Hose kneift im Bund, aber sonst ist sie prima.",
    "gold": [
      "fit"
    ]
  },
  {
    "id": "CH-006",
    "text": "Kann ich Größe L statt S erhalten und dafür die kleinere zurückschicken?",
    "gold": [
      "fit",
      "return"
    ]
  },
  {
    "id": "CH-007",
    "text": "Im Kundenkonto steht geliefert, ich habe aber nichts erhalten.",
    "gold": [
      "shipping"
    ]
  },
  {
    "id": "CH-008",
    "text": "Seit Tagen bewegt sich die Sendungsverfolgung nicht.",
    "gold": [
      "shipping"
    ]
  },
  {
    "id": "CH-009",
    "text": "Das Paket kam beschädigt an, die Ware aber unversehrt.",
    "gold": [
      "shipping"
    ]
  },
  {
    "id": "CH-010",
    "text": "Bitte das Formular zur Rückerstattung senden.",
    "gold": [
      "return"
    ]
  },
  {
    "id": "CH-011",
    "text": "Bei meiner Bestellung fehlte das zweite Paar Socken.",
    "gold": [
      "order_issue"
    ]
  },
  {
    "id": "CH-012",
    "text": "Geliefert wurde schwarz statt weiß, könnt ihr die Lieferung tauschen?",
    "gold": [
      "order_issue",
      "return"
    ]
  },
  {
    "id": "CH-013",
    "text": "Könnt ihr meine Anschrift auf der Rechnung anpassen?",
    "gold": [
      "other"
    ]
  },
  {
    "id": "CH-014",
    "text": "Danke, alles passt super!",
    "gold": [
      "other"
    ]
  },
  {
    "id": "CH-015",
    "text": "Die Jacke ist zu klein, die Naht ist auch schon offen.",
    "gold": [
      "fit",
      "quality"
    ]
  },
  {
    "id": "CH-016",
    "text": "Eine Socke ist gerissen und ich hätte dafür gern eine Erstattung.",
    "gold": [
      "quality",
      "return"
    ]
  }
]);
export const POLICIES=Object.freeze({
  "quality": "Hat die Person eindeutig ein Problem an der WARE selbst beschrieben, z.B. ungewöhnlich frühen Verschleiß, Materialschaden, Loch, offene Naht oder Verfärbung? NICHT: fehlender Artikel, falsch gelieferte Variante, beschädigte Paketverpackung bei unversehrter Ware oder Lieferproblem.",
  "fit": "Beschreibt die Person ausdrücklich zu enge/weite Passform, eine konkrete Größenberatung oder den Wunsch nach einer besser passenden Größe? NICHT: eine falsch GELIEFERTE Artikelgröße ohne geschildertes Passformproblem bzw. gewünschte Größenänderung.",
  "shipping": "Geht es ausdrücklich um Paketversand, Tracking, Zustellung, Lieferverzögerung, beschädigte Versandverpackung oder ein als zugestellt markiertes aber nicht erhaltenes Paket? Ein Retourenetikett allein ist KEIN Versandproblem.",
  "return": "Wünscht die Person ausdrücklich eine Rücksendung, einen Umtausch, Widerruf, eine Rückzahlung, Erstattung oder ein Retourenetikett? NICHT: bloße Mangelmeldung, fehlender Artikel oder unkonkretes 'Könnt ihr helfen?'.",
  "order_issue": "Wurde laut Text ein FALSCHER Artikel bzw. eine falsche gelieferte Variante geliefert oder fehlt ein Artikel/Teil in einer erhaltenen Bestellung? NICHT: vollständig nicht erhaltenes Paket, Lieferstatus, Rechnungsfrage oder Materialschaden an vorhandener Ware."
});
export function getBatch(batch){
 if(!Number.isInteger(batch)||batch<0||batch>=4)throw Error('invalid_batch');
 return CHALLENGE.slice(batch*BATCH_SIZE,(batch+1)*BATCH_SIZE);
}
export function makeRequest(rows){
 if(!Array.isArray(rows)||rows.length!==4)throw Error('invalid_batch_length');
 const questions={};
 for(const row of rows)for(const type of TYPES){
  const key=row.id.replace(/[^A-Za-z0-9]/g,'')+'__'+type;
  questions[key]={type:'noul',instructions:'Bewerte AUSSCHLIESSLICH Fall '+row.id+'. '+POLICIES[type]+' Bewerte nur ausdrücklich vorhandene Aussagen oder klare sinngemäße Beschreibungen, keine vermutete Absicht. Andere Fälle ignorieren.',
   criteria:{true:'Dieses Anliegen ist im Wortlaut oder durch eine klare sinngemäße Aussage belegt.',false:'Nicht genannt oder nur denkbar; keine indirekt hinzugedachte Kundenabsicht.'}};
 }
 return{model:MODEL,state:{task:'Unabhängige Klassifikation frei erfundener deutscher Retail-Support-Texte; jeder Fall separat. Keine fremden Fälle berücksichtigen.',cases:rows.map(({id,text})=>({id,message:text}))},questions};
}
export function normalizeBatch(rows,body){
 if(!body||!body.answers||typeof body.answers!=='object'||Array.isArray(body.answers))throw Error('invalid_jev_response');
 const out=rows.map(x=>{
  const scores={};for(const t of TYPES){
   const key=x.id.replace(/[^A-Za-z0-9]/g,'')+'__'+t;
   const v=body.answers[key];
   if(v?.type!=='noul'||typeof v.noul!=='number'||!Number.isFinite(v.noul)||v.noul<0||v.noul>1)throw Error('invalid_jev_answer_'+key);
   scores[t]=v.noul;
  }
  const categories=TYPES.filter(t=>scores[t]>=THRESHOLD);
  return{id:x.id,scores,categories:categories.length?categories:['other']};
 });
 if(out.length!==rows.length)throw Error('incomplete_result');
 return out;
}
export function scoreBatch(rows,predictions){
 const byId=new Map(predictions.map(x=>[x.id,x]));
 if(byId.size!==rows.length)throw Error('incomplete_result');
 let exact=0,missedQuality=0,falseQualityAlarm=0,additional=0,missing=0;
 const cases=rows.map(row=>{
  const pred=byId.get(row.id);if(!pred)throw Error('missing_prediction');
  const gold=new Set(row.gold),got=new Set(pred.categories);
  const excess=[...got].filter(x=>!gold.has(x)),omitted=[...gold].filter(x=>!got.has(x));
  if(excess.length===0&&omitted.length===0)exact++;
  if(gold.has('quality')&&!got.has('quality'))missedQuality++;
  if(!gold.has('quality')&&got.has('quality'))falseQualityAlarm++;
  additional+=excess.length;missing+=omitted.length;
  return{id:row.id,text:row.text,gold:[...row.gold],pred:pred.categories,scores:pred.scores,excess,omitted};
 });
 return{n:rows.length,exact,missed_quality:missedQuality,false_quality_alarms:falseQualityAlarm,additional_false_categories:additional,missing_expected_categories:missing,cases};
}
