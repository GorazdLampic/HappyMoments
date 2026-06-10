// HappyMoments Service Worker — vmq7y8t8b
const CACHE_NAME = 'happymoments-vmq7y8t8b';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq7y8t8b',
    './notifications.js?v=mq7y8t8b',
    './i18n.js?v=mq7y8t8b',
    './historyFacts.js?v=mq7y8t8b',
    './specialNumbers.js?v=mq7y8t8b',
    './milestoneCalculator.js?v=mq7y8t8b',
    './combinations.js?v=mq7y8t8b',
    './shareMessages.js?v=mq7y8t8b',
    './giftStore.js?v=mq7y8t8b',
    './dataProtection.js?v=mq7y8t8b',
    './imageCard.js?v=mq7y8t8b',
    './checkout.js?v=mq7y8t8b',
    './analytics.js?v=mq7y8t8b',
    './auth.js?v=mq7y8t8b',
    './app.js?v=mq7y8t8b',
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