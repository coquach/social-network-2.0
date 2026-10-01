import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  TargetType,
  useUserModerationHistory,
  type ContentModerationDTO,
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
import { ModerationHistoryItem } from '~/components/settings/moderation-history-item';
import { ModerationHistoryDetailSheet } from '~/components/settings/moderation-history-detail-sheet';

const PAGE_SIZE = 20;

export default function ModerationHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';
  
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [targetType, setTargetType] = useState<TargetType | 'all'>('all');

  const queryFilters = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    targetType: targetType === 'all' ? undefined : targetType,
  }), [page, targetType]);

  const { data, isLoading, refetch, isFetching } = useUserModerationHistory(queryFilters);

  const moderationRecords = data?.data ?? [];

  const handleOpenDetail = useCallback((id: string) => {
    setSelectedId(id);
    bottomSheetRef.current?.present();
  }, []);

  const handleFilterChange = (type: TargetType | 'all') => {
    setTargetType(type);
    setPage(1);
  };

  const filterOptions: Array<{ label: string; value: TargetType | 'all' }> = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Bài viết', value: TargetType.POST },
    { label: 'Bình luận', value: TargetType.COMMENT },
    { label: 'Chia sẻ', value: TargetType.SHARE },
  ];

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <AppHeader 
          title="Lịch sử kiểm duyệt" 
          trailing={
            <Pressable 
              onPress={() => refetch()}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800"
            >
              <Ionicons 
                name="refresh-outline" 
                size={20} 
                color={isDark ? '#f8fafc' : '#0f172a'} 
                className={isFetching ? 'animate-spin' : ''}
              />
            </Pressable>
          }
        />

        <View className="z-10 bg-app-bg dark:bg-app-bg-dark border-b border-slate-100 dark:border-slate-800">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
          >
            {filterOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => handleFilterChange(opt.value)}
                className={`rounded-full border px-4 py-1.5 ${
                  targetType === opt.value
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/20'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                <Text
                  className={`text-[13px] font-medium ${
                    targetType === opt.value
                      ? 'text-sky-700 dark:text-sky-300'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="flex-1">
          <FlashList
            data={moderationRecords}
            keyExtractor={(item: ContentModerationDTO) => item.id}
            {...({ estimatedItemSize: 80 } as any)}
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: insets.bottom + 20,
            }}
            ListEmptyComponent={() => {
              if (isLoading) {
                return (
                  <View className="flex-1 items-center justify-center py-20">
                    <ActivityIndicator color="#0284c7" />
                  </View>
                );
              }
              return (
                <View className="items-center justify-center py-20 px-8">
                  <View className="h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 mb-4">
                    <Ionicons name="shield-outline" size={40} color="#94a3b8" />
                  </View>
                  <Text className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Không có bản ghi nào
                  </Text>
                  <Text className="mt-2 text-center text-[13px] text-slate-500 leading-5">
                    Tất cả các quyết định kiểm duyệt liên quan đến nội dung của bạn sẽ hiển thị tại đây.
                  </Text>
                </View>
              );
            }}
            renderItem={({ item }: { item: ContentModerationDTO }) => (
              <ModerationHistoryItem 
                item={item} 
                onPress={() => handleOpenDetail(item.id)} 
              />
            )}
            onRefresh={refetch}
            refreshing={isFetching && !isLoading}
          />
        </View>

        <ModerationHistoryDetailSheet
          ref={bottomSheetRef}
          moderationId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      </View>
    </BottomSheetModalProvider>
  );
}
