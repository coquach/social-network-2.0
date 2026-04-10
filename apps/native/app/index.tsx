import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import React from 'react';
import { AppLoadingOverlay } from '~/components/ui/app-loading';

import { hasSeenOnboarding } from '~/utils/storage';

export default function IndexScreen() {
  const { isLoaded, isSignedIn } = useAuth();
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
    return <AppLoadingOverlay visible={true} label="Đang tải" />;
  }

  if (!seenOnboarding) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(main)/newfeeds" />;
}
