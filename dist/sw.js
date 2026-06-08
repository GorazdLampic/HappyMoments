// HappyMoments Service Worker — vmq5qs2ax
const CACHE_NAME = 'happymoments-vmq5qs2ax';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5qs2ax',
    './notifications.js?v=mq5qs2ax',
    './i18n.js?v=mq5qs2ax',
    './historyFacts.js?v=mq5qs2ax',
    './specialNumbers.js?v=mq5qs2ax',
    './milestoneCalculator.js?v=mq5qs2ax',
    './combinations.js?v=mq5qs2ax',
    './shareMessages.js?v=mq5qs2ax',
    './giftStore.js?v=mq5qs2ax',
    './dataProtection.js?v=mq5qs2ax',
    './imageCard.js?v=mq5qs2ax',
    './checkout.js?v=mq5qs2ax',
    './analytics.js?v=mq5qs2ax',
    './auth.js?v=mq5qs2ax',
    './app.js?v=mq5qs2ax',
    './manifest.json',
    './legal.html'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    // Network-first for HTML (get latest), cache-first for assets
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request).catch(() => caches.match(e.request))
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(r => r || fetch(e.request))
        );
    }
});