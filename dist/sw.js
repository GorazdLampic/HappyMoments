// HappyMoments Service Worker — vmq5mfrkj
const CACHE_NAME = 'happymoments-vmq5mfrkj';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5mfrkj',
    './notifications.js?v=mq5mfrkj',
    './i18n.js?v=mq5mfrkj',
    './historyFacts.js?v=mq5mfrkj',
    './specialNumbers.js?v=mq5mfrkj',
    './milestoneCalculator.js?v=mq5mfrkj',
    './combinations.js?v=mq5mfrkj',
    './shareMessages.js?v=mq5mfrkj',
    './giftStore.js?v=mq5mfrkj',
    './dataProtection.js?v=mq5mfrkj',
    './imageCard.js?v=mq5mfrkj',
    './checkout.js?v=mq5mfrkj',
    './analytics.js?v=mq5mfrkj',
    './auth.js?v=mq5mfrkj',
    './app.js?v=mq5mfrkj',
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