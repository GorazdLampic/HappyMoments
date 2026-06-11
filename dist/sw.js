// HappyMoments Service Worker — vmq9gb5z8
const CACHE_NAME = 'happymoments-vmq9gb5z8';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq9gb5z8',
    './notifications.js?v=mq9gb5z8',
    './i18n.js?v=mq9gb5z8',
    './historyFacts.js?v=mq9gb5z8',
    './specialNumbers.js?v=mq9gb5z8',
    './milestoneCalculator.js?v=mq9gb5z8',
    './combinations.js?v=mq9gb5z8',
    './shareMessages.js?v=mq9gb5z8',
    './giftStore.js?v=mq9gb5z8',
    './dataProtection.js?v=mq9gb5z8',
    './imageCard.js?v=mq9gb5z8',
    './checkout.js?v=mq9gb5z8',
    './analytics.js?v=mq9gb5z8',
    './auth.js?v=mq9gb5z8',
    './app.js?v=mq9gb5z8',
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