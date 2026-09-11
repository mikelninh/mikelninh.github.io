import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

for (const marker of [
  'AI Operations Lab',
  'Workflow redesign',
  'Context quality',
  'Evaluation',
  'Earned autonomy',
  'Handling time',
  'Digital Worker Factory',
  'synthetic data only'
]) assert.ok(html.includes(marker), `missing marker: ${marker}`);

assert.ok(html.includes('https://github.com/mikelninh/digital-worker-factory'));
assert.ok(html.includes('no official Doctolib product UI or data'));
console.log('AI Operations role demo QA PASS');