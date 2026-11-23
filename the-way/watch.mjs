#!/usr/bin/env node
/* The Way / documentary source-access watch.
   Looks only at whether cited source URLs respond. It never judges conflict, updates
   peace status, scrapes agreement texts or makes a compliance claim.
   Scheduled GH Actions output is an artifact, not a public automatic peace report. */
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('.',import.meta.url);
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('processes.js',root),'utf8'),ctx);
const records=ctx.window.WAY_PROCESSES;
const links=new Map();
for(const p of records)for(const [key,s] of Object.entries(p.sources)){
 const e=links.get(s.url)||{url:s.url,title:s.title,org:s.org,processIds:[],keys:[]};
 if(!e.processIds.includes(p.id))e.processIds.push(p.id);
 e.keys.push(p.id+':'+key);
 links.set(s.url,e);
}
const jobs=[...links.values()];
let next=0;
const findings=[];
async function check(entry){
 const start=Date.now();
 const u=new URL(entry.url);
 if(u.protocol!=='https:')return {...entry,status:'unsupported',httpStatus:null,checkedAt:new Date().toISOString()};
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
 try{
   const res=await fetch(entry.url,{method:'HEAD',redirect:'follow',signal:controller.signal,headers:{'user-agent':'TheWayEvidenceMonitor/1.0 (non-commercial public research; github.com/mikelninh/mikelninh.github.io)'}});
   // HEAD blocked by some institutions; interpret as access challenge, not disappearance.
   const status=(res.status>=200&&res.status<400)?'reachable':([401,403,405,429].includes(res.status)?'access_challenge':res.status>=500?'source_unavailable':'check_required');
   return {...entry,status,httpStatus:res.status,checkedAt:new Date().toISOString(),elapsedMs:Date.now()-start,finalHost:new URL(res.url).hostname,headerLastModified:res.headers.get('last-modified')||null};
 }catch(err){
   return {...entry,status:'source_unavailable',httpStatus:null,checkedAt:new Date().toISOString(),elapsedMs:Date.now()-start,reason:String(err?.name||'network_error')};
 }finally{clearTimeout(timer)}
}
async function worker(){while(next<jobs.length){const x=jobs[next++];findings.push(await check(x))}}
await Promise.all(Array.from({length:4},worker));
findings.sort((a,b)=>a.url.localeCompare(b.url));
const report={project:'THE WAY',checkType:'Documentary source URL availability, NOT political or conflict monitoring',checkedAt:new Date().toISOString(),editorialReview:ctx.window.WAY_PROCESS_META.reviewed,processes:records.length,links:findings.length,summary:findings.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{}),results:findings,limitations:'HTTP reachability cannot establish that a source is substantively correct, current, or that any agreement was implemented. 403 and 429 are not evidence that a document has disappeared.'};
const outfile=process.env.WAY_SOURCE_REPORT||'/tmp/the-way-source-watch.json';
fs.writeFileSync(outfile,JSON.stringify(report,null,2));
console.log(JSON.stringify({file:outfile,links:report.links,summary:report.summary,checkedAt:report.checkedAt}));
