const CACHE='vanberto-central-v23';
// Essenciais: se faltar um, a instalação falha (e deve falhar).
const CORE=['./','index.html','manifest.webmanifest','favicon.png','apple-touch-icon.png','icon-128.png','icon-192.png','icon-256.png','icon-512.png'];
// Fontes: tolerantes — se algum caminho estiver errado, não impede o service worker de instalar.
const FONTS=['fonts/fredoka-latin-wght-normal.woff2','fonts/nunito-latin-400-normal.woff2','fonts/nunito-latin-600-normal.woff2','fonts/nunito-latin-700-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(async c=>{
  await c.addAll(CORE);
  await Promise.allSettled(FONTS.map(f=>c.add(f)));
}).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
// Página principal: rede primeiro (as alterações aparecem logo); se estiver sem ligação ou lenta (>3 s), usa a cópia guardada.
// Restantes ficheiros: stale-while-revalidate (abrem logo da cache e atualizam em segundo plano). Só ficheiros da própria Central.
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const isPage=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');
  if(isPage){
    e.respondWith(caches.open(CACHE).then(c=>{
      const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res;});
      const cached=()=>c.match(r,{ignoreSearch:true}).then(h=>h||c.match('index.html'));
      const slow=new Promise((_,rej)=>setTimeout(rej,3000));
      return Promise.race([net,slow]).catch(()=>cached().then(h=>h||net));
    }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res;}).catch(()=>hit);
    return hit||net;
  })));
});
