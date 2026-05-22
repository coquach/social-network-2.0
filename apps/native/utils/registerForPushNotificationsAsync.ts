import * as Device from 'expo-device';
import { Platform } from 'react-native';
import {
  getMessaging,
  requestPermission,
  getToken,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

export type NativePushPlatform = 'ios' | 'android';

export type NativePushRegistration = {
  platform: NativePushPlatform;
  isPhysicalDevice: boolean;
  pushToken: string | null;
};

const isNativePlatform = (
  platform: string,
): platform is NativePushPlatform => platform === 'android' || platform === 'ios';

export async function registerForPushNotificationsAsync(): Promise<NativePushRegistration | null> {
  if (!isNativePlatform(Platform.OS)) {
    return null;
  }

  const isPhysicalDevice = Device.isDevice;

  if (!isPhysicalDevice) {
    console.warn(
      '[notifications] Running on an emulator/simulator. Push token retrieval may fail or be unavailable.',
    );
  }

  // Request user permissions for Firebase Cloud Messaging
  const messagingInstance = getMessaging();
  const authStatus = await requestPermission(messagingInstance);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    throw new Error(
      'Permission not granted to get push token for push notification.',
    );
  }

  // Retrieve FCM push token
  let pushToken: string | null = null;
  try {
    pushToken = await getToken(messagingInstance);
  } catch (error) {
    console.warn('[notifications] Failed to get FCM push token:', error);
  }

  if (!pushToken && isPhysicalDevice) {
    throw new Error('Unable to get FCM push token for this device.');
  }

  return {
    platform: Platform.OS,
    isPhysicalDevice,
    pushToken,
  };
}
