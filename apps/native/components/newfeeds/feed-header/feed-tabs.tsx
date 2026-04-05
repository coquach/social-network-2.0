import React from 'react';
import { Pressable, View } from 'react-native';

import { AppSubtitle } from '~/components/ui/app-text';

import type { FeedTab } from './types';

type FeedTabsProps = {
  tab: FeedTab;
  onChange: (tab: FeedTab) => void;
};

function FeedTabsBase({ tab, onChange }: FeedTabsProps) {
  return (
    <View className="w-full rounded-full border border-app-border bg-app-surface-elevated p-1 dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
      <View className="flex-row gap-1">
        <Pressable
          onPress={() => onChange('trending')}
          className={`flex-1 items-center rounded-full px-3 py-2.5 ${
            tab === 'trending'
              ? 'border border-app-primary bg-app-primary shadow-sm'
              : 'bg-app-surface/70 dark:bg-app-surface-dark/70'
          }`}
        >
          <AppSubtitle
            className={`text-sm font-semibold ${
              tab === 'trending' ? 'text-white' : 'text-app-muted-fg/80'
            }`}
          >
            Trending
          </AppSubtitle>
        </Pressable>

        <Pressable
          onPress={() => onChange('personal')}
          className={`flex-1 items-center rounded-full px-3 py-2.5 ${
            tab === 'personal'
              ? 'border border-app-primary bg-app-primary shadow-sm'
              : 'bg-app-surface/70 dark:bg-app-surface-dark/70'
          }`}
        >
          <AppSubtitle
            className={`text-sm font-semibold ${
              tab === 'personal' ? 'text-white' : 'text-app-muted-fg/80'
            }`}
          >
            Personal
          </AppSubtitle>
        </Pressable>
      </View>
    </View>
  );
}

export const FeedTabs = React.memo(FeedTabsBase);
