import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { GroupPermission, useGroupPermission } from '@repo/shared';
import { useGroup } from '@repo/shared/hooks';

import { GroupAdminMembersSection } from '~/components/group-admin/members/admin-members-section';
import { AppHeader } from '~/components/ui/app-header';
import { AppLoadingBlock } from '~/components/ui/app-loading';

export default function GroupMembersScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { data: group, isLoading, isError } = useGroup(groupId ?? '');
  const { can } = useGroupPermission(group);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg dark:bg-app-bg-dark">
        <AppLoadingBlock label="Äang táº£i nhÃ³m" />
      </View>
    );
  }

  if (isError || !group) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg px-6 dark:bg-app-bg-dark">
        <Text className="text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
          KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u nhÃ³m.
        </Text>
      </View>
    );
  }

  if (!can(GroupPermission.MANAGE_MEMBERS)) {
    return (
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <AppHeader
          title="ThÃ nh viÃªn"
          subtitle="Báº¡n khÃ´ng cÃ³ quyá»n quáº£n trá»‹ thÃ nh viÃªn"
          variant="bordered"
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
            TÃ i khoáº£n cá»§a báº¡n khÃ´ng Ä‘á»§ quyá»n Ä‘á»ƒ xem vÃ  chá»‰nh sá»­a danh sÃ¡ch thÃ nh
            viÃªn.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
      <AppHeader
        title="ThÃ nh viÃªn"
        subtitle="Quáº£n lÃ½ vai trÃ² vÃ  quyá»n thÃ nh viÃªn"
        variant="bordered"
      />
      <GroupAdminMembersSection groupId={groupId ?? ''} />
    </View>
  );
}





