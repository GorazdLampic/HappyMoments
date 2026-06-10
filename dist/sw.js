// HappyMoments Service Worker — vmq815hm6
const CACHE_NAME = 'happymoments-vmq815hm6';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq815hm6',
    './notifications.js?v=mq815hm6',
    './i18n.js?v=mq815hm6',
    './historyFacts.js?v=mq815hm6',
    './specialNumbers.js?v=mq815hm6',
    './milestoneCalculator.js?v=mq815hm6',
    './combinations.js?v=mq815hm6',
    './shareMessages.js?v=mq815hm6',
    './giftStore.js?v=mq815hm6',
    './dataProtection.js?v=mq815hm6',
    './imageCard.js?v=mq815hm6',
    './checkout.js?v=mq815hm6',
    './analytics.js?v=mq815hm6',
    './auth.js?v=mq815hm6',
    './app.js?v=mq815hm6',
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