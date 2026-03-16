import { useAuth } from '@clerk/expo';
import { Redirect, Tabs } from 'expo-router';

import { FloatingTabBar } from '~/components/navigation/floating-tab-bar';
import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { resolvedTheme } = useAppTheme();
  const colors = appThemeColors[resolvedTheme];

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          color: colors.foreground,
          fontWeight: '800',
          fontSize: 20,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen
        name="newfeeds"
        options={{
          title: 'Bảng tin',
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Nhóm',
        }}
      />
      <Tabs.Screen
        name="sentiment"
        options={{
          title: 'Cảm xúc',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
        }}
      />
    </Tabs>
  );
}
