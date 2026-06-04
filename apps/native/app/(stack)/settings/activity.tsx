import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {
  ActivityType,
  useUserActivity,
  type UserActivityDto,
  type UserActivityLogFilter,
  formatAbsoluteTime,
} from '@repo/shared';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '~/components/ui/app-header';
import { useAppTheme } from '~/providers/theme-provider';
import DateTimePicker from '@react-native-community/datetimepicker';

const PAGE_LIMIT = 12;
const ALL_ACTIVITY_TYPE = 'all';

const activityTypeLabels: Record<ActivityType, string> = {
  [ActivityType.POST_CREATED]: 'Tạo bài viết',
  [ActivityType.COMMENT_CREATED]: 'Tạo bình luận',
  [ActivityType.POST_SHARED]: 'Chia sẻ bài viết',
  [ActivityType.SEND_REQUEST]: 'Gửi lời mời kết bạn',
  [ActivityType.ACCEPT_REQUEST]: 'Chấp nhận lời mời',
  [ActivityType.REJECT_REQUEST]: 'Từ chối lời mời',
  [ActivityType.CANCEL_REQUEST]: 'Hủy lời mời',
  [ActivityType.UNFRIEND]: 'Hủy kết bạn',
  [ActivityType.USER_BLOCKED]: 'Chặn người dùng',
  [ActivityType.GROUP_JOINED]: 'Tham gia nhóm',
  [ActivityType.GROUP_LEFT]: 'Rời nhóm',
  [ActivityType.GROUP_CREATED]: 'Tạo nhóm',
};

const formatLabel = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/^[a-zÀ-ỹ]/, (match) => match.toUpperCase());

const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  const normalized = type.toLowerCase();
  if (normalized.includes('create') || normalized.includes('post'))
    return 'sparkles-outline';
  if (normalized.includes('target') || normalized.includes('view'))
    return 'locate-outline';
  if (normalized.includes('tag') || normalized.includes('metadata'))
    return 'pricetag-outline';
  return 'pulse-outline';
};

const getActivityTheme = (type: string, isDark: boolean) => {
  const normalized = type.toLowerCase();
  if (normalized.includes('post') || normalized.includes('create') || normalized.includes('comment')) {
    return {
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      border: 'border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-700 dark:text-indigo-300',
      icon: isDark ? '#818cf8' : '#4f46e5',
      selectedBg: 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500',
    };
  }
  if (normalized.includes('friend') || normalized.includes('request')) {
    if (normalized.includes('unfriend') || normalized.includes('reject') || normalized.includes('cancel') || normalized.includes('block')) {
      return {
        bg: 'bg-rose-50 dark:bg-rose-900/30',
        border: 'border-rose-200 dark:border-rose-800',
        text: 'text-rose-700 dark:text-rose-300',
        icon: isDark ? '#fb7185' : '#e11d48',
        selectedBg: 'bg-rose-100 dark:bg-rose-900/50 border-rose-500',
      };
    }
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: isDark ? '#34d399' : '#10b981',
      selectedBg: 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500',
    };
  }
  if (normalized.includes('group')) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      icon: isDark ? '#fbbf24' : '#d97706',
      selectedBg: 'bg-amber-100 dark:bg-amber-900/50 border-amber-500',
    };
  }
  return {
    bg: 'bg-sky-50 dark:bg-sky-900/30',
    border: 'border-sky-200 dark:border-sky-800',
    text: 'text-sky-700 dark:text-sky-300',
    icon: isDark ? '#38bdf8' : '#0284c7',
    selectedBg: 'bg-sky-100 dark:bg-sky-900/50 border-sky-500',
  };
};

