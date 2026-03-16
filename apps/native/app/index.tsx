import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { AppCenteredScreen } from '~/components/ui/app-screen';
import { AppSubtitle } from '~/components/ui/app-text';
import { useAppTheme } from '~/providers/theme-provider';
import { hasSeenOnboarding } from '~/utils/storage';

export default function IndexScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { resolvedTheme } = useAppTheme();
  const [onboardingLoaded, setOnboardingLoaded] = React.useState(false);
  const [seenOnboarding, setSeenOnboarding] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const loadOnboardingState = async () => {
      const value = await hasSeenOnboarding();

      if (mounted) {
        setSeenOnboarding(value);
        setOnboardingLoaded(true);
      }
    };

    void loadOnboardingState();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isLoaded || !onboardingLoaded) {
    return (
      <AppCenteredScreen>
        <ActivityIndicator size="small" color={resolvedTheme === 'dark' ? '#22d3ee' : '#0ea5e9'} />
        <AppSubtitle className="mt-3 text-sm text-app-primary dark:text-app-primary-dark">
          Đang tải...
        </AppSubtitle>
      </AppCenteredScreen>
    );
  }

  if (!seenOnboarding) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)/newfeeds" />;
}
