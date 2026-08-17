(function(){
'use strict';
const SQ=/^[a-h][1-8]$/;
function isDark(name){
  if(!SQ.test(name||''))return null;
  const file=name.charCodeAt(0)-97,rank=Number(name[1]);
  return (file+rank)%2===1;
}
function normalizeSquare(el){
  if(!el?.classList?.contains('square'))return;
  const dark=isDark(el.dataset.square);
  if(dark===null)return;
  el.classList.toggle('dark',dark);
  el.classList.toggle('light',!dark);
}
function normalize(root=document){
  if(root?.matches?.('.square[data-square]'))normalizeSquare(root);
  root?.querySelectorAll?.('.square[data-square]').forEach(normalizeSquare);
}
function audit(board){
  if(!board)return{ok:false,error:'missing board'};
  const squares=[...board.querySelectorAll('.square[data-square]')],names=squares.map(x=>x.dataset.square),unique=new Set(names);
  const dark=squares.filter(x=>x.classList.contains('dark')&&!x.classList.contains('light')).length;
  const light=squares.filter(x=>x.classList.contains('light')&&!x.classList.contains('dark')).length;
  const at=name=>board.querySelector(`.square[data-square="${name}"]`);
  const corners={a1:at('a1')?.classList.contains('dark')===true,h1:at('h1')?.classList.contains('light')===true,a8:at('a8')?.classList.contains('light')===true,h8:at('h8')?.classList.contains('dark')===true};
  const parity=squares.every(el=>{const d=isDark(el.dataset.square);return d===null||(el.classList.contains('dark')===d&&el.classList.contains('light')===!d)});
  const ok=squares.length===64&&unique.size===64&&dark===32&&light===32&&parity&&Object.values(corners).every(Boolean);
  return{ok,count:squares.length,unique:unique.size,dark,light,corners,parity,error:ok?null:'board geometry invariant failed'};
}
function assert(board){const result=audit(board);if(!result.ok)throw new Error('Chess board integrity: '+JSON.stringify(result));return result}
normalize();
new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1)normalize(n)}).observe(document.documentElement,{childList:true,subtree:true});
window.ChessBoardIntegrity={isDark,normalize,audit,assert};
document.dispatchEvent(new CustomEvent('cc:boardintegrity'));
})();
