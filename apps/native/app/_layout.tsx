import "react-native-gesture-handler";
import "../global.css";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import {
  HeroUINativeProvider,
  type HeroUINativeConfig,
} from "heroui-native/provider";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NativeChatRealtimeProvider } from "~/providers/chat-realtime-provider";
import { NativePresenceProvider } from "~/providers/presence-provider";
import { NativeQueryProvider } from "~/providers/query-provider";
import { NativeSharedProvider } from "~/providers/shared-provider";
import { NativeSocketProvider } from "~/providers/socket-provider";

import { AppThemeProvider } from "~/providers/theme-provider";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

const heroUIConfig: HeroUINativeConfig = {
  toast: {
    defaultProps: {
      placement: "top",
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
  const [loaded, error] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <SafeAreaProvider>
          <NativeQueryProvider>
            <NativeSharedProvider>
              <NativeSocketProvider>
                <NativeChatRealtimeProvider>
                  <NativePresenceProvider>
                    <HeroUINativeProvider config={heroUIConfig}>
                      <AppThemeProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                          <Stack.Screen name="index" />
                          <Stack.Screen name="(onboarding)" />
                          <Stack.Screen name="(auth)" />
                          <Stack.Screen name="(main)" />
                          <Stack.Screen name="chat" />
                        </Stack>
                      </AppThemeProvider>
                    </HeroUINativeProvider>
                  </NativePresenceProvider>
                </NativeChatRealtimeProvider>
              </NativeSocketProvider>
            </NativeSharedProvider>
          </NativeQueryProvider>
        </SafeAreaProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
