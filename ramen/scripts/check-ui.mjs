import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve('ramen');
const html = await fs.readFile(path.join(root,'index.html'),'utf8');
const errors = [];
const warnings = [];

for (const match of html.matchAll(/<(script|link)[^>]+(?:src|href)=["']([^"']+)["']/g)) {
  const value = match[2];
  if (/^(https?:|#|mailto:)/.test(value)) continue;
  const resolved = path.resolve(root,value.split('?')[0]);
  try { await fs.access(resolved); }
  catch { errors.push(`Missing local asset referenced by index.html: ${value}`); }
}

const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(match=>match[1]);
for (const id of new Set(ids)) {
  const count = ids.filter(value=>value===id).length;
  if (count > 1) errors.push(`Duplicate HTML id: ${id} (${count} occurrences)`);
}

for (const file of ['app.js','ux-v2.js','quick-rank.js','germany-overrides.js','germany-round2.js','germany-round3.js','germany-round4.js','image-round4.js','source-fixes.js']) {
  const source = await fs.readFile(path.join(root,file),'utf8');
  try { new vm.Script(source,{filename:file}); }
  catch (error) { errors.push(`${file}: ${error.message}`); }
}

const quick = await fs.readFile(path.join(root,'quick-rank.js'),'utf8');
for (const required of ['data-quick-tier','quickChallenge','downloadCard','openNote','challengePayload','michael-ramen-tasting-notes-v1']) {
  if (!quick.includes(required)) errors.push(`quick-rank.js is missing required interaction marker: ${required}`);
}

const css = await fs.readFile(path.join(root,'quick-rank.css'),'utf8');
for (const selector of ['.quick-rank','.quick-stage','.quick-tier','.note-modal','body[data-ramen-view="quick"]']) {
  if (!css.includes(selector)) errors.push(`quick-rank.css is missing required selector: ${selector}`);
}

if (!html.includes('quick-rank.css') || !html.includes('quick-rank.js')) errors.push('Quick-rank assets are not loaded by index.html.');
if (html.indexOf('quick-rank.js') < html.indexOf('app.js')) errors.push('quick-rank.js must load after app.js.');
if (!html.includes('data-en=') || !html.includes('data-de=')) warnings.push('Bilingual page markers were not detected.');

const summary = [
  '# Ramen UI smoke check',
  '',
  `- Errors: ${errors.length}`,
  `- Warnings: ${warnings.length}`,
  '',
  errors.length ? `## Errors\n${errors.map(item=>`- ${item}`).join('\n')}` : '## Errors\n- None',
  '',
  warnings.length ? `## Warnings\n${warnings.map(item=>`- ${item}`).join('\n')}` : '## Warnings\n- None'
].join('\n');

console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,summary+'\n');
if (errors.length) process.exit(1);
