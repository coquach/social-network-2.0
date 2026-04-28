import { useApproveJoinRequest, useGroupJoinRequests, useRejectJoinRequest } from '@repo/shared/hooks';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { PrimaryButton } from '~/components/ui/app-button';
import { AppCard } from '~/components/ui/app-card';
import { AppSubtitle, AppTitle } from '~/components/ui/app-text';

export default function GroupRequestsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { mutate: approve, isPending: isApproving } = useApproveJoinRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectJoinRequest();

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
  } = useGroupJoinRequests(groupId ?? '', { limit: 20 });

  const requests = React.useMemo(
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
          {error instanceof Error ? error.message : 'Khong the tai yeu cau tham gia.'}
        </AppSubtitle>
        <PrimaryButton label="Thu lai" onPress={() => void refetch()} className="mt-4 px-6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bg px-4 pt-4 dark:bg-app-bg-dark">
      <AppTitle className="mb-1 text-2xl">Yeu cau tham gia</AppTitle>
      <AppSubtitle className="mb-4 text-sm">Duyet hoac tu choi cac yeu cau dang cho.</AppSubtitle>

      <FlashList
        data={requests}
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
            <AppSubtitle className="text-sm">Khong co yeu cau cho duyet.</AppSubtitle>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-2">
            <AppCard className="rounded-2xl p-4">
              <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">Yeu cau #{item.id.slice(0, 8)}</Text>
              <AppSubtitle className="mt-1 text-xs">Nguoi dung: {item.inviteeId}</AppSubtitle>

              <View className="mt-3 flex-row gap-2">
                <TouchableOpacity
                  disabled={isApproving || isRejecting}
                  onPress={() => approve({ groupId: groupId ?? '', requestId: item.id })}
                  className="flex-1 items-center rounded-xl bg-emerald-600 py-2.5"
                >
                  <Text className="font-semibold text-white">Duyet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={isApproving || isRejecting}
                  onPress={() => reject({ groupId: groupId ?? '', requestId: item.id })}
                  className="flex-1 items-center rounded-xl bg-slate-200 py-2.5 dark:bg-slate-700"
                >
                  <Text className="font-semibold text-slate-700 dark:text-slate-100">Tu choi</Text>
                </TouchableOpacity>
              </View>
            </AppCard>
          </View>
        )}
      />
    </View>
  );
}
