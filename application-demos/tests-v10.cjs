#!/usr/bin/env node
"use strict";
/* npm-free regression suite, run: node application-demos/tests-v10.cjs */
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
const c=vm.createContext({window:{}});
for(const name of ["bid-screening.js","return-triage.js","ml-triage.js","v9-core.js"]){
 vm.runInContext(fs.readFileSync(path.join(__dirname,name),"utf8"),c,{filename:name});
}
const C=c.window.ApplicationV9Core,R=c.window.ReturnTriage,M=c.window.SupportML;
const data=JSON.parse(fs.readFileSync(path.join(__dirname,"../bidpilot/notices.json"),"utf8"));
const web={skills:["web"],focus:"web",reference:"no",insurance:"unknown",security:"unknown"};
const today="2026-10-21",first=C.tenderDecision(web,data.notices,today);
const second=C.tenderDecision({...web,skills:["web","ai"],focus:"ai",reference:"unknown"},data.notices,today);
assert.equal(first.dataCount,549);
assert.ok(first.recommended);
assert.ok(first.obstacle&&first.obstacle.barriers.some(x=>x.includes("Referenz")));
assert.notEqual(first.recommended.id,second.recommended.id);
assert.ok(first.shown.every(x=>x.url.startsWith("https://ted.europa.eu/")));
assert.equal(C.tenderDecision({...web,skills:[],focus:""},data.notices,today).matched,0);
assert.equal(C.tenderDecision({...web,skills:[],query:"Antarktis Zebraschutz"},data.notices,today).matched,0);

const evaluation=M.evaluate();
assert.equal(M.trainingCount,136);
assert.equal(evaluation.model.total,29);
assert.equal(evaluation.model.correct,19);
assert.equal(evaluation.rules.correct,15);
const expectedSizes=evaluation.model.rows.filter(x=>x.expected==="size");
assert.equal(expectedSizes.filter(x=>x.got==="size").length,2);
const sample=C.exampleTickets(),before=C.triage(sample);
assert.equal(sample.length,20);
assert.equal(before.countMaterial,7);
assert.equal(before.disagreements,8);
assert.equal(before.unlinked.length,2);
const after=C.triage(sample,{"DEMO-001":"delivery"});
assert.equal(after.countMaterial,6);
assert.equal(after.rows.find(x=>x.id==="DEMO-001").category,"delivery");
assert.equal(C.triage(sample,{},{"DEMO-019":"SOCKS"}).unlinked.length,1);
assert.equal(C.parseCsv('ticket_id,sku,message\nA,SOCKS,"Defekt, aber nutzbar"\n')[0].message,"Defekt, aber nutzbar");
assert.throws(()=>C.parseCsv("ticket_id,sku,message\nA,OTHER,Defekt"),/Produktcode/);
console.log(JSON.stringify({status:"PASS",bidpilot:{sourceRecords:first.dataCount,profileChangesRank:true,knownBarrierPresent:true},returnLoop:{processed:before.total,materialIndications:before.countMaterial,disagreements:before.disagreements,manualCorrectionWorks:true,trainedModelHistorical:evaluation.model.correct+"/"+evaluation.model.total,ruleBaselineHistorical:evaluation.rules.correct+"/"+evaluation.rules.total,sizeClassificationCorrect:"2/5"}},null,2));