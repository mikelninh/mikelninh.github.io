#!/usr/bin/env node
// The Way registry and frontend contract checks: no external packages.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('.',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,root),'utf8');
const ctx={window:{}};vm.runInNewContext(read('conflicts.js'),ctx,{filename:'conflicts.js'});
const {WAY_META:meta,WAY_CONFLICTS:rows,WAY_SOURCES:sources}=ctx.window;
assert.ok(meta && /^\d{4}-\d{2}-\d{2}$/.test(meta.reviewed));
assert.ok(Array.isArray(rows) && rows.length>=45,'At least 45 broad geographic theatres required');
const set=new Set(),types={fighting:0,violence:0,risk:0};
const missing=[];
for(const x of rows){
 assert.ok(/^[a-z0-9-]+$/.test(x.id),'Stable slug');
 assert.ok(!set.has(x.id),'Duplicate '+x.id);set.add(x.id);
 assert.ok(Object.hasOwn(types,x.kind),'Known category '+x.kind);types[x.kind]++;
 assert.ok(Number.isFinite(x.lat)&&Math.abs(x.lat)<=90,'Latitude '+x.id);
 assert.ok(Number.isFinite(x.lng)&&Math.abs(x.lng)<=180,'Longitude '+x.id);
 assert.ok(x.locationPrecision==='theatre-level anchor');
 assert.ok(x.reviewed===meta.reviewed);
 for(const k of ['title','region','location','actors','drivers','human','barrier','path','measure']){
  assert.ok(typeof x[k]==='string'&&x[k].trim().length>=(['title','region','location'].includes(k)?3:20),k+' missing on '+x.id)
 }
 assert.ok(Array.isArray(x.sources)&&x.sources.length>=1,'Citation required for '+x.id);
 for(const k of x.sources){assert.ok(sources[k],x.id+' references unknown '+k)}
}
for(const s of Object.values(sources)){assert.ok(new URL(s.url).protocol==='https:','Sources must use HTTPS')}
assert.ok(types.fighting&&types.violence&&types.risk,'Classification must not conflate conflict with tensions');
const html=read('index.html'),css=read('style.css'),js=read('app.js');
for(const id of ['map','conflict-list','dossier','search','type-filters','region','news-list','map-fallback','atlas-last-reviewed','download-json']){
 assert.ok(html.includes('id="'+id+'"'),'Missing DOM anchor '+id)
}
assert.ok(js.includes('openstreetmap.org/copyright'),'OSM attribution exists');
assert.ok(js.includes('basemaps.cartocdn.com'),'Real geographic tile service');
assert.ok(js.includes('NOT geolocated incidents')===false,'A headline must never be described as a geolocated incident');
assert.ok(!/location\.geolocation|navigator\.geolocation|localStorage|document\.cookie/i.test(js),'No user geo or persistent tracking');
assert.ok(css.includes('@media(max-width:520px)'),'Mobile breakpoint');
assert.ok(css.includes('prefers-reduced-motion'),'Accessible reduced-motion styles');
new vm.Script(js,{filename:'app.js'});
console.log(JSON.stringify({status:'PASS',anchors:rows.length,categories:types,sourceRegistries:Object.keys(sources).length,coordinates:'valid',js:'valid',method:'geographic theatre anchors only'}));
