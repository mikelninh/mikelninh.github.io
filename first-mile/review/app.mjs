import {analyze} from "../core.mjs";
const $=id=>document.getElementById(id);
const [report,fixture,gold]=await Promise.all([
 fetch("./benchmark-public.json").then(r=>{if(!r.ok)throw Error("Benchmark snapshot unavailable");return r.json()}),
 fetch("../lab/fixtures.json").then(r=>{if(!r.ok)throw Error("Fixture unavailable");return r.json()}),
 fetch("../lab/gold.json").then(r=>{if(!r.ok)throw Error("Labels unavailable");return r.json()})
]);
const models=$("models");models.replaceChildren();
for(const m of report.experiment.finalists){
 const card=document.createElement("article");card.className="model-card"+(m.key==="luna-none"?" recommended":"");
 const top=document.createElement("div");top.className="topline";top.textContent=m.key==="luna-none"?"PROVISIONAL BASELINE":"MEASURED FINALIST";
 const name=document.createElement("h3");name.textContent=m.name;
 const score=document.createElement("div");score.className="score";score.textContent=m.correct+"/"+m.total;
 const meta=document.createElement("div");meta.className="meta";
 for(const value of ["$"+m.cost_usd.toFixed(5)+" / six cases",(m.latency_ms/1000).toFixed(1)+" s","Rejected quotes: "+m.rejected_quotes]){
  const span=document.createElement("span");span.textContent=value;meta.append(span);
 }
 card.append(top,name,score,meta);models.append(card);
}
const explanations={
 "forecast-split":{tag:"CONTEXT LOSS",title:"The forecast header wasn't on the same line.",desc:"The original deterministic rule only looked for forecast keywords on the ARR line. The heading above was ignored, so projected revenue looked like current revenue.",hypothesis:"Carry an explicit '2028 TARGET' header only into the immediately following ARR line; never into a later funding claim or another page.",
 facts:[["Before patch","ARR: found"],["Expected","ARR: forecast"],["Candidate rule","ARR: forecast"]]},
 riverbend:{tag:"RECALL GAP",title:"The wording doesn't match our rules.",desc:"Riverbend describes the founding team, enzymes and capital needs without the exact keywords the simple regex expects. Luna and Sol also missed technology/team labels after quote verification.",hypothesis:"Inspect raw model extracts versus verifier rejections and rewrite the field definitions. Do not loosen citation checks just to improve scores.",
 facts:[["Rule engine","3 / 8 labels"],["Luna None","6 / 8 labels"],["Remaining","Technology and team"]]},
 asterion:{tag:"RECONCILIATION",title:"Different numbers are not proof of wrongdoing.",desc:"The original deck and later update contain different figures for customers, ARR and funding. FIRST MILE surfaces both passages but cannot decide which is accurate.",hypothesis:"Require explicit document dates and definitions before drawing a conclusion; keep every proposed founder question human-editable.",
 facts:[["Customers","12 vs 18"],["ARR","€240k vs €180k"],["Funding","€2.4m vs €3.1m"]]}
};
let selected="forecast-split";
function showCase(id){
 selected=id;const detail=explanations[id];$("caseTag").textContent=detail.tag;$("caseTitle").textContent=detail.title;$("caseContext").textContent=detail.desc;$("caseHypothesis").textContent=detail.hypothesis;
 const current=fixture.cases.find(c=>c.id===id),doc=current.docs.at(-1),page=doc.pages.at(-1);
 $("docName").textContent=doc.name+" · P."+page.number;
 $("sourceText").textContent=page.text;
 const box=document.createElement("div");box.className="facts";
 for(const [a,b] of detail.facts){const row=document.createElement("div"),title=document.createElement("b"),value=document.createElement("span");title.textContent=a;value.textContent=b;row.append(title,value);box.append(row);}
 $("caseFacts").replaceChildren(box);
 document.querySelectorAll("[data-case]").forEach(btn=>{const active=btn.dataset.case===id;btn.classList.toggle("active",active);btn.setAttribute("aria-pressed",String(active));});
}
document.querySelectorAll("[data-case]").forEach(btn=>btn.addEventListener("click",()=>showCase(btn.dataset.case)));
showCase(selected);
const gateTitles=[
 ["matchingLabels","Recompute all 48 expected statuses"],
 ["target","Forecast header is handled as forecast"],
 ["funding","Forecast context doesn't contaminate funding"],
 ["reset","Context resets at each new document/page"],
 ["stable","Three Asterion differences still surface"]
];
const checks=$("checks");
for(const [,title] of gateTitles){const row=document.createElement("div");row.className="check-item";const a=document.createElement("b"),b=document.createElement("strong");a.textContent=title;b.textContent="NOT RUN";row.append(a,b);checks.append(row);}
function evaluate(){
 let correct=0;
 for(const c of fixture.cases){
   const result=analyze(c.docs);
   const predicted=Object.fromEntries(result.fields.map(f=>[f.key,f.status]));
   const expected=gold.labels[c.id];
   for(const k of Object.keys(expected))if(predicted[k]===expected[k])correct++;
 }
 const target=analyze(fixture.cases.find(c=>c.id==="forecast-split").docs).fields.find(f=>f.key==="arr").status==="forecast";
 const stable=analyze(fixture.cases.find(c=>c.id==="asterion").docs).differences.length===3;
 const custom=[{name:"scope",pages:[{number:1,text:"2028 TARGET\nARR: €2m\nFunding ask: raising €1m"}]}];
 const r=analyze(custom);const funding=r.fields.find(f=>f.key==="ask").status==="found";
 const separate=analyze([{name:"one",pages:[{number:1,text:"2028 TARGET"}, {number:2,text:"ARR: €2m"}]}]).fields.find(f=>f.key==="arr").status==="found";
 return [{ok:correct>=report.experiment.historical_rules_v2.correct,detail:correct+"/48",key:"matchingLabels"},
 {ok:target,detail:target?"PASS":"FAIL",key:"target"},
 {ok:funding,detail:funding?"PASS":"FAIL",key:"funding"},
 {ok:separate,detail:separate?"PASS":"FAIL",key:"reset"},
 {ok:stable,detail:stable?"PASS":"FAIL",key:"stable"}];
}
$("runChecks").addEventListener("click",()=>{
 const outcome=evaluate();
 $("candidateScore").textContent=outcome[0].detail;
 checks.querySelectorAll(".check-item").forEach((row,i)=>{
   const flag=row.querySelector("strong");flag.textContent=outcome[i].detail;
   flag.style.color=outcome[i].ok?"#3c8051":"#b25b43";
 });
 const all=outcome.every(x=>x.ok);
 $("gateStatus").textContent=(all?"5/5 development checks passed. ":"Development gate failed. ")+"Production release remains blocked until independent validation.";
});
