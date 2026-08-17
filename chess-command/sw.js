const CACHE='chess-command-v11';
const CORE=[
  './','./index.html','./chess-styles.css','./piece-skin.css','./learning-v5.css','./review-v11.css','./coach-v10.css','./mobile.css',
  './chess-core.js','./coach-core.js','./review-core-v11.js','./data.js','./stockfish-bridge.js','./chess-app.js','./learning-v5.js','./review-v11.js','./coach-v10.js',
  './piece-skin.js','./mobile-ui.js','./pwa-init.js','./pieces.svg','./manifest.webmanifest','./chess-command-icon.svg'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin){event.respondWith(fetch(req).catch(()=>new Response('',{status:503,statusText:'Offline'})));return}if(req.mode==='navigate'){event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html')));return}event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return res}))) });
