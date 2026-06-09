// HappyMoments Service Worker — vmq6eh15f
const CACHE_NAME = 'happymoments-vmq6eh15f';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq6eh15f',
    './notifications.js?v=mq6eh15f',
    './i18n.js?v=mq6eh15f',
    './historyFacts.js?v=mq6eh15f',
    './specialNumbers.js?v=mq6eh15f',
    './milestoneCalculator.js?v=mq6eh15f',
    './combinations.js?v=mq6eh15f',
    './shareMessages.js?v=mq6eh15f',
    './giftStore.js?v=mq6eh15f',
    './dataProtection.js?v=mq6eh15f',
    './imageCard.js?v=mq6eh15f',
    './checkout.js?v=mq6eh15f',
    './analytics.js?v=mq6eh15f',
    './auth.js?v=mq6eh15f',
    './app.js?v=mq6eh15f',
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