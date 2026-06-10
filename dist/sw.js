// HappyMoments Service Worker — vmq8j5ke4
const CACHE_NAME = 'happymoments-vmq8j5ke4';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq8j5ke4',
    './notifications.js?v=mq8j5ke4',
    './i18n.js?v=mq8j5ke4',
    './historyFacts.js?v=mq8j5ke4',
    './specialNumbers.js?v=mq8j5ke4',
    './milestoneCalculator.js?v=mq8j5ke4',
    './combinations.js?v=mq8j5ke4',
    './shareMessages.js?v=mq8j5ke4',
    './giftStore.js?v=mq8j5ke4',
    './dataProtection.js?v=mq8j5ke4',
    './imageCard.js?v=mq8j5ke4',
    './checkout.js?v=mq8j5ke4',
    './analytics.js?v=mq8j5ke4',
    './auth.js?v=mq8j5ke4',
    './app.js?v=mq8j5ke4',
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