const CACHE_NAME = 'backpack-insight-v5';
const STATIC_CACHE = 'static-v5';
const DYNAMIC_CACHE = 'dynamic-v5';

// Кэшируем только стабильные unhashed ресурсы.
// Vite assets имеют hash в имени и должны подтягиваться из актуального index.html.
const STATIC_ASSETS = [
    '/lang/ru.json',
    '/lang/en.json',
    '/images/const/webp/logo.webp',
    '/images/const/webp/menu.webp',
    '/fonts/NotoSans.woff2',
    '/fonts/NotoSans-Bold.woff2'
];

const MAX_DYNAMIC_CACHE_ENTRIES = 350;

// Установка Service Worker
self.addEventListener('install', (event) => {
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', (event) => {
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(async () => {
                if (self.registration.navigationPreload) {
                    await self.registration.navigationPreload.enable();
                }
            })
            .then(() => self.clients.claim())
    );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Пропускаем Chrome Extension и другие не-http запросы
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Пропускаем POST запросы (нельзя кэшировать)
    if (request.method === 'POST') {
        return;
    }

    event.respondWith(
        (async () => {
            const connection = await getEffectiveConnectionType();

            // HTML-навигация всегда network-first, чтобы F5 после нового деплоя
            // получал свежий index.html с актуальными hash-чанками.
            if (request.mode === 'navigate') {
                return networkFirst(request, event);
            }

            if (url.pathname === '/sw.js') {
                return fetch(request);
            }
            
            // На медленных соединениях используем более агрессивные стратегии кэширования
            if (connection === 'slow-2g' || connection === '2g') {
                if (request.destination === 'image') {
                    return cacheOnly(request);
                } else if (request.destination === 'script' || request.destination === 'style') {
                    return cacheOnly(request);
                } else if (url.pathname.startsWith('/api/')) {
                    return networkFirst(request);
                } else {
                    return cacheFirst(request);
                }
            } else {
                // JS/CSS имеют hash в имени, поэтому cache-first безопаснее и убирает рывок стилей при F5.
                if (request.destination === 'script' || request.destination === 'style') {
                    return cacheFirst(request);
                } else if (request.destination === 'image') {
                    return cacheFirst(request);
                } else if (url.pathname.startsWith('/api/')) {
                    return networkFirst(request);
                } else {
                    return staleWhileRevalidate(request);
                }
            }
        })()
    );
});

// Определение типа соединения
async function getEffectiveConnectionType() {
    try {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return connection.effectiveType || '4g';
        }
    } catch (e) {
    }
    
    return '4g';
}

// Cache Only стратегия (для медленных соединений)
async function cacheOnly(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        return new Response('Offline - no cached data available', { 
            status: 503, 
            statusText: 'Service Unavailable' 
        });
    }
}

// Cache First стратегия
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        fetch(request).then((response) => {
            if (response.ok) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, responseClone).then(() => trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ENTRIES));
                });
            }
        });
        
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone).then(() => trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ENTRIES));
            });
        }
        
        return networkResponse;
    } catch (error) {
        return new Response('Offline', { 
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network First стратегия
async function networkFirst(request, event) {
    try {
        if (event?.preloadResponse) {
            const preloadResponse = await event.preloadResponse;
            if (preloadResponse) return preloadResponse;
        }

        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone).then(() => trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ENTRIES));
            });
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        if (request.url.includes('/api/')) {
            return new Response(JSON.stringify({ 
                error: 'Offline - no cached data available' 
            }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (request.mode === 'navigate') {
            return caches.match('/index.html') || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
            });
        }

        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stale While Revalidate стратегия
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);

    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, responseClone).then(() => trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ENTRIES));
                });
            }
            return networkResponse;
        })
        .catch(() => {
            return cachedResponse || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
            });
        });
    
    return cachedResponse || fetchPromise;
}

async function trimCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= maxEntries) return;

    await Promise.all(
        keys.slice(0, keys.length - maxEntries).map(key => cache.delete(key))
    );
}

// Очистка кэша при сообщении от клиента
self.addEventListener('message', (event) => {
    // Проверяем origin отправителя — принимаем только сообщения с нашего домена.
    // event.origin у SW-сообщений содержит origin клиентской страницы.
    if (event.origin && event.origin !== self.location.origin) return;

    if (event.data && event.data.type === 'CACHE_UPDATED') {
        trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ENTRIES);
    }
});
