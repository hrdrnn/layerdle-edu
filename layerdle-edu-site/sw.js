const CACHE_NAME = 'layerdle-v1';
// List of resources to precache
const PRECACHE_RESOURCES = [
  '/',
  'index.html',
  'about.html',
  'faq.html',
  'privacy.html',
  'styles.css',
  'site.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_RESOURCES);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Only handle requests to our own origin
  if (url.origin === self.location.origin) {
    // Bypass caching for audio (stems) and manifests
    if (url.pathname.endsWith('.wav') || url.pathname.endsWith('.mp3') || url.pathname.endsWith('.json')) {
      return;
    }
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return (
          cachedResponse ||
          fetch(event.request).then(response => {
            // Cache fetched file for future visits
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
        );
      })
    );
  }
});