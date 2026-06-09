// HappyMoments Service Worker — vmq6ff2jw
const CACHE_NAME = 'happymoments-vmq6ff2jw';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq6ff2jw',
    './notifications.js?v=mq6ff2jw',
    './i18n.js?v=mq6ff2jw',
    './historyFacts.js?v=mq6ff2jw',
    './specialNumbers.js?v=mq6ff2jw',
    './milestoneCalculator.js?v=mq6ff2jw',
    './combinations.js?v=mq6ff2jw',
    './shareMessages.js?v=mq6ff2jw',
    './giftStore.js?v=mq6ff2jw',
    './dataProtection.js?v=mq6ff2jw',
    './imageCard.js?v=mq6ff2jw',
    './checkout.js?v=mq6ff2jw',
    './analytics.js?v=mq6ff2jw',
    './auth.js?v=mq6ff2jw',
    './app.js?v=mq6ff2jw',
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