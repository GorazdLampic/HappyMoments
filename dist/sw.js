// HappyMoments Service Worker — vmq5pozjr
const CACHE_NAME = 'happymoments-vmq5pozjr';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5pozjr',
    './notifications.js?v=mq5pozjr',
    './i18n.js?v=mq5pozjr',
    './historyFacts.js?v=mq5pozjr',
    './specialNumbers.js?v=mq5pozjr',
    './milestoneCalculator.js?v=mq5pozjr',
    './combinations.js?v=mq5pozjr',
    './shareMessages.js?v=mq5pozjr',
    './giftStore.js?v=mq5pozjr',
    './dataProtection.js?v=mq5pozjr',
    './imageCard.js?v=mq5pozjr',
    './checkout.js?v=mq5pozjr',
    './analytics.js?v=mq5pozjr',
    './auth.js?v=mq5pozjr',
    './app.js?v=mq5pozjr',
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