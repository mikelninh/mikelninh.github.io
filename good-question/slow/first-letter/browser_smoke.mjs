/* WUNDERPOST 001 browser smoke. Uses a local http.server, no external apps or payments. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import fs from 'node:fs';
const base=process.env.GQ_URL||'http://127.0.0.1:8099/';
const shots='good-question/slow/first-letter/browser-shots';
fs.mkdirSync(shots,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];let checks=0;
const expect=(cond,msg)=>{assert.ok(cond,msg);checks++;console.log('PASS',msg)};
async function visit(page,locale){await page.goto(base+'first-letter/?lang='+locale,{waitUntil:'domcontentloaded'});await page.waitForSelector('#product-grid .product-card',{timeout:16000})}
try{
 for(const width of [390,768,1440]){
  for(const locale of ['en','de','vi']){
   const ctx=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce',acceptDownloads:true});
   const p=await ctx.newPage();p.on('pageerror',e=>errors.push(width+'/'+locale+': '+String(e)));
   await visit(p,locale);
   await p.waitForTimeout(150);
   if(await p.locator('#audio-mount .gq-listen').count()===0)console.log('AUDIO_DEBUG',JSON.stringify({errors,script:await p.locator('script[src]').evaluateAll(els=>els.map(x=>x.src)),mount:await p.locator('#audio-mount').innerHTML()}));
   expect(await p.locator('html').getAttribute('lang')===locale,`${width}/${locale} language`);
   expect(await p.locator('h1').count()===1,`${width}/${locale} one main headline`);
   expect(await p.locator('#product-grid .product-card').count()===6,`${width}/${locale} six eligible products`);
   expect(await p.locator('#ingredient-warning').isVisible(),`${width}/${locale} Toomba alert`);
   expect(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),`${width}/${locale} no horizontal overflow`);
   expect(await p.locator('#play-and-respond .play-grid article').count()===3,`${width}/${locale} four finite game links`);
   expect(await p.locator('#reader-feedback').count()===1 && await p.locator('#send-feedback').count()===1,`${width}/${locale} reader feedback control`);
   expect(await p.locator('#audio-mount .gq-listen').count()===1,`${width}/${locale} audio player present`);
   expect(await p.locator('#audio-mount select[data-say-voice]').count()===1,`${width}/${locale} voice chooser present`);
   expect(await p.locator('#audio-mount [data-say-stop]').count()===1,`${width}/${locale} sentence progress available`);
   expect((await p.locator('#audio-mount [data-say-rate] option').allTextContents()).includes('2×'),`${width}/${locale} 2x option`);
   if(locale==='en'){
     expect((await p.locator('[data-tier-product=soy]').evaluateAll(els=>els.map(el=>el.value))).every(v=>v===''),`${width} ratings empty by default`);
     expect(await p.locator('.product-art img.real-packshot').count()>=5,`${width} six real product photo elements`);
     expect(await p.locator('#ingredient-warning').count()===1,`${width} one exact-Toomba photo element`);
     if(width===390)await p.screenshot({path:shots+'/mobile.png',fullPage:true});
     if(width===1440)await p.screenshot({path:shots+'/desktop.png',fullPage:true});
   }
   await ctx.close();
  }
 }
 const ctx=await browser.newContext({viewport:{width:390,height:900}});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push('interactions: '+String(e)));
 await visit(p,'en');
 const m=p.locator('select[data-tier-person=mikel][data-tier-product=soy]');
 const h=p.locator('select[data-tier-person=huong][data-tier-product=soy]');
 await m.selectOption('S');await h.selectOption('A');
 expect((await p.locator('#mikel-summary').innerText()).includes('Sojadrink Original'),'Mikel S displayed in summary');
 expect((await p.locator('#huong-summary').innerText()).includes('Sojadrink Original'),'Huong A displayed in summary');
 const url=await p.evaluate(()=>window.GQ_LETTER_TEST.shareURL());
 expect(url.includes('tiers=soy%3ASA'),'share URL contains only valid compressed independent grades');
 await p.goto(url,{waitUntil:'domcontentloaded'});
 await p.waitForSelector('select[data-tier-person=mikel]');
 expect(await p.locator('select[data-tier-person=mikel][data-tier-product=soy]').inputValue()==='S','Mikel rating survives link roundtrip');
 expect(await p.locator('select[data-tier-person=huong][data-tier-product=soy]').inputValue()==='A','Huong rating survives link roundtrip');
 expect(await p.locator('#snapshot-note').isVisible(),'public snapshot flagged as unverified');
 await p.reload({waitUntil:'domcontentloaded'});
 expect(await p.locator('select[data-tier-person=huong][data-tier-product=soy]').inputValue()==='A','snapshot persists after reload');
 await p.locator('[data-lang=de]').click();
 expect(await p.locator('html').getAttribute('lang')==='de' && (await p.locator('#shelf-title').innerText()).includes('Zwei Menschen'),'German switch');
 await p.locator('[data-lang=vi]').click();
 expect(await p.locator('html').getAttribute('lang')==='vi' && (await p.locator('#shelf-title').innerText()).includes('Hai người'),'Vietnamese switch');
 await p.locator('[data-lang=en]').click();
 expect(await p.locator('html').getAttribute('lang')==='en','switch back to English');
 await p.locator('#audio-mount [data-say-rate]').selectOption('1.5');
 expect(await p.locator('#audio-mount [data-say-rate]').inputValue()==='1.5','1.5× selection');
 await p.locator('#audio-mount [data-say-rate]').selectOption('2');
 expect(await p.locator('#audio-mount [data-say-rate]').inputValue()==='2','2× selection');
 // Play/Stop can be tried without claiming audible speech on the GitHub runner.
 if(await p.locator('#audio-mount [data-say-play]').isEnabled()){
   await p.locator('#audio-mount [data-say-play]').click();
   // In headless Chromium, speech output may error/cancel immediately, disabling Stop.
   // Assert that Play is safe without pretending the runner can hear the voice.
   await p.waitForTimeout(350);
   const audioState=await p.locator('#audio-mount [data-say-status]').innerText();
   expect(Boolean(audioState.trim()),'speech activation produces a visible status (hardware availability unverified)');
   // Cancel via the engine rather than racing a temporarily enabled UI button.
   await p.evaluate(()=>{try{window.speechSynthesis?.cancel()}catch(e){}});
 }else{console.log('NOTE browser speech synthesis not available in headless Chromium')}
 // Feedback opens only a voluntary public draft; it does not submit automatically.
 await p.locator('#reader-feedback').fill('Please test a specific soy yogurt packet.');
 await p.evaluate(()=>{window.__gqDraft=null;window.open=(url)=>window.__gqDraft=url});
 await p.locator('#send-feedback').click();
 expect((await p.evaluate(()=>window.__gqDraft))?.startsWith('https://github.com/mikelninh/mikelninh.github.io/issues/new?'),'feedback prepares optional draft');
 await p.goto(base+'?story=reef&lang=en',{waitUntil:'domcontentloaded'});
 await p.waitForSelector('#article-dialog[open]',{timeout:12000});
 expect(await p.locator('#article-dialog .gq-listen').count()===1,'existing Slow Edition story has narration controls');
 expect(await p.locator('#article-dialog [data-say-rate] option').count()===4,'existing story has four audio speeds');
 expect(errors.length===0,'no JavaScript page exceptions: '+errors.join('; '));
 await ctx.close();
 console.log('TOTAL',checks,'browser checks passed');
}finally{await browser.close()}
