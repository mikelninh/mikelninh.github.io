import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const URL = 'https://dont-drop-the-cake-run.hyperspacekid.chatgpt.site/'
const OUT = 'assets/cake-release-check'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const report = { checked_at: new Date().toISOString(), url: URL, checks: [] }
const failures = []

for (const config of [
  { name: 'desktop', width: 1365, height: 850 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const page = await browser.newPage({
    viewport: { width: config.width, height: config.height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    const response = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(2000)
    const state = await page.evaluate(() => ({
      title: document.title,
      heading: document.querySelector('h1')?.textContent?.replace(/\s+/g,' ').trim() ?? '',
      width: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      visibleButtons: [...document.querySelectorAll('button')].filter((el) => {
        const r=el.getBoundingClientRect();return r.width>0&&r.height>0
      }).map(el=>el.textContent?.trim().replace(/\s+/g,' ').slice(0,80) || el.getAttribute('aria-label') || '').slice(0,30),
    }))
    const statusOk = !!response && response.status() < 400
    const headingOk = /delivery|cake|problem/i.test(state.heading)
    const widthOk = state.width <= state.viewport+16
    const pageOk = errors.length===0
    const row = { viewport:config.name, http_status:response?.status()??null, ...state, errors,
      passed:{http:statusOk, heading:headingOk, mobile_overflow:widthOk, runtime:pageOk} }
    report.checks.push(row)
    if(!statusOk || !headingOk || !widthOk || !pageOk)failures.push(config.name + ': '+JSON.stringify(row.passed))
    await page.screenshot({ path:`${OUT}/${config.name}-intro.png`,animations:'disabled' })

    // Test a real start action only on the desktop, without changing public rankings.
    if(config.name==='desktop'){
      const start=page.getByRole('button',{name:/let.s deliver|start delivery|start game|play now/i}).first()
      if(await start.count()){
        await start.click()
        await page.waitForTimeout(1000)
        const playing=await page.evaluate(()=>({
          hud:document.body.textContent?.includes('FLOOR')??false,
          visibleCanvas:[...document.querySelectorAll('canvas')].some(el=>{
            const r=el.getBoundingClientRect();return r.width>0&&r.height>0
          })
        }))
        report.start_action=playing
        await page.screenshot({path:`${OUT}/desktop-playing.png`,animations:'disabled'})
        if(!playing.hud && !playing.visibleCanvas) failures.push('Start button did not display game/HUD')
      }else{
        report.start_action={skipped:'Start button label not recognised; manual verification required'}
      }
    }
  }catch(e){
    const error=String(e)
    report.checks.push({viewport:config.name,error})
    failures.push(config.name+': '+error)
  }finally{await page.close()}
}

await browser.close()
report.ok=failures.length===0
report.failures=failures
await writeFile(`${OUT}/report.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
if(failures.length)process.exitCode=1
