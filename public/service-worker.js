// public/service-worker.js

// Basic service worker structure
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Perform install steps - caching assets, etc.
   // event.waitUntil(self.skipWaiting()); // Optional: Activate worker immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Clean up old caches, etc.
  // event.waitUntil(self.clients.claim()); // Optional: Take control of pages immediately
});

self.addEventListener('fetch', (event) => {
  // console.log('Service Worker: Fetching', event.request.url);
  // Optional: Intercept network requests for caching or offline support
  // event.respondWith(fetch(event.request)); // Default: Pass through request
});

// Listen for notification clicks (optional)
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked.', event.notification.tag);
  event.notification.close(); // Close the notification

  // Optional: Focus or open a specific app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/'); // Open the app if not already open
    })
  );
});

// Note: PWAs have limitations on running timers or complex logic in the service worker
// when the app/browser is fully closed. Notifications are typically triggered by server push events
// or scheduled via APIs like the Notifications API or potentially the Background Synchronization API,
// but continuous real-time updates *from* the service worker *to* a notification are not standard.
// The approach here is to show a notification *when* a phase ends based on the client-side timer triggering it.
