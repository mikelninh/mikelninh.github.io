/* Enhancement only: the established atlas, sources and privacy model are unchanged. */
'use strict';
(() => {
 const $=s=>document.querySelector(s);let current='biological';
 const notes={biological:'Even a simple meal is a meeting of lives.',ecological:'The living world is not a backdrop. You are within it.',social:'Care is a connection that flows both ways.',economic:'Behind a choice, there are people. Behind them, a system.',future:'Some lives affected by today’s choices cannot speak yet.'};
 const paths={biological:'M310 268C284 307 95 165 85 305',ecological:'M310 268C296 217 156 166 217 103',social:'M310 268C263 334 123 386 192 423',economic:'M310 268C407 289 543 296 456 422',future:'M310 268C385 160 430 135 493 178'};
 function choose(lens){if(!notes[lens])return;current=lens;$('#field-insight').textContent=notes[lens];$('#selected-thread').setAttribute('d',paths[lens]);document.querySelectorAll('[data-hero-lens]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.heroLens===lens)));}
 function follow(){document.querySelector('[data-scene="self"]').click();$('#lens').value=current;$('#lens').dispatchEvent(new Event('change',{bubbles:true}));$('#atlas').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 function activate(target){const node=target.closest('[data-hero-lens],[data-hero-personal]');if(!node)return false;if(node.dataset.heroLens)choose(node.dataset.heroLens);else $('#find-place').click();return true;}
 $('.hero-art').addEventListener('click',ev=>{if(ev.target.closest('#follow-field'))follow();else activate(ev.target);});
 $('.hero-art').addEventListener('keydown',ev=>{if(['Enter',' '].includes(ev.key)&&ev.target.closest('[data-hero-lens],[data-hero-personal]')){ev.preventDefault();activate(ev.target);}});
 window.InterbeingDesign={version:'02',selectedPerspective:()=>current};
})();
