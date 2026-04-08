import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

export const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';
export const LAST_BACKGROUND_NOTIFICATION_KEY =
  '@sentimeta:last-background-notification';

const isNativePlatform = Platform.OS === 'android' || Platform.OS === 'ios';

if (isNativePlatform && !TaskManager.isTaskDefined(BACKGROUND_NOTIFICATION_TASK)) {
  TaskManager.defineTask<Notifications.NotificationTaskPayload>(
    BACKGROUND_NOTIFICATION_TASK,
    async ({ data, error, executionInfo }) => {
      if (error) {
        console.warn('[notifications] Background task error:', error);
        return;
      }

      try {
        await AsyncStorage.setItem(
          LAST_BACKGROUND_NOTIFICATION_KEY,
          JSON.stringify({
            receivedAt: new Date().toISOString(),
            data,
            executionInfo,
          }),
        );
      } catch (storageError) {
        console.warn(
          '[notifications] Failed to persist background notification payload:',
          storageError,
        );
      }
    },
  );
}

export async function ensureBackgroundNotificationTaskRegistered() {
  if (!isNativePlatform) {
    return false;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_NOTIFICATION_TASK,
  );

  if (!isRegistered) {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  }

  return true;
}

export async function getLastBackgroundNotificationPayload() {
  const rawValue = await AsyncStorage.getItem(LAST_BACKGROUND_NOTIFICATION_KEY);
  return rawValue ? JSON.parse(rawValue) : null;
}

export async function clearLastBackgroundNotificationPayload() {
  await AsyncStorage.removeItem(LAST_BACKGROUND_NOTIFICATION_KEY);
}
