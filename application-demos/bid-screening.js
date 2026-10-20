/* BIDPILOT — transparent shortlist from real dated TED data.
 * Search only the specific project subject, not generic TED procurement taxonomy.
 * CPV is corroboration only, never sufficient for a recommendation.
 * No legal eligibility prediction, no fabricated requirement. */
(function(root){
"use strict";
const LABELS={web:"Webseiten & Portale",ai:"KI-Anwendungen",cloud:"Server / IT-Betrieb"};
const SIGNALS={
 web:[/\bkundenportal\b/g,/\bweb(?:basiert\w*|site|seite|portal|anwendung|app|plattform|entwicklung|design)\w*\b/g,/\binternetauftritt\b/g,/\b(?:frontend|onlineportal|website|webdesign|anwendungsentwicklung|mobile\s+app)\b/g,/\bsoftwareentwicklung\b/g],
 ai:[/\bki[- ](?:assistent\w*|basierte?\w*|gestuetzte?\w*|anwendung\w*|loesung\w*)\b/g,/\b(?:kuenstliche intelligenz|artificial intelligence|machine learning|llm|chatbot|sprachmodell|datenanalyse|data science|deep learning|computer vision)\b/g],
 cloud:[/\b(?:openstack|kubernetes|cloud|rechenzentrum|serverbetrieb|systembetreuung|containerplattform|it-infrastruktur|infrastrukturbetrieb|netzwerkbetrieb|managed services|monitoring|devops|hosting|virtualisierung|serverinfrastruktur)\b/g]
};
function normalize(s){return String(s||"").normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g,"").replace(/ß/g,"ss");}
function subject(title){const parts=String(title||"").split(/\s+[–—]\s+/);return parts.length>=3?parts.slice(2).join(" – ").trim():parts.length===2?parts[1].trim():parts[0].trim();}
function keywords(raw){return String(raw||"").split(/[,;\n]/).map(x=>normalize(x).trim()).filter(x=>x.length>=3).slice(0,8)}
function match(subjectText,category){
 const text=normalize(subjectText),matches=[];
 for(const regex of SIGNALS[category]||[]){regex.lastIndex=0;for(const m of text.matchAll(regex)){matches.push(m[0]);if(matches.length>=6)break}}
 return [...new Set(matches)].slice(0,5);
}
function classifyNotice(n,skills,focus,terms=[]){
 const rawSubject=subject(n.title);
 let ranked=[];
 for(const skill of skills){const signals=match(rawSubject,skill);
 if(signals.length)ranked.push({skill,hits:signals,score:4+Math.min(signals.length,3)*2+(skill===focus?3:0)})}
 const queryTerms=terms.filter(k=>normalize(rawSubject).includes(k));
 if(!ranked.length && !queryTerms.length)return null;
 if(!ranked.length && queryTerms.length)ranked.push({skill:"custom",hits:queryTerms,score:3+queryTerms.length});
 ranked.sort((a,b)=>b.score-a.score);
 return{best:ranked[0],score:ranked[0].score+queryTerms.length*2,termHits:queryTerms,subject:rawSubject};
}
function screen(profile,data,nowDate){
 const today=/^\d{4}-\d{2}-\d{2}$/.test(nowDate)?nowDate:new Date().toISOString().slice(0,10);
 const threshold=new Date(Date.parse(today+"T00:00:00Z")+3*86400000).toISOString().slice(0,10);
 const skills=(Array.isArray(profile.skills)?profile.skills:[]).filter(x=>LABELS[x]);
 const exclusions=keywords(profile.exclusions||"");
 const queries=keywords(profile.query||"");
 const notices=Array.isArray(data)?data:[];
 let available=0,eligible=0,excludedScope=0;
 const candidate=[];
 const seen=new Set(),dedup=new Set();
 for(const n of notices){
 if(!n||n.stage!=="competition"||!/^\d{4}-\d{2}-\d{2}$/.test(n.deadline||"")||n.deadline<threshold)continue;
 if(!/^https:\/\/ted\.europa\.eu\/en\/notice\/-\/detail\/\d+-\d{4}$/.test(n.url||""))continue;
 if(!n.id||!n.title||!n.buyer||seen.has(n.id))continue;seen.add(n.id);
 available++;
 const subj=subject(n.title),lower=normalize(subj);
 const duplicateKey=normalize(n.buyer)+'|'+lower.replace(/\s+/g,' ').slice(0,180);
 if(dedup.has(duplicateKey))continue;dedup.add(duplicateKey);
 // An AI-related title can still be a hardware lot; a cloud title can still be a license sale.
 if(/\b(?:hardware|kioske|monitore|lizenz\w*|licen[sc]e\w*|subscription\w*|lieferung\s+von)\b/.test(lower)) {excludedScope++;continue;}
 if(exclusions.some(k=>lower.includes(k)))continue;
 const hit=classifyNotice(n,skills,profile.focus,queries);
 if(!hit)continue;
 eligible++;
 const known=n.id==="714363-2026";
 const barriers=[],unknowns=[];
 if(known){
 if(profile.reference==="no")barriers.push("Vergleichbarer Referenzauftrag laut Teamprofil nicht vorhanden");
 else if(profile.reference!=="yes")unknowns.push("Vergleichbarer Referenzauftrag noch nicht nachgewiesen");
 if(profile.insurance==="no")barriers.push("Passende Versicherung laut Selbstauskunft nicht vorhanden");
 else if(profile.insurance!=="yes")unknowns.push("Versicherung noch prüfen");
 if(profile.security==="no")barriers.push("IT-Sicherheitsnachweis laut Selbstauskunft nicht vorhanden");
 else if(profile.security!=="yes")unknowns.push("Sicherheitsnachweis noch prüfen");
 unknowns.push("Weitere Anforderungen in Originalunterlagen prüfen");
 }else unknowns.push("Teilnahmebedingungen noch nicht aus den Originalunterlagen geprüft");
 const status=barriers.length?"Hürde zuerst klären":"Interessant – Anforderungen prüfen";
 // A known self-declared barrier must never be masked by a relevance ranking.
 const rank=hit.score-(barriers.length?10:0);
 candidate.push({...n,shortTitle:hit.subject,hit:hit.best.hits,matchedCategory:hit.best.skill,score:hit.score,rank,known,barriers,unknowns,status,source:"Datensatz der öffentlichen Bekanntmachungen",next:barriers.length?"Erst fehlende Nachweise klären – keine voreilige Bewerbung.":"Original-Ausschreibung und Teilnahmebedingungen prüfen, bevor Zeit in ein Angebot fließt."});
 }
 candidate.sort((a,b)=>b.rank-a.rank||a.deadline.localeCompare(b.deadline)||a.id.localeCompare(b.id));
 return{dataCount:notices.length,available,matched:eligible,excludedScope,shown:candidate.slice(0,5),all:candidate,threshold,asOf:today};
}
root.BidScreening={screen,subject,match,keywords,LABELS};
})(window);