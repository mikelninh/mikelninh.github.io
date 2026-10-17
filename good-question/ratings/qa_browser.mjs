/* End-to-end browser QA for GOOD THINGS. Requires a local static HTTP server. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import fs from 'node:fs';
const root=process.env.GQ_RATINGS_URL||'http://127.0.0.1:8099/ratings/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const out='good-question/ratings/screenshots';fs.mkdirSync(out,{recursive:true});
let count=0;const pageErrors=[];
const check=(pass,label)=>{assert.ok(pass,label);count++;console.log('PASS',label)};
async function open(context,device='desktop'){const p=await context.newPage();p.on('pageerror',e=>pageErrors.push(device+': '+String(e)));await p.goto(root,{waitUntil:'domcontentloaded'});await p.waitForSelector('#product-grid .product-card',{timeout:15000});return p}
try{
 for(const width of [360,390,768,1440]){
 const ctx=await browser.newContext({viewport:{width,height:940},reducedMotion:'reduce',acceptDownloads:true});
 const p=await open(ctx,String(width));
 check(await p.locator('h1').count()===1,width+' one main heading');
 check(await p.locator('#product-grid .product-card').count()===24,width+' paged initial product count');
 check(await p.evaluate(()=>window.GQ_RATING_TEST.all())>=120,width+' full catalog available');
 check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),width+' no horizontal overflow');
 check(await p.locator('[data-profile]').count()===2,width+' both individual rating profiles');
 check((await p.locator('#catalog-description').innerText()).includes('101'),width+' source-linked images clearly quantified');
 if(width===390||width===1440)await p.screenshot({path:out+'/'+width+'-home.png',fullPage:true});
 if(width===390){
   const imgs=p.locator('.product-card img');
   for(const idx of [0,1,2]){await imgs.nth(idx).scrollIntoViewIfNeeded();await p.waitForTimeout(900);}
   const states=await imgs.evaluateAll(els=>els.slice(0,6).map(i=>({src:i.src,loaded:i.complete&&i.naturalWidth>20})));
   console.log('REWE_CDN_PHOTO_CHECK',JSON.stringify(states));
   check(states.some(x=>x.loaded), 'at least one externally hosted real packshot loads in browser');
 }
 await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:390,height:860},acceptDownloads:true});
 const p=await open(ctx,'rating-flows');
 const id='rewe-7905813';
 await p.locator(`[data-detail="${id}"]`).click();
 await p.locator('#product-dialog[open]').waitFor();
 check((await p.locator('#product-dialog-content').innerText()).includes('15 g'),'real tofu reference protein displayed');
 check((await p.locator('#product-dialog-content').innerText()).includes('0,5 g'),'tofu sugar upper-bound displayed');
 check((await p.locator('#product-dialog-content').innerText()).includes('EU agriculture'),'agricultural origin visibly separated');
 check((await p.locator('#product-dialog-content').innerText()).includes('Plant Republic'),'legal food business separately visible');
 check((await p.locator('#product-dialog-content').innerText()).includes('Nicht geprüft'),'unknown manufacturing origin not invented');
 await p.locator(`[data-tried="${id}"][data-who="mikel"]`).click();
 await p.locator(`[data-grade="S"][data-id="${id}"][data-who="mikel"]`).click();
 await p.locator(`[data-grade="B"][data-id="${id}"][data-who="huong"]`).click();
 check(await p.evaluate(id=>window.GQ_RATING_TEST.score(id,'mikel').grade,id)==='S','Mikel S score saved');
 check(await p.evaluate(id=>window.GQ_RATING_TEST.score(id,'huong').grade,id)==='B','Huong B score saved separately');
 await p.locator(`textarea[data-note-field="notes"][data-who="mikel"]`).fill('Great when crisp fried with sesame and ginger.');
 await p.locator(`[data-save-notes="${id}"][data-who="mikel"]`).click();
 check((await p.evaluate(id=>window.GQ_RATING_TEST.score(id,'mikel').notes,id)).includes('ginger'),'Mikel tasting note stored');
 await p.locator('[data-close="product-dialog"]').click();
 await p.reload({waitUntil:'domcontentloaded'});await p.waitForSelector('#product-grid .product-card');
 check(await p.evaluate(id=>window.GQ_RATING_TEST.score(id,'mikel').grade,id)==='S','rating survives reload');
 await p.locator('#filter-protein').selectOption('15');
 check(await p.evaluate(()=>window.GQ_RATING_TEST.filtered())>0,'protein filter shows verified candidates');
 check(await p.evaluate(()=>window.GQ_RATING_TEST.filtered())<120,'unknown protein excluded rather than counted as zero');
 await p.locator('#filter-protein').selectOption('any');
 await p.locator('#filter-sugar').selectOption('1');
 check(await p.evaluate(()=>window.GQ_RATING_TEST.filtered())>0,'low-sugar filter returns sourced products');
 await p.locator('#filter-sugar').selectOption('any');
 await p.locator('#search-products').fill('Räuchertofu');
 check(await p.evaluate(()=>window.GQ_RATING_TEST.filtered())>=1,'text search matches German accents');
 await p.locator('#search-products').fill('');
 await p.locator('#filter-store').selectOption('Lidl');
 check(await p.evaluate(()=>window.GQ_RATING_TEST.filtered())===6,'Lidl Vemondo scouting group selectable');
 await p.locator('#filter-store').selectOption('all');
 // Sharing an explicitly selected single profile must never transmit personal notes.
 await p.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async args=>window.__lastShare=args.url}));
 await p.locator('#share-profile').click();
 const url=await p.evaluate(()=>window.__lastShare);
 check(Boolean(url)&&url.includes('#share='),'profile share link created');
 check(!url.includes('ginger'),'taste notes never leak in link');
 const ctxB=await browser.newContext({viewport:{width:390,height:860}});
 const other=await open(ctxB,'other-phone');
 await other.goto(url,{waitUntil:'domcontentloaded'});await other.waitForSelector('#share-import:not([hidden])');
 check((await other.locator('#share-title').innerText()).includes('Mikel'),'link labelled as unverified Mikel snapshot');
 await other.locator('#import-snapshot').click();
 check(await other.evaluate(id=>window.GQ_RATING_TEST.score(id,'mikel').grade,id)==='S','other phone explicitly imports rating');
 check(await other.evaluate(id=>window.GQ_RATING_TEST.score(id,'huong').grade,id)==='','other user column stays blank');
 await other.locator('[data-profile=huong]').click();
 await other.locator(`[data-detail="${id}"]`).click();
 await other.locator(`[data-grade="A"][data-id="${id}"][data-who="huong"]`).click();
 await other.locator('[data-close="product-dialog"]').click();
 await other.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async args=>window.__lastShare=args.url}));
 await other.locator('#share-profile').click();
 const reply=await other.evaluate(()=>window.__lastShare);
 await p.goto(reply,{waitUntil:'domcontentloaded'});await p.waitForSelector('#share-import:not([hidden])');
 await p.locator('#import-snapshot').click();
 check(await p.evaluate(id=>window.GQ_RATING_TEST.score(id,'huong').grade,id)==='B','safe merge preserves existing Huong B without consent');
 await p.goto(reply,{waitUntil:'domcontentloaded'});await p.waitForSelector('#share-import:not([hidden])');
 p.once('dialog',dialog=>dialog.accept());
 await p.locator('#replace-snapshot').click();
 check(await p.evaluate(id=>window.GQ_RATING_TEST.score(id,'huong').grade,id)==='A','explicit consent replaces Huong B with latest shared Huong A');
 check(await p.evaluate(id=>window.GQ_RATING_TEST.score(id,'mikel').grade,id)==='S','Mikel score unaffected by receiving Huong');
 // Add custom product with self-reported nutrition and no image.
 await p.locator('#add-product').click();await p.locator('#custom-dialog[open]').waitFor();
 await p.locator('[name="name"]').fill('Vemondo Bio Räuchertofu 200g - own package');
 await p.locator('[name="brand"]').fill('Vemondo');
 await p.locator('[name="store"]').fill('Lidl');
 await p.locator('[name="protein"]').fill('17.5');
 await p.locator('[name="sugar"]').fill('1.1');
 await p.locator('#custom-form button[type=submit]').click();
 check(await p.evaluate(()=>window.GQ_RATING_TEST.all())>=124,'custom product added locally');
 check((await p.locator('#product-grid').innerText()).includes('own package'),'personal addition appears in shelf');
 // Data portability.
 withExport:
 {
 const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#export-list').click()]);
 const path=await download.path();const obj=JSON.parse(fs.readFileSync(path,'utf8'));
 check(obj.kind==='good-things-v1','proper portable JSON export');
 check(obj.profiles.mikel[id].grade==='S'&&obj.profiles.huong[id].grade==='A','both independent ratings in export');
 check(obj.custom.some(x=>x.name.includes('own package')),'custom product saved in export');
 }
 await p.locator('[data-profile=mikel]').click();
 await p.locator('#filter-sugar').selectOption('1');await p.locator('#filter-sugar').selectOption('any');
 check(pageErrors.length===0,'no unhandled JS exceptions: '+pageErrors.join('; '));
 await ctxB.close();await ctx.close();
 console.log('RESULT:',count,'browser checks passed');
}finally{await browser.close()}
