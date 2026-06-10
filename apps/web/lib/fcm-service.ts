/**
 * Firebase Cloud Messaging Service
 * Handles FCM token registration and message handling
 */

import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from './firebase-config';
import { notificationService } from '@repo/shared';
import { toast } from 'sonner';

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Register Service Worker for FCM
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    console.log('✅ FCM Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('❌ FCM Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Get FCM device token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    // Explicitly register SW and pass it to getToken
    const serviceWorkerRegistration = await registerServiceWorker();
    if (!serviceWorkerRegistration) {
      console.warn('Service Worker registration failed, attempting default token retrieval');
    }

    const token = await getToken(messaging, { 
      vapidKey,
      serviceWorkerRegistration: serviceWorkerRegistration || undefined
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Register FCM token with backend
 */
export const registerFCMToken = async (): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return false;

    const token = await getFCMToken();
    if (!token) return false;

    // Get or generate device info
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = generateDeviceId();
      localStorage.setItem('deviceId', deviceId);
    }

    const deviceName = getBrowserInfo();

    // Register with backend
    await notificationService.registerDeviceToken({
      token,
      platform: 'web',
      deviceId,
      deviceName,
      provider: 'fcm',
    });

    console.log('✅ FCM token registered successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to register FCM token:', error);
    return false;
  }
};

/**
 * Unregister FCM token from backend
 */
export const unregisterFCMToken = async (): Promise<void> => {
  try {
    const token = await getFCMToken();
    if (token) {
      await notificationService.removeDeviceToken(token);
      console.log('✅ FCM token unregistered successfully');
    }
  } catch (error) {
    console.error('❌ Failed to unregister FCM token:', error);
  }
};

/**
 * Setup foreground message listener
 */
export const setupForegroundMessageListener = (
  callback?: (payload: any) => void,
): (() => void) | void => {
  if (typeof window === 'undefined') return;

  getFirebaseMessaging().then((messaging) => {
    if (!messaging) return;

    return onMessage(messaging, (payload) => {
      console.log('📩 Foreground message received:', payload);

      console.log('📩 Foreground message received:', payload);

      // We delegate the UI rendering to the callback (FCMProvider)
      // so it can use custom React components and Next.js router.

      // Call custom callback for UI updates (e.g., updating notification store)
      if (callback) callback(payload);
    });
  });
};

/**
 * Generate unique device ID
 */
const generateDeviceId = (): string => {
  return `web-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Get browser info for device name
 */
const getBrowserInfo = (): string => {
  if (typeof window === 'undefined') return 'Unknown Browser';

  const ua = window.navigator.userAgent;
  let browser = 'Unknown Browser';

  if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (ua.indexOf('SamsungBrowser') > -1) {
    browser = 'Samsung Browser';
  } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
    browser = 'Opera';
  } else if (ua.indexOf('Trident') > -1) {
    browser = 'Internet Explorer';
  } else if (ua.indexOf('Edge') > -1) {
    browser = 'Edge';
  } else if (ua.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (ua.indexOf('Safari') > -1) {
    browser = 'Safari';
  }

  return `${browser} on ${navigator.platform}`;
};
