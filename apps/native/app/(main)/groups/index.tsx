import { useInvitedGroups, useMyGroups, useRecommendedGroups } from '@repo/shared/hooks';
import { FlashList } from '@shopify/flash-list';
import { InvitedGroupDTO } from '@repo/shared/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, RefreshControl, Text, TouchableOpacity, View } from 'react-native';

import { CreateGroupForm } from '~/components/groups/create-group-form';
import { GroupCard } from '~/components/groups/group-card';
import { InvitedGroupCard } from '~/components/groups/invited-group-card';
import { AppHeader, AppHeaderIconButton } from '~/components/ui/app-header';

enum GroupTab {
  MY_GROUPS = 'MY_GROUPS',
  RECOMMENDED = 'RECOMMENDED',
  INVITATIONS = 'INVITATIONS',
}

export default function GroupsScreen() {
  const [activeTab, setActiveTab] = useState<GroupTab>(GroupTab.MY_GROUPS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const myGroupsQuery = useMyGroups({ limit: 10 });
  const recommendedQuery = useRecommendedGroups({ limit: 10 });
  const invitedQuery = useInvitedGroups({ limit: 10 });

  const activeQuery = useMemo(() => {
    switch (activeTab) {
      case GroupTab.RECOMMENDED:
        return recommendedQuery;
      case GroupTab.INVITATIONS:
        return invitedQuery;
      case GroupTab.MY_GROUPS:
      default:
        return myGroupsQuery;
    }
  }, [activeTab, invitedQuery, myGroupsQuery, recommendedQuery]);

  const groups = useMemo(
    () => (activeQuery.data?.pages ?? []).flatMap((page) => page.data ?? []),
    [activeQuery.data?.pages],
  );

  const renderHeader = () => (
    <View className="bg-app-bg pb-2 dark:bg-app-bg-dark">
      <AppHeader
        title="Nhóm"
        subtitle="Theo dõi cộng đồng bạn quan tâm và duyệt lời mời nhanh"
        variant="bordered"
        leading={<View className="h-11 w-11" />}
        trailing={
          <AppHeaderIconButton
            icon="add"
            onPress={() => setIsCreateModalOpen(true)}
            className="bg-sky-500/15"
            iconColor="#0284c7"
          />
        }
      />

      <View className="mx-4 mb-4 flex-row rounded-2xl bg-app-surface-elevated p-1 dark:bg-app-surface-elevated-dark">
        {[
          { id: GroupTab.MY_GROUPS, label: 'Của tôi' },
          { id: GroupTab.RECOMMENDED, label: 'Gợi ý' },
          { id: GroupTab.INVITATIONS, label: 'Lời mời' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`h-10 flex-1 items-center justify-center rounded-xl ${
                isActive ? 'bg-app-bg dark:bg-app-bg-dark' : ''
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive
                    ? 'text-app-primary dark:text-app-primary-dark'
                    : 'text-app-muted-fg dark:text-app-muted-fg-dark'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
      <FlashList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4 py-1.5">
            {activeTab === GroupTab.INVITATIONS ? (
              <InvitedGroupCard group={item as InvitedGroupDTO} />
            ) : (
              <GroupCard group={item} />
            )}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View className="h-28" />}
        onEndReached={() => {
          if (!activeQuery.hasNextPage || activeQuery.isFetchingNextPage) return;
          void activeQuery.fetchNextPage();
        }}
        onEndReachedThreshold={0.6}
        refreshControl={
          <RefreshControl
            refreshing={activeQuery.isRefetching}
            onRefresh={() => void activeQuery.refetch()}
            tintColor="#0ea5e9"
          />
        }
        ListEmptyComponent={
          <View className="items-center px-10 py-20">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
              <Ionicons name="people-outline" size={40} color="#cbd5e1" />
            </View>
            <Text className="text-center font-medium text-slate-500 dark:text-slate-400">
              {activeQuery.isLoading ? 'Đang tải danh sách nhóm...' : 'Không có dữ liệu trong mục này'}
            </Text>
          </View>
        }
      />

      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent={false}
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <CreateGroupForm onClose={() => setIsCreateModalOpen(false)} />
      </Modal>
    </View>
  );
}
