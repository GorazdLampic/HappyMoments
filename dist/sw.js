// HappyMoments Service Worker — vmq6fd7jf
const CACHE_NAME = 'happymoments-vmq6fd7jf';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq6fd7jf',
    './notifications.js?v=mq6fd7jf',
    './i18n.js?v=mq6fd7jf',
    './historyFacts.js?v=mq6fd7jf',
    './specialNumbers.js?v=mq6fd7jf',
    './milestoneCalculator.js?v=mq6fd7jf',
    './combinations.js?v=mq6fd7jf',
    './shareMessages.js?v=mq6fd7jf',
    './giftStore.js?v=mq6fd7jf',
    './dataProtection.js?v=mq6fd7jf',
    './imageCard.js?v=mq6fd7jf',
    './checkout.js?v=mq6fd7jf',
    './analytics.js?v=mq6fd7jf',
    './auth.js?v=mq6fd7jf',
    './app.js?v=mq6fd7jf',
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