import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

for (const marker of [
  'Implementation Workspace',
  'Implementations',
  'Readiness checks',
  'Create task for Clinic IT',
  'Create data-fix task',
  'Approve go-live',
  'Implementation activity',
  'Target go-live',
  'How this would be used in production:',
  'synthetic configuration only'
]) assert.ok(html.includes(marker), `missing marker: ${marker}`);

assert.ok(html.includes('https://github.com/mikelninh/care-os'));
assert.ok(html.includes('no official Doctolib product UI or data'));
console.log('Technical Onboarding production-workflow demo QA PASS');