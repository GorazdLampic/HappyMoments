// HappyMoments Service Worker — vmq5slhum
const CACHE_NAME = 'happymoments-vmq5slhum';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5slhum',
    './notifications.js?v=mq5slhum',
    './i18n.js?v=mq5slhum',
    './historyFacts.js?v=mq5slhum',
    './specialNumbers.js?v=mq5slhum',
    './milestoneCalculator.js?v=mq5slhum',
    './combinations.js?v=mq5slhum',
    './shareMessages.js?v=mq5slhum',
    './giftStore.js?v=mq5slhum',
    './dataProtection.js?v=mq5slhum',
    './imageCard.js?v=mq5slhum',
    './checkout.js?v=mq5slhum',
    './analytics.js?v=mq5slhum',
    './auth.js?v=mq5slhum',
    './app.js?v=mq5slhum',
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