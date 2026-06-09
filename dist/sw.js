// HappyMoments Service Worker — vmq6fgpar
const CACHE_NAME = 'happymoments-vmq6fgpar';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq6fgpar',
    './notifications.js?v=mq6fgpar',
    './i18n.js?v=mq6fgpar',
    './historyFacts.js?v=mq6fgpar',
    './specialNumbers.js?v=mq6fgpar',
    './milestoneCalculator.js?v=mq6fgpar',
    './combinations.js?v=mq6fgpar',
    './shareMessages.js?v=mq6fgpar',
    './giftStore.js?v=mq6fgpar',
    './dataProtection.js?v=mq6fgpar',
    './imageCard.js?v=mq6fgpar',
    './checkout.js?v=mq6fgpar',
    './analytics.js?v=mq6fgpar',
    './auth.js?v=mq6fgpar',
    './app.js?v=mq6fgpar',
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