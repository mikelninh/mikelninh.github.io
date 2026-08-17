(function(){
'use strict';
const C=window.ChessCore,D=window.CHESS_DATA,CC=window.ChessCommand;
if(!C||!D||!CC)return;
const $=id=>document.getElementById(id),KEY='chess-command-learning-v5',DAY=86400000;
const baseState={version:5,puzzleRating:500,srs:{},games:[],personalPuzzles:[],lessonProgress:{},analysisRuns:0};
let S=load();
function load(){try{return Object.assign({},baseState,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return JSON.parse(JSON.stringify(baseState))}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}renderMemory();renderPuzzleMeta();renderPlan()}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const evalText=cp=>!Number.isFinite(cp)?'—':Math.abs(cp)>90000?(cp>0?'M+':'M−'):(cp/100>=0?'+':'')+(cp/100).toFixed(2);
const dateStamp=()=>new Date().toISOString().slice(0,10);

/* ---------- puzzle catalogue ---------- */
D.puzzles.forEach((p,i)=>{if(!p.id)p.id='base-'+i});
const EXTRA=[
 {id:'end-queen-mate',title:'Queen mate net',theme:'Endgame · mate',rating:700,fen:'7k/8/5K2/8/8/8/8/6Q1 w - - 0 1',solution:'g1g7',hint:'Put the queen next to the king only where your own king protects it.',explain:'Qg7# works because the king on f6 protects the queen and covers the exits.',lessonId:'end-queen'},
 {id:'end-rook-mate',title:'Rook cuts the rank',theme:'Endgame · mate',rating:750,fen:'7k/8/6K1/8/8/8/8/R7 w - - 0 1',solution:'a1a8',hint:'Your king already removes the seventh-rank escapes. Let the rook close the final rank.',explain:'Ra8# turns the rook into a wall while the king controls g7 and h7.',lessonId:'end-rook'},
 {id:'end-promote',title:'Finish the pawn journey',theme:'Endgame · promotion',rating:500,fen:'8/P7/8/8/8/8/5k2/7K w - - 0 1',solution:'a7a8q',hint:'The pawn is one move from becoming something much stronger.',explain:'a8=Q converts the passed pawn immediately.',lessonId:'end-promotion'}
];
for(const p of EXTRA)if(!D.puzzles.some(x=>x.id===p.id))D.puzzles.push(p);
for(const p of S.personalPuzzles||[])if(!D.puzzles.some(x=>x.id===p.id))D.puzzles.push(p);

/* ---------- review UI ---------- */
const nav=document.querySelector('.topbar nav');
if(nav&&!nav.querySelector('[data-go="review"]')){
  const b=document.createElement('button');b.className='nav review-nav';b.dataset.go='review';b.textContent='Review';
  nav.insertBefore(b,nav.querySelector('[data-go="progress"]')||null);b.onclick=()=>CC.setScreen('review');
}
const review=document.createElement('section');review.id='review';review.className='screen';review.innerHTML=`
<div class="hero-strip compact v5-review-hero"><div><span class="eyebrow">GAME REVIEW / V2</span><h1>Turn the last game into the next lesson.</h1><p>Stockfish evaluates positions; Chess Command turns the useful mistakes into practice.</p></div><div class="review-engine"><small>ANALYSIS</small><b id="reviewEngine">Ready</b></div></div>
<div id="reviewEmpty" class="v5-empty"><b>No saved game yet.</b><span>Finish a computer game, then come back here.</span><button class="primary" id="reviewPlay">Play now</button></div>
<div id="reviewContent" hidden>
  <div class="review-summary"><article class="review-score"><small>ACCURACY</small><b id="reviewAccuracy">—</b><span id="reviewOpening">Waiting for analysis</span></article><article><small>BLUNDERS</small><b id="reviewBlunders">0</b><span>Large evaluation losses</span></article><article><small>MISTAKES</small><b id="reviewMistakes">0</b><span>Trainable positions</span></article><article><small>PERSONAL PUZZLES</small><b id="reviewPuzzles">0</b><span>Created from this game</span></article></div>
  <div class="review-actions"><button class="primary" id="analyseGame">Analyse game</button><button id="exportPgn">Export PGN</button><button id="copyPgn">Copy PGN</button><button id="toggleImport">Import PGN</button></div>
  <div class="analysis-progress" id="analysisProgress" hidden><i id="analysisBar"></i><span id="analysisText">Preparing…</span></div>
  <div class="pgn-import" id="pgnImport" hidden><textarea id="pgnText" placeholder="Paste a PGN here…"></textarea><div><input type="file" id="pgnFile" accept=".pgn,text/plain"><button class="primary" id="importPgn">Import for review</button></div><span id="pgnStatus"></span></div>
  <div class="review-layout"><div class="review-moves" id="reviewMoves"></div><aside class="review-coach" id="reviewCoach"></aside></div>
</div>`;
document.querySelector('main').appendChild(review);
$('reviewPlay').onclick=()=>CC.setScreen('play');

const currentGame=()=>S.games[0]||null;
function resultLabel(g){return g.score===1?'Win':g.score===0?'Loss':g.score===0.5?'Draw':'Imported game'}
function identifyOpening(moves){let winner=null,best=0;for(const o of D.openings){let n=0;while(n<o.moves.length&&n<moves.length&&o.moves[n]===moves[n])n++;if(n>best){winner=o;best=n}}return best>=3&&winner?winner.name:'Unclassified opening'}
function renderReview(){
  const g=currentGame();$('reviewEmpty').hidden=!!g;$('reviewContent').hidden=!g;if(!g)return;
  const r=g.review;$('reviewEngine').textContent=r?'Analysed':'Ready';$('reviewAccuracy').textContent=r?r.accuracy+'%':'—';$('reviewBlunders').textContent=r?r.blunders:0;$('reviewMistakes').textContent=r?r.mistakes:0;$('reviewPuzzles').textContent=r?r.personalCreated:0;$('reviewOpening').textContent=(r?.opening||identifyOpening(g.moves))+' · '+resultLabel(g);$('analyseGame').textContent=r?'Analyse again':'Analyse game';
  if(r)renderReviewMoves(r);else $('reviewMoves').innerHTML='<div class="v5-empty compact"><span>Run analysis to find the turning points.</span></div>';renderCoach(r);
}
function renderCoach(r){
  if(!r){$('reviewCoach').innerHTML='<span class="eyebrow">COACH</span><h2>Find the useful mistakes</h2><p>Run the review. The goal is not to match an engine everywhere; it is to discover patterns you can stop repeating.</p>';return}
  const weak=r.moves.filter(x=>x.side==='w'&&['Blunder','Mistake','Inaccuracy'].includes(x.classification)).sort((a,b)=>b.loss-a.loss)[0];
  $('reviewCoach').innerHTML=`<span class="eyebrow">NEXT LESSON</span><h2>${weak?esc(weak.classification+' · move '+weak.moveNo):'Clean game'}</h2><p>${weak?esc(weak.explain):'No large tactical loss detected. Raise the opponent level or practise conversion.'}</p>${weak?'<button class="primary" id="coachPuzzle">Practise this position</button>':''}`;
  if(weak)$('coachPuzzle').onclick=()=>launchPersonal(weak.fen);
}
function renderReviewMoves(r){
  $('reviewMoves').innerHTML=r.moves.map(x=>`<button class="review-move ${x.classification.toLowerCase()}" data-ply="${x.ply}"><span>${x.moveNo}${x.side==='b'?'…':'.'}</span><b>${esc(x.san)}</b><em>${esc(x.classification)}</em><small>${x.loss?'-'+Math.round(x.loss)+' cp':'best line'} · ${evalText(x.evalAfter)}</small><p>${esc(x.explain)}</p></button>`).join('');
  $('reviewMoves').querySelectorAll('.review-move').forEach(b=>b.onclick=()=>{const x=r.moves[Number(b.dataset.ply)];$('reviewCoach').innerHTML=`<span class="eyebrow">MOVE ${x.moveNo}${x.side==='b'?'…':'.'}</span><h2>${esc(x.san)} · ${esc(x.classification)}</h2><p>${esc(x.explain)}</p><div class="best-line"><small>ENGINE PREFERENCE</small><b>${esc(x.bestSan||x.bestMove||'—')}</b><span>${x.bestMove&&x.bestMove!==x.uci?'Instead of '+esc(x.san):'Your move matched the first choice.'}</span></div>`});
}
function fallbackAnalysis(state){const m=C.pickBotMove(state,1800);return{bestMove:m?C.moveUci(m):null,scoreWhite:C.evaluate(state,'w')}}
async function analysePosition(state){try{return await CC.getEngine().analyse(C.fen(state),{movetime:130})||fallbackAnalysis(state)}catch{return fallbackAnalysis(state)}}
function classification(loss,best,actual){if(best&&best===actual)return'Best';if(loss<=18)return'Excellent';if(loss<=55)return'Good';if(loss<=110)return'Inaccuracy';if(loss<=230)return'Mistake';return'Blunder'}
function explain(before,m,best,cls,loss){const piece=C.pieceAt(before,m.from)?.[1]||'';if(cls==='Best')return'Matches the engine’s first choice. Remember the idea, not just the coordinates.';if(cls==='Excellent')return'Strong and precise. Almost no value was lost.';if(cls==='Good')return'Healthy and playable. There may be a more precise route, but the position remains sound.';if(piece==='Q'&&before.fullmove<=6)return'The queen moved early and lost time. Ask whether a minor piece can develop with tempo instead.';if(m.capture&&loss>110)return'The capture is tempting, but the reply gives too much back. Calculate one opponent move further before taking.';if(best&&best.slice(0,2)!==m.from&&loss>110)return'The important resource used a different piece. Run a checks → captures → threats scan before committing.';if(cls==='Blunder')return'The evaluation swings sharply here. Practise this exact position until the better pattern becomes automatic.';if(cls==='Mistake')return'The plan is understandable, but it concedes too much. Compare the engine candidate with the threat you missed.';return'This gives away some of the position. Look for a safer improving move before forcing play.'}
function bestSan(before,uci){if(!uci)return null;const m=C.legalMoves(before,uci.slice(0,2)).find(x=>C.moveUci(x)===uci);return m?C.san(before,m):uci}
function hashId(fen,best){let h=2166136261;for(const c of fen+'|'+best){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return'personal-'+(h>>>0).toString(16)}
function addPersonal(row,g){
  if(row.side!=='w'||!row.bestMove||row.bestMove===row.uci||!['Mistake','Blunder'].includes(row.classification))return false;
  const id=hashId(row.fen,row.bestMove);if(S.personalPuzzles.some(p=>p.id===id))return false;
  const p={id,title:`Repair move ${row.moveNo}`,theme:'From your game',rating:clamp(Math.round(S.puzzleRating+(row.classification==='Blunder'?100:50)),400,2200),fen:row.fen,solution:row.bestMove,hint:`You played ${row.san}. Search for the strongest forcing or improving move instead.`,explain:`Your game move was ${row.san}; the review preferred ${row.bestSan||row.bestMove}.`,sourceGame:g.id};
  S.personalPuzzles.unshift(p);S.personalPuzzles=S.personalPuzzles.slice(0,40);if(!D.puzzles.some(x=>x.id===id))D.puzzles.push(p);return true;
}
async function analyseGame(force){
  const g=currentGame();if(!g)return;if(g.review&&!force){renderReview();return}
  let state=C.start();const positions=[state],moves=[],sans=[];
  for(const u of g.moves){const m=C.legalMoves(state,u.slice(0,2)).find(x=>C.moveUci(x)===u);if(!m)break;moves.push(m);sans.push(C.san(state,m));state=C.make(state,u);positions.push(state)}
  if(!moves.length)return;
  const evals=[];$('analysisProgress').hidden=false;$('analyseGame').disabled=true;
  for(let i=0;i<positions.length;i++){$('analysisText').textContent=`Analysing position ${i+1} of ${positions.length}`;$('analysisBar').style.width=Math.round(i/positions.length*100)+'%';evals.push(await analysePosition(positions[i]))}
  let total=0,userN=0,blunders=0,mistakes=0;const rows=[];
  for(let i=0;i<moves.length;i++){
    const before=positions[i],side=before.turn,b0=evals[i]?.scoreWhite??0,b1=evals[i+1]?.scoreWhite??0,best=evals[i]?.bestMove||null;let loss=side==='w'?b0-b1:b1-b0;if(best===g.moves[i])loss=0;loss=clamp(Math.max(0,loss),0,1200);const cls=classification(loss,best,g.moves[i]);
    if(side==='w'){userN++;total+=loss;if(cls==='Blunder')blunders++;if(cls==='Mistake')mistakes++}
    rows.push({ply:i,moveNo:Math.floor(i/2)+1,side,uci:g.moves[i],san:sans[i],bestMove:best,bestSan:bestSan(before,best),classification:cls,loss,evalAfter:b1,fen:C.fen(before),explain:explain(before,moves[i],best,cls,loss)});
  }
  const avg=userN?total/userN:0,accuracy=clamp(Math.round(100*Math.exp(-avg/240)),1,100);let created=0;for(const row of rows)if(addPersonal(row,g))created++;
  g.review={at:Date.now(),accuracy,averageLoss:Math.round(avg),blunders,mistakes,opening:identifyOpening(g.moves),moves:rows,personalCreated:created};g.pgn=g.pgn||C.pgnFromMoves(g.moves,{White:'Michael',Black:`Computer ${g.opp||''}`.trim()});S.analysisRuns++;save();
  $('analysisBar').style.width='100%';$('analysisText').textContent=`Done · ${accuracy}% accuracy`;$('analyseGame').disabled=false;setTimeout(()=>{$('analysisProgress').hidden=true},800);renderReview();
}
$('analyseGame').onclick=()=>analyseGame(true);

/* ---------- PGN ---------- */
function download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/x-chess-pgn'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
$('exportPgn').onclick=()=>{const g=currentGame();if(g)download(`chess-command-${dateStamp()}.pgn`,g.pgn||C.pgnFromMoves(g.moves,{White:'Michael',Black:'Computer'}))};
$('copyPgn').onclick=async()=>{const g=currentGame();if(!g)return;try{await navigator.clipboard.writeText(g.pgn||C.pgnFromMoves(g.moves));CC.toast('PGN copied.')}catch{CC.toast('Could not copy PGN.')}};
$('toggleImport').onclick=()=>{$('pgnImport').hidden=!$('pgnImport').hidden};
$('pgnFile').onchange=async e=>{const f=e.target.files&&e.target.files[0];if(f)$('pgnText').value=await f.text()};
$('importPgn').onclick=()=>{
  const text=$('pgnText').value.trim(),parsed=C.parsePgn(text);if(!parsed.moves.length||parsed.errors.length){$('pgnStatus').textContent=parsed.errors[0]||'No moves found.';return}
  const st=C.status(parsed.state);let score=null;if(st.over)score=st.winner==='w'?1:st.winner==='b'?0:0.5;
  S.games.unshift({id:'import-'+Date.now(),at:Date.now(),opp:'Imported PGN',score,moves:parsed.moves,pgn:text,review:null});S.games=S.games.slice(0,20);save();$('pgnStatus').textContent=`Imported ${parsed.moves.length} plies.`;$('pgnImport').hidden=true;renderReview();analyseGame(false);
};

/* ---------- V3 opening memory ---------- */
const srsKey=(i,p)=>`o${i}p${p}`;
function srsRecord(i,p){const k=srsKey(i,p);return S.srs[k]||(S.srs[k]={openingIndex:i,ply:p,level:0,interval:0,due:0,seen:0,lapses:0,last:0})}
function updateSrs(d){const r=srsRecord(d.openingIndex,d.ply),now=Date.now();r.seen++;r.last=now;if(d.correct){r.level=clamp(r.level+1,1,5);r.interval=[0,1,3,7,14,30][r.level];r.due=now+r.interval*DAY}else{r.level=Math.max(0,r.level-1);r.interval=0;r.lapses++;r.due=now+5*60000}save()}
document.addEventListener('cc:opening',e=>updateSrs(e.detail));
const memory=document.createElement('div');memory.className='memory-strip';memory.innerHTML='<div><small>DUE NOW</small><b id="memoryDue">0</b></div><div><small>OPENING MEMORY</small><b id="memoryMastery">0%</b></div><div class="memory-weak"><small>WEAKEST PATTERN</small><b id="memoryWeak">Start training</b></div><button class="primary" id="memoryReview">Review next</button>';document.querySelector('#learn .hero-strip')?.after(memory);
function dueItems(){const now=Date.now();return Object.values(S.srs).filter(r=>r.due&&r.due<=now).sort((a,b)=>a.due-b.due)}
function allOpeningPositions(){const out=[];D.openings.forEach((o,i)=>o.moves.forEach((m,p)=>out.push({openingIndex:i,ply:p,key:srsKey(i,p)})));return out}
function nextMemory(){const due=dueItems();if(due.length)return due[0];const unseen=allOpeningPositions().find(x=>!S.srs[x.key]);if(unseen)return unseen;return Object.values(S.srs).sort((a,b)=>(a.level-b.level)||(b.lapses-a.lapses))[0]}
function renderMemory(){if(!$('memoryDue'))return;const records=Object.values(S.srs),due=dueItems();$('memoryDue').textContent=due.length;const mastery=records.length?records.reduce((n,r)=>n+r.level,0)/(records.length*5)*100:0;$('memoryMastery').textContent=Math.round(mastery)+'%';const weak=records.slice().sort((a,b)=>(a.level-b.level)||(b.lapses-a.lapses))[0];$('memoryWeak').textContent=weak?`${D.openings[weak.openingIndex]?.name||'Opening'} · move ${weak.ply+1}`:'Start with the Italian';$('memoryReview').textContent=due.length?`Review ${due.length} due`:'Learn next position'}
$('memoryReview').onclick=()=>{const x=nextMemory();if(!x)return;CC.setScreen('learn');CC.startOpeningAt(x.openingIndex,x.ply)};

/* ---------- V4 adaptive + personal puzzles ---------- */
const puzzleMeta=document.createElement('div');puzzleMeta.className='puzzle-meta';puzzleMeta.innerHTML='<div><small>PUZZLE RATING</small><b id="adaptivePuzzleRating">500</b></div><div><small>PERSONAL POSITIONS</small><b id="personalPuzzleCount">0</b></div><div><small>FOCUS</small><b id="puzzleFocus">Tactics</b></div><button id="personalPuzzleBtn">Practise my mistakes</button>';document.querySelector('#puzzles .hero-strip')?.after(puzzleMeta);
function renderPuzzleMeta(){if(!$('adaptivePuzzleRating'))return;$('adaptivePuzzleRating').textContent=Math.round(S.puzzleRating);$('personalPuzzleCount').textContent=S.personalPuzzles.length;const nearest=D.puzzles.slice().sort((a,b)=>Math.abs((a.rating||500)-S.puzzleRating)-Math.abs((b.rating||500)-S.puzzleRating))[0];$('puzzleFocus').textContent=nearest?.theme||'Tactics';$('personalPuzzleBtn').disabled=!S.personalPuzzles.length}
function adaptivePuzzleIndex(){const current=CC.getPuzzleIndex();return D.puzzles.map((p,i)=>({i,score:Math.abs((p.rating||500)-S.puzzleRating)-(p.theme==='From your game'?35:0)})).filter(x=>x.i!==current).sort((a,b)=>a.score-b.score)[0]?.i??0}
$('nextPuzzle').onclick=()=>CC.loadPuzzle(adaptivePuzzleIndex());
$('personalPuzzleBtn').onclick=()=>{const p=S.personalPuzzles[0];if(!p)return;const i=D.puzzles.findIndex(x=>x.id===p.id);if(i>=0){CC.setScreen('puzzles');CC.loadPuzzle(i)}};
function launchPersonal(fen){const p=S.personalPuzzles.find(x=>x.fen===fen);if(!p){CC.setScreen('puzzles');return}const i=D.puzzles.findIndex(x=>x.id===p.id);CC.setScreen('puzzles');if(i>=0)CC.loadPuzzle(i)}
document.addEventListener('cc:puzzle',e=>{const p=e.detail.puzzle;if(e.detail.correct){const expected=1/(1+Math.pow(10,((p.rating||500)-S.puzzleRating)/400));S.puzzleRating=clamp(Math.round(S.puzzleRating+18*(1-expected)),200,3000);if(p.lessonId)S.lessonProgress[p.lessonId]=1}else S.puzzleRating=clamp(S.puzzleRating-2,200,3000);save();renderCurriculum()});

/* ---------- V5 middlegame + endgame curriculum ---------- */
const LESSONS=[
 {id:'mid-scan',phase:'Middlegame',title:'Checks · captures · threats',desc:'Build a repeatable tactical scan before every move.',puzzle:'base-0'},
 {id:'mid-fork',phase:'Middlegame',title:'Knight forks',desc:'See one knight attack two valuable pieces at once.',puzzle:'base-1'},
 {id:'mid-loose',phase:'Middlegame',title:'Loose pieces drop off',desc:'Notice what is undefended before calculating anything fancy.',puzzle:'base-3'},
 {id:'end-queen',phase:'Endgame',title:'King + queen mate',desc:'Coordinate king and queen to erase every escape square.',puzzle:'end-queen-mate'},
 {id:'end-rook',phase:'Endgame',title:'King + rook mate',desc:'Use the rook as a wall and your king as the closer.',puzzle:'end-rook-mate'},
 {id:'end-promotion',phase:'Endgame',title:'Passed pawn → queen',desc:'Convert the simplest winning asset cleanly.',puzzle:'end-promote'}
];
const curriculum=document.createElement('section');curriculum.className='v5-curriculum';curriculum.innerHTML='<div class="section-head-v5"><div><span class="eyebrow">V5 CURRICULUM</span><h2>Middlegame + endgame foundations</h2></div><span id="lessonCount">0 / 6 complete</span></div><div class="lesson-columns"><div><h3>Middlegame</h3><div id="midLessons"></div></div><div><h3>Endgame</h3><div id="endLessons"></div></div></div>';document.querySelector('#learn .learn-grid')?.after(curriculum);
function lessonHtml(phase){return LESSONS.filter(l=>l.phase===phase).map(l=>`<button class="lesson-row ${S.lessonProgress[l.id]?'done':''}" data-lesson="${l.id}"><span>${S.lessonProgress[l.id]?'✓':'○'}</span><div><b>${esc(l.title)}</b><small>${esc(l.desc)}</small></div><em>${S.lessonProgress[l.id]?'DONE':'PRACTISE'}</em></button>`).join('')}
function renderCurriculum(){if(!$('midLessons'))return;$('midLessons').innerHTML=lessonHtml('Middlegame');$('endLessons').innerHTML=lessonHtml('Endgame');$('lessonCount').textContent=`${LESSONS.filter(l=>S.lessonProgress[l.id]).length} / ${LESSONS.length} complete`;curriculum.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>{const l=LESSONS.find(x=>x.id===b.dataset.lesson),i=D.puzzles.findIndex(p=>p.id===l?.puzzle);if(i>=0){CC.setScreen('puzzles');CC.loadPuzzle(i)}})}

/* ---------- adaptive plan ---------- */
const plan=document.createElement('section');plan.className='adaptive-plan';plan.innerHTML='<div><span class="eyebrow">CHESS COMMAND / NEXT MOVE</span><h2 id="nextTrainingTitle">Play one focused game</h2><p id="nextTrainingWhy">Your training plan will adapt as you play.</p></div><button class="primary" id="nextTrainingBtn">Start</button>';document.querySelector('#progress .next-plan')?.before(plan);
const more=document.createElement('div');more.className='v5-more';more.innerHTML='<button data-v5-go="themes">Board & piece skins</button><button data-v5-go="lab">Experimental Tri-D Lab</button>';document.querySelector('#progress .next-plan')?.after(more);more.querySelectorAll('button').forEach(b=>b.onclick=()=>CC.setScreen(b.dataset.v5Go));
function recommend(){const due=dueItems();if(due.length)return{title:`Review ${due.length} opening position${due.length>1?'s':''}`,why:'These moves are due now in spaced repetition.',action:'memory'};if(S.personalPuzzles.length)return{title:'Repair a mistake from your own game',why:'Personal positions transfer more directly than random puzzles.',action:'personal'};const incomplete=LESSONS.find(l=>!S.lessonProgress[l.id]);if(incomplete)return{title:incomplete.title,why:`Next ${incomplete.phase.toLowerCase()} foundation: ${incomplete.desc}`,action:'lesson',id:incomplete.id};return{title:'Play a slightly stronger opponent',why:'Your review queue is clear. Create new learning data.',action:'play'}}
function renderPlan(){if(!$('nextTrainingTitle'))return;const r=recommend();$('nextTrainingTitle').textContent=r.title;$('nextTrainingWhy').textContent=r.why;$('nextTrainingBtn').dataset.action=r.action;$('nextTrainingBtn').dataset.id=r.id||''}
$('nextTrainingBtn').onclick=()=>{const a=$('nextTrainingBtn').dataset.action;if(a==='memory')$('memoryReview').click();else if(a==='personal')$('personalPuzzleBtn').click();else if(a==='lesson'){const l=LESSONS.find(x=>x.id===$('nextTrainingBtn').dataset.id),i=D.puzzles.findIndex(p=>p.id===l?.puzzle);CC.setScreen('puzzles');if(i>=0)CC.loadPuzzle(i)}else CC.setScreen('play')};

/* ---------- game capture ---------- */
document.addEventListener('cc:gameover',e=>{const d=e.detail;if(!d.moves||!d.moves.length)return;const result=d.score===1?'1-0':d.score===0?'0-1':'1/2-1/2';S.games.unshift({id:'game-'+Date.now(),at:Date.now(),opp:d.opp,score:d.score,moves:d.moves,pgn:C.pgnFromMoves(d.moves,{White:'Michael',Black:`Computer ${d.opp}`,Result:result}),review:null});S.games=S.games.slice(0,20);save();renderReview();CC.toast('Game saved · Review is ready')});

renderReview();renderMemory();renderPuzzleMeta();renderCurriculum();renderPlan();
})();
