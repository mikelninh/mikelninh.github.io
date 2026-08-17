(function(global){
const FILES='abcdef';
const MAIN=[
 {id:'L',z:2,x0:1,y0:1,w:4,h:4,label:'WHITE MAIN'},
 {id:'N',z:4,x0:1,y0:3,w:4,h:4,label:'NEUTRAL MAIN'},
 {id:'H',z:6,x0:1,y0:5,w:4,h:4,label:'BLACK MAIN'}
];
const POSTS=[{r:1,z:2},{r:3,z:4},{r:4,z:2},{r:5,z:6},{r:6,z:4},{r:8,z:6}];
const PIECE_SYMBOL={wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'};
const k=(x,y,z)=>`${FILES[x]}${y}@${z}`;
const parse=k0=>({x:FILES.indexOf(k0[0]),y:parseInt(k0.slice(1,k0.indexOf('@')),10),z:parseInt(k0.slice(k0.indexOf('@')+1),10)});
const clone=o=>JSON.parse(JSON.stringify(o));
function postFor(rank,z){return POSTS.find(p=>p.r===rank&&p.z===z)}
function lowerEdge(rank){return [1,3,5].includes(rank)}
function abSquares(ab){
 const x=ab.kind==='Q'?1:4, ys=lowerEdge(ab.anchor.r)?[ab.anchor.r-1,ab.anchor.r]:[ab.anchor.r,ab.anchor.r+1];
 const xs=ab.kind==='Q'?[0,1]:[4,5], z=ab.anchor.z+(ab.inverted?-1:1);
 return [{x:xs[0],y:ys[0],z},{x:xs[1],y:ys[0],z},{x:xs[0],y:ys[1],z},{x:xs[1],y:ys[1],z}];
}
function boardSquares(state){
 const out=[];
 MAIN.forEach(b=>{for(let y=b.y0;y<b.y0+b.h;y++)for(let x=b.x0;x<b.x0+b.w;x++)out.push({x,y,z:b.z,board:b.id,type:'main'})});
 state.abs.forEach(ab=>abSquares(ab).forEach((s,i)=>out.push({...s,board:ab.id,type:'attack',local:i})));
 return out;
}
function start(){
 const s={turn:'w',pieces:{},abs:[
  {id:'WQ',kind:'Q',owner:'w',anchor:{r:1,z:2},inverted:false},
  {id:'WK',kind:'K',owner:'w',anchor:{r:1,z:2},inverted:false},
  {id:'BQ',kind:'Q',owner:'b',anchor:{r:8,z:6},inverted:false},
  {id:'BK',kind:'K',owner:'b',anchor:{r:8,z:6},inverted:false}
 ],moved:{},last:null,rookPawnOption:true,winner:null,history:[]};
 function put(file,rank,z,p){s.pieces[`${file}${rank}@${z}`]=p}
 put('b',1,2,'wN');put('c',1,2,'wB');put('d',1,2,'wB');put('e',1,2,'wN');
 ['b','c','d','e'].forEach(f=>put(f,2,2,'wP'));
 put('a',0,3,'wR');put('b',0,3,'wQ');put('a',1,3,'wP');put('b',1,3,'wP');
 put('e',0,3,'wK');put('f',0,3,'wR');put('e',1,3,'wP');put('f',1,3,'wP');
 put('b',8,6,'bN');put('c',8,6,'bB');put('d',8,6,'bB');put('e',8,6,'bN');
 ['b','c','d','e'].forEach(f=>put(f,7,6,'bP'));
 put('a',9,7,'bR');put('b',9,7,'bQ');put('a',8,7,'bP');put('b',8,7,'bP');
 put('e',9,7,'bK');put('f',9,7,'bR');put('e',8,7,'bP');put('f',8,7,'bP');
 return s;
}
function squaresAt(state,x,y,maxZ=99){return boardSquares(state).filter(s=>s.x===x&&s.y===y&&s.z<=maxZ).sort((a,b)=>b.z-a.z)}
function squareExists(state,c){return boardSquares(state).some(s=>s.x===c.x&&s.y===c.y&&s.z===c.z)}
function pieceAt(state,c){return state.pieces[k(c.x,c.y,c.z)]||null}
function projectedSteps(a,b){
 const dx=b.x-a.x,dy=b.y-a.y,adx=Math.abs(dx),ady=Math.abs(dy);let n=Math.max(adx,ady);if(!n)return [];
 const sx=dx===0?0:dx/adx, sy=dy===0?0:dy/ady;if(!(dx===0||dy===0||adx===ady))return null;
 const arr=[];for(let i=1;i<=n;i++)arr.push({x:a.x+sx*i,y:a.y+sy*i});return arr;
}
function highestPath(state,a,b,cutoff){const proj=projectedSteps(a,b);if(!proj)return null;const out=[];for(let i=0;i<proj.length;i++){if(i===proj.length-1){if(b.z>cutoff)return null;out.push({...b});continue}const opts=squaresAt(state,proj[i].x,proj[i].y,cutoff);if(!opts.length)return null;out.push(opts[0])}return out}
function pathClear(state,a,b,knight=false){if(knight)return true;const high=Math.max(a.z,b.z),paths=[];const A=highestPath(state,a,b,high);if(A)paths.push(A);const projected=projectedSteps(a,b)||[];if([2,4,6].includes(high)){const hasAB=projected.some(p=>boardSquares(state).some(s=>s.type==='attack'&&s.z===high+1&&s.x===p.x&&s.y===p.y));if(hasAB){const B=highestPath(state,a,b,high+1);if(B)paths.push(B)}}return paths.some(path=>path.slice(0,-1).every(c=>!pieceAt(state,c)))}
function rookPawnSideMove(state,a,b,color,capture){if(!state.rookPawnOption||![0,5].includes(a.x))return false;const inward=a.x===0?1:-1,dx=b.x-a.x,dy=b.y-a.y;if(capture)return dx===inward&&Math.abs(dy)===1;const first=!state.moved[k(a.x,a.y,a.z)];return dy===0&&dx===inward*(first?Math.min(Math.abs(dx),2):1)&&Math.abs(dx)<=(first?2:1)}
function basicShape(state,p,a,b,forAttack=false){const type=p[1],color=p[0],dx=b.x-a.x,dy=b.y-a.y,adx=Math.abs(dx),ady=Math.abs(dy);if(dx===0&&dy===0)return false;if(type==='N')return(adx===1&&ady===2)||(adx===2&&ady===1);if(type==='K')return Math.max(adx,ady)===1;if(type==='R')return dx===0||dy===0;if(type==='B')return adx===ady;if(type==='Q')return dx===0||dy===0||adx===ady;if(type==='P'){const dir=color==='w'?1:-1,target=pieceAt(state,b),capture=forAttack||!!(target&&target[0]!==color);if(rookPawnSideMove(state,a,b,color,capture))return true;if(capture)return dy===dir&&adx===1;if(dx!==0)return false;if(dy===dir)return true;const first=!state.moved[k(a.x,a.y,a.z)];return first&&dy===2*dir}return false}
function pseudoLegal(state,from,to,forAttack=false){const p=pieceAt(state,from);if(!p||!squareExists(state,to))return false;const dest=pieceAt(state,to);if(dest&&dest[0]===p[0])return false;if(!basicShape(state,p,from,to,forAttack))return false;if(p[1]==='P'&&!forAttack){const dx=to.x-from.x;if(dx===0&&dest)return false;if(dx!==0&&!dest)return false}return pathClear(state,from,to,p[1]==='N')}
function kingSquare(state,color){for(const [kk,p] of Object.entries(state.pieces))if(p===color+'K')return parse(kk);return null}
function isAttacked(state,target,byColor){for(const [kk,p] of Object.entries(state.pieces))if(p[0]===byColor){const a=parse(kk);if(pseudoLegal(state,a,target,true))return true}return false}
function simulate(state,from,to){const n=clone(state),fk=k(from.x,from.y,from.z),tk=k(to.x,to.y,to.z),p=n.pieces[fk];delete n.pieces[fk];n.pieces[tk]=p;return n}
function legalMove(state,from,to){const p=pieceAt(state,from);if(!p||p[0]!==state.turn||!pseudoLegal(state,from,to,false))return false;const n=simulate(state,from,to),ks=kingSquare(n,p[0]);if(ks&&isAttacked(n,ks,p[0]==='w'?'b':'w'))return false;return true}
function legalTargets(state,from){return boardSquares(state).filter(s=>legalMove(state,from,s))}
function findABAt(state,c){return state.abs.find(ab=>abSquares(ab).some(s=>s.x===c.x&&s.y===c.y&&s.z===c.z))}
function movePiece(state,from,to){if(!legalMove(state,from,to))return{ok:false,msg:'Illegal move under the current Tri-D path rules.'};state.history.push(clone(state));const fk=k(from.x,from.y,from.z),tk=k(to.x,to.y,to.z),p=state.pieces[fk],captured=state.pieces[tk];delete state.pieces[fk];state.pieces[tk]=p;state.moved[fk]=true;state.moved[tk]=true;if(captured&&captured[1]==='K')state.winner=p[0];if(p[1]==='P'&&((p[0]==='w'&&to.y>=8)||(p[0]==='b'&&to.y<=1)))state.pieces[tk]=p[0]+'Q';const ab=findABAt(state,to);if(captured&&ab&&ab.owner!==p[0]){const ownerPieces=abSquares(ab).filter(s=>{const q=pieceAt(state,s);return q&&q[0]===ab.owner});if(ownerPieces.length===0)ab.owner=p[0]}state.last={kind:'piece',from,to,piece:p,captured};state.turn=state.turn==='w'?'b':'w';return{ok:true,msg:'Move accepted.'}}
function pawnsRemaining(state,color){return Object.values(state.pieces).some(p=>p===color+'P')}
function abContents(state,ab){return abSquares(ab).map((s,i)=>({s,i,p:pieceAt(state,s)})).filter(x=>x.p)}
function abEligible(state,ab){if(ab.owner!==state.turn||!pawnsRemaining(state,state.turn))return false;const c=abContents(state,ab);return c.length===0||(c.length===1&&c[0].p===state.turn+'P')}
function abActions(state,ab){if(!abEligible(state,ab))return[];const out=[];if(!state.abs.some(x=>x.id!==ab.id&&x.kind===ab.kind&&x.anchor.r===ab.anchor.r&&x.anchor.z===ab.anchor.z&&x.inverted!==ab.inverted))out.push({r:ab.anchor.r,z:ab.anchor.z,inverted:!ab.inverted,label:'Invert on current post'});for(const p of POSTS){const d=Math.abs(p.r-ab.anchor.r);if(![1,2].includes(d))continue;for(const inv of [ab.inverted,!ab.inverted]){const clash=state.abs.some(x=>x.id!==ab.id&&x.kind===ab.kind&&x.anchor.r===p.r&&x.anchor.z===p.z&&x.inverted===inv);if(!clash)out.push({r:p.r,z:p.z,inverted:inv,label:`${FILES[ab.kind==='Q'?1:4]}${p.r}(${p.z})${inv?' · inverted':''}`})}}return out}
function moveAB(state,id,action){const ab=state.abs.find(a=>a.id===id);if(!ab||!abEligible(state,ab))return{ok:false,msg:'That attack board cannot move now.'};const valid=abActions(state,ab).some(a=>a.r===action.r&&a.z===action.z&&a.inverted===action.inverted);if(!valid)return{ok:false,msg:'Illegal attack-board destination.'};state.history.push(clone(state));const content=abContents(state,ab);content.forEach(x=>delete state.pieces[k(x.s.x,x.s.y,x.s.z)]);ab.anchor={r:action.r,z:action.z};ab.inverted=action.inverted;const newSq=abSquares(ab);content.forEach(x=>{state.pieces[k(newSq[x.i].x,newSq[x.i].y,newSq[x.i].z)]=x.p;state.moved[k(newSq[x.i].x,newSq[x.i].y,newSq[x.i].z)]=true});state.last={kind:'board',id,action};state.turn=state.turn==='w'?'b':'w';return{ok:true,msg:`${id} repositioned.`}}
function undo(state){if(!state.history.length)return state;return state.history[state.history.length-1]}
function status(state){const ks=kingSquare(state,state.turn);const check=ks?isAttacked(state,ks,state.turn==='w'?'b':'w'):false;return{turn:state.turn,check,winner:state.winner}}
const API={FILES,MAIN,POSTS,PIECE_SYMBOL,start,parse,k,boardSquares,abSquares,pieceAt,legalMove,legalTargets,movePiece,abActions,abEligible,moveAB,undo,status,findABAt};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else global.TriD=API;
})(typeof window!=='undefined'?window:globalThis);