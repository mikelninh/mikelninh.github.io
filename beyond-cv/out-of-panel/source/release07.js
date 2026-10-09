/* OUT OF PANEL 0.7 — the first ten seconds. No autoplay, no tracking. */
(()=>{'use strict';
const hint=document.querySelector('#portal-hint');
const coin=document.querySelector('#coin');
const activate=document.querySelector('#look-inside');
if(!hint||!coin||!activate)return;
const first='Turn the coin. There is a rooftop hiding in that opening.';
const second='See that little window? Look inside when you are ready.';
let touched=false;
const update=()=>{if(touched)return;touched=true;hint.textContent=second;document.body.classList.add('oop07-curious');};
hint.textContent=first;
for(const id of ['#spin-object','#rotate-left','#rotate-right','#flip-object']){
 document.querySelector(id)?.addEventListener('click',update,{once:true});
}
coin.addEventListener('pointerup',update,{once:true});
coin.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(e.key))update();});
activate.addEventListener('click',()=>document.body.classList.add('oop07-entered'));
const m=window.matchMedia('(prefers-reduced-motion: reduce)');
const firstVisit=()=>{try{return sessionStorage.getItem('oop07-onboarded')!=='1'}catch{return true}};
if(firstVisit()){document.body.classList.add('oop07-first-visit');try{sessionStorage.setItem('oop07-onboarded','1')}catch{}}
const trackView=()=>{if(document.body.dataset.view!=='object'){document.body.classList.remove('oop07-peek');return}
  document.body.classList.add('oop07-peek');
};
const observer=new MutationObserver(trackView);observer.observe(document.body,{attributes:true,attributeFilter:['data-view']});trackView();
window.OutOfPanel07=Object.freeze({version:'0.7.0',getState:()=>({touched,entered:document.body.classList.contains('oop07-entered')})});
})();