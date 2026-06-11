// HappyMoments Service Worker — vmq9de6ck
const CACHE_NAME = 'happymoments-vmq9de6ck';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq9de6ck',
    './notifications.js?v=mq9de6ck',
    './i18n.js?v=mq9de6ck',
    './historyFacts.js?v=mq9de6ck',
    './specialNumbers.js?v=mq9de6ck',
    './milestoneCalculator.js?v=mq9de6ck',
    './combinations.js?v=mq9de6ck',
    './shareMessages.js?v=mq9de6ck',
    './giftStore.js?v=mq9de6ck',
    './dataProtection.js?v=mq9de6ck',
    './imageCard.js?v=mq9de6ck',
    './checkout.js?v=mq9de6ck',
    './analytics.js?v=mq9de6ck',
    './auth.js?v=mq9de6ck',
    './app.js?v=mq9de6ck',
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