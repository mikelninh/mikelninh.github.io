/* RETURN LOOP — supervised character/word n-gram multinomial Naive Bayes model.
 * No API, remote call or external data. Trains on synthetic, human-labeled examples
 * within this browser. NOT a large language model and NOT independently validated.
 * The holdout data is separate from training. */
(function(root){
"use strict";
const TRAIN_ADDITIONS=[["Ein Faden zieht sich quer über die Socke","material"],["Der Stoff ist nach einem Tag eingerissen","material"],["Am Bund hängt ein loses Garn","material"],["Die Ferse ist durchgescheuert","material"],["Die Knöpfe fallen ab","material"],["Reißverschluss geht nach dem Waschen kaputt","material"],["Die Jacke ist schon nach einer Woche beschädigt","material"],["Ein Riss am linken Ärmel","material"],["Leider hat das Oberteil Flecken, die nicht rausgehen","material"],["Die Leggings reißt bei Bewegung","material"],["Ein Loch neben der Sockenspitze","material"],["Der Bund ist direkt ausgeleiert","material"],["Fäden lösen sich aus der Seitennaht","material"],["The stitching came apart immediately","material"],["Fabric ripped after wearing it once","material"],["Quality issue with the sock seams","material"],["Die Sendung hängt beim Versanddienstleister fest","delivery"],["Mein Paket ist im Verteilzentrum stecken geblieben","delivery"],["Wo kann ich meine Lieferung verfolgen?","delivery"],["Ich warte seit einer Woche auf den Versand","delivery"],["Sendungsverfolgung aktualisiert sich nicht","delivery"],["Die Ware wurde mir nicht zugestellt","delivery"],["Der Bote war nicht da","delivery"],["Paket liegt noch beim Zusteller","delivery"],["Delivery is overdue","delivery"],["My package appears to be lost","delivery"],["Still waiting for shipping information","delivery"],["Ich brauche das Paket bis Freitag","delivery"],["Diese Schuhe fallen kleiner aus","size"],["Gibt es das in einer größeren Größe?","size"],["Die Socken sitzen viel zu locker","size"],["Leider viel zu eng geschnitten","size"],["Die Länge passt nicht","size"],["Welche Konfektionsgröße wäre passend?","size"],["Kann ich die Größe M gegen L tauschen?","mixed"],["The shirt is too tight","size"],["The fit isn't right","size"],["Der Schnitt fällt sehr schmal aus","size"],["Ich will den Artikel zurückgeben","return"],["Wo finde ich das Rücksendeetikett?","return"],["Ich möchte von meinem Kauf zurücktreten","return"],["Bitte die Rückzahlung veranlassen","return"],["Wie funktioniert die Rücksendung?","return"],["Wann bekomme ich meine Erstattung?","return"],["Darf ich das Produkt retournieren?","return"],["Please refund my purchase","return"],["I need a return label","return"],["Ich habe Fragen zu meiner Retoure","return"],["Die Hose ist zu klein und ich will sie zurückschicken","mixed"],["Sendung ist spät und die Farbe falsch","mixed"],["Ich möchte meine kaputten Socken umtauschen","mixed"],["Paket verspätet und Naht defekt","mixed"],["Shirt too big and I need a refund","mixed"],["My order is late and the product is damaged","mixed"],["Die Socken haben ein Loch und die Größe passt nicht","mixed"],["Paket kam nicht an, ich möchte Geld zurück","mixed"],["Ich benötige Ersatz wegen eines Risses","mixed"],["Die Lieferung fehlt und ich will stornieren","mixed"],["Zu klein und schon kaputt","mixed"],["Guten Tag, ich melde mich morgen","unknown"],["Das ist nett, vielen Dank","unknown"],["Könnten Sie mich zurückrufen?","unknown"],["Ich brauche einen Beleg für die Buchhaltung","unknown"],["Ist das Produkt vegan?","unknown"],["Ich habe die E-Mail nicht mehr","unknown"],["Gibt es auch eine andere Farbe?","unknown"],["Bitte antworten Sie mir","unknown"],["Ich möchte meine Adresse ändern","unknown"],["Wie sind Ihre Öffnungszeiten?","unknown"],["Super Qualität, vielen Dank","unknown"]];
const HOLDOUT=[["Ich habe am Knie einen Laufmaschen-artigen Riss entdeckt","material"],["Beim ersten Tragen geht das Bündchen auseinander","material"],["Am Kragen hängt ein loser Faden","material"],["Der Zipper funktioniert nicht mehr","material"],["Das Garn hat sich vollständig aufgelöst","material"],["Ich kann den Versandverlauf nicht sehen","delivery"],["Meine Bestellung wird seit Tagen nicht weitertransportiert","delivery"],["Der Zusteller findet meine Haustür nicht","delivery"],["Meine Sendung ist verschwunden","delivery"],["The courier hasn't delivered anything","delivery"],["Meine Schuhe drücken an den Zehen","size"],["Der Pullover sitzt wie ein Zelt","size"],["Die Bundweite stimmt leider nicht","size"],["Ich brauche eine Nummer kleiner","size"],["Die Ärmel sind mir zu kurz","size"],["Ich möchte vom Kauf zurücktreten","return"],["Wo ist mein Rücksendeaufkleber?","return"],["Bitte um Rücküberweisung","return"],["Gibt es ein Formular für einen Widerruf?","return"],["Die Jacke ist gerissen und ich brauche mein Geld zurück","mixed"],["Paket fehlt, außerdem ist die Größe falsch","mixed"],["Die Retoure dauert und die Socken sind kaputt","mixed"],["Ich habe eine Materialreklamation sowie eine Frage zum Versand","mixed"],["Können Sie mir eine Rechnung zuschicken?","unknown"],["Danke, alles angekommen und in Ordnung","unknown"],["Ich interessiere mich für eure Nachhaltigkeitsstandards","unknown"],["Bitte meine Telefonnummer aktualisieren","unknown"],["Das Etikett hat eine andere Farbe","unknown"],["Wo kann ich euch bewerten?","unknown"]];
const classes=["material","delivery","size","return","mixed","unknown"];
const normalize=s=>String(s||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/ß/g,"ss");
function features(s){
 const t=normalize(s).replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
 if(!t)return{};
 const counts=Object.create(null),words=t.split(" ");
 for(const w of words){if(w.length>2){const k="w:"+w;counts[k]=(counts[k]||0)+2}}
 const compact=" "+t+" ";
 for(let i=0;i<compact.length;i++){
  for(let n=3;n<=5;n++){if(i+n>compact.length)continue;const sub=compact.slice(i,i+n);const key="c:"+sub;counts[key]=(counts[key]||0)+1}
 }
 return counts;
}
function train(samples){
 const vocab=new Set(),stat={},priors={};
 for(const c of classes){stat[c]={total:0,tokenCounts:Object.create(null)};priors[c]=0}
 for(const [text,label] of samples){
  if(!classes.includes(label))continue;
  priors[label]++;const f=features(text),obj=stat[label];
  for(const [token,amount]of Object.entries(f)){vocab.add(token);obj.tokenCounts[token]=(obj.tokenCounts[token]||0)+amount;obj.total+=amount}
 }
 const v=vocab.size,alpha=0.45;
 function classify(text){
  const f=features(text);
  if(Object.keys(f).length===0)return{category:"unknown",confidence:"niedrig",margin:0,scores:{},matched:[]};
  const scored=classes.map(c=>{
   const m=stat[c],den=m.total+alpha*v;
   let z=Math.log((priors[c]+0.25)/(samples.length+classes.length*0.25));
   let hit=0;const matched=[];
   for(const [key,amount]of Object.entries(f)){if(!vocab.has(key))continue;
    z+=amount*Math.log((m.tokenCounts[key]||0)+alpha)-amount*Math.log(den);
    if(m.tokenCounts[key]){hit+=amount;if(key.startsWith("w:"))matched.push(key.slice(2))}
   }
   return{category:c,log:z,hit,matched:matched.slice(0,4)};
  }).sort((a,b)=>b.log-a.log);
  const best=scored[0],margin=best.log-scored[1].log,prob=Math.exp(Math.max(-40,Math.min(40,scored[1].log-best.log)));
  const low=best.hit<5||margin<2;
  return{category:best.category,confidence:"nicht kalibriert",needsReview:low,margin:Number(margin.toFixed(2)),scores:Object.fromEntries(scored.map(x=>[x.category,Number(x.log.toFixed(1))])),matched:best.matched,reason:low?"Zu wenig bekannte Textsignale – manuell prüfen":"Trainiertes Naive-Bayes-Textmodell auf synthetischen Sätzen (keine Wahrscheinlichkeitskalibrierung)"};
 }
 return{classify,trainingCount:samples.length,classes,vocabSize:v};
}
const original=root.ReturnTriage;
const training=[...(original?.CASES||[]),...(original?.CHALLENGE||[]),...TRAIN_ADDITIONS];
const model=train(training);
function measure(examples,fn){const rows=examples.map(([text,expected])=>({text,expected,got:fn(text).category}));const ok=rows.filter(x=>x.expected===x.got).length;return{total:rows.length,correct:ok,accuracy:ok/rows.length,errors:rows.filter(x=>x.expected!==x.got),rows}}
const holdoutModel=measure(HOLDOUT,model.classify);
const holdoutRules=measure(HOLDOUT,original.classify);
root.SupportML={...model,training,holdout:HOLDOUT,evaluate:()=>({model:holdoutModel,rules:holdoutRules,limitations:"Separates handgeschriebenes synthetisches Holdout, kein realer Support-Datensatz. Regelbaseline wurde zuvor an anderen synthetischen Challenges entwickelt."})};
})(window);