import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

for (const marker of [
  'AI Operations Workbench',
  'Work queue',
  'Your task',
  '1 · Understand',
  '2 · Verify',
  '3 · Act',
  'Approve & create follow-up',
  'Request CRM refresh',
  'Create implementation task',
  'Open next case →',
  'Production pattern:',
  'synthetic data only'
]) assert.ok(html.includes(marker), `missing marker: ${marker}`);

assert.ok(html.includes('https://github.com/mikelninh/digital-worker-factory'));
assert.ok(html.includes('no official Doctolib product UI or data'));
console.log('AI Operations task-first demo QA PASS');