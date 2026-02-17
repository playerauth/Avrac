// sw.js - No caching, only install prompt support

// Trigger skipWaiting so new SW takes control immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
  console.log('Service Worker installed');
});

// Claim clients immediately after activation
self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
  console.log('Service Worker activated');
});

// No fetch handling, so all requests go directly to the network
