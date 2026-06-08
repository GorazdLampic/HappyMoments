// HappyMoments Service Worker — vmq5trap7
const CACHE_NAME = 'happymoments-vmq5trap7';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5trap7',
    './notifications.js?v=mq5trap7',
    './i18n.js?v=mq5trap7',
    './historyFacts.js?v=mq5trap7',
    './specialNumbers.js?v=mq5trap7',
    './milestoneCalculator.js?v=mq5trap7',
    './combinations.js?v=mq5trap7',
    './shareMessages.js?v=mq5trap7',
    './giftStore.js?v=mq5trap7',
    './dataProtection.js?v=mq5trap7',
    './imageCard.js?v=mq5trap7',
    './checkout.js?v=mq5trap7',
    './analytics.js?v=mq5trap7',
    './auth.js?v=mq5trap7',
    './app.js?v=mq5trap7',
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