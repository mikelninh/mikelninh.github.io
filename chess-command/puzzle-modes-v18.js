(function(){
'use strict';
const section=document.getElementById('puzzles');if(!section)return;
const $=id=>document.getElementById(id),KEY='chess-command-puzzle-sessions-v18';
const base={best:{rush:0,survival:0,focus:0},sessions:0,totalSolved:0,totalMisses:0};
function load(){try{return Object.assign({},base,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return JSON.parse(JSON.stringify(base))}}
let S=load(),mode='adaptive',score=0,misses=0,lives=3,endsAt=0,timer=null,locked=false,startedAt=0,puzzleStarted=0,totalSolveMs=0,combo=0,bestCombo=0;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}}
function ensure(){
 const shell=section.querySelector('.v12-shell');if(!shell)return false;if($('v18Modes'))return true;
 const el=document.createElement('div');el.id='v18Modes';el.className='v18-modes';el.innerHTML=`
 <div class="v18-mode-scroll">
  <button class="active" data-mode="adaptive"><b>∞</b><span>Adaptive</span><small>your level</small></button>
  <button data-mode="rush"><b>3:00</b><span>Rush</span><small id="v18RushBest">best 0</small></button>
  <button data-mode="survival"><b>♥♥♥</b><span>Survival</span><small id="v18SurvivalBest">best 0</small></button>
  <button data-mode="daily"><b>5</b><span>Daily Five</span><small>focused reps</small></button>
  <button data-mode="focus"><b>10</b><span>Theme Run</span><small id="v18FocusBest">best 0</small></button>
 </div>
 <div class="v18-session" id="v18Session"><div><small>ADAPTIVE</small><b>Find the move.</b></div><div class="v18-combo"><span id="v18Combo">×0</span><small>FLOW</small></div></div>`;
 const themes=section.querySelector('.v12-themes');themes?.insertAdjacentElement('beforebegin',el);
 const gymLabel=section.querySelector('.v12-top .eyebrow'),count=window.ChessPuzzleProviderV16?.total;if(gymLabel&&count)gymLabel.textContent=`TACTICAL GYM · ${count.toLocaleString()} POSITIONS`;
 el.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>start(b.dataset.mode));
 const recap=document.createElement('div');recap.id='v18Recap';recap.className='v18-recap';recap.hidden=true;recap.innerHTML=`<button class="v18-recap-backdrop" data-v18-close></button><section><div class="v18-recap-mark">♟</div><small id="v18RecapMode">SESSION COMPLETE</small><h2 id="v18RecapTitle">Nice run.</h2><div class="v18-recap-grid"><div><b id="v18RecapScore">0</b><span>SOLVED</span></div><div><b id="v18RecapAccuracy">100%</b><span>ACCURACY</span></div><div><b id="v18RecapSpeed">—</b><span>AVG / PUZZLE</span></div><div><b id="v18RecapCombo">0</b><span>BEST FLOW</span></div></div><p id="v18RecapPb"></p><div class="v18-recap-actions"><button data-v18-close>Back</button><button id="v18Again" class="primary">Run it again</button></div></section>`;document.body.appendChild(recap);
 recap.querySelectorAll('[data-v18-close]').forEach(b=>b.onclick=()=>recap.hidden=true);$('v18Again').onclick=()=>{recap.hidden=true;start(mode==='adaptive'?'rush':mode)};
 updateBestLabels();return true;
}
function buttons(){return [...section.querySelectorAll('#v18Modes [data-mode]')]}
function stopTimer(){if(timer){clearInterval(timer);timer=null}}
function fmt(ms){const s=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(s/60);return`${m}:${String(s%60).padStart(2,'0')}`}
function updateBestLabels(){if($('v18RushBest'))$('v18RushBest').textContent=`best ${S.best?.rush||0}`;if($('v18SurvivalBest'))$('v18SurvivalBest').textContent=`best ${S.best?.survival||0}`;if($('v18FocusBest'))$('v18FocusBest').textContent=`best ${S.best?.focus||0}`}
function session(kicker,title){const el=$('v18Session');if(!el)return;el.querySelector('small').textContent=kicker;el.querySelector('b').textContent=title;if($('v18Combo'))$('v18Combo').textContent=`×${combo}`}
function updateButtons(){buttons().forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));const rush=section.querySelector('[data-mode="rush"] b'),surv=section.querySelector('[data-mode="survival"] b'),daily=section.querySelector('[data-mode="daily"] b'),focus=section.querySelector('[data-mode="focus"] b');if(rush)rush.textContent=mode==='rush'?fmt(endsAt-Date.now()):'3:00';if(surv)surv.textContent='♥'.repeat(Math.max(0,lives))+'♡'.repeat(Math.max(0,3-lives));if(daily)daily.textContent=mode==='daily'?`${Math.min(score,5)}/5`:'5';if(focus)focus.textContent=mode==='focus'?`${Math.min(score,10)}/10`:'10'}
function currentTheme(){return section.querySelector('.v12-themes button.active')?.dataset.theme||'Mixed'}
function start(next){
 stopTimer();mode=next;score=0;misses=0;lives=3;locked=false;combo=0;bestCombo=0;startedAt=Date.now();puzzleStarted=Date.now();totalSolveMs=0;
 if(mode==='rush'){endsAt=Date.now()+180000;timer=setInterval(()=>{if(Date.now()>=endsAt)finish('Time.','Rush');else{updateButtons();session('RUSH',`${score} solved · ${fmt(endsAt-Date.now())} left`)}},200)}
 if(mode==='survival')session('SURVIVAL','Three lives. Stay clean.');
 else if(mode==='daily')session('DAILY FIVE','Five useful patterns.');
 else if(mode==='focus')session('THEME RUN',`${currentTheme()} · 10 positions`);
 else if(mode==='adaptive')session('ADAPTIVE','Weak patterns rise to the top.');
 updateButtons();if($('v12Next'))$('v12Next').click();
}
function avg(){return score?totalSolveMs/score:0}
function personalBestKey(){return mode==='rush'?'rush':mode==='survival'?'survival':mode==='focus'?'focus':null}
function finish(title,label){
 if(locked)return;stopTimer();locked=true;const elapsed=Date.now()-startedAt,accuracy=Math.round(score/Math.max(1,score+misses)*100),key=personalBestKey(),oldBest=key?(S.best?.[key]||0):0,newBest=!!key&&score>oldBest;if(key&&newBest)S.best[key]=score;S.sessions++;S.totalSolved+=score;S.totalMisses+=misses;save();updateBestLabels();
 $('v18RecapMode').textContent=(label||mode).toUpperCase()+' COMPLETE';$('v18RecapTitle').textContent=title;$('v18RecapScore').textContent=score;$('v18RecapAccuracy').textContent=accuracy+'%';$('v18RecapSpeed').textContent=avg()?`${(avg()/1000).toFixed(1)}s`:'—';$('v18RecapCombo').textContent=bestCombo;$('v18RecapPb').textContent=newBest?`New personal best · ${score}.`:score?`${misses?misses+' miss'+(misses===1?'':'es'):'Perfect run'} · ${Math.round(elapsed/1000)} seconds total.`:'Come back for the next one — the board remembers nothing, but you will.';$('v18Recap').hidden=false;
 document.dispatchEvent(new CustomEvent('cc:puzzlesession',{detail:{mode,score,misses,accuracy,avgMs:avg(),elapsed,bestCombo,newBest}}));if(navigator.vibrate)navigator.vibrate(newBest?[25,35,25,35,60]:[24,28,40]);updateButtons();
}
function nextSoon(){setTimeout(()=>{if(locked)return;const level=$('v12Celebration');if(level&&!level.hidden)return;puzzleStarted=Date.now();$('v12Next')?.click()},520)}
document.addEventListener('cc:puzzle',e=>{
 if(!ensure()||locked)return;const ok=!!e.detail.correct;
 if(ok){score++;combo++;bestCombo=Math.max(bestCombo,combo);totalSolveMs+=Math.max(250,Date.now()-puzzleStarted);if(mode==='rush'){session('RUSH',`${score} solved · ${fmt(endsAt-Date.now())} left`);nextSoon()}else if(mode==='survival'){session('SURVIVAL',`${score} solved · ${lives} ${lives===1?'life':'lives'} left`);nextSoon()}else if(mode==='daily'){if(score>=5)finish('Daily five banked.','Daily Five');else{session('DAILY FIVE',`${score}/5 · ${5-score} to go`);nextSoon()}}else if(mode==='focus'){if(score>=10)finish(`${currentTheme()} run complete.`,'Theme Run');else{session('THEME RUN',`${currentTheme()} · ${score}/10`);nextSoon()}}else{session('ADAPTIVE',`${score} solved · flow ×${combo}`);nextSoon()}}
 else{misses++;combo=0;if(mode==='rush'){endsAt-=5000;session('RUSH',`−5 seconds · ${fmt(endsAt-Date.now())} left`)}else if(mode==='survival'){lives--;if(lives<=0)finish('Three misses. Run over.','Survival');else session('SURVIVAL',`${lives} ${lives===1?'life':'lives'} left`)}else session(mode.toUpperCase(),'Reset. Find the pattern, not the guess.');}
 updateButtons();if($('v18Combo'))$('v18Combo').textContent=`×${combo}`;
});
const obs=new MutationObserver(()=>{if(!document.getElementById('v18Modes')&&ensure()){obs.disconnect();start('adaptive')}});obs.observe(section,{childList:true,subtree:true});if(ensure()){obs.disconnect();start('adaptive')}
})();
