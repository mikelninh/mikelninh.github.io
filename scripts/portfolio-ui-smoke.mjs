import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

/** Visual / functional smoke checks of the actual public portfolio.
 *  Does not represent a user study, accessibility certification, or impact proof.
 */
const root='https://mikelninh.github.io'
const output='assets/project-shots'
const checks=[]
const browser=await chromium.launch({headless:true})
await mkdir(output,{recursive:true})
try{
 for(const item of [
  {name:'portfolio-home-desktop',route:'/',width:1280,height:900},
  {name:'portfolio-home-mobile',route:'/',width:390,height:844},
  {name:'impact-desktop',route:'/impact.html',width:1280,height:900},
  {name:'impact-mobile',route:'/impact.html',width:390,height:844},
 ]){
  const page=await browser.newPage({viewport:{width:item.width,height:item.height},deviceScaleFactor:1,reducedMotion:'reduce',colorScheme:'light'})
  try{
   const response=await page.goto(root+item.route,{waitUntil:'domcontentloaded',timeout:45000})
   if(!response?.ok())throw new Error(item.name+' HTTP '+response?.status())
   await page.locator('h1').waitFor({timeout:15000})
   await page.evaluate(()=>document.fonts?.ready)
   const hero=await page.locator('h1').innerText()
   if(item.route==='/'){
    if(!hero.includes('Technology that')||!hero.includes('Evidence that it'))throw new Error('Homepage value proposition not deployed')
    if(await page.locator('#work .project').count()!==3)throw new Error('Expected three featured projects')
    const image=page.locator('.hero-proof-image img')
    await image.waitFor()
    if(!await image.evaluate(async el=>{try{await el.decode();return el.naturalWidth>100}catch{return false}}))throw new Error('Hero evidence screenshot did not load')
    if(item.width<600){
     const menu=page.locator('.mobile-menu summary')
     if(!await menu.isVisible())throw new Error('Mobile menu hidden')
     await menu.click()
     if(!await page.locator('.mobile-panel a[href="impact.html"]').isVisible())throw new Error('Mobile menu did not expand')
     await menu.click()
    }
   } else {
    if(await page.locator('.project').count()!==15)throw new Error('Expected 15 impact projects')
    if(await page.locator('.project-preview img').count()!==9)throw new Error('Expected nine verified screenshot cards')
    const filter=page.locator('#project-filter')
    await filter.selectOption('screenshots')
    if(await page.locator('.project:visible').count()!==9)throw new Error('Screenshot filter did not show nine')
    if(!((await page.locator('#filter-count').innerText()).includes('9 projects')))throw new Error('Filter status is wrong')
    await filter.selectOption('ai')
    if(await page.locator('.project:visible').count()!==6)throw new Error('AI category should contain six')
    await filter.selectOption('all')
    if(await page.locator('.project:visible').count()!==15)throw new Error('Reset filter should show 15')
    const loaded=await page.locator('.project-preview img').evaluateAll(async imgs=>{const outcomes=await Promise.all(imgs.map(async img=>{img.loading='eager';try{await img.decode();return img.naturalWidth>100}catch{return false}}));return outcomes.filter(Boolean).length})
    if(loaded!==9)throw new Error('Real screenshot image loading: '+loaded+'/9')
   }
   const pageWidth=await page.evaluate(()=>document.documentElement.scrollWidth)
   if(pageWidth>item.width+3)throw new Error('Horizontal overflow '+pageWidth+'px > '+item.width+'px')
   await page.addStyleTag({content:'*,*::before,*::after {animation-duration:0s!important; transition-duration:0s!important; caret-color:transparent!important}'})
   await page.screenshot({path:path.join(output,item.name+'.png'),fullPage:false,animations:'disabled'})
   checks.push({name:item.name,viewport:item.width+'x'+item.height,status:'passed',hero:hero.replace(/\\s+/g,' ').slice(0,150),width:pageWidth})
   console.log('PASS '+item.name+' · no overflow · key controls verified')
  }catch(error){
   checks.push({name:item.name,viewport:item.width+'x'+item.height,status:'failed',reason:String(error)})
   console.error('FAIL '+item.name+': '+error)
  }finally{await page.close()}
 }
}finally{await browser.close()}
await writeFile(path.join(output,'portfolio-qa.json'),JSON.stringify({schema:'PORTFOLIO-UI-SMOKE-1',tested_at_utc:new Date().toISOString(),scope:'Public screenshot capture, route loading, image loading, mobile menu, category filtering and horizontal overflow, at two viewports each. Not a user study.',checks},null,2)+'\n')
if(checks.some(c=>c.status==='failed'))process.exitCode=1
