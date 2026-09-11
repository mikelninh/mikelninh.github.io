import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

for (const marker of [
  'Implementation Onboarding Lab',
  'Technical preflight',
  'Data mapping & migration',
  'Go-live readiness',
  'VPN/API unreachable',
  'Migration data issue',
  'CareOS',
  'synthetic configuration only'
]) assert.ok(html.includes(marker), `missing marker: ${marker}`);

assert.ok(html.includes('https://github.com/mikelninh/care-os'));
assert.ok(html.includes('no official Doctolib product UI or data'));
console.log('Technical Onboarding role demo QA PASS');