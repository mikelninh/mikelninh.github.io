
/* CHEATS / REAL POWERS · Memory Palace v0.1
   Entire experience is local, no accounts, no network requests and no third-party tracking.
*/
(function(){
  "use strict";
  const SITE="https://mikelninh.github.io/cheats/";
  const STATE_URL="https://mikelninh.github.io/state-digital-apothecary/?start=focus&preview=60";
  const STORE="cheats_memory_v1";
  const STUDY_MS=60000;
  const rooms=[
    {name:"Front door",short:"Door",icon:"🚪",scene:"shouting hello through the front door"},
    {name:"Hallway",short:"Hall",icon:"🪞",scene:"tap-dancing down the hallway"},
    {name:"Sofa",short:"Sofa",icon:"🛋️",scene:"jumping up and down on the sofa"},
    {name:"Kitchen",short:"Kitchen",icon:"🍳",scene:"making soup in the kitchen"},
    {name:"Staircase",short:"Stairs",icon:"🌀",scene:"sliding down the staircase"},
    {name:"Library",short:"Library",icon:"📚",scene:"reading aloud in the library"},
    {name:"Balcony",short:"Balcony",icon:"🌙",scene:"waving at the moon on the balcony"},
    {name:"Rooftop",short:"Roof",icon:"✨",scene:"shooting fireworks off the rooftop"}
  ];
  // Each dataset consists of common concrete nouns; paired/swap assignment varies across sessions.
  const sets=[
    [
      [{w:"lantern",e:"🏮"},{w:"piano",e:"🎹"},{w:"sailboat",e:"⛵"},{w:"cactus",e:"🌵"},{w:"pillow",e:"🛏️"},{w:"turtle",e:"🐢"},{w:"clock",e:"⏰"},{w:"strawberry",e:"🍓"}],
      [{w:"umbrella",e:"☂️"},{w:"guitar",e:"🎸"},{w:"bicycle",e:"🚲"},{w:"pineapple",e:"🍍"},{w:"teapot",e:"🫖"},{w:"penguin",e:"🐧"},{w:"mirror",e:"🪞"},{w:"key",e:"🗝️"}]
    ],
    [
      [{w:"camera",e:"📷"},{w:"lemon",e:"🍋"},{w:"ladder",e:"🪜"},{w:"rabbit",e:"🐇"},{w:"candle",e:"🕯️"},{w:"balloon",e:"🎈"},{w:"compass",e:"🧭"},{w:"crown",e:"👑"}],
      [{w:"violin",e:"🎻"},{w:"orange",e:"🍊"},{w:"bridge",e:"🌉"},{w:"koala",e:"🐨"},{w:"cupcake",e:"🧁"},{w:"rocket",e:"🚀"},{w:"magnet",e:"🧲"},{w:"shell",e:"🐚"}]
    ],
    [
      [{w:"helmet",e:"⛑️"},{w:"apple",e:"🍎"},{w:"fountain",e:"⛲"},{w:"fox",e:"🦊"},{w:"sandwich",e:"🥪"},{w:"planet",e:"🪐"},{w:"bell",e:"🔔"},{w:"ring",e:"💍"}],
      [{w:"backpack",e:"🎒"},{w:"peach",e:"🍑"},{w:"castle",e:"🏰"},{w:"otter",e:"🦦"},{w:"spoon",e:"🥄"},{w:"cloud",e:"☁️"},{w:"anchor",e:"⚓"},{w:"book",e:"📕"}]
    ]
  ];
  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));
  const wrap=$("#experience"),stage=$("#stage"),progress=$("#progressFill"),stageName=$("#gameStepName"),toast=$("#toast");
  let tick=null,toastTimer=null,audio=null,sound=false,game=null;
  const phases={brief:6,baseline:22,recallBaseline:35,baseResult:44,lesson:57,palace:73,recallPalace:87,final:100};
  const labels={brief:"01 / THE INVITATION",baseline:"02 / FIRST ATTEMPT",recallBaseline:"03 / FIRST RECALL",baseResult:"04 / THE REVEAL",lesson:"05 / LEARN A POWER",palace:"06 / ENTER THE PALACE",recallPalace:"07 / THE FINAL TEST",final:"08 / YOUR POWER CARD"};

  function stats(){
    try{
      const d=JSON.parse(localStorage.getItem(STORE)||"{}");
      return d&&Array.isArray(d.runs)?d:{version:1,runs:[]};
    }catch(_){return {version:1,runs:[]};}
  }
  function saved(s){
    try{localStorage.setItem(STORE,JSON.stringify(s));}catch(_){}
  }
  function announce(message){
    toast.textContent=message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove("show"),2800);
  }
  function shufflePair(){
    const history=stats().runs.length;
    const set=sets[(history+Math.floor(Math.random()*sets.length))%sets.length];
    const reversed=Math.random()>.5;
    return {baseline:reversed?set[1]:set[0],palace:reversed?set[0]:set[1]};
  }
  function emptyGame(){
    const pair=shufflePair();
    return {step:"brief",baseline:pair.baseline,palace:pair.palace,scores:{baseline:null,palace:null},answers:{baseline:[],palace:[]},startedAt:Date.now(),duration:{baseline:0,palace:0},deadline:0,mode:null,runSaved:false};
  }
  function start(){
    game=emptyGame();
    wrap.hidden=false;
    document.body.classList.add("playing");
    $("#main")?.setAttribute("inert","");
    $("#gameClose").focus();
    render();
    window.scrollTo(0,0);
    wrap.scrollTop=0;
    soundCue(570);
  }
  function exit(){
    if(game&&game.step!=="final"&&game.step!=="brief"){
      if(!window.confirm("Leave the mission? Your current unsaved attempt will be lost."))return;
    }
    clearInterval(tick);tick=null;
    wrap.hidden=true;
    document.body.classList.remove("playing");
    $("#main")?.removeAttribute("inert");
    game=null;
    $("#launchHero")?.focus();
  }
  function soundCue(freq){
    if(!sound)return;
    try{
      const AudioC=window.AudioContext||window.webkitAudioContext;
      if(!AudioC)return;
      audio=audio||new AudioC();
      if(audio.state==="suspended")audio.resume();
      const oscillator=audio.createOscillator(),gain=audio.createGain();
      oscillator.type="sine";
      oscillator.frequency.setValueAtTime(freq,audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(freq*1.18,audio.currentTime+.1);
      gain.gain.setValueAtTime(.07,audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.19);
      oscillator.connect(gain);gain.connect(audio.destination);
      oscillator.start();oscillator.stop(audio.currentTime+.2);
    }catch(_){}
  }
  function setStep(next){
    clearInterval(tick);tick=null;
    game.step=next;
    stageName.textContent=labels[next];
    progress.style.width=phases[next]+"%";document.querySelector(".gameprogress").setAttribute("aria-valuenow",String(phases[next]));
    wrap.scrollTop=0;
    render();
    soundCue(next==="final"?830:520);
  }
  function btn(id,label,kind){
    return '<button type="button" class="'+(kind||"stage-btn")+'" data-action="'+id+'">'+label+'</button>';
  }
  function tag(text){return '<span class="stage-tag">'+text+'</span>';}
  function actionSet(primary,secondary,extra){
    return '<div class="stage-actions">'+btn(primary[0],primary[1])+
      (secondary?btn(secondary[0],secondary[1],"stage-alt"):"")+'</div>'+
      (extra?'<p class="stage-micro">'+extra+'</p>':"");
  }
  function render(){
    if(!game)return;
    stageName.textContent=labels[game.step];
    progress.style.width=phases[game.step]+"%";document.querySelector(".gameprogress").setAttribute("aria-valuenow",String(phases[game.step]));
    let html="";
    if(game.step==="brief")html=briefMarkup();
    if(game.step==="baseline"||game.step==="palace")html=encodeMarkup(game.step);
    if(game.step==="recallBaseline"||game.step==="recallPalace")html=recallMarkup(game.step==="recallPalace");
    if(game.step==="baseResult")html=baselineMarkup();
    if(game.step==="lesson")html=lessonMarkup();
    if(game.step==="final")html=finalMarkup();
    stage.innerHTML='<div class="stage-container">'+html+'</div>';
    if(game.step==="baseline"||game.step==="palace")updateTimer();
    if(game.step==="recallBaseline"||game.step==="recallPalace"){
      const first=stage.querySelector(".recall-slot input");
      if(first)setTimeout(()=>first.focus(),100);
    }
  }
  function briefMarkup(){
    return '<div class="mission-brief">'+
      '<div>'+tag("MISSION 001 / MEMORY PALACE")+
      '<h2>You are more <em>memorable</em> than you think.</h2>'+
      '<p class="stage-lead">A real memory technique is hiding behind this door. First, try an honest challenge. Then learn the trick. Finally, face a new list and see what changes.</p>'+
      '<div class="brief-numbers"><span>08 OBJECTS</span><span>60 SEC TO STUDY</span><span>NO LOGIN</span></div>'+
      actionSet(["baseline-start","Start the first challenge →"],["game-exit","Maybe later"],"No leaderboard. No punishment. One run does not measure your intelligence. Normal short-term memory varies a lot.")+
      '</div><div class="brief-art" aria-hidden="true"><span class="orb-small">POWER #001</span><div class="mini-palace">'+document.querySelector(".palace-art").outerHTML+'</div><span class="orb-bottom">ORDINARY HUMAN / EXTRAORDINARY TRICKS</span></div></div>';
  }
  function encodeMarkup(mode){
    const advanced=mode==="palace";
    const words=advanced?game.palace:game.baseline;
    let cards="";
    for(let i=0;i<words.length;i++){
      const w=words[i];
      cards+='<div class="memory-word"><span class="word-index">'+String(i+1).padStart(2,"0")+'</span>'+
        '<span class="symbol" aria-hidden="true">'+w.e+'</span><b>'+w.w+'</b>'+
        (advanced?'<span class="place-mini">'+rooms[i].icon+' '+rooms[i].name+'</span>':"")+'</div>';
    }
    return tag(advanced?"YOUR PALACE / ASSOCIATIONS":"RAW MEMORY / NO TRICKS YET")+
      '<h2>'+(advanced?'Give each object <em>a home.</em>':'Eight objects. <em>One minute.</em>')+'</h2>'+
      '<div class="countbar"><div class="clock" id="clock" aria-label="Seconds remaining">60</div>'+
      '<div class="count-instruction">'+(advanced?'Walk from the door to the roof in order. Picture each object doing something enormous, ridiculous, or loud in its location.':'Look at all eight objects. Try to remember as many as you can. Use whatever approach comes naturally.')+
      '<br><strong>Same study time for both rounds: 60 seconds.</strong></div></div>'+
      '<div class="memory-board'+(advanced?' palace-board':'')+'">'+cards+'</div>'+
      actionSet(["finish-study","I’m ready to recall →"],null,"The timer will advance automatically. You may finish early; time actually used is recorded. Avoid writing down the words.")+
      '<p class="step-info">'+(advanced?'The room labels are memory cues — we provide them because the technique uses locations. This is a learning game, not a scientifically controlled comparison.':'There are no wrong strategies in this first attempt. Some things are easier to remember than others.')+'</p>';
  }
  function recallMarkup(advanced){
    let slots="";
    for(let i=0;i<8;i++){
      slots+='<div class="recall-slot"><label for="slot'+i+'">'+
       (advanced?rooms[i].icon+' '+rooms[i].short:String(i+1).padStart(2,"0")+' / OBJECT')+
       '</label><input id="slot'+i+'" class="answer-slot" name="answer'+i+'" maxlength="35" autocomplete="off" autocapitalize="none" spellcheck="false" inputmode="text" placeholder="One word" aria-label="'+(advanced?rooms[i].name+" recall word":"Word "+(i+1))+'"></div>';
    }
    return tag(advanced?"THE PALACE / RECALL":"THE BASELINE / RECALL")+
     '<h2>'+(advanced?'Walk the house. <em>What did you leave?</em>':'Close your eyes. <em>What remains?</em>')+'</h2>'+
     '<p class="stage-lead">'+(advanced?'Travel through the rooms in order and find the objects you imagined there. Room names are cues, not answers.':'The objects have disappeared. Type what you remember, one object per box. Any order is fine; exact positions are a bonus.')+'</p>'+
     '<form id="recallForm" autocomplete="off" class="recall-panel">'+
     '<div class="recall-inputs">'+slots+'</div>'+
     '<p>Leave blanks if needed. Minor spelling differences are accepted. We score distinct objects, not typing speed.</p>'+
     '<button type="submit" class="stage-btn">Reveal my '+(advanced?'power':'first')+' score →</button></form>'+
     '<p class="stage-micro">No back button to the hidden objects — the idea is to recall, not to peek.</p>';
  }
  function baselineMarkup(){
    const score=game.scores.baseline;
    return '<div>'+tag("FIRST ATTEMPT / SAVED FOR THIS RUN")+
      '<h2>Good. Now for <em>the secret.</em></h2>'+
      '<div class="result-preview"><div class="score-orb"><strong>'+score.correct+'/8</strong></div>'+
      '<div><h3>Your starting score</h3><p>'+score.correct+' distinct objects recalled, with '+score.ordered+' in their original positions. That is a starting point, not a judgement.</p></div></div>'+
      '<p class="stage-lead">Ancient memory champions used a surprising idea: our minds often remember places more readily than disconnected lists. Let’s walk through a tiny palace.</p>'+
      actionSet(["learn","Teach me the trick →"],null,"We will use a different list after the lesson. Short-term scores vary naturally; this is not a controlled experiment.")+'</div>';
  }
  function routeMarkup(){
    let result="";
    rooms.forEach((room,index)=>{
      result+='<div class="route-room"><span class="emoji" aria-hidden="true">'+room.icon+'</span>'+
        '<span>'+String(index+1).padStart(2,"0")+' · '+room.name+'</span></div>';
    });
    return '<div class="route-map"><h3>THE ROUTE / DOOR → ROOF</h3><div class="route-grid">'+result+'</div>'+
       '<p class="route-foot">The same eight locations, always in the same order. Walk the route when you need to remember the objects.</p></div>';
  }
  function lessonMarkup(){
    return tag("THE REAL TRICK / METHOD OF LOCI")+
    '<h2>Turn imagination <em>into a map.</em></h2>'+
    '<p class="stage-lead">A memory palace combines a fixed route with vivid mental images. It is a trained mnemonic for particular recall tasks, not a supernatural ability.</p>'+
    '<div class="lesson-main"><div class="lesson-cards">'+
    '<div class="lesson-item"><div class="lesson-icon">①</div><div><h3>Pick a route</h3><p>We will travel through eight memorable rooms, always in the same order.</p></div></div>'+
    '<div class="lesson-item"><div class="lesson-icon">②</div><div><h3>Make it impossible</h3><p>Imagine a huge purple dragon clogging the front door, singing opera. Absurd images can be easier to retrieve.</p></div></div>'+
    '<div class="lesson-item"><div class="lesson-icon">③</div><div><h3>Walk back through</h3><p>To recall, move through your rooms and discover what is happening in each one.</p></div></div>'+
    '</div>'+routeMarkup()+'</div>'+
    '<p class="step-info"><strong>Try this in your mind:</strong> the enormous dragon is singing at the front door. Then picture yourself stepping into the hallway. Now you know how to begin.</p>'+
    actionSet(["palace-start","Enter the Memory Palace →"],null,"You will get eight NEW objects and the same 60-second study period as before.");
  }
  function normalizeWord(s){
    return String(s||"").trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
  }
  function distance(a,b){
    if(Math.abs(a.length-b.length)>1)return 2;
    const prev=new Array(b.length+1);
    for(let j=0;j<=b.length;j++)prev[j]=j;
    for(let i=1;i<=a.length;i++){
      let diag=prev[0];prev[0]=i;
      for(let j=1;j<=b.length;j++){
        const temp=prev[j];
        prev[j]=Math.min(prev[j]+1,prev[j-1]+1,diag+(a[i-1]===b[j-1]?0:1));
        diag=temp;
      }
    }
    return prev[b.length];
  }
  function acceptWord(typed,reference){
    const a=normalizeWord(typed),b=normalizeWord(reference);
    if(!a)return false;
    if(a===b||a===b+"s"||a+"s"===b)return true;
    return b.length>=5&&a.length>=5&&distance(a,b)<=1;
  }
  function grade(answers,target){
    const used=new Set();
    let count=0,ordered=0;
    for(let i=0;i<answers.length;i++){
      const a=answers[i];if(!normalizeWord(a))continue;
      let picked=-1;
      for(let j=0;j<target.length;j++){
        if(!used.has(j)&&normalizeWord(a)===normalizeWord(target[j].w)){picked=j;break;}
      }
      if(picked<0)for(let j=0;j<target.length;j++){
        if(!used.has(j)&&acceptWord(a,target[j].w)){picked=j;break;}
      }
      if(picked>=0){used.add(picked);count++;if(i===picked)ordered++;}
    }
    return {correct:count,ordered:ordered};
  }
  function beginEncode(mode){
    game.mode=mode;
    game.duration[mode]=0;
    game.deadline=Date.now()+STUDY_MS;
    setStep(mode==="baseline"?"baseline":"palace");
    tick=setInterval(updateTimer,160);
    updateTimer();
  }
  function updateTimer(){
    if(!game||(game.step!=="baseline"&&game.step!=="palace"))return;
    const remaining=Math.max(0,Math.ceil((game.deadline-Date.now())/1000));
    game.duration[game.mode]=Math.min(60,Math.max(0,60-Math.ceil((game.deadline-Date.now())/1000)));
    const el=$("#clock");if(el){el.textContent=String(remaining);el.classList.toggle("warning",remaining<=10);}
    if(remaining<=0)endEncode();
  }
  function endEncode(){
    if(!game||(game.step!=="baseline"&&game.step!=="palace"))return;
    game.duration[game.mode]=Math.min(60,Math.ceil((STUDY_MS-(game.deadline-Date.now()))/1000));
    const isPalace=game.step==="palace";
    setStep(isPalace?"recallPalace":"recallBaseline");
  }
  function submitRecall(event){
    event.preventDefault();
    if(!game)return;
    const advanced=game.step==="recallPalace";
    const mode=advanced?"palace":"baseline";
    const words=advanced?game.palace:game.baseline;
    const entries=stage.querySelectorAll(".answer-slot");
    const answers=Array.from(entries).map(el=>el.value.trim());
    game.answers[mode]=answers;
    game.scores[mode]=grade(answers,words);
    if(advanced){
      saveRun();
      setStep("final");
    }else setStep("baseResult");
  }
  function saveRun(){
    if(game.runSaved)return;
    game.runSaved=true;
    const old=stats();
    old.version=1;
    old.runs.unshift({
      when:new Date().toISOString(),
      baseline:game.scores.baseline.correct,
      palace:game.scores.palace.correct,
      baselineOrder:game.scores.baseline.ordered,
      palaceOrder:game.scores.palace.ordered,
      studySecondsBaseline:game.duration.baseline,
      studySecondsPalace:game.duration.palace
    });
    old.runs=old.runs.slice(0,30);
    saved(old);
    updateBest();
  }
  function updateBest(){
    const all=stats().runs;
    const best=all.length?Math.max(...all.map(r=>Number(r.palace)||0)):null;
    const el=$("#lastScore");if(el)el.textContent=best===null?"NO GAMES PLAYED YET":"YOUR BEST POWER CHECK: "+best+"/8 · "+all.length+" RUN"+(all.length===1?"":"S");
  }
  function finalMarkup(){
    const a=game.scores.baseline.correct,b=game.scores.palace.correct,delta=b-a;
    const badge=b>=7?"MEMORY MAGE":b>=5?"PALACE EXPLORER":"POWER APPRENTICE";
    const headline=b>=7?"Look what your mind <em>can do.</em>":b>=5?"Your palace is <em>taking shape.</em>":"You have found <em>the doorway.</em>";
    const msg=delta>0?"You recalled "+delta+" more item"+(delta===1?"":"s")+" on the second, location-aided challenge.":
      delta<0?"You recalled "+Math.abs(delta)+" fewer objects this time. That happens. Try again later — learning is not a straight line.":
      "You recalled the same number of objects in both rounds. Your original-order score went from "+game.scores.baseline.ordered+"/8 to "+game.scores.palace.ordered+"/8. One attempt is not a verdict — try another route later.";
    return '<div class="final-hero">'+
      '<div>'+tag("MISSION COMPLETE / POWER DISCOVERED")+
      '<h2>'+headline+'</h2>'+
      '<div class="badge-box">✦ &nbsp; '+badge+'</div>'+
      '<p class="stage-lead">'+msg+'</p>'+
      '<div class="stats">'+
        '<div class="stat"><span>NO METHOD</span><b>'+a+'/8</b><small>Before the lesson</small></div>'+
        '<div class="stat"><span>WITH LOCATIONS</span><b>'+b+'/8</b><small>After the lesson</small></div>'+
        '<div class="stat"><span>CHANGE IN COUNT</span><b>'+(delta>0?"+":"")+delta+'</b><small>Different object lists</small></div>'+
        '<div class="stat"><span>IN ORIGINAL ORDER</span><b>'+game.scores.palace.ordered+'/8</b><small>Second challenge</small></div>'+
      '</div>'+
      '<div class="stage-actions">'+btn("download-card","Save my power card ↓")+
      btn("play-again","Play another round ↺","stage-alt")+'</div>'+
      '<div class="share-tools" style="margin-top:23px">'+
      '<button type="button" data-action="share">Challenge a friend ↗</button>'+
      '<button type="button" data-action="copy-link">Copy the game link ⧉</button>'+
      '<button type="button" data-action="feedback">Send honest feedback ✉</button></div>'+
      '<p class="stage-micro">Your result is saved only on this device. Sharing the game link does not upload your score. Come back tomorrow and try another route — no streak pressure.</p></div>'+
      '<div><div class="power-card-art" aria-label="Your earned '+badge+' card"><div class="edition"><span>CHEATS / POWER 001</span><span>FOUNDING EDITION</span></div>'+
      '<span class="spell" aria-hidden="true">✦</span><h3>MEMORY PALACE</h3><span class="card-desc">'+badge+' / UNLOCKED BY PRACTICE</span>'+
      '<div class="card-ribbon"><span>REAL LIFE SUPERPOWER</span><span>'+b+'/8</span></div></div>'+
      '<div class="source-callout"><strong>Read this like a scientist:</strong> the two lists were different, location cues were present only in the second round, and we did not control practice effects. Your scores describe these two attempts, not lasting memory improvement or clinical efficacy. The technique has promising research, with substantial study limitations. <a href="https://pubmed.ncbi.nlm.nih.gov/40457944/" target="_blank" rel="noopener noreferrer">Read the 2025 review ↗</a></div></div>'+
      '</div>';
  }
  function copyText(text){
    if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text);
    return new Promise((resolve,reject)=>{
      const t=document.createElement("textarea");
      t.value=text;t.style.position="fixed";t.style.top="-9999px";document.body.appendChild(t);
      t.select();let ok=false;try{ok=document.execCommand("copy");}catch(_){}
      t.remove();ok?resolve():reject(new Error("Copy unsupported"));
    });
  }
  function share(){
    const title="CHEATS — Real-life superpowers";
    const text="I just tried to unlock a real MEMORY PALACE. Eight objects, one odd little house. Think you can beat me? ✦";
    if(navigator.share){
      navigator.share({title,text,url:SITE}).catch(e=>{if(e.name!=="AbortError")copyLink()});
    }else copyText(text+"\n"+SITE).then(()=>announce("Challenge invitation copied!")).catch(()=>announce("Copy the URL from your address bar."));
  }
  function copyLink(){
    copyText(SITE).then(()=>announce("Game link copied! Share the power.")).catch(()=>announce("Copy the URL from your address bar."));
  }
  function feedback(){
    const current=document.getElementById("cheatsFeedbackDialog");if(current)current.remove();
    const dialog=document.createElement("dialog");dialog.id="cheatsFeedbackDialog";dialog.className="cheats-utility-dialog";
    dialog.innerHTML='<div class="utility-head"><span>CHEATS / PLAYER FEEDBACK</span><button type="button" class="utility-close" aria-label="Close feedback">×</button></div>'+
      '<h2>Help make the next power better.</h2><p>What felt magical? What felt confusing? A sentence is plenty. We will only receive anything if you choose to open your mail app and send it.</p>'+
      '<label for="feedbackDraft">Your editable feedback</label><textarea id="feedbackDraft" rows="7"></textarea>'+
      '<div class="utility-actions"><button type="button" class="stage-btn" id="copyFeedback">Copy feedback</button><a class="stage-alt utility-link" id="emailFeedback" href="#">Open email app ↗</a></div>'+
      '<p class="utility-note">If you have no mail app set up, copy the message and send it however you prefer. Nothing is submitted directly by this website.</p>';
    document.body.appendChild(dialog);
    const a=game?.scores?.baseline?.correct,b=game?.scores?.palace?.correct;
    dialog.querySelector("textarea").value="What delighted me:\n\nWhat confused me:\n\nOne thing I would change:\n\n"+
      ((Number.isFinite(a)&&Number.isFinite(b))?"Optional scores — before: "+a+"/8, after: "+b+"/8.\n\n":"");
    const link=dialog.querySelector("#emailFeedback");
    const setMail=()=>{link.href="mailto:mikel_ninh@yahoo.de?subject="+encodeURIComponent("CHEATS · Honest MVP feedback")+
      "&body="+encodeURIComponent(dialog.querySelector("textarea").value);};
    setMail();
    link.addEventListener("click",()=>{setMail();announce("Opening your mail app. Please review before sending.");});
    dialog.querySelector("#copyFeedback").addEventListener("click",()=>{
      copyText(dialog.querySelector("textarea").value).then(()=>announce("Feedback copied. Thank you!")).catch(()=>announce("Select and copy your note above."));
    });
    dialog.querySelector(".utility-close").addEventListener("click",()=>dialog.close());
    dialog.addEventListener("close",()=>dialog.remove());
    dialog.showModal();
  }

  function drawCard(){
    if(!game||game.step!=="final")return;
    const c=document.createElement("canvas"),ctx=c.getContext("2d");
    if(!ctx){announce("Card export is unavailable here.");return;}
    c.width=1200;c.height=720;
    const grad=ctx.createLinearGradient(0,0,1200,720);
    grad.addColorStop(0,"#eaddff");grad.addColorStop(.52,"#a9a0ef");grad.addColorStop(1,"#7963c7");
    ctx.fillStyle=grad;ctx.fillRect(0,0,1200,720);
    ctx.save();ctx.globalAlpha=.26;ctx.strokeStyle="#ffffff";ctx.lineWidth=4;
    for(let r=190;r<600;r+=78){ctx.beginPath();ctx.arc(870,350,r,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
    ctx.fillStyle="#191522";ctx.fillRect(44,44,1112,632);
    ctx.fillStyle=grad;ctx.fillRect(55,55,1090,610);
    ctx.fillStyle="#1b152a";ctx.font="800 25px sans-serif";ctx.fillText("CHEATS / REAL-LIFE SUPERPOWERS",95,117);
    ctx.font="800 22px monospace";ctx.fillText("POWER 001   ✦   FOUNDING EDITION",95,160);
    ctx.font="italic 480px Georgia,serif";ctx.fillStyle="#fbdf91";ctx.fillText("✦",760,520);
    ctx.font="900 96px system-ui,sans-serif";ctx.fillStyle="#1b152a";ctx.fillText("MEMORY",94,333);ctx.fillText("PALACE",94,428);
    ctx.font="800 27px system-ui,sans-serif";
    const b=game.scores.palace.correct,a=game.scores.baseline.correct;
    ctx.fillText("BEFORE "+a+"/8     WITH LOCATIONS "+b+"/8",100,518);
    ctx.font="700 22px system-ui,sans-serif";ctx.fillText("A POWER DISCOVERED THROUGH PRACTICE",100,566);
    ctx.fillStyle="#1b152a";ctx.fillRect(95,603,1010,2);
    ctx.font="650 21px monospace";ctx.fillText("TRY THE FREE CHALLENGE: "+SITE,100,640);
    try{
      const uri=c.toDataURL("image/png");
      const current=document.getElementById("cheatsCardDialog");if(current)current.remove();
      const dialog=document.createElement("dialog");
      dialog.id="cheatsCardDialog";dialog.className="cheats-utility-dialog card-preview-dialog";
      dialog.innerHTML='<div class="utility-head"><span>YOUR POWER CARD / READY TO KEEP</span><button type="button" class="utility-close" aria-label="Close power card">×</button></div>'+
        '<h2>A little proof of play.</h2><p>Your real scores are on the card. You decide whether to save or share it.</p>'+
        '<img class="preview-image" alt="CHEATS Memory Palace completion card showing your actual before and after recall scores.">'+
        '<div class="utility-actions"><a class="stage-btn utility-link" id="cardDownload" download="cheats-memory-palace-card.png">Download PNG ↓</a>'+
        '<button class="stage-alt" type="button" id="cardDone">Done</button></div>'+
        '<p class="utility-note">On mobile, you can also press and hold the preview image to save it. No upload takes place.</p>';
      document.body.appendChild(dialog);
      dialog.querySelector("img").src=uri;
      dialog.querySelector("#cardDownload").href=uri;
      dialog.querySelector("#cardDownload").addEventListener("click",()=>announce("Power card download requested!"));
      dialog.querySelector("#cardDone").addEventListener("click",()=>dialog.close());
      dialog.querySelector(".utility-close").addEventListener("click",()=>dialog.close());
      dialog.addEventListener("close",()=>dialog.remove());
      dialog.showModal();
    }catch(_){announce("Card export isn't supported in this browser.");}

  }

  // One delegated control path keeps changes of scene deliberate.
  document.addEventListener("click",function(e){
    const el=e.target.closest("[data-action]");
    if(!el)return;
    const action=el.dataset.action;
    if(action==="start"){start();return;}
    if(action==="game-exit"){exit();return;}
    if(action==="sound"){
      sound=!sound;$("#soundButton").textContent=sound?"♪ ON":"♪ OFF";
      $("#soundButton").setAttribute("aria-pressed",String(sound));
      if(sound)soundCue(660);return;
    }
    if(action==="copy-link"){copyLink();return;}
    if(action==="share"){share();return;}
    if(action==="feedback"){feedback();return;}
    if(action==="play-again"){start();return;}
    if(action==="download-card"){drawCard();return;}
    if(!game)return;
    if(action==="baseline-start"){beginEncode("baseline");return;}
    if(action==="finish-study"){endEncode();return;}
    if(action==="learn"){setStep("lesson");return;}
    if(action==="palace-start"){beginEncode("palace");return;}
  });
  document.addEventListener("submit",function(e){
    if(e.target&&e.target.id==="recallForm")submitRecall(e);
  });
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"&&!wrap.hidden){e.preventDefault();exit();}
    if(e.key==="Enter"&&e.target.classList.contains("answer-slot")){
      e.preventDefault();
      const inputs=$$(".answer-slot");
      const next=inputs[inputs.indexOf(e.target)+1];if(next)next.focus();else $("#recallForm")?.querySelector('button[type="submit"]')?.focus();
    }
  });
  // Use a URL flag to let Beyond-CV or friends deep-link straight to a challenge.
  const query=new URLSearchParams(location.search);
  if(query.get("play")==="memory")start();
  updateBest();
})();
