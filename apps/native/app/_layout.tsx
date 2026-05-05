import 'react-native-gesture-handler';
import '../global.css';
import '../lib/notifications/notifee-chat-events';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  HeroUINativeProvider,
  type HeroUINativeConfig,
} from 'heroui-native/provider';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeChatRealtimeProvider } from '~/providers/chat-realtime-provider';
import { NativePresenceProvider } from '~/providers/presence-provider';
import { NativeQueryProvider } from '~/providers/query-provider';
import { NativeSharedProvider } from '~/providers/shared-provider';
import { NativeSocketProvider } from '~/providers/socket-provider';

import { AppThemeProvider } from '~/providers/theme-provider';
import { NotificationProvider } from '~/providers/notification-provider';
import { ensureBackgroundNotificationTaskRegistered } from '~/lib/notifications/background-notification-task';
import { ensureChatThreadNotificationInfrastructure } from '~/lib/notifications/chat-thread-notifications';
import * as Notifications from 'expo-notifications';
import { ModalProvider } from '~/components/providers/modal-provider';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AssistantOverlay } from '~/components/chatbot/assistant-overlay';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

const heroUIConfig: HeroUINativeConfig = {
  toast: {
    defaultProps: {
      placement: 'top',
      isSwipeable: true,
    },
    insets: {
      left: 16,
      right: 16,
    },
    maxVisibleToasts: 3,
  },
};
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });



  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    void ensureBackgroundNotificationTaskRegistered().catch(
      (registrationError) => {
        console.warn(
          '[notifications] Failed to register background notification task:',
          registrationError,
        );
      },
    );
  }, []);

  useEffect(() => {
    void ensureChatThreadNotificationInfrastructure().catch(
      (infrastructureError) => {
        console.warn(
          '[notifications] Failed to initialize chat thread notification infrastructure:',
          infrastructureError,
        );
      },
    );
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <SafeAreaProvider>
          <NativeQueryProvider>
            <NativeSharedProvider>
              <NotificationProvider>
                <NativeSocketProvider>
                  <NativeChatRealtimeProvider>
                    <NativePresenceProvider>
                      <HeroUINativeProvider config={heroUIConfig}>
                        <AppThemeProvider>
                          <BottomSheetModalProvider>
                            <Stack screenOptions={{ headerShown: false }}>
                              <Stack.Screen name="index" />
                              <Stack.Screen name="(onboarding)" />
                              <Stack.Screen name="(auth)" />
                              <Stack.Screen name="(main)" />
                              <Stack.Screen name="chat" />
                              <Stack.Screen name="(stack)" />
                            </Stack>
                            <ModalProvider />
                            <AssistantOverlay />
                          </BottomSheetModalProvider>
                        </AppThemeProvider>
                      </HeroUINativeProvider>
                    </NativePresenceProvider>
                  </NativeChatRealtimeProvider>
                </NativeSocketProvider>
              </NotificationProvider>
            </NativeSharedProvider>
          </NativeQueryProvider>
        </SafeAreaProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
