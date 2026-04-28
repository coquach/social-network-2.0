import { useGroupLogs } from '@repo/shared/hooks';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { GroupPageHeader } from '~/components/groups/group-page-header';
import { PrimaryButton } from '~/components/ui/app-button';
import { AppCard } from '~/components/ui/app-card';
import { AppSubtitle, AppTitle } from '~/components/ui/app-text';

export default function GroupLogsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGroupLogs(groupId ?? '', { limit: 20 });

  const logs = React.useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.data ?? []),
    [data?.pages],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg dark:bg-app-bg-dark">
        <ActivityIndicator size="small" color="#0ea5e9" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg px-6 dark:bg-app-bg-dark">
        <AppSubtitle className="text-center text-red-500">
          {error instanceof Error ? error.message : 'Không thể tải lịch sử hoạt động.'}
        </AppSubtitle>
        <PrimaryButton label="Thử lại" onPress={() => void refetch()} className="mt-4 px-6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
      <GroupPageHeader title="Nhật ký hoạt động" />
      <View className="flex-1 px-4 pt-2">
        <AppTitle className="mb-1 text-2xl">Nhật ký hoạt động</AppTitle>
        <AppSubtitle className="mb-4 text-sm">Theo dõi các thay đổi trong nhóm.</AppSubtitle>

        <FlashList
          data={logs}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          onEndReached={() => {
            if (!hasNextPage || isFetchingNextPage) return;
            void fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View className="items-center py-16">
              <AppSubtitle className="text-sm">Chưa có hoạt động nào.</AppSubtitle>
            </View>
          }
          renderItem={({ item }) => (
            <View className="mb-2">
              <AppCard className="rounded-2xl p-4">
                <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">{item.eventType}</Text>
                <AppSubtitle className="mt-1 text-sm">{item.content}</AppSubtitle>
                <Text className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
              </AppCard>
            </View>
          )}
        />
      </View>
    </View>
  );
}
