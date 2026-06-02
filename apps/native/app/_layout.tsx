import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import 'expo-keep-awake';
import { SplashScreen, Stack } from 'expo-router';
import {
  HeroUINativeProvider,
  type HeroUINativeConfig,
} from 'heroui-native/provider';
import { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeChatRealtimeProvider } from '~/providers/chat-realtime-provider';
import { NativePresenceProvider } from '~/providers/presence-provider';
import { NativeQueryProvider } from '~/providers/query-provider';
import { NativeSharedProvider } from '~/providers/shared-provider';
import { NativeSocketProvider } from '~/providers/socket-provider';
import '../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { CallManager } from '~/components/chat/call-manager';
import { CallMiniOverlay } from '~/components/chat/call-mini-overlay';
import { AssistantOverlay } from '~/components/chatbot/assistant-overlay';
import { ModalProvider } from '~/components/providers/modal-provider';
import { ensureChatThreadNotificationInfrastructure } from '~/lib/notifications/chat-thread-notifications';
import { CallProvider } from '~/providers/call-provider';
import { CallRealtimeProvider } from '~/providers/call-realtime-provider';
import { NotificationProvider } from '~/providers/notification-provider';
import { AppThemeProvider } from '~/providers/theme-provider';

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
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log('🔥 RootLayout rendering');
  const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  console.log('🔥 Fonts loaded:', loaded, 'error:', error);
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

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
  console.log('🔥 About to render providers');
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        publishableKey={publishableKey}
        tokenCache={tokenCache}
      >
        <SafeAreaProvider>
          <NativeQueryProvider>
            <HeroUINativeProvider config={heroUIConfig}>
              <NativeSharedProvider>
                <NotificationProvider>
                  <NativeSocketProvider>
                    <NativeChatRealtimeProvider>
                      <CallProvider>
                        <CallRealtimeProvider>
                          <NativePresenceProvider>
                            <AppThemeProvider>
                              <KeyboardProvider>
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
                                  <CallManager />
                                  <CallMiniOverlay />
                                </BottomSheetModalProvider>
                              </KeyboardProvider>
                            </AppThemeProvider>
                          </NativePresenceProvider>
                        </CallRealtimeProvider>
                      </CallProvider>
                    </NativeChatRealtimeProvider>
                  </NativeSocketProvider>
                </NotificationProvider>
              </NativeSharedProvider>
            </HeroUINativeProvider>
          </NativeQueryProvider>
        </SafeAreaProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
