const CACHE_NAME = 'backpack-insight-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Статичные ресурсы для кэширования с версионированием
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/main.js',
    '/assets/main.css',
    '/lang/ru.json',
    '/lang/en.json',
    '/images/const/webp/logo.webp',
    '/images/const/webp/menu.webp',
    '/fonts/NotoSans.woff2',
    '/fonts/NotoSans-Bold.woff2'
];

// Время кеширования для разных типов ресурсов
const CACHE_TIMES = {
    static: 24 * 60 * 60 * 1000, // 24 часа
    dynamic: 60 * 60 * 1000,     // 1 час
    api: 5 * 60 * 1000          // 5 минут
};

// Установка Service Worker
self.addEventListener('install', (event) => {
    console.log('SW: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('SW: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', (event) => {
    console.log('SW: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('SW: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
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

    // Проверяем медленное соединение (3G или хуже)
    event.respondWith(
        (async () => {
            const connection = await getEffectiveConnectionType();
            
            // На медленных соединениях используем более агрессивные стратегии кэширования
            if (connection === 'slow-2g' || connection === '2g') {
                // На 2G/3G кэшируем всё агрессивно и не делаем фоновых запросов
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
                // На быстрых соединениях используем обычные стратегии
                if (request.destination === 'image') {
                    return cacheFirst(request);
                } else if (url.pathname.startsWith('/api/')) {
                    return networkFirst(request);
                } else if (request.destination === 'script' || request.destination === 'style') {
                    return cacheFirst(request);
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
        // Проверяем NetworkInformation API если доступен
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return connection.effectiveType || '4g';
        }
    } catch (e) {
        console.log('NetworkInformation API not available');
    }
    
    // Fallback: определяем по времени отклика
    const start = performance.now();
    try {
        await fetch('/static/lang/ru.json', { method: 'HEAD' });
        const duration = performance.now() - start;
        
        if (duration > 2000) return 'slow-2g';
        if (duration > 1000) return '2g';
        if (duration > 500) return '3g';
        return '4g';
    } catch (e) {
        return 'slow-2g'; // Если нет сети, считаем очень медленным
    }
}

// Cache Only стратегия (для медленных соединений)
async function cacheOnly(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Если нет в кэше, пробуем получить из сети (но без сохранения)
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        console.log('SW: No cache and no network for:', request.url);
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
        // Обновляем кэш в фоне
        fetch(request).then((response) => {
            if (response.ok) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, responseClone);
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
                cache.put(request, responseClone);
            });
        }
        
        return networkResponse;
    } catch (error) {
        console.log('SW: Network failed, serving from cache if available');
        return new Response('Offline', { 
            status: 503, 
            statusText: 'Service Unavailable' 
        });
    }
}

// Network First стратегия
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
            });
        }
        
        return networkResponse;
    } catch (error) {
        console.log('SW: Network failed, trying cache');
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Для API запросов возвращаем ошибку
        if (request.url.includes('/api/')) {
            return new Response(JSON.stringify({ 
                error: 'Offline - no cached data available' 
            }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Для остальных запросов пытаемся найти что-то в кэше
        return caches.match('/index.html') || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stale While Revalidate стратегия
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
            });
        }
        return networkResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// Очистка кэша при сообщении от клиента
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('SW: Cache update requested');
        // Можно добавить логику обновления конкретных файлов
    }
});
