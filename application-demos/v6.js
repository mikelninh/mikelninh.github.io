
/* V6 product proof. No AI calls, external actions, or user-data uploads.
   BIDPILOT: 3 real dated public tenders vs user-entered skills/declared evidence.
   RETURN LOOP: 20 synthetic support tickets grouped by product, with editable review and export. */
(function(){
"use strict";
const isSupport=new URLSearchParams(location.search).get("demo")==="return-loop";
const jobs=[
{id:"714363-2026",name:"Kundenportal für eine Behörde",skill:"web",buyer:"Pro Arbeit – Kreis Offenbach",deadline:"2026-11-13",url:"https://ted.europa.eu/en/notice/-/detail/714363-2026",requirements:"https://app.zuschlagsreif.de/ausschreibung/1406624-deutschland-entwicklung-von-kundenspezifischer-software-konzeption-entwicklung",documented:true},
{id:"719791-2026",name:"KI-Assistent für eine Wohngeldstelle",skill:"ai",buyer:"Landratsamt Unstrut-Hainich-Kreis",deadline:"2026-11-18",url:"https://ted.europa.eu/en/notice/-/detail/719791-2026",documented:false},
{id:"723707-2026",name:"OpenStack-Systeme betreuen",skill:"cloud",buyer:"Dataport AöR",deadline:"2026-11-19",url:"https://ted.europa.eu/en/notice/-/detail/723707-2026",documented:false}
];
const skillLabels={web:"Webentwicklung",ai:"KI-Anwendungen",cloud:"IT-Betrieb"};
function evaluate(profile){
return jobs.map(j=>{
let good=[],obstacles=[],unknown=[];
const expertise=profile.skills.includes(j.skill);
if(expertise)good.push("Dein Team bietet "+skillLabels[j.skill]+" an");
else obstacles.push("Dein Team bietet "+skillLabels[j.skill]+" bisher nicht an");
if(j.documented){
 if(profile.reference==="no")obstacles.push("Geforderte vergleichbare Referenz fehlt laut Teamprofil");
 else if(profile.reference==="unknown")unknown.push("Vergleichbare Referenz noch nicht geklärt");
 else good.push("Referenz laut Selbstauskunft vorhanden");
 if(profile.insurance==="no")obstacles.push("Passende Versicherung laut Teamprofil nicht vorhanden");
 else if(profile.insurance==="unknown")unknown.push("Versicherung noch nachweisen");
 if(profile.security==="no")obstacles.push("Sicherheitsnachweis laut Teamprofil nicht vorhanden");
 else if(profile.security==="unknown")unknown.push("Sicherheitsnachweis noch nachweisen");
 unknown.push("Weitere Teilnahmebedingungen in den Originalunterlagen prüfen");
}else unknown.push("Detaillierte Teilnahmebedingungen sind hier noch nicht erfasst");
const tier=!expertise?3:obstacles.length?2:1;
const status=tier===3?"Nicht priorisieren":tier===2?"Erst Hürden klären":"Fachlich interessant – Prüfung offen";
const next=tier===3?"Nur weiterverfolgen, wenn das Team tatsächlich die nötigen Fähigkeiten hat.":tier===2?"Fehlende Nachweise prüfen. Ob Partner zugelassen sind, steht ausschließlich in den Originalunterlagen.":"Die Originalanzeige öffnen und Anforderungen prüfen, bevor Zeit in ein Angebot fließt.";
return{...j,good,obstacles,unknown,tier,status,next};
}).sort((a,b)=>a.tier-b.tier||a.id.localeCompare(b.id));
}
const names={SOCKS:"Socken",HOODIE:"Kapuzenpullover",TEE:"T-Shirt"};
function seed(){
const t=[];
function push(num,sku,issue,msg){t.push({id:"T-"+String(t.length+1).padStart(3,"0"),order:"DEMO-"+String(t.length+1).padStart(3,"0"),sku,issue,message:msg})}
const defects=["Naht nach dem Waschen gerissen","Socken haben ein Loch","Ferse löst sich auf","Loch nach zwei Wäschen","Material eingerissen","Naht löst sich","Stoff beschädigt"];
defects.forEach(m=>push(1,"SOCKS","material",m));
for(let i=0;i<3;i++)push(i,"SOCKS","delivery","Sockenlieferung noch nicht angekommen");
for(let i=0;i<2;i++)push(i,"SOCKS","size","Socken passen nicht");
for(let i=0;i<4;i++)push(i,"HOODIE","delivery","Pulloverlieferung unklar");
for(let i=0;i<2;i++)push(i,"HOODIE","material","Pullover hat ein Materialproblem");
for(let i=0;i<2;i++)push(i,"","unknown","Bestellung nicht zuordenbar");
return t;
}
function batch(tickets){
const groups=["SOCKS","HOODIE","TEE"].map(sku=>{
const related=tickets.filter(t=>t.sku===sku),material=related.filter(t=>t.issue==="material");
return{sku,name:names[sku],tickets:related,material,flag:material.length>=4}
}).filter(x=>x.tickets.length).sort((a,b)=>Number(b.flag)-Number(a.flag)||b.material.length-a.material.length);
return{total:tickets.length,materials:tickets.filter(t=>t.issue==="material").length,unknown:tickets.filter(t=>!t.sku).length,groups,urgent:groups.find(g=>g.flag)||null};
}
window.DemoCoreV6={evaluate,batch,seed,jobs};
const mount=document.createElement("main");mount.id="v6";mount.dataset.type=isSupport?"support":"tender";
const legacy=document.querySelector("main.wrap");if(legacy){legacy.style.display="none";legacy.insertAdjacentElement("afterend",mount)}else document.body.append(mount);
const css=document.createElement("link");css.rel="stylesheet";css.href="./v6.css";document.head.append(css);
const el=(t,c,s)=>{const n=document.createElement(t);if(c)n.className=c;if(s!==undefined)n.textContent=String(s);return n};
const add=(p,...x)=>{p.append(...x);return p};
const p=(s,c)=>el("p",c||"",s);
const link=(s,url)=>{const n=el("a","",s);n.href=url;n.target="_blank";n.rel="noopener noreferrer";return n};
const button=(s,cb,c)=>{const n=el("button",c||"v6-main",s);n.type="button";n.addEventListener("click",cb);return n};
const capture=(s)=>String(s||"").trim().slice(0,350);
function download(name,content){const blob=new Blob([content],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function intro(kicker,title,lead,steps){
mount.append(el("div","v6-k",kicker));const h=el("h1");h.innerHTML=title;mount.append(h,p(lead,"v6-lead"));
const cards=el("div","v6-steps");steps.forEach((x,i)=>cards.append(add(el("div","v6-step"),el("b","",String(i+1).padStart(2,"0")+" · "+x[0]),p(x[1]))));mount.append(cards);
}
function section(k,t){return add(el("section","v6-panel"),el("div","v6-k",k),el("h2","",t))}
function rowlabel(container,name,id,valueList){
const lab=el("label","",name),sel=el("select");sel.id=id;lab.htmlFor=id;
valueList.forEach(([v,title])=>{const opt=el("option","",title);opt.value=v;sel.append(opt)});
container.append(lab,sel);return sel;
}
function bottom(text,url,label){const bar=el("div","v6-foot");bar.append(p(text,"v6-tiny"),link(label,url));mount.append(bar)}
function summaryBox(parent,title,message,kind){parent.append(add(el("div",kind||"v6-box"),el("strong","",title),p(message)))}
function renderBid(){
document.title="BIDPILOT · Welche Aufträge lohnen sich?";intro("BIDPILOT · A11 / PRODUKTENTWICKLUNG","Welche Aufträge lohnen<br><em>unsere Zeit?</em>","Beschreibe dein Team. BIDPILOT vergleicht drei echte öffentliche Aufträge und erklärt, welche Hindernisse du vor einer Bewerbung klären solltest.",[
["Problem","Kleine Teams verbringen viel Zeit mit Aufträgen, für die sie vielleicht gar nicht infrage kommen."],
["Lösung","Ein Vergleich, der fachliche Nähe und erkennbare Hürden sichtbar macht."],
["Probieren","Team auswählen, drei Aufträge vergleichen, Einschätzung herunterladen."]
]);
const grid=el("div","v6-layout"),left=section("01 / DEIN TEAM","Was könnt ihr?"),right=section("02 / DEIN VERGLEICH","Wo lohnt sich ein zweiter Blick?");
grid.append(left,right);mount.append(grid);
left.append(p("Starte mit einem Beispielteam. Danach kannst du die Angaben ändern.","v6-mute"));
const presetRow=el("div","v6-actions");left.append(presetRow);
const skills={};left.append(el("label","","Leistungen deines Teams"));
for(const [key,name]of Object.entries(skillLabels)){
const line=el("div","v6-check"),box=el("input");box.type="checkbox";box.id="v6-"+key;const lab=el("label","",name);lab.htmlFor=box.id;line.append(box,lab);left.append(line);skills[key]=box}
const reference=rowlabel(left,"Erfahrung mit vergleichbaren Behördenprojekten?","v6-ref",[["unknown","Weiß ich nicht"],["no","Noch nicht"],["yes","Ja"]]);
const insurance=rowlabel(left,"Passende Berufshaftpflicht?","v6-ins",[["unknown","Weiß ich nicht"],["no","Noch nicht"],["yes","Ja"]]);
const security=rowlabel(left,"IT-Sicherheitsnachweis vorhanden?","v6-sec",[["unknown","Weiß ich nicht"],["no","Noch nicht"],["yes","Ja"]]);
const presets=[["Webstudio",["web"],"no","unknown","unknown"],["KI-Team",["web","ai"],"unknown","unknown","unknown"],["IT-Betrieb",["cloud"],"unknown","unknown","unknown"]];
let last=[],profile={},choices={};
function usePreset(i){let v=presets[i];Object.entries(skills).forEach(([key,box])=>box.checked=v[1].includes(key));reference.value=v[2];insurance.value=v[3];security.value=v[4];Array.from(presetRow.children).forEach((b,j)=>b.setAttribute("aria-pressed",String(i===j)))}
presets.forEach((a,i)=>presetRow.append(button(a[0],()=>{usePreset(i);run()},"v6-sub")));
const result=el("div");right.append(result);
left.append(add(el("div","v6-actions"),button("Drei Aufträge vergleichen →",run)));
left.append(p("Deine Angaben sind Selbstauskünfte, keine geprüften Nachweise.","v6-tiny"));
bottom("Öffentliche Aufträge aus einem datierten Datensatz vom 20.10.2026. Nur für das Kundenportal liegen hier einzelne veröffentlichte Anforderungen vor. Vollständige Originalunterlagen und aktuelle Fristen müssen geprüft werden.","https://mikelninh.github.io/bidpilot/#product-study","Ausführliche Produktstudie ↗");
function run(){
profile={skills:Object.entries(skills).filter(([,v])=>v.checked).map(([k])=>k),reference:reference.value,insurance:insurance.value,security:security.value};last=evaluate(profile);choices={};paint();
}
function paint(){result.replaceChildren();const top=last[0];
summaryBox(result,"Dein sinnvollster nächster Schritt",top.tier===1?top.name+": fachlich naheliegend. Prüfe die Teilnahmebedingungen.":top.tier===2?top.name+": mögliche Hürden zuerst klären.":"Bei diesen drei Beispielen ist keine fachlich naheliegende Gelegenheit erkennbar.");
result.append(p("Vorläufige Priorität – keine automatische Eignungsentscheidung.","v6-tiny"));
for(const j of last){
const card=el("article","v6-item");card.append(el("span","v6-status "+(j.tier===2?"warn":j.tier===3?"skip":""),j.status),el("h3","",j.name),p(j.buyer+" · Frist laut Datensatz: "+j.deadline,"v6-mute"));
if(j.good.length)card.append(p("✓ "+j.good.join("; ")));
if(j.obstacles.length)card.append(p("! "+j.obstacles.join("; ")));
card.append(p("Noch prüfen: "+j.unknown.join("; ")),link("Original-Auftrag ↗",j.url));
const info=el("details");info.append(el("summary","","Warum diese Empfehlung?"),p(j.next,"v6-mute"));
if(j.requirements)info.append(link("Veröffentlichte Anforderungen ↗",j.requirements));card.append(info);
const actions=el("div","v6-actions");for(const [value,label]of [["review","Weiter prüfen"],["hold","Noch offen"],["skip","Überspringen"]]){
const b=button(label,()=>{choices[j.id]=value;Array.from(actions.children).forEach(x=>x.setAttribute("aria-pressed",String(x===b)))},"v6-sub");b.setAttribute("aria-pressed",String(choices[j.id]===value));actions.append(b)}
card.append(actions);result.append(card)}
result.append(add(el("div","v6-actions"),button("Vergleich & Entscheidungen herunterladen ↗",()=>{
const lines=["BIDPILOT · VERGLEICH",new Date().toISOString(),"Datenstand: 20.10.2026","Teamfähigkeiten: "+profile.skills.join(", "),"Behördenreferenz: "+profile.reference,"Versicherung: "+profile.insurance,"IT-Nachweis: "+profile.security,""];
last.forEach(j=>lines.push(j.name,"Quelle: "+j.url,"Status: "+j.status,"Positive Hinweise: "+j.good.join("; "),"Hürden: "+j.obstacles.join("; "),"Unklar: "+j.unknown.join("; "),"Nächster Schritt: "+j.next,"Meine Entscheidung: "+(choices[j.id]||"noch offen"),""));
lines.push("Es handelt sich um eine vorläufige Einordnung, nicht um eine Eignungsprüfung oder Aussage über Gewinnchancen.");
download("bidpilot-auftragsvergleich.txt",lines.join("\n"));
})));
}
usePreset(0);result.append(add(el("div","v6-empty"),el("strong","","Welcher Auftrag passt zu deinem Team?"),p("Vergleiche drei reale Projekte mit deinen Fähigkeiten – mit Gründen statt erfundenen Prozentzahlen.")));
}
function renderSupport(){
document.title="RETURN LOOP · Muster im Kundenservice erkennen";intro("RETURN LOOP · SNOCKS / AI ENGINEERING","Was übersehen wir<br><em>im Kundenservice?</em>","Ein einzelnes Ticket beantworten ist leicht. Zwanzig zusammenhängende Anfragen können aber ein wichtiges Produktproblem sichtbar machen.",[
["Problem","Wiederkehrende Beschwerden gehen zwischen einzelnen Tickets unter."],
["Lösung","Kundenanfragen nach Produkt und Art des Problems zusammenfassen."],
["Probieren","20 Fälle auswerten, betroffene Tickets öffnen, Prüfbericht sichern."]
]);
const grid=el("div","v6-layout"),left=section("01 / BEISPIELDATEN","20 Kundenanfragen"),right=section("02 / MUSTER ERKENNEN","Was fällt auf?");
grid.append(left,right);mount.append(grid);let tickets=seed(),imported=false;
left.append(p("Erfundene Bestellungen und Supportanfragen: kaputte Socken, Lieferfragen, Größenprobleme und unbekannte Bestellungen.","v6-mute"));
const counts=el("div","v6-tags");left.append(counts);
function tally(){counts.replaceChildren(el("span","v6-tag",tickets.length+" Tickets"),el("span","v6-tag","3 Produktarten"),el("span","v6-tag","Nur lokale Verarbeitung"))}
tally();const result=el("div");right.append(result);
left.append(add(el("div","v6-actions"),button("Alle Anfragen auswerten →",run)));
const more=el("details");more.append(el("summary","","Optional: Einen weiteren Fall hinzufügen"));
const product=rowlabel(more,"Produkt","v6-product",[["SOCKS","Socken"],["HOODIE","Kapuzenpullover"],["TEE","T-Shirt"],["","Unbekannt"]]);
const issue=rowlabel(more,"Art des Problems","v6-issue",[["material","Produkt kaputt"],["delivery","Lieferung"],["size","Größe"],["unknown","Sonstiges"]]);
more.append(el("label","","Kundennachricht"));
const message=el("textarea");message.value="Bei den Socken hat sich die Naht gelöst.";more.append(message);
const feedback=p("","v6-tiny");
more.append(add(el("div","v6-actions"),button("Ticket hinzufügen →",()=>{const msg=capture(message.value);if(msg.length<5){feedback.textContent="Bitte eine Nachricht mit mindestens fünf Zeichen eingeben.";return}if(tickets.length>=300){feedback.textContent="Maximal 300 Tickets.";return}
tickets.push({id:"N-"+(tickets.length+1),order:"TEST-"+(tickets.length+1),sku:product.value,issue:issue.value,message:msg});feedback.textContent="Ticket hinzugefügt und Ergebnis neu berechnet.";tally();run()},"v6-sub")),feedback);left.append(more);
left.append(add(el("div","v6-actions"),button("Beispiele zurücksetzen",()=>{tickets=seed();imported=false;tally();run()},"v6-sub")));
const fileSection=el("details");fileSection.append(el("summary","","Optional: Eigene anonymisierte CSV testen"));
fileSection.append(p("Format: ticket_id,order_id,sku,issue,message. issue = material, delivery, size oder unknown. SKU = SOCKS, HOODIE, TEE oder leer. Keine Namen oder persönlichen Daten eingeben.","v6-mute"));
const upload=el("input");upload.type="file";upload.accept=".csv,text/csv";upload.setAttribute("aria-label","Anonymisierte CSV-Datei auswählen");
const fileStatus=p("","v6-tiny");fileSection.append(upload,fileStatus);left.append(fileSection);
upload.addEventListener("change",async()=>{
const file=upload.files?.[0];if(!file)return;
try{if(file.size>200000)throw Error("Maximal 200 KB");
const raw=await file.text(),lines=raw.trim().replace(/^\uFEFF/,"").split(/\r?\n/),header=lines.shift().split(",").map(x=>x.trim().toLowerCase());const cols=["ticket_id","order_id","sku","issue","message"];
if(cols.some(c=>!header.includes(c)))throw Error("Spalten fehlen: "+cols.join(", "));
const next=[];
for(const ln of lines){if(!ln.trim())continue;const fields=ln.split(",");if(fields.length!==header.length)throw Error("Bitte keine Kommas innerhalb von Feldern verwenden.");
const o=Object.fromEntries(header.map((h,i)=>[h,(fields[i]||"").trim()]));
if(!["material","delivery","size","unknown"].includes(o.issue))throw Error("Unbekannte Kategorie");if(!["SOCKS","HOODIE","TEE",""].includes(o.sku))throw Error("Unbekannte Produktnummer");if(!o.ticket_id||!o.message)throw Error("ID oder Nachricht fehlt");
next.push({id:o.ticket_id.slice(0,40),order:o.order_id.slice(0,40),sku:o.sku,issue:o.issue,message:o.message.slice(0,350)});
if(next.length>300)throw Error("Maximal 300 Tickets");
}
if(!next.length)throw Error("Keine Tickets gefunden");tickets=next;imported=true;tally();fileStatus.textContent=next.length+" Fälle lokal importiert.";run();
}catch(err){fileStatus.textContent="Nicht eingelesen: "+err.message}
});
left.append(p("Feste Kategorien und eine einfache Zählregel – keine automatisch laufende KI. Es gibt keine Live-Verbindung zum Shop oder Support.","v6-tiny"));
bottom("Nur synthetische oder von dir lokal eingelesene, anonymisierte Tickets. Es werden keine externen Aktionen ausgeführt. Die Ticketanzahl ist keine statistische Produktfehlerquote.","https://return-loop-proof-mn-2026.vercel.app/","Separater technischer Prototyp ↗");
function run(){const d=batch(tickets);result.replaceChildren();const stats=el("div","v6-metrics");
for(const [count,label]of [[d.total,"Anfragen geprüft"],[d.materials,"Materialmeldungen"],[d.unknown,"Unbekannte Bestellungen"]])stats.append(add(el("div","v6-metric"),el("strong","",count),el("span","",label)));
result.append(stats);
if(d.urgent)summaryBox(result,"Auffällig: "+d.urgent.material.length+" ähnliche Meldungen zu "+d.urgent.name,"Das Team sollte diese Fälle gemeinsam prüfen. Es ist noch kein bestätigter Defekt.");
else summaryBox(result,"Kein auffälliges Muster nach der Demo-Regel","In keiner Produktgruppe gibt es mindestens vier als Materialproblem markierte Meldungen.");
result.append(p("Signalregel: Ab vier Materialmeldungen zu einem Produkt wird eine Prüfung vorgeschlagen. Diese Schwelle ist frei für die Demo gesetzt und nicht validiert.","v6-tiny"));
const reviews=[];
for(const group of d.groups){const card=el("article","v6-item");card.append(el("h3","",group.name),p(group.material.length+" Materialmeldungen · "+group.tickets.length+" Anfragen zu diesem Produkt"));
const detail=el("details");detail.append(el("summary","",group.tickets.length+" Nachrichten ansehen"));group.tickets.forEach(t=>detail.append(el("div","v6-ticket",t.id+" · "+t.message)));card.append(detail);
if(group.flag){const box=el("div","v6-box");box.append(el("strong","","Vorschlag für das Produktteam"));
const draft=el("textarea");draft.value="Bitte "+group.material.length+" Beschwerden zu "+group.name+" prüfen. Hinweise auf die Naht bzw. das Material vergleichen und die betroffenen Kundenfälle einzeln bearbeiten. Kein Defekt bestätigt.";
box.append(draft);
const flag=el("input");flag.type="checkbox";flag.id="v6-approve-"+group.sku;const label=el("label","","Für menschliche Prüfung vormerken");label.htmlFor=flag.id;box.append(add(el("div","v6-check"),flag,label));card.append(box);
reviews.push({sku:group.sku,flag,draft})}
result.append(card)}
result.append(add(el("div","v6-actions"),button("Qualitätsbericht herunterladen ↗",()=>{
const lines=["RETURN LOOP · QUALITÄTSAUSWERTUNG",new Date().toISOString(),"Quelle: "+(imported?"anonymisierte lokale CSV":"20 synthetische Beispiel-Tickets"),"Tickets: "+d.total,"Materialmeldungen: "+d.materials,"Keine Produktzuordnung: "+d.unknown,""];
d.groups.forEach(g=>lines.push("Produkt: "+g.name,"Materialmeldungen: "+g.material.length,"Gesamtmeldungen: "+g.tickets.length,"Signal: "+(g.flag?"zur Prüfung vorgeschlagen":"keine Schwellenüberschreitung"),""));
reviews.forEach(v=>lines.push("Produkt: "+v.sku,"Menschliche Prüfung vorgemerkt: "+(v.flag.checked?"Ja":"Nein"),"Notiz: "+capture(v.draft.value),""));
lines.push("TICKETS:");tickets.forEach(t=>lines.push([t.id,t.order,t.sku||"unbekannt",t.issue,t.message].join(" | ")));
lines.push("Keine Backend-Speicherung, kein Versand, keine statistisch bestätigte Fehlerquote.");
download("return-loop-qualitaetsbericht.txt",lines.join("\n"));
})));
}
result.append(add(el("div","v6-empty"),el("strong","","Was fällt heute auf?"),p("Prüfe 20 Kundenanfragen mit einem Klick und sieh, welches Produkt besondere Aufmerksamkeit verdient.")));
}
if(isSupport)renderSupport();else renderBid();
})();