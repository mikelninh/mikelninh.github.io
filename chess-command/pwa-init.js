(function(){
  'use strict';

  for(const href of ['./piece-skin.css','./learning-v5.css','./review-v11.css','./coach-v10.css','./mobile.css']){
    const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.appendChild(link);
  }
  for(const src of ['./piece-skin.js','./mobile-ui.js','./learning-v5.js','./review-core-v11.js','./review-v11.js','./coach-core.js','./coach-v10.js']){
    const script=document.createElement('script');script.src=src;script.async=false;document.head.appendChild(script);
  }

  let deferredInstall=null,refreshing=false;
  const installBtn=document.getElementById('installBtn');

  if('serviceWorker' in navigator){
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(refreshing)return;refreshing=true;location.reload();
    });
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(err=>console.warn('Offline mode unavailable',err));
    });
  }

  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();deferredInstall=event;if(installBtn)installBtn.hidden=false;
  });

  if(installBtn){
    installBtn.addEventListener('click',async()=>{
      if(!deferredInstall){
        const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
        const msg=isiOS?'On iPhone: Share → Add to Home Screen.':'Use your browser menu → Install app / Add to Home screen.';
        if(window.navigator.share){try{await navigator.share({title:'Chess Command',text:msg,url:location.href});}catch{}}else alert(msg);return;
      }
      deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;installBtn.hidden=true;
    });
  }

  window.addEventListener('appinstalled',()=>{deferredInstall=null;if(installBtn)installBtn.hidden=true});
})();
