#!/usr/bin/env node
// The Way registry and frontend contract checks: no external packages.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('.',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,root),'utf8');
const ctx={window:{}};vm.runInNewContext(read('conflicts.js'),ctx,{filename:'conflicts.js'});
const {WAY_META:meta,WAY_CONFLICTS:rows,WAY_SOURCES:sources}=ctx.window;
assert.ok(meta && /^\d{4}-\d{2}-\d{2}$/.test(meta.reviewed));
assert.ok(Array.isArray(rows) && rows.length>=45,'At least 45 broad geographic theatres required');
const set=new Set(),types={fighting:0,violence:0,risk:0};
const missing=[];
for(const x of rows){
 assert.ok(/^[a-z0-9-]+$/.test(x.id),'Stable slug');
 assert.ok(!set.has(x.id),'Duplicate '+x.id);set.add(x.id);
 assert.ok(Object.hasOwn(types,x.kind),'Known category '+x.kind);types[x.kind]++;
 assert.ok(Number.isFinite(x.lat)&&Math.abs(x.lat)<=90,'Latitude '+x.id);
 assert.ok(Number.isFinite(x.lng)&&Math.abs(x.lng)<=180,'Longitude '+x.id);
 assert.ok(x.locationPrecision==='theatre-level anchor');
 assert.ok(x.reviewed===meta.reviewed);
 for(const k of ['title','region','location','actors','drivers','human','barrier','path','measure']){
  assert.ok(typeof x[k]==='string'&&x[k].trim().length>=(['title','region','location'].includes(k)?3:20),k+' missing on '+x.id)
 }
 assert.ok(Array.isArray(x.sources)&&x.sources.length>=1,'Citation required for '+x.id);
 for(const k of x.sources){assert.ok(sources[k],x.id+' references unknown '+k)}
}
for(const s of Object.values(sources)){assert.ok(new URL(s.url).protocol==='https:','Sources must use HTTPS')}
assert.ok(types.fighting&&types.violence&&types.risk,'Classification must not conflate conflict with tensions');
const html=read('index.html'),css=read('style.css'),js=read('app.js');
for(const id of ['map','conflict-list','dossier','search','type-filters','region','news-list','map-fallback','atlas-last-reviewed','download-json']){
 assert.ok(html.includes('id="'+id+'"'),'Missing DOM anchor '+id)
}
assert.ok(js.includes('openstreetmap.org/copyright'),'OSM attribution exists');
assert.ok(js.includes('tile.openstreetmap.org'),'Real geographic tile service');
assert.ok(js.includes('NOT geolocated incidents')===false,'A headline must never be described as a geolocated incident');
assert.ok(!/location\.geolocation|navigator\.geolocation|localStorage|document\.cookie/i.test(js),'No user geo or persistent tracking');
assert.ok(css.includes('@media(max-width:520px)'),'Mobile breakpoint');
assert.ok(css.includes('prefers-reduced-motion'),'Accessible reduced-motion styles');
new vm.Script(js,{filename:'app.js'});

