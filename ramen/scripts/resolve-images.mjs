import fs from 'node:fs/promises';
import {loadRamenData} from './load-data.mjs';

const data = await loadRamenData();

const missing = data.filter(item => !item.image);
const results = [];

for (let index = 0; index < missing.length; index++) {
  const item = missing[index];
  console.log(`[${index + 1}/${missing.length}] ${item.brand} ${item.name}`);
  const candidates = [];

  if (item.gtin) {
    const exactOff = await exactOpenFoodFacts(item.gtin);
    if (exactOff) candidates.push(exactOff);
  }

  for (const pageUrl of [...new Set([item.source,item.buy].filter(Boolean))]) {
    const sourceImage = await imageFromPage(pageUrl);
    if (sourceImage) candidates.push(sourceImage);
  }

  const offImages = await searchOpenFoodFacts(item);
  candidates.push(...offImages);

  const checked = [];
  for (const candidate of uniqueBy(candidates, value => value.url)) {
    const validation = await validateImage(candidate.url);
    const matchScore = scoreCandidate(item, candidate);
    checked.push({...candidate, ...validation, matchScore});
  }

  checked.sort((a,b) => {
    const usable = Number(b.usable) - Number(a.usable);
    if (usable) return usable;
    return b.matchScore - a.matchScore;
  });

  const accepted = checked.find(candidate => candidate.usable && candidate.matchScore >= 7) || null;
  results.push({
    id:item.id,
    rank:item.rank,
    brand:item.brand,
    name:item.name,
    query:item.imageQuery,
    source:item.source,
    buy:item.buy,
    accepted,
    candidates:checked.slice(0,5)
  });
}

const report = {
  generatedAt:new Date().toISOString(),
  total:data.length,
  deterministicBefore:data.filter(item => item.image).length,
  attempted:missing.length,
  accepted:results.filter(item => item.accepted).length,
  unresolved:results.filter(item => !item.accepted).map(item => ({id:item.id,brand:item.brand,name:item.name,candidates:item.candidates})),
  results
};

await fs.writeFile('ramen-image-resolution-report.json', JSON.stringify(report,null,2));
await fs.writeFile('ramen-image-overrides.generated.js', createOverrides(report));

const summary = [
  '# Ramen packshot resolver',
  '',
  `- Deterministic before: ${report.deterministicBefore}/${report.total}`,
  `- Missing attempted: ${report.attempted}`,
  `- High-confidence images found: ${report.accepted}`,
  `- Still unresolved: ${report.unresolved.length}`,
  '',
  '## Accepted',
  ...results.filter(x=>x.accepted).map(x=>`- ${x.brand} ${x.name}: ${x.accepted.origin} · score ${x.accepted.matchScore} · ${x.accepted.url}`),
  '',
  '## Unresolved',
  ...report.unresolved.map(x=>`- ${x.brand} ${x.name}`)
].join('\n');
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, '\n' + summary + '\n');

async function exactOpenFoodFacts(gtin) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(gtin)}.json?fields=code,product_name,brands,image_front_url,image_front_small_url,image_url`;
  const response = await safeFetch(url);
  if (!response?.ok) return null;
  const payload = await response.json();
  const product = payload.product;
  const image = product && (product.image_front_url || product.image_front_small_url || product.image_url);
  return image ? {url:image,source:`https://world.openfoodfacts.org/product/${product.code || gtin}`,origin:'open-food-facts-exact',title:`${product.brands || ''} ${product.product_name || ''}`} : null;
}

async function searchOpenFoodFacts(item) {
  const terms = [item.imageQuery, `${item.brand} ${item.name}`, item.gtin].filter(Boolean);
  const output = [];
  for (const term of terms) {
    const fields = 'code,product_name,brands,image_front_url,image_front_small_url,image_url';
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&json=1&page_size=20&fields=${fields}`;
    const response = await safeFetch(url);
    if (!response?.ok) continue;
    const payload = await response.json();
    for (const product of payload.products || []) {
      const image = product.image_front_url || product.image_front_small_url || product.image_url;
      if (!image) continue;
      output.push({
        url:image,
        source:product.code ? `https://world.openfoodfacts.org/product/${product.code}` : 'https://world.openfoodfacts.org/',
        origin:'open-food-facts-search',
        title:`${product.brands || ''} ${product.product_name || ''}`,
        code:product.code || null
      });
    }
  }
  return output;
}

