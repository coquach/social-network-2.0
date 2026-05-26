import React from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cn } from '~/lib/cn';

type Tab = 'users' | 'posts' | 'groups';

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const TABS: Array<{
  id: Tab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    id: 'users',
    label: 'Người dùng',
    icon: 'people-outline',
  },
  {
    id: 'posts',
    label: 'Bài viết',
    icon: 'document-text-outline',
  },
  {
    id: 'groups',
    label: 'Nhóm',
    icon: 'albums-outline',
  },
];

export function SearchTabs({ activeTab, onTabChange }: Props) {
  return (
    <View className="px-4 pb-3 pt-1">
      <View className="flex-row rounded-2xl bg-app-muted/10 p-1 dark:bg-app-muted/10">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                Keyboard.dismiss();
                onTabChange(tab.id);
              }}
              className={cn(
                'flex-1 flex-row items-center justify-center gap-1.5 rounded-xl px-3 py-2.5',
                isActive && 'bg-app-surface shadow-sm dark:bg-app-surface-dark',
              )}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={
                  isActive
                    ? 'rgb(var(--color-app-primary))'
                    : 'rgb(var(--color-app-muted-fg))'
                }
              />

              <Text
                className={cn(
                  'text-[13px] font-semibold',
                  isActive
                    ? 'text-app-primary dark:text-app-primary-dark'
                    : 'text-app-muted-fg dark:text-app-muted-fg-dark',
                )}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export type { Tab };

export default React.memo(SearchTabs);
