// HappyMoments Service Worker — vmq5r8qjl
const CACHE_NAME = 'happymoments-vmq5r8qjl';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5r8qjl',
    './notifications.js?v=mq5r8qjl',
    './i18n.js?v=mq5r8qjl',
    './historyFacts.js?v=mq5r8qjl',
    './specialNumbers.js?v=mq5r8qjl',
    './milestoneCalculator.js?v=mq5r8qjl',
    './combinations.js?v=mq5r8qjl',
    './shareMessages.js?v=mq5r8qjl',
    './giftStore.js?v=mq5r8qjl',
    './dataProtection.js?v=mq5r8qjl',
    './imageCard.js?v=mq5r8qjl',
    './checkout.js?v=mq5r8qjl',
    './analytics.js?v=mq5r8qjl',
    './auth.js?v=mq5r8qjl',
    './app.js?v=mq5r8qjl',
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