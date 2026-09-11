import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

for (const marker of [
  'AI Operations Lab',
  'Turn repetitive work into a',
  'Understand the workflow',
  'Use AI with guardrails',
  'Keep people in control',
  'One workflow. Three outcomes.',
  'READY FOR HUMAN REVIEW',
  'STOPPED — INFORMATION OUTDATED',
  'In one sentence:',
  'synthetic data only'
]) assert.ok(html.includes(marker), `missing marker: ${marker}`);

assert.ok(html.includes('https://github.com/mikelninh/digital-worker-factory'));
assert.ok(html.includes('no official Doctolib product UI or data'));
console.log('AI Operations one-screen demo QA PASS');