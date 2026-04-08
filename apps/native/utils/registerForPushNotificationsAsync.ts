import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type NativePushPlatform = 'ios' | 'android';

export type NativePushRegistration = {
  platform: NativePushPlatform;
  isPhysicalDevice: boolean;
  permissionStatus: Notifications.PermissionStatus;
  pushToken: string | null;
  expoPushToken: string | null;
};

const isNativePlatform = (
  platform: string,
): platform is NativePushPlatform => platform === 'android' || platform === 'ios';

const getExpoProjectId = () =>
  Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

const configureExpoNotificationChannels = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('general', {
    name: 'General',
    description: 'General app notifications',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'general.wav',
    vibrationPattern: [180, 120, 180, 120],
    lightColor: '#0EA5E9',
    showBadge: true,
  });
};

const ensurePermissions = async () => {
  const existingPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermissions.status;

  if (finalStatus !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  return finalStatus;
};

const getExpoPushToken = async () => {
  const projectId = getExpoProjectId();

  if (!projectId) {
    console.warn(
      '[notifications] Expo projectId not found, skipping Expo push token registration.',
    );
    return null;
  }

  try {
    const response = await Notifications.getExpoPushTokenAsync({ projectId });
    return response.data ?? null;
  } catch (error) {
    console.warn('[notifications] Failed to get Expo push token:', error);
    return null;
  }
};

const getDevicePushToken = async () => {
  try {
    const response = await Notifications.getDevicePushTokenAsync();
    return response.data ?? null;
  } catch (error) {
    console.warn('[notifications] Failed to get device push token:', error);
    return null;
  }
};

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

  await configureExpoNotificationChannels();

  const permissionStatus = await ensurePermissions();

  if (permissionStatus !== 'granted') {
    throw new Error(
      'Permission not granted to get push token for push notification.',
    );
  }

  const [expoPushToken, pushToken] = await Promise.all([
    getExpoPushToken(),
    getDevicePushToken(),
  ]);

  if (!expoPushToken && !pushToken && isPhysicalDevice) {
    throw new Error('Unable to get any push token for this device.');
  }

  return {
    platform: Platform.OS,
    isPhysicalDevice,
    permissionStatus,
    pushToken,
    expoPushToken,
  };
}
