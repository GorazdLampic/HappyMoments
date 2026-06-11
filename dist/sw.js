// HappyMoments Service Worker — vmq9h81jk
const CACHE_NAME = 'happymoments-vmq9h81jk';
const ASSETS = [
    './',
    './index.html',
    './styles.css?v=mq9h81jk',
    './notifications.js?v=mq9h81jk',
    './i18n.js?v=mq9h81jk',
    './historyFacts.js?v=mq9h81jk',
    './specialNumbers.js?v=mq9h81jk',
    './milestoneCalculator.js?v=mq9h81jk',
    './combinations.js?v=mq9h81jk',
    './shareMessages.js?v=mq9h81jk',
    './giftStore.js?v=mq9h81jk',
    './dataProtection.js?v=mq9h81jk',
    './imageCard.js?v=mq9h81jk',
    './checkout.js?v=mq9h81jk',
    './analytics.js?v=mq9h81jk',
    './auth.js?v=mq9h81jk',
    './app.js?v=mq9h81jk',
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