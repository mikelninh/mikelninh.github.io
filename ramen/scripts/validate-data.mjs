import fs from 'node:fs/promises';
import {loadRamenData} from './load-data.mjs';

const data = await loadRamenData();
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
  for (const field of ['id','brand','name','country','style','source','vegan','verificationLevel','verifiedAt','evidence','reason','image','imageSource']) {
    if (!item[field]) errors.push(`${label}: missing ${field}.`);
  }
  if (ids.has(item.id)) errors.push(`${label}: duplicate id.`); else ids.add(item.id);
  if (item.rank == null) errors.push(`${label}: missing rank.`);
  else if (ranks.has(item.rank)) errors.push(`${label}: duplicate rank ${item.rank}.`); else ranks.add(item.rank);
  if (!allowedVegan.has(item.vegan)) errors.push(`${label}: unsupported vegan status ${item.vegan}.`);
  if (!allowedVerification.has(item.verificationLevel)) errors.push(`${label}: unsupported verificationLevel ${item.verificationLevel}.`);
  if (item.verificationLevel === 'needs-germany-review') errors.push(`${label}: individual market review still pending.`);
  if (!item.evidence?.en || !item.evidence?.de) errors.push(`${label}: evidence must contain en and de.`);
  if (!item.reason?.en || !item.reason?.de) errors.push(`${label}: popularity reason must contain en and de.`);
  if (!isHttpUrl(item.source)) errors.push(`${label}: invalid source URL.`);
  if (!isHttpUrl(item.image)) errors.push(`${label}: invalid or missing deterministic image URL.`);
  if (!isHttpUrl(item.imageSource)) errors.push(`${label}: invalid or missing image source URL.`);
  if (item.buy && !isHttpUrl(item.buy)) errors.push(`${label}: invalid buy URL.`);
  if (item.verificationLevel === 'germany-retailer' && !item.buy) errors.push(`${label}: Germany retailer verification requires a direct product/buy URL.`);
  if (item.vegan === 'verified' && !['germany-retailer','official-eu','official-global'].includes(item.verificationLevel)) errors.push(`${label}: vegan-verified claim has no accepted verification tier.`);
  if (item.market?.includes('DE') && !item.gtin) warnings.push(`${label}: German/EU market entry has no GTIN recorded.`);
}

for (let rank = 1; rank <= 50; rank += 1) {
  if (!ranks.has(rank)) errors.push(`Missing popularity seed rank ${rank}.`);
}

const urls = [...new Set(data.flatMap(item => [item.source,item.buy,item.image,item.imageSource].filter(Boolean)))];
const linkResults = await mapLimit(urls, 8, checkUrl);
for (const result of linkResults) {
  if (result.kind === 'error') errors.push(`Broken URL: ${result.url} — ${result.message}`);
  if (result.kind === 'warning') warnings.push(`URL warning: ${result.url} — ${result.message}`);
}

const summary = [
  '# Ramen data release gate',
  '',
  `- Products: ${data.length}`,
  `- Individually reviewed: ${data.filter(x => x.verificationLevel !== 'needs-germany-review').length}`,
  `- Germany/EU checked: ${data.filter(x => ['germany-retailer','official-eu'].includes(x.verificationLevel)).length}`,
  `- Vegan verified: ${data.filter(x => x.vegan === 'verified').length}`,
  `- Not vegan: ${data.filter(x => x.vegan === 'not').length}`,
  `- Check exact pack / vegetarian only: ${data.filter(x => ['check','vegetarian'].includes(x.vegan)).length}`,
  `- Deterministic packshots: ${data.filter(x => x.image && x.imageSource).length}`,
  `- Direct German/product buy links: ${data.filter(x => x.buy).length}`,
  `- Errors: ${errors.length}`,
  `- Warnings: ${warnings.length}`,
  '',
  errors.length ? '## Errors\n' + errors.map(x => `- ${x}`).join('\n') : '## Errors\n- None',
  '',
  warnings.length ? '## Warnings\n' + warnings.slice(0,150).map(x => `- ${x}`).join('\n') : '## Warnings\n- None'
].join('\n');

await fs.writeFile('ramen-validation-report.md', summary + '\n');
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
if (errors.length) process.exit(1);

function isHttpUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; }
  catch { return false; }
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {method:'GET',redirect:'follow',signal:controller.signal,headers:{'user-agent':'Mozilla/5.0 ramen-data-check/2.0','accept':'text/html,image/*,*/*'}});
    if (response.status === 404 || response.status === 410) return {kind:'error',url,message:`HTTP ${response.status}`};
    if (response.status >= 400) return {kind:'warning',url,message:`HTTP ${response.status} (site may block automated checks)`};
    const type = response.headers.get('content-type') || '';
    if (/\.(png|jpe?g|webp)(\?|$)/i.test(url) && !type.startsWith('image/')) return {kind:'warning',url,message:`expected image, received ${type || 'unknown content type'}`};
    return {kind:'ok',url};
  } catch (error) {
    const code = error?.cause?.code || error?.code || '';
    const name = error?.name || '';
    const message = code || name || error?.message || 'fetch failed';
    if (code === 'ETIMEDOUT' || code === 'ECONNRESET' || name === 'AbortError' || name === 'TimeoutError') return {kind:'warning',url,message:`${message} (transient network issue)`};
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
