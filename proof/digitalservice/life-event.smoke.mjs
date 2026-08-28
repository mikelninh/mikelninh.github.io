import assert from 'node:assert/strict'
import fs from 'node:fs'
import { JSDOM } from 'jsdom'

const html = fs.readFileSync(new URL('./life-event.html', import.meta.url), 'utf8')
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'https://portfolio.test/proof/digitalservice/life-event.html',
  pretendToBeVisual: true,
})

const { document } = dom.window
const $ = id => document.getElementById(id)

assert.equal(document.querySelectorAll('.route').length, 4)
assert.equal(document.querySelectorAll('a.official').length, 4)
assert.equal($('known').textContent, '6 / 6')
assert.equal($('reuse').textContent, '5')
assert.match(document.body.textContent, /Routing-Proof · kein Bescheid/)
assert.match(document.body.textContent, /keine automatische Leistungsentscheidung/)

// Missing must stay missing rather than silently becoming zero.
$('net').value = ''
$('update').click()
assert.equal($('known').textContent, '5 / 6')
assert.match($('missing-copy').textContent, /1 gemeinsame Demo-Fakt/)
assert.match($('questions').textContent, /Wie hoch war das bisherige Einkommen/)

// Multiple missing facts remain explicit and route chips degrade visibly.
$('months').value = ''
$('rent').value = ''
$('registered').checked = false
$('update').click()
assert.equal($('known').textContent, '2 / 6')
assert.match($('alg-chip').textContent, /Versicherungszeit fehlt/)
assert.match($('reg-chip').textContent, /Meldestatus offen/)
assert.match($('rent-chip').textContent, /Wohnkosten fehlen/)
assert.match($('missing-copy').textContent, /4 gemeinsame Demo-Fakt/)

// Zero children is a known fact, not a missing value.
$('children').value = '0'
$('update').click()
assert.match($('child-chip').textContent, /Kinderzahl erfasst/)

// Reset must restore the deterministic synthetic starting state.
$('reset').click()
assert.equal($('net').value, '1716')
assert.equal($('months').value, '18')
assert.equal($('rent').value, '1100')
assert.equal($('registered').checked, true)
assert.equal($('known').textContent, '6 / 6')
assert.equal($('reuse').textContent, '5')

for (const link of document.querySelectorAll('a.official')) {
  assert.equal(link.target, '_blank')
  assert.match(link.rel, /noreferrer/)
  assert.match(link.href, /^https:\/\//)
}

console.log('Income-loss public demo DOM smoke: OK')
