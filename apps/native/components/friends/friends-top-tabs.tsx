import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { cn } from '~/lib/cn';

export type FriendsTabKey = 'friends' | 'requests' | 'suggestions' | 'blocked';

export const FRIENDS_TABS: Array<{
  key: FriendsTabKey;
  label: string;
}> = [
  { key: 'friends', label: 'Danh sách bạn bè' },
  { key: 'requests', label: 'Lời mời kết bạn' },
  { key: 'suggestions', label: 'Gợi ý kết bạn' },
  { key: 'blocked', label: 'Danh sách chặn' },
];

type FriendsTopTabsProps = {
  activeTab: FriendsTabKey;
  onTabChange: (tab: FriendsTabKey) => void;
};

export function FriendsTopTabs({
  activeTab,
  onTabChange,
}: FriendsTopTabsProps) {
  return (
    <View className="border-b border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-bg-dark">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {FRIENDS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              className={cn(
                'h-[54px] min-w-[145px] items-center justify-center border-b-2 px-3',
                isActive ? 'border-app-primary' : 'border-transparent',
              )}
            >
              <Text
                numberOfLines={1}
                className={cn(
                  'text-center text-[16px] font-bold',
                  isActive
                    ? 'text-app-primary dark:text-app-primary-dark'
                    : 'text-app-fg dark:text-app-fg-dark',
                )}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
