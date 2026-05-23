import React, { useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import type { GroupSummaryDTO } from '@repo/shared';

type Props = {
  group: GroupSummaryDTO;
  onPress?: (g: GroupSummaryDTO) => void;
};

function SearchGroupItemComponent({ group, onPress }: Props) {
  const router = useRouter();

  const handlePress = React.useCallback(() => {
    onPress?.(group);
    router.push(`/(main)/groups/${group.id}`);
  }, [onPress, router, group]);

  const privacy = useMemo(() => {
    switch (group.privacy) {
      case 'PUBLIC':
        return {
          label: 'Công khai',
          icon: 'earth-outline' as const,
        };

      case 'PRIVATE':
        return {
          label: 'Riêng tư',
          icon: 'lock-closed-outline' as const,
        };

      default:
        return {
          label: 'Nhóm',
          icon: 'people-outline' as const,
        };
    }
  }, [group.privacy]);

  return (
    <Pressable onPress={handlePress} className="active:opacity-80">
      <View className="overflow-hidden rounded-[22px] border border-app-border/40 bg-app-surface/90 px-4 py-4 dark:border-app-border-dark/40 dark:bg-app-surface-dark/90">
        <View className="flex-row items-start gap-3">
          {/* Avatar */}
          <View className="h-14 w-14 overflow-hidden rounded-2xl bg-app-border dark:bg-app-border-dark">
            {group.avatarUrl ? (
              <Image
                source={{ uri: group.avatarUrl }}
                className="h-full w-full"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-lg font-bold text-app-muted-fg dark:text-app-muted-fg-dark">
                  {group.name?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View className="min-w-0 flex-1">
            {/* Name */}
            <Text
              className="text-[16px] font-semibold text-app-fg dark:text-app-fg-dark"
              numberOfLines={1}
            >
              {group.name}
            </Text>

            {/* Meta */}
            <View className="mt-1 flex-row flex-wrap items-center gap-2">
              {/* Privacy */}
              <View className="flex-row items-center gap-1 rounded-full bg-app-accent/10 px-2.5 py-1 dark:bg-app-accent/15">
                <Ionicons
                  name={privacy.icon}
                  size={12}
                  color="rgb(var(--color-app-accent))"
                />

                <Text className="text-[11px] font-medium text-app-accent">
                  {privacy.label}
                </Text>
              </View>

              {/* Members */}
              <View className="flex-row items-center gap-1 rounded-full bg-app-muted/10 px-2.5 py-1 dark:bg-app-muted/10">
                <Ionicons
                  name="people-outline"
                  size={12}
                  color="rgb(var(--color-app-muted-fg))"
                />

                <Text className="text-[11px] font-medium text-app-muted-fg dark:text-app-muted-fg-dark">
                  {group.members} thành viên
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text
              className="mt-2 text-sm leading-5 text-app-muted-fg dark:text-app-muted-fg-dark"
              numberOfLines={2}
            >
              {group.description?.trim() || 'Chưa có mô tả cho nhóm này'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export const SearchGroupItem = React.memo(SearchGroupItemComponent);
