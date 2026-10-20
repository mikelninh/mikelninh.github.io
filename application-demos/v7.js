/* APPLICATION WORK SAMPLES V7 — source-grounded, explainable, interactive.
 * Dependencies: bid-screening.js, return-triage.js, v6.css
 * User inputs remain in this browser, no external writes or AI-model requests. */
(function(){
"use strict";
const support=new URLSearchParams(location.search).get("demo")==="return-loop";
const E=window.BidScreening,T=window.ReturnTriage;
if(!E||!T){const p=document.createElement("p");p.textContent="Demo konnte nicht vollständig geladen werden. Bitte Seite neu laden.";document.body.append(p);return}
const root=document.createElement("main");root.id="v6";root.dataset.type=support?"support":"tender";
const legacy=document.querySelector("main.wrap");if(legacy){legacy.style.display="none";legacy.insertAdjacentElement("afterend",root)}else document.body.append(root);
const css=document.createElement("link");css.rel="stylesheet";css.href="./v6.css";document.head.append(css);
const el=(t,c,s)=>{const n=document.createElement(t);if(c)n.className=c;if(s!==undefined)n.textContent=String(s);return n};
const add=(parent,...kids)=>{parent.append(...kids);return parent};
const p=(s,c)=>el("p",c||"",s);
const a=(s,url)=>{const n=el("a","",s);n.href=url;n.target="_blank";n.rel="noopener noreferrer";return n};
const btn=(s,handler,cls="v6-main")=>{const n=el("button",cls,s);n.type="button";n.addEventListener("click",handler);return n};
const label=(text,forId)=>{const l=el("label","",text);if(forId)l.htmlFor=forId;return l};
const select=(opts)=>{const n=el("select");opts.forEach(([value,title])=>{const o=el("option","",title);o.value=value;n.append(o)});n.value=opts[0][0];return n};
const field=(parent,text,id,options)=>{const n=select(options);n.id=id;parent.append(label(text,id),n);return n};
const clean=(v,limit=300)=>String(v||"").trim().slice(0,limit);
const save=(name,content)=>{const blob=new Blob([content],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),dl=document.createElement("a");dl.href=url;dl.download=name;document.body.append(dl);dl.click();dl.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};
const box=(parent,title,description)=>{const node=el("div","v6-box");node.append(el("strong","",title),p(description));parent.append(node);return node};
const badge=(text,cls="")=>el("span","v6-status "+cls,text);
const intro=(eyebrow,title,description,steps)=>{root.append(el("div","v6-k",eyebrow));const h=el("h1");h.innerHTML=title;root.append(h,p(description,"v6-lead"));const cards=el("div","v6-steps");steps.forEach((x,i)=>cards.append(add(el("div","v6-step"),el("b","",String(i+1).padStart(2,"0")+" · "+x[0]),p(x[1]))));root.append(cards)};
const panel=(eyebrow,title)=>add(el("section","v6-panel"),el("div","v6-k",eyebrow),el("h2","",title));
const bottom=(text,url,title)=>{const foot=el("div","v6-foot");foot.append(p(text,"v6-tiny"),a(title,url));root.append(foot)};
function utcDate(){return new Date().toISOString().slice(0,10)}
function renderBid(){
 document.title="BIDPILOT · Öffentliche Aufträge besser auswählen";
 intro("BIDPILOT · A11 / PRODUKTENTWICKLUNG","Welche Aufträge lohnen<br><em>unsere Zeit?</em>","Beschreibe dein Team. BIDPILOT durchsucht veröffentlichte Aufträge und zeigt, welche fachlich passen – mit Originalquelle, möglichen Hürden und offenen Fragen.",[
 ["Das Problem","Viele öffentliche Aufträge durchsehen kostet Zeit; der Titel verrät nicht, ob man sich bewerben kann."],
 ["Was ich gebaut habe","Eine nachvollziehbare Suche, die Teamprofil und konkrete Auftragsbeschreibungen abgleicht."],
 ["Probier es","Profil auswählen, echte Aufträge vergleichen und deine Entscheidung speichern."]
 ]);
 const layout=el("div","v6-layout"),left=panel("01 / DEIN TEAM","Was könnt ihr anbieten?"),right=panel("02 / EURE CHANCEN","Was lohnt einen zweiten Blick?");
 layout.append(left,right);root.append(layout);
 const summary=p("Öffentliche Aufträge werden geladen …","v6-tiny");left.append(summary);
 const presetRow=el("div","v6-actions");left.append(presetRow);
 const skills={},skillLabels={web:"Webseiten & Portale",ai:"KI-Anwendungen",cloud:"Server & IT-Betrieb"};
 left.append(label("Das können wir"));
 Object.entries(skillLabels).forEach(([key,name])=>{const line=el("div","v6-check"),input=el("input");input.type="checkbox";input.id="v7-skill-"+key;const lab=label(name,input.id);line.append(input,lab);left.append(line);skills[key]=input});
 const ref=field(left,"Ähnliche öffentliche Projekte umgesetzt?","v7-ref",[["unknown","Noch unklar"],["yes","Ja"],["no","Nein"]]);
 const insurance=field(left,"Passende Berufshaftpflicht?","v7-ins",[["unknown","Noch unklar"],["yes","Ja"],["no","Nein"]]);
 const security=field(left,"Nachweis zur IT-Sicherheit?","v7-sec",[["unknown","Noch unklar"],["yes","Ja"],["no","Nein"]]);
 const custom=el("details");custom.append(el("summary","","Optional: Suche genauer einstellen"));
 custom.append(label("Zusätzliche Suchbegriffe","v7-query"));
 const query=el("input");query.type="text";query.id="v7-query";query.placeholder="z. B. Kundenportal, Cloud, OpenStack";custom.append(query);
 custom.append(label("Aus diesen Themen keine Aufträge","v7-exclude"));
 const exclude=el("input");exclude.type="text";exclude.id="v7-exclude";exclude.placeholder="z. B. Windows, Wartung";custom.append(exclude);
 custom.append(p("Suchbegriffe werden im konkreten Auftragstext gesucht, nicht in allgemeinen Kategorien.","v6-tiny"));left.append(custom);
 const presets=[["Webstudio",["web"],"web","no"],["KI-Team",["ai","web"],"ai","unknown"],["IT-Betrieb",["cloud"],"cloud","unknown"]];
 let active=0,last=null,profile=null,decisions={},dataset=[],stamp="2026-10-20",offline=false;
 const output=el("div");right.append(output);
 const go=btn("Passende Aufträge finden →",run);go.disabled=true;
 left.append(add(el("div","v6-actions"),go));
 left.append(p("Das Tool prüft keine vollständigen Teilnahmebedingungen und errechnet keine Gewinnchance.","v6-tiny"));
 function usePreset(i){active=i;const t=presets[i];Object.keys(skills).forEach(k=>skills[k].checked=t[1].includes(k));ref.value=t[3];insurance.value="unknown";security.value="unknown";Array.from(presetRow.children).forEach((b,j)=>b.setAttribute("aria-pressed",String(i===j)))}
 presets.forEach((t,i)=>presetRow.append(btn(t[0],()=>{usePreset(i);if(dataset.length)run()},"v6-sub")));
 function snapshot(){return {skills:Object.keys(skills).filter(k=>skills[k].checked),focus:skills[presets[active][2]].checked?presets[active][2]:Object.keys(skills).find(k=>skills[k].checked)||"",reference:ref.value,insurance:insurance.value,security:security.value,query:query.value,exclusions:exclude.value}}
 function fallback(){return[
 {id:"714363-2026",title:"Germany – Custom software development services – Konzeption, Entwicklung und Implementierung eines sicheren webbasierten Kundenportals",buyer:"Pro Arbeit – Kreis Offenbach",deadline:"2026-11-13",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/714363-2026"},
 {id:"719791-2026",title:"Germany – Artificial intelligence software – KI-Assistent für die Wohngeldstelle",buyer:"Landratsamt Unstrut-Hainich-Kreis",deadline:"2026-11-18",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/719791-2026"},
 {id:"723707-2026",title:"Germany – Systems support services – Supportvertrag für OpenStack",buyer:"Dataport AöR",deadline:"2026-11-19",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/723707-2026"}
 ]}
 function run(){
 profile=snapshot();decisions={};last=E.screen(profile,dataset,utcDate());paint();
 }
 function paint(){
 output.replaceChildren();
 output.append(p((offline?"Offline-Beispiele":"Datenstand "+stamp)+" · "+last.available+" Aufträge mit ausreichend Frist · "+last.matched+" passende Auftragstitel · "+last.shown.length+" angezeigt","v6-tiny"));
 if(!last.shown.length){box(output,"Kein passender Auftrag gefunden","Probiere ein anderes Teamprofil, kürzere Suchbegriffe oder weniger Ausschlüsse. Wir erfinden keine Treffer.");return}
 const top=last.shown[0];
 box(output,"Dein erster sinnvoller Blick",top.shortTitle.slice(0,120)+(top.barriers.length?" – aber zuerst erkannte Hürden klären.":" – fachlich interessant, jetzt die Anforderungen prüfen."));
 for(const item of last.shown){
 const card=el("article","v6-item");
 card.append(badge(item.status,item.barriers.length?"warn":""));
 card.append(el("h3","",item.shortTitle.length>155?item.shortTitle.slice(0,152)+"…":item.shortTitle));
 card.append(p(item.buyer+" · Frist laut Datensatz: "+item.deadline,"v6-mute"));
 card.append(p("Warum dieser Treffer? "+item.hit.join(", ")+" im konkreten Auftragstitel."));
 if(item.barriers.length)card.append(p("Mögliche Hürde: "+item.barriers.join("; ")));
 card.append(p("Noch offen: "+item.unknowns.join("; ")),a("Öffentliche Originalanzeige öffnen ↗",item.url));
 const detail=el("details");detail.append(el("summary","","Was sollte unser Team als Nächstes tun?"),p(item.next,"v6-mute"));
 if(item.known)detail.append(a("Veröffentlichte Nachweise zu diesem Auftrag ↗","https://app.zuschlagsreif.de/ausschreibung/1406624-deutschland-entwicklung-von-kundenspezifischer-software-konzeption-entwicklung"));
 card.append(detail);
 const actions=el("div","v6-actions");
 for(const [value,title]of [["review","Weiter prüfen"],["hold","Offene Fragen"],["skip","Überspringen"]]){
 const b=btn(title,()=>{decisions[item.id]=value;Array.from(actions.children).forEach(n=>n.setAttribute("aria-pressed",String(n===b)))},"v6-sub");b.setAttribute("aria-pressed","false");actions.append(b);
 }
 card.append(actions);output.append(card);
 }
 output.append(add(el("div","v6-actions"),btn("Meine Auswahl herunterladen ↗",()=>{
 const lines=["BIDPILOT · ÖFFENTLICHE AUFTRÄGE",new Date().toISOString(),"Datenstand: "+stamp,"Datensätze: "+dataset.length,"Ausreichend Frist: "+last.available,"Passende Titel: "+last.matched,"Team: "+profile.skills.join(", "),"Eigene Begriffe: "+profile.query,"Ausschlüsse: "+profile.exclusions,"Behördenreferenz: "+profile.reference,"Versicherung: "+profile.insurance,"IT-Sicherheit: "+profile.security,""];
 last.shown.forEach(it=>lines.push("AUFTRAG: "+it.shortTitle,"Originalquelle: "+it.url,"Auftraggeber: "+it.buyer,"Frist: "+it.deadline,"Titel-Treffer: "+it.hit.join(", "),"Hinweis: "+it.status,"Selbstauskunft-Hürden: "+it.barriers.join("; "),"Offene Punkte: "+it.unknowns.join("; "),"Nächster Schritt: "+it.next,"Meine Entscheidung: "+(decisions[it.id]||"Noch offen"),""));
 lines.push("Keine automatische Eignungsbestätigung. Vollständige Unterlagen, Aktualität und Fristen müssen in der Originalanzeige geprüft werden.");
 save("bidpilot-auftragsauswahl.txt",lines.join("\n"));
 })));
 }
 usePreset(0);
 output.append(add(el("div","v6-empty"),el("strong","","Dein Team. Die passenden Aufträge."),p("Wähle ein Beispielteam und starte die Suche. Du erhältst echte Quellen mit Begründungen.")));
 bottom("Quelle: öffentlicher, begrenzter TED-Datensatz. Es werden ausschließlich Titel, Fristen und für einen Fall ausgewählte veröffentlichte Anforderungen geprüft. Kein automatischer Rechts- oder Eignungscheck.","https://mikelninh.github.io/bidpilot/#product-study","Ausführliche Produktstudie ↗");
 fetch("/bidpilot/notices.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(d=>{
 if(d.schema!==2||!Array.isArray(d.notices))throw Error("Ungültiger Datensatz");
 dataset=d.notices;stamp=String(d.fetched_at||"2026-10-20").slice(0,10);go.disabled=false;
 summary.textContent="Bereit · "+dataset.length+" veröffentlichte Bekanntmachungen · Stand "+stamp;
 }).catch(()=>{offline=true;dataset=fallback();go.disabled=false;summary.textContent="Öffentliche Daten gerade nicht erreichbar · nur 3 ausdrücklich gekennzeichnete Offline-Beispiele.";});
}
function renderSupport(){
 document.title="RETURN LOOP · Kundenanfragen automatisch erkennen";
 intro("RETURN LOOP · SNOCKS / AI ENGINEERING","Welche Probleme häufen sich<br><em>im Kundenservice?</em>","Zwanzig Supportanfragen. RETURN LOOP liest die Texte, ordnet Anliegen automatisch ein und zeigt ähnliche Beschwerden – mit überprüfbaren Regeln, Fehlerfällen und menschlicher Korrektur.",[
 ["Problem","Eine Beschwerde lässt sich leicht übersehen, wenn sie in vielen einzelnen Anfragen steckt."],
 ["Was ich gebaut habe","Automatische Einordnung von Kundennachrichten und einen Überblick je Produkt."],
 ["Probier es","Nachrichten auswerten, mögliche Fehler korrigieren und den Qualitätsbericht exportieren."]
 ]);
 const layout=el("div","v6-layout"),left=panel("01 / SUPPORTANFRAGEN","Welche Nachrichten kommen rein?"),right=panel("02 / AUSWERTUNG","Was fällt auf?");
 layout.append(left,right);root.append(layout);
 let tickets=makeSeeds(),overrides={},imported=false,reviewNotes={};const badges=el("div","v6-tags"),results=el("div");left.append(p("20 erfundene Tickets. Die Art des Problems ist nicht vorgegeben – das Werkzeug erkennt sie aus dem Text.","v6-mute"),badges);right.append(results);
 function makeSeeds(){
 const list=[],addTicket=(sku,message)=>list.push({id:"T-"+String(list.length+1).padStart(3,"0"),order:"DEMO-"+String(list.length+1).padStart(3,"0"),sku,message});
 ["Naht nach dem Waschen gerissen","Socken haben ein Loch","Ferse löst sich auf","Loch nach zwei Wäschen","Material eingerissen","Naht löst sich","Stoff beschädigt"].forEach(x=>addTicket("SOCKS",x));
 for(let i=0;i<3;i++)addTicket("SOCKS","Sockenlieferung noch nicht angekommen");
 for(let i=0;i<2;i++)addTicket("SOCKS","Socken passen nicht richtig");
 for(let i=0;i<4;i++)addTicket("HOODIE","Pulloverlieferung unklar");
 for(let i=0;i<2;i++)addTicket("HOODIE","Pullover hat ein Materialproblem");
 for(let i=0;i<2;i++)addTicket("","Bestellung nicht zuordenbar");
 return list;
 }
 const tally=()=>{badges.replaceChildren(el("span","v6-tag",tickets.length+" Nachrichten"),el("span","v6-tag","Klassifikation aus Text"),el("span","v6-tag","Keine externen Aktionen"))};tally();
 const go=btn("Alle Nachrichten automatisch prüfen →",run);left.append(add(el("div","v6-actions"),go));
 const more=el("details");more.append(el("summary","","Eigenen Beispielfall hinzufügen"));
 const prod=field(more,"Produkt","v7-sku",[["SOCKS","Socken"],["HOODIE","Kapuzenpullover"],["TEE","T-Shirt"],["","Nicht bekannt"]]);
 more.append(label("Kundennachricht","v7-message"));const msg=el("textarea");msg.id="v7-message";msg.value="Meine Socken haben nach zwei Wäschen Löcher.";more.append(msg);
 const notice=p("","v6-tiny");more.append(add(el("div","v6-actions"),btn("Nachricht hinzufügen & analysieren →",()=>{
 if(clean(msg.value).length<8){notice.textContent="Bitte eine aussagekräftige Nachricht eingeben.";return}
 if(tickets.length>=300){notice.textContent="Maximal 300 Nachrichten.";return}
 tickets.push({id:"N-"+String(tickets.length+1),order:"TEST-"+String(tickets.length+1),sku:prod.value,message:clean(msg.value,500)});
 notice.textContent="Hinzugefügt. Die Kategorie wurde automatisch aus dem Text abgeleitet.";tally();run();
 },"v6-sub")),notice);left.append(more);
 const upload=el("details");upload.append(el("summary","","Anonymisierte CSV-Datei verwenden (optional)"));
 upload.append(p("Spalten: ticket_id,order_id,sku,message (die Kategorie ist NICHT nötig). Die Datei wird ausschließlich im Browser gelesen. Keine Namen, E-Mails oder andere personenbezogene Daten verwenden.","v6-mute"));
 const chooser=el("input");chooser.type="file";chooser.accept=".csv,text/csv";chooser.setAttribute("aria-label","Anonymisierte CSV-Datei auswählen");
 const uploadInfo=p("","v6-tiny");upload.append(chooser,uploadInfo);left.append(upload);
 chooser.addEventListener("change",async()=>{
 const file=chooser.files?.[0];if(!file)return;
 try{if(file.size>200000)throw Error("Maximal 200 KB");
 const raw=await file.text(),table=parseCSV(raw);const heads=table.shift().map(x=>x.trim().toLowerCase());
 for(const col of ["ticket_id","sku","message"])if(!heads.includes(col))throw Error("Spalte fehlt: "+col);
 const parsed=[];const seen=new Set();
 for(const cells of table){if(cells.every(x=>!x.trim()))continue;
 const item=Object.fromEntries(heads.map((h,i)=>[h,(cells[i]||"").trim()]));
 if(!item.ticket_id||!item.message)throw Error("Ticket-ID und Nachricht erforderlich");
 if(!["SOCKS","HOODIE","TEE",""].includes(item.sku))throw Error("Unbekanntes Produkt: "+item.sku);
 if(seen.has(item.ticket_id))throw Error("Doppelte Ticket-ID");seen.add(item.ticket_id);
 parsed.push({id:clean(item.ticket_id,40),order:clean(item.order_id||"",40),sku:item.sku,message:clean(item.message,500)});
 if(parsed.length>300)throw Error("Maximal 300 Tickets");
 }
 if(!parsed.length)throw Error("Keine Nachrichten gefunden");tickets=parsed;overrides={};imported=true;tally();run();uploadInfo.textContent=parsed.length+" anonymisierte Nachrichten lokal eingelesen.";
 }catch(err){uploadInfo.textContent="Import nicht möglich: "+err.message}
 });
 left.append(add(el("div","v6-actions"),btn("Beispieldaten zurücksetzen",()=>{tickets=makeSeeds();overrides={};imported=false;tally();run()},"v6-sub")));
 const reg=T.evaluate(),challenge=T.challenge();
 const tests=el("details");tests.append(el("summary","","Wie zuverlässig ist die Einordnung? Tests & Fehler"));
 tests.append(p("Manuell formulierte synthetische Tests: "+reg.correct+"/"+reg.total+" einfache Regressionen und "+challenge.correct+"/"+challenge.total+" schwierige Beispiele korrekt. Diese Werte messen NICHT die Leistung bei realen Kundennachrichten.","v6-mute"));
 if(challenge.errors.length){const failures=el("div");challenge.errors.forEach(e=>failures.append(p("Fehler: „"+e.message+"“ · erwartet: "+T.LABELS[e.expected]+" · erkannt: "+T.LABELS[e.category],"v6-tiny")));tests.append(failures)}
 left.append(tests);
 left.append(p("Regelbasiert, nachvollziehbar und ohne angeschlossenes KI-Modell. Die separate FastAPI-/SQLite-Anwendung ist nicht mit dieser öffentlichen Demo verbunden.","v6-tiny"));
 function parseCSV(raw){const rows=[];let row=[],col="",quoted=false;
 const text=String(raw||"").replace(/^\uFEFF/,"");
 for(let i=0;i<text.length;i++){const ch=text[i];
 if(ch==='"'){if(quoted&&text[i+1]==='"'){col+='"';i++}else quoted=!quoted;}
 else if(ch===","&&!quoted){row.push(col);col=""}
 else if((ch==="\n"||ch==="\r")&&!quoted){if(ch==="\r"&&text[i+1]==="\n")i++;row.push(col);if(row.some(x=>x.trim()))rows.push(row);row=[];col=""}
 else col+=ch;
 }
 if(quoted)throw Error("Ungeschlossenes Anführungszeichen");
 row.push(col);if(row.some(x=>x.trim()))rows.push(row);
 if(!rows.length||rows.length>301)throw Error("CSV leer oder zu groß");
 const columns=rows[0].length;if(rows.some(x=>x.length!==columns))throw Error("Unterschiedliche Spaltenanzahl");
 return rows;
 }
 function run(){
 const report=T.analyze(tickets,overrides);results.replaceChildren();
 const metrics=el("div","v6-metrics");
 [[report.total,"Anfragen gelesen"],[report.materials,"Mögliche Materialprobleme"],[report.needsReview,"Zur manuellen Prüfung"]].forEach(([value,name])=>metrics.append(add(el("div","v6-metric"),el("strong","",value),el("span","",name))));
 results.append(metrics);
 if(report.urgent)box(results,"Möglicher Hinweis: "+report.urgent.material.length+" Beschwerden bei "+report.urgent.name,"Ähnliche Texte wurden automatisch als Materialproblem erkannt. Ein Produktdefekt ist damit noch nicht bestätigt.");
 else box(results,"Keine Häufung über der Demo-Schwelle","Es gibt kein Produkt mit mindestens vier automatisch so eingeordneten Beschwerden.");
 results.append(p("Jeder Fall zeigt die gefundene Kategorie und ihre Textbelege. Unklare Aussagen werden nicht stillschweigend als Produktfehler gezählt.","v6-tiny"));
 const uncertain=report.tickets.filter(t=>t.review);
 if(uncertain.length){const open=el("details");open.append(el("summary","",uncertain.length+" unsichere/unklare Nachrichten ansehen"));uncertain.forEach(t=>open.append(p(t.id+" · "+t.message+" → "+T.LABELS[t.category],"v6-tiny")));results.append(open)}
 const panels=[];
 for(const g of report.groups){
 const area=el("article","v6-item");area.append(el("h3","",g.name),p(g.material.length+" Materialmeldungen · "+g.tickets.length+" Nachrichten zu diesem Produkt"));
 const details=el("details");details.append(el("summary","",g.tickets.length+" Nachrichten und Textbelege ansehen"));
 for(const t of g.tickets){
 const item=el("div","v6-ticket");item.append(p(t.id+" · "+t.message));
 item.append(p("Automatisch: "+T.LABELS[t.predicted]+" ("+t.confidence+"). "+(t.evidence.length?"Beleg: "+t.evidence.join(", "):"Kein eindeutiges Textsignal"),"v6-tiny"));
 const s=select([["auto","Vorschlag beibehalten"],["material","Materialproblem"],["delivery","Lieferung"],["size","Größe"],["return","Rückgabe"],["unknown","Unklar / manuell prüfen"]]);
 s.value=Object.prototype.hasOwnProperty.call(overrides,t.id)?overrides[t.id]:"auto";
 s.setAttribute("aria-label","Kategorie für "+t.id+" korrigieren");
 s.addEventListener("change",()=>{if(s.value==="auto")delete overrides[t.id];else overrides[t.id]=s.value;run()});
 item.append(s);details.append(item);
 }
 area.append(details);
 if(g.flag){
 const reviewer=el("div","v6-box");reviewer.append(el("strong","","Vorschlag für das Produktteam"));
 const draft=el("textarea");draft.value=reviewNotes[g.sku]?.text||("Bitte "+g.material.length+" ähnliche Beschwerden bei "+g.name+" prüfen. Material/Charge und betroffene Bestellungen kontrollieren. Bislang ist kein Defekt bestätigt.");
 const flag=el("input");flag.type="checkbox";flag.checked=!!reviewNotes[g.sku]?.approved;flag.id="v7-review-"+g.sku;
 const lab=label("Für menschliche Qualitätsprüfung vormerken",flag.id),line=el("div","v6-check");line.append(flag,lab);
 reviewer.append(draft,line);area.append(reviewer);panels.push({g,draft,flag});
 draft.addEventListener("input",()=>{reviewNotes[g.sku]={text:draft.value,approved:flag.checked}});
 flag.addEventListener("change",()=>{reviewNotes[g.sku]={text:draft.value,approved:flag.checked}});
 }
 results.append(area);
 }
 results.append(add(el("div","v6-actions"),btn("Prüfbericht herunterladen ↗",()=>{
 const lines=["RETURN LOOP · QUALITÄTSAUSWERTUNG",new Date().toISOString(),"Quelle: "+(imported?"anonymisierte CSV (lokal)":"synthetische Beispielnachrichten"),"Tickets: "+report.total,"Mögliche Materialmeldungen: "+report.materials,"Unklare Fälle: "+report.needsReview,"Einordnungsregel: Transparenter Textregel-Klassifikator","Künstliche Regression: "+reg.correct+"/"+reg.total,"Schwierige synthetische Fälle: "+challenge.correct+"/"+challenge.total,""];
 report.groups.forEach(g=>lines.push("PRODUKT: "+g.name,"Materialmeldungen: "+g.material.length,"Nachrichten insgesamt: "+g.tickets.length,"Vorgeschlagene Prüfung: "+(g.flag?"Ja":"Nein"),""));
 panels.forEach(r=>lines.push("PRÜFUNG "+r.g.sku,"Menschliche Prüfung vorgemerkt: "+(r.flag.checked?"Ja":"Nein"),"Bearbeitete Notiz: "+clean(r.draft.value,900),""));
 lines.push("EINZELNE NACHRICHTEN:");
 report.tickets.forEach(t=>lines.push([t.id,t.order,t.sku||"unbekannt",t.message,"automatisch="+t.predicted,"final="+t.category,"sicher="+t.confidence,"belege="+t.evidence.join(", "),t.overridden?"manuell korrigiert":""].join(" | ")));
 lines.push("FEHLER IM SCHWIERIGEN TESTSET:");challenge.errors.forEach(e=>lines.push(e.message+" | erwartet="+e.expected+" | erkannt="+e.category));
 lines.push("Nur synthetische Tests; keine tatsächliche Fehlerquote, kein Versand und keine Backend-Speicherung.");
 save("return-loop-pruefbericht.txt",lines.join("\n"));
 })));
 }
 results.append(add(el("div","v6-empty"),el("strong","","20 Nachrichten warten auf die Prüfung."),p("Ein Klick zeigt automatisch erkannte Probleme, unklare Fälle und mögliche Häufungen.")));
 bottom("Die Kategorien werden aus Nachrichten mit Regeln ermittelt, nicht per live angeschlossenem KI-Modell. Die Prüfregel von vier ähnlichen Meldungen ist nicht statistisch validiert. Daten bleiben lokal; keine Rückerstattung oder Nachricht wird ausgelöst.","https://return-loop-proof-mn-2026.vercel.app/","Separaten Python-/FastAPI-Prototyp ansehen ↗");
}
if(support)renderSupport();else renderBid();
})();