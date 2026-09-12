import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const files=['0a','0b','0c','0d','1','2a','2b','2c','2d','3','4','5'];
const parts=[];
for (const file of files) {
  const text=(await readFile(new URL(`../tiny-tactics-friends/chunks/${file}.txt`, import.meta.url),'utf8')).trim();
  parts.push(text);
}
const b64=parts.join('');
if (b64.length !== 103404) throw new Error(`Unexpected base64 length: ${b64.length}`);
const compressed=Buffer.from(b64,'base64');
const sha=createHash('sha256').update(compressed).digest('hex');
const html=gunzipSync(compressed).toString('utf8');
if (!html.includes('Tiny Tactics') || !html.includes('Friends RC1')) throw new Error('Unexpected Tiny Tactics build identity');
if (!html.includes('0.20.0-rc.1')) throw new Error('Missing Friends RC1 version identity');
console.log(JSON.stringify({ok:true,sha256:sha,compressedBytes:compressed.length,htmlBytes:Buffer.byteLength(html),identity:'Friends RC1 / 0.20.0-rc.1'},null,2));
