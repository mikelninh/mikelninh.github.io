(function(global){
'use strict';
const base=(typeof module!=='undefined'&&module.exports)?require('./puzzle-core-v12.js'):global.PuzzleCoreV12;
if(!base)return;
const FILES='abcdefgh';
function sqToXY(s){return[FILES.indexOf(s[0]),Number(s[1])-1]}
function xyToSq(x,y){return FILES[x]+(y+1)}
function mapSq(s,mode){if(!s||s==='-')return s;let[x,y]=sqToXY(s);if(mode==='h')x=7-x;else if(mode==='rs'){x=7-x;y=7-y}else if(mode==='vs')y=7-y;return xyToSq(x,y)}
function mapUci(u,mode){if(!u||u.length<4)return u;return mapSq(u.slice(0,2),mode)+mapSq(u.slice(2,4),mode)+(u.slice(4)||'')}
function expandRank(row){const out=[];for(const c of row){if(/\d/.test(c))for(let i=0;i<Number(c);i++)out.push(null);else out.push(c)}return out}
function compressRank(row){let out='',n=0;for(const c of row){if(!c)n++;else{if(n){out+=n;n=0}out+=c}}if(n)out+=n;return out}
function swapPiece(c){return c?(c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()):c}
function mapFen(fen,mode){
 const parts=String(fen).trim().split(/\s+/);if(parts.length<4||parts[2]!=='-')return null;
 const rows=parts[0].split('/').map(expandRank),grid=Array.from({length:8},()=>Array(8).fill(null)),swap=mode==='rs'||mode==='vs';
 for(let ri=0;ri<8;ri++)for(let x=0;x<8;x++){const y=7-ri,ns=mapSq(xyToSq(x,y),mode),[nx,ny]=sqToXY(ns);grid[7-ny][nx]=swap?swapPiece(rows[ri][x]):rows[ri][x]}
 parts[0]=grid.map(compressRank).join('/');if(swap)parts[1]=parts[1]==='w'?'b':'w';parts[3]=mapSq(parts[3],mode);return parts.join(' ')
}
function variant(p,mode){const fen=mapFen(p.fen,mode);if(!fen)return null;return{...p,id:`${p.id}-${mode}`,fen,line:(p.line||[]).map(u=>mapUci(u,mode)),variantOf:p.id}}
function expand(pool=base.PUZZLES){const out=[];for(const p of pool){out.push({...p});for(const m of ['h','rs','vs']){const v=variant(p,m);if(v)out.push(v)}}const seen=new Set;return out.filter(p=>{const k=p.fen+'|'+(p.line||[]).join(',');if(seen.has(k))return false;seen.add(k);return true})}
const PACK=expand(base.PUZZLES);
if(typeof window!=='undefined'&&global.PuzzleCoreV12){global.PuzzleCoreV12.PUZZLES.splice(0,global.PuzzleCoreV12.PUZZLES.length,...PACK);global.PuzzlePackV15={PACK,mapSq,mapUci,mapFen,expand}}
if(typeof module!=='undefined'&&module.exports)module.exports={PACK,mapSq,mapUci,mapFen,expand};
})(typeof window!=='undefined'?window:globalThis);
