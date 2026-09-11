import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

for (const marker of [
  'Implementation Onboarding Lab',
  'Find blockers',
  'Check prerequisites',
  'Validate the data',
  'Make next steps obvious',
  'One onboarding. Three outcomes.',
  'READY FOR GO-LIVE REVIEW',
  'BLOCKED — API/VPN UNREACHABLE',
  'In one sentence:',
  'synthetic configuration only'
]) assert.ok(html.includes(marker), `missing marker: ${marker}`);

assert.ok(html.includes('https://github.com/mikelninh/care-os'));
assert.ok(html.includes('No Doctolib product UI, patient/customer data, internal architecture or production integration claims.'));
console.log('Technical Onboarding one-screen demo QA PASS');