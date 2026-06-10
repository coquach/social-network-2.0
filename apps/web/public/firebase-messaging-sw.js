/**
 * Firebase Cloud Messaging Service Worker
 * Dynamic Configuration Version
 */

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

let messaging;

// Re-implementation of getNotificationRoute for the Service Worker context
const getWebNotificationRoute = (data) => {
  if (!data) return '/notifications';
  const type = data.type || '';
  if (!type) return '/notifications';

  const conversationId = data.conversationId;
  const targetId = data.targetId;
  const actorId = data.actorId;

  if (type === 'call') return '/chat/call';
  if (type === 'message' || (!targetId && conversationId)) {
    return conversationId ? `/chat/${conversationId}` : '/notifications';
  }

  switch (type) {
    case 'friendship_request': return '/friends/requests';
    case 'friendship_accept':
    case 'friend': return '/friends';
    case 'follow': return actorId || targetId ? `/profile/${actorId || targetId}` : '/notifications';
    case 'comment':
    case 'reply_comment':
    case 'reaction':
    case 'share': return targetId ? `/posts/${targetId}` : '/notifications';
    case 'group_noti':
    case 'join_request_approved': return targetId ? `/groups/${targetId}` : '/groups';
    case 'group_invite': return '/groups/invites';
    default: return '/notifications';
  }
};

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
        sound: '/sounds/notification.mp3', // Note: Only some browsers/OS respect this property
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
  const targetUrl = getWebNotificationRoute(notificationData);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open at our origin, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then((focusedClient) => {
            if (targetUrl) {
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
