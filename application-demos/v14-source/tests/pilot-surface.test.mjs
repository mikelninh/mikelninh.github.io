import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const here=new URL('../public/',import.meta.url);
test('customer pilot includes clear workflow, local-data pledge and review controls',()=>{
 const html=readFileSync(new URL('pilot.html',here),'utf8');
 for(const id of ['sample','file','template','workspace','predictions','evidence','accept','correct','escalate','export','prev','next'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/type="module"/);assert.match(html,/\.\/pilot-engine\.mjs/);assert.match(html,/Stichwort-Baseline/);assert.match(html,/keine Kunden angeschrieben/);assert.doesNotMatch(html,/<form[^>]*action=/i);
});
test('public static mirror matches Vercel pilot exactly',()=>{
 const source=readFileSync(new URL('pilot.html',here),'utf8');
 const mirror=readFileSync(new URL('../../v14/pilot.html',here),'utf8');
 const sourceEngine=readFileSync(new URL('pilot-engine.mjs',here),'utf8');
 const mirrorEngine=readFileSync(new URL('../../v14/pilot-engine.mjs',here),'utf8');
 assert.equal(source,mirror);assert.equal(sourceEngine,mirrorEngine);
});
