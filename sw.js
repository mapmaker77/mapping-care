/* Mapping care · service worker
   Keeps the app on the phone so it opens without network.
   Strategy: answer from the cache at once, refresh the cache in the background;
   a new version published online is used from the next opening.
   To force every phone to refresh at once, change CACHE below. */
const CACHE='mappingcare-2.3';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  const key=req.mode==='navigate'?'./index.html':req;
  const net=fetch(req).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(key,copy))}return r}).catch(()=>null);
  e.waitUntil(net.then(()=>{}));
  e.respondWith(caches.match(key,{ignoreSearch:true}).then(async hit=>hit||(await net)||new Response('Offline',{status:503,headers:{'Content-Type':'text/plain'}})));
});
