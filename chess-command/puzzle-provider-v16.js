(function(){
'use strict';
const C=window.ChessCore,P=window.PuzzleCoreV12,RAW=window.LICHESS_PUZZLE_PACK_V16||[];
if(!C||!P)return;
const HISTORY_KEY='chess-command-puzzle-history-v16';
const copy=x=>JSON.parse(JSON.stringify(x));
const hint={
 'Mate':'Start with forcing checks. Remove escape squares one by one.',
 'Fork':'Look for one move that attacks two valuable targets at once.',
 'Pin':'Find the piece that cannot move without exposing something more valuable.',
 'Skewer':'Can you attack the valuable piece first and win what sits behind it?',
 'Hanging piece':'Before calculating deeply, scan for undefended or overloaded pieces.',
 'Deflection':'Which defender must be dragged away from its job?',
 'Removing defender':'Identify the key defender, then ask whether you can exchange or distract it.',
 'Defense':'You are under pressure. Look for checks, captures, blocks and simplification.',
 'Discovered attack':'Which piece can move with tempo while uncovering an attack behind it?'
};
const explain={
 'Mate':'The forcing sequence works because every move reduces the king’s safe choices.',
 'Fork':'The key move creates simultaneous threats. Notice which two targets cannot both be saved.',
 'Pin':'The pinned piece is restricted by what stands behind it. That restriction makes the tactic work.',
 'Skewer':'The more valuable target is forced away first, exposing the piece behind it.',
 'Hanging piece':'The position rewards a loose-piece scan before deeper calculation.',
 'Deflection':'The tactic succeeds by pulling a defender away from the square or piece it must protect.',
 'Removing defender':'Once the critical defender disappears, the target can no longer hold.',
 'Defense':'The best move neutralises the immediate threat before trying to improve anything else.',
 'Discovered attack':'Moving the front piece reveals a second line of attack, creating two jobs for the opponent at once.'
};
function loadHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch{return[]}}
let longSeen=loadHistory();
function remember(id){if(!id)return;longSeen=[id,...longSeen.filter(x=>x!==id)].slice(0,1200);try{localStorage.setItem(HISTORY_KEY,JSON.stringify(longSeen))}catch{}}
function normalize(row){
 if(!Array.isArray(row)||row.length<6)return null;
 const [id,fen,movesS,rating,theme,popularity]=row,moves=String(movesS||'').trim().split(/\s+/).filter(Boolean);
 if(moves.length<2)return null;
 let s=C.fromFEN(fen);if(!s)return null;
 s=C.make(s,moves[0]);if(!s)return null;
 const line=moves.slice(1);
 // Generated workflow validates the full line. Keep a cheap runtime guard for stale/corrupt caches.
 let check=copy(s);for(const u of line){check=C.make(check,u);if(!check)return null}
 return {id:'li-'+id,source:'lichess',sourceId:id,title:theme,theme,rating:Number(rating)||800,fen:C.fen(s),line,popularity:Number(popularity)||0,hint:hint[theme]||'Start with checks, captures and threats.',explain:explain[theme]||'Replay the line and name the tactical idea in your own words.'};
}
const added=[];for(const row of RAW){const p=normalize(row);if(p)added.push(p)}
if(added.length){
 const existing=new Set(P.PUZZLES.map(x=>x.id));for(const p of added)if(!existing.has(p.id))P.PUZZLES.push(p);
}
// Prefer unseen positions across sessions. Once the user has chewed through a large portion,
// gracefully fall back to the original rating/theme selector rather than dead-ending.
const originalChoose=P.choose.bind(P);
P.choose=function(pool,opt={}){
 const mergedSeen=new Set([...(opt.seen||[]),...longSeen]);
 let candidate=pool.filter(x=>!mergedSeen.has(x.id));
 if(candidate.length<Math.min(25,Math.max(5,Math.floor(pool.length*.08))))candidate=pool;
 const chosen=originalChoose(candidate,{...opt,seen:[...(opt.seen||[]),...longSeen]});
 if(chosen)remember(chosen.id);
 return chosen;
};
window.ChessPuzzleProviderV16={count:added.length,total:P.PUZZLES.length,history:()=>[...longSeen]};
document.dispatchEvent(new CustomEvent('cc:puzzlepack',{detail:{source:'lichess-cc0',added:added.length,total:P.PUZZLES.length}}));
})();
