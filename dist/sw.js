// HappyMoments Service Worker — vmq5rl9d6
const CACHE_NAME = 'happymoments-vmq5rl9d6';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq5rl9d6',
    './notifications.js?v=mq5rl9d6',
    './i18n.js?v=mq5rl9d6',
    './historyFacts.js?v=mq5rl9d6',
    './specialNumbers.js?v=mq5rl9d6',
    './milestoneCalculator.js?v=mq5rl9d6',
    './combinations.js?v=mq5rl9d6',
    './shareMessages.js?v=mq5rl9d6',
    './giftStore.js?v=mq5rl9d6',
    './dataProtection.js?v=mq5rl9d6',
    './imageCard.js?v=mq5rl9d6',
    './checkout.js?v=mq5rl9d6',
    './analytics.js?v=mq5rl9d6',
    './auth.js?v=mq5rl9d6',
    './app.js?v=mq5rl9d6',
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