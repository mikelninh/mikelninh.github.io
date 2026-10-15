
(function(){
  'use strict';
  var track=document.querySelector('.progress-fill');
  var onScroll=function(){if(!track)return;var total=document.documentElement.scrollHeight-innerHeight;track.style.width=(total>0?Math.min(100,Math.max(0,scrollY/total*100)):0)+'%';};
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});onScroll();
  document.querySelectorAll('[data-share]').forEach(function(btn){btn.addEventListener('click',function(){var url=location.href;var title=document.querySelector('h1')?.textContent||document.title;if(navigator.share){navigator.share({url:url,title:title}).catch(function(){});}else if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(function(){btn.textContent='Link copied ✓';btn.setAttribute('aria-label','Link copied');}).catch(function(){window.prompt('Copy the article link',url);});}else{window.prompt('Copy the article link',url);}});});
  var reading=document.querySelector('[data-reading-mode]');if(reading){reading.addEventListener('click',function(){var on=document.body.classList.toggle('reading-mode');reading.setAttribute('aria-pressed',String(on));reading.textContent=on?'Restore full page':'Focus on the words';});}
  var choices=document.querySelectorAll('[data-choice]');var panel=document.querySelector('[data-choice-panel]');
  var explanations={
    notice:{title:'Notice',text:'For one moment, notice your natural breathing or the feeling of your feet on the floor. Nothing needs to change.'},
    understand:{title:'Understand',text:'Our breathing is guided automatically by the brainstem, but we can also influence it voluntarily. That is what makes it an interesting meeting point between body and attention.'},
    reflect:{title:'Reflect',text:'What in everyday life gets better when we participate without trying to control every detail? A conversation, an idea, or perhaps an afternoon?'}
  };
  if(panel&&choices.length){choices.forEach(function(btn){btn.addEventListener('click',function(){choices.forEach(function(b){b.setAttribute('aria-pressed',String(b===btn));});var item=explanations[btn.dataset.choice]||explanations.notice;panel.innerHTML='<strong>'+item.title+'</strong><span>'+item.text+'</span>';});});}
  var motionBtn=document.querySelector('[data-motion-toggle]');if(motionBtn){
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){document.body.classList.add('motion-off');motionBtn.setAttribute('aria-pressed','false');motionBtn.textContent='Motion reduced by your device settings';motionBtn.disabled=true;}
    else motionBtn.addEventListener('click',function(){var off=document.body.classList.toggle('motion-off');motionBtn.setAttribute('aria-pressed',String(!off));motionBtn.textContent=off?'Turn illustration movement on':'Turn illustration movement off';});
  }
})();
