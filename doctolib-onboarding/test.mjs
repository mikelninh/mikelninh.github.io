import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('./game.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('./game.css', import.meta.url), 'utf8');

for (const marker of [
  'Onboarding Shift',
  'What do you do?',
  'Talk',
  'Look',
  'Try',
  'Notebook',
  'Make the call',
  'Answer the call',
  'no official Doctolib product UI or data'
]) assert.ok(html.includes(marker), `missing simplified UI marker: ${marker}`);

for (const marker of [
  'BROKEN_VARIANTS',
  'renderAll',
  'takeAction',
  'runSignalTrace',
  'applyPlan',
  'verifyPlan',
  'finishMission',
  'Restart the healthy assistant'
]) assert.ok(js.includes(marker), `missing game-engine marker: ${marker}`);

for (const marker of [
  '.world',
  '.clinic',
  '.actionChoices',
  '.latestClue',
  '.modalCard',
  '.signalOrb'
]) assert.ok(css.includes(marker), `missing simplified game-style marker: ${marker}`);

assert.doesNotThrow(() => new Function(js), 'game.js should parse as browser JavaScript');
console.log('Technical Onboarding simplified game QA PASS');
