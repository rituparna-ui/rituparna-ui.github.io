// Service Worker for PWA functionality
// Handles caching and offline support

// Cache version for cache busting
const CACHE_VERSION = 'v1';
const CACHE_NAME = `portfolio-cache-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/assets/styles.css',
  '/assets/theme.js',
  '/assets/particles.js',
  '/assets/typed.js',
  '/assets/favicon.ico',
  '/assets/img/logo.png',
  '/assets/img/location.png',
  // '/assets/resume.pdf',
  '/manifest.json'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] All assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Cache installation failed:', error);
        // Re-throw to prevent service worker from installing with incomplete cache
        throw error;
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('[Service Worker] Found caches:', cacheNames);
        
        // Delete all caches that don't match the current CACHE_NAME
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Cache cleanup complete');
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .then(() => {
        console.log('[Service Worker] Now controlling all clients');
      })
      .catch((error) => {
        console.error('[Service Worker] Activation failed:', error);
      })
  );
});

// Message event - handle cache refresh requests
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Received message:', event.data);
  
  if (event.data && event.data.type === 'REFRESH_CACHE') {
    console.log('[Service Worker] Refreshing cache...');
    
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          // Fetch fresh versions of all static assets
          return Promise.all(
            STATIC_ASSETS.map((url) => {
              return fetch(url)
                .then((response) => {
                  if (response.status === 200) {
                    console.log('[Service Worker] Updating cached asset:', url);
                    return cache.put(url, response);
                  }
                  console.warn('[Service Worker] Failed to fetch asset for refresh:', url, response.status);
                  return null;
                })
                .catch((error) => {
                  console.error('[Service Worker] Error refreshing asset:', url, error);
                  return null;
                });
            })
          );
        })
        .then(() => {
          console.log('[Service Worker] Cache refresh complete');
          // Notify the client that refresh is complete
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ type: 'REFRESH_COMPLETE' });
          }
        })
        .catch((error) => {
          console.error('[Service Worker] Cache refresh failed:', error);
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ type: 'REFRESH_FAILED', error: error.message });
          }
        })
    );
  }
});

// Fetch event - implement cache-first strategy with background update
self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Fetching:', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Fetch from network in the background to update cache
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Only cache successful GET requests
            if (event.request.method === 'GET' && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  console.log('[Service Worker] Updating cache in background:', event.request.url);
                  cache.put(event.request, responseToCache);
                })
                .catch((error) => {
                  console.error('[Service Worker] Failed to update cache:', error);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.log('[Service Worker] Network fetch failed, using cache only:', error.message);
            return null;
          });
        
        // Return cached response immediately if available
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          // Background update happens via fetchPromise above
          return cachedResponse;
        }
        
        // No cached response, wait for network
        console.log('[Service Worker] No cache, fetching from network:', event.request.url);
        return fetchPromise
          .then((networkResponse) => {
            if (networkResponse) {
              return networkResponse;
            }
            // Network failed and no cache, serve 404 fallback
            console.log('[Service Worker] Serving 404 fallback');
            return caches.match('/404.html')
              .then((fallbackResponse) => {
                if (fallbackResponse) {
                  return fallbackResponse;
                }
                // If 404 page is not cached, return a basic error response
                return new Response('Offline - Resource not available', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'text/plain'
                  })
                });
              });
          });
      })
      .catch((error) => {
        // Cache match failed, try network then fallback
        console.error('[Service Worker] Cache match failed:', error);
        
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache the network response for future use
            if (event.request.method === 'GET' && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch((error) => {
                  console.error('[Service Worker] Failed to cache network response:', error);
                });
            }
            return networkResponse;
          })
          .catch((networkError) => {
            // Both cache and network failed, serve 404 fallback
            console.error('[Service Worker] Network also failed:', networkError);
            
            return caches.match('/404.html')
              .then((fallbackResponse) => {
                if (fallbackResponse) {
                  return fallbackResponse;
                }
                return new Response('Offline - Resource not available', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'text/plain'
                  })
                });
              });
          });
      })
  );
});
