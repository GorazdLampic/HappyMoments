// HappyMoments Service Worker — vmq6d99mc
const CACHE_NAME = 'happymoments-vmq6d99mc';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq6d99mc',
    './notifications.js?v=mq6d99mc',
    './i18n.js?v=mq6d99mc',
    './historyFacts.js?v=mq6d99mc',
    './specialNumbers.js?v=mq6d99mc',
    './milestoneCalculator.js?v=mq6d99mc',
    './combinations.js?v=mq6d99mc',
    './shareMessages.js?v=mq6d99mc',
    './giftStore.js?v=mq6d99mc',
    './dataProtection.js?v=mq6d99mc',
    './imageCard.js?v=mq6d99mc',
    './checkout.js?v=mq6d99mc',
    './analytics.js?v=mq6d99mc',
    './auth.js?v=mq6d99mc',
    './app.js?v=mq6d99mc',
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