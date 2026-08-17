(function(){
'use strict';
function addPlayLabels(){const opp=document.querySelector('#play .player-row.opponent b'),you=document.querySelector('#play .player-row:not(.opponent) b');if(opp&&!opp.querySelector('.side-tag-v21'))opp.insertAdjacentHTML('beforeend','<span class="side-tag-v21 black">BLACK · OPPONENT</span>');if(you&&!you.querySelector('.side-tag-v21'))you.insertAdjacentHTML('beforeend','<span class="side-tag-v21 white">WHITE · YOU</span>');const board=document.getElementById('gameBoard');if(board){board.tabIndex=0;board.setAttribute('aria-label','Chess board. You play White. Drag a white piece, or tap it and then a highlighted square.')}}
function decorate(root=document){const boards=root.matches?.('.chess-board')?[root]:[...root.querySelectorAll?.('.chess-board')||[]];for(const board of boards){board.querySelectorAll('.square').forEach(s=>{const legal=s.classList.contains('legal');s.classList.toggle('capture-target',legal&&!!s.querySelector('.piece'));if(!s.hasAttribute('aria-label'))s.setAttribute('aria-label',s.dataset.square||'chess square')})}}
function sync(){addPlayLabels();decorate()}
new MutationObserver(records=>{let needed=false;for(const r of records){if(r.type==='childList'&&r.addedNodes.length){needed=true;break}}if(needed)requestAnimationFrame(sync)}).observe(document.body,{childList:true,subtree:true});
['cc:newgame','cc:move','cc:puzzleview','cc:puzzle','cc:pieceskin'].forEach(e=>document.addEventListener(e,()=>requestAnimationFrame(sync)));
sync();
})();
