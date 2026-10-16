const test=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')

test('HTGF hero states the human problem, purpose and honest synthetic boundary',()=>{
  const html=read('agents/index.html')
  assert.match(html,/A tenant needs help/)
  assert.match(html,/THE ONE-MINUTE CHALLENGE/)
  assert.match(html,/HUMAN RESPONSIBILITY/)
  assert.match(html,/The UI is a guided simulation/)
  assert.match(html,/ProductionAgentGateway/)
  assert.match(html,/Run worker/)
  assert.match(html,/Remove property record/)
  assert.match(html,/Retry same request/)
})

test('the public HTGF workflow points to a tested executable source',()=>{
  const html=read('agents/index.html')
  assert.match(html,/proofs\/htgf-boundary-release\.test\.mjs/)
  assert.match(html,/actions\/runs\/38720612981/)
  assert.match(html,/no external contact/i)
})

test('GitLaw includes the human reviewer and original legislative sources',()=>{
  const html=read('gitlaw-proof/index.html')
  assert.match(html,/When someone checks a rent increase/)
  assert.match(html,/human reviewer checks the facts/)
  assert.match(html,/gesetze-im-internet\.de\/bgb\/__558/)
  assert.match(html,/github\.com\/mikelninh\/gitlaw/)
})

test('PruefPilot prioritises the applicant and human-controlled next actions',()=>{
  const html=read('pruefpilot/index.html')
  assert.match(html,/When documents are incomplete/)
  assert.match(html,/smallest helpful next step/)
  assert.match(html,/person remains responsible for approval and release/)
  assert.match(html,/data-case="funding"/)
  assert.match(html,/data-case="travel"/)
  assert.match(html,/data-case="clean"/)
  assert.match(html,/github\.com\/mikelninh\/pruefpilot/)
})
