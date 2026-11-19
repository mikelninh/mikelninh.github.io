import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Real screenshots only. Each image comes directly from a named, accessible
 * application route in Chromium. No generated mock-ups are ever substituted.
 * A failed target is logged, and its previous screenshot is left untouched.
 */
const OUTPUT = 'assets/project-shots'
const sites = [
  { name: 'gitlaw', url: 'https://mikelninh.github.io/gitlaw/' },
  { name: 'good-things', url: 'https://mikelninh.github.io/good-things/?view=duo' },
  { name: 'claims-ops', url: 'https://mikelninh.github.io/inca/60s.html#mistake-challenge' },
  { name: 'inca-benchmark', url: 'https://mikelninh.github.io/inca/impact-benchmark.html' },
  { name: 'bidpilot', url: 'https://mikelninh.github.io/bidpilot/' },
  { name: 'pruefpilot', url: 'https://mikelninh.github.io/pruefpilot/' },
  { name: 'openaction', url: 'https://mikelninh.github.io/openaction/' },
  { name: 'projecttogether', url: 'https://mikelninh.github.io/projecttogether/' },
  { name: 'was-bleibt', url: 'https://mikelninh.github.io/was-bleibt/' },
  { name: 'animal-voices', url: 'https://animal-voices-os.vercel.app/try.html' },
  { name: 'beyond-desktop', url: 'https://mikelninh.github.io/beyond-cv/', selector: 'header.hero' },
  { name: 'beyond-mobile', url: 'https://mikelninh.github.io/beyond-cv/', selector: 'header.hero', viewport: { width: 390, height: 844 } },
]

await mkdir(OUTPUT, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
try {
  for (const site of sites) {
    const page = await browser.newPage({
      viewport: site.viewport ?? { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      colorScheme: 'light',
      reducedMotion: 'reduce',
    })
    try {
      const response = await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 45000 })
      if (!response || !response.ok()) throw new Error('HTTP ' + (response?.status() ?? 'no response'))
      await page.waitForTimeout(1800)
      const title = await page.title()
      if (/^\\s*(404|not found|site not found)\\b/i.test(title)) throw new Error('Missing page: ' + title)
      const bodyText = (await page.locator('body').innerText({ timeout: 10000 })).trim()
      if (bodyText.length < 80) throw new Error('Page not populated: ' + bodyText.length + ' characters')
      await page.addStyleTag({ content: '*, *::before, *::after {animation-duration:0s!important; transition-duration:0s!important; caret-color:transparent!important}' })
      const imagePath = path.join(OUTPUT, site.name + '.png')
      if (site.selector) {
        await page.locator(site.selector).screenshot({ path: imagePath, animations: 'disabled', timeout: 30000 })
      } else {
        await page.screenshot({ path: imagePath, animations: 'disabled', fullPage: false })
      }
      results.push({ name: site.name, url: page.url(), title, status: 'captured', image: site.name + '.png' })
      console.log('CAPTURED ' + site.name + ': ' + page.url())
    } catch (error) {
      results.push({ name: site.name, url: site.url, status: 'failed', reason: String(error?.message || error).slice(0, 180) })
      console.error('NOT CAPTURED ' + site.name + ': ' + error)
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
}
const count = results.filter(r => r.status === 'captured').length
await writeFile(path.join(OUTPUT, 'capture-manifest.json'), JSON.stringify({
  schema: 'REAL-PROJECT-SCREENSHOTS-1',
  captured_at_utc: new Date().toISOString(),
  methodology: 'Chromium / Playwright screenshot of live application; not generated artwork or a validation of all interactions.',
  captures: results
}, null, 2) + '\n')
console.log('Screenshot QA: ' + count + '/' + results.length + ' real pages captured')
if (count === 0) process.exitCode = 1
