// HappyMoments Service Worker — vmq8flnho
const CACHE_NAME = 'happymoments-vmq8flnho';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq8flnho',
    './notifications.js?v=mq8flnho',
    './i18n.js?v=mq8flnho',
    './historyFacts.js?v=mq8flnho',
    './specialNumbers.js?v=mq8flnho',
    './milestoneCalculator.js?v=mq8flnho',
    './combinations.js?v=mq8flnho',
    './shareMessages.js?v=mq8flnho',
    './giftStore.js?v=mq8flnho',
    './dataProtection.js?v=mq8flnho',
    './imageCard.js?v=mq8flnho',
    './checkout.js?v=mq8flnho',
    './analytics.js?v=mq8flnho',
    './auth.js?v=mq8flnho',
    './app.js?v=mq8flnho',
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