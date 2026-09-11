import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

for (const marker of [
  'AI Operations Workbench',
  'AI does the prep. You make the decision.',
  'Your work queue',
  'AI PREP COMPLETE',
  'YOUR DECISION',
  'Why this needs you',
  'What AI verified',
  'Recommended next action',
  'Result:',
  'Approve & create follow-up',
  'Request CRM refresh',
  'Create policy task',
  'Follow-up task created',
  'Open next case →',
  'Production pattern:',
  'synthetic data only'
]) assert.ok(html.includes(marker), `missing marker: ${marker}`);

assert.ok(html.includes('https://github.com/mikelninh/digital-worker-factory'));
assert.ok(html.includes('no official Doctolib product UI or data'));
console.log('AI Operations 10x clarity demo QA PASS');