// ⚠ INCRÉMENTER CE NUMÉRO À CHAQUE MODIFICATION DE index.html
// sinon l'app installée continuera à servir l'ancienne version en cache.
const CACHE = 'galenique-v11';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const isHTML = e.request.mode === 'navigate' ||
                 (e.request.destination === 'document') ||
                 e.request.url.endsWith('index.html');
  if (isHTML) {
    // network-first : on prend la version en ligne si possible, le cache sert de secours hors-ligne
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then((c) => c || caches.match('./index.html')))
    );
    return;
  }
  // cache-first pour le reste (icônes, manifest)
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
