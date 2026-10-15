import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const origin = 'http://127.0.0.1:8099/good-question/slow/design-lab/';
const paths = ['','folio/','atelier/','curio/','folio/story/','atelier/story/','curio/story/'];
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('good-question/slow/design-lab/qa-shots',{recursive:true});
let checked=0;let violations=[];
try{
 for(const [label,w,h] of [['desktop',1440,900],['mobile',375,812]]){
   for(const path of paths){
     const context=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'});
     const page=await context.newPage();
     const problems=[];page.on('pageerror',e=>problems.push('JS: '+e.message));
     const response=await page.goto(origin+path,{waitUntil:'networkidle',timeout:30000});
     assert.equal(response.status(),200,'HTTP '+path);
     assert.equal(await page.locator('h1').count(),1,'One H1 '+path);
     const data=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth}));
     assert.ok(data.scrollWidth<=data.innerWidth+1,'Horizontal overflow '+label+' '+path+' '+JSON.stringify(data));
     assert.equal(problems.length,0,problems.join(','));
     if(path.endsWith('/story/')){
       assert.ok((await page.locator('.prose p').count())>12,'Complete long essay '+path);
       assert.equal(await page.locator('.prose .sources').count(),1,'Sources preserved '+path);
       await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
       await page.waitForTimeout(150);
       const width=await page.locator('.progress-fill').evaluate(el=>parseFloat(el.style.width));
       assert.ok(width>85,'Reading progress '+path+' width '+width);
     }
     if(path==='atelier/story/'){
       await page.locator('[data-reading-mode]').click();
       assert.ok(await page.locator('body').evaluate(el=>el.classList.contains('reading-mode')));
       await page.locator('[data-reading-mode]').click();
       assert.ok(!(await page.locator('body').evaluate(el=>el.classList.contains('reading-mode'))));
     }
     if(path==='curio/'||path==='curio/story/'){
       await page.locator('[data-choice="understand"]').click();
       assert.equal(await page.locator('[data-choice="understand"]').getAttribute('aria-pressed'),'true');
       assert.ok((await page.locator('[data-choice-panel]').textContent()).includes('brainstem'));
       assert.ok(await page.locator('[data-motion-toggle]').isDisabled(),'Reduced-motion respected');
     }
     const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
     const important=audit.violations.filter(v=>v.impact==='serious'||v.impact==='critical');
     if(important.length)violations.push({path,label,violations:important.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.slice(0,3).map(n=>n.target)}))});
     const name=(path||'compare').replaceAll('/','-').replace(/-$/,'');
     await page.screenshot({path:'good-question/slow/design-lab/qa-shots/'+name+'-'+label+'.png',fullPage:true});
     await context.close();checked++;
     console.log('PASS',label,path||'comparison','axe violations:',audit.violations.length);
   }
 }
 if(violations.length)throw new Error('Serious/critical accessibility findings: '+JSON.stringify(violations));
 console.log('DESIGN LAB QA PASS:',checked,'desktop/mobile pages, interactions, reading progress, serious/critical WCAG checks');
}finally{await browser.close();}
