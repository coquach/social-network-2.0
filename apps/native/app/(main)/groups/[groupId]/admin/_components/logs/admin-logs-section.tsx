import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useGroupLogs } from '@repo/shared/hooks';
import { GroupEventLog } from '@repo/shared/types';
import { LogRow } from './log-row';


export const GroupAdminLogsSection = ({ groupId }: { groupId: string }) => {
    const [eventFilter, setEventFilter] = useState<'ALL' | GroupEventLog>('ALL');

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useGroupLogs(groupId, {
        eventType: eventFilter === 'ALL' ? undefined : eventFilter,
        limit: 20,
    });

    const logs = data?.pages.flatMap((p) => p.data) ?? [];

    return (
        <View className="flex-1 bg-white dark:bg-slate-950">
            <View className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <Text className="text-lg font-bold text-slate-900 dark:text-white">Nhật ký hoạt động</Text>
                {/* Thêm Scrollable Filter ở đây nếu cần giống Join Requests */}
            </View>

            <FlatList
                data={logs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <LogRow log={item} />}
                onEndReached={() => hasNextPage && fetchNextPage()}
                ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="p-4" /> : null}
                contentContainerStyle={{ padding: 16 }}
            />
        </View>
    );
};