async function imageFromPage(pageUrl) {
  const response = await safeFetch(pageUrl);
  if (!response?.ok) return null;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return null;
  const html = await response.text();
  const values = [
    matchMeta(html,'property','og:image'),
    matchMeta(html,'name','twitter:image'),
    matchLinkImage(html),
    matchJsonLdImage(html)
  ].filter(Boolean);
  for (const value of values) {
    try {
      const url = new URL(decodeEntities(value), pageUrl).href;
      return {url,source:pageUrl,origin:'source-page',title:pageTitle(html)};
    } catch {}
  }
  return null;
}

function matchMeta(html, attribute, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+${attribute}=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${escaped}["'][^>]*>`, 'i')
  ];
  for (const pattern of patterns) { const match=html.match(pattern); if (match) return match[1]; }
  return null;
}

function matchLinkImage(html) {
  const match = html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i) || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']image_src["']/i);
  return match?.[1] || null;
}

function matchJsonLdImage(html) {
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(match[1].trim());
      const nodes = Array.isArray(json) ? json : [json];
      for (const node of nodes) {
        const image = node?.image;
        if (typeof image === 'string') return image;
        if (Array.isArray(image) && typeof image[0] === 'string') return image[0];
        if (image?.url) return image.url;
      }
    } catch {}
  }
  return null;
}

function pageTitle(html) {
  const og = matchMeta(html,'property','og:title');
  if (og) return decodeEntities(og);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title ? decodeEntities(title.replace(/\s+/g,' ').trim()) : '';
}

async function validateImage(url) {
  const response = await safeFetch(url, {headers:{accept:'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}});
  if (!response) return {usable:false,status:null,contentType:null,error:'request failed'};
  const type = response.headers.get('content-type') || '';
  const length = Number(response.headers.get('content-length') || 0);
  const usable = response.ok && type.startsWith('image/') && (length === 0 || length > 3000);
  return {usable,status:response.status,contentType:type,contentLength:length};
}

function scoreCandidate(item, candidate) {
  const desired = normalize(`${item.brand} ${item.name} ${item.imageQuery || ''}`);
  const candidateText = normalize(`${candidate.title || ''} ${candidate.url}`);
  const tokens = [...new Set(desired.split(' ').filter(token => token.length > 2))];
  let score = tokens.reduce((sum,token)=>sum+(candidateText.includes(token)?2:0),0);
  const brandTokens = normalize(item.brand).split(' ').filter(token=>token.length>2);
  if (brandTokens.some(token=>candidateText.includes(token))) score += 5;
  if (item.gtin && `${candidate.code || ''} ${candidate.url}`.includes(item.gtin)) score += 12;
  if (candidate.origin === 'source-page') score += 5;
  if (/logo|banner|icon|avatar|social|og-default|header/i.test(candidate.url)) score -= 12;
  return score;
}

function normalize(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}

function decodeEntities(value) {
  return String(value).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}

async function safeFetch(url, options={}) {
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),15000);
  try {
    return await fetch(url,{redirect:'follow',signal:controller.signal,headers:{'user-agent':'Mozilla/5.0 ramen-image-audit/1.0',...(options.headers||{})},...options});
  } catch { return null; }
  finally { clearTimeout(timeout); }
}

function uniqueBy(values, key) {
  const seen = new Set();
  return values.filter(value => { const id=key(value); if (!id||seen.has(id)) return false; seen.add(id); return true; });
}

function createOverrides(report) {
  const rows = report.results.filter(item=>item.accepted).map(item => `  '${item.id}': {\n    image: ${JSON.stringify(item.accepted.url)},\n    imageSource: ${JSON.stringify(item.accepted.source)}\n  }`);
  return `// Generated by ramen/scripts/resolve-images.mjs. Review product matches before merging.\nwindow.RAMEN_IMAGE_CANDIDATES = {\n${rows.join(',\n')}\n};\n`;
}