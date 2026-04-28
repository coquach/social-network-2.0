import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { GroupPermission, useGroupPermission } from '@repo/shared';
import { useGroup } from '@repo/shared/hooks';

import { GroupAdminMembersSection } from './admin/_components/members/admin-members-section';
import { AppHeader } from '~/components/ui/app-header';

export default function GroupMembersScreen() {
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

  if (!can(GroupPermission.MANAGE_MEMBERS)) {
    return (
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <AppHeader title="Thành viên" subtitle="Bạn không có quyền quản trị thành viên" variant="bordered" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
            Tài khoản của bạn không đủ quyền để xem và chỉnh sửa danh sách thành viên.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
      <AppHeader title="Thành viên" subtitle="Quản lý vai trò và quyền thành viên" variant="bordered" />
      <GroupAdminMembersSection groupId={groupId ?? ''} />
    </View>
  );
}
