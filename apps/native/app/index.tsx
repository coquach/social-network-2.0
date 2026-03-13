import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

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
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" color="#0284c7" />
        <Text className="mt-3 text-sm text-slate-500">Đang tải...</Text>
      </View>
    );
  }

  if (!seenOnboarding) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
