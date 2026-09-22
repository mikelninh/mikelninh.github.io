import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('./game.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('./game.css', import.meta.url), 'utf8');

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
]) assert.ok(html.includes(marker), `missing compatibility marker: ${marker}`);

for (const marker of [
  'Fix the clinic.',
  'Clue notebook',
  'Game Bible',
  'room-phone',
  'room-route',
  'room-ai',
  'room-reception',
  'Expert remix / next shift'
]) assert.ok(html.includes(marker), `missing vertical-slice marker: ${marker}`);

for (const marker of [
  'BROKEN_VARIANTS',
  'runSignalTrace',
  'checkInsights',
  'soundClear',
  'AHA!',
  'Restart the healthy assistant',
  'b-fallback'
]) assert.ok(js.includes(marker), `missing game-engine marker: ${marker}`);

for (const marker of [
  '.clinic',
  '.signalOrb',
  '.clueCard',
  '.aha',
  '.confetti'
]) assert.ok(css.includes(marker), `missing game-style marker: ${marker}`);

assert.doesNotThrow(() => new Function(js), 'game.js should parse as browser JavaScript');
assert.ok(html.includes('./design-bible/'));
assert.ok(html.includes('no official Doctolib product UI or data'));
console.log('Technical Onboarding game vertical-slice QA PASS');
