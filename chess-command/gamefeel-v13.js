(function(){
'use strict';
const C=window.ChessCore;const KEY='chess-command-gamefeel-v13';
function load(){try{return Object.assign({sound:true,haptics:true},JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return{sound:true,haptics:true}}}
let S=load(),ctx=null,synthetic=false,drag=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}}
function audio(){if(!S.sound)return null;try{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}catch{return null}}
function tone(freq=420,dur=.035,gain=.035,type='sine'){const a=audio();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+dur);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+dur)}
function buzz(pattern){if(S.haptics&&navigator.vibrate)navigator.vibrate(pattern)}
function piecesInFen(fen){return((fen||'').split(' ')[0].match(/[prnbqkPRNBQK]/g)||[]).length}
function pulse(cls,ms=420){const shell=document.querySelector('#play .board-shell');if(!shell)return;shell.classList.remove(cls);requestAnimationFrame(()=>shell.classList.add(cls));setTimeout(()=>shell.classList.remove(cls),ms)}
function addToggle(){const actions=document.querySelector('.top-actions');if(!actions||document.getElementById('feelToggle'))return;const b=document.createElement('button');b.id='feelToggle';b.className='icon-btn';b.title='Sound & haptics';b.textContent=S.sound?'♪':'×';b.onclick=()=>{S.sound=!S.sound;S.haptics=S.sound;save();b.textContent=S.sound?'♪':'×';if(S.sound){tone(620,.05,.04);buzz(12)}};actions.insertBefore(b,actions.firstChild)}
let lastPieces=32;
document.addEventListener('cc:move',e=>{const n=piecesInFen(e.detail.fen),capture=n<lastPieces;lastPieces=n;let st=null;try{st=C?.status(C.fromFEN(e.detail.fen))}catch{}if(st?.check){tone(760,.06,.05,'triangle');setTimeout(()=>tone(520,.05,.035,'triangle'),65);buzz([18,20,28]);pulse('cc-check-flash',520)}else if(capture){tone(230,.05,.05,'square');buzz(16);pulse('cc-capture-pulse',260)}else{tone(e.detail.side==='w'?470:390,.03,.025);buzz(7)}});
document.addEventListener('cc:newgame',()=>{lastPieces=32});
document.addEventListener('cc:gameover',e=>{if(e.detail.score===1){tone(523,.08,.05);setTimeout(()=>tone(659,.08,.05),90);setTimeout(()=>tone(784,.13,.05),180);buzz([30,35,60]);pulse('cc-win-glow',1200)}else{tone(240,.12,.04,'triangle');buzz(25)}});
document.addEventListener('cc:puzzle',e=>{if(e.detail.correct){tone(660,.05,.035);setTimeout(()=>tone(880,.06,.03),55);buzz(10)}else{tone(180,.05,.025,'square');buzz(18)}});
function dragStart(e){if(e.button!==undefined&&e.button!==0)return;const sq=e.target.closest('.square'),board=e.target.closest('.chess-board');if(!sq||!board||!sq.querySelector('.piece'))return;const r=sq.getBoundingClientRect(),ghost=sq.querySelector('.piece').cloneNode(true);ghost.classList.add('cc-drag-ghost');document.body.appendChild(ghost);drag={board,from:sq,ghost,x:e.clientX,y:e.clientY,moved:false,pid:e.pointerId};placeGhost(e.clientX,e.clientY,r.width);try{sq.setPointerCapture?.(e.pointerId)}catch{}}
function placeGhost(x,y,size){if(!drag)return;const s=size||drag.from.getBoundingClientRect().width;Object.assign(drag.ghost.style,{width:s+'px',height:s+'px',left:(x-s/2)+'px',top:(y-s/2)+'px'})}
function dragMove(e){if(!drag||e.pointerId!==drag.pid)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7)drag.moved=true;placeGhost(e.clientX,e.clientY)}
function dragEnd(e){if(!drag||e.pointerId!==drag.pid)return;const d=drag;drag=null;d.ghost.remove();if(!d.moved)return;const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('.square');if(!hit||hit.closest('.chess-board')!==d.board)return;synthetic=true;d.from.click();hit.click();setTimeout(()=>synthetic=false,0)}
document.addEventListener('pointerdown',dragStart,{passive:true});document.addEventListener('pointermove',dragMove,{passive:true});document.addEventListener('pointerup',dragEnd,{passive:true});document.addEventListener('click',e=>{if(!synthetic&&drag?.moved)e.preventDefault()},true);
addToggle();new MutationObserver(addToggle).observe(document.body,{childList:true,subtree:true});
})();
