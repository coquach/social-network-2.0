import { useGroupMembers, useRemoveMember } from '@repo/shared/hooks';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

import { PrimaryButton } from '~/components/ui/app-button';
import { AppCard } from '~/components/ui/app-card';
import { AppSubtitle, AppTitle } from '~/components/ui/app-text';

export default function GroupMembersScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useGroupMembers(groupId ?? '', { limit: 20 });

  const members = React.useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.data ?? []),
    [data?.pages],
  );

  const handleRemove = React.useCallback(
    (memberId: string) => {
      Alert.alert('Xoa thanh vien', 'Ban co chac muon xoa thanh vien nay khoi nhom?', [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Xoa',
          style: 'destructive',
          onPress: () => removeMember({ groupId: groupId ?? '', memberId }),
        },
      ]);
    },
    [groupId, removeMember],
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
          {error instanceof Error ? error.message : 'Khong the tai danh sach thanh vien.'}
        </AppSubtitle>
        <PrimaryButton label="Thu lai" onPress={() => void refetch()} className="mt-4 px-6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bg px-4 pt-4 dark:bg-app-bg-dark">
      <AppTitle className="mb-1 text-2xl">Thanh vien</AppTitle>
      <AppSubtitle className="mb-4 text-sm">Quan ly danh sach thanh vien trong nhom.</AppSubtitle>

      <FlashList
        data={members}
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
            <AppSubtitle className="text-sm">Chua co thanh vien nao.</AppSubtitle>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-2">
            <AppCard className="flex-row items-center justify-between rounded-2xl p-4">
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">{item.userName}</Text>
                <AppSubtitle className="mt-1 text-xs">Vai tro: {item.role} • Trang thai: {item.status}</AppSubtitle>
              </View>
              <TouchableOpacity
                disabled={isRemoving}
                onPress={() => handleRemove(item.userId)}
                className="rounded-xl bg-rose-100 px-3 py-2"
              >
                <Text className="text-xs font-semibold text-rose-600">Xoa</Text>
              </TouchableOpacity>
            </AppCard>
          </View>
        )}
      />
    </View>
  );
}
