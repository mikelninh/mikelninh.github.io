(function(){
'use strict';
const map={'♔':'K','♕':'Q','♖':'R','♗':'B','♘':'N','♙':'P','♚':'K','♛':'Q','♜':'R','♝':'B','♞':'N','♟':'P'};
function upgrade(root=document){
  root.querySelectorAll('.piece:not([data-svg-piece])').forEach(el=>{
    const type=map[(el.textContent||'').trim()];
    if(!type)return;
    el.dataset.svgPiece=type;
    el.textContent='';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 100 100');
    svg.setAttribute('aria-hidden','true');
    svg.setAttribute('focusable','false');
    const use=document.createElementNS('http://www.w3.org/2000/svg','use');
    use.setAttribute('href','./pieces.svg#'+type);
    svg.appendChild(use);el.appendChild(svg);
  });
}
upgrade();
const observer=new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)upgrade(n)})));
['gameBoard','learnBoard','puzzleBoard'].forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el,{childList:true,subtree:true})});
})();
