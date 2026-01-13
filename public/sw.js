const CACHE_NAME = 'bus-talk-v3';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache what we can, don't fail if some resources don't exist
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url).catch(() => console.log('Could not cache:', url)))
        );
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  // Claim any clients immediately
  event.waitUntil(self.clients.claim());

  // Remove old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event with proper error handling
self.addEventListener('fetch', (event) => {
  // Skip non-http(s) requests (like chrome-extension://)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip Convex WebSocket connections
  if (event.request.url.includes('convex.cloud') || event.request.url.includes('convex.site')) {
    return;
  }

  // For navigation requests, use Network First strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request) || caches.match('/');
        })
    );
    return;
  }

  // For other resources, try cache first, fall back to network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        // Clone the request because fetch consumes it
        return fetch(event.request.clone())
          .then((fetchResponse) => {
            // Don't cache non-successful responses or non-GET requests
            if (!fetchResponse || fetchResponse.status !== 200 || event.request.method !== 'GET') {
              return fetchResponse;
            }

            // Clone and cache the response
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(() => { });

            return fetchResponse;
          })
          .catch((error) => {
            console.log('Fetch failed for:', event.request.url);
            // Return a fallback response or just let it fail silently
            return new Response('', { status: 408, statusText: 'Request timed out' });
          });
      })
  );
});

// Push event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Bus Talk',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Bus Talk', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});