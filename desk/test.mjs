import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
const checks=[];
await mkdir('assets/project-shots',{recursive:true});
try{
 for(const config of [
  {name:'desktop',width:1360,height:900},
  {name:'mobile',width:390,height:844}
 ]){
  const page=await browser.newPage({viewport:{width:config.width,height:config.height},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
   const response=await page.goto('http://127.0.0.1:8765/desk/',{waitUntil:'domcontentloaded',timeout:20000});
   if(response?.status()!==200)throw Error('Unexpected HTTP '+response?.status());
   await page.locator('.space').first().waitFor({timeout:10000});
   if(await page.locator('.space').count()!==9)throw Error('Starter workspace count mismatch');
   // A real 3D scene is expected when network and browser WebGL are available.
   await page.waitForFunction(()=>window.__sideSideWorldReady===true,{timeout:30000});
   if(await page.locator('#world-stage canvas').count()!==1)throw Error('3D canvas missing');
   if(!await page.locator('#world-loading').evaluate(x=>x.hidden))throw Error('3D loader not dismissed');
   const width=await page.evaluate(()=>document.documentElement.scrollWidth);
   if(width>config.width+4)throw Error('Horizontal overflow '+width+' > '+config.width);
   await page.screenshot({path:'assets/project-shots/side-side-'+config.name+'.png',animations:'disabled'});
   // Editable 2D cards and the browser-local storage actually work.
   await page.locator('#quick-add').fill('Fresh project room');
   await page.locator('#quick-add-btn').click();
   if(await page.locator('.space').count()!==10)throw Error('Quick add failed');
   await page.locator('.space').first().locator('.next-input').fill('Ship one tested improvement.');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.space').first().waitFor();
   if(await page.locator('.space').count()!==10)throw Error('Local persistence failed');
   if(await page.locator('.space').first().locator('.next-input').inputValue()!=='Ship one tested improvement.')throw Error('Note persistence failed');
   await page.locator('#filter').selectOption('chat');
   if(await page.locator('.space').count()!==0)throw Error('Chat filter should show zero until a link is pasted');
   await page.locator('#clear-filters').click();
   await page.locator('#desk-mode').click();
   if(!await page.locator('#world-stage').evaluate(x=>x.hidden))throw Error('Desk mode failed to hide 3D map');
   await page.locator('#world-mode').click();
   if(await page.locator('#world-stage').evaluate(x=>x.hidden))throw Error('World mode failed to restore map');
   if(errors.length)throw Error('Browser errors: '+errors.join(' | ').slice(0,350));
   checks.push({viewport:config.name,status:'passed',world:'Three.js WebGL canvas',startingRooms:9,afterAdd:10,persistence:true,filters:true,modes:true,horizontalOverflow:false});
   console.log('PASS SIDE/SIDE '+config.name+' WebGL, cards, local persistence, filtering and view toggle');
  }catch(e){checks.push({viewport:config.name,status:'failed',error:String(e)});console.error('FAIL SIDE/SIDE '+config.name+': '+String(e));}
  finally{await page.close();}
 }
}finally{await browser.close();}
console.log(JSON.stringify({schema:'SIDE-SIDE-QA-1',checks},null,2));
if(checks.some(c=>c.status!=='passed'))process.exitCode=1;
