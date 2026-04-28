import { useGroupMembers, useRemoveMember } from '@repo/shared/hooks';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { GroupPageHeader } from '~/components/groups/group-page-header';
import { PrimaryButton } from '~/components/ui/app-button';
import { AppCard } from '~/components/ui/app-card';
import { AppModal } from '~/components/ui/app-modal';
import { AppSubtitle, AppTitle } from '~/components/ui/app-text';

export default function GroupMembersScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();
  const [pendingRemoveMemberId, setPendingRemoveMemberId] = React.useState<string | null>(null);

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
          {error instanceof Error ? error.message : 'Không thể tải danh sách thành viên.'}
        </AppSubtitle>
        <PrimaryButton label="Thử lại" onPress={() => void refetch()} className="mt-4 px-6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
      <GroupPageHeader title="Thành viên" />
      <View className="flex-1 px-4 pt-2">
        <AppTitle className="mb-1 text-2xl">Thành viên</AppTitle>
        <AppSubtitle className="mb-4 text-sm">Quản lý danh sách thành viên trong nhóm.</AppSubtitle>

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
              <AppSubtitle className="text-sm">Chưa có thành viên nào.</AppSubtitle>
            </View>
          }
          renderItem={({ item }) => (
            <View className="mb-2">
              <AppCard className="flex-row items-center justify-between rounded-2xl p-4">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">{item.userName}</Text>
                  <AppSubtitle className="mt-1 text-xs">Vai trò: {item.role} • Trạng thái: {item.status}</AppSubtitle>
                </View>
                <TouchableOpacity
                  disabled={isRemoving}
                  onPress={() => setPendingRemoveMemberId(item.userId)}
                  className="rounded-xl bg-rose-100 px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-rose-600">Xóa</Text>
                </TouchableOpacity>
              </AppCard>
            </View>
          )}
        />
      </View>

      <AppModal
        visible={Boolean(pendingRemoveMemberId)}
        onClose={() => setPendingRemoveMemberId(null)}
        variant="danger"
        title="Xóa thành viên"
        description="Bạn có chắc muốn xóa thành viên này khỏi nhóm?"
        footer={
          <>
            <TouchableOpacity
              onPress={() => setPendingRemoveMemberId(null)}
              className="h-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              <Text className="font-semibold text-slate-700 dark:text-slate-300">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (!pendingRemoveMemberId) return;
                removeMember({ groupId: groupId ?? '', memberId: pendingRemoveMemberId });
                setPendingRemoveMemberId(null);
              }}
              className="h-11 items-center justify-center rounded-xl bg-rose-500"
            >
              <Text className="font-semibold text-white">Xóa</Text>
            </TouchableOpacity>
          </>
        }
      />
    </View>
  );
}
