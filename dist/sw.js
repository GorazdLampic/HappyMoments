// HappyMoments Service Worker — vmq9ewpuv
const CACHE_NAME = 'happymoments-vmq9ewpuv';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq9ewpuv',
    './notifications.js?v=mq9ewpuv',
    './i18n.js?v=mq9ewpuv',
    './historyFacts.js?v=mq9ewpuv',
    './specialNumbers.js?v=mq9ewpuv',
    './milestoneCalculator.js?v=mq9ewpuv',
    './combinations.js?v=mq9ewpuv',
    './shareMessages.js?v=mq9ewpuv',
    './giftStore.js?v=mq9ewpuv',
    './dataProtection.js?v=mq9ewpuv',
    './imageCard.js?v=mq9ewpuv',
    './checkout.js?v=mq9ewpuv',
    './analytics.js?v=mq9ewpuv',
    './auth.js?v=mq9ewpuv',
    './app.js?v=mq9ewpuv',
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