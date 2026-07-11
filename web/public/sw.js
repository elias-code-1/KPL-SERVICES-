const CACHE_NAME = 'kpl-admin-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/admin',
  '/index.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  self.registration.showNotification(data.title || 'KPL SERVICES', {
    body: data.body || '',
    icon: '/favicon.svg',
    badge: '/favicon.svg'
  })
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(clients.openWindow('/admin'))
})

self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/index.html');
      })
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
  }
});
