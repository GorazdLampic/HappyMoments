// HappyMoments Service Worker — vmq8h86xm
const CACHE_NAME = 'happymoments-vmq8h86xm';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq8h86xm',
    './notifications.js?v=mq8h86xm',
    './i18n.js?v=mq8h86xm',
    './historyFacts.js?v=mq8h86xm',
    './specialNumbers.js?v=mq8h86xm',
    './milestoneCalculator.js?v=mq8h86xm',
    './combinations.js?v=mq8h86xm',
    './shareMessages.js?v=mq8h86xm',
    './giftStore.js?v=mq8h86xm',
    './dataProtection.js?v=mq8h86xm',
    './imageCard.js?v=mq8h86xm',
    './checkout.js?v=mq8h86xm',
    './analytics.js?v=mq8h86xm',
    './auth.js?v=mq8h86xm',
    './app.js?v=mq8h86xm',
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