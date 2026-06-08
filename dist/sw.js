// HappyMoments Service Worker — vmq5s1pyy
const CACHE_NAME = 'happymoments-vmq5s1pyy';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5s1pyy',
    './notifications.js?v=mq5s1pyy',
    './i18n.js?v=mq5s1pyy',
    './historyFacts.js?v=mq5s1pyy',
    './specialNumbers.js?v=mq5s1pyy',
    './milestoneCalculator.js?v=mq5s1pyy',
    './combinations.js?v=mq5s1pyy',
    './shareMessages.js?v=mq5s1pyy',
    './giftStore.js?v=mq5s1pyy',
    './dataProtection.js?v=mq5s1pyy',
    './imageCard.js?v=mq5s1pyy',
    './checkout.js?v=mq5s1pyy',
    './analytics.js?v=mq5s1pyy',
    './auth.js?v=mq5s1pyy',
    './app.js?v=mq5s1pyy',
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