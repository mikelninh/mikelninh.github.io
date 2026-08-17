(function(){
'use strict';
const C=window.ChessCore,CC=window.ChessCommand,P=window.PuzzleCoreV12;if(!C||!CC||!P)return;
const $=id=>document.getElementById(id),KEY='chess-command-tactics-v12',LEARN='chess-command-learning-v5';
const today=()=>new Date().toISOString().slice(0,10),clamp=P.clamp;
const base={version:12,rating:600,xp:0,streak:0,bestStreak:0,solved:0,themes:{},daily:{},seen:[],achievements:{}};
function load(k,d={}){try{return Object.assign({},d,JSON.parse(localStorage.getItem(k)||'{}'))}catch{return JSON.parse(JSON.stringify(d))}}
let S=load(KEY,base);
const oldLearn=load(LEARN,{puzzleRating:500,personalPuzzles:[]});if(!localStorage.getItem(KEY)&&oldLearn.puzzleRating)S.rating=Math.max(400,oldLearn.puzzleRating);
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}renderMeta()}
function daily(){const k=today();return S.daily[k]||(S.daily[k]={solved:0,firstTry:0,xp:0,target:5})}
function stat(theme){return S.themes[theme]||(S.themes[theme]={attempts:0,correct:0,firstTry:0,bestStreak:0})}
function personal(){return (load(LEARN,{personalPuzzles:[]}).personalPuzzles||[]).map((x,i)=>({...x,id:x.id||'personal-'+i,theme:'Personal',line:[x.solution],rating:x.rating||S.rating,title:x.title||'From your game'})).filter(x=>x.fen&&x.line[0])}
function bank(){return [...P.PUZZLES,...personal()]}
let theme='Mixed',current=null,pos=null,selected=null,step=0,attempts=0,hintStage=0,solved=false,startSide='w',busy=false;

