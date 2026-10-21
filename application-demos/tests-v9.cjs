#!/usr/bin/env node
"use strict";
/* FINAL v9 reproducible domain tests, run:
   node application-demos/tests-v9.cjs
   No dependencies, API keys, external requests, or production data. */
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
const context=vm.createContext({window:{}});
for(const file of ["bid-screening.js","return-triage.js","ml-triage.js","v9-core.js"]){
 vm.runInContext(fs.readFileSync(path.join(__dirname,file),"utf8"),context,{filename:file});
}
const C=context.window.ApplicationV9Core,B=context.window.BidScreening,T=context.window.ReturnTriage,M=context.window.SupportML;
const data=JSON.parse(fs.readFileSync(path.join(__dirname,"../bidpilot/notices.json"),"utf8"));
const date="2026-10-21"; // fixed to original dataset release date for reproducibility, NOT today's open status
const web={skills:["web"],focus:"web",reference:"no",insurance:"unknown",security:"unknown",query:"",exclusions:""};
const result=C.tenderDecision(web,data.notices,date);
assert.equal(result.dataCount,549,"complete dated source snapshot, do not pretend to cover all TED");
assert.ok(result.matched>=3,"matches from real data");
assert.ok(result.obstacle?.id==="714363-2026","documented reference barrier must appear");
assert.ok(result.obstacle.barriers.some(t=>t.includes("Referenz")),"visible reason for the barrier");
assert.ok(result.recommended,"at least one candidate without this specific known barrier");
assert.ok(result.shown.every(n=>n.url.startsWith("https://ted.europa.eu/en/notice/-/detail/")),"verifiable original source link");
assert.ok(result.shown.every(n=>n.deadline>=result.threshold),"do not show past or immediate deadlines");
const ai=C.tenderDecision({...web,skills:["web","ai"],focus:"ai",reference:"unknown"},data.notices,date);
assert.notEqual(result.recommended.id,ai.recommended.id,"team profile changes decision");
const none=C.tenderDecision({...web,skills:[],focus:""},data.notices,date);
assert.equal(none.matched,0,"no fake match when skills unknown");
const zero=C.tenderDecision({...web,skills:[],focus:"",query:"Zebraschutz Antarktis"},data.notices,date);
assert.equal(zero.matched,0,"honest empty query");

const simple=T.evaluate(),hard=T.challenge(),eva=M.evaluate();
assert.equal(M.trainingCount,136);
assert.equal(eva.model.total,29);
assert.equal(eva.model.correct,19);
assert.equal(eva.rules.correct,15);
assert.equal(simple.correct,42);
assert.equal(hard.total,24);
const unfamiliar="Leider läuft eine Masche an der Seite. Nach zwei Tagen kann ich die Socken kaum tragen.";
assert.equal(T.classify(unfamiliar).category,"unknown");
assert.equal(M.classify(unfamiliar).category,"material");
const inputs=C.exampleTickets();
assert.equal(inputs.length,20);
const summary=C.triage(inputs);
assert.equal(summary.total,20);
assert.equal(summary.countMaterial,7);
assert.equal(summary.disagreements,8);
assert.equal(summary.unlinked.length,2);
assert.equal(summary.top.materials.length,7);
assert.ok(summary.groups.every(g=>g.materials.every(x=>x.category==="material")),"only evidence-backed candidate groups");
const edited=C.triage(inputs,{"DEMO-001":"delivery"});
assert.equal(edited.countMaterial,6,"manual override changes KPI immediately");
assert.equal(edited.rows.find(x=>x.id==="DEMO-001").reviewed,true);
assert.equal(C.triage(inputs,{"DEMO-001":"mixed"}).countMaterial,6,"mixed-intent correction allowed");
const rerouted=C.triage(inputs,{},{"DEMO-019":"SOCKS"});
assert.equal(rerouted.unlinked.length,1,"manual product route changes group");
const csv='ticket_id,order_id,sku,message\n"A-01","ORD-1","SOCKS","Die Naht ist kaputt, aber das Produkt ist noch tragbar"\n';
const parsed=C.parseCsv(csv);
assert.equal(parsed.length,1);assert.ok(parsed[0].message.includes("kaputt, aber"));
assert.throws(()=>C.parseCsv('ticket_id,sku,message\nX,UNKNOWN,Defekt'),/Produktcode/);
assert.throws(()=>C.parseCsv('ticket_id,sku,message\nX,SOCKS,Eins\nX,SOCKS,Zwei'),/Doppelte Ticket/);
console.log(JSON.stringify({status:"PASS",bidpilot:{dataset:result.dataCount,matched:result.matched,sourceChecked:true,barrierShown:true,profileChangesResult:true},returnLoop:{sampleTickets:20,materialSignals:summary.countMaterial,disagreements:summary.disagreements,manualOverrides:true,csvParser:true,training:M.trainingCount,holdoutModel:eva.model.correct+"/"+eva.model.total,holdoutRules:eva.rules.correct+"/"+eva.rules.total,challengingRules:hard.correct+"/"+hard.total}},null,2));