(function(){
'use strict';
var progress=document.getElementById('read-progress');
var status=document.getElementById('reader-status');
function updateProgress(){var max=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(max>0?Math.max(0,Math.min(100,window.scrollY/max*100)):0)+'%';}
window.addEventListener('scroll',updateProgress,{passive:true});window.addEventListener('resize',updateProgress);updateProgress();
var theme=document.getElementById('theme');theme.addEventListener('click',function(){var night=document.body.dataset.theme!=='night';document.body.dataset.theme=night?'night':'day';theme.textContent=night?'☼ Day':'☾ Night';theme.setAttribute('aria-pressed',String(night));});theme.setAttribute('aria-pressed','false');
document.getElementById('share').addEventListener('click',async function(){
 var url=location.href.split('#')[0];try{if(navigator.share){await navigator.share({title:document.title,url:url});status.textContent='';return;}if(navigator.clipboard){await navigator.clipboard.writeText(url);status.textContent='Link copied.';return;}}catch(e){if(e.name==='AbortError')return;}
 status.textContent='Copy this link from your address bar to share.';
});
var listen=document.getElementById('listen'),stop=document.getElementById('stop');
if('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window){listen.hidden=false;stop.hidden=false;var synth=window.speechSynthesis;
 listen.addEventListener('click',function(){if(synth.speaking){synth.cancel();status.textContent='Reading stopped.';return;}var speech=new SpeechSynthesisUtterance(document.getElementById('poem').innerText);speech.lang='en-GB';speech.rate=.85;speech.pitch=1;speech.onend=function(){status.textContent='Reading finished.';};speech.onerror=function(){status.textContent='Your device could not read this aloud.';};synth.speak(speech);status.textContent='Reading aloud with your device voice.';});
 stop.addEventListener('click',function(){synth.cancel();status.textContent='Reading stopped.';});window.addEventListener('pagehide',function(){synth.cancel();});
}
var note=document.getElementById('reflection-note'),noteStatus=document.getElementById('note-status');
var key='after-visiting-earth:reflection:001';
try{note.value=localStorage.getItem(key)||'';}catch(e){}
document.getElementById('save-note').addEventListener('click',function(){try{localStorage.setItem(key,note.value);noteStatus.textContent='Saved privately on this device.';}catch(e){noteStatus.textContent='Could not save here. Try copying your words instead.';}});
document.getElementById('copy-note').addEventListener('click',async function(){try{await navigator.clipboard.writeText(note.value);noteStatus.textContent='Your words were copied.';}catch(e){note.select();noteStatus.textContent='Select and copy your words with your keyboard.';}});
document.getElementById('clear-note').addEventListener('click',function(){note.value='';try{localStorage.removeItem(key);}catch(e){}noteStatus.textContent='Cleared from this device.';note.focus();});
})();