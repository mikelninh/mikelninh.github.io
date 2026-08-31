(()=>{
  const boot=document.createElement('script');
  boot.src='./v061.js?build=062-20260901';
  boot.defer=true;
  boot.onload=()=>{
    const hero=document.getElementById('heroPack');
    const object=document.getElementById('object');
    const start=document.getElementById('startRitual');
    if(!hero||!object||!start)return;
    const open=()=>start.click();
    hero.setAttribute('role','button');
    hero.setAttribute('tabindex','0');
    hero.setAttribute('aria-label','Open Genesis pack');
    hero.style.cursor='pointer';
    hero.addEventListener('click',open);
    hero.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
    const q=document.createElement('button');
    q.type='button';q.id='quickOpen062';q.textContent='OPEN GENESIS // 001  ↗';
    Object.assign(q.style,{position:'fixed',left:'18px',right:'18px',bottom:'calc(16px + env(safe-area-inset-bottom))',zIndex:'9999',height:'58px',border:'1px solid rgba(255,255,255,.25)',borderRadius:'999px',background:'#f4f2eb',color:'#07080b',font:'700 12px -apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif',letterSpacing:'.10em',boxShadow:'0 18px 50px rgba(0,0,0,.55)',cursor:'pointer'});
    q.addEventListener('click',open);
    object.appendChild(q);
    const hint=document.createElement('div');
    hint.textContent='TAP PACK TO OPEN';
    Object.assign(hint.style,{position:'absolute',left:'50%',bottom:'7%',transform:'translateX(-50%)',zIndex:'20',font:'700 9px -apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif',letterSpacing:'.18em',color:'rgba(255,255,255,.8)',pointerEvents:'none',whiteSpace:'nowrap'});
    hero.appendChild(hint);
  };
  document.head.appendChild(boot);
})();