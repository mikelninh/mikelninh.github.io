
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const page=document.documentElement;
let raf=0;
function progress(){raf=0;const bar=$('.progress');if(!bar)return;let total=document.documentElement.scrollHeight-innerHeight;bar.style.width=(total>0?Math.min(100,Math.max(0,scrollY/total*100)):0)+'%';}
window.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(progress)},{passive:true});window.addEventListener('resize',progress,{passive:true});progress();
const filters=$$('[data-filter]'),stories=$$('[data-story-cats]');
if(filters.length){
const counter=$('[data-count]');
filters.forEach(btn=>btn.addEventListener('click',()=>{
 const key=btn.dataset.filter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
 let visible=0;
 stories.forEach(el=>{const groups=(el.dataset.storyCats||'').split(' ');const show=key==='all'||groups.includes(key);el.hidden=!show;if(show)visible++;});
 if(counter)counter.textContent=visible+' '+(visible===1?'story':'stories')+' to explore';
}));
}
async function share(){
const title=$('h1')?.textContent?.trim()||document.title;const url=location.href;
if(navigator.share){try{await navigator.share({title,url});return;}catch(e){if(e?.name==='AbortError')return;}}
try{await navigator.clipboard.writeText(url);$$('[data-share]').forEach(b=>{b.textContent='Link copied ✓';});}catch(e){window.prompt('Copy this story link',url);}
}
$$('[data-share]').forEach(b=>b.addEventListener('click',share));
const lensTexts={
observe:{title:'Notice',text:'Take a moment to observe your natural breathing — or simply feel your feet on the ground. Nothing needs fixing. We can be curious without turning every moment into a project.'},
biology:{title:'Understand',text:'Automatic breathing is coordinated by networks in the brainstem, informed by the body’s changing needs. We can also influence breathing voluntarily. The two modes coexist rather than compete.'},
living:{title:'Carry it into life',text:'Consider a conversation that matters. What might change if we participated fully but stopped trying to control every response? We can be wholehearted without gripping everything so tightly.'}
};
$$('[data-lens]').forEach(btn=>btn.addEventListener('click',()=>{
const val=btn.dataset.lens;
$$('[data-lens]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
const out=$('[data-lens-result]');const item=lensTexts[val];if(out&&item){out.replaceChildren();const strong=document.createElement('strong');strong.textContent=item.title;const span=document.createElement('span');span.textContent=item.text;out.append(strong,span);}
}));
const focus=$('[data-focus]');
if(focus)focus.addEventListener('click',()=>{
const on=document.body.classList.toggle('focus-reading');
focus.setAttribute('aria-pressed',String(on));
focus.textContent=on?'Exit focus mode':'Focus reading';
});
let size=0;function adjustSize(next){size=Math.max(-2,Math.min(3,next));const article=$('.prose');if(article)article.style.setProperty('font-size',(20+size*1.75)+'px','important');const label=$('[data-type-label]');if(label)label.textContent='Type '+(size>0?'+'+size:size<0?size:'default');}
$$('[data-type-change]').forEach(btn=>btn.addEventListener('click',()=>adjustSize(size+Number(btn.dataset.typeChange))));
const movement=$('[data-motion]');const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(movement){
if(reduce){document.body.classList.add('motion-off');movement.setAttribute('aria-pressed','false');movement.disabled=true;movement.textContent='Motion off (system preference)';}
else movement.addEventListener('click',()=>{const off=document.body.classList.toggle('motion-off');movement.setAttribute('aria-pressed',String(!off));movement.textContent=off?'Enable quiet motion':'Pause quiet motion';});
}
})();
