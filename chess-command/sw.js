const CACHE='chess-command-v2';
const CORE=[
  './',
  './index.html',
  './chess-styles.css',
  './mobile.css',
  './chess-core.js',
  './data.js',
  './stockfish-bridge.js',
  './chess-app.js',
  './pwa-init.js',
  './manifest.webmanifest',
  './chess-command-icon.svg'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);

  // Stockfish is network-first; if unavailable, Chess Command already has a local offline opponent fallback.
  if(url.origin!==self.location.origin){
    event.respondWith(fetch(req).catch(()=>new Response('',{status:503,statusText:'Offline'})));
    return;
  }

  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(cache=>cache.put('./index.html',copy));
        return res;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}
      return res;
    }))
  );
});
