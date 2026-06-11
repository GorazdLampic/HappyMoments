// HappyMoments Service Worker — vmq9sd62s
const CACHE_NAME = 'happymoments-vmq9sd62s';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq9sd62s',
    './notifications.js?v=mq9sd62s',
    './i18n.js?v=mq9sd62s',
    './historyFacts.js?v=mq9sd62s',
    './specialNumbers.js?v=mq9sd62s',
    './milestoneCalculator.js?v=mq9sd62s',
    './combinations.js?v=mq9sd62s',
    './shareMessages.js?v=mq9sd62s',
    './giftStore.js?v=mq9sd62s',
    './dataProtection.js?v=mq9sd62s',
    './imageCard.js?v=mq9sd62s',
    './checkout.js?v=mq9sd62s',
    './analytics.js?v=mq9sd62s',
    './auth.js?v=mq9sd62s',
    './app.js?v=mq9sd62s',
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