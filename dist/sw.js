// HappyMoments Service Worker — vmq5ovbby
const CACHE_NAME = 'happymoments-vmq5ovbby';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5ovbby',
    './notifications.js?v=mq5ovbby',
    './i18n.js?v=mq5ovbby',
    './historyFacts.js?v=mq5ovbby',
    './specialNumbers.js?v=mq5ovbby',
    './milestoneCalculator.js?v=mq5ovbby',
    './combinations.js?v=mq5ovbby',
    './shareMessages.js?v=mq5ovbby',
    './giftStore.js?v=mq5ovbby',
    './dataProtection.js?v=mq5ovbby',
    './imageCard.js?v=mq5ovbby',
    './checkout.js?v=mq5ovbby',
    './analytics.js?v=mq5ovbby',
    './auth.js?v=mq5ovbby',
    './app.js?v=mq5ovbby',
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