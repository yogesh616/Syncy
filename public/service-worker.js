const CACHE_NAME = "musicAppCache-v1";
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/styles.css",
    "/logo.png",
    "/bundle.js"
];

// Install Event - Cache Static Assets
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Fetch Event - Serve Cached Data When Offline
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(() => caches.match("/offline.html")); // Fallback for offline
        })
    );
});

// Activate Event - Clean Old Caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});
