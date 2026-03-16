import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        gestureEnabled: true,
        presentation: 'card',
      }}
    />
  );
}
