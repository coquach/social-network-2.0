import React, { useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AppInlineLoading } from '~/components/ui/app-loading';
import { Ionicons } from '@expo/vector-icons';

import { useApproveJoinRequest, useGroupJoinRequests, useRejectJoinRequest } from '@repo/shared/hooks';
import { JoinRequestSortBy, JoinRequestStatus } from '@repo/shared/types';

import { JoinRequestRow } from './join-request-row';

const STATUS_FILTER_OPTIONS = [
  { value: JoinRequestStatus.PENDING, label: 'Đang chờ' },
  { value: JoinRequestStatus.APPROVED, label: 'Đã duyệt' },
  { value: JoinRequestStatus.REJECTED, label: 'Từ chối' },
  { value: JoinRequestStatus.CANCELLED, label: 'Đã hủy' },
];

export const GroupAdminJoinRequestsSection = ({ groupId }: { groupId: string }) => {
  const [statusFilter, setStatusFilter] = useState<JoinRequestStatus>(JoinRequestStatus.PENDING);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useGroupJoinRequests(groupId, {
    status: statusFilter,
    sortBy: JoinRequestSortBy.CREATED_AT,
    limit: 20,
  });

  const { mutate: approveMutate, isPending: approving } = useApproveJoinRequest();
  const { mutate: rejectMutate, isPending: rejecting } = useRejectJoinRequest();

  const allRequests = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  const renderHeader = () => (
    <View className="mb-4 mt-1 px-4">
      <View className="rounded-2xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
        <Text className="text-lg font-bold text-sky-700 dark:text-sky-400">Yêu cầu tham gia</Text>
        <Text className="mt-1 text-xs text-sky-600 dark:text-sky-500/80">Quản lý thành viên đang chờ phê duyệt</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 flex-row">
          {STATUS_FILTER_OPTIONS.map((opt) => (
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
    <FlashList
      data={allRequests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <JoinRequestRow
          request={item}
          canManage
          approving={approving}
          rejecting={rejecting}
          onApprove={() => approveMutate({ groupId, requestId: item.id })}
          onReject={() => rejectMutate({ groupId, requestId: item.id })}
        />
      )}
      ListHeaderComponent={renderHeader}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      refreshing={isLoading}
      onRefresh={refetch}
      ListFooterComponent={isFetchingNextPage ? <AppInlineLoading label="Đang tải thêm..." className="my-4" /> : null}
      ListEmptyComponent={
        !isLoading ? (
          <View className="items-center py-10">
            <Ionicons name="mail-open-outline" size={48} color="#94a3b8" />
            <Text className="mt-2 text-slate-400">Không có yêu cầu nào</Text>
          </View>
        ) : null
      }
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
    />
  );
};


