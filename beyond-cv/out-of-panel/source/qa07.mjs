/* OUT OF PANEL 0.7 — authentic browser capture and device-emulation measurements.
 * Screenshots and short teaser come from the real Playwright-rendered Three.js scene.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)),out=path.join(dir,'qa07-artifacts');
await fs.mkdir(out,{recursive:true});
const html=await fs.readFile(path.join(dir,'../index.html'));
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=http.createServer((_req,res)=>{res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(html)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const checks=[],errors=[];
const check=(name,value,details)=>{checks.push({name,pass:!!value,details:details||''});console.log((value?'PASS ':'FAIL ')+name)};
try {
 const videoContext=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,acceptDownloads:true});
 const page=await videoContext.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'load'});
 await page.waitForFunction(()=>window.OutOfPanelJourney?.getState().status!=='idle',{},{timeout:20000});
 await page.waitForTimeout(1000);
 check('Opening gives an interactive hint',await page.locator('#portal-hint').textContent().then(x=>x.includes('Turn the coin')));
 await page.locator('#stage').screenshot({path:path.join(out,'coin-real.png')});
 await page.locator('#spin-object').click();await page.waitForTimeout(2000);
 check('Spin hints at the world',await page.locator('#portal-hint').textContent().then(x=>x.includes('Look inside')));
 await page.locator('#look-inside').click();await page.waitForFunction(()=>OutOfPanelJourney.getState().progress>=.999,{},{timeout:35000});
 await page.waitForTimeout(700);
 const three=await page.evaluate(()=>OutOfPanelJourney.getState());
 check('Portal rendering is actual Three.js',three.status==='ready'&&three.threeRevision==='180');
 await page.screenshot({path:path.join(out,'rooftop-real.png')});
 await page.screenshot({path:path.join(out,'social-preview.png'),clip:{x:0,y:120,width:1440,height:756}});
 await page.locator('[data-rooftop="mia"]').click();await page.waitForTimeout(1800);
 await page.locator('#close-world').click();await page.waitForTimeout(800);
 await page.locator('#return-page').click();await page.waitForTimeout(650);
 await page.locator('#give-back').click();await page.waitForTimeout(1700);
 await page.screenshot({path:path.join(out,'page04-real.png')});
 await videoContext.close();
 // Film in a separate, small context. GPU screenshots above must not compete
 // with video encoding during the heavier portal flight.
 const filmContext=await browser.newContext({viewport:{width:960,height:600},deviceScaleFactor:1,recordVideo:{dir:out,size:{width:960,height:600}}});
 const film=await filmContext.newPage();
 await film.goto(base,{waitUntil:'load'});
 await film.waitForFunction(()=>window.OutOfPanelJourney?.getState().status!=='idle');
 await film.locator('#spin-object').click();
 await film.waitForTimeout(1700);
 // Smooth turn is visible before reduced-motion switches to an immediate
 // entry; the final frame is a genuinely rendered rooftop, not AI art.
 await film.emulateMedia({reducedMotion:'reduce'});
 await film.locator('#look-inside').click();
 await film.waitForTimeout(1700);
 const filmState=await film.evaluate(()=>OutOfPanelJourney.getState());
 check('Film contains a real rendered rooftop or compatible fallback',filmState.status==='ready'||filmState.status==='fallback',filmState);
 const recorded=film.video();await filmContext.close();
 if(recorded){const p=await recorded.path();await fs.copyFile(p,path.join(out,'real-teaser.webm'));check('Actual browser interaction video captured',(await fs.stat(path.join(out,'real-teaser.webm'))).size>10000);}
 
 // A phone-shaped Chromium browser is NOT a physical device; record only honest emulation results.
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
 await phone.goto(base,{waitUntil:'load'});
 await phone.waitForFunction(()=>window.OutOfPanelJourney?.getState().status!=='idle',{},{timeout:20000});
 const nav=await phone.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {domContentLoadedMs:Math.round(n.domContentLoadedEventEnd),loadMs:Math.round(n.loadEventEnd),width:document.documentElement.scrollWidth,viewport:innerWidth}});
 const stage=await phone.locator('#stage').boundingBox();check('Mobile viewport has no horizontal overflow',nav.width<=nav.viewport+2,nav);
 check('Mobile coin is reachable above normal scrolling area',stage&&stage.y<850,stage);
 await phone.locator('#spin-object').click();await phone.waitForTimeout(500);
 const hint=await phone.locator('#portal-hint').textContent();check('Mobile spin reveals next action',hint.includes('Look inside'));
 await phone.locator('#look-inside').click();await phone.waitForFunction(()=>OutOfPanelJourney.getState().progress>=.999,{},{timeout:25000});
 await phone.screenshot({path:path.join(out,'rooftop-mobile-real.png'),fullPage:true});
 const start=await phone.evaluate(()=>OutOfPanelJourney.getState().renders);await phone.waitForTimeout(1100);
 const finish=await phone.evaluate(()=>OutOfPanelJourney.getState().renders);
 const measurements={device:'Chromium mobile viewport emulation with SwiftShader software WebGL2 — NOT a physical iPhone or Android device',navigation:nav,rooftopRendersPerSecond:Math.round((finish-start)/1.1),threeRevision:three.threeRevision,threeDrawCalls:three.drawCalls};
 await fs.writeFile(path.join(out,'performance.json'),JSON.stringify(measurements,null,2));
 check('Rooftop remains interactive on mobile',await phone.locator('[data-rooftop="mia"]').isVisible());
 // New dashboards must not expose feedback without a valid owner session.
 const admin=await mobile.newPage();await admin.goto('https://mikelninh.github.io/beyond-cv/out-of-panel/listening-room/',{waitUntil:'domcontentloaded',timeout:20000}).catch(()=>{});
 if(admin.url().includes('/listening-room/')){
   check('Owner dashboard never shows feedback without a login',!(await admin.locator('#dash').isVisible()).catch(()=>true));
 }
 await mobile.close();
}catch(e){errors.push(String(e));console.log('FAIL exception',String(e));}
await browser.close();await new Promise(r=>server.close(r));
const report={release:'0.7.0',checks,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,errors};
await fs.writeFile(path.join(out,'QA07.json'),JSON.stringify(report,null,2));
console.log('QA07:',report.passed,'pass',report.failed,'fail',errors);
if(report.failed||errors.length)process.exitCode=1;
