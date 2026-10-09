/* OUT OF PANEL 0.6: real browser tests with a mocked submission endpoint.
 * No emails or production feedback are sent by this suite.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const artifacts=path.join(here,'qa06-artifacts');
await fs.mkdir(artifacts,{recursive:true});
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const html=await fs.readFile(path.join(here,'../index.html'));
const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(html)});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
const errors=[],tests=[];
page.on('pageerror',e=>errors.push(e.message));
const test=async(name,fn)=>{try{let value=await fn();tests.push({name,pass:!!value});console.log((value?'PASS ':'FAIL ')+name);}catch(e){tests.push({name,pass:false,reason:String(e)});console.log('FAIL '+name+' '+e)}};
let requested=[], failMode=false;
await page.route('**/functions/v1/out-of-panel-v06',async route=>{
  let body;try{body=route.request().postDataJSON()}catch{body={}};
  requested.push(body);
  const response=failMode?{error:'Test simulated offline error'}:{ok:true,saved:true};
  await route.fulfill({status:failMode?503:201,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify(response)});
});
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/?v06test=1#object',{waitUntil:'load'});
 await page.waitForFunction(()=>!!window.OutOfPanel06);
 await test('0.6 entrypoint initialises',()=>page.evaluate(()=>OutOfPanel06.version==='0.6.0'));
 await test('Actual 3D journey remains present',()=>page.evaluate(()=>!!window.OutOfPanelJourney && !!document.getElementById('coin-canvas')));
 await test('Privacy details present',()=>page.locator('#oop06-privacy-note').count().then(x=>x===1));
 await page.locator('#feedback-open').click();
 await test('Accessible feedback dialog opens',()=>page.locator('#oop06-feedback').evaluate(d=>d.open));
 await test('Reaction choice starts unset',()=>page.locator('#oop06-form input[name=feeling]:checked').count().then(x=>x===0));
 await page.locator('input[value="Loved it"]').check();
 await page.locator('#oop06-moment').selectOption('mia');
 await page.locator('#oop06-note').fill('The little cat made me smile. This is a test only.');
 await page.locator('#oop06-send').click();
 await page.waitForSelector('#oop06-feedback .oop06-success:visible');
 await test('Only a successful saved response shows thank you',()=>page.locator('#oop06-feedback .oop06-success').isVisible());
 await test('Payload contains no browser ID or email',()=>Boolean(requested[0]?.kind==='feedback'&&requested[0]?.feeling==='Loved it'&&requested[0]?.moment==='mia'&&requested[0]?.note?.includes('test only')&&!('email' in requested[0])&&!('id' in requested[0])));
 await page.locator('#oop06-feedback .oop06-success [data-oop06-close]').click();
 failMode=true;
 await page.locator('#feedback-open').click();
 await page.locator('input[value="Curious"]').check();
 await page.locator('#oop06-send').click();
 await page.waitForSelector('#oop06-feedback .oop06-fallback:visible');
 await test('Network failure never claims submission succeeded',async()=>!(await page.locator('#oop06-feedback .oop06-success').isVisible())&&await page.locator('#oop06-feedback .oop06-fallback').isVisible());
 await test('Email/copy fallback offered',()=>page.locator('#oop06-email-feedback').getAttribute('href').then(x=>x.startsWith('mailto:')));
 await page.locator('#oop06-feedback .oop06-close').click();
 await page.locator('#share').click();
 await test('Invite is a complete shareable public URL',()=>page.locator('#oop06-link').inputValue().then(s=>s==='https://mikelninh.github.io/beyond-cv/out-of-panel/?gift=window#object'));
 await test('Invitation says it shares no ownership',()=>page.locator('#oop06-share .oop06-privacy').innerText().then(s=>s.includes('not ownership')));
 await page.screenshot({path:path.join(artifacts,'share-mobile.png')});
 await page.locator('#oop06-share .oop06-close').click();
 for(const width of [320,375,390,768,1440]){
    await page.setViewportSize({width,height:width<=390?780:950});
    await page.locator('#feedback-open').click();
    await test('Feedback fits '+width+'px',()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.locator('#oop06-feedback .oop06-close').click();
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await test('Reduced motion remains respected',()=>page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));
 await page.reload({waitUntil:'load'});
 await test('Reload does not store feedback form fields',()=>page.locator('#oop06-note').inputValue().then(s=>s===''));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 await test('Offline/local version retains original share fallback',()=>page.evaluate(()=>!window.OutOfPanel06));
 await test('Legacy full game is still present',()=>page.locator('#board').count().then(x=>x===1));
 await test('Comic reader is still present',()=>page.locator('#reader-dialog').count().then(x=>x===1));
}catch(e){errors.push(String(e));await page.screenshot({path:path.join(artifacts,'error.png'),fullPage:true}).catch(()=>{});}
await browser.close();
await new Promise(ok=>server.close(ok));
const result={release:'0.6.0',testing:'local Chromium, mocked feedback backend; no production submission',passed:tests.filter(x=>x.pass).length,failed:tests.filter(x=>!x.pass).length,tests,errors};
await fs.writeFile(path.join(artifacts,'QA06.json'),JSON.stringify(result,null,2));
console.log('OUT OF PANEL 0.6:',result.passed,'pass',result.failed,'fail; errors',errors.length);
if(result.failed||errors.length)process.exitCode=1;
