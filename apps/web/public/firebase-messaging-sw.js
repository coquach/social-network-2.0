/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications
 */

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// Note: These values should match your Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyCuRmN4nLozMjlQ7fDwROYZ5cu-682ILME",
  authDomain: "social-network-81b87.firebaseapp.com",
  projectId: "social-network-81b87",
  storageBucket: "social-network-81b87.firebasestorage.app",
  messagingSenderId: "934156139672",
  appId: "1:934156139672:web:89f2ee7cc75b6817c0a4ed",
  measurementId: "G-6BZKHRNZM3"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/logo.svg',
    badge: '/logo.svg',
    data: payload.data,
    tag: payload.data?.notificationId || 'notification',
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.', event);

  event.notification.close();

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise open new window
      if (clients.openWindow) {
        const notificationData = event.notification.data;
        const url = notificationData?.url || '/';
        return clients.openWindow(url);
      }
    })
  );
});
