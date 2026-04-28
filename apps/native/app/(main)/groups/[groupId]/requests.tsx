import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { GroupPermission, useGroupPermission } from '@repo/shared';
import { useGroup } from '@repo/shared/hooks';

import { GroupAdminJoinRequestsSection } from './admin/_components/join-request/admin-join-request-section';
import { AppHeader } from '~/components/ui/app-header';

export default function GroupRequestsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { data: group, isLoading, isError } = useGroup(groupId ?? '');
  const { can } = useGroupPermission(group);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg dark:bg-app-bg-dark">
        <ActivityIndicator size="small" color="#0ea5e9" />
      </View>
    );
  }

  if (isError || !group) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg px-6 dark:bg-app-bg-dark">
        <Text className="text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
          Không thể tải dữ liệu nhóm.
        </Text>
      </View>
    );
  }

  if (!can(GroupPermission.MANAGE_JOIN_REQUESTS)) {
    return (
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <AppHeader title="Yêu cầu tham gia" subtitle="Bạn không có quyền duyệt yêu cầu" variant="bordered" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
            Tài khoản của bạn không đủ quyền để duyệt yêu cầu tham gia nhóm.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
      <AppHeader title="Yêu cầu tham gia" subtitle="Duyệt yêu cầu theo trạng thái" variant="bordered" />
      <GroupAdminJoinRequestsSection groupId={groupId ?? ''} />
    </View>
  );
}
