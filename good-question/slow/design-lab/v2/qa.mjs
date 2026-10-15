import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base='http://127.0.0.1:8099/good-question/slow/design-lab/v2/';
const paths=['','stories/the-breath-that-breathes-you/','stories/breathing-under-pressure/','stories/your-brain-has-27-tabs-open/'];
const screens='good-question/slow/design-lab/v2/qa-shots';
fs.mkdirSync(screens,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let count=0;
const accessibility=[];
const originalTitles=['Can eating a fish ever protect other fish?','Before we say ‘vegan’, here\'s what we mean.','Things we reach for, again and again.','How I\'m building a tiny media company with AI.','A five-minute tea ceremony for imperfect people.','A game with no score, and three difficult futures.'];
try {
  for(const [view,w,h] of [['desktop',1440,900],['mobile',375,812],['small',320,700]]) {
    for(const path of paths){
      const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'});
      const page=await ctx.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      const response=await page.goto(base+path,{waitUntil:'networkidle',timeout:30000});
      assert.equal(response.status(),200,'HTTP 200 '+path);
      assert.equal(await page.locator('h1').count(),1,'Exactly one h1 on '+path);
      assert.ok(await page.locator('.preview-ribbon').textContent().then(x=>x.includes('existing magazine unchanged')),'Preview disclaimer '+path);
      assert.equal(errors.length,0,'No JS errors '+path+': '+errors.join(';'));
      const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
      assert.ok(sizes.scroll<=sizes.width+1,'No horizontal overflow '+view+' '+path+' '+JSON.stringify(sizes));
      const unloaded=await page.locator('img').evaluateAll(nodes=>nodes.filter(n=>!n.complete||n.naturalWidth===0).map(n=>n.src));
      assert.deepEqual(unloaded,[],'Original art assets load '+path);
      if(!path){
        assert.equal(await page.locator('[data-story-cats]').count(),9,'Nine actual stories included');
        for(const t of originalTitles) assert.ok((await page.locator('.archive-list').textContent()).includes(t),'Original story included: '+t);
        await page.locator('[data-filter="nature"]').click();
        assert.equal(await page.locator('[data-filter="nature"]').getAttribute('aria-pressed'),'true');
        assert.equal(await page.locator('[data-story-cats]:visible').count(),1,'Filtered nature topic');
        assert.ok((await page.locator('[data-count]').textContent()).includes('1 story'));
        await page.locator('[data-filter="all"]').click();
        assert.equal(await page.locator('[data-story-cats]:visible').count(),9,'Filter restored');
        if(w<=375){
          const hero=await page.locator('.cover-copy').evaluate(el=>el.getBoundingClientRect().width);
          assert.ok(hero>260,'Full-width mobile cover '+view+' width '+hero);
        }
      } else {
        assert.ok((await page.locator('.prose p').count())>=6,'Full-length original essay');
        assert.equal(await page.locator('.prose .sources').count(),1,'Original source material preserved');
        assert.ok(await page.locator('.article-aside .toc a').count()>=3,'Anchored table of contents');
        if(w<=375){
          const loc=await page.evaluate(()=>({article:document.querySelector('.prose').getBoundingClientRect().top,aside:document.querySelector('.article-aside').getBoundingClientRect().top}));
          assert.ok(loc.article<loc.aside,'Mobile essay must precede side notes: '+path);
        }
        const focus=page.locator('[data-focus]');
        await focus.click();
        assert.ok(await page.locator('body').evaluate(el=>el.classList.contains('focus-reading')),'Focus mode enabled');
        await focus.click();
        assert.ok(!(await page.locator('body').evaluate(el=>el.classList.contains('focus-reading'))),'Focus mode disabled');
        const before=await page.locator('.prose').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
        await page.locator('[data-type-change="1"]').click();
        const after=await page.locator('.prose').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
        assert.ok(after>before,'Adjustable text sizing '+path+' before='+before+' after='+after+' inline='+await page.locator('.prose').getAttribute('style')+' script='+await page.evaluate(()=>Array.from(document.scripts).map(s=>s.src).join(',')));
        const headings=await page.locator('.prose h2[id]').count();
        assert.ok(headings>=3,'Meaningful anchor headings');
        await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
        await page.waitForTimeout(120);
        const reading=await page.locator('.progress').evaluate(el=>parseFloat(el.style.width));
        assert.ok(reading>85,'Reading progress works '+path+' '+reading);
        if(path.includes('the-breath-that-breathes-you')){
          await page.locator('[data-lens="biology"]').click();
          assert.equal(await page.locator('[data-lens="biology"]').getAttribute('aria-pressed'),'true');
          assert.ok((await page.locator('[data-lens-result]').textContent()).includes('brainstem'),'Biology lens tells meaningful story');
          assert.ok(await page.locator('[data-motion]').isDisabled(),'Reduced-motion preference respected');
        }
      }
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      const serious=axe.violations.filter(v=>v.impact==='serious'||v.impact==='critical');
      if(serious.length)accessibility.push({view,path: path||'homepage',issues:serious.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.slice(0,5).map(n=>n.target)}))});
      if(view!=='small'){
        await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
        await page.waitForTimeout(100);
        const name=path?path.split('/').filter(Boolean).pop():'cover';
        await page.screenshot({path:screens+'/'+name+'-'+view+'.png',fullPage:true});
      }
      console.log('PASS',view,path||'homepage', 'axe-issues',axe.violations.length);
      await ctx.close();count++;
    }
  }
  if(accessibility.length) throw new Error('Serious or critical accessibility findings: '+JSON.stringify(accessibility));
  console.log('GOOD QUESTION V2 RELEASE CANDIDATE QA PASS —',count,'responsive browser checks');
}finally {await browser.close();}
