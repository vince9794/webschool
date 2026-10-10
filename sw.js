/* ============================================================
   THE GREENHILL SCHOOL — Service Worker (sw.js)
   Handles Web Push messages from the admin platform and
   opens the relevant page when a notification is clicked.
   ============================================================ */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'The Greenhill School', body: '', link: '/' };
  try {
    if (event.data) data = Object.assign(data, event.data.json());
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'The Greenhill School', {
      body: data.body || '',
      icon: '/images/img-hero.webp',
      badge: '/images/img-hero.webp',
      data: { link: data.link || '/' },
      tag: 'greenhill-message',
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      return clients.openWindow(link);
    })
  );
});
