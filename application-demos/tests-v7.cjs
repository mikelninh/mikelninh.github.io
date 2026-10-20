#!/usr/bin/env node
/* Reproducible, no-dependency evaluation for BIDPILOT and RETURN LOOP.
 * Run from the repository root: node application-demos/tests-v7.cjs */
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path");
const base=__dirname,root={window:{}},context=vm.createContext(root);
for(const file of ["bid-screening.js","return-triage.js"]){
 vm.runInContext(fs.readFileSync(path.join(base,file),"utf8"),context,{filename:file});
}
const Bid=root.window.BidScreening,Support=root.window.ReturnTriage;
const data=JSON.parse(fs.readFileSync(path.join(base,"../bidpilot/notices.json"),"utf8"));
const initialDate="2026-10-20"; // Snapshot date; reproducible regardless of current date
function testBid(){
 const profile={skills:["web"],focus:"web",reference:"no",insurance:"unknown",security:"unknown",query:"",exclusions:""};
 const web=Bid.screen(profile,data.notices,initialDate);
 assert.ok(web.dataCount>=500,"full source import");
 assert.ok(web.matched>=2,"actual matched projects");
 assert.ok(web.shown.length<=5,"bounded first result");
 for(const n of web.shown){
   assert.match(n.url,/^https:\/\/ted\.europa\.eu\/en\/notice\/-\/detail\//);
   assert.ok(n.hit.length,"explain why result appeared");
   assert.ok(n.deadline>=web.threshold,"avoid expired deadlines");
 }
 const known=web.all.find(x=>x.id==="714363-2026");
 assert.ok(known,"documented project discoverable");
 assert.ok(known.barriers.some(x=>x.includes("Referenz")),"declared missing reference surfaced");
 const ai=Bid.screen({...profile,skills:["ai"],focus:"ai",reference:"unknown"},data.notices,initialDate);
 assert.ok(ai.matched>=2);
 assert.ok(ai.shown[0].shortTitle.toLowerCase().includes("ki-"),"AI team sees AI opportunity first");
 assert.ok(ai.all.every(x=>!/\b(hardware|lizenz|license|subscription)\b/i.test(x.shortTitle)),"avoid license/hardware lots");
 const custom=Bid.screen({...profile,skills:[],query:"Zebraschutz-Antarktis"},data.notices,initialDate);
 assert.equal(custom.matched,0,"honest zero-result search");
 const none=Bid.screen({...profile,skills:[]},data.notices,initialDate);
 assert.equal(none.matched,0,"no skills, no implicit matching");
 const sourceOnly=Bid.subject("Germany – IT services: consulting, software development, Internet and support – Serverhardware ersetzen");
 assert.equal(sourceOnly,"Serverhardware ersetzen","exclude generic TED category from matching");
 return {available:web.available,webMatches:web.matched,aiMatches:ai.matched,knownBarriers:known.barriers.length};
}
function testSupport(){
 const simple=Support.evaluate(),hard=Support.challenge();
 assert.equal(simple.total,42);
 assert.equal(simple.correct,42,"curated regression");
 assert.equal(hard.total,24);
 assert.ok(hard.correct>=20,"challenging synthetic cases; failures must be printed");
 const messages=[
 {id:"a",sku:"SOCKS",message:"Die Naht löst sich nach zwei Wäschen auf"},
 {id:"b",sku:"SOCKS",message:"Meine Socken haben ein Loch"},
 {id:"c",sku:"SOCKS",message:"Der Stoff ist gerissen"},
 {id:"d",sku:"SOCKS",message:"Die Ferse löst sich auf"},
 {id:"e",sku:"SOCKS",message:"Mein Paket ist noch nicht da"},
 {id:"f",sku:"HOODIE",message:"Welche Größe brauche ich?"},
 {id:"g",sku:"",message:"Wo ist mein Paket?"}
 ];
 const before=Support.analyze(messages,{});
 assert.equal(before.urgent.material.length,4,"repeated material signals");
 assert.equal(before.unknown,1,"unassigned product visible");
 const after=Support.analyze(messages,{b:"delivery"});
 assert.equal(after.urgent,null,"manual correction may remove quality alert");
 assert.ok(after.tickets.find(x=>x.id==="b").overridden);
 assert.equal(Support.classify("Socken sind nicht kaputt").category,"unknown","don't turn negations into defects");
 assert.equal(Support.classify("Paket fehlt und Naht gerissen").category,"mixed","ambiguous multi-intent not auto-approved");
 return {regression:simple.correct+"/"+simple.total,challenge:hard.correct+"/"+hard.total,hardErrors:hard.errors.map(x=>({message:x.message,expected:x.expected,received:x.category})),auditOverride:true};
}
const report={result:"PASS",bid:testBid(),returnLoop:testSupport()};
console.log(JSON.stringify(report,null,2));