// HappyMoments Service Worker — vmq5qvdqe
const CACHE_NAME = 'happymoments-vmq5qvdqe';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5qvdqe',
    './notifications.js?v=mq5qvdqe',
    './i18n.js?v=mq5qvdqe',
    './historyFacts.js?v=mq5qvdqe',
    './specialNumbers.js?v=mq5qvdqe',
    './milestoneCalculator.js?v=mq5qvdqe',
    './combinations.js?v=mq5qvdqe',
    './shareMessages.js?v=mq5qvdqe',
    './giftStore.js?v=mq5qvdqe',
    './dataProtection.js?v=mq5qvdqe',
    './imageCard.js?v=mq5qvdqe',
    './checkout.js?v=mq5qvdqe',
    './analytics.js?v=mq5qvdqe',
    './auth.js?v=mq5qvdqe',
    './app.js?v=mq5qvdqe',
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