const ctx2={window:{}};vm.runInNewContext(read('processes.js'),ctx2,{filename:'processes.js'});
const processRows=ctx2.window.WAY_PROCESSES;
const processMeta=ctx2.window.WAY_PROCESS_META;
assert.ok(Array.isArray(processRows)&&processRows.length>=6,'Six researched processes required');
assert.equal(processMeta.reviewed,meta.reviewed,'Research and map review dates must match');
const processIds=new Set();
for(const r of processRows){
 assert.ok(!processIds.has(r.id),'Duplicate process '+r.id);processIds.add(r.id);
 assert.ok(r.anchorIds.length>0&&r.anchorIds.every(id=>set.has(id)),'Process without atlas geography: '+r.id);
 assert.ok(r.agreement&&/^https:\/\//.test(r.agreement.url),'Missing document '+r.id);
 assert.ok(r.agreement.date<=processMeta.reviewed,'Future agreement '+r.id);
 assert.ok(r.commitments.length>=3,'At least three research commitments '+r.id);
 assert.ok(r.milestones.length>=2,'Timeline evidence missing '+r.id);
 for(const m of r.milestones){assert.ok(r.sources[m.source],'Missing timeline source '+r.id+':'+m.source);assert.ok(m.date<=processMeta.reviewed,'Future milestone '+m.id)}
 for(const c of r.commitments){
  assert.ok(c.title&&c.test&&c.finding,'Unclear commitment '+c.id);
  assert.ok(c.evidence.length>0&&c.evidence.every(k=>r.sources[k]),'Unlinked commitment '+c.id);
 }
 for(const source of Object.values(r.sources)){
  assert.ok(/^https:\/\//.test(source.url),'HTTPS evidence sources required');
  assert.ok(source.date<=processMeta.reviewed,'Evidence from the future');
  assert.ok(source.role&&source.kind&&source.org,'Evidence provenance required');
 }
}
const progressHtml=read('progress.html');
for(const id of ['process-list','story-content','source-list','share-process','export-process','count-commitments'])assert.ok(progressHtml.includes('id="'+id+'"'),'Missing progress UI '+id);
assert.ok(html.includes('src="./processes.js'),'Atlas should load process links');
assert.ok(html.includes('href="./progress.html"'),'The atlas needs a visible path to the ledger');
assert.ok(js.includes('linkedProcess(c)'),'Atlas dossier bridge missing');
new vm.Script(read('process-app.js'),{filename:'process-app.js'});
assert.ok(read('process.css').includes('prefers-reduced-motion'),'Reduced motion needed in Peace Ledger');

// THE WAY 1.0: all five product sections and two archive routes share one shell.
const deskHtml=read('review.html'),design=read('way-one.css'),pulseHtml=read('pulse.html'),storyHtml=read('stories.html');
const pages=[read('time.html'),read('explore.html'),storyHtml,progressHtml,deskHtml,html,pulseHtml];
const navs=pages.map((p,i)=>{
 assert.ok(p.includes('href="./way-one.css?v=1.0"'));
 const header=p.match(/<header class="way-global">[\s\S]*?<\/header>/)?.[0];
 assert.ok(header,'Common shell missing');
 assert.equal((header.match(/aria-current="page"/g)||[]).length,i<5?1:0);
 return header.match(/<nav class="way-nav"[\s\S]*?<\/nav>/)[0].replace(' aria-current="page"','');
});
assert.ok(navs.every(x=>x===navs[0]),'Shared navigation must match');
assert.ok(design.includes('--way-primary:#2449d8')&&design.includes('--way-paper:#f5f2eb'));
for(const p of pages)assert.ok(p.includes('class="way-global-footer"'));
assert.ok(!html.includes('<section class="intro">'));
assert.ok(!progressHtml.includes('<section class="hero"'));
new vm.Script(deskHtml.match(/<script>([\s\S]*?)<\/script>/)[1],{filename:'review-inline.js'});


const evidence=JSON.parse(read('evidence-colombia.json'));
assert.equal(evidence.mode,'live');
assert.equal(evidence.results.length,6);
assert.ok(evidence.method.includes('One-off'));
for(const row of evidence.results){assert.ok(row.proof.ok&&row.extraction.quote.split(/\s+/).length<=25);assert.ok(row.source.url.startsWith('https://'));assert.ok(row.source.processIds.includes('colombia'));assert.ok(row.extraction.uncertainty&&row.critique.reason);}
assert.ok(deskHtml.includes("evidence-colombia.json")&&deskHtml.includes('unverified_headline_lead'));
assert.ok(pulseHtml.includes('href="./review.html?batch=colombia"')&&pulseHtml.includes('id="share-page"'));
new vm.Script(pulseHtml.match(/<script>([\s\S]*?)<\/script>/)[1],{filename:'pulse-inline.js'});

new vm.Script(storyHtml.match(/<script>([\s\S]*?)<\/script>/)[1],{filename:'stories-inline.js'});
assert.ok(storyHtml.includes('id="observation-value"')&&storyHtml.includes('id="export-data"'));
const timeData=JSON.parse(read('time-data.json'));assert.equal(timeData.values.length,80);assert.equal(timeData.values[79],65);
const wb=JSON.parse(read('wellbeing.json'));assert.equal(wb.indicators.length,3);assert.equal(wb.indicators.reduce((n,r)=>n+r.values.length,0),127);const library=JSON.parse(read('peace-library.json'));assert.equal(library.studies.length,5);for(const study of library.studies)assert.ok(study.finding&&study.limit&&study.url);const local=JSON.parse(read('local-ai-report.json'));assert.equal(local.modelCalls,4);assert.equal(local.publicationApproved,false);assert.equal(local.audit.cases.length,2);new vm.Script(read('human-history.js'));new vm.Script(read('peace-library.js'));
const science=JSON.parse(read('country-science.json'));assert.equal(Object.keys(science.countries).length,6);assert.equal(science.indicators.length,5);assert.equal(science.indicators.reduce((n,r)=>n+Object.values(r.values).flat().length,0),921);const bench=JSON.parse(read('benchmark-report.json'));assert.equal(bench.modelCalls,12);assert.equal(bench.publicationApproved,false);assert.equal(bench.raw.correct,bench.results.filter(r=>r.rawDecision===r.expected).length);assert.equal(JSON.parse(read('action-directory.json')).entries.length,3);new vm.Script(read('science.js'));new vm.Script(read('benchmark-view.js'));
const nli=JSON.parse(read('nli-report.json'));assert.equal(nli.modelCalls,12);assert.equal(nli.publicationApproved,false);assert.equal(nli.domainGuarded.correct,nli.results.filter(r=>r.domainGuardedDecision===r.expected).length);const cycle=JSON.parse(read('research-cycle-report.json'));assert.equal(cycle.sourceDocuments,3);assert.equal(cycle.modelCalls,3);assert.equal(cycle.stages.length,5);assert.equal(cycle.publicationApproved,false);assert.equal(cycle.stages[3].result,'abstain / reject');new vm.Script(read('nli-view.js'));new vm.Script(read('cycle-view.js'));
console.log(JSON.stringify({status:'PASS',anchors:rows.length,categories:types,sourceRegistries:Object.keys(sources).length,peaceProcesses:processRows.length,commitments:processRows.reduce((n,r)=>n+r.commitments.length,0),coordinates:'valid',js:'valid',method:'geographic theatre anchors only'}));
