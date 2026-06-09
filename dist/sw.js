// HappyMoments Service Worker — vmq6d1blw
const CACHE_NAME = 'happymoments-vmq6d1blw';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq6d1blw',
    './notifications.js?v=mq6d1blw',
    './i18n.js?v=mq6d1blw',
    './historyFacts.js?v=mq6d1blw',
    './specialNumbers.js?v=mq6d1blw',
    './milestoneCalculator.js?v=mq6d1blw',
    './combinations.js?v=mq6d1blw',
    './shareMessages.js?v=mq6d1blw',
    './giftStore.js?v=mq6d1blw',
    './dataProtection.js?v=mq6d1blw',
    './imageCard.js?v=mq6d1blw',
    './checkout.js?v=mq6d1blw',
    './analytics.js?v=mq6d1blw',
    './auth.js?v=mq6d1blw',
    './app.js?v=mq6d1blw',
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