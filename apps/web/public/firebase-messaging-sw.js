/**
 * Firebase Cloud Messaging Service Worker
 * Dynamic Configuration Version
 */

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

let messaging;

// Initialize Firebase with dynamic config
const initFirebase = async () => {
  try {
    const response = await fetch('/api/firebase-config');
    if (!response.ok) throw new Error('Failed to fetch firebase config');
    
    const firebaseConfig = await response.json();
    
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Background message received:', payload);

      const notificationTitle = payload.notification?.title || 'Sentimeta';
      const notificationOptions = {
        body: payload.notification?.body || 'Bạn có thông báo mới',
        icon: '/logo.svg',
        badge: '/logo.svg',
        data: payload.data,
        tag: payload.data?.notificationId || 'general-notification',
        requireInteraction: true,
      };

      return self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Initialization error:', error);
  }
};

// Start initialization
initFirebase();

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);

  event.notification.close();

  // URL to navigate to
  const notificationData = event.notification.data;
  const targetUrl = notificationData?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open at our origin, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then((focusedClient) => {
            if (notificationData?.url) {
              return focusedClient.navigate(targetUrl);
            }
            return focusedClient;
          });
        }
      }
      
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Refresh config on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(initFirebase());
});
