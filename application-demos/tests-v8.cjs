#!/usr/bin/env node
"use strict";
/* Run at repository root: node application-demos/tests-v8.cjs
   Dependency-free regression for product decisions and supervised ML evidence. */
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
const folder=__dirname,context=vm.createContext({window:{}});
for(const f of ["bid-screening.js","return-triage.js","ml-triage.js"]){
 vm.runInContext(fs.readFileSync(path.join(folder,f),"utf8"),context,{filename:f});
}
const Bid=context.window.BidScreening,Rules=context.window.ReturnTriage,ML=context.window.SupportML;
const data=JSON.parse(fs.readFileSync(path.join(folder,"../bidpilot/notices.json"),"utf8"));
const base={skills:["web"],focus:"web",reference:"no",insurance:"unknown",security:"unknown",query:"",exclusions:""};
const web=Bid.screen(base,data.notices,"2026-10-21");
const known=web.shown.find(x=>x.id==="714363-2026");
assert.ok(web.dataCount>=500,"real dated source dataset");
assert.ok(web.matched>=3,"search based on profile");
assert.ok(known?.barriers.length,"present a documented self-declared obstacle");
assert.ok(web.shown.every(x=>x.url.startsWith("https://ted.europa.eu/en/notice/-/detail/")),"sources linked");
assert.ok(web.shown.every(x=>x.deadline>=web.threshold),"exclude too-near due dates");
const ai=Bid.screen({...base,skills:["web","ai"],focus:"ai",reference:"unknown"},data.notices,"2026-10-21");
assert.ok(ai.shown[0].shortTitle!==web.shown[0].shortTitle,"profile-dependent first recommendation");
assert.equal(Bid.screen({...base,skills:[],query:"Zebraschutz in der Antarktis"},data.notices,"2026-10-21").matched,0);
const evalML=ML.evaluate(),curated=Rules.evaluate();
assert.equal(ML.trainingCount,136,"train-only synthetic samples");
assert.equal(evalML.model.total,29,"separate new synthetic holdout");
assert.equal(evalML.rules.total,29);
assert.ok(evalML.model.correct>evalML.rules.correct,"measured improvement on this holdout");
assert.equal(curated.total,42);
const phrase="Leider läuft eine Masche an der Seite. Nach zwei Tagen kann ich die Socken kaum tragen.";
assert.equal(Rules.classify(phrase).category,"unknown");
assert.equal(ML.classify(phrase).category,"material");
const before=Rules.analyze([{id:"1",sku:"SOCKS",message:"Socken haben Löcher"},{id:"2",sku:"SOCKS",message:"Naht aufgerissen"},{id:"3",sku:"SOCKS",message:"Ferse kaputt"},{id:"4",sku:"SOCKS",message:"Stoff gerissen"}],{});
const after=Rules.analyze([{id:"1",sku:"SOCKS",message:"Socken haben Löcher"},{id:"2",sku:"SOCKS",message:"Naht aufgerissen"},{id:"3",sku:"SOCKS",message:"Ferse kaputt"},{id:"4",sku:"SOCKS",message:"Stoff gerissen"}],{"1":"delivery"});
assert.equal(before.urgent?.material.length,4);
assert.equal(after.urgent,null,"manual corrections change aggregate signals");
console.log(JSON.stringify({result:"PASS",bidpilot:{inputCount:web.dataCount,matchedWeb:web.matched,matchedAI:ai.matched,knownObstacle:true},returnLoop:{trained:ML.trainingCount,syntheticHoldout:evalML.model.total,modelCorrect:evalML.model.correct,ruleCorrect:evalML.rules.correct,holdoutErrors:evalML.model.errors,manualOverrideWorks:true}},null,2));