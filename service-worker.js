// SatyaSetu - Service Worker (service-worker.js) for Offline capabilities (Flat Root Multi-page version)

const CACHE_NAME = 'satyasetu-v9-cache';
const ASSETS = [
    '/',
    '/index.html',
    '/report.html',
    '/register.html',
    '/dashboard.html',
    '/analytics.html',
    '/map.html',
    '/quiz.html',
    '/complaints.html',
    '/complaint.html',
    '/about.html',
    '/privacy.html',
    '/settings.html',
    '/manifest.json',
    '/styles.css',
    '/config.js',
    '/app.js',
    '/firebase.js',
    '/ui.js',
    '/ai.js',
    '/charts.js',
    '/validation.js',
    '/utils.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap',
    'https://unpkg.com/lucide@latest',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching flat multipage assets.');
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('Service Worker: Clearing legacy cache version', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    const isFirebase = e.request.url.includes('firebase') || e.request.url.includes('googleapis');
    if (isFirebase) return;

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Background fetch update cache
                fetch(e.request).then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
                    }
                }).catch(() => {});
                
                return cachedResponse;
            }

            return fetch(e.request).then((networkResponse) => {
                if (networkResponse.status === 200 && e.request.url.startsWith(self.location.origin)) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
                }
                return networkResponse;
            }).catch(() => {
                const acceptHeader = e.request.headers.get('accept');
                if (acceptHeader && acceptHeader.includes('text/html')) {
                    // Fallback to offline index page
                    return caches.match('/index.html');
                }
            });
        })
    );
});
