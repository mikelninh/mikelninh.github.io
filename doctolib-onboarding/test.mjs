import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('./game.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./game.css',import.meta.url),'utf8');
const academy=fs.readFileSync(new URL('./academy/index.html',import.meta.url),'utf8');

for(const m of [
  'cinematicStage','scene-room-phone','scene-room-route','scene-room-ai',
  'scene-room-reception','signalTrack','controlDock','messageCard','floatingNotebook',
  'dossierModal','dossierBtn','reflectionInput','portfolioReadyBtn','downloadDossierBtn'
]) assert.ok(html.includes(m),`missing game/evidence UI marker: ${m}`);

for(const m of [
  'BROKEN_VARIANTS','renderWorld','runSignal','applyPlan','verifyPlan','finishMission',
  'caseActionIds','buildRunRecord','dossierMarkdown','saveRun','RUNS_KEY',
  'portfolioReady','downloadDossier'
]) assert.ok(js.includes(m),`missing engine/evidence marker: ${m}`);

for(const m of [
  '.practice','.upperFloor','.roomRoute','.aiBot','.controlDock','.messageCard',
  '.dossierCard','.dossierGrid','.evidenceStatus'
]) assert.ok(css.includes(m),`missing visual/evidence style marker: ${m}`);

for(const m of [
  'YOUR TRAINING EVIDENCE','runStats','runHistory','onboardingShiftRuns',
  'Case Dossier','proof-pack/case-dossier.md'
]) assert.ok(academy.includes(m),`missing academy evidence marker: ${m}`);

assert.doesNotThrow(()=>new Function(js),'game.js should parse');
assert.ok(html.includes('no official Doctolib product UI or data'));
console.log('Onboarding Shift + Academy evidence loop QA PASS');
