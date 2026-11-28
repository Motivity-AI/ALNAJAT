/* ==================== النجاة — Service Worker ==================== */
const VERSION = 'najat-v43';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './alnajat-v2.js?v=4',
  './alnajat-cinema.js?v=1',
  './alnajat-world.js?v=1',
  './alnajat-characters.js?v=1',
  './alnajat-director.js?v=4',
  './alnajat-memory-book.js?v=1',
  './alnajat-audio-engine.js?v=3',
  './alnajat-cinema-pro.js?v=2',
  './alnajat-editorial.js?v=7',
  './alnajat-safety.js?v=10',
  './alnajat-all-sudan.js?v=2',
  './alnajat-next-chapter.js?v=3',
  './sources.html',
  './privacy.html',
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

  const cachePromise = caches.open(VERSION);
  const networkPromise = fetch(req).then(async (res) => {
    if (res && res.ok && res.type === 'basic') {
      const cache = await cachePromise;
      await cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  }).catch(() => null);
  // Keep the background refresh alive even when a cached response is returned.
  e.waitUntil(networkPromise.then(() => undefined));
  e.respondWith((async () => {
    const cache = await cachePromise;
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;
    const response = await networkPromise;
    if (response) return response;
    if (req.mode === 'navigate') return (await cache.match('./index.html')) || (await cache.match('./'));
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  })());
});
