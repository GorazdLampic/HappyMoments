// HappyMoments Service Worker — vmq5msvzm
const CACHE_NAME = 'happymoments-vmq5msvzm';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5msvzm',
    './notifications.js?v=mq5msvzm',
    './i18n.js?v=mq5msvzm',
    './historyFacts.js?v=mq5msvzm',
    './specialNumbers.js?v=mq5msvzm',
    './milestoneCalculator.js?v=mq5msvzm',
    './combinations.js?v=mq5msvzm',
    './shareMessages.js?v=mq5msvzm',
    './giftStore.js?v=mq5msvzm',
    './dataProtection.js?v=mq5msvzm',
    './imageCard.js?v=mq5msvzm',
    './checkout.js?v=mq5msvzm',
    './analytics.js?v=mq5msvzm',
    './auth.js?v=mq5msvzm',
    './app.js?v=mq5msvzm',
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