import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

for (const marker of [
  'AI Operations Lab',
  'Turn repetitive operations into a',
  'Redesign the workflow',
  'Control context & actions',
  'Measure quality before scaling',
  'Run 30-second demo',
  'Human approval',
  'In one sentence:',
  'Digital Worker Factory',
  'synthetic data only'
]) assert.ok(html.includes(marker), `missing marker: ${marker}`);

assert.ok(html.includes('https://github.com/mikelninh/digital-worker-factory'));
assert.ok(html.includes('no official Doctolib product UI or data'));
console.log('AI Operations role demo QA PASS');