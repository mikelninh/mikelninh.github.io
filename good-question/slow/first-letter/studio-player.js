/* GOOD QUESTION premium playback v0 — only use real, licensed audio files.
   This module will never claim a voice recording exists when the manifest is empty. */
(()=>{
'use strict';
const manifest=window.GQ_NARRATION;
if(!manifest)return;
const target=document.querySelector('#audio-mount');
if(!target)return;
let live=null,el=null;
const lang=()=>['de','en','vi'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
const strings={
en:{recording:"Studio narration",play:"▶ Play the audio edition",pause:"Ⅱ Pause",speed:"Speed",download:"Download MP3",fallback:"No mastered audio edition yet. Device narration is still available below."},
de:{recording:"Gesprochene Ausgabe",play:"▶ Audio-Ausgabe abspielen",pause:"Ⅱ Pause",speed:"Tempo",download:"MP3 herunterladen",fallback:"Noch keine produzierte Audiofassung. Die Geräte-Vorlesefunktion bleibt unten verfügbar."},
vi:{recording:"Bản thu âm",play:"▶ Nghe bản thu",pause:"Ⅱ Tạm dừng",speed:"Tốc độ",download:"Tải MP3",fallback:"Chưa có bản thu hoàn thiện. Tính năng đọc bằng thiết bị vẫn có ở bên dưới."}
};
function stop(){if(live){live.pause();live.src='';live.load();live=null;}if(el){el.remove();el=null;}}
function render(){
  stop();
  const code=lang(),src=manifest.tracks?.[code],words=strings[code];
  if(!src||!/^(\.\/|\.\.\/|\/good-question\/)[\w./-]+\.mp3$/.test(src)){
    target.dataset.studioStatus='not-recorded';
    return;
  }
  const box=document.createElement('section');
  box.className='gq-studio-audio';box.setAttribute('aria-label',words.recording);
  box.innerHTML='<div class="gq-studio-heading">✳ <span></span></div><audio controls preload="metadata" playsinline></audio><div class="gq-studio-actions"><label><span></span><select aria-label="Audio speed"><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><a download></a></div>';
  box.querySelector('.gq-studio-heading span').textContent=words.recording;
  box.querySelector('.gq-studio-actions label span').textContent=words.speed;
  const a=box.querySelector('audio');a.src=src;live=a;
  box.querySelector('select').addEventListener('change',e=>{a.playbackRate=Number(e.target.value)});
  const link=box.querySelector('a');link.href=src;link.textContent=words.download;link.download='GOOD_QUESTION_WUNDERPOST_001_'+code+'.mp3';
  const tts=target.querySelector('.gq-audio,.gq-listen');if(tts)tts.hidden=true;
  a.addEventListener('error',()=>{box.remove();el=null;target.dataset.studioStatus='audio-unavailable';if(tts)tts.hidden=false});
  a.addEventListener('play',()=>{try{navigator.mediaSession.metadata=new MediaMetadata({title:'The Little Things We Return To',artist:'GOOD QUESTION',album:'WUNDERPOST 001'})}catch(e){}});
  target.prepend(box);el=box;target.dataset.studioStatus='ready';
}
const style=document.createElement('style');style.textContent='.gq-studio-audio{padding:16px;background:#edf0e5;border:1px solid #d8dcca;display:grid;gap:10px;margin-bottom:15px}.gq-studio-heading{font-size:12px;font-weight:800;letter-spacing:1px}.gq-studio-audio audio{width:100%}.gq-studio-actions{display:flex;gap:20px;align-items:center;flex-wrap:wrap;font-size:12px}.gq-studio-actions select{padding:8px;border:1px solid #9caa99;background:#fff}.gq-studio-actions a{font-weight:700}';document.head.append(style);
window.addEventListener('gq:language-changed',render);
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>queueMicrotask(render)));
render();window.GQ_STUDIO_AUDIO_TEST={status:()=>target.dataset.studioStatus,hasRecordedAudio:()=>!!live};
})();
