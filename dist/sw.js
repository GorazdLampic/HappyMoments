// HappyMoments Service Worker — vmq9lvovc
const CACHE_NAME = 'happymoments-vmq9lvovc';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq9lvovc',
    './notifications.js?v=mq9lvovc',
    './i18n.js?v=mq9lvovc',
    './historyFacts.js?v=mq9lvovc',
    './specialNumbers.js?v=mq9lvovc',
    './milestoneCalculator.js?v=mq9lvovc',
    './combinations.js?v=mq9lvovc',
    './shareMessages.js?v=mq9lvovc',
    './giftStore.js?v=mq9lvovc',
    './dataProtection.js?v=mq9lvovc',
    './imageCard.js?v=mq9lvovc',
    './checkout.js?v=mq9lvovc',
    './analytics.js?v=mq9lvovc',
    './auth.js?v=mq9lvovc',
    './app.js?v=mq9lvovc',
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