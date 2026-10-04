const CACHE='vanberto-central-v4';
// Essenciais: se faltar um, a instalação falha (e deve falhar).
const CORE=['./','index.html','manifest.webmanifest','favicon.png','apple-touch-icon.png','icon-128.png','icon-192.png','icon-256.png','icon-512.png'];
// Fontes: tolerantes — se algum caminho estiver errado, não impede o service worker de instalar.
const FONTS=['fonts/fredoka-latin-wght-normal.woff2','fonts/nunito-latin-400-normal.woff2','fonts/nunito-latin-600-normal.woff2','fonts/nunito-latin-700-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(async c=>{
  await c.addAll(CORE);
  await Promise.allSettled(FONTS.map(f=>c.add(f)));
}).then(()=>self.skipWaiting()));});
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
