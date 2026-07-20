import fs from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const baseSource = await fs.readFile(new URL('../../vegan/ramen-data.js', root), 'utf8');
const overrideSource = await fs.readFile(new URL('../germany-overrides.js', root), 'utf8');
const context = {window:{}};
vm.createContext(context);
vm.runInContext(baseSource, context, {filename:'vegan/ramen-data.js'});
vm.runInContext(overrideSource, context, {filename:'ramen/germany-overrides.js'});
const data = context.window.RAMEN_DATA;

const errors = [];
const warnings = [];
const allowedVegan = new Set(['verified','not','check','vegetarian']);
const allowedVerification = new Set(['germany-retailer','official-eu','official-global','needs-germany-review']);
const ids = new Set();
const ranks = new Set();

if (!Array.isArray(data)) errors.push('RAMEN_DATA is not an array.');
if (data.length !== 50) errors.push(`Expected exactly 50 products, found ${data.length}.`);

for (const item of data) {
  const label = `${item.brand || '?'} ${item.name || '?'} (${item.id || 'missing id'})`;
  for (const field of ['id','brand','name','country','style','source','vegan','verificationLevel','evidence']) {
    if (!item[field]) errors.push(`${label}: missing ${field}.`);
  }
  if (ids.has(item.id)) errors.push(`${label}: duplicate id.`); else ids.add(item.id);
  if (item.rank == null) errors.push(`${label}: missing rank.`);
  else if (ranks.has(item.rank)) errors.push(`${label}: duplicate rank ${item.rank}.`); else ranks.add(item.rank);
  if (!allowedVegan.has(item.vegan)) errors.push(`${label}: unsupported vegan status ${item.vegan}.`);
  if (!allowedVerification.has(item.verificationLevel)) errors.push(`${label}: unsupported verificationLevel ${item.verificationLevel}.`);
  if (!item.evidence?.en || !item.evidence?.de) errors.push(`${label}: evidence must contain en and de.`);
  if (!isHttpUrl(item.source)) errors.push(`${label}: invalid source URL.`);
  if (item.buy && !isHttpUrl(item.buy)) errors.push(`${label}: invalid buy URL.`);
  if (item.image && !isHttpUrl(item.image)) errors.push(`${label}: invalid image URL.`);
  if (item.vegan === 'verified' && !item.verifiedAt) errors.push(`${label}: vegan verified without verifiedAt.`);
  if (item.verificationLevel === 'germany-retailer' && !item.buy) errors.push(`${label}: Germany retailer verification requires a buy/product URL.`);
  if (item.verificationLevel === 'needs-germany-review') warnings.push(`${label}: Germany review still pending.`);
  if (!item.image) warnings.push(`${label}: no deterministic packshot; UI will attempt Open Food Facts and then show an illustration.`);
}

const urls = [...new Set(data.flatMap(item => [item.source,item.buy,item.image].filter(Boolean)))];
const linkResults = await mapLimit(urls, 8, checkUrl);
for (const result of linkResults) {
  if (result.kind === 'error') errors.push(`Broken URL: ${result.url} — ${result.message}`);
  if (result.kind === 'warning') warnings.push(`URL warning: ${result.url} — ${result.message}`);
}

const summary = [
  '# Ramen data release gate',
  '',
  `- Products: ${data.length}`,
  `- Germany checked: ${data.filter(x => ['germany-retailer','official-eu'].includes(x.verificationLevel)).length}`,
  `- Vegan verified: ${data.filter(x => x.vegan === 'verified').length}`,
  `- Deterministic images: ${data.filter(x => x.image).length}`,
  `- Errors: ${errors.length}`,
  `- Warnings: ${warnings.length}`,
  '',
  errors.length ? '## Errors\n' + errors.map(x => `- ${x}`).join('\n') : '## Errors\n- None',
  '',
  warnings.length ? '## Warnings\n' + warnings.slice(0,100).map(x => `- ${x}`).join('\n') : '## Warnings\n- None'
].join('\n');

console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
if (errors.length) process.exit(1);

function isHttpUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; }
  catch { return false; }
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {method:'GET',redirect:'follow',signal:controller.signal,headers:{'user-agent':'Mozilla/5.0 ramen-data-check/1.0','accept':'text/html,image/*,*/*'}});
    if (response.status === 404 || response.status === 410) return {kind:'error',url,message:`HTTP ${response.status}`};
    if (response.status >= 400) return {kind:'warning',url,message:`HTTP ${response.status} (site may block automated checks)`};
    const type = response.headers.get('content-type') || '';
    if (/\.(png|jpe?g|webp)(\?|$)/i.test(url) && !type.startsWith('image/')) return {kind:'warning',url,message:`expected image, received ${type || 'unknown content type'}`};
    return {kind:'ok',url};
  } catch (error) {
    const message = error?.cause?.code || error?.name || error?.message || 'fetch failed';
    return {kind:'error',url,message};
  } finally { clearTimeout(timeout); }
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},run));
  return results;
}