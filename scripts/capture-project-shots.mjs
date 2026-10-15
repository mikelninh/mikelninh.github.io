import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const OUTPUT = 'assets/project-shots'
const sites = [
  { name: 'gitlaw', url: 'https://mikelninh.github.io/gitlaw/' },
  { name: 'good-things', url: 'https://mikelninh.github.io/good-things/' },
  { name: 'claims-ops', url: 'https://mikelninh.github.io/inca-demo/' },
  { name: 'beyond-desktop', url: 'https://mikelninh.github.io/beyond-cv/', selector: 'header.hero' },
  { name: 'beyond-mobile', url: 'https://mikelninh.github.io/beyond-cv/', selector: 'header.hero', viewport: { width: 390, height: 844 } },
]

await mkdir(OUTPUT, { recursive: true })
const browser = await chromium.launch({ headless: true })
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
      if (!response || !response.ok()) throw new Error(site.name + ' HTTP ' + (response?.status() ?? 'no response'))
      await page.waitForTimeout(2500)
      await page.addStyleTag({ content: '*, *::before, *::after {animation-duration:0s!important; transition-duration:0s!important; caret-color:transparent!important}' })
      if (site.selector) {
        await page.locator(site.selector).screenshot({ path: path.join(OUTPUT, site.name + '.png'), animations: 'disabled', timeout: 30000 })
      } else {
        await page.screenshot({ path: path.join(OUTPUT, site.name + '.png'), animations: 'disabled', fullPage: false })
      }
      console.log('Captured ' + site.name + ': ' + page.url())
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
}
