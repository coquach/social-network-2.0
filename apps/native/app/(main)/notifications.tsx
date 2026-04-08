import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { AppCard } from '~/components/ui/app-card';
import { AppScreen } from '~/components/ui/app-screen';
import { AppSubtitle, AppTitle } from '~/components/ui/app-text';

export default function NotificationsScreen() {
  return (
    <>
      <Tabs.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
        }}
      />
      <AppScreen className="justify-center">
        <AppCard className="gap-4">
          <View className="flex-row items-center justify-between">
            <AppTitle>Notifications</AppTitle>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh notifications"
              className="h-10 w-10 items-center justify-center rounded-full bg-app-primary/10"
            >
              <Ionicons name="notifications-outline" size={20} />
            </Pressable>
          </View>
          <AppSubtitle>
            Temporary destination for regular push notifications. Non-chat notifications open this screen for now.
          </AppSubtitle>
        </AppCard>
      </AppScreen>
    </>
  );
}
