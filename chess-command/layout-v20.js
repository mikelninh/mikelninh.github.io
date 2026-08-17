(function(){
'use strict';
const play=document.getElementById('play'),puzzles=document.getElementById('puzzles');
if(!play||!puzzles)return;
function sync(){
  document.body.classList.toggle('viewport-play-active',play.classList.contains('active'));
  document.body.classList.toggle('viewport-puzzle-active',puzzles.classList.contains('active'));
}
new MutationObserver(sync).observe(play,{attributes:true,attributeFilter:['class']});
new MutationObserver(sync).observe(puzzles,{attributes:true,attributeFilter:['class']});
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(sync)));
addEventListener('resize',sync,{passive:true});
sync();
})();