const section=$('puzzles');if(!section)return;
section.innerHTML=`
<div class="v12-shell">
  <header class="v12-top">
    <div><span class="eyebrow">TACTICAL GYM / V12</span><h1>Find the move.</h1></div>
    <div class="v12-stats"><button id="v12Rating"><small>PUZZLE</small><b>600</b></button><button id="v12Xp"><small>LEVEL 1</small><b>Pawn Scout</b></button><button id="v12Streak"><small>STREAK</small><b>🔥 0</b></button></div>
  </header>
  <div class="v12-quest"><div><b id="v12QuestText">Daily quest · 0 / 5</b><span id="v12QuestSub">Five good puzzles is enough for today.</span></div><div class="v12-quest-track"><i id="v12QuestBar"></i></div></div>
  <div class="v12-themes" id="v12Themes"></div>
  <div class="v12-main">
    <section class="v12-board-card"><div id="v12PuzzleBoard" class="chess-board v12-board" aria-label="Tactical puzzle board"></div></section>
    <aside class="v12-coach">
      <div class="v12-puzzle-head"><div><span id="v12Theme" class="eyebrow">MIXED</span><h2 id="v12Title">Tactical position</h2></div><span id="v12Difficulty">600</span></div>
      <p id="v12Prompt">White to move. Find the best move.</p>
      <div id="v12Feedback" class="v12-feedback">Checks → captures → threats. Then ask what is loose.</div>
      <div class="v12-actions"><button id="v12Hint">Hint</button><button id="v12Skip">Skip</button><button id="v12Next" class="primary">Next</button></div>
      <button id="v12MasteryBtn" class="v12-mastery-button">Theme mastery <span>›</span></button>
    </aside>
  </div>
</div>
<div id="v12Celebration" class="v12-celebration" hidden><div><span>LEVEL UP</span><b id="v12LevelUp">Knight Cadet</b><button id="v12CelebrateClose">Continue</button></div></div>
<div id="v12Mastery" class="v12-sheet" hidden><button class="v12-sheet-backdrop" data-close-master></button><div class="v12-sheet-card"><div class="v12-sheet-head"><div><span class="eyebrow">TACTICAL PROFILE</span><h2>Your pattern mastery</h2></div><button data-close-master>×</button></div><div id="v12MasteryList" class="v12-mastery-list"></div><div id="v12Achievements" class="v12-achievements"></div></div></div>`;

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function pieceNode(piece){const span=document.createElement('span');span.className='piece '+(piece[0]==='w'?'white':'black');span.dataset.svgPiece=piece[1];const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','./pieces.svg#'+piece[1]);svg.appendChild(use);span.appendChild(svg);return span}
function renderBoard(){const el=$('v12PuzzleBoard');el.innerHTML='';if(!pos)return;const black=startSide==='b',ranks=black?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1],files=black?[...'hgfedcba']:[...'abcdefgh'];const legal=selected?new Set(C.legalMoves(pos,selected).map(m=>m.to)):new Set();for(const r of ranks)for(const f of files){const sq=f+r,b=document.createElement('button');b.className='square '+(((f.charCodeAt(0)-97+r)%2===0)?'dark':'light');b.dataset.square=sq;if(selected===sq)b.classList.add('selected');if(legal.has(sq))b.classList.add('legal');if(hintStage>=2&&current?.line[step]?.slice(0,2)===sq)b.classList.add('v12-hint-square');const pc=C.pieceAt(pos,sq);if(pc)b.appendChild(pieceNode(pc));if(r===(black?8:1)){const c=document.createElement('span');c.className='coord file';c.textContent=f;b.appendChild(c)}if(f===(black?'h':'a')){const c=document.createElement('span');c.className='coord rank';c.textContent=r;b.appendChild(c)}b.onclick=()=>onSquare(sq);el.appendChild(b)}}
function emit(correct){document.dispatchEvent(new CustomEvent('cc:puzzle',{detail:{correct,puzzle:current,puzzleIndex:-1,attempt:current?.line?.[step]}}))}
function expected(){return current?.line?.[step]||null}
function onSquare(sq){if(!current||solved||busy||step%2===1)return;const pc=C.pieceAt(pos,sq);if(selected){const exp=expected(),raw=selected+sq,uci=exp?.length===5&&raw===exp.slice(0,4)?exp:raw;if(uci===exp){const n=C.make(pos,uci);if(!n)return;pos=n;selected=null;step++;renderBoard();if(step>=current.line.length){finish();return}autoReply();return}attempts++;if(attempts===1){S.streak=0;emit(false)}$('v12Feedback').innerHTML='<b>Not quite.</b> Reset the scan: checks → captures → threats.';$('v12PuzzleBoard').classList.remove('shake');requestAnimationFrame(()=>$('v12PuzzleBoard').classList.add('shake'));if(pc&&pc[0]===pos.turn)selected=sq;else selected=null;renderBoard();return}if(pc&&pc[0]===pos.turn){selected=sq;renderBoard()}}
function autoReply(){busy=true;$('v12Feedback').textContent='Good. Follow the line…';setTimeout(()=>{while(step<current.line.length&&step%2===1){const n=C.make(pos,current.line[step]);if(!n){busy=false;$('v12Feedback').textContent='This training line needs repair.';return}pos=n;step++}busy=false;renderBoard();if(step>=current.line.length)finish();else $('v12Feedback').textContent=(pos.turn==='w'?'White':'Black')+' to move. Finish the tactic.'},420)}
function unlock(id,label){if(S.achievements[id])return false;S.achievements[id]={at:Date.now(),label};return true}
function finish(){if(solved)return;solved=true;const clean=attempts===0&&hintStage===0,oldLevel=P.levelForXp(S.xp),d=daily(),t=stat(current.theme);S.streak++;S.bestStreak=Math.max(S.bestStreak,S.streak);S.solved++;t.attempts++;t.correct++;if(clean)t.firstTry++;t.bestStreak=Math.max(t.bestStreak,S.streak);d.solved++;if(clean)d.firstTry++;const completes=d.solved===d.target,gain=P.xpGain({correct:true,firstTry:clean,streak:S.streak,dailyComplete:completes}),delta=P.ratingDelta(S.rating,current.rating,true,clean);S.xp+=gain;d.xp+=gain;S.rating=clamp(S.rating+delta,300,3000);S.seen=[current.id,...S.seen.filter(x=>x!==current.id)].slice(0,60);emit(true);
 unlock('first','First blood · solve your first puzzle');if(S.streak>=3)unlock('streak3','On fire · 3 clean solves in a row');if(S.streak>=5)unlock('streak5','Tactical flow · 5 in a row');if(d.solved>=d.target)unlock('daily','Daily complete · finish a daily quest');if(S.rating>=1000)unlock('rating1000','Four digits · reach 1000 puzzle rating');if(S.solved>=25)unlock('solve25','Pattern hunter · solve 25 puzzles');
 save();$('v12Feedback').innerHTML=`<b>Correct${clean?' · first try':''}.</b> ${esc(current.explain)} <span class="v12-reward">+${gain} XP · ${delta>=0?'+':''}${delta} rating</span>`;$('v12Next').classList.add('pulse');const newLevel=P.levelForXp(S.xp);if(newLevel>oldLevel){$('v12LevelUp').textContent=`Level ${newLevel} · ${P.rankForLevel(newLevel)}`;$('v12Celebration').hidden=false}renderBoard()}
