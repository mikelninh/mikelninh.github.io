(function(){
'use strict';
const C=window.ChessCore,D=window.CHESS_DATA,CC=window.ChessCommand,R=window.ReviewCoreV11;if(!C||!D||!CC||!R)return;
const LEARN='chess-command-learning-v5',KEY='chess-command-review-v11';
const $=id=>document.getElementById(id),clamp=R.clamp;
const state=load(KEY,{version:11,reviews:{}});
function load(k,d={}){try{return Object.assign({},d,JSON.parse(localStorage.getItem(k)||'{}'))}catch{return JSON.parse(JSON.stringify(d))}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function syncCoachEvidence(gameId,rows){try{const L=load(LEARN,{games:[]}),g=(L.games||[]).find(x=>x.id===gameId);if(!g)return;g.review=g.review||{};g.review.deepRows=rows;g.review.deepAt=Date.now();localStorage.setItem(LEARN,JSON.stringify(L))}catch{}}
function learning(){return load(LEARN,{games:[]})}
function game(){return learning().games?.[0]||null}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function evalText(cp){if(!Number.isFinite(cp))return'—';if(Math.abs(cp)>90000)return cp>0?'M+':'M−';return(cp>=0?'+':'')+(cp/100).toFixed(2)}
function moveObj(st,uci){return C.legalMoves(st,uci?.slice(0,2)).find(m=>C.moveUci(m)===uci)||null}
function pvSan(st,pv,max=5){let s=st,out=[];for(const u of (pv||[]).slice(0,max)){const m=moveObj(s,u);if(!m)break;out.push(C.san(s,m));s=C.make(s,u);if(!s)break}return out.join(' ')}
function materialPieces(st){return Object.values(st.board||{}).filter(p=>p&&p[1]!=='K').length}
function fallbackLine(st){const m=C.pickBotMove(st,2000);return m?[{rank:1,bestMove:C.moveUci(m),scoreWhite:C.evaluate(st,'w'),cp:null,mate:null,pv:[C.moveUci(m)],depth:0}]:[]}
async function analyse(st){try{const e=CC.getEngine();if(e?.analyseMulti){const x=await e.analyseMulti(C.fen(st),{movetime:220,multipv:3});if(x?.length)return x}if(e?.analyse){const one=await e.analyse(C.fen(st),{movetime:220});if(one)return[one]}}catch(err){console.warn('V11 analysis fallback',err)}return fallbackLine(st)}
function actionFor(theme){
 if(['missed-mate','missed-check','missed-tactic','bad-capture','calculation'].includes(theme))return{screen:'puzzles',label:'Train tactics'};
 if(['development','early-queen','king-safety'].includes(theme))return{screen:'learn',label:'Train fundamentals'};
 if(theme==='endgame-technique')return{screen:'learn',label:'Train endgame'};
 return{screen:'play',label:'Play another game'};
}
function ensureUI(){
 const content=$('reviewContent');if(!content||$('reviewV11'))return;
 const box=document.createElement('section');box.id='reviewV11';box.className='review-v11';box.innerHTML=`
 <div class="v11-head"><div><span class="eyebrow">DEEP REVIEW / V11</span><h2>See the position, not just the score.</h2><p>Three engine candidates, tactical themes and the one lesson worth carrying into your next game.</p></div><button class="primary" id="deepAnalyse">Deep review</button></div>
 <div id="deepEmpty" class="v11-empty">Run a deep review after a completed game. It takes longer because Chess Command asks for multiple candidate lines.</div>
 <div id="deepProgress" class="v11-progress" hidden><i id="deepBar"></i><span id="deepProgressText">Preparing…</span></div>
 <div id="deepContent" hidden>
   <div class="v11-stats"><article><small>DEEP ACCURACY</small><b id="deepAccuracy">—</b><span>Human moves only</span></article><article><small>TOP PATTERN</small><b id="deepTheme">—</b><span id="deepThemeCount">No pattern yet</span></article><article><small>TURNING POINT</small><b id="deepTurning">—</b><span id="deepTurningLoss">—</span></article></div>
   <div class="v11-graph-card"><div><small>EVALUATION GRAPH</small><b>White advantage ↑ · Black advantage ↓</b></div><svg id="deepGraph" viewBox="0 0 600 160" role="img" aria-label="Game evaluation graph"></svg></div>
   <div class="v11-layout"><div><div class="v11-section-title"><span>YOUR DECISIONS</span><small>Tap a move to inspect the alternatives</small></div><div id="deepMoves" class="v11-moves"></div></div><aside id="deepInspector" class="v11-inspector"></aside></div>
 </div>`;
 const actions=content.querySelector('.review-actions');actions?.insertAdjacentElement('afterend',box);$('deepAnalyse').onclick=()=>run(true);render();
}
function render(){const g=game();if(!g){if($('deepEmpty'))$('deepEmpty').textContent='Finish a game first, then run Deep Review.';return}const r=state.reviews[g.id];$('deepEmpty').hidden=!!r;$('deepContent').hidden=!r;if(r)renderReview(r,g)}
function graph(rows){const svg=$('deepGraph');if(!svg)return;const pts=R.evalSeries(rows),w=600,h=160,pad=18;if(!pts.length){svg.innerHTML='';return}const x=i=>pad+(w-pad*2)*(i/Math.max(1,pts.length-1)),y=cp=>h/2-clamp(cp,-1200,1200)/1200*(h/2-pad);const poly=pts.map((p,i)=>`${x(i)},${y(p.cp)}`).join(' ');const marks=rows.filter(r=>r.side==='w'&&['Inaccuracy','Mistake','Blunder'].includes(r.classification)).map(r=>`<circle cx="${x(r.ply)}" cy="${y(r.evalAfter)}" r="${r.classification==='Blunder'?5:3.5}" class="${r.classification.toLowerCase()}"/>`).join('');svg.innerHTML=`<line x1="${pad}" x2="${w-pad}" y1="${h/2}" y2="${h/2}" class="zero"/><polyline points="${poly}" class="eval-line"/>${marks}`}
function renderReview(r,g){
 $('deepAccuracy').textContent=r.accuracy+'%';const tc=R.themeCounts(r.rows).filter(([t])=>t!=='clean'),top=tc[0];$('deepTheme').textContent=top?R.label(top[0]):'No repeated leak';$('deepThemeCount').textContent=top?`${top[1]} flagged decision${top[1]===1?'':'s'}`:'Keep collecting games';const p=R.priority(r.rows);$('deepTurning').textContent=p?`${p.moveNo}. ${p.san}`:'—';$('deepTurningLoss').textContent=p?`${p.classification} · ${Math.round(p.loss)} cp`:'—';graph(r.rows);
 const human=r.rows.filter(x=>x.side==='w');$('deepMoves').innerHTML=human.map(x=>`<button class="v11-move ${x.classification.toLowerCase()}" data-ply="${x.ply}"><span>${x.moveNo}.</span><b>${esc(x.san)}</b><em>${esc(R.label(x.theme))}</em><small>${esc(x.classification)} · ${Math.round(x.loss)} cp</small></button>`).join('');$('deepMoves').querySelectorAll('button').forEach(b=>b.onclick=()=>inspect(r.rows.find(x=>x.ply===Number(b.dataset.ply))));if(p)inspect(p);else if(human[0])inspect(human[0]);
}
function inspect(row){if(!row)return;const action=actionFor(row.theme),cands=(row.candidates||[]).slice(0,3);$('deepInspector').innerHTML=`<span class="eyebrow">MOVE ${row.moveNo}.</span><h2>${esc(row.san)} · ${esc(row.classification)}</h2><div class="v11-theme">${esc(R.label(row.theme))}</div><p>${esc(row.explain)}</p><div class="v11-candidates">${cands.map((c,i)=>`<article><small>#${i+1} · ${evalText(c.scoreWhite)}</small><b>${esc(c.san||c.move||'—')}</b><span>${esc(c.line||'')}</span></article>`).join('')||'<span>No candidate lines available in fallback mode.</span>'}</div><button class="primary" id="deepAction">${esc(action.label)}</button>`;$('deepAction').onclick=()=>CC.setScreen(action.screen)}
async function run(force=false){
 const g=game();if(!g)return CC.toast('Finish a game first.');if(state.reviews[g.id]&&!force)return render();
 const positions=[C.start()],moves=[],sans=[];let st=positions[0];for(const u of g.moves||[]){const m=moveObj(st,u);if(!m)break;moves.push(m);sans.push(C.san(st,m));st=C.make(st,u);positions.push(st)}if(!moves.length)return CC.toast('No moves to analyse.');
 $('deepProgress').hidden=false;$('deepAnalyse').disabled=true;const evals=[];for(let i=0;i<positions.length;i++){$('deepProgressText').textContent=`Deep analysis ${i+1} / ${positions.length}`;$('deepBar').style.width=Math.round(i/positions.length*100)+'%';evals.push(await analyse(positions[i]))}
 const rows=[],humanLosses=[];for(let i=0;i<moves.length;i++){
   const before=positions[i],after=positions[i+1],side=before.turn,lines=evals[i]||[],next=evals[i+1]?.[0],best=lines[0]?.bestMove||lines[0]?.pv?.[0]||null,beforeEval=lines[0]?.scoreWhite??0,afterEval=next?.scoreWhite??0;let loss=side==='w'?beforeEval-afterEval:afterEval-beforeEval;if(best===g.moves[i])loss=0;loss=clamp(Math.max(0,loss),0,1500);
   const actual=moves[i],bestObj=moveObj(before,best),bestAfter=best?C.make(before,best):null,actualStatus=C.status(after),bestStatus=bestAfter?C.status(bestAfter):{};
   const meta={loss,moveNo:Math.floor(i/2)+1,materialPieces:materialPieces(before),piece:C.pieceAt(before,actual.from)?.[1],bestMate:Number.isFinite(lines[0]?.mate),actualMate:actualStatus.checkmate,bestCheck:!!bestStatus.check,actualCheck:!!actualStatus.check,bestCapture:!!bestObj?.capture,actualCapture:!!actual.capture,kingExposed:false};
   const theme=R.theme(meta),classification=R.classifyLoss(loss,best===g.moves[i]),candidates=lines.slice(0,3).map(l=>{const u=l.bestMove||l.pv?.[0],m=moveObj(before,u);return{move:u,san:m?C.san(before,m):u,scoreWhite:l.scoreWhite,line:pvSan(before,l.pv,5),depth:l.depth||0}});
   const row={ply:i,moveNo:meta.moveNo,side,uci:g.moves[i],san:sans[i],classification,loss,evalAfter:afterEval,fen:C.fen(before),bestMove:best,bestSan:candidates[0]?.san||best,theme,candidates};row.explain=R.explanation({...meta,theme,bestMove:best,bestSan:row.bestSan,actualSan:row.san});rows.push(row);if(side==='w')humanLosses.push(loss)
 }
 const review={version:11,at:Date.now(),engine:CC.getEngine()?.mode||'fallback',accuracy:R.accuracy(humanLosses),rows};state.reviews[g.id]=review;const ids=Object.keys(state.reviews).sort((a,b)=>(state.reviews[b]?.at||0)-(state.reviews[a]?.at||0));for(const id of ids.slice(30))delete state.reviews[id];persist();syncCoachEvidence(g.id,rows);$('deepBar').style.width='100%';$('deepProgressText').textContent=`Done · ${review.accuracy}% deep accuracy`;$('deepAnalyse').disabled=false;setTimeout(()=>{$('deepProgress').hidden=true},700);render();document.dispatchEvent(new CustomEvent('cc:deepreview',{detail:{gameId:g.id,review}}));
}
document.addEventListener('cc:gameover',()=>setTimeout(render,50));ensureUI();render();
})();
