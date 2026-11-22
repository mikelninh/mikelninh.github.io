import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtemp,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../public/',import.meta.url));
const chrome=process.env.CHROME_PATH || 'google-chrome';
const temp=await mkdtemp(join(tmpdir(),'return-loop-browser-'));
const requests=[];
const types={'/pilot.html':'text/html;charset=utf-8','/pilot-engine.mjs':'text/javascript;charset=utf-8'};
const server=createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1').pathname;
 requests.push(pathname);
 if(!Object.hasOwn(types,pathname)){res.writeHead(404);return res.end('not found');}
 try{const {readFile}=await import('node:fs/promises');const body=await readFile(join(root,pathname.substring(1)));res.writeHead(200,{'content-type':types[pathname],'cache-control':'no-store'});res.end(body);}catch{res.writeHead(500);res.end('server error');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const pageUrl='http://127.0.0.1:'+server.address().port+'/pilot.html';
const child=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--remote-allow-origins=*','--remote-debugging-port=9338','--user-data-dir='+temp,pageUrl],{stdio:'ignore'});
let ws;
try{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 let target;
 for(let attempt=0;attempt<90;attempt++){
  try{const list=await (await fetch('http://127.0.0.1:9338/json')).json();target=list.find(x=>x.type==='page'&&x.url.startsWith(pageUrl));if(target)break;}catch{}
  await sleep(250);
 }
 assert.ok(target,'Chrome page debugging target did not appear');
 ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 let seq=0;const pending=new Map();
 ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(!m.id)return;const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);});
 const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const run=async expression=>{const r=await cmd('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error('Browser JS: '+r.exceptionDetails.text);return r.result.value;};
 await cmd('Runtime.enable');await cmd('Page.enable');
 for(let attempt=0;attempt<40;attempt++){if(await run("document.readyState==='complete' && !!document.getElementById('sample')"))break;await sleep(200);}
 await run("document.getElementById('sample').click()");
 await sleep(250);
 assert.equal(await run("document.getElementById('workspace').hidden"),false,'sample opens workspace');
 assert.match(await run("document.getElementById('message').textContent"),/Naht/);
 assert.match(await run("document.getElementById('metric').textContent"),/0 \/ 5/);
 await run("document.getElementById('accept').click()");
 assert.match(await run("document.getElementById('metric').textContent"),/1 \/ 5/);
 assert.equal(await run("document.getElementById('ticket-id').textContent"),"RL-102");
 await run("document.querySelector('#labels input[value=shipping]').checked=false;document.querySelector('#labels input[value=other]').checked=true;document.getElementById('correct').click()");
 assert.match(await run("document.getElementById('metric').textContent"),/2 \/ 5/);
 await run("document.getElementById('escalate').click()");
 assert.match(await run("document.getElementById('metric').textContent"),/3 \/ 5/);
 assert.equal(await run("document.getElementById('export').disabled"),false);
 await run("window.__blob=null;const create=URL.createObjectURL;URL.createObjectURL=function(blob){window.__blob=blob;return create.call(this,blob);}");
 await run("document.getElementById('export').click()");
 const json=JSON.parse(await run("(async()=>await window.__blob.text())()"));
 assert.equal(json.summary.reviewed,3);
 assert.equal(json.summary.escalated,1);
 assert.equal(json.externalActions,0);
 assert.ok(!JSON.stringify(json).includes("Die Naht der Socken"),'raw message excluded from export');
 const csv=join(temp,'input.csv');await writeFile(csv,'id;message;product\nC-1;"Paket verspätet, bitte Retoure";Shirt\nC-2;"Die Größe passt nicht";Socks\n');
 await cmd('DOM.enable');const document=await cmd('DOM.getDocument');const node=await cmd('DOM.querySelector',{nodeId:document.root.nodeId,selector:'#file'});
 await cmd('DOM.setFileInputFiles',{nodeId:node.nodeId,files:[csv]});await sleep(250);
 assert.match(await run("document.getElementById('metric').textContent"),/0 \/ 2/,'CSV import works in browser');
 assert.equal(await run("document.getElementById('ticket-id').textContent"),'C-1');
 // Malformed uploads must not discard a previously valid review batch.
 const bad=join(temp,'invalid.csv');await writeFile(bad,'id,message\\nDUP,Testing broken data\\nDUP,Testing duplicate identifiers\\n'.replaceAll('\\n','\n'));
 await cmd('DOM.setFileInputFiles',{nodeId:node.nodeId,files:[bad]});await sleep(250);
 assert.match(await run("document.getElementById('notice').textContent"),/Import gestoppt: Doppelte ID/);
 assert.match(await run("document.getElementById('metric').textContent"),/0 \/ 2/,'bad import does not destroy the valid batch');
 // Real Chromium mobile viewport and overflow check, not CSS grep.
 await cmd('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await sleep(250);
 const mobile=await run("({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,workspace:!!document.getElementById('workspace')&&!document.getElementById('workspace').hidden})");
 assert.ok(mobile.scroll<=mobile.client+1,'horizontal overflow on 390px mobile viewport: '+JSON.stringify(mobile));
 assert.equal(mobile.workspace,true);
 const mobileShot=await cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 await mkdir('application-demos/v14-source/artifacts',{recursive:true});
 await writeFile('application-demos/v14-source/artifacts/pilot-mobile.png',Buffer.from(mobileShot.data,'base64'));
 await cmd('Page.reload',{ignoreCache:true});await sleep(450);
 assert.equal(await run("document.getElementById('workspace').hidden"),true,'private state cleared on refresh');
 assert.ok(requests.every(x=>Object.hasOwn(types,x)||x==='/favicon.ico'),'no network calls to external services');
 await mkdir('application-demos/v14-source/artifacts',{recursive:true});
 await run("document.getElementById('sample').click()");
 const screenshot=await cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 await writeFile('application-demos/v14-source/artifacts/pilot-desktop.png',Buffer.from(screenshot.data,'base64'));
 console.log('PASS Return Loop browser smoke: sample, accept, correct, escalate, export, CSV import, invalid CSV rejection, 390px mobile overflow, reload privacy, screenshots');
} finally{
 ws?.close();
 child.kill('SIGTERM');
 await new Promise(resolve=>{
  if(child.exitCode!==null || child.signalCode!==null)return resolve();
  const timer=setTimeout(()=>{child.kill('SIGKILL');resolve();},3500);
  child.once('exit',()=>{clearTimeout(timer);resolve();});
 });
 server.close();
 // Chrome may finish writing its profile after SIGTERM: retry instead of
 // treating harmless test teardown as a product failure.
 await rm(temp,{recursive:true,force:true,maxRetries:8,retryDelay:200});
}
