/* RETURN LOOP — transparent, deterministic support triage and evaluation.
 * Input text is never sent to an AI model or a remote endpoint.
 * Synthetic fixtures & human-authored evaluation only; not a production accuracy claim. */
(function(root){
"use strict";
const LABELS={material:"Material / Defekt",delivery:"Lieferung",size:"Größe / Passform",return:"Rückgabe",mixed:"Mehrere Themen",unknown:"Nicht eindeutig"};
const SIGNALS={
material:[/\bloch(?:er|e|s)?\b/g,/\bnaht\w*(?:\s+\w+){0,3}\s+(?:gerissen|auf|loest|loesen)\b/g,/\b(?:gerissen|eingerissen|riss|kaputt\w*|defekt|beschaedigt|beschaedigung|beschadigt|beschadigung|franst|aufgerissen|fehlerhaft|materialproblem|stoffproblem|faden|faeden)\b/g,/\b(?:torn|broken|ripped|hole|holes|seam|fraying|damaged|defective)\b/g,/\b(?:materialfehler|nahtfehler|stofffehler)\b/g],
delivery:[/\b(?:liefer\w*|versand\w*|paket\w*|sendung\w*|tracking\w*|zustell\w*|zugestellt|verspaetet|lieferstatus|liefertermin)\b/g,/\b(?:delivery|delivered|shipping|shipment|parcel|tracking|late arrival)\b/g,/\b(?:wo\s+bleibt|nicht\s+angekommen|noch\s+nicht\s+da)\b/g],
size:[/\b(?:groesse|grosse|passform|zu\s+klein|zu\s+gross|passt\s+nicht|passen\s+nicht|sitzt\s+nicht|fallen\s+klein|fallen\s+gross|size|sizing|too\s+small|too\s+large|doesnt\s+fit)\b/g],
return:[/\b(?:retoure|rueckgabe|ruckgabe|ruecksenden|rucksenden|ruecksendung|rucksendung|umtausch|umtauschen|zurueckgeben|zuruckgeben|widerruf|refund|return|exchange|erstattung)\b/g]
};
function norm(raw){return String(raw||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/ß/g,"ss").replace(/[’']/g,"").trim();}
function maskedNegation(text,start,phrase){
 const before=text.slice(Math.max(0,start-22),start);
 // Never negate shipping/return language (e.g. "nicht angekommen" is a delivery problem).
 return /\b(?:kein(?:e|en|em|er)?|nicht|ohne|no|not)\s+(?:(?:neue|weiteren?|sichtbare|direkten?)\s+)?$/.test(before) && !/\bnaht\b/.test(phrase);
}
function classify(raw){
 const text=norm(raw);
 if(text.length<7)return{category:"unknown",confidence:"niedrig",evidence:[],reason:"Zu kurze oder leere Nachricht; menschliche Rückfrage nötig",scores:{}};
 const matches={},scores={};
 for(const [cat,regexes] of Object.entries(SIGNALS)){
 let found=[];
 for(const regex of regexes){regex.lastIndex=0;for(const m of text.matchAll(regex)){
  if(cat==="material"&&(maskedNegation(text,m.index,m[0])||/\b(?:kein|keine|nicht|not|no)\b/.test(m[0])))continue;
  found.push(m[0]);if(found.length>8)break;
 }}
 matches[cat]=[...new Set(found)];scores[cat]=matches[cat].length;
 }
 const active=Object.keys(scores).filter(cat=>scores[cat]>0);
 if(active.length===0)return{category:"unknown",confidence:"niedrig",evidence:[],reason:"Keine ausreichend eindeutigen Hinweise gefunden",scores};
 if(active.length>1){
 const labels=active.map(x=>LABELS[x]).join(" + ");
 return{category:"mixed",confidence:"niedrig",evidence:active.flatMap(x=>matches[x].map(v=>x+": "+v)).slice(0,7),reason:"Mehrere Themen erkannt ("+labels+"); bitte manuell prüfen",scores};
 }
 const category=active[0],evidence=matches[category].slice(0,5),confidence=evidence.length>1?"hoch":"mittel";
 return{category,confidence,evidence,reason:"Text enthält Hinweise auf "+LABELS[category]+"; Regeln, keine KI-Prognose",scores};
}
function analyze(tickets,overrides={}){
 const enriched=tickets.map(t=>{
  const predicted=classify(t.message);
  const override=Object.prototype.hasOwnProperty.call(overrides,t.id)?overrides[t.id]:null;
  const selected=(override && ["material","delivery","size","return","unknown"].includes(override))?override:predicted.category;
  return{...t,predicted:predicted.category,confidence:predicted.confidence,evidence:predicted.evidence,reason:predicted.reason,category:selected,review:selected==="mixed"||selected==="unknown"||predicted.confidence==="niedrig",overridden:selected!==predicted.category}
 });
 const groups=["SOCKS","HOODIE","TEE"].map(sku=>{
  const related=enriched.filter(t=>t.sku===sku),material=related.filter(t=>t.category==="material");
  return{sku,name:{SOCKS:"Socken",HOODIE:"Kapuzenpullover",TEE:"T-Shirt"}[sku],tickets:related,material,flag:material.length>=4};
 }).filter(g=>g.tickets.length).sort((a,b)=>Number(b.flag)-Number(a.flag)||b.material.length-a.material.length);
 return{total:enriched.length,materials:enriched.filter(t=>t.category==="material").length,unknown:enriched.filter(t=>!t.sku).length,needsReview:enriched.filter(t=>t.review).length,groups,urgent:groups.find(g=>g.flag)||null,tickets:enriched};
}
const CASES=[
["Meine Socken haben nach zwei Wäschen ein Loch","material"],["Der Stoff ist bereits nach einem Tag gerissen","material"],["Die Naht löst sich auf","material"],["Die Ferse ist kaputt","material"],["Bei der Hose franst das Material aus","material"],["This shirt has a hole","material"],["The seam is torn","material"],["Schon beim Auspacken beschädigt","material"],["Die Schuhe sind defekt","material"],
["Meine Lieferung fehlt noch","delivery"],["Wo bleibt mein Paket?","delivery"],["Das Paket ist nicht angekommen","delivery"],["Gibt es eine Sendungsnummer?","delivery"],["Die Zustellung verspätet sich","delivery"],["Tracking zeigt nichts an","delivery"],["My parcel has not arrived","delivery"],["Das Paket wurde zugestellt, ist aber nicht da","delivery"],
["Das T-Shirt ist zu klein","size"],["Die Socken passen nicht","size"],["Welche Größe soll ich nehmen?","size"],["Die Passform stimmt nicht","size"],["Pullover ist zu groß","size"],["The shoes are too small","size"],
["Wie kann ich die Ware zurücksenden?","return"],["Ich möchte die Retoure anmelden","return"],["Kann ich die Größe umtauschen?","mixed"],["Ich möchte eine Rückgabe anmelden","return"],["How do I return the item?","return"],["Ich brauche eine Erstattung","return"],
["Hallo, danke","unknown"],["Können Sie mir helfen?","unknown"],["Danke für die schnelle Hilfe","unknown"],["Ich habe eine Frage","unknown"],["Everything is fine","unknown"],
["Die Socken sind kaputt und die Lieferung war spät","mixed"],["Die Socken sind zu klein und ich möchte eine Retoure","mixed"],["Paket fehlt und das Shirt ist gerissen","mixed"],["Ich will die kaputten Schuhe zurückgeben","mixed"],
["Keine Löcher, alles bestens","unknown"],["Die Socken sind nicht kaputt","unknown"],["Naht nicht gerissen, aber Größe passt nicht","size"],["Mein Versand war schnell, das Material ist aber kaputt","mixed"]
];
function evaluate(){
 const rows=CASES.map(([message,expected],i)=>({id:"E-"+String(i+1).padStart(2,"0"),message,expected,...classify(message)}));
 const ok=rows.filter(r=>r.category===r.expected).length;
 const wrong=rows.filter(r=>r.category!==r.expected);
 const predictedMaterial=rows.filter(r=>r.category==="material"),trueMaterial=predictedMaterial.filter(r=>r.expected==="material").length;
 const expectedMaterial=rows.filter(r=>r.expected==="material").length;
 const recall=expectedMaterial?trueMaterial/expectedMaterial:0,precision=predictedMaterial.length?trueMaterial/predictedMaterial.length:0;
 return{total:rows.length,correct:ok,accuracy:ok/rows.length,materialPrecision:precision,materialRecall:recall,errors:wrong,rows,label:"Manuell erstellte synthetische Beispielsätze – keine unabhängige Validierung"};
}
root.ReturnTriage={classify,analyze,evaluate,CASES,LABELS};
})(window);