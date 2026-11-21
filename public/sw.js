// RON 500 service worker: makes the scorekeeper installable and playable offline.
// Game state lives in AsyncStorage (localStorage on web), so the worker only keeps the app shell available.
// Bump VERSION to drop every old cache on the next visit.
const VERSION = 'v1';
const CACHE = `ron500-${VERSION}`;
const PAGES = ['/', '/game', '/stats'];
const ICONS = ['/icons/icon-192.png', '/icons/icon-512.png', '/manifest.webmanifest'];

// Hashed bundles, fonts and images never change under the same URL.
const isImmutable = (pathname) => pathname.startsWith('/_expo/static/') || pathname.startsWith('/assets/') || pathname.startsWith('/icons/');

// Caches the shell plus the hashed JS/CSS that the home page references, so the
// very first visit is already fully available offline, not only the second one.
async function precache(cache) {
  await cache.add('/'); // required: without the shell there is nothing to install
  await Promise.all([...PAGES.slice(1), ...ICONS].map((url) => cache.add(url).catch(() => {})));
  const html = await (await cache.match('/')).text();
  const assets = new Set(html.match(/\/_expo\/static\/[^"'\\\s)<>]+/g) || []);
  await Promise.all([...assets].map((url) => cache.add(url).catch(() => {})));
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(precache).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('ron500-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// The page reports the files it loaded (fonts, icons, images that only the running app requests)
// so they are available offline too.
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'CACHE_URLS') return;
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        event.data.urls
          .map((href) => new URL(href, self.location.origin))
          .filter((url) => url.origin === self.location.origin && isImmutable(url.pathname))
          .map((url) => cache.match(url.href).then((hit) => hit || cache.add(url.href).catch(() => {}))),
      ),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Pages: prefer the network so updates arrive, fall back to the cached page or shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')).then((cached) => cached || Response.error())),
    );
    return;
  }

  if (isImmutable(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
