import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('./game.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./game.css',import.meta.url),'utf8');

for(const m of ['clinicScene','scene-room-phone','scene-room-route','scene-room-ai','scene-room-reception','signalPath','patientQueue','What do you do?','Notebook','Make the call']) assert.ok(html.includes(m),`missing authored scene marker: ${m}`);
for(const m of ['BROKEN_VARIANTS','renderScene','runSignal','applyPlan','verifyPlan','finishMission','caseActionIds']) assert.ok(js.includes(m),`missing game engine marker: ${m}`);
for(const m of ['.clinicScene','.sceneRoom','.speechBubble','.actionDock','.signalPath','.npc']) assert.ok(css.includes(m),`missing art-direction style marker: ${m}`);
assert.doesNotThrow(()=>new Function(js),'game.js should parse');
assert.ok(html.includes('no official Doctolib product UI or data'));
console.log('Onboarding Shift authored-diorama QA PASS');