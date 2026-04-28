import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type GroupPageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function GroupPageHeader({ title, subtitle = 'Không gian cộng đồng' }: GroupPageHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top + 6 }} className="bg-app-bg px-4 pb-3 dark:bg-app-bg-dark">
      <View className="overflow-hidden rounded-3xl border border-app-border bg-app-surface px-3 py-3 dark:border-app-border-dark dark:bg-app-surface-dark">
        <View className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-500/10" />
        <View className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-cyan-500/10" />

        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-sky-500/15"
          >
            <Ionicons name="arrow-back" size={20} color="#0284c7" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-[22px] font-black tracking-tight text-app-fg dark:text-app-fg-dark">
              {title}
            </Text>
            <Text className="mt-0.5 text-xs font-medium text-app-muted-fg dark:text-app-muted-fg-dark">
              {subtitle}
            </Text>
          </View>

          <View className="rounded-full bg-sky-500/15 px-2.5 py-1">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-sky-600">Groups</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
