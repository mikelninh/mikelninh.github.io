(function(){
'use strict';
const $=id=>document.getElementById(id);
function isMobile(){return matchMedia('(max-width:760px)').matches}
const play=$('play'),boardColumn=document.querySelector('#play .board-column'),panel=document.querySelector('#play .side-panel');
if(!play||!boardColumn||!panel)return;
const bar=document.createElement('div');bar.className='mobile-gamebar';bar.innerHTML='<button data-sheet="opponent"><span>♜</span><b>Level</b></button><button data-sheet="coach"><span>✦</span><b>Hint</b></button><button data-sheet="moves"><span>☷</span><b>Moves</b></button><button id="mobileNew"><span>↻</span><b>New</b></button>';
boardColumn.appendChild(bar);
const close=document.createElement('button');close.className='sheet-close';close.type='button';close.setAttribute('aria-label','Close panel');close.textContent='×';panel.prepend(close);
const backdrop=document.createElement('button');backdrop.type='button';backdrop.className='sheet-backdrop';backdrop.setAttribute('aria-label','Close panel');document.body.appendChild(backdrop);
function setSide(id){document.querySelectorAll('.panel-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.side===id));document.querySelectorAll('.side-view').forEach(v=>v.classList.toggle('active',v.id==='side-'+id))}
function openSheet(id){if(!isMobile())return;setSide(id);panel.classList.add('mobile-open');document.body.classList.add('game-sheet-open')}
function closeSheet(){panel.classList.remove('mobile-open');document.body.classList.remove('game-sheet-open')}
bar.querySelectorAll('[data-sheet]').forEach(b=>b.onclick=()=>openSheet(b.dataset.sheet));
bar.querySelector('#mobileNew').onclick=()=>{document.getElementById('newGameBtn')?.click()};
close.onclick=closeSheet;backdrop.onclick=closeSheet;
panel.querySelectorAll('.panel-tabs button').forEach(b=>b.addEventListener('click',()=>{if(isMobile())panel.scrollTo({top:0,behavior:'smooth'})}));
function syncScreen(){const active=play.classList.contains('active');document.body.classList.toggle('play-screen-active',active&&isMobile());if(!active)closeSheet()}
new MutationObserver(syncScreen).observe(play,{attributes:true,attributeFilter:['class']});
matchMedia('(max-width:760px)').addEventListener?.('change',syncScreen);
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(syncScreen)));
syncScreen();
})();
