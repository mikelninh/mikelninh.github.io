import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

for (const marker of [
  'Operations Review Console',
  'Today’s queue',
  'AI recommendation',
  'Prepared operator draft',
  'Next concrete action',
  'Decision log',
  'Approve & create task',
  'Request CRM refresh',
  'Create policy task',
  'How this would be used in production:',
  'synthetic data only'
]) assert.ok(html.includes(marker), `missing marker: ${marker}`);

assert.ok(html.includes('https://github.com/mikelninh/digital-worker-factory'));
assert.ok(html.includes('no official Doctolib product UI or data'));
console.log('AI Operations production-workflow demo QA PASS');