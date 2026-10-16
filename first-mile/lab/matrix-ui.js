/* Local-only GPT-6 matrix viewer. Never requests an API key. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
if(!$("matrixRows"))return;
const prices={"gpt-6-luna":[.1,.5],"gpt-6.1-sol":[2,10],"gpt-6-astra":[10,50]};
const profiles=[
["luna-none","Luna","none","gpt-6-luna"],["luna-low","Luna","low","gpt-6-luna"],
["luna-medium","Luna","medium","gpt-6-luna"],["luna-high","Luna","high","gpt-6-luna"],
["sol-low","Sol","low","gpt-6.1-sol"],["sol-medium","Sol","medium","gpt-6.1-sol"],
["sol-high","Sol","high","gpt-6.1-sol"],["astra-low","Astra","low","gpt-6-astra"],
["astra-high","Astra","high","gpt-6-astra"]];
let report=null;
const money=n=>typeof n==="number"&&Number.isFinite(n)?"$"+n.toFixed(n<.01?4:3):"—";
function display(){
const body=$("matrixRows");body.replaceChildren();
for(const [id,title,effort,model] of profiles){
const row=document.createElement("tr");const entry=report?.profiles?.find(p=>p.id===id);
const [inP,outP]=prices[model];const assumed=(3000*inP+800*outP)/1000000;
const statuses=[title,effort,money(assumed),
  entry?.pilot_complete?entry.quality.correct+"/48*":(entry?.cases?.length?entry.cases.filter(c=>c.status==="measured").length+"/3 completed":"Not run"),
  entry?.complete_six?entry.quality.correct+"/48":"Not run",
  money(entry?.quality?.cost_usd)];
// If only pilot, quality.correct is measured over 24 fields, not 48.
if(entry?.pilot_complete&&!entry?.complete_six)statuses[3]=entry.cases.filter(c=>c.status==="measured").reduce((n,c)=>n+c.correct,0)+"/24";
if(entry?.complete_six)statuses[3]=entry.cases.filter(c=>["asterion","riverbend","forecast-split"].includes(c.case_id)).reduce((n,c)=>n+c.correct,0)+"/24";
for(let i=0;i<statuses.length;i++){const td=document.createElement("td");td.textContent=statuses[i];if(i>2&&statuses[i]==="Not run")td.className="not-run";row.append(td)}
body.append(row);
}
if(!report||report.mode!=="live_paid_api"){
$("matrixConclusion").replaceChildren();const h=document.createElement("strong");h.textContent="Conclusion: not yet measured.";const p=document.createElement("p");p.textContent="OpenAI models cannot be ranked without actual API responses on identical test cases. Import the completed local benchmark after running it."; $("matrixConclusion").append(h,p);return;
}
const conclusion=report.recommendation||{},holder=$("matrixConclusion");holder.replaceChildren();
const h=document.createElement("strong"),p=document.createElement("p");
h.textContent=conclusion.status==="provisional_synthetic_only"?"Provisional candidate: "+conclusion.chosen_profile:"No comparable winner yet";
p.textContent=conclusion.status==="provisional_synthetic_only"?
"Based on "+conclusion.gold_matches+"/"+conclusion.of_fields+" correct synthetic statuses. This is not a production recommendation; review source grounding, failures and real-data validation.":
"Budget, API errors or incomplete results prevent a fair conclusion. Compare completed cases or rerun with a controlled budget.";
holder.append(h,p);
}
$("matrixFile").addEventListener("change",async e=>{
try{
const file=e.target.files?.[0];if(!file)return;
if(file.size>2e6)throw Error("File exceeds 2 MB limit.");
const data=JSON.parse(await file.text());
if(data.schema!=="first-mile-reasoning-matrix/v1"||!Array.isArray(data.profiles)||data.profiles.length!==9)throw Error("Incorrect matrix report schema.");
if(data.profiles.some(p=>!profiles.some(row=>row[0]===p.id)||!Array.isArray(p.cases)||p.cases.length>6))throw Error("Invalid profiles or results.");
if(data.mode!=="dry_run_no_api"&&data.mode!=="live_paid_api")throw Error("Unrecognised run mode.");
report=data;display();
$("matrixStatus").textContent=data.mode==="dry_run_no_api"?
"Dry run imported: no model was called and no results can be claimed.":
"Measured run imported. Budget-accounted usage: "+money(data.budget?.accounted_usd)+". Complete finalists: "+data.profiles.filter(p=>p.complete_six).length+".";
}catch(err){$("matrixStatus").textContent="Import rejected: "+err.message}
});
display();
})();
