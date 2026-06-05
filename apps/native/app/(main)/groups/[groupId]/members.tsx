import { useLocalSearchParams } from 'expo-router';
import React from 'react';


import { GroupPermission, useGroupPermission } from '@repo/shared';
import { useGroup } from '@repo/shared/hooks';

import { MemberSection } from './members/member-section';
import { AppHeader } from '~/components/ui/app-header';
import { AppLoadingBlock } from '~/components/ui/app-loading';
import { Text, View } from 'react-native';

export default function GroupMembersScreen() {
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

  return (
    <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
      <AppHeader
        title="Thành viên"
        subtitle="Danh sách thành viên nhóm"
        variant="bordered"
      />
      <MemberSection groupId={groupId ?? ''} />
    </View>
  );
}

