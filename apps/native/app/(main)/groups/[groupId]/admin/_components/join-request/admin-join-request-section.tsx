import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useGroupJoinRequests, useApproveJoinRequest, useRejectJoinRequest } from '@repo/shared/hooks';
import { JoinRequestStatus, JoinRequestSortBy } from '@repo/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { JoinRequestRow } from './join-request-row';

const STATUS_FILTER_OPTIONS = [
    { value: JoinRequestStatus.PENDING, label: 'Đang chờ' },
    { value: JoinRequestStatus.APPROVED, label: 'Đã duyệt' },
    { value: JoinRequestStatus.REJECTED, label: 'Từ chối' },
    { value: JoinRequestStatus.CANCELLED, label: 'Đã huỷ' },
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
        <View className="mb-4">
            <View className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-2xl border border-sky-100 dark:border-sky-800">
                <Text className="text-lg font-bold text-sky-700 dark:text-sky-400">Yêu cầu tham gia</Text>
                <Text className="text-xs text-sky-600 dark:text-sky-500/80">Quản lý thành viên đang chờ phê duyệt</Text>

                {/* Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mt-3">
                    {STATUS_FILTER_OPTIONS.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => setStatusFilter(opt.value)}
                            className={`px-4 py-2 rounded-full mr-2 border ${statusFilter === opt.value
                                    ? 'bg-sky-500 border-sky-500'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
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
        <FlatList
            data={allRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <JoinRequestRow
                    request={item}
                    canManage={true} // Tạm thời set true hoặc lấy từ context
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
            ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="my-4" /> : null}
            ListEmptyComponent={
                !isLoading ? (
                    <View className="py-10 items-center">
                        <Ionicons name="mail-open-outline" size={48} color="#94a3b8" />
                        <Text className="text-slate-400 mt-2">Không có yêu cầu nào</Text>
                    </View>
                ) : null
            }
            contentContainerStyle={{ padding: 16 }}
        />
    );
};