import { useAuth, useClerk, useUser } from '@clerk/expo';
import { Redirect, Tabs } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { resolvedTheme } = useAppTheme();
  const navColors = appThemeColors[resolvedTheme];

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: navColors.primary,
        tabBarInactiveTintColor: navColors.mutedForeground,
        tabBarStyle: {
          backgroundColor: navColors.surface,
          borderTopColor: navColors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerTintColor: navColors.foreground,
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
          color: navColors.foreground,
        },
        headerStyle: {
          backgroundColor: navColors.surface,
        },
      }}
    >
      
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          headerRight: () => (
            <Pressable
              className="mr-4 rounded-lg border border-app-border bg-app-surface-elevated px-3 py-2 active:opacity-80 dark:border-app-border-dark dark:bg-app-surface-elevated-dark"
              onPress={() => void signOut()}
            >
              <Text className="text-xs font-semibold text-app-primary dark:text-app-primary-dark">
                {user ? 'Đăng xuất' : 'Tài khoản'}
              </Text>
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

