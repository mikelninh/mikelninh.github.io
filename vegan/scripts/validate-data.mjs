import fs from 'node:fs/promises';
import vm from 'node:vm';

const file = new URL('../ramen-data.js', import.meta.url);
const source = await fs.readFile(file, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: file.pathname });

const products = sandbox.window.RAMEN_DATA;
const errors = [];
const warnings = [];

if (!Array.isArray(products)) errors.push('window.RAMEN_DATA must be an array.');
if (products?.length !== 50) errors.push(`Expected exactly 50 ramen products, found ${products?.length ?? 0}.`);

const required = ['rank','id','brand','name','country','style','spice','vegan','source','imageQuery','evidence','reason'];
const validVegan = new Set(['verified','not','vegetarian','check']);
const ids = new Set();
const ranks = new Set();

for (const [index, product] of (products || []).entries()) {
  const label = product?.id || `row-${index + 1}`;
  for (const key of required) {
    if (product?.[key] === undefined || product?.[key] === null || product?.[key] === '') {
      errors.push(`${label}: missing required field '${key}'.`);
    }
  }
  if (ids.has(product.id)) errors.push(`${label}: duplicate id.`);
  ids.add(product.id);
  if (ranks.has(product.rank)) errors.push(`${label}: duplicate popularity rank ${product.rank}.`);
  ranks.add(product.rank);
  if (!validVegan.has(product.vegan)) errors.push(`${label}: invalid vegan status '${product.vegan}'.`);
  if (!Number.isInteger(product.spice) || product.spice < 0 || product.spice > 5) errors.push(`${label}: spice must be an integer from 0 to 5.`);
  if (!product.evidence?.en || !product.evidence?.de) errors.push(`${label}: evidence must exist in EN and DE.`);
  if (!product.reason?.en || !product.reason?.de) errors.push(`${label}: popularity reason must exist in EN and DE.`);
  for (const field of ['source','image','buy']) {
    if (!product[field]) {
      const message = `${label}: missing ${field} URL.`;
      if (field === 'source') errors.push(message); else warnings.push(message);
      continue;
    }
    try {
      const url = new URL(product[field]);
      if (!['http:','https:'].includes(url.protocol)) errors.push(`${label}: ${field} must be http(s).`);
    } catch {
      errors.push(`${label}: invalid ${field} URL '${product[field]}'.`);
    }
  }
  if (!product.market) warnings.push(`${label}: missing market; Germany-first records should use market:'DE'.`);
  if (!product.sourceType) warnings.push(`${label}: missing sourceType (official, retailer-DE, database, editorial).`);
  if (!product.lastChecked) warnings.push(`${label}: missing lastChecked date.`);
}

for (let rank = 1; rank <= 50; rank += 1) {
  if (!ranks.has(rank)) errors.push(`Missing popularity rank ${rank}.`);
}

console.log(`Checked ${products?.length ?? 0} ramen records.`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log(`PASS with ${warnings.length} warning(s).`);
