import { useAuth } from '@clerk/expo';
import { Redirect, withLayoutContext } from 'expo-router';
import React from 'react';

import { FloatingTabBar } from '~/components/navigation/floating-tab-bar';
import { TabBarVisibilityProvider } from '~/components/navigation/tab-bar-visibility-context';
import { appThemeColors } from '~/constants/theme';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useAppTheme } from '~/providers/theme-provider';

const { Navigator } = createMaterialTopTabNavigator();
const SwipeableTabs = withLayoutContext(Navigator);

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { resolvedTheme } = useAppTheme();
  const colors = appThemeColors[resolvedTheme];

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <TabBarVisibilityProvider>
      <SwipeableTabs
        tabBarPosition="bottom"
        screenOptions={{
          swipeEnabled: true,
          animationEnabled: true,
          sceneStyle: { backgroundColor: colors.background },
        }}
        tabBar={(props: any) => <FloatingTabBar {...props} />}
      >
        <SwipeableTabs.Screen name="newfeeds" />
        <SwipeableTabs.Screen name="groups" />
        <SwipeableTabs.Screen name="sentiment" />
        <SwipeableTabs.Screen name="profile" />
      </SwipeableTabs>
    </TabBarVisibilityProvider>
  );
}
