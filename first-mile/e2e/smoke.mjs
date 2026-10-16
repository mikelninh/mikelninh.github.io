import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const root=resolve(process.cwd(),'../..');
const artifacts=join(root,'first-mile/e2e/artifacts');
mkdirSync(artifacts,{recursive:true});
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{cwd:root,stdio:'pipe'});
let browser;
async function waitServer(){
 for(let i=0;i<40;i++){
  try { const response=await fetch('http://127.0.0.1:8765/first-mile/');if(response.ok)return }
  catch{}
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 throw Error('Local demo HTTP server did not start');
}
async function waitFor(page,fn,timeout=30000){
 await page.waitForFunction(fn,null,{timeout});
}
async function main(){
 await waitServer();
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1300,height:860},acceptDownloads:true});
 const errors=[];
 page.on('pageerror',err=>errors.push(String(err)));
 await page.goto('http://127.0.0.1:8765/first-mile/',{waitUntil:'domcontentloaded'});
 await waitFor(page,()=>document.getElementById('doccount')?.textContent==='02');
 assert.match(await page.textContent('#picker-heading'),/Pick one/);
 await page.locator('[data-case="asterion"]').click();
 await waitFor(page,()=>document.getElementById('case')?.textContent?.includes('ASTERION'));
 assert.equal((await page.textContent('#diffCount')).trim(),'03');
 await page.screenshot({path:join(artifacts,'desktop-sample.png'),fullPage:true});
 await page.locator('.card').first().click();
 await page.locator('#dialog').waitFor({state:'visible'});
 assert.match(await page.locator('#sourceList').textContent(),/PAGE [0-9]/);
 await page.locator('#close').click();
 await page.locator('#files').setInputFiles(join(root,'first-mile/samples/asterion-fictional-test.pdf'));
 await waitFor(page,()=>document.getElementById('mode')?.textContent?.includes('YOUR LOCAL DOCUMENTS'),40000);
 const uploadStatus=await page.textContent('#status');
 assert.match(uploadStatus,/Read 1 file/);
 assert.equal((await page.textContent('#diffCount')).trim(),'03',
     'Three numerically differing fields expected after uploading real fictional PDF');
 await page.locator('#notes').fill('Ask why the ARR definition changed.');
 const [dl]=await Promise.all([page.waitForEvent('download'),page.locator('#export').click()]);
 assert.match(dl.suggestedFilename(),/first-mile-founder-brief\.md/);
 const body=readFileSync(await dl.path(),'utf8');
 for(const part of ['ARR: EUR 240k','ARR: EUR 180k','Paying customers: 12','Paying customers: 18','Ask why the ARR definition changed.']){
  assert.ok(body.includes(part),'Export missing: '+part);
 }
 await page.screenshot({path:join(artifacts,'desktop-upload.png'),fullPage:true});
 await page.reload({waitUntil:'domcontentloaded'});
 await waitFor(page,()=>document.getElementById('mode')?.textContent?.includes('SYNTHETIC EXAMPLE'));
 assert.equal(await page.inputValue('#notes'),'','In-memory reviewer notes must be cleared after reload');
 const mobile=await browser.newPage({viewport:{width:390,height:844}});
 await mobile.goto('http://127.0.0.1:8765/first-mile/',{waitUntil:'domcontentloaded'});
 await waitFor(mobile,()=>document.getElementById('doccount')?.textContent==='02');
 const widths=await mobile.evaluate(()=>({body:document.body.scrollWidth,viewport:innerWidth}));
 assert.ok(widths.body<=widths.viewport+3,'Mobile layout overflows horizontally: '+JSON.stringify(widths));
 await mobile.screenshot({path:join(artifacts,'mobile-first-impression.png'),fullPage:true});
 assert.deepEqual(errors,[],'Unexpected page errors');
 console.log(JSON.stringify({status:'PASS',pdf_upload:true,conflicting_figures:3,source_modal:true,download:true,notes_ephemeral:true,mobile_width_ok:true,ms:'browser_e2e_test'},null,2));
}
try{await main()}finally{await browser?.close();server.kill('SIGTERM')}