function choosePuzzle(){const pool=bank(),useTheme=theme==='Personal'?'Personal':theme;current=P.choose(pool,{theme:useTheme,rating:S.rating,seen:S.seen,themeStats:S.themes});if(!current&&theme==='Personal'){theme='Mixed';current=P.choose(pool,{theme:'Mixed',rating:S.rating,seen:S.seen,themeStats:S.themes})}pos=C.fromFEN(current.fen);startSide=pos.turn;selected=null;step=0;attempts=0;hintStage=0;solved=false;busy=false;$('v12Title').textContent=current.title;$('v12Theme').textContent=current.theme.toUpperCase();$('v12Difficulty').textContent=current.rating;$('v12Prompt').textContent=(pos.turn==='w'?'White':'Black')+' to move. Find the best continuation.';$('v12Feedback').textContent='Checks → captures → threats. Then ask what is loose.';$('v12Next').classList.remove('pulse');renderBoard();renderMeta()}
function hint(){if(!current||solved)return;hintStage++;if(hintStage===1)$('v12Feedback').innerHTML='<b>Hint.</b> '+esc(current.hint||'Look for the most forcing move.');else if(hintStage===2)$('v12Feedback').innerHTML='<b>Source highlighted.</b> Which square should that piece reach?';else{$('v12Feedback').innerHTML='<b>Move.</b> '+expected().slice(0,2).toUpperCase()+' → '+expected().slice(2,4).toUpperCase();hintStage=3}renderBoard()}
function skip(){S.streak=0;save();choosePuzzle()}
function masteryList(){const all=[...P.THEMES.filter(x=>x!=='Mixed'),'Personal'];$('v12MasteryList').innerHTML=all.map(t=>{const s=S.themes[t]||{},m=P.mastery(s);return`<div><div><b>${esc(t)}</b><span>${s.correct||0}/${s.attempts||0} solved</span></div><div class="v12-mastery-track"><i style="width:${m}%"></i></div><strong>${m}%</strong></div>`}).join('');const a=Object.values(S.achievements);$('v12Achievements').innerHTML='<span class="eyebrow">ACHIEVEMENTS</span><div>'+((a.length?a.map(x=>`<span>✓ ${esc(x.label)}</span>`).join(''):'<span>Solve your first puzzle to unlock the first badge.</span>'))+'</div>'}
function renderThemes(){const personalCount=personal().length,themes=[...P.THEMES,...(personalCount?['Personal']:[])];$('v12Themes').innerHTML=themes.map(t=>`<button class="${t===theme?'active':''}" data-theme="${esc(t)}">${esc(t)}${t==='Personal'?` <small>${personalCount}</small>`:''}</button>`).join('');$('v12Themes').querySelectorAll('button').forEach(b=>b.onclick=()=>{theme=b.dataset.theme;renderThemes();choosePuzzle()})}
function renderMeta(){const d=daily(),lvl=P.levelForXp(S.xp),next=P.xpForLevel(lvl+1),prev=P.xpForLevel(lvl),progress=clamp((S.xp-prev)/Math.max(1,next-prev)*100,0,100);$('v12Rating').querySelector('b').textContent=Math.round(S.rating);$('v12Xp').querySelector('small').textContent=`LEVEL ${lvl} · ${Math.round(progress)}%`;$('v12Xp').querySelector('b').textContent=P.rankForLevel(lvl);$('v12Streak').querySelector('b').textContent=`🔥 ${S.streak}`;$('v12QuestText').textContent=`Daily quest · ${Math.min(d.solved,d.target)} / ${d.target}`;$('v12QuestSub').textContent=d.solved>=d.target?`Complete · ${d.xp} XP earned today`:`${d.target-d.solved} puzzle${d.target-d.solved===1?'':'s'} left · clean solves earn more XP`;$('v12QuestBar').style.width=clamp(d.solved/d.target*100,0,100)+'%';masteryList()}

$('v12Hint').onclick=hint;$('v12Skip').onclick=skip;$('v12Next').onclick=choosePuzzle;$('v12MasteryBtn').onclick=()=>{$('v12Mastery').hidden=false;masteryList()};document.querySelectorAll('[data-close-master]').forEach(b=>b.onclick=()=>$('v12Mastery').hidden=true);$('v12CelebrateClose').onclick=()=>{$('v12Celebration').hidden=true;choosePuzzle()};$('v12Rating').onclick=()=>{$('v12Mastery').hidden=false;masteryList()};$('v12Xp').onclick=()=>{$('v12Mastery').hidden=false;masteryList()};$('v12Streak').onclick=()=>{$('v12Mastery').hidden=false;masteryList()};
renderThemes();choosePuzzle();
})();
