(()=>{'use strict';
const $=s=>document.querySelector(s);
const reveal=$('#reveal'),next=$('#nextReveal'),card=$('#signalCard'),count=$('#revealCount'),meta=$('#revealMeta'),kicker=$('#revealKicker'),origin=$('#revealOrigin'),headline=$('#revealHeadline'),flash=$('#flash');
if(!reveal||!next||!card||!count)return;
const oldNext=next.onclick;
let finalStage='idle',advancing=false,unlockTimer=0;
const build=$('.build');if(build)build.innerHTML='<b>THE FIRST SIGNAL</b>SIGNAL//ULTRA · 0.21.0';
let caption=document.createElement('div');caption.className='final-signal-caption';caption.textContent='FINAL SIGNAL // 05';reveal.appendChild(caption);
function button(label,enabled){const l=next.querySelector('.cta-label');if(l)l.textContent=label;next.disabled=!enabled;next.style.opacity=enabled?'1':'.22';next.style.pointerEvents=enabled?'auto':'none'}
function tinyTone(){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=new A();const now=c.currentTime;[[64,0,.035],[256,.16,.018],[512,.29,.012]].forEach(([f,d,g])=>{const o=c.createOscillator(),v=c.createGain();o.type='sine';o.frequency.value=f;v.gain.setValueAtTime(.0001,now+d);v.gain.exponentialRampToValueAtTime(g,now+d+.025);v.gain.exponentialRampToValueAtTime(.0001,now+d+.75);o.connect(v).connect(c.destination);o.start(now+d);o.stop(now+d+.8)});setTimeout(()=>c.close().catch(()=>{}),1600)}catch{}}
function resetFinal(){clearTimeout(unlockTimer);finalStage='idle';advancing=false;next.dataset.finalStage='';reveal.classList.remove('final-pending','final-revealing');card.classList.remove('final-locked')}
function armFinal(){if(finalStage!=='idle')return;finalStage='armed';advancing=false;reveal.classList.remove('final-revealing');reveal.classList.add('final-pending');card.classList.add('final-locked');next.dataset.finalStage='reveal';
 if(meta)meta.textContent='SIGNAL 05 / 05 · UNKNOWN';if(kicker)kicker.textContent='FINAL SIGNAL DETECTED';if(count)count.textContent='05 / 05';if(origin)origin.innerHTML='<strong>IDENTITY LOCKED</strong><br>THE NEXUS<br><span style="opacity:.55">The object refuses classification.</span>';if(headline)headline.innerHTML='Something<br><em>impossible.</em>';
 button('REVEAL FINAL SIGNAL',false);unlockTimer=setTimeout(()=>button('REVEAL FINAL SIGNAL',true),1250);
}
function revealMythic(){if(finalStage!=='armed')return;finalStage='revealed';clearTimeout(unlockTimer);reveal.classList.remove('final-pending');reveal.classList.add('final-revealing');card.classList.remove('final-locked');next.dataset.finalStage='bind';
 if(meta)meta.textContent='SIGNAL 05 / 05 · MYTHIC';if(kicker)kicker.textContent='MYTHIC · HK-0045';if(origin)origin.innerHTML='<strong>RIFT SEED</strong><br>THE NEXUS<br><span style="opacity:.65">A world compressed to the size of a thought.</span>';if(headline)headline.innerHTML='Reality<br><em>opens.</em>';
 button('BIND RIFT SEED',false);try{navigator.vibrate?.([14,28,22,45,38])}catch{};tinyTone();
 setTimeout(()=>{if(flash){flash.classList.remove('hit');void flash.offsetWidth;flash.classList.add('hit')}},260);
 setTimeout(()=>button('BIND RIFT SEED',true),3000);
}
next.onclick=e=>{e?.preventDefault?.();const n=parseInt((count.textContent||'0').trim(),10)||0;
 if(n===4&&finalStage==='idle'){if(advancing)return;advancing=true;button('FINAL SIGNAL DETECTED',false);oldNext?.call(next,e);queueMicrotask(armFinal);return}
 if(n===5){if(finalStage==='armed'){revealMythic();return}if(finalStage==='revealed'){if(next.dataset.finalStage==='bind')oldNext?.call(next,e);return}}
 oldNext?.call(next,e);
};
const watcher=new MutationObserver(()=>{const n=parseInt((count.textContent||'0').trim(),10)||0;if(n===5&&finalStage==='idle')queueMicrotask(armFinal)});watcher.observe(count,{childList:true,subtree:true,characterData:true});
$('#beginReveal')?.addEventListener('click',resetFinal);$('#closeReveal')?.addEventListener('click',resetFinal);
})();