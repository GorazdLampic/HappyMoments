// HappyMoments Service Worker — vmq5rn3gc
const CACHE_NAME = 'happymoments-vmq5rn3gc';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5rn3gc',
    './notifications.js?v=mq5rn3gc',
    './i18n.js?v=mq5rn3gc',
    './historyFacts.js?v=mq5rn3gc',
    './specialNumbers.js?v=mq5rn3gc',
    './milestoneCalculator.js?v=mq5rn3gc',
    './combinations.js?v=mq5rn3gc',
    './shareMessages.js?v=mq5rn3gc',
    './giftStore.js?v=mq5rn3gc',
    './dataProtection.js?v=mq5rn3gc',
    './imageCard.js?v=mq5rn3gc',
    './checkout.js?v=mq5rn3gc',
    './analytics.js?v=mq5rn3gc',
    './auth.js?v=mq5rn3gc',
    './app.js?v=mq5rn3gc',
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