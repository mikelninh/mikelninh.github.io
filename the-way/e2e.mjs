import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const browserPath=process.env.CHROME_PATH||'/usr/bin/google-chrome';
const base=process.env.WAY_URL||'http://127.0.0.1:8765/';
const out=process.env.WAY_SHOTS||'./screenshots';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:browserPath,args:['--no-sandbox','--disable-dev-shm-usage']});
let shots=[],failures=[];
async function run(label,width,height){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:25000});
 await page.locator('.conflict-row').first().waitFor({timeout:20000});
 assert.equal(await page.locator('.conflict-row').count(),53,'Expected 53 list items');
 assert.equal((await page.locator('#counter-total').textContent()).trim(),'53');
 await page.screenshot({path:path.join(out,label+'-home.png'),fullPage:false});
 shots.push(label+'-home');
 await page.locator('#atlas').scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(out,label+'-atlas.png'),fullPage:false});
 shots.push(label+'-atlas');
 const mapVisible=await page.locator('#map').isVisible();
 const mapLoaded=await page.locator('.leaflet-pane').count()>0;
 const tileCount=await page.locator('.leaflet-tile-pane img').count();
 const note=await page.locator('.map-disclaimer').innerText();
 assert.ok(note.includes('Not a live frontline map'));
 assert.ok(mapVisible,'Map area should be visible');
 if(!mapLoaded)failures.push(label+': Leaflet did not load; map fallback visible');
 await page.locator('.conflict-row').filter({hasText:'Sudan civil war'}).first().click();
 await page.locator('.dossier-top h3').waitFor();
 assert.match(await page.locator('.dossier-top h3').innerText(),/Sudan/);
 assert.ok((await page.locator('#dossier-content').innerText()).includes('POSSIBLE PATHS TOWARDS PEACE'));
 const nextStep=page.locator('.dossier-process-link a');
 assert.equal(await nextStep.count(),1,'Sudan dossier should link to the source ledger');
 assert.match(await nextStep.getAttribute('href'),/process=sudan/);

 await page.screenshot({path:path.join(out,label+'-dossier.png'),fullPage:false});
 shots.push(label+'-dossier');
 await page.locator('#clear-record').click();
 await page.locator('#search').fill('ukraine');
 assert.equal(await page.locator('.conflict-row').count(),1);
 assert.match(await page.locator('.conflict-row').first().innerText(),/Ukraine/);
 await page.locator('#reset-filters').click();
 assert.equal(await page.locator('.conflict-row').count(),53);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 if(overflow>8)failures.push(label+': '+overflow+'px horizontal viewport overflow');
 if(errors.length)failures.push(label+': browser errors: '+errors.slice(0,3).join('; '));
 console.log(JSON.stringify({label,rows:53,mapLoaded,mapTileElements:tileCount,overflow,errors:errors.slice(0,3)}));
 await page.close();
}
async function runLedger(label,width,height){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(new URL('progress.html?process=colombia',base).toString(),{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.process-option').first().waitFor({timeout:20000});
 assert.equal(await page.locator('.process-option').count(),6);
 assert.match(await page.locator('#story-content h3').innerText(),/Colombia/);
 await page.screenshot({path:path.join(out,label+'-peace-hero.png'),fullPage:false});
 shots.push(label+'-peace-hero');
 await page.locator('#workbench').scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(out,label+'-peace-ledger.png'),fullPage:false});
 shots.push(label+'-peace-ledger');
 await page.locator('.process-option').filter({hasText:'Sudan'}).first().click();
 assert.match(await page.locator('#story-content h3').innerText(),/Sudan/);
 assert.ok((await page.locator('#source-list a').count())>=3,'Sudan source links');
 await page.locator('button[data-view="commitments"]').click();
 assert.equal(await page.locator('.commitment').count(),3);
 await page.screenshot({path:path.join(out,label+'-peace-commitments.png'),fullPage:false});
 shots.push(label+'-peace-commitments');
 await page.locator('button[data-view="timeline"]').click();
 assert.equal(await page.locator('.timeline-item').count(),3);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 if(overflow>8)failures.push(label+': Peace Ledger horizontal overflow '+overflow+'px');
 if(errors.length)failures.push(label+': Peace Ledger browser errors: '+errors.join('; '));
 console.log(JSON.stringify({label,peaceProcesses:6,sudanSources:await page.locator('#source-list a').count(),timelineItems:3,overflow,errors:errors.slice(0,3)}));
 await page.close();
}
try{
 await run('desktop',1440,900);
 await run('mobile',390,844);
 await runLedger('desktop',1440,900);
 await runLedger('mobile',390,844);
 console.log(JSON.stringify({screenshots:shots,nonBlockingIssues:failures}));
 if(failures.some(x=>x.includes('horizontal viewport overflow')||x.includes('browser errors')))process.exitCode=1;
}catch(e){console.error('End-to-end browser QA failed:',e);process.exitCode=1}
finally{await browser.close()}
