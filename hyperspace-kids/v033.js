(()=>{'use strict';
const RIP='https://v3b.fal.media/files/b/0aa8b54d/FBcgk3FDqeNSJdxjRRMFt_minimax-h3.mp4';
const CARD_BACK='https://v3b.fal.media/files/b/0aa8ae94/agbnm-0Y6-w0SAY1dATVq_LuK5HT1D.webp';
const ritual=document.querySelector('#ritual'),truth=document.querySelector('#truth'),range=document.querySelector('#range'),card=document.querySelector('#card'),front=document.querySelector('#front'),reveal=document.querySelector('#reveal');
const build=document.querySelector('.build');if(build)build.innerHTML='<b>REAL DEPTH</b>SIGNAL//ULTRA · 0.34.0';

if(ritual&&truth&&range){
  const v=document.createElement('video');v.className='authoredRip';v.muted=true;v.playsInline=true;v.preload='auto';v.src=RIP;truth.prepend(v);
  const hint=document.createElement('div');hint.className='seamHint';hint.textContent='DRAG FOIL SEAM →';truth.append(hint);
  let dragging=false,startX=0,startValue=0;
  const setValue=n=>{const value=Math.max(0,Math.min(100,n));range.value=String(value);range.dispatchEvent(new Event('input',{bubbles:true}))};
  const scrub=()=>{const p=Number(range.value)/100;if(v.duration&&Number.isFinite(v.duration)){try{v.currentTime=Math.min(v.duration-.025,Math.max(0,v.duration*p))}catch{}};truth.style.setProperty('--directP',p)};
  v.addEventListener('loadedmetadata',()=>{truth.classList.add('videoReady');try{v.currentTime=0}catch{}});
  range.addEventListener('input',scrub);range.addEventListener('change',scrub);
  const begin=e=>{if(e.button!==undefined&&e.button!==0)return;dragging=true;startX=e.clientX;startValue=Number(range.value);truth.classList.add('dragging');hint.classList.add('used');try{truth.setPointerCapture(e.pointerId)}catch{};e.preventDefault()};
  const move=e=>{if(!dragging)return;const r=truth.getBoundingClientRect();const dx=e.clientX-startX;setValue(startValue+(dx/(r.width*.72))*100);e.preventDefault()};
  const end=e=>{if(!dragging)return;dragging=false;truth.classList.remove('dragging');try{truth.releasePointerCapture(e.pointerId)}catch{};range.dispatchEvent(new Event('change',{bubbles:true}));e.preventDefault()};
  truth.addEventListener('pointerdown',begin);truth.addEventListener('pointermove',move);truth.addEventListener('pointerup',end);truth.addEventListener('pointercancel',end);
  document.querySelector('#autoOpen')?.addEventListener('click',()=>setTimeout(()=>{if(v.duration)try{v.currentTime=v.duration-.03}catch{}},30));
  const reset=()=>{try{v.currentTime=0}catch{};truth.style.setProperty('--directP',0);hint.classList.remove('used')};
  document.querySelector('#openPack')?.addEventListener('click',reset);document.querySelector('#heroPack')?.addEventListener('click',reset);
}

if(card&&front){
  const stage=card.parentElement;
  const rig=document.createElement('div');rig.className='tiltRig';stage.insertBefore(rig,card);rig.append(card);
  const depth=document.createElement('div');depth.className='artDepthLayer';depth.innerHTML='<img alt="">';rig.append(depth);
  const subject=document.createElement('div');subject.className='frameBreakSubject';subject.innerHTML='<img alt="">';rig.append(subject);
  const light=document.createElement('div');light.className='depthLight';rig.append(light);
  const hint=document.createElement('div');hint.className='tiltHint';hint.textContent='DRAG / TILT TO INSPECT';stage.insertBefore(hint,document.querySelector('#finalLabel'));
  document.documentElement.style.setProperty('--hk-card-back',`url("${CARD_BACK}")`);
  const sync=()=>{const src=front.currentSrc||front.src;depth.querySelector('img').src=src;subject.querySelector('img').src=src};
  new MutationObserver(sync).observe(front,{attributes:true,attributeFilter:['src']});front.addEventListener('load',sync);sync();
  const syncFace=()=>rig.classList.toggle('frontVisible',card.classList.contains('flip'));
  new MutationObserver(syncFace).observe(card,{attributes:true,attributeFilter:['class']});syncFace();
  const apply=(clientX,clientY)=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=rig.getBoundingClientRect();const nx=Math.max(-1,Math.min(1,((clientX-r.left)/r.width-.5)*2));const ny=Math.max(-1,Math.min(1,((clientY-r.top)/r.height-.5)*2));rig.style.setProperty('--rx',`${-ny*16}deg`);rig.style.setProperty('--ry',`${nx*19}deg`);rig.style.setProperty('--mx',`${(nx*.5+.5)*100}%`);rig.style.setProperty('--my',`${(ny*.5+.5)*100}%`);rig.style.setProperty('--adx',`${nx*9}px`);rig.style.setProperty('--ady',`${ny*8}px`);rig.style.setProperty('--fdx',`${nx*18}px`);rig.style.setProperty('--fdy',`${ny*14}px`);rig.classList.add('interacting');hint.classList.add('used')};
  const reset=()=>{rig.style.setProperty('--rx','0deg');rig.style.setProperty('--ry','0deg');rig.style.setProperty('--adx','0px');rig.style.setProperty('--ady','0px');rig.style.setProperty('--fdx','0px');rig.style.setProperty('--fdy','0px');rig.classList.remove('interacting')};
  let touch=false;
  rig.addEventListener('pointerdown',e=>{touch=true;try{rig.setPointerCapture(e.pointerId)}catch{};apply(e.clientX,e.clientY);e.preventDefault()});
  rig.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||touch)apply(e.clientX,e.clientY)});
  rig.addEventListener('pointerup',e=>{touch=false;try{rig.releasePointerCapture(e.pointerId)}catch{};setTimeout(reset,60)});
  rig.addEventListener('pointercancel',()=>{touch=false;reset()});rig.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!touch)reset()});
}

if(reveal){
  let grail=false;
  const sync=()=>{
    const myth=reveal.classList.contains('mythicMode');document.body.classList.toggle('grail',myth);
    const hint=document.querySelector('.tiltHint');if(hint)hint.textContent=myth?'TOUCH THE GRAIL · TILT TO INSPECT':'DRAG / TILT TO INSPECT';
    if(myth&&!grail){grail=true;const h=document.querySelector('#rh'),p=document.querySelector('#ro');if(h)h.innerHTML='Reality<br><em>opens.</em>';if(p)p.innerHTML='<strong>THE FIRST SIGNAL HAS BEEN FOUND.</strong><br><span>GENESIS // 001 · 001 / 010</span>'}
    if(!myth)grail=false;
  };
  new MutationObserver(sync).observe(reveal,{attributes:true,attributeFilter:['class']});sync();
}
})();
