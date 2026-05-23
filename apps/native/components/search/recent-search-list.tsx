import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { removeItem, getItem } from '~/utils/storage';

const RECENT_KEY = 'recent_searches_v1';

type Props = {
  onSelectRecent?: (query: string) => void;
};

export function RecentSearchList({ onSelectRecent }: Props) {
  const [items, setItems] = React.useState<string[]>([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const raw = await getItem(RECENT_KEY);
      if (!mounted) return;
      if (!raw) return setItems([]);
      try {
        const parsed = JSON.parse(raw) as string[];
        setItems(parsed);
      } catch {
        setItems([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const clearAll = React.useCallback(async () => {
    setItems([]);
    await removeItem(RECENT_KEY);
  }, []);

  if (!items.length) return null;

  return (
    <View className="mb-4 py-6">
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-sm font-semibold text-app-muted-fg dark:text-app-muted-fg-dark">
          Tìm kiếm gần đây
        </Text>
        <Pressable
          onPress={clearAll}
          className="rounded-full px-2 py-1 active:opacity-60"
        >
          <Text className="text-xs font-medium text-app-muted-fg dark:text-app-muted-fg-dark">
            Xóa tất cả
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3 px-5"
        contentContainerStyle={{ gap: 8 }}
      >
        {items.map((it) => (
          <Pressable
            key={it}
            onPress={() => onSelectRecent?.(it)}
            className="flex-row items-center gap-2 rounded-full border border-app-border bg-app-surface px-3 py-2 dark:border-app-border-dark dark:bg-app-surface-dark active:opacity-70"
          >
            <Ionicons name="time-outline" size={14} color="#64748b" />
            <Text className="text-sm text-app-fg dark:text-app-fg-dark">
              {it}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export default React.memo(RecentSearchList);
