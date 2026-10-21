/* APPLICATION LAB · V10.
   The first screen answers a real question. Evidence and engineering details are optional.
   In-browser only. Uses tested pure cores from v9; not production automation. */
(function(){
"use strict";
const pathname=location.pathname||"";
const isSupport=/\/return-loop\/?/.test(pathname)||new URLSearchParams(location.search).get("demo")==="return-loop";
const Core=window.ApplicationV9Core,R=window.ReturnTriage,ML=window.SupportML;
if(!Core||!R||!ML){document.body.append(Object.assign(document.createElement("p"),{textContent:"Eine benötigte Demo-Datei fehlt. Bitte neu laden."}));return;}
const root=document.createElement("main");root.id="studio-v10";root.dataset.demo=isSupport?"return-loop":"bidpilot";const old=document.querySelector("main.wrap");if(old){old.style.display="none";old.insertAdjacentElement("afterend",root)}else document.body.append(root);
document.title=(isSupport?"RETURN LOOP":"BIDPILOT")+" · Michael Ninh";
const N=(tag,cls,body)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(body!==undefined)n.textContent=String(body);return n};
const append=(p,...ch)=>{p.append(...ch);return p};
const P=(t,cls)=>N("p",cls||"",t);
const A=(t,url)=>{const n=N("a","",t);n.href=url;n.target="_blank";n.rel="noopener noreferrer";return n};
const B=(t,fn,cls="v10-main")=>{const n=N("button",cls,t);n.type="button";n.addEventListener("click",fn);return n};
const L=(t,forId)=>{const n=N("label","",t);if(forId)n.htmlFor=forId;return n};
const S=(opts,id)=>{const n=N("select");if(id)n.id=id;opts.forEach(([v,t])=>{const x=N("option","",t);x.value=v;n.append(x)});n.value=opts[0][0];return n};
const D=(title,body)=>{const n=N("details","v10-detail");n.append(N("summary","",title));if(typeof body==="string")n.append(P(body,"v10-muted"));else if(body)n.append(body);return n};
const text=(v,max=800)=>String(v||"").trim().slice(0,max);
const btnrow=(...nodes)=>append(N("div","v10-actions"),...nodes);
const save=(filename,content)=>{const blob=new Blob([content],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1700)};
const card=(cls)=>N("section","v10-card "+(cls||""));
const info=(title,body)=>append(N("div","v10-note"),N("strong","",title),P(body,"v10-muted"));
function hero(kicker,heading,description){root.append(N("div","v10-eyebrow",kicker));const h=N("h1");h.textContent=heading;root.append(h,P(description,"v10-lead"))}
function stat(value,label){return append(N("div","v10-stat"),N("strong","",value),N("span","",label))}
function footer(t){root.append(append(N("footer","v10-foot"),P(t),A("Code und Testdokumentation ↗","https://github.com/mikelninh/mikelninh.github.io/blob/main/application-demos/README-v10.md")))}
function bid(){
hero("A11 · PRODUKTENTWICKLUNG","Welche Aufträge lohnen unsere Zeit?","Du leitest ein kleines Softwareteam. Wähle aus, was ihr gut könnt – und sieh, welchen öffentlichen Auftrag ihr näher prüfen solltet.");
const profilePanel=card("v10-profile");
profilePanel.append(N("div","v10-step","01 / WÄHLE DEIN TEAM"));
const profiles=[
{name:"Webstudio",skills:["web"],focus:"web",reference:"no"},
{name:"KI-Team",skills:["ai","web"],focus:"ai",reference:"unknown"},
{name:"IT-Betrieb",skills:["cloud"],focus:"cloud",reference:"unknown"}];
let chosen=0,feed=[],feedLabel="",offline=false,loaded=false,current=null,decisions={};
const presets=N("div","v10-tabs");
profiles.forEach((p,i)=>presets.append(B(p.name,()=>{selectTeam(i);draw()},"v10-tab")));profilePanel.append(presets);
const customization=D("Mein Team genauer beschreiben");
const skillInputs={};
for(const [key,name]of [["web","Webentwicklung"],["ai","KI-Anwendungen"],["cloud","IT-Betrieb"]]){
 const row=N("div","v10-check"),box=N("input");box.type="checkbox";box.id="v10-"+key;row.append(box,L(name,box.id));customization.append(row);skillInputs[key]=box;box.addEventListener("change",draw)}
const field=(name,id,options)=>{const x=S(options,id);customization.append(L(name,id),x);x.addEventListener("change",draw);return x};
const reference=field("Erfahrung mit ähnlichen Behördenprojekten?","v10-ref",[["unknown","Unbekannt"],["yes","Ja"],["no","Nein"]]);
const insurance=field("Berufshaftpflicht nachweisbar?","v10-ins",[["unknown","Unbekannt"],["yes","Ja"],["no","Nein"]]);
const security=field("IT-Sicherheit nachweisbar?","v10-sec",[["unknown","Unbekannt"],["yes","Ja"],["no","Nein"]]);
profilePanel.append(customization);
const loadedLine=P("Öffentliche Daten werden geladen …","v10-caption");profilePanel.append(loadedLine);
root.append(profilePanel);
const result=card("v10-result"),mainResult=N("div");result.append(N("div","v10-step","02 / DEINE ENTSCHEIDUNG"),mainResult);root.append(result);
const extra=D("Mehr Aufträge und die vollständige Begründung");
const more=N("div");extra.append(more);root.append(extra);
const explanation=D("Was kann BIDPILOT wirklich?");
explanation.append(P("Es durchsucht einen datierten Ausschnitt öffentlicher Ausschreibungen. Es vergleicht konkrete Auftragstitel mit deinem Team und zeigt einzelne bekannte Teilnahmehürden. Die vollständigen Bedingungen kann es nicht automatisch überprüfen.","v10-muted"));
explanation.append(P("Warum so gebaut? Wir testen die Hypothese, dass eine frühe, gut erklärte Warnung Zeit spart. Zeitersparnis und Qualität müssen erst mit Nutzer:innen gemessen werden.","v10-caption"));
root.append(explanation);
function selectTeam(i){
 chosen=i;const p=profiles[i];for(const[k,box]of Object.entries(skillInputs))box.checked=p.skills.includes(k);
 reference.value=p.reference;insurance.value="unknown";security.value="unknown";
 Array.from(presets.children).forEach((b,j)=>b.setAttribute("aria-pressed",String(j===i)));
}
function profile(){
 const skills=Object.keys(skillInputs).filter(k=>skillInputs[k].checked);
 return{skills,focus:skillInputs[profiles[chosen].focus].checked?profiles[chosen].focus:skills[0]||"",reference:reference.value,insurance:insurance.value,security:security.value};
}
function opportunity(it,title,kind){
 const c=N("article","v10-choice "+kind);c.append(N("div","v10-smallhead",title),N("h3","",it.shortTitle.length>142?it.shortTitle.slice(0,139)+"…":it.shortTitle));
 c.append(P(it.barriers.length?"Mögliche Hürde: "+it.barriers.join("; "):"Warum interessant? Das Thema passt zu eurem Angebot: "+it.hit.join(", ")+".","v10-reason"));
 c.append(P(it.buyer+" · Frist im Datensatz: "+it.deadline,"v10-caption"),A("Originalauftrag prüfen ↗",it.url));
 const why=D("Warum diese Einschätzung?");
 why.append(P(it.unknowns.join("; ")+" "+it.next,"v10-muted"));
 if(it.known)why.append(A("Veröffentlichte Anforderungen ↗","https://app.zuschlagsreif.de/ausschreibung/1406624-deutschland-entwicklung-von-kundenspezifischer-software-konzeption-entwicklung"));
 c.append(why);
 const controls=N("div","v10-smallactions");
 for(const [key,text]of [["review","Weiter prüfen"],["hold","Erst klären"],["skip","Überspringen"]]){
 const b=B(text,()=>{decisions[it.id]=key;Array.from(controls.children).forEach(x=>x.setAttribute("aria-pressed",String(x===b)))},"v10-chip");
 b.setAttribute("aria-pressed",String(decisions[it.id]===key));controls.append(b);
 }
 c.append(controls);return c;
}
function draw(){
 if(!loaded)return;
 current=Core.tenderDecision(profile(),feed,new Date().toISOString().slice(0,10));decisions={};mainResult.replaceChildren();more.replaceChildren();
 mainResult.append(P((offline?"Nur 3 Offline-Beispiele":feed.length+" öffentliche Bekanntmachungen")+" · Datenstand "+feedLabel,"v10-caption"));
 if(!current.recommended){mainResult.append(info("Kein passender Auftrag gefunden","Das ist ein echtes Null-Ergebnis. Bitte anderes Teamprofil wählen."));return}
 mainResult.append(opportunity(current.recommended,"EHER INTERESSANT · NÄHER PRÜFEN","v10-positive"));
 if(current.obstacle)mainResult.append(opportunity(current.obstacle,"MÖGLICHE HÜRDE · ERST KLÄREN","v10-caution"));
 else mainResult.append(info("Weitere Anforderungen noch unbekannt","Wir können keinen vollständigen Eignungscheck bestätigen. Originalunterlagen prüfen."));
 current.shown.filter(x=>x.id!==current.recommended.id&&x.id!==current.obstacle?.id).forEach(it=>more.append(opportunity(it,"WEITERER TREFFER","")));
 mainResult.append(btnrow(B("Entscheidung herunterladen ↗",()=>{
  const lines=["BIDPILOT · ENTSCHEIDUNGSNOTIZ",new Date().toISOString(),"Datenstand: "+feedLabel,"Team: "+profile().skills.join(", "),"","AUFTRÄGE"];
  for(const it of current.shown)lines.push(it.shortTitle,"Originalquelle: "+it.url,"Eignung: ungeprüft","Bekannte Hürden: "+it.barriers.join("; "),"Offene Fragen: "+it.unknowns.join("; "),"Entscheidung: "+(decisions[it.id]||"noch offen"),"");
  lines.push("Keine vollständige Teilnahmeprüfung; keine bestätigte Erfolgswahrscheinlichkeit.");
  save("bidpilot-entscheidung.txt",lines.join("\n"));
 })));
}
selectTeam(0);
mainResult.append(info("Dein Ergebnis wird vorbereitet","Wir laden die Quellen und prüfen das Beispielteam."));
const fallback=[
{id:"714363-2026",title:"Germany – Custom software development services – Konzeption und Entwicklung eines webbasierten Kundenportals",buyer:"Pro Arbeit – Kreis Offenbach",deadline:"2026-11-13",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/714363-2026"},
{id:"719791-2026",title:"Germany – IT services – KI-Assistent für die Wohngeldstelle",buyer:"Landratsamt Unstrut-Hainich-Kreis",deadline:"2026-11-18",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/719791-2026"},
{id:"723707-2026",title:"Germany – IT services – OpenStack Supportvertrag",buyer:"Dataport",deadline:"2026-11-19",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/723707-2026"}];
fetch("/bidpilot/notices.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Netzwerk");return r.json()}).then(d=>{
 if(d.schema!==2||!Array.isArray(d.notices)||!d.notices.length)throw Error("Unvollständiger Datensatz");
 feed=d.notices;feedLabel=String(d.fetched_at||"2026-10-20").slice(0,10);loaded=true;loadedLine.textContent="Bereit · "+feed.length+" echte veröffentlichte Aufträge im Datensatz";draw();
}).catch(()=>{offline=true;feed=fallback;feedLabel="20.10.2026";loaded=true;loadedLine.textContent="Daten gerade nicht verfügbar · 3 klar gekennzeichnete Offline-Beispiele";draw()});
footer("Unabhängiger Bewerbungsprototyp. Kein vollständiger Eignungscheck, keine Live-Vergabeüberwachung, keine gemessene Zeitersparnis.");
}
function support(){
hero("SNOCKS · AI ENGINEERING","Sieben Beschwerden. Ein mögliches Problem.","20 erfundene Supportnachrichten zeigen, wie ein wiederkehrendes Qualitätsproblem sichtbar wird – und warum der Mensch die Entscheidung behalten sollte.");
let tickets=Core.exampleTickets(),overrides={},routing={},notes={},log=[],fromCsv=false;
const top=card("v10-summary"),out=N("div");top.append(N("div","v10-step","01 / WAS IST AUFGEFALLEN?"),out);root.append(top);
const sample=card("v10-samples");sample.append(N("h2","","Die Meldungen hinter dem Hinweis"));
const samples=N("div");sample.append(samples);root.append(sample);
const action=card("v10-action");action.append(N("div","v10-step","02 / WAS SOLL DAS TEAM TUN?"));const review=N("div");action.append(review);root.append(action);
const testing=D("Ein eigenes Beispiel ausprobieren");
const msg=N("textarea");msg.id="v10-custom";msg.value="Leider läuft eine Masche an der Seite. Nach zwei Tagen kann ich die Socken kaum tragen.";testing.append(L("Neue Kundenanfrage",msg.id),msg);
const sku=S([["SOCKS","Socken"],["HOODIE","Kapuzenpullover"],["TEE","T-Shirt"],["","Noch unbekannt"]],"v10-product");testing.append(L("Produkt",sku.id),sku);
const preview=N("div");testing.append(preview);
function showPreview(){
 const val=text(msg.value,600),rule=R.classify(val),model=ML.classify(val);
 preview.replaceChildren(append(N("div","v10-compare"),append(N("div","v10-method"),N("span","","Feste Regeln"),N("strong","",Core.ISSUE[rule.category])),append(N("div","v10-method"),N("span","","Trainiertes Modell"),N("strong","",Core.ISSUE[model.category]))));
 preview.append(P(rule.category===model.category?"Beide erkennen dieselbe Kategorie. Trotzdem kein Beweis für Richtigkeit.":"Die Methoden widersprechen sich. Eine menschliche Prüfung ist nötig.","v10-caption"));
}
msg.addEventListener("input",showPreview);showPreview();
testing.append(btnrow(B("Anfrage hinzufügen",()=>{
 const val=text(msg.value,600);if(val.length<8||tickets.length>=300){preview.append(P("Bitte mindestens 8 Zeichen und maximal 300 Tickets.","v10-caption"));return}
 const id="NEU-"+(tickets.length+1);
 tickets.push({id,order:"TEST-"+id,sku:sku.value,message:val});
 log.push({event:"added",id});render();
 },"v10-secondary")));
const importBox=D("Anonymisierte CSV einlesen","Die Spalten heißen: ticket_id,sku,message (optional order_id). Es werden keine Daten versendet. Bitte keine personenbezogenen Nachrichten verwenden.");
const file=N("input");file.type="file";file.accept=".csv,text/csv";file.setAttribute("aria-label","Anonymisierte Ticket-CSV auswählen");
const feedback=P("","v10-caption");importBox.append(file,feedback);
file.addEventListener("change",async()=>{
 const f=file.files?.[0];if(!f)return;
 try{if(f.size>200000)throw Error("Maximal 200 KB");const rows=Core.parseCsv(await f.text());
 tickets=rows;overrides={};routing={};notes={};log=[{event:"csv-import",count:rows.length}];fromCsv=true;render();feedback.textContent=rows.length+" Nachrichten lokal ausgewertet.";
 }catch(err){feedback.textContent="Fehler: "+err.message}
});
testing.append(importBox);
testing.append(btnrow(B("Beispiele zurücksetzen",()=>{tickets=Core.exampleTickets();overrides={};routing={};notes={};log=[];fromCsv=false;render();showPreview()},"v10-ghost")));
root.append(testing);
const quality=D("Wie gut ist unsere Erkennung wirklich?");
const ev=ML.evaluate(),simple=R.evaluate(),hard=R.challenge(),matrix=N("div","v10-metrics");
matrix.append(stat(ev.model.correct+"/"+ev.model.total,"Trainiertes Modell"),stat(ev.rules.correct+"/"+ev.rules.total,"Feste Regeln"));
quality.append(matrix,P("136 synthetische Trainingsbeispiele, 29 separate synthetische Testnachrichten. Davon wurden zehn vom Modell falsch eingeordnet. Die Testfälle wurden bereits analysiert und dürfen nicht mehr zur unabhängigen Abschlussbewertung verwendet werden.","v10-muted"));
const groups=["material","delivery","size","return","mixed","unknown"],errors=D("Welche Fehler macht das Modell?");
for(const k of groups){const cases=ev.model.rows.filter(x=>x.expected===k),right=cases.filter(x=>x.expected===x.got).length;
 errors.append(P(Core.ISSUE[k]+": "+right+"/"+cases.length,"v10-caption"))}
ev.model.errors.slice(0,5).forEach(x=>errors.append(P("„"+x.text+"“ → Modell: "+Core.ISSUE[x.got]+", richtig: "+Core.ISSUE[x.expected],"v10-muted")));
quality.append(errors);
quality.append(P("Verlässliche Verbesserung: neue reale, anonymisierte Testfälle und ein unangetastetes Testset. Vorher auf getrennten Entwicklungsdaten trainieren, vergleichen und die Regeln für menschliche Prüfung festlegen. Nicht auf die bekannten 29 Fehler optimieren.","v10-caption"));
root.append(quality);
const limits=D("Wie funktioniert das – und was sind die Grenzen?");
limits.append(P("Zwei Methoden: feste Textregeln und ein trainiertes Naive-Bayes-Modell. Ein Materialhinweis wird nur dann gemeinsam gezählt, wenn beide Methoden übereinstimmen oder jemand den Fall korrigiert. Unbekannte Fälle werden nicht automatisch freigegeben.","v10-muted"));
limits.append(P("Die Vierer-Schwelle für eine auffällige Häufung ist beispielhaft, keine geprüfte Qualitätsgrenze. Keine reale Support-Integration, kein LLM und keine automatische Kundenantwort.","v10-muted"));
root.append(limits);
function correction(row,parent){
 const item=N("div","v10-ticket");item.append(N("strong","",row.message),P(row.id+" · Regeln: "+Core.ISSUE[row.rule.category]+" · Modell: "+Core.ISSUE[row.ml.category],"v10-caption"));
 const fix=S([["auto","Automatische Einschätzung behalten"],["material","Materialproblem"],["delivery","Lieferung"],["size","Größe / Passform"],["return","Rückgabe"],["mixed","Mehrere Anliegen"],["unknown","Noch unbekannt"]]);
 fix.value=Object.prototype.hasOwnProperty.call(overrides,row.id)?overrides[row.id]:"auto";fix.setAttribute("aria-label","Einordnung korrigieren: "+row.id);
 fix.addEventListener("change",()=>{if(fix.value==="auto")delete overrides[row.id];else overrides[row.id]=fix.value;log.push({event:"corrected",id:row.id,category:fix.value});render()});
 item.append(fix);parent.append(item);
}
function render(){
 const x=Core.triage(tickets,overrides,routing);out.replaceChildren();samples.replaceChildren();review.replaceChildren();
 const metrics=N("div","v10-metrics");metrics.append(stat(x.total,"Nachrichten geprüft"),stat(x.countMaterial,"Materialhinweise"),stat(x.disagreements,"Unterschiedliche Ergebnisse"));out.append(metrics);
 if(x.top){
 out.append(append(N("div","v10-alert"),N("div","v10-smallhead","MÖGLICHES QUALITÄTSPROBLEM"),N("h3","",x.top.materials.length+" ähnliche Beschwerden bei "+x.top.name),P("Das ist ein Hinweis, kein nachgewiesener Produktdefekt.")));
 const shown=x.top.materials.slice(0,3);
 shown.forEach(row=>samples.append(append(N("div","v10-quote"),N("span","","„"+row.message+"“"))));
 const rest=D("Alle "+x.top.materials.length+" Materialmeldungen und Korrekturen");
 x.top.materials.forEach(row=>correction(row,rest));samples.append(rest);
 const note=N("textarea");note.id="v10-note";note.value=notes[x.top.sku]?.text||("Bitte "+x.top.materials.length+" Materialbeschwerden zu "+x.top.name+" auf Produkt/Charge prüfen. Noch kein Defekt bestätigt.");
 review.append(N("h2","","Produktqualität informieren"),P("Notiz prüfen, bei Bedarf korrigieren und für das Team vormerken.","v10-muted"),L("Vorgeschlagene interne Notiz",note.id),note);
 const checkbox=N("input");checkbox.type="checkbox";checkbox.id="v10-approve";checkbox.checked=!!notes[x.top.sku]?.approved;
 review.append(append(N("div","v10-check"),checkbox,L("Für menschliche Qualitätsprüfung vormerken",checkbox.id)));
 note.addEventListener("input",()=>{notes[x.top.sku]={text:note.value,approved:checkbox.checked}});
 checkbox.addEventListener("change",()=>{notes[x.top.sku]={text:note.value,approved:checkbox.checked};log.push({event:"human-review",product:x.top.sku,approved:checkbox.checked})});
 }else{
 out.append(info("Kein gemeinsames Muster oberhalb der Beispielschwelle","Das ist keine Entwarnung. Unklare Nachrichten brauchen weiterhin Aufmerksamkeit."));
 samples.append(P("Auch ohne auffällige Häufung kannst du unsichere Nachrichten prüfen.","v10-muted"));
 review.append(P("Noch keine gebündelte Qualitätsempfehlung. Einzelne Fälle müssen bei Bedarf geprüft werden.","v10-muted"));
 }
 const conflicts=D(x.ambiguous.length+" unklare oder widersprüchliche Nachrichten prüfen");
 x.ambiguous.forEach(row=>correction(row,conflicts));samples.append(conflicts);
 const missing=D(x.unlinked.length+" Nachrichten ohne Produktzuordnung");
 x.unlinked.forEach(row=>{
  const item=N("div","v10-ticket");item.append(P(row.id+" · "+row.message,"v10-muted"));
  const route=S([["","Noch unbekannt"],["SOCKS","Socken"],["HOODIE","Kapuzenpullover"],["TEE","T-Shirt"]]);
  route.setAttribute("aria-label","Produkt für "+row.id+" zuordnen");
  route.addEventListener("change",()=>{routing[row.id]=route.value;log.push({event:"route",id:row.id,sku:route.value});render()});
  item.append(route);missing.append(item);
 });if(x.unlinked.length)samples.append(missing);
 const download=B("Prüfbericht herunterladen ↗",()=>{
  const current=Core.triage(tickets,overrides,routing);
  const lines=["RETURN LOOP · QUALITÄTSPRÜFUNG",new Date().toISOString(),"Daten: "+(fromCsv?"lokale anonymisierte CSV":"synthetische Beispieldaten"),"Nachrichten: "+current.total,"Materialmeldungen: "+current.countMaterial,"Widersprüche: "+current.disagreements,""];
  for(const g of current.groups)lines.push(g.name+": "+g.materials.length+" Materialhinweise", " ");
  for(const [sku,v]of Object.entries(notes))lines.push("Qualitätsprüfung "+sku+": "+(v.approved?"Vorgemerkt":"Offen"),"Notiz: "+v.text);
  lines.push("NACHRICHTEN MIT BELEGEN");for(const row of current.rows)lines.push(row.id+" | "+row.message+" | Produkt: "+(row.sku||"unbekannt")+" | Regel: "+row.rule.category+" | Modell: "+row.ml.category+" | Endgültige Prüfung: "+row.category+" | Textbelege: "+row.rule.evidence.join(", "));
  lines.push("LOKALE BEARBEITUNG:");for(const item of log)lines.push(JSON.stringify(item));
  lines.push("Keine automatische Shop-Aktion. Historische synthetische Modelltests: "+ev.model.correct+"/"+ev.model.total+".");
  save("return-loop-pruefbericht.txt",lines.join("\n"));
 });
 review.append(btnrow(download));
}
render();
footer("Erfundene Testdaten, regelbasierte Erkennung und trainiertes Naive Bayes. Keine echten Shopdaten, keine automatisch versendeten Nachrichten und keine validierte Produktfehlerquote.");
}
isSupport?support():bid();
})();