import { Stack } from 'expo-router';

export default function GroupDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="members" />
      <Stack.Screen name="requests" />
      <Stack.Screen name="logs" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
