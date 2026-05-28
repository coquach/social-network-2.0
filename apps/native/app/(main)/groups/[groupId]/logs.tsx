import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { GroupPermission, useGroupPermission } from '@repo/shared';
import { useGroup } from '@repo/shared/hooks';

import { GroupAdminLogsSection } from '~/components/group-admin/logs/admin-logs-section';
import { AppHeader } from '~/components/ui/app-header';
import { AppLoadingBlock } from '~/components/ui/app-loading';

export default function GroupLogsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { data: group, isLoading, isError } = useGroup(groupId ?? '');
  const { can } = useGroupPermission(group);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg dark:bg-app-bg-dark">
        <AppLoadingBlock label="Đang tải nhóm" />
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

  if (!can(GroupPermission.MANAGE_GROUP)) {
    return (
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <AppHeader title="Nhật ký hoạt động" subtitle="Bạn không có quyền xem nhật ký" variant="bordered" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
            Tài khoản của bạn không đủ quyền để xem lịch sử hoạt động quản trị.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
      <AppHeader title="Nhật ký hoạt động" subtitle="Theo dõi toàn bộ thao tác quản trị" variant="bordered" />
      <GroupAdminLogsSection groupId={groupId ?? ''} />
    </View>
  );
}