function ActivityTimelineItem({
  item,
  isLast,
}: {
  item: UserActivityDto;
  isLast: boolean;
}) {
  const { resolvedTheme } = useAppTheme();
  const IconName = getActivityIcon(item.activityType);
  const metadataEntries = Object.entries(item.metadata ?? {}).slice(0, 3);
  const isDark = resolvedTheme === 'dark';
  const theme = getActivityTheme(item.activityType, isDark);

  return (
    <View className="flex-row gap-4 px-4 py-2">
      <View className="items-center">
        <View className={`h-10 w-10 items-center justify-center rounded-full border ${theme.border} ${theme.bg}`}>
          <Ionicons
            name={IconName}
            size={18}
            color={theme.icon}
          />
        </View>
        {!isLast && (
          <View className="flex-1 w-px bg-slate-200 dark:bg-slate-800 mt-2 min-h-[40px]" />
        )}
      </View>

      <View className="flex-1 pb-4">
        <View className="flex-row items-center gap-2 flex-wrap">
          <View className={`rounded-full px-2.5 py-0.5 ${theme.bg}`}>
            <Text className={`text-[11px] font-medium ${theme.text}`}>
              {activityTypeLabels[item.activityType as ActivityType] ||
                formatLabel(item.activityType)}
            </Text>
          </View>
          {item.targetId ? (
            <View className="rounded-full border border-slate-200 px-2.5 py-0.5 dark:border-slate-700">
              <Text className="text-[11px] text-slate-500 dark:text-slate-400">
                {item.targetId.slice(0, 8)}
              </Text>
            </View>
          ) : null}
        </View>

        <Text className="mt-2 text-[14px] font-medium text-slate-900 dark:text-slate-100">
          {item.contentPreview || 'Hoạt động hệ thống'}
        </Text>

        <View className="mt-1 flex-row items-center gap-1.5">
          <Ionicons name="time-outline" size={12} color="#64748b" />
          <Text className="text-[11px] text-slate-500 dark:text-slate-400">
            {formatAbsoluteTime(item.createdAt, 'dd/MM/yyyy HH:mm')}
          </Text>
        </View>

        {metadataEntries.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2"
            contentContainerStyle={{ gap: 8 }}
          >
            {metadataEntries.map(([key, value]) => {
              const valStr =
                typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value);
              return (
                <View
                  key={key}
                  className="flex-row items-center rounded-lg bg-slate-50 px-2 py-1 dark:bg-slate-800/50"
                >
                  <Text className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {formatLabel(key)}:{' '}
                  </Text>
                  <Text className="text-[11px] text-slate-500 dark:text-slate-400">
                    {valStr.length > 20 ? valStr.slice(0, 20) + '...' : valStr}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [filters, setFilters] = useState<{
    activityType: ActivityType | 'all';
    fromDate: Date | null;
    toDate: Date | null;
  }>({
    activityType: ALL_ACTIVITY_TYPE,
    fromDate: null,
    toDate: null,
  });

  const [showPicker, setShowPicker] = useState<'from' | 'to' | null>(null);

  const queryFilters = useMemo<UserActivityLogFilter>(() => {
    return {
      limit: PAGE_LIMIT,
      activityType:
        filters.activityType === ALL_ACTIVITY_TYPE
          ? undefined
          : filters.activityType,
      fromDate: filters.fromDate ? filters.fromDate.toISOString() : undefined,
      toDate: filters.toDate ? filters.toDate.toISOString() : undefined,
    };
  }, [filters]);

  const activityQuery = useUserActivity(queryFilters);
  const activities = useMemo(() => {
    return activityQuery.data?.pages.flatMap((page) => page.data) ?? [];
  }, [activityQuery.data?.pages]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  return (
    <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
      <AppHeader
        title="Nhật ký hoạt động"
        trailing={
          <Pressable
            onPress={() => bottomSheetRef.current?.present()}
            className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <Ionicons
              name="filter"
              size={20}
              color={resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a'}
            />
            {filters.activityType !== 'all' ||
            filters.fromDate ||
            filters.toDate ? (
              <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 border border-white dark:border-slate-800" />
            ) : null}
          </Pressable>
        }
      />

      <View className="flex-1">
        <FlashList
          data={activities}
          keyExtractor={(item: UserActivityDto) => item.id}
          {...({ estimatedItemSize: 120 } as any)}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: insets.bottom + 20,
          }}
          ListEmptyComponent={() => {
            if (activityQuery.isLoading) {
              return (
                <View className="flex-1 items-center justify-center py-20">
                  <ActivityIndicator color="#0284c7" />
                </View>
              );
            }
            return (
              <View className="items-center justify-center py-20 px-8">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <Ionicons name="analytics" size={32} color="#94a3b8" />
                </View>
                <Text className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  Chưa có nhật ký hoạt động
                </Text>
                <Text className="mt-2 text-center text-sm text-slate-500">
                  Các hoạt động gần đây của tài khoản sẽ xuất hiện tại đây khi
                  có dữ liệu mới.
                </Text>
              </View>
            );
          }}
          renderItem={({
            item,
            index,
          }: {
            item: UserActivityDto;
            index: number;
          }) => (
            <ActivityTimelineItem
              item={item}
              isLast={index === activities.length - 1}
            />
          )}
          onEndReached={() => {
            if (
              activityQuery.hasNextPage &&
              !activityQuery.isFetchingNextPage
            ) {
              activityQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            if (!activityQuery.isFetchingNextPage) return null;
            return (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#0284c7" />
              </View>
            );
          }}
        />
      </View>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={['50%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
        }}
        handleIndicatorStyle={{
          backgroundColor: resolvedTheme === 'dark' ? '#475569' : '#cbd5e1',
        }}
      >
        <BottomSheetView
          style={{ flex: 1, padding: 24, paddingBottom: insets.bottom + 24 }}
        >
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">
            Bộ lọc hiển thị
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
              Thời gian (Giới hạn 30 ngày)
            </Text>
            <View className="flex-row gap-4 mb-8">
              <Pressable
                onPress={() => setShowPicker('from')}
                className="flex-1 rounded-2xl border border-slate-200 p-3 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <Text className="text-xs text-slate-500 mb-1">Từ ngày</Text>
                <Text className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {filters.fromDate
                    ? formatAbsoluteTime(filters.fromDate, 'dd/MM/yyyy')
                    : 'Chọn ngày'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowPicker('to')}
                className="flex-1 rounded-2xl border border-slate-200 p-3 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <Text className="text-xs text-slate-500 mb-1">Đến ngày</Text>
                <Text className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {filters.toDate
                    ? formatAbsoluteTime(filters.toDate, 'dd/MM/yyyy')
                    : 'Chọn ngày'}
                </Text>
              </Pressable>
            </View>

            {showPicker && (
              <DateTimePicker
                value={
                  showPicker === 'from'
                    ? filters.fromDate || new Date()
                    : filters.toDate || new Date()
                }
                mode="date"
                display="default"
                minimumDate={(() => {
                  if (showPicker === 'to' && filters.fromDate)
                    return filters.fromDate;
                  const min = new Date();
                  min.setDate(min.getDate() - 30);
                  return min;
                })()}
                maximumDate={
                  showPicker === 'from' && filters.toDate
                    ? filters.toDate
                    : new Date()
                }
                onChange={(event, selectedDate) => {
                  setShowPicker(null);
                  if (selectedDate) {
                    setFilters((s) => ({
                      ...s,
                      [showPicker === 'from' ? 'fromDate' : 'toDate']:
                        selectedDate,
                    }));
                  }
                }}
              />
            )}

            <Text className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider mt-4">
              Loại hoạt động
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-8">
              <Pressable
                onPress={() =>
                  setFilters((s) => ({ ...s, activityType: 'all' }))
                }
                className={`rounded-full px-4 py-2 border ${
                  filters.activityType === 'all'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/20'
                    : 'border-slate-200 bg-transparent dark:border-slate-700'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filters.activityType === 'all'
                      ? 'text-sky-700 dark:text-sky-300'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Tất cả
                </Text>
              </Pressable>

              {Object.entries(activityTypeLabels).map(([type, label]) => {
                const isSelected = filters.activityType === type;
                const theme = getActivityTheme(type, resolvedTheme === 'dark');
                
                return (
                  <Pressable
                    key={type}
                    onPress={() =>
                      setFilters((s) => ({
                        ...s,
                        activityType: type as ActivityType,
                      }))
                    }
                    className={`rounded-full px-4 py-2 border ${
                      isSelected
                        ? theme.selectedBg
                        : 'border-slate-200 bg-transparent dark:border-slate-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isSelected
                          ? theme.text
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View className="flex-row gap-4 mt-auto pt-4">
            <Pressable
              onPress={() =>
                setFilters((s) => ({
                  ...s,
                  fromDate: null,
                  toDate: null,
                  activityType: 'all',
                }))
              }
              className="flex-1 bg-slate-100 dark:bg-slate-800 h-12 rounded-2xl items-center justify-center"
            >
              <Text className="text-slate-600 dark:text-slate-300 font-semibold text-base">
                Xóa bộ lọc
              </Text>
            </Pressable>
            <Pressable
              onPress={() => bottomSheetRef.current?.dismiss()}
              className="flex-1 bg-slate-900 dark:bg-sky-500 h-12 rounded-2xl items-center justify-center"
            >
              <Text className="text-white font-semibold text-base">
                Xem kết quả
              </Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
