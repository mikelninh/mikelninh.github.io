/* BRIDGE v0.1: transparent public-source matching. No private data, API calls or real contacts. */
(function(){
"use strict";
const library={
bfarm:{name:"BfArM · Konformitätsbewertung",kind:"OFFIZIELLE INFORMATION",desc:"Grundlagen zur Marktfähigkeit von Medizinprodukten, klinischen Daten und Konformitätsbewertung.",url:"https://www.bfarm.de/EN/Medical-devices/Overview/Basic-information/Conformity-assessment/_artikel.html?nn=986770",reason:"Regulatorische Anforderungen vor einer klinischen Erprobung einordnen.",caution:"Allgemeine Information, keine individuelle medizinrechtliche Beratung."},
mdcg:{name:"EU-Kommission · MDR/IVDR Guidance",kind:"EU-LEITLINIEN",desc:"Öffentlich verfügbare MDCG-Leitlinien zum EU-Medizinprodukterecht.",url:"https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en",reason:"Konkrete offene Fragen für spezialisierte regulatorische Beratung sammeln.",caution:"Leitlinien können sich ändern; Anwendbarkeit eigenständig prüfen."},
network:{name:"HTGF · Unterstützung über Kapital hinaus",kind:"ÖFFENTLICHER HINTERGRUND",desc:"Beschreibt das Netzwerk, Expert:innen und das Relationship-Management-Angebot.",url:"https://www.htgf.de/en/what-htgf-has-to-offer-for-start-ups/",reason:"Zeigt, welche Unterstützungsformen grundsätzlich eine Rolle spielen könnten.",caution:"Historischer Beitrag von 2021. Keine garantierten Kontakte."},
academy:{name:"HTGF Academy · Wissenstransfer",kind:"PROGRAMMHINTERGRUND",desc:"Beschreibt Lern- und Austauschformate für Führung, Sales, Cash Management und mehr.",url:"https://www.htgf.de/en/the-new-htgf-academy/",reason:"Bereits dokumentierte Lernformate prüfen, statt Angebote zu erfinden.",caution:"Artikel von 2022, kein aktueller Kurskatalog oder Zugangsnachweis."},
portfolio:{name:"HTGF · Öffentliches Portfolio",kind:"UNTERNEHMENSÜBERSICHT",desc:"Öffentliche Darstellung von Unternehmen aus den Bereichen Digital Tech, Life Sciences und Deep Tech.",url:"https://www.htgf.de/en/portfolio/",reason:"Vergleichbare Geschäftsmodelle, Branchen und öffentlich belegte Erfahrungen entdecken.",caution:"Ähnlicher Sektor bedeutet nicht persönliche Verbindung oder Kooperationsbereitschaft."},
digital:{name:"HTGF · Digital Tech & Corporate Network",kind:"ÖFFENTLICHES LEISTUNGSVERSPRECHEN",desc:"Beschreibt mögliche Unterstützung durch Corporate-Verbindungen, technische Expertise und internationale Netzwerke.",url:"https://www.htgf.de/en/digital-tech/",reason:"Passende Unterstützungsarten für Industriekunden und B2B-Partnerschaften verstehen.",caution:"Keine Garantie für eine bestimmte Einführung oder einen verfügbaren Partner."},
exist:{name:"EXIST · Förderung wissenschaftlicher Gründungen",kind:"OFFIZIELLE FÖRDERPROGRAMME",desc:"Übersicht der öffentlichen Gründungsförderprogramme für wissenschaftsnahe Startups.",url:"https://exist.de/en/programme/",reason:"Zusätzliche Förder- und Beratungswege für sehr frühe Deep-Tech-Teams prüfen.",caution:"Antrags- und Zugangsvoraussetzungen separat prüfen."},
contact:{name:"HTGF · Zuständigkeiten & Kontakt",kind:"OFFIZIELLE KONTAKTSEITE",desc:"Öffentliche Kontaktkanäle für unterschiedliche Technologiebereiche.",url:"https://www.htgf.de/en/contact/",reason:"Bei berechtigtem Anlass eine Frage an den offiziellen Kontaktkanal richten.",caution:"Kein Zugang zu internen Kontakten und keine automatisierte Einführung."}
};
const examples={
medtech:{sector:"MedTech · klinischer Pilot",phase:"Proof of Concept",text:"Unser Diagnose-Prototyp funktioniert technisch. Wir suchen klinische Pilotpartner und möchten verstehen, welche regulatorischen Schritte vor einer Erprobung erforderlich sind.",resourceIds:["bfarm","mdcg","network"],questions:["Für welche konkrete klinische Anwendung soll der Prototyp eingesetzt werden?","Welche Daten liegen bisher zu Sicherheit und Leistungsfähigkeit vor?"],next:"Zuerst Anwendungsfall und regulatorische Fragen dokumentieren; dann geeignete Fachexpertise einbeziehen."},
climate:{sector:"Climate Tech · Industriepilot",phase:"Technische Validierung",text:"Unser Batteriesystem funktioniert im Labor. Wir suchen Industriepilotkunden und möchten messbar zeigen, für welche Anwendung unsere Technologie wirtschaftlich sinnvoll ist.",resourceIds:["digital","portfolio","exist"],questions:["Welcher industrielle Anwendungsfall hat schon einen nachvollziehbaren Nutzen?","Welcher messbare Test würde einen ersten Pilot erfolgreich machen?"],next:"Ein kleines, messbares Industriepilot-Konzept formulieren, bevor konkrete Partner gesucht werden."},
saas:{sector:"B2B SaaS · Go-to-Market",phase:"Erste Design-Partner",text:"Unsere B2B-Software wird von neun Design-Partnern getestet. Wie bauen wir einen wiederholbaren Sales-Prozess und unterscheiden Interesse von echter Zahlungsbereitschaft?",resourceIds:["academy","digital","network"],questions:["Welches Kundensegment ist bisher am häufigsten wiedergekommen?","Welche Kennzahlen zeigen wiederkehrende Nutzung und Zahlungsbereitschaft?"],next:"Eine überprüfbare Sales-Hypothese mit wenigen Kundengesprächen und einem klaren Aktivierungsziel testen."}
};
const id=x=>document.getElementById(x);
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let choice="medtech",answer=null;
let votes={};try{votes=JSON.parse(localStorage.getItem("bridge-demo-feedback")||"{}")}catch{}
function choose(s){
 if(!examples[s])return;
 choice=s;answer=null;
 document.querySelectorAll(".scenario").forEach(b=>{const on=b.dataset.case===s;b.classList.toggle("selected",on);b.setAttribute("aria-pressed",String(on))});
 id("founder-question").value=examples[s].text;
 id("wordcount").textContent=id("founder-question").value.length+"/900";
 id("report").hidden=true;id("report").innerHTML="";id("report-placeholder").hidden=false;
}
function classify(txt){
 const t=txt.toLowerCase();
 const any=arr=>arr.some(a=>t.includes(a));
 if(any(["klinisch","diagnos","regulator","patient","medizin","ivdr","gesundheit"]))return "medtech";
 if(any(["klima","climate","energie","batterie","industriepilo","co2","solar"]))return "climate";
 if(any(["b2b","saas","software","sales","vertrieb","conversion","produktmarkt","kundenaktivier"]))return "saas";
 return null; // Honest abstention: never show a preset matching story as though the user's words were understood.
}
function run(){
 const text=id("founder-question").value.trim();
 if(text.length<18){id("founder-question").setCustomValidity("Bitte mindestens 18 Zeichen zum Anliegen eingeben.");id("founder-question").reportValidity();id("founder-question").focus();return}
 id("founder-question").setCustomValidity("");
 const topic=classify(text);
 if(!topic){
  answer=null;
  id("report-placeholder").hidden=true;id("report").hidden=false;
  id("report").innerHTML='<div class="report-header"><span class="report-tag">02 / EHRLICHER MATCHING-STATUS</span><span class="report-status">Bitte konkretisieren</span></div>'+ 
   '<h3 class="report-heading">Dazu kenne ich noch keine passende Unterstützung.</h3>'+ 
   '<p class="report-lead">Dein Anliegen lässt sich mit den drei aktuellen, kuratierten Beispielkategorien nicht sicher zuordnen. Statt unpassende Kontakte oder Ressourcen zu empfehlen, bitte ich um eine konkrete Rückfrage.</p>'+ 
   '<div class="review"><b>Eine gute nächste Frage:</b><p class="need">Geht es vor allem um klinische Pilotpartner, Industriekunden oder B2B-Vertrieb – oder um ein ganz anderes Thema?</p></div>'+ 
   '<p class="report-footer">Kein Matching durchgeführt · Keine Ressourcen erfunden · Der eingegebene Text bleibt in diesem Browser-Tab.</p>';
  if(window.innerWidth<850)id("report").scrollIntoView({behavior:"smooth",block:"start"});
  return;
 }
 const scenario=examples[topic];
 answer={topic,input:text,scenario,resources:scenario.resourceIds.map(key=>library[key]),note:""};
 id("report-placeholder").hidden=true;id("report").hidden=false;
 render();
 if(window.innerWidth<850)id("report").scrollIntoView({behavior:"smooth",block:"start"});
}
function render(){
 if(!answer)return;
 const a=answer,scenario=a.scenario;
 const cards=a.resources.map((r,i)=>'<article class="resource"><div class="resource-top"><span class="resource-index">RESSOURCE 0'+(i+1)+'</span><span class="resource-kind">'+esc(r.kind)+'</span></div><h4>'+esc(r.name)+'</h4><p>'+esc(r.desc)+'</p><div class="why"><b>Warum das passen könnte:</b> '+esc(r.reason)+'</div><div class="source-row"><span>'+esc(r.caution)+'</span><a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">Originalquelle ↗</a></div></article>').join("");
 id("report").innerHTML='<div class="report-header"><span class="report-tag">02 / VORBEREITETE UNTERSTÜTZUNG</span><span class="report-status">✳ Entwurf</span></div>'+
 '<h3 class="report-heading">Ein guter nächster Schritt.</h3>'+
 '<p class="report-lead">Die Anfrage wurde <strong>regelbasiert</strong> eingeordnet. Hier sind drei öffentliche Ressourcen, begründete Hinweise und eine Frage für einen Menschen. Noch keine tatsächliche Netzwerkvermittlung.</p>'+
 '<div class="report-caps"><span class="cap">'+esc(scenario.sector)+'</span><span class="cap">'+esc(scenario.phase)+'</span><span class="cap unknown">Keine privaten Kontakte</span></div>'+
 '<div class="report-panel-title"><strong>Recherchierte öffentliche Ressourcen</strong><small>3 Originalquellen</small></div><div class="resources">'+cards+'</div>'+
 '<div class="review"><label for="review-note">03 / Menschliche Entscheidung vorbereiten</label>'+
 '<p class="need"><b>Offen:</b> '+esc(scenario.questions[0])+'<br>'+esc(scenario.questions[1])+'<br><b>Vorschlag:</b> '+esc(scenario.next)+'</p>'+
 '<textarea id="review-note" rows="3" maxlength="600" placeholder="Eigene Rückfrage oder Notiz ergänzen...">'+esc(a.note)+'</textarea>'+
 '<label class="check"><input type="checkbox" id="review-confirm"><span>Ich habe Quellen und Unsicherheiten persönlich geprüft. Dies bereitet nur ein lokales Briefing vor.</span></label>'+
 '<div class="actionrow"><button id="copy-btn" disabled>Briefing kopieren ↗</button><button class="outline" id="save-btn" disabled>Markdown speichern ↓</button></div><div role="status" class="result-toast" id="result-toast"></div></div>'+
 '<div class="feedback"><span>Ist die Empfehlung hilfreich?</span><button data-vote="yes" class="'+(votes[a.topic]==="yes"?"active":"")+'">Ja</button><button data-vote="no" class="'+(votes[a.topic]==="no"?"active":"")+'">Noch nicht</button></div>'+
 '<p class="report-footer">Unabhängiger Demo-Prototyp. Keine LLM-Abfrage, kein Live-RAG, kein Zugriff auf HTGF-Systeme. Der eingetippte Text wird nicht an einen Server gesendet.</p>';
 id("review-note").addEventListener("input",e=>a.note=e.target.value);
 id("review-confirm").addEventListener("change",e=>{id("copy-btn").disabled=!e.target.checked;id("save-btn").disabled=!e.target.checked});
 id("copy-btn").addEventListener("click",copy);
 id("save-btn").addEventListener("click",download);
 id("report").querySelectorAll("[data-vote]").forEach(b=>b.addEventListener("click",()=>{
  votes[a.topic]=b.dataset.vote;
  try{localStorage.setItem("bridge-demo-feedback",JSON.stringify(votes))}catch{}
  id("report").querySelectorAll("[data-vote]").forEach(c=>c.classList.toggle("active",c.dataset.vote===b.dataset.vote));
  id("result-toast").textContent="Danke! Diese Rückmeldung bleibt nur in deinem Browser.";
 }));
}
function briefing(){
 if(!answer)return "";
 const a=answer;let txt="# BRIDGE · Unterstützungsbriefing\n\nUnabhängiger Prototyp, kein HTGF-System.\n\n## Anliegen\n"+a.input+"\n\n## Einordnung\n"+a.scenario.sector+"\n\n## Öffentlich beschriebene Ressourcen\n";
 a.resources.forEach((r,i)=>txt+="\n"+(i+1)+". "+r.name+"\n   Quelle: "+r.url+"\n   Warum: "+r.reason+"\n   Einschränkung: "+r.caution+"\n");
 txt+="\n## Offene Fragen\n"+a.scenario.questions.map(x=>"- "+x).join("\n")+"\n\n## Nächster Schritt\n"+a.scenario.next+"\n\n## Review-Notiz\n"+(a.note||"(noch keine)")+"\n\nKeine automatische Vermittlung oder Kontaktaufnahme.";
 return txt;
}
async function copy(){
 try{if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error("unavailable");await navigator.clipboard.writeText(briefing());id("result-toast").textContent="Briefing kopiert ✓";}
 catch{id("result-toast").textContent="Kopieren hier nicht möglich. Nutze den Markdown-Download."}
}
function download(){
 const file=new Blob([briefing()],{type:"text/markdown;charset=utf-8"});
 const uri=URL.createObjectURL(file);const a=document.createElement("a");a.href=uri;a.download="bridge-support-briefing.md";document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(uri),1200);
 id("result-toast").textContent="Briefing lokal als Markdown erstellt.";
}
document.querySelectorAll(".scenario").forEach(btn=>btn.addEventListener("click",()=>choose(btn.dataset.case)));
id("match-btn").addEventListener("click",run);
id("reset-btn").addEventListener("click",()=>choose(choice));
id("founder-question").addEventListener("input",e=>{e.target.setCustomValidity("");id("wordcount").textContent=e.target.value.length+"/900"});
let firstCase="medtech";
try{const fromURL=new URLSearchParams(window.location.search).get("case");if(fromURL&&examples[fromURL])firstCase=fromURL;}catch{}
choose(firstCase);
window.BRIDGE_TEST={classify,scenarios:Object.keys(examples),resources:Object.keys(library),mode:"deterministic curated matching"};
})();