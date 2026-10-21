/* APPLICATION LAB V8 · 60-second applicant demo; accessible, no remote user-data transmissions. */
(function(){
"use strict";
const support=new URLSearchParams(location.search).get("demo")==="return-loop";
const E=window.BidScreening,T=window.ReturnTriage,M=window.SupportML;
if(!E||!T||!M){document.body.append(Object.assign(document.createElement("p"),{textContent:"Die Demo-Dateien wurden nicht vollständig geladen. Bitte die Seite neu laden."}));return}
const root=document.createElement("main");root.id="v6";root.className="v8";root.dataset.type=support?"support":"tender";
const old=document.querySelector("main.wrap");if(old){old.style.display="none";old.insertAdjacentElement("afterend",root)}else document.body.append(root);
const styles=document.createElement("link");styles.rel="stylesheet";styles.href="./v6.css";document.head.append(styles);
const e=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=String(content);return n};
const add=(p,...kids)=>{p.append(...kids);return p},para=(txt,cls)=>e("p",cls||"",txt),link=(txt,url)=>{const a=e("a","",txt);a.href=url;a.rel="noopener noreferrer";a.target="_blank";return a};
const button=(txt,cb,cls="v6-main")=>{const b=e("button",cls,txt);b.type="button";b.addEventListener("click",cb);return b};
const label=(text,forId)=>{const l=e("label","",text);if(forId)l.htmlFor=forId;return l};
const select=opts=>{const s=e("select");for(const [val,txt]of opts){const o=e("option","",txt);o.value=val;s.append(o)}s.value=opts[0][0];return s};
const tidy=(s,n=500)=>String(s||"").trim().slice(0,n);
const status=(title,detail)=>add(e("div","v8-summary"),e("strong","",title),para(detail,"v6-mute"));
function download(name,text){const blob=new Blob([text],{type:"text/plain;charset=utf-8"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1200)}
function headline(k,t,subtitle){root.append(e("div","v6-k",k));const h=e("h1");h.innerHTML=t;root.append(h,para(subtitle,"v6-lead"))}
function aside(title,content){const d=e("details","v8-details");d.append(e("summary","",title));if(typeof content==="string")d.append(para(content,"v6-mute"));else d.append(content);return d}
function layout(leftTitle,rightTitle){const wrap=e("div","v6-layout"),left=add(e("section","v6-panel"),e("div","v6-k","01 / DEIN INPUT"),e("h2","",leftTitle)),right=add(e("section","v6-panel"),e("div","v6-k","02 / DAS ERGEBNIS"),e("h2","",rightTitle));wrap.append(left,right);root.append(wrap);return{left,right}}
function foot(text){root.append(add(e("div","v6-foot"),para(text,"v6-tiny"),link("Code & dokumentierte Tests ↗","https://github.com/mikelninh/mikelninh.github.io/tree/main/application-demos")))}
function bid(){
 document.title="BIDPILOT · Was sollten wir verfolgen?";
 headline("BIDPILOT · ARBEITSPROBE FÜR A11","Nicht jeder Auftrag<br><em>ist unsere Zeit wert.</em>","Ein kleines Team sucht neue Projekte. BIDPILOT zeigt sofort, was interessant sein könnte – und wo ein möglicher Ausschlussgrund steckt.");
 const {left,right}=layout("Wähle dein Team","Was solltest du tun?");
 left.append(para("Wechsle das Beispielteam. Die Entscheidung ändert sich mit seinen Fähigkeiten.","v6-mute"));
 const choice=e("div","v8-options");
 const presets=[["Webstudio",["web"],"web","no"],["KI-Team",["ai","web"],"ai","unknown"],["IT-Betrieb",["cloud"],"cloud","unknown"]];
 let active=0,all=[],result=null,profile=null,decisions={},stamp="20.10.2026",offline=false;
 const skillInputs={},skillWrap=e("details","v8-details");skillWrap.append(e("summary","","Team genauer beschreiben"));
 for(const[k,title]of [["web","Webseiten & Portale"],["ai","KI-Anwendungen"],["cloud","IT-Betrieb"]]){const row=e("div","v6-check"),input=e("input");input.type="checkbox";input.id="v8-"+k;row.append(input,label(title,input.id));skillWrap.append(row);skillInputs[k]=input}
 const makeField=(name,id,values)=>{const l=label(name,id),s=select(values);s.id=id;skillWrap.append(l,s);s.addEventListener("change",recompute);return s};
 const reference=makeField("Vergleichbare Behördenreferenz?", "v8-ref",[["unknown","Unklar"],["yes","Ja, vorhanden"],["no","Nein"]]);
 const insurance=makeField("Passende Berufshaftpflicht?", "v8-ins",[["unknown","Unklar"],["yes","Ja, vorhanden"],["no","Nein"]]);
 const security=makeField("IT-Sicherheitsnachweis?", "v8-sec",[["unknown","Unklar"],["yes","Ja, vorhanden"],["no","Nein"]]);
 for(const b of Object.values(skillInputs))b.addEventListener("change",recompute);
 left.append(choice,skillWrap);
 const info=para("Öffentliche Aufträge werden geladen …","v6-tiny");left.append(info);
 const output=e("div");right.append(output);
 const cfg=[["web","Webentwicklung"],["ai","KI-Software"],["cloud","IT-Betrieb"]];
 function selectPreset(i){active=i;const x=presets[i];for(const[k,cb]of Object.entries(skillInputs))cb.checked=x[1].includes(k);reference.value=x[3];insurance.value="unknown";security.value="unknown";[...choice.children].forEach((b,j)=>b.setAttribute("aria-pressed",String(j===i)));recompute()}
 presets.forEach((x,i)=>choice.append(button(x[0],()=>selectPreset(i),"v6-sub")));
 const summary=e("div","v8-outcome");output.append(summary);
 const details=e("details");details.append(e("summary","","Weitere Treffer und Originalquellen"));output.append(details);
 let loaded=false;
 function recompute(){
 if(!loaded)return;
 profile={skills:Object.entries(skillInputs).filter(([,cb])=>cb.checked).map(([k])=>k),focus:skillInputs[presets[active][2]].checked?presets[active][2]:Object.entries(skillInputs).find(([,b])=>b.checked)?.[0]||"",reference:reference.value,insurance:insurance.value,security:security.value};
 result=E.screen(profile,all,new Date().toISOString().slice(0,10));decisions={};paint();
 }
 function choiceButtons(it,parent){
 const row=e("div","v6-actions");for(const [v,t]of [["review","Weiter prüfen"],["hold","Erst klären"],["skip","Überspringen"]]){
 const b=button(t,()=>{decisions[it.id]=v;[...row.children].forEach(x=>x.setAttribute("aria-pressed",String(x===b)))},"v6-sub");b.setAttribute("aria-pressed","false");row.append(b);}
 parent.append(row);
 }
 function renderCard(it,title){
 const card=e("div","v8-decision");card.append(e("div","v6-k",title),e("h3","",it.shortTitle.slice(0,145)));
 const reason=it.barriers.length?"Mögliche Hürde: "+it.barriers.join("; "):"Fachlicher Bezug: "+it.hit.join(", ")+". Teilnahmebedingungen noch offen.";
 card.append(para(reason,"v6-mute"),para("Auftraggeber: "+it.buyer+" · Frist laut Datensatz: "+it.deadline,"v6-tiny"),link("Original-Auftrag ansehen ↗",it.url));
 const why=e("details");why.append(e("summary","","Wie kommt diese Einschätzung zustande?"),para(it.next+" "+it.unknowns.join("; "),"v6-mute"));
 if(it.known)why.append(link("Veröffentlichte Nachweise zum Auftrag ↗","https://app.zuschlagsreif.de/ausschreibung/1406624-deutschland-entwicklung-von-kundenspezifischer-software-konzeption-entwicklung"));card.append(why);choiceButtons(it,card);return card;
 }
 function paint(){
 summary.replaceChildren();details.replaceChildren(e("summary","","Weitere Treffer und Originalquellen"));
 if(!result.shown.length){summary.append(status("Für dieses Team keine Treffer in den geladenen Daten","Wir erfinden keine Möglichkeiten. Passe die Fähigkeiten an oder prüfe die Originalplattform."));return}
 const best=result.shown.find(x=>!x.barriers.length)||result.shown[0];
 const blocker=result.shown.find(x=>x.barriers.length&&x.id!==best.id);
 summary.append(para((offline?"Offline-Beispiele":"Datenstand "+stamp)+" · "+result.matched+" passende Auftragstitel · 3 wichtigste Entscheidungen","v6-tiny"));
 summary.append(renderCard(best,"INTERESSANT · WEITER PRÜFEN"));
 if(blocker)summary.append(renderCard(blocker,"VORSICHT · ERST HÜRDE KLÄREN"));
 else summary.append(status("Noch kein klarer formaler Ausschluss aus den vorhandenen Daten","Das ist kein Eignungsnachweis: Für die meisten Aufträge fehlen vollständige Teilnahmebedingungen."));
 const used=new Set([best.id,blocker?.id]);
 for(const x of result.shown.filter(x=>!used.has(x.id)))details.append(renderCard(x,"WEITERER TREFFER"));
 output.querySelector(".v8-download")?.remove();
 output.append(add(e("div","v6-actions v8-download"),button("Entscheidung herunterladen ↗",()=>{
 const lines=["BIDPILOT · AUFTRAGSENTSCHEIDUNG",new Date().toISOString(),"Datensatz "+stamp,"Team: "+profile.skills.join(", "),"Referenz: "+profile.reference,"Versicherung: "+profile.insurance,"Sicherheitsnachweis: "+profile.security,"Treffer im Bestand: "+result.matched,""];
 for(const it of result.shown)lines.push("AUFTRAG: "+it.shortTitle,"Originalquelle: "+it.url,"Begründung: "+it.hit.join("; "),"Hürden: "+it.barriers.join("; "),"Offen: "+it.unknowns.join("; "),"Entscheidung: "+(decisions[it.id]||"Noch offen"),"");
 lines.push("Ausschließlich vorläufiger Abgleich von Titeln und einzelnen veröffentlichten Anforderungen; keine geprüfte Eignung.");
 download("bidpilot-entscheidung.txt",lines.join("\n"));
 })));
 }
 selectPreset(0);
 summary.append(status("Erste Entscheidung wird vorbereitet","Der öffentliche Datensatz wird eingelesen."));
 const offlineData=[
 {id:"714363-2026",title:"Germany – Custom software development – Konzeption Entwicklung und Implementierung eines webbasierten Kundenportals",buyer:"Pro Arbeit Kreis Offenbach",deadline:"2026-11-13",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/714363-2026"},
 {id:"719791-2026",title:"Germany – IT services – KI-Assistent für die Wohngeldstelle",buyer:"Landratsamt Unstrut-Hainich-Kreis",deadline:"2026-11-18",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/719791-2026"},
 {id:"723707-2026",title:"Germany – IT services – OpenStack Supportvertrag",buyer:"Dataport",deadline:"2026-11-19",stage:"competition",url:"https://ted.europa.eu/en/notice/-/detail/723707-2026"}
 ];
 fetch("/bidpilot/notices.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Nicht erreichbar");return r.json()}).then(data=>{
 if(!Array.isArray(data.notices)||!data.notices.length)throw Error("Leere Liste");
 all=data.notices;stamp=String(data.fetched_at||"20.10.2026").slice(0,10);loaded=true;info.textContent=all.length+" veröffentlichte Einträge · Stand "+stamp;recompute();
 }).catch(()=>{all=offlineData;offline=true;loaded=true;stamp="Offline-Beispiele";info.textContent="Datenserver nicht erreichbar – nur 3 ausdrücklich gekennzeichnete Beispiele.";recompute()});
 left.append(aside("Warum genau diese Produktentscheidung?","Hypothese: Kleine Teams sparen Zeit, wenn mögliche Ausschlussgründe vor einer langen Recherche sichtbar werden. Noch nicht validiert. Nächster Test: fünf Teams, die ohne Anleitung eine nachvollziehbare Vorauswahl treffen. Metriken: falsche Treffer, Zeit bis zur Entscheidung und Verständnis der Begründung."));
 foot("Echte öffentliche Bekanntmachungen, begrenzter Datensatz. Wir prüfen nicht automatisch vollständige Teilnahmebedingungen. Ein möglicher Ausschlussgrund ist ein Hinweis, keine rechtsverbindliche Entscheidung.");
}
function returnLoop(){
 document.title="RETURN LOOP · Was erkennt das Modell wirklich?";
 headline("RETURN LOOP · ARBEITSPROBE FÜR SNOCKS","Kann unsere KI<br><em>Beschwerden erkennen?</em>","Ein unbekannter Kundentext wird von zwei Methoden geprüft. Siehst du, wo das trainierte Modell hilft – und wo ein Mensch eingreifen muss?");
 const {left,right}=layout("Teste eine neue Nachricht","Zwei Antworten. Eine sichere Entscheidung.");
 left.append(para("Probier eine Formulierung, die nicht wörtlich in unseren einfachen Regeln steht.","v6-mute"));
 const text=add(e("textarea"),);text.id="v8-msg";text.value="Leider läuft eine Masche an der Seite. Nach zwei Tagen kann ich die Socken kaum tragen.";text.setAttribute("aria-label","Kundenanfrage");
 left.append(label("Kundenanfrage","v8-msg"),text);
 const result=e("div");right.append(result);
 const liveOutput=add(e("div","v6-actions"),button("Nachricht vergleichen →",compare));left.append(liveOutput);
 const sampleRow=e("div","v6-actions");left.append(sampleRow);
 const examples=[
 ["Laufende Masche","Leider läuft eine Masche an der Seite. Nach zwei Tagen kann ich die Socken kaum tragen."],
 ["Versand & Defekt","Das Paket ist noch nicht da und der Stoff ist eingerissen."],
 ["Unklare Nachricht","Danke! Ich habe noch eine Frage zu euren Produkten."]
 ];
 examples.forEach(([title,message])=>sampleRow.append(button(title,()=>{text.value=message;compare()},"v6-sub")));
 const stats=M.evaluate();
 const cases=add(e("div","v8-evidence"),e("h3","","Testvergleich · andere Beispielsätze"));
 const metrics=e("div","v6-metrics");metrics.append(add(e("div","v6-metric"),e("strong","",stats.model.correct+"/"+stats.model.total),e("span","","Trainiertes Modell")),add(e("div","v6-metric"),e("strong","",stats.rules.correct+"/"+stats.rules.total),e("span","","Feste Regeln")));
 cases.append(metrics,para("29 separat formulierte, synthetische Testnachrichten. Nicht aus dem Training des Modells. Keine Kundendaten, keine unabhängige Produktionsmessung.","v6-tiny"));
 const errors=add(e("div"),para("Das Modell liegt bei diesen Beispielen noch "+stats.model.errors.length+"-mal falsch. Die Fehler werden nicht versteckt.","v6-mute"));
 const errDetails=e("details");errDetails.append(e("summary","","Alle Modellfehler anschauen"));
 stats.model.errors.forEach(item=>errDetails.append(para("„"+item.text+"“ · Soll: "+T.LABELS[item.expected]+" · Modell: "+T.LABELS[item.got],"v6-tiny")));errors.append(errDetails);cases.append(errors);
 left.append(cases);
 const review=add(e("div","v8-review"),e("h3","","Was würdest du entscheiden?"));
 const decision=select([["review","Zur menschlichen Prüfung"],["material","Als mögliches Materialproblem markieren"],["delivery","Lieferfrage"],["size","Größe / Passform"],["return","Rückgabe"],["unknown","Unklar"]]);decision.id="v8-decision";review.append(label("Manuelle Entscheidung","v8-decision"),decision);
 const decisionStatus=para("","v6-tiny");review.append(decisionStatus);
 decision.addEventListener("change",()=>{decisionStatus.textContent="Manuelle Entscheidung: "+T.LABELS[decision.value]+" – wird im Prüfbericht dokumentiert."});right.append(review);
 function compare(){
 const msg=tidy(text.value,1000);if(msg.length<8){result.replaceChildren(status("Bitte eine längere Nachricht eingeben","Mindestens acht Zeichen sind für einen sinnvollen Vergleich erforderlich."));return}
 const r=T.classify(msg),m=M.classify(msg),agree=r.category===m.category;
 result.replaceChildren();
 result.append(para(agree?"Beide Methoden stimmen überein.":"Die Methoden widersprechen sich – bitte prüfen.","v8-resultline"));
 const row=e("div","v8-comparison");
 for(const [labelText,o,description]of [["REGELN · BASELINE",r,"Findet bekannte Formulierungen"],["TRAINIERTES MODELL · NAIVE BAYES",m,"Lernt Muster aus synthetischen Beispielen"]]){
 const card=e("div","v8-model");card.append(e("div","v6-k",labelText),e("h3","",T.LABELS[o.category]));
 card.append(para(labelText.startsWith("REGELN")?(r.evidence?.length?"Gefundene Wörter: "+r.evidence.join(", "):"Keine eindeutigen Signalwörter."):(m.matched?.length?"Gelernte Wortsignale: "+m.matched.join(", "):"Wenige bekannte Wortmuster."),"v6-tiny"));card.append(para(description,"v6-mute"));row.append(card);
 }
 result.append(row);
 result.append(status(agree?"Nächster Schritt: Ergebnis prüfen":"Nächster Schritt: Mensch entscheidet",agree?"Auch Übereinstimmung ist kein Beweis, dass die Klassifikation korrekt ist.":"Bei widersprüchlichen Ergebnissen wird keine automatische Aktion ausgelöst."));
 decision.value="review";decisionStatus.textContent="Empfehlung: erst prüfen, dann freigeben.";
 }
 compare();
 right.append(add(e("div","v6-actions"),button("Prüfvermerk herunterladen ↗",()=>{
 const msg=tidy(text.value,1000),r=T.classify(msg),m=M.classify(msg);
 download("return-loop-modellvergleich.txt",["RETURN LOOP · VERGLEICH",new Date().toISOString(),"Nachricht: "+msg,"Regeln: "+T.LABELS[r.category],"Belege: "+(r.evidence||[]).join(", "),"Modell (Naive Bayes, synthetisch trainiert): "+T.LABELS[m.category],"Gelernte Wortsignale: "+(m.matched||[]).join(", "),"Übereinstimmung: "+(r.category===m.category?"Ja":"Nein"),"Menschliche Entscheidung: "+T.LABELS[decision.value],"Synthetischer Holdout: ML "+stats.model.correct+"/"+stats.model.total+"; Regeln "+stats.rules.correct+"/"+stats.rules.total,"Keine kalibrierten Wahrscheinlichkeiten. Keine echten Supportdaten, keine Nachricht versendet oder Shop-Aktion ausgelöst."].join("\n"));
 })));
 right.append(aside("Warum nicht einfach alles automatisch beantworten?","Bei realen Reklamationen sind falsche Aussagen zu Bestellungen, Rückerstattungen oder Lieferstatus riskant. Deshalb werden unsichere Fälle nicht automatisch freigegeben. Das trainierte Modell ist klassisches Machine Learning (Naive Bayes), kein Sprachmodell. Die Fehleranalyse ist Teil des Produkts."));
 foot("Modelle laufen lokal im Browser. Trainiert wurde mit 136 handbeschrifteten synthetischen Sätzen; der Test vergleicht 29 weitere synthetische Sätze. Eine unabhängige Prüfung mit echten, freigegebenen Supportdaten steht aus.");
}
support?returnLoop():bid();
})();