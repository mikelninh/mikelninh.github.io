(function(){
'use strict';
const section=document.getElementById('puzzles');if(!section)return;
function sync(){const mobile=matchMedia('(max-width:760px)').matches,active=section.classList.contains('active');document.body.classList.toggle('puzzle-screen-active',mobile&&active)}
new MutationObserver(sync).observe(section,{attributes:true,attributeFilter:['class']});
matchMedia('(max-width:760px)').addEventListener?.('change',sync);
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(sync)));
sync();
})();
