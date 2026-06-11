// HappyMoments Service Worker — vmq9nj5c9
const CACHE_NAME = 'happymoments-vmq9nj5c9';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq9nj5c9',
    './notifications.js?v=mq9nj5c9',
    './i18n.js?v=mq9nj5c9',
    './historyFacts.js?v=mq9nj5c9',
    './specialNumbers.js?v=mq9nj5c9',
    './milestoneCalculator.js?v=mq9nj5c9',
    './combinations.js?v=mq9nj5c9',
    './shareMessages.js?v=mq9nj5c9',
    './giftStore.js?v=mq9nj5c9',
    './dataProtection.js?v=mq9nj5c9',
    './imageCard.js?v=mq9nj5c9',
    './checkout.js?v=mq9nj5c9',
    './analytics.js?v=mq9nj5c9',
    './auth.js?v=mq9nj5c9',
    './app.js?v=mq9nj5c9',
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