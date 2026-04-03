import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { PostCardFullSkeleton } from '~/components/post/post-card-full';
import { AppSubtitle } from '~/components/ui/app-text';

type FeedListProps<TItem> = {
  data: TItem[];
  keyExtractor: (item: TItem) => string;
  renderItem: ({ item }: { item: TItem }) => React.ReactElement | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onScroll: any;
  scrollEnabled: boolean;
  listHeaderComponent?: React.ReactElement;
  contentContainerStyle: {
    paddingTop: number;
    paddingBottom: number;
    paddingHorizontal: number;
  };
  emptyText: string;
};

export function FeedList<TItem>({
  data,
  keyExtractor,
  renderItem,
  isLoading,
  isError,
  errorMessage,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onScroll,
  scrollEnabled,
  listHeaderComponent,
  contentContainerStyle,
  emptyText,
}: FeedListProps<TItem>) {
  const handleEndReached = React.useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isLoading || isError) {
      return;
    }
    onLoadMore();
  }, [hasNextPage, isError, isFetchingNextPage, isLoading, onLoadMore]);

  const footer = React.useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View className="gap-3 pt-2">
          <PostCardFullSkeleton />
        </View>
      );
    }

    return <View style={{ height: 12 }} />;
  }, [isFetchingNextPage]);

  const empty = React.useMemo(() => {
    if (isLoading) {
      return (
        <View className="gap-3 pt-2">
          <PostCardFullSkeleton />
          <PostCardFullSkeleton />
        </View>
      );
    }

    if (isError) {
      return (
        <View className="items-center py-8">
          <AppSubtitle className="text-center text-red-500">
            {errorMessage || 'Không thể tải bảng tin. Vui lòng thử lại.'}
          </AppSubtitle>
        </View>
      );
    }

    return (
      <View className="items-center py-6">
        <AppSubtitle className="text-center">{emptyText}</AppSubtitle>
      </View>
    );
  }, [emptyText, errorMessage, isError, isLoading]);

  return (
    <Animated.FlatList
      style={{ flex: 1 }}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={listHeaderComponent ?? null}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListFooterComponent={footer}
      contentContainerStyle={contentContainerStyle}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      onScroll={onScroll}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.6}
      scrollEnabled={scrollEnabled}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    />
  );
}
