const CACHE='vanberto-central-v1';
const FILES=['./','index.html','manifest.webmanifest','favicon.png','apple-touch-icon.png','icon-128.png','icon-256.png',
 'fonts/fredoka-latin-wght-normal.woff2','fonts/nunito-latin-400-normal.woff2','fonts/nunito-latin-600-normal.woff2','fonts/nunito-latin-700-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
// Stale-while-revalidate: abre logo da cache e atualiza em segundo plano. Só ficheiros da própria Central.
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res;}).catch(()=>hit);
    return hit||net;
  })));
});
