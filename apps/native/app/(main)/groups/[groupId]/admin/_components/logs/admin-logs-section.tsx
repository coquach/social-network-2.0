import React from 'react';
import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useGroupLogs } from '@repo/shared/hooks';
import { GroupEventLog } from '@repo/shared/types';
import { LogRow } from './log-row';

type EventFilterOption = {
  value: 'ALL' | GroupEventLog;
  label: string;
};

const EVENT_FILTER_OPTIONS: EventFilterOption[] = [
  { value: 'ALL', label: 'T?t c?' },
  { value: GroupEventLog.GROUP_UPDATED, label: 'Nhóm' },
  { value: GroupEventLog.GROUP_SETTING_CHANGED, label: 'Cài d?t' },
  { value: GroupEventLog.JOIN_REQUEST_APPROVED, label: 'Duy?t don' },
  { value: GroupEventLog.MEMBER_JOINED, label: 'Thành viên' },
  { value: GroupEventLog.POST_APPROVED, label: 'Bài vi?t' },
  { value: GroupEventLog.MEMBER_ROLE_CHANGED, label: 'Vai trò' },
];

export const GroupAdminLogsSection = ({ groupId }: { groupId: string }) => {
  const [eventFilter, setEventFilter] = React.useState<'ALL' | GroupEventLog>('ALL');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useGroupLogs(groupId, {
    eventType: eventFilter === 'ALL' ? undefined : eventFilter,
    limit: 20,
  });

  const logs = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <FlashList
      data={logs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <LogRow log={item} />}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      onEndReached={() => {
        if (!hasNextPage || isFetchingNextPage) return;
        void fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View className="mt-1 px-4 pb-3">
          <View className="rounded-2xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
            <Text className="text-lg font-bold text-sky-700 dark:text-sky-400">Nh?t ký ho?t d?ng</Text>
            <Text className="mt-1 text-xs text-sky-600 dark:text-sky-500/80">L?c thao tác qu?n tr? theo lo?i s? ki?n</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 flex-row">
              {EVENT_FILTER_OPTIONS.map((opt) => {
                const isActive = eventFilter === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setEventFilter(opt.value)}
                    className={`mr-2 rounded-full border px-4 py-2 ${
                      isActive
                        ? 'border-sky-500 bg-sky-500'
                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      }
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="p-4" /> : <View className="h-4" />}
      ListEmptyComponent={
        !isLoading ? (
          <View className="items-center px-6 py-12">
            <Text className="text-sm text-slate-400">Không có nh?t ký phù h?p b? l?c.</Text>
          </View>
        ) : null
      }
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
    />
  );
};


