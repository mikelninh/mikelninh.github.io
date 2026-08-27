import fs from 'node:fs'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const html = fs.readFileSync(new URL('./clinical.html', import.meta.url), 'utf8')

assert.match(html, /Keine Behandlungsempfehlungen/)
assert.match(html, /Kein KIS\/PVS-Write/)
assert.match(html, /Ausstehend/)
assert.match(html, /Widerspruch/)

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://portfolio.test/careos/clinical.html',
})

const { document } = dom.window
const click = selector => {
  const el = document.querySelector(selector)
  assert.ok(el, `missing ${selector}`)
  el.click()
}
const text = selector => document.querySelector(selector)?.textContent || ''

// Farid: focus -> source -> review -> docs -> human release.
assert.match(text('#pageTitle'), /Was braucht gerade dich/)
assert.ok(document.querySelector('#checkSource'))
click('#checkSource')
assert.match(text('#pageTitle'), /Alle Quellen/)
assert.ok(document.querySelector('#timelineSearch'))
click('#backReview')
assert.ok(document.querySelector('#confirmReview'))
click('#confirmReview')
assert.match(text('.review-state'), /menschlich geprüft/)
click('#prepareDoc')
assert.match(text('#pageTitle'), /Vorbereiten/)
click('#prepare')
assert.match(text('#review'), /Vorbereitet/)
click('#reviewDoc')
assert.match(text('#review'), /Menschlich geprüft/)
click('#releaseDoc')
assert.match(text('#review'), /Closed loop erreicht/)
assert.match(text('#review'), /kein externer Write|Produktions-Write/i)

// Anna: pending stays pending; the review action must not turn it into negative.
click('[data-p="anna"]')
assert.match(text('#view'), /AUSSTEHEND/)
click('#confirmReview')
assert.match(text('.review-state'), /ausstehend geprüft/)
assert.doesNotMatch(text('#view'), /Blutkultur[^.]{0,80}negativ/i)

// Michael: conflicting dates block documentation release until human review.
click('[data-p="michael"]')
assert.match(text('#view'), /WIDERSPRUCH/)
click('#prepareDoc')
assert.match(text('#view'), /Freigabe blockiert/)
assert.ok(document.querySelector('#resolveConflict'))

console.log('CareOS clinical demo smoke: OK')
dom.window.close()
