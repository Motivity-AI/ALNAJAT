/* ==================== النجاة — Service Worker ==================== */
const VERSION = 'najat-v29';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './alnajat-v2.js?v=2',
  './alnajat-cinema.js?v=1',
  './alnajat-world.js?v=1',
  './alnajat-characters.js?v=1',
  './alnajat-director.js?v=2',
  './alnajat-memory-book.js?v=1',
  './alnajat-audio-engine.js?v=3',
  './alnajat-cinema-pro.js?v=2',
  './alnajat-editorial.js?v=7',
  './alnajat-safety.js?v=8',
  './sources.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    try {
      // Install atomically: an incomplete shell must never replace the last
      // working offline version. addAll rejects if any required asset fails.
      await cache.addAll(SHELL);
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(VERSION);
      throw error;
    }
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req).then(res => {
      if (res && res.ok && res.type === 'basic') {
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    }).catch(() => null);
    if (cached) return cached;
    const fresh = await network;
    if (fresh) return fresh;
    if (req.mode === 'navigate') {
      return cache.match('./index.html') || cache.match('./');
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  })());
});
