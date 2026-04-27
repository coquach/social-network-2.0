import 'react-native-gesture-handler';
import '../global.css';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Slot, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { HeroUINativeProvider, type HeroUINativeConfig } from 'heroui-native/provider';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from '~/providers/theme-provider';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const queryClient = new QueryClient();

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
  const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
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
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <SafeAreaProvider>
            <HeroUINativeProvider config={heroUIConfig}>
              <AppThemeProvider>
                <Slot />
              </AppThemeProvider>
            </HeroUINativeProvider>
          </SafeAreaProvider>
        </ClerkProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
