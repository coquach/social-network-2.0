import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, SectionList, Text, TouchableOpacity, View } from 'react-native';
import { useGroupMembers } from '@repo/shared/hooks';
import { GroupMemberStatus, GroupRole } from '@repo/shared/types';
import { GroupAdminMemberRow } from './member-row';

const STATUS_OPTIONS = [
  { value: GroupMemberStatus.ACTIVE, label: 'Hoạt động' },
  { value: GroupMemberStatus.BANNED, label: 'Đã chặn' },
];

export const roleLabel: Record<GroupRole, string> = {
  OWNER: 'Chủ nhóm',
  ADMIN: 'Quản trị viên',
  MODERATOR: 'Người kiểm duyệt',
  MEMBER: 'Thành viên',
};

export const GroupAdminMembersSection = ({ groupId }: { groupId: string }) => {
  const [statusFilter, setStatusFilter] = useState<GroupMemberStatus>(GroupMemberStatus.ACTIVE);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useGroupMembers(groupId, {
    status: statusFilter,
    limit: 20,
  });

  const allMembers = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  const sections = useMemo(() => {
    const roles: GroupRole[] = [GroupRole.OWNER, GroupRole.ADMIN, GroupRole.MODERATOR, GroupRole.MEMBER];
    return roles
      .map((role) => ({
        title: roleLabel[role],
        role,
        data: allMembers.filter((m) => m.role === role),
      }))
      .filter((section) => section.data.length > 0);
  }, [allMembers]);

  const renderHeader = () => (
    <View className="mb-4">
      <View className="rounded-2xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
        <Text className="text-lg font-bold text-sky-700 dark:text-sky-400">Thành viên nhóm</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 flex-row">
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setStatusFilter(opt.value)}
              className={`mr-2 rounded-full border px-4 py-2 ${
                statusFilter === opt.value
                  ? 'border-sky-500 bg-sky-500'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
              }`}
            >
              <Text className={`text-xs font-bold ${statusFilter === opt.value ? 'text-white' : 'text-slate-500'}`}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <GroupAdminMemberRow member={item} groupId={groupId} />}
      renderSectionHeader={({ section: { title, data } }) => (
        <View className="bg-white py-2 dark:bg-slate-950">
          <Text className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {title} ({data.length})
          </Text>
        </View>
      )}
      ListHeaderComponent={renderHeader}
      onEndReached={() => hasNextPage && fetchNextPage()}
      refreshing={isLoading}
      onRefresh={refetch}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="my-4" /> : <View className="h-20" />}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ padding: 16 }}
    />
  );
};
