// HappyMoments Service Worker — vmq5riyt7
const CACHE_NAME = 'happymoments-vmq5riyt7';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5riyt7',
    './notifications.js?v=mq5riyt7',
    './i18n.js?v=mq5riyt7',
    './historyFacts.js?v=mq5riyt7',
    './specialNumbers.js?v=mq5riyt7',
    './milestoneCalculator.js?v=mq5riyt7',
    './combinations.js?v=mq5riyt7',
    './shareMessages.js?v=mq5riyt7',
    './giftStore.js?v=mq5riyt7',
    './dataProtection.js?v=mq5riyt7',
    './imageCard.js?v=mq5riyt7',
    './checkout.js?v=mq5riyt7',
    './analytics.js?v=mq5riyt7',
    './auth.js?v=mq5riyt7',
    './app.js?v=mq5riyt7',
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