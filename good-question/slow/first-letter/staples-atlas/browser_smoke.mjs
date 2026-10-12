import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const base=process.env.GQ_ATLAS_URL||'http://127.0.0.1:8099/first-letter/staples-atlas/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const shots='good-question/slow/first-letter/staples-atlas/screenshots';
fs.mkdirSync(shots,{recursive:true});
let total=0,errors=[];
function check(value,message){assert.ok(value,message);total++;console.log('PASS',message);}
try{
for(const size of [390,768,1440]){
 for(const locale of ['de','en','vi']){
  const ctx=await browser.newContext({viewport:{width:size,height:880},reducedMotion:'reduce'});
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(size+'/'+locale+': '+String(e)));
  await p.goto(base+'?lang='+locale,{waitUntil:'domcontentloaded'});await p.locator('.product-card').first().waitFor();
  check(await p.locator('html').getAttribute('lang')===locale, size+'/'+locale+' language');
  check(await p.locator('.product-card').count()===24,size+'/'+locale+' first 24 products');
  check(await p.locator('h1').count()===1,size+'/'+locale+' one headline');
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),size+'/'+locale+' no horizontal page overflow');
  check(await p.locator('.product-image img').count()===24,size+'/'+locale+' 24 source photo nodes');
  check(await p.locator('#warning-product .warning-card').count()===1,size+'/'+locale+' non-vegan warning separate');
  if(locale==='de'&&size===390)await p.screenshot({path:shots+'/mobile.png',fullPage:true});
  if(locale==='en'&&size===1440)await p.screenshot({path:shots+'/desktop.png',fullPage:true});
  await ctx.close();
 }
}
const ctx=await browser.newContext({viewport:{width:390,height:920}});
const p=await ctx.newPage();p.on('pageerror',e=>errors.push('interactions: '+String(e)));
await p.goto(base+'?lang=de',{waitUntil:'domcontentloaded'});await p.locator('.product-card').first().waitFor();
check((await p.evaluate(()=>window.GQ_ATLAS_TEST.count()))===70,'70 rateable products');
check((await p.evaluate(()=>window.GQ_ATLAS_TEST.imageCount()))===71,'71 source-linked photo URLs');
const grades=await p.evaluate(()=>window.GQ_ATLAS_TEST.grades());
check(!Object.keys(grades.mikel).length&&!Object.keys(grades.huong).length,'no invented founder ratings');
await p.locator('[data-category=tofu]').click();
check(await p.locator('.product-card').count()===10,'10 tofu & tempeh test candidates');
await p.locator('[data-category=all]').click();
await p.locator('#search').fill('Alpro');
check(await p.locator('.product-card').count()>=4,'search brand');
await p.locator('#clear-filters').click();
await p.locator('#store').selectOption('Lidl');
check(await p.locator('.product-card').count()>=1,'filter Lidl');
await p.locator('#store').selectOption('REWE');
check(await p.locator('.product-card').count()>=1,'filter REWE');
await p.locator('#store').selectOption('dm');
check(await p.locator('.product-card').count()>=1,'filter dm');
await p.locator('#clear-filters').click();
const first=await p.locator('.product-card').first().getAttribute('data-product');
await p.locator('select[data-grade=mikel][data-id="'+first+'"]').selectOption('S');
await p.locator('select[data-grade=huong][data-id="'+first+'"]').selectOption('B');
check((await p.locator('#mikel-ranking').innerText()).includes('S'),'Mikel S independent');
check((await p.locator('#huong-ranking').innerText()).includes('B'),'Huong B independent');
await p.locator('button[data-save="'+first+'"]').click();
check((await p.evaluate(()=>window.GQ_ATLAS_TEST.saved())).includes(first),'shopping list locally saved');
const url=await p.evaluate(()=>window.GQ_ATLAS_TEST.shareURL());
check(url.includes('ratings='),'URL encodes rating snapshot');
await p.goto(url,{waitUntil:'domcontentloaded'});await p.locator('.product-card').first().waitFor();
check(await p.locator('select[data-grade=mikel][data-id="'+first+'"]').inputValue()==='S','Mikel roundtrip URL');
check(await p.locator('select[data-grade=huong][data-id="'+first+'"]').inputValue()==='B','Huong roundtrip URL');
await p.reload({waitUntil:'domcontentloaded'});await p.locator('.product-card').first().waitFor();
check(await p.locator('select[data-grade=mikel][data-id="'+first+'"]').inputValue()==='S','persistence across reload');
await p.locator('[data-lang=en]').click();check(await p.locator('html').getAttribute('lang')==='en','language switch English');
await p.locator('[data-lang=vi]').click();check(await p.locator('html').getAttribute('lang')==='vi','language switch Vietnamese');
await p.locator('#mode').selectOption('saved');
check(await p.locator('.product-card').count()===1,'saved filter');
await p.locator('#mode').selectOption('all');
await p.evaluate(()=>window.GQ_ATLAS_TEST.all());
check(await p.locator('.product-card').count()===70,'all 70 product cards render');
check(await p.locator('.product-image img').count()===70,'each card has genuine external photo src');
const photoAudit=await p.evaluate(async()=>{
 const imgs=[...document.querySelectorAll('.product-card .product-image img')];
 imgs.forEach(img=>img.loading='eager');
 await Promise.all(imgs.map(img=>new Promise(done=>{
   if(img.complete){done();return}
   let ended=false;
   const finish=()=>{if(ended)return;ended=true;done()};
   img.addEventListener('load',finish,{once:true});img.addEventListener('error',finish,{once:true});
   setTimeout(finish,15000);
 })));
 return imgs.map(img=>({id:img.closest('.product-card').dataset.product,loaded:img.complete&&img.naturalWidth>64,url:img.currentSrc||img.src}));
});
fs.writeFileSync('good-question/slow/first-letter/staples-atlas/image-audit.json',JSON.stringify({timestamp:'2026-10-12',environment:'GitHub Actions Chromium',tested:photoAudit.length,loaded:photoAudit.filter(x=>x.loaded).length,failed:photoAudit.filter(x=>!x.loaded)},null,2));
console.log('IMAGE_AUDIT',JSON.stringify({tested:photoAudit.length,loaded:photoAudit.filter(x=>x.loaded).length,failed:photoAudit.filter(x=>!x.loaded).slice(0,25)}));
check(photoAudit.some(x=>x.loaded),'at least one sourced packshot loaded in browser');
check(errors.length===0,'no JS exceptions: '+errors.join('; '));
console.log('TOTAL',total,'checks passed');
await ctx.close();
}finally{await browser.close();}
