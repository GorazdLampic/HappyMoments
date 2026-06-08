/**
 * HappyMoments Service Worker
 * Enables offline functionality and app-like experience
 */

const CACHE_NAME = 'happymoments-v46';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './specialNumbers.js',
  './milestoneCalculator.js',
  './combinations.js',
  './shareMessages.js',
  './giftStore.js',
  './dataProtection.js',
  './imageCard.js',
  './checkout.js',
  './analytics.js',
  './auth.js',
  './notifications.js',
  './i18n.js',
  './legal.html',
  './landing.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install event - cache all resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('HappyMoments: Caching app files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('HappyMoments: Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Never cache API calls or Firebase auth requests
  if (event.request.url.includes('/api/') || event.request.url.includes('googleapis.com') || event.request.url.includes('firebaseapp.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || event.request.method !== 'GET') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
      .catch(() => {
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HappyMoments - Offline</title><style>body{font-family:-apple-system,sans-serif;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}h1{font-size:2rem;margin-bottom:1rem;background:linear-gradient(135deg,#c084fc,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}p{color:#8e8e93;font-size:1.1rem}</style></head><body><div><h1>HappyMoments</h1><p>You appear to be offline.<br>Please check your connection and try again.</p></div></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })
  );
});
