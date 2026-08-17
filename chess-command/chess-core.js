(function(global){
'use strict';
const FILES='abcdefgh';
const PIECE_VALUE={p:100,n:320,b:330,r:500,q:900,k:20000};
const SYMBOL={wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'};
const clone=x=>JSON.parse(JSON.stringify(x));
const sq=(f,r)=>FILES[f]+r;
const file=s=>FILES.indexOf(s[0]);
const rank=s=>+s[1];
const inside=(f,r)=>f>=0&&f<8&&r>=1&&r<=8;
function start(){
 const s={board:{},turn:'w',castling:{wK:true,wQ:true,bK:true,bQ:true},ep:null,halfmove:0,fullmove:1,history:[],last:null};
 const back=['R','N','B','Q','K','B','N','R'];
 for(let i=0;i<8;i++){s.board[sq(i,1)]='w'+back[i];s.board[sq(i,2)]='wP';s.board[sq(i,7)]='bP';s.board[sq(i,8)]='b'+back[i]}
 return s;
}
function fromFEN(fen){
 const [pos,turn,castle,ep,half='0',full='1']=fen.split(/\s+/); const s={board:{},turn,castling:{wK:false,wQ:false,bK:false,bQ:false},ep:ep==='-'?null:ep,halfmove:+half,fullmove:+full,history:[],last:null};
 const rows=pos.split('/'); for(let ri=0;ri<8;ri++){let f=0,r=8-ri;for(const ch of rows[ri]){if(/\d/.test(ch)){f+=+ch;continue}const color=ch===ch.toUpperCase()?'w':'b';s.board[sq(f,r)]=color+ch.toUpperCase();f++}}
 s.castling.wK=castle.includes('K');s.castling.wQ=castle.includes('Q');s.castling.bK=castle.includes('k');s.castling.bQ=castle.includes('q');return s;
}
function fen(s){let rows=[];for(let r=8;r>=1;r--){let out='',empty=0;for(let f=0;f<8;f++){const p=s.board[sq(f,r)];if(!p){empty++;continue}if(empty){out+=empty;empty=0}let c=p[1];out+=p[0]==='w'?c:c.toLowerCase()}if(empty)out+=empty;rows.push(out)}let c='';if(s.castling.wK)c+='K';if(s.castling.wQ)c+='Q';if(s.castling.bK)c+='k';if(s.castling.bQ)c+='q';return `${rows.join('/')} ${s.turn} ${c||'-'} ${s.ep||'-'} ${s.halfmove} ${s.fullmove}`}
function colorOpp(c){return c==='w'?'b':'w'}
function attacked(s,target,by){const tf=file(target),tr=rank(target);const pawnDir=by==='w'?1:-1;for(const df of [-1,1]){const a=sq(tf-df,tr-pawnDir);if(inside(tf-df,tr-pawnDir)&&s.board[a]===by+'P')return true}for(const [df,dr] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]){const f=tf+df,r=tr+dr;if(inside(f,r)&&s.board[sq(f,r)]===by+'N')return true}for(const [df,dr,types] of [[1,0,'RQ'],[-1,0,'RQ'],[0,1,'RQ'],[0,-1,'RQ'],[1,1,'BQ'],[1,-1,'BQ'],[-1,1,'BQ'],[-1,-1,'BQ']]){let f=tf+df,r=tr+dr;while(inside(f,r)){const p=s.board[sq(f,r)];if(p){if(p[0]===by&&types.includes(p[1]))return true;break}f+=df;r+=dr}}for(let df=-1;df<=1;df++)for(let dr=-1;dr<=1;dr++)if(df||dr){const f=tf+df,r=tr+dr;if(inside(f,r)&&s.board[sq(f,r)]===by+'K')return true}return false}
function kingSquare(s,c){for(const [k,p] of Object.entries(s.board))if(p===c+'K')return k;return null}
function inCheck(s,c){const k=kingSquare(s,c);return k?attacked(s,k,colorOpp(c)):false}
function pseudoMoves(s,from){const p=s.board[from];if(!p)return[];const c=p[0],t=p[1],f=file(from),r=rank(from),out=[];const push=(to,promotion=null,castle=null,ep=false)=>{if(!to)return;const d=s.board[to];if(!d||d[0]!==c)out.push({from,to,promotion,castle,ep,capture:!!d||ep})};
 if(t==='P'){const dir=c==='w'?1:-1,startR=c==='w'?2:7,promR=c==='w'?8:1;const one=sq(f,r+dir);if(inside(f,r+dir)&&!s.board[one]){if(r+dir===promR){for(const pr of ['Q','R','B','N'])push(one,pr)}else push(one);const two=sq(f,r+2*dir);if(r===startR&&!s.board[two])push(two)}for(const df of [-1,1]){const nf=f+df,nr=r+dir;if(!inside(nf,nr))continue;const to=sq(nf,nr);if((s.board[to]&&s.board[to][0]!==c)||s.ep===to){if(nr===promR){for(const pr of ['Q','R','B','N'])push(to,pr,null,s.ep===to)}else push(to,null,null,s.ep===to)}}return out}
 if(t==='N'){for(const [df,dr] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]){const nf=f+df,nr=r+dr;if(inside(nf,nr))push(sq(nf,nr))}return out}
 if(t==='B'||t==='R'||t==='Q'){const dirs=[];if(t==='B'||t==='Q')dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);if(t==='R'||t==='Q')dirs.push([1,0],[-1,0],[0,1],[0,-1]);for(const [df,dr] of dirs){let nf=f+df,nr=r+dr;while(inside(nf,nr)){const to=sq(nf,nr),d=s.board[to];if(!d)push(to);else{if(d[0]!==c)push(to);break}nf+=df;nr+=dr}}return out}
 if(t==='K'){for(let df=-1;df<=1;df++)for(let dr=-1;dr<=1;dr++)if(df||dr){const nf=f+df,nr=r+dr;if(inside(nf,nr))push(sq(nf,nr))}const home=c==='w'?1:8;if(r===home&&from==='e'+home&&!inCheck(s,c)){if(s.castling[c+'K']&&!s.board['f'+home]&&!s.board['g'+home]&&s.board['h'+home]===c+'R'&&!attacked(s,'f'+home,colorOpp(c))&&!attacked(s,'g'+home,colorOpp(c)))push('g'+home,null,'K');if(s.castling[c+'Q']&&!s.board['d'+home]&&!s.board['c'+home]&&!s.board['b'+home]&&s.board['a'+home]===c+'R'&&!attacked(s,'d'+home,colorOpp(c))&&!attacked(s,'c'+home,colorOpp(c)))push('c'+home,null,'Q')}return out}
 return out;
}
function apply(s,m,record=true){const n=clone(s);if(record)n.history.push({fen:fen(s),last:s.last});const p=n.board[m.from],c=p[0],t=p[1],fr=rank(m.from),tr=rank(m.to);let captured=n.board[m.to]||null;delete n.board[m.from];if(m.ep){const cap=sq(file(m.to),tr+(c==='w'?-1:1));captured=n.board[cap]||captured;delete n.board[cap]}n.board[m.to]=m.promotion?c+m.promotion:p;if(m.castle){const home=c==='w'?1:8;if(m.castle==='K'){n.board['f'+home]=n.board['h'+home];delete n.board['h'+home]}else{n.board['d'+home]=n.board['a'+home];delete n.board['a'+home]}}if(t==='K'){n.castling[c+'K']=false;n.castling[c+'Q']=false}if(t==='R'){if(m.from==='a1')n.castling.wQ=false;if(m.from==='h1')n.castling.wK=false;if(m.from==='a8')n.castling.bQ=false;if(m.from==='h8')n.castling.bK=false}if(captured==='wR'){if(m.to==='a1')n.castling.wQ=false;if(m.to==='h1')n.castling.wK=false}if(captured==='bR'){if(m.to==='a8')n.castling.bQ=false;if(m.to==='h8')n.castling.bK=false}n.ep=null;if(t==='P'&&Math.abs(tr-fr)===2)n.ep=sq(file(m.from),(fr+tr)/2);n.halfmove=(t==='P'||captured)?0:n.halfmove+1;if(c==='b')n.fullmove++;n.turn=colorOpp(c);n.last={...m,piece:p,captured};return n}
function legalMoves(s,from=null){const c=s.turn,out=[];const entries=from?[[from,s.board[from]]]:Object.entries(s.board);for(const [fr,p] of entries){if(!p||p[0]!==c)continue;for(const m of pseudoMoves(s,fr)){const n=apply(s,m,false);if(!inCheck(n,c))out.push(m)}}return out}
function make(s,uci){const from=uci.slice(0,2),to=uci.slice(2,4),pr=(uci[4]||'').toUpperCase();const m=legalMoves(s,from).find(x=>x.to===to&&(!x.promotion||x.promotion===pr||(!pr&&x.promotion==='Q')));if(!m)return null;return apply(s,m,true)}
function moveUci(m){return m.from+m.to+(m.promotion?m.promotion.toLowerCase():'')}
function status(s){const moves=legalMoves(s);const check=inCheck(s,s.turn);if(!moves.length)return{over:true,check,checkmate:check,stalemate:!check,winner:check?colorOpp(s.turn):null};if(s.halfmove>=100)return{over:true,draw:true,reason:'50-move rule'};const material=Object.values(s.board).filter(p=>p[1]!=='K');if(material.length===0||(material.length===1&&['B','N'].includes(material[0][1])))return{over:true,draw:true,reason:'insufficient material'};return{over:false,check,turn:s.turn}}
function evaluate(s,perspective='w'){let v=0;for(const [square,p] of Object.entries(s.board)){let x=PIECE_VALUE[p[1].toLowerCase()]||0;const r=rank(square),f=file(square);if(p[1]==='P')x+=p[0]==='w'?r*4:(9-r)*4;if(['N','B'].includes(p[1]))x+=Math.max(0,18-(Math.abs(f-3.5)+Math.abs(r-4.5))*4);v+=(p[0]==='w'?1:-1)*x}if(inCheck(s,'b'))v+=25;if(inCheck(s,'w'))v-=25;return perspective==='w'?v:-v}
function pickBotMove(s,elo=800){const moves=legalMoves(s);if(!moves.length)return null;const side=s.turn;const scored=moves.map(m=>{const n=apply(s,m,false);let score=evaluate(n,side);if(m.capture)score+=50;if(inCheck(n,n.turn))score+=35;return{m,score}}).sort((a,b)=>b.score-a.score);if(elo<600)return scored[Math.floor(Math.random()*scored.length)].m;const width=elo<900?Math.min(8,scored.length):elo<1200?Math.min(5,scored.length):elo<1500?Math.min(3,scored.length):1;if(width===1)return scored[0].m;const r=Math.random();const idx=Math.min(width-1,Math.floor(Math.pow(r,elo<900?0.7:1.4)*width));return scored[idx].m}
function undo(s){if(!s.history.length)return s;const h=s.history[s.history.length-1];const prev=fromFEN(h.fen);prev.history=s.history.slice(0,-1);prev.last=h.last||null;return prev}
const API={FILES,SYMBOL,start,fromFEN,fen,legalMoves,make,moveUci,status,inCheck,evaluate,pickBotMove,undo,pieceAt:(s,x)=>s.board[x]||null};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else global.ChessCore=API;
})(typeof window!=='undefined'?window:globalThis);
