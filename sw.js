const CACHE_NAME = 'magari-dev-cache-v4.2.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo-header.png',
  './logo-square.png'
];

// Installazione: salva in cache la struttura dell'app
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Attivazione: rimuove le vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercettazione richieste (Network First, Cache Fallback)
self.addEventListener('fetch', (event) => {
  // Lascia che sia Firebase a gestire le proprie chiamate
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('firebase') || 
      event.request.url.includes('identitytoolkit')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
