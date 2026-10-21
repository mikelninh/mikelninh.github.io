/* APPLICATION LAB · FINAL v9. Two useful 60-second stories, source/evidence second.
 * All custom data processed locally. No claims of production use or legal eligibility. */
(function(){
"use strict";
const support=new URLSearchParams(location.search).get("demo")==="return-loop";
const C=window.ApplicationV9Core,T=window.ReturnTriage,M=window.SupportML,E=window.BidScreening;
if(!C||!T||!M||!E){document.body.append(Object.assign(document.createElement("p"),{textContent:"Die Demo konnte nicht vollständig geladen werden. Bitte Seite neu laden."}));return}
const main=document.createElement("main");main.id="v9";main.dataset.mode=support?"support":"bid";
const previous=document.querySelector("main.wrap");if(previous){previous.style.display="none";previous.insertAdjacentElement("afterend",main)}else document.body.append(main);
document.title=support?"RETURN LOOP · Probleme erkennen · Michael Ninh":"BIDPILOT · Bessere Auftragsentscheidungen · Michael Ninh";
const n=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
const add=(parent,...children)=>{parent.append(...children);return parent};
const txt=(text,cls)=>n("p",cls||"",text);
const anchor=(text,url)=>{const x=n("a","",text);x.href=url;x.target="_blank";x.rel="noopener noreferrer";return x};
const button=(text,cb,cls="v9-primary")=>{const x=n("button",cls,text);x.type="button";x.addEventListener("click",cb);return x};
const label=(text,id)=>{const x=n("label","",text);x.htmlFor=id;return x};
const select=(options,id)=>{const x=n("select");if(id)x.id=id;options.forEach(([v,text])=>{const o=n("option","",text);o.value=v;x.append(o)});x.value=options[0][0];return x};
const clean=(x,max=1000)=>String(x||"").trim().slice(0,max);
const disclosure=(heading,description)=>{const x=n("details","v9-expand");x.append(n("summary","",heading));if(description)x.append(txt(description,"v9-muted"));return x};
function saveFile(name,content){const b=new Blob([content],{type:"text/plain;charset=utf-8"}),href=URL.createObjectURL(b),a=document.createElement("a");a.href=href;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1800)}
const stamp=new Date().toISOString().slice(0,10);
function header(kicker,heading,intro){
 main.append(n("div","v9-eyebrow",kicker));const h=n("h1");h.innerHTML=heading;main.append(h,txt(intro,"v9-intro"));
}
function card(title,sub){const x=n("section","v9-card");if(title)x.append(n("h2","",title));if(sub)x.append(txt(sub,"v9-muted"));return x}
function callout(title,subtitle,className=""){return add(n("div","v9-callout "+className),n("strong","",title),txt(subtitle,"v9-muted"))}
function miniStat(value,title){return add(n("div","v9-stat"),n("strong","",value),n("span","",title))}
function resourceFooter(message){main.append(add(n("footer","v9-footer"),txt(message),anchor("Code, Methoden und Tests ↗","https://github.com/mikelninh/mikelninh.github.io/tree/main/application-demos")))}
function pill(title){return n("span","v9-pill",title)}
function bidpilot(){
header("BIDPILOT · A11 / JUNIOR PRODUCT MANAGER","Nicht jeder Auftrag ist<br><em>unsere Zeit wert.</em>","Eine kleine Softwarefirma sucht neue Projekte. Diese Demo hilft, eine vielversprechende Möglichkeit zu erkennen – und eine mögliche Zeitfalle früh auszusortieren.");
const stage=n("div","v9-stage"),left=card("1 · Für wen suchen wir?","Wähle ein Beispielteam. Du kannst danach die Angaben ändern."),right=card("2 · Welche Entscheidung ergibt sich?","");
stage.append(left,right);main.append(stage);
const presets=[{name:"Webstudio",skills:["web"],focus:"web",reference:"no"},{name:"KI-Team",skills:["web","ai"],focus:"ai",reference:"unknown"},{name:"IT-Betrieb",skills:["cloud"],focus:"cloud",reference:"unknown"}];
const presetButtons=n("div","v9-options");left.append(presetButtons);
const custom=disclosure("Teamangaben selbst anpassen");
const skillCheckboxes={};
for(const[key,title]of [["web","Webentwicklung"],["ai","KI-Anwendungen"],["cloud","Server & IT-Betrieb"]]){
 const row=n("div","v9-check"),check=n("input");check.type="checkbox";check.id="v9-skill-"+key;row.append(check,label(title,check.id));skillCheckboxes[key]=check;custom.append(row);
}
function field(title,id,opts){const x=select(opts,id);custom.append(label(title,id),x);return x}
const ref=field("Vergleichbares Behördenprojekt bereits umgesetzt?","v9-ref",[["unknown","Noch unklar"],["yes","Ja"],["no","Nein"]]);
const insurance=field("Passende Berufshaftpflicht?","v9-insurance",[["unknown","Noch unklar"],["yes","Ja"],["no","Nein"]]);
const security=field("Nachweis zur IT-Sicherheit?","v9-security",[["unknown","Noch unklar"],["yes","Ja"],["no","Nein"]]);
const queryField=n("input");queryField.type="text";queryField.id="v9-query";queryField.placeholder="z. B. Kundenportal, Datenanalyse";
custom.append(label("Optionale eigene Suchbegriffe","v9-query"),queryField);
const excludeField=n("input");excludeField.type="text";excludeField.id="v9-exclude";excludeField.placeholder="z. B. Wartung, Windows";
custom.append(label("Ausschließen","v9-exclude"),excludeField);
left.append(custom);
const availability=txt("Öffentliche Aufträge werden geladen …","v9-caption");left.append(availability);
const output=n("div");right.append(output);
let state={active:0,feed:[],asOf:"2026-10-20",offline:false,summary:null,profile:null,choices:{},loaded:false};
function profile(){return{skills:Object.keys(skillCheckboxes).filter(k=>skillCheckboxes[k].checked),focus:skillCheckboxes[presets[state.active].focus].checked?presets[state.active].focus:Object.keys(skillCheckboxes).find(k=>skillCheckboxes[k].checked)||"",reference:ref.value,insurance:insurance.value,security:security.value,query:queryField.value,exclusions:excludeField.value}}
function preset(i){state.active=i;const x=presets[i];Object.entries(skillCheckboxes).forEach(([key,box])=>box.checked=x.skills.includes(key));ref.value=x.reference;insurance.value="unknown";security.value="unknown";[...presetButtons.children].forEach((b,j)=>b.setAttribute("aria-pressed",String(i===j)));run();}
presets.forEach((x,i)=>presetButtons.append(button(x.name,()=>preset(i),"v9-choice")));
const rerun=button("Mein Team prüfen →",run,"v9-primary");
left.append(add(n("div","v9-actions"),rerun));
const caveat=disclosure("Warum gerade diese Lösung?","Produktannahme: Ein kleines Team spart Recherchezeit, wenn mögliche Ausschlussgründe früh sichtbar werden. Ich habe deshalb eine Entscheidung vor die lange Trefferliste gestellt. Diese Zeitersparnis ist noch nicht durch echte Nutzertests belegt.");
left.append(caveat);
const placeholder=callout("Ein guter Auftrag – und eine mögliche Hürde","Die Beispiele werden gleich mit öffentlich zugänglichen Bekanntmachungen abgeglichen.","v9-placeholder");
output.append(placeholder);
function decisionCard(it,kind){
const panel=n("article","v9-result "+kind),kicker=kind==="v9-good"?"INTERESSANT · WEITER PRÜFEN":"ACHTUNG · ERST HÜRDE KLÄREN";
panel.append(n("div","v9-label",kicker),n("h3","",it.shortTitle.length>155?it.shortTitle.slice(0,152)+"…":it.shortTitle));
const reason=it.barriers.length?"Mögliche Hürde: "+it.barriers.join("; "):"Fachlicher Bezug: "+it.hit.join(", ")+". Weitere Anforderungen sind noch zu prüfen.";
panel.append(txt(reason,"v9-reason"),txt("Auftraggeber: "+it.buyer+" · Frist laut Datenbestand: "+it.deadline,"v9-caption"),anchor("Original-Ausschreibung ↗",it.url));
const details=disclosure("Begründung und offene Fragen");
details.append(txt(it.next+" "+it.unknowns.join("; "),"v9-muted"));
if(it.known)details.append(anchor("Veröffentlichte Nachweise ↗","https://app.zuschlagsreif.de/ausschreibung/1406624-deutschland-entwicklung-von-kundenspezifischer-software-konzeption-entwicklung"));
panel.append(details);
const actions=n("div","v9-small-actions");
for(const[val,name]of [["review","Weiter prüfen"],["hold","Noch unklar"],["skip","Überspringen"]]){
 const b=button(name,()=>{state.choices[it.id]=val;[...actions.children].forEach(x=>x.setAttribute("aria-pressed",String(x===b)))},"v9-chip");b.setAttribute("aria-pressed",String(state.choices[it.id]===val));actions.append(b);
}
panel.append(actions);return panel;
}
function paint(){
output.replaceChildren();
const summary=state.summary;if(!summary)return;
const sourceLine=(state.offline?"Nur 3 Offline-Beispiele":"Datenstand "+state.asOf)+" · "+summary.matched+" passende Titel in der Suche";
output.append(txt(sourceLine,"v9-caption"));
if(!summary.shown.length){output.append(callout("Kein relevanter Auftrag gefunden","Ändere die Fähigkeiten oder den Suchbegriff. Wir zeigen keine erfundenen Chancen."));return}
const {recommended,obstacle}=summary;
if(recommended)output.append(decisionCard(recommended,"v9-good"));
if(obstacle)output.append(decisionCard(obstacle,"v9-warn"));
else output.append(callout("Noch kein belegter Ausschlussgrund sichtbar","Das bedeutet ausdrücklich nicht, dass das Team alle Bedingungen erfüllt."));
const others=summary.shown.filter(x=>x.id!==recommended?.id&&x.id!==obstacle?.id);
if(others.length){
 const more=disclosure("Weitere "+others.length+" Treffer aus dem Datensatz");
 others.forEach(x=>more.append(decisionCard(x,"v9-more")));output.append(more);
}
const act=n("div","v9-actions");
act.append(button("Meine Entscheidung herunterladen ↗",()=>{
 const lines=["BIDPILOT · ENTSCHEIDUNGSNOTIZ",new Date().toISOString(),"Datenstand: "+state.asOf,"Basis: "+state.feed.length+" Bekanntmachungen","Teamleistungen: "+state.profile.skills.join(", "),"Referenzen: "+state.profile.reference,"Versicherung: "+state.profile.insurance,"IT-Sicherheit: "+state.profile.security,"Passende Titel: "+summary.matched,""];
 for(const it of summary.shown)lines.push("AUFTRAG: "+it.shortTitle,"Quelle: "+it.url,"Trefferbegründung: "+it.hit.join(", "),"Mögliche Hindernisse: "+it.barriers.join("; "),"Offene Fragen: "+it.unknowns.join("; "),"Empfohlener nächster Schritt: "+it.next,"Meine Entscheidung: "+(state.choices[it.id]||"Noch offen"),"");
 lines.push("HINWEIS: Keine Eignungsprüfung. Vollständige Anforderungen und aktuelle Fristen nur beim Original-Auftraggeber verlässlich.");
 saveFile("bidpilot-entscheidung.txt",lines.join("\n"));
 }));output.append(act);
}
function run(){if(!state.loaded)return;state.profile=profile();state.choices={};state.summary=C.tenderDecision(state.profile,state.feed,stamp);paint()}
preset(0);
Object.values(skillCheckboxes).forEach(x=>x.addEventListener("change",run));
for(const el of [ref,insurance,security,queryField,excludeField])el.addEventListener("change",run);
const fallback=[
{id:"714363-2026",title:"Germany – Custom software development services – Konzeption, Entwicklung, Implementierung eines webbasierten Kundenportals",buyer:"Pro Arbeit Kreis Offenbach",deadline:"2026-11-13",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/714363-2026"},
{id:"719791-2026",title:"Germany – IT services – KI-Assistent für die Wohngeldstelle",buyer:"Landratsamt Unstrut-Hainich-Kreis",deadline:"2026-11-18",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/719791-2026"},
{id:"723707-2026",title:"Germany – IT services – OpenStack Supportvertrag",buyer:"Dataport",deadline:"2026-11-19",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/723707-2026"}];
fetch("/bidpilot/notices.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Öffentliche Daten nicht verfügbar");return r.json()}).then(data=>{
 if(!data||!Array.isArray(data.notices)||!data.notices.length||data.schema!==2)throw Error("Unvollständige Daten");
 state.feed=data.notices;state.asOf=String(data.fetched_at||"2026-10-20").slice(0,10);state.loaded=true;
 availability.textContent=state.feed.length+" öffentliche Einträge · Import "+state.asOf;run();
}).catch(()=>{
 state.offline=true;state.feed=fallback;state.loaded=true;state.asOf="2026-10-20";availability.textContent="Datensatz nicht erreichbar · drei gekennzeichnete Offline-Beispiele";run();
});
resourceFooter("Quellen: öffentlicher, begrenzter Import aus dem europäischen Ausschreibungsportal. Wir gleichen Titel, Fristen und einzelne veröffentlichte Anforderungen ab; keine automatische rechtliche Prüfung und keine gemessene Zeitersparnis.");
}
function returnLoop(){
header("RETURN LOOP · SNOCKS / AI ENGINEERING","Was sollte unser Supportteam<br><em>heute nicht übersehen?</em>","20 erfundene Kundenanfragen, zwei Erkennungsmethoden und eine konkrete Entscheidung: mögliche Produktprobleme prüfen, bevor sie zwischen Einzelanfragen untergehen.");
const stage=n("div","v9-stage"),left=card("1 · Was ist passiert?","Ein Klick wertet die Beispielnachrichten aus. Danach kannst du eigene Texte testen."),right=card("2 · Was sollte das Team tun?","");
stage.append(left,right);main.append(stage);
let tickets=C.exampleTickets(),overrides={},routing={},notes={},audit=[],imported=false;
const source=n("div","v9-tags");left.append(source);
const output=n("div");right.append(output);
const refreshTags=()=>source.replaceChildren(pill(tickets.length+" Supportnachrichten"),pill("Zwei unterschiedliche Verfahren"),pill("Keine automatischen Aktionen"));
refreshTags();
const runButton=button("20 Nachrichten prüfen →",render);left.append(add(n("div","v9-actions"),runButton));
const custom=disclosure("Neue Nachricht oder eigene CSV ausprobieren");
custom.append(label("Neue Supportnachricht","v9-ticket-message"));
const input=n("textarea");input.id="v9-ticket-message";input.value="Leider läuft eine Masche an der Seite. Nach zwei Tagen kann ich die Socken kaum tragen.";custom.append(input);
const sku=select([["SOCKS","Socken"],["HOODIE","Kapuzenpullover"],["TEE","T-Shirt"],["","Unbekannt"]],"v9-sku");
custom.append(label("Betroffenes Produkt","v9-sku"),sku);
const preview=n("div");custom.append(preview);
function previewMessage(){const message=clean(input.value,600);if(message.length<8){preview.replaceChildren(txt("Bitte eine Nachricht mit mindestens acht Zeichen eingeben.","v9-caption"));return}
 const rule=T.classify(message),ml=M.classify(message);
 preview.replaceChildren(add(n("div","v9-compare"),add(n("div","v9-method"),n("span","v9-caption","Feste Regeln"),n("strong","",C.ISSUE[rule.category])),add(n("div","v9-method"),n("span","v9-caption","Trainiertes Modell"),n("strong","",C.ISSUE[ml.category]))),txt(rule.category===ml.category?"Beide erkennen dasselbe Thema; trotzdem keine automatische Freigabe.":"Die Methoden widersprechen sich: Ein Mensch muss entscheiden.","v9-caption"));
}
input.addEventListener("input",previewMessage);previewMessage();
custom.append(add(n("div","v9-actions"),button("Als neues Ticket hinzufügen",()=>{
 const message=clean(input.value,600);if(message.length<8||tickets.length>=300){preview.replaceChildren(txt("Bitte mindestens acht Zeichen eingeben (maximal 300 Tickets).","v9-caption"));return}
 tickets.push({id:"NEU-"+(tickets.length+1),order:"TEST-"+(tickets.length+1),sku:sku.value,message});
 audit.push({type:"added",id:tickets[tickets.length-1].id});refreshTags();render();
 },"v9-secondary")));
 const uploadBox=disclosure("Anonymisierte CSV einlesen (optional)","Spalten: ticket_id,sku,message (order_id optional). Nur im Browser. Keine Namen, E-Mails oder anderen persönlichen Daten verwenden.");
 const csv=n("input");csv.type="file";csv.accept=".csv,text/csv";csv.setAttribute("aria-label","Anonymisierte Support-CSV auswählen");
 const uploadStatus=txt("","v9-caption");uploadBox.append(csv,uploadStatus);
 csv.addEventListener("change",async()=>{
 const file=csv.files?.[0];if(!file)return;
 try{if(file.size>200000)throw Error("Maximal 200 KB");const rows=C.parseCsv(await file.text());
 tickets=rows;overrides={};routing={};notes={};audit=[{type:"csv-import",count:rows.length}];imported=true;refreshTags();render();
 uploadStatus.textContent=rows.length+" Zeilen lokal eingelesen.";
 }catch(err){uploadStatus.textContent="Import nicht möglich: "+err.message;}
 });custom.append(uploadBox);
 custom.append(add(n("div","v9-actions"),button("Beispieldaten zurücksetzen",()=>{
 tickets=C.exampleTickets();overrides={};routing={};notes={};audit=[];imported=false;refreshTags();render();previewMessage();
 },"v9-ghost")));
 left.append(custom);
const evaluation=M.evaluate(),tests=disclosure("Wie zuverlässig ist das Modell?");
tests.append(add(n("div","v9-eval"),miniStat(evaluation.model.correct+"/"+evaluation.model.total,"Trainiertes Modell"),miniStat(evaluation.rules.correct+"/"+evaluation.rules.total,"Feste Regeln")));
tests.append(txt("136 synthetische Trainingsbeispiele, 29 weitere separat formulierte synthetische Tests. Das ist keine unabhängige Prüfung an echten Supportdaten. Hohe Modellwerte sind nicht kalibrierte Wahrscheinlichkeiten.","v9-caption"));
const faults=disclosure("Fehlerbeispiele aus dem Test zeigen");
evaluation.model.errors.forEach(f=>faults.append(txt("„"+f.text+"“ · korrekt: "+C.ISSUE[f.expected]+" · Modell: "+C.ISSUE[f.got],"v9-caption")));tests.append(faults);
left.append(tests);
function ticketEditor(row,container){
 const div=n("div","v9-ticket");
 div.append(txt(row.id+" · "+row.message,"v9-ticket-text"));
 div.append(txt("Regeln: "+C.ISSUE[row.rule.category]+" · Modell: "+C.ISSUE[row.ml.category]+(row.agree?" · übereinstimmend":" · Widerspruch"),"v9-caption"));
 const choices=select([["auto","Vorschlag beibehalten"],["material","Materialproblem"],["delivery","Lieferung"],["size","Größe"],["return","Rückgabe"],["mixed","Mehrere Themen"],["unknown","Noch unklar"]]);
 choices.setAttribute("aria-label","Kategorie von "+row.id+" korrigieren");
 choices.value=Object.prototype.hasOwnProperty.call(overrides,row.id)?overrides[row.id]:"auto";
 choices.addEventListener("change",()=>{if(choices.value==="auto")delete overrides[row.id];else overrides[row.id]=choices.value;audit.push({type:"category",id:row.id,value:choices.value});render()});
 div.append(choices);container.append(div);
}
function render(){
 const result=C.triage(tickets,overrides,routing);output.replaceChildren();
 output.append(add(n("div","v9-metrics"),miniStat(result.total,"Nachrichten ausgewertet"),miniStat(result.countMaterial,"Materialhinweise"),miniStat(result.disagreements,"Methoden uneinig")));
 if(result.top){const g=result.top;
 output.append(callout(g.materials.length+" ähnliche Materialmeldungen bei "+g.name,"Beide Methoden stimmen bei den betroffenen Texten überein oder ein Mensch hat die Einordnung korrigiert. Ein bestätigter Produktdefekt ist das nicht.","v9-highlight"));
 const row=n("div","v9-next");row.append(n("h3","","Nächster Schritt: Produktqualität prüfen"),txt("Belege sichten, betroffene Bestellungen kontrollieren und entscheiden, ob eine interne Prüfung eröffnet werden soll.","v9-muted"));
 const message=n("textarea");message.value=notes[g.sku]?.message||("Bitte "+g.materials.length+" ähnliche Beschwerden zu "+g.name+" auf Material und Chargen prüfen. Noch kein Defekt bestätigt.");
 message.setAttribute("aria-label","Notiz zur Qualitätsprüfung");
 const approval=n("input");approval.type="checkbox";approval.checked=!!notes[g.sku]?.approved;approval.id="v9-approval";
 row.append(message,add(n("div","v9-check"),approval,label("Für menschliche Prüfung vormerken",approval.id)));
 const store=()=>{notes[g.sku]={message:message.value,approved:approval.checked};audit.push({type:"review-note",sku:g.sku,approved:approval.checked})};
 message.addEventListener("input",store);approval.addEventListener("change",store);output.append(row);
 }else output.append(callout("Keine Häufung über unserer Beispielschwelle","Das bedeutet nicht, dass alle Produkte fehlerfrei sind. Prüfe insbesondere Widersprüche und unbekannte Fälle."));
 const risks=disclosure(result.ambiguous.length+" unsichere oder widersprüchliche Nachrichten prüfen");
 for(const r of result.ambiguous)ticketEditor(r,risks);
 output.append(risks);
 const evidence=disclosure("Alle Nachrichten und Textbelege ansehen");
 for(const group of result.groups){
 const g=disclosure(group.name+" · "+group.materials.length+" Materialhinweise / "+group.items.length+" Nachrichten");
 group.items.forEach(row=>ticketEditor(row,g));evidence.append(g);
 }output.append(evidence);
 if(result.unlinked.length){const missing=disclosure(result.unlinked.length+" Nachrichten ohne Produktzuordnung");
 missing.append(txt("Ohne überprüfte Zuordnung zählt diese Nachricht zu keinem Produkt. Du kannst eine Zuordnung für die weitere Prüfung vornehmen.","v9-muted"));
 result.unlinked.forEach(row=>{
 const item=n("div","v9-ticket");item.append(txt(row.id+" · "+row.message,"v9-ticket-text"));
 const route=select([["","Noch unbekannt"],["SOCKS","Socken"],["HOODIE","Kapuzenpullover"],["TEE","T-Shirt"]]);
 route.setAttribute("aria-label","Produktzuordnung "+row.id);
 route.addEventListener("change",()=>{routing[row.id]=route.value;audit.push({type:"product",id:row.id,product:route.value});render()});
 item.append(route);missing.append(item);
 });output.append(missing);}
 const method=disclosure("Wie wurde das erkannt?");
 method.append(txt("Jede Nachricht wird zweimal unabhängig eingestuft: durch bekannte Textregeln und ein auf synthetischen Sätzen trainiertes Naive-Bayes-Modell. Nur übereinstimmende Materialmeldungen oder manuell korrigierte Fälle werden gruppiert. Bei Widersprüchen und unbekannten Fällen wird nicht automatisch entschieden.","v9-muted"));
 method.append(txt("Beispielschwelle: ab vier zugeordneten Materialmeldungen je Produkt. Diese Schwelle ist nicht statistisch validiert.","v9-caption"));
 output.append(method);
 output.append(add(n("div","v9-actions"),button("Qualitätsbericht herunterladen ↗",()=>{
 const final=C.triage(tickets,overrides,routing);
 const lines=["RETURN LOOP · INTERNER PRÜFBERICHT",new Date().toISOString(),"Datengrundlage: "+(imported?"lokale anonymisierte CSV":"synthetische Beispielnachrichten"),"Verarbeitet: "+final.total,"Materialhinweise: "+final.countMaterial,"Regeln und Modell uneinig: "+final.disagreements,"Nicht zugeordnet: "+final.unlinked.length,""];
 final.groups.forEach(g=>lines.push("PRODUKT "+g.name+": "+g.materials.length+" Materialhinweise in "+g.items.length+" Supportnachrichten. Hinweis für Prüfung: "+(g.flag?"Ja":"Noch unter Beispielschwelle"),""));
 Object.entries(notes).forEach(([sku,value])=>lines.push("REVIEW "+sku+": "+(value.approved?"Vom Menschen vorgemerkt":"Noch nicht vorgemerkt"),"Notiz: "+clean(value.message,1000),""));
 lines.push("TICKETS MIT BELEGEN:");
 final.rows.forEach(x=>lines.push([x.id,x.order,x.sku||"unbekannt",x.message,"Regel="+x.rule.category,"Modell="+x.ml.category,"Final="+x.category,"Regelwörter="+x.rule.evidence.join("; "),"ML-Wortmuster="+x.ml.matched.join("; "),"Manuelle Korrektur="+(x.reviewed?"ja":"nein")].join(" | ")));
 lines.push("LOKALE BEARBEITUNGSEREIGNISSE:");
 audit.forEach(x=>lines.push(JSON.stringify(x)));
 lines.push("TESTVERGLEICH: Modell "+evaluation.model.correct+"/"+evaluation.model.total+"; Regeln "+evaluation.rules.correct+"/"+evaluation.rules.total);
 lines.push("Grenzen: Kein externes Modell, keine echte Support-Integration, keine bestätigte Fehlerquote, keine gesendeten Antworten oder veranlassten Rückerstattungen.");
 saveFile("return-loop-qualitaetsbericht.txt",lines.join("\n"));
 })));
}
render();
const feature=add(n("div","v9-footnote"),n("strong","","Warum diese Lösung statt eines weiteren Chatbots?"),txt("Der erste Nutzen ist nicht eine automatisch geschriebene Antwort, sondern ein übersehenes gemeinsames Problem. Darum verbinden wir Texterkennung, überprüfbare Fälle und menschliche Entscheidung. Die Anwendung ist eine lokale Demo, kein produktiver Supportservice.","v9-muted"));left.append(feature);
resourceFooter("Regelbasiertes System + trainiertes Naive-Bayes-Modell, beide lokal im Browser. Künstlich erzeugte Nachrichten und Trainingsbeispiele. Kein LLM, keine Backend-Speicherung, kein automatischer Versand, keine verlässlichen Defektraten.");
}
support?returnLoop():bidpilot();
})();