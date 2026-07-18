// SatyaSetu - Service Worker (sw.js) for Offline capabilities (Multipage version)

const CACHE_NAME = 'satyasetu-v4-cache';
const ASSETS = [
    '/',
    '/home.html',
    '/register.html',
    '/dashboard.html',
    '/privacy.html',
    '/admin.html',
    '/manifest.json',
    '/styles.css',
    '/config.js',
    '/app.js',
    '/firebase.js',
    '/libs/cloud-core.js',
    '/libs/cloud-auth.js',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js',
    '/ui.js',
    '/ai.js',
    '/charts.js',
    '/validation.js',
    '/utils.js',
    '/logo.png',
    '/Bribe(curruption).png',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap',
    'https://unpkg.com/lucide@latest',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching multipage shell assets.');
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
                        console.log('Service Worker: Caching update clean version', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    const isCloudInternal = e.request.url.includes('firebaseapp.com') || e.request.url.includes('googleapis');
    if (isCloudInternal) return;

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
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
                if (e.request.headers.get('accept').includes('text/html')) {
                    // Fallback to offline index page
                    return caches.match('/home.html');
                }
            });
        })
    );
});

