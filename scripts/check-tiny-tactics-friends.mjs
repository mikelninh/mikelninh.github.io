import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const files=['0a','0b','0c','0d','1','2a','2b0','2b1a','2b1b','2c','2d','3','4','5'];
const parts=[];
for (const file of files) {
  const text=(await readFile(new URL(`../tiny-tactics-friends/chunks/${file}.txt`, import.meta.url),'utf8')).trim();
  parts.push(text);
}
const b64=parts.join('');
if (b64.length !== 103404) throw new Error(`Unexpected base64 length: ${b64.length}`);
const compressed=Buffer.from(b64,'base64');
const compressedSha=createHash('sha256').update(compressed).digest('hex');
const htmlBuffer=gunzipSync(compressed);
const htmlSha=createHash('sha256').update(htmlBuffer).digest('hex');
if (htmlSha !== '132745cbc76323cebfe7a19ff0efc6a432c485aa2d03bd95d575c306ed24ce07') throw new Error(`Unexpected HTML SHA-256: ${htmlSha}`);
const html=htmlBuffer.toString('utf8');
if (!html.includes('Tiny Tactics') || !html.includes('Friends RC1')) throw new Error('Unexpected Tiny Tactics build identity');
console.log(JSON.stringify({ok:true,compressedSha256:compressedSha,htmlSha256:htmlSha,compressedBytes:compressed.length,htmlBytes:htmlBuffer.length,identity:'Tiny Tactics · Friends RC1'},null,2));
