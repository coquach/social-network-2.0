import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { PostCardFullSkeleton } from '~/components/post/post-card-full';
import { AppSubtitle } from '~/components/ui/app-text';
import type { StyleProp, ViewStyle } from 'react-native';

const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList,
) as typeof FlashList;

const ItemSeparator = () => <View style={{ height: 10 }} />;

type FeedListProps<TItem> = {
  items: TItem[];
  keyExtractor: (item: TItem) => string;
  renderItem: ({ item }: { item: TItem }) => React.ReactElement | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onScroll?: any;
  scrollEnabled: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  listHeaderComponent?: React.ReactElement;
  contentContainerStyle: StyleProp<ViewStyle>;
  emptyText: string;
  estimatedItemSize: number;
  getItemType?: (item: TItem) => string | number;
  bodyHorizontalPadding?: number;
};

export function FeedList<TItem>({
  items,
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
  refreshing = false,
  onRefresh,
  listHeaderComponent,
  contentContainerStyle,
  emptyText,
  estimatedItemSize,
  getItemType,
  bodyHorizontalPadding = 0,
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
        <View className="gap-3 pt-2" style={{ paddingHorizontal: bodyHorizontalPadding }}>
          <PostCardFullSkeleton />
        </View>
      );
    }

    return <View style={{ height: 12 }} />;
  }, [bodyHorizontalPadding, isFetchingNextPage]);

  const empty = React.useMemo(() => {
    if (isLoading) {
      return (
        <View className="gap-3 pt-2" style={{ paddingHorizontal: bodyHorizontalPadding }}>
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
  }, [bodyHorizontalPadding, emptyText, errorMessage, isError, isLoading]);

  const keyExtractorAdapter = React.useCallback(
    (item: unknown) => keyExtractor(item as TItem),
    [keyExtractor],
  );

  const renderItemAdapter = React.useCallback(
    ({ item }: { item: unknown }) => (
      <View style={{ paddingHorizontal: bodyHorizontalPadding }}>
        {renderItem({ item: item as TItem })}
      </View>
    ),
    [bodyHorizontalPadding, renderItem],
  );

  const getItemTypeAdapter = React.useCallback(
    (item: unknown) => getItemType?.(item as TItem),
    [getItemType],
  );

  return (
    <AnimatedFlashList
      style={{ flex: 1 }}
      data={items as unknown[]}
      keyExtractor={keyExtractorAdapter}
      renderItem={renderItemAdapter}
      ListHeaderComponent={listHeaderComponent ?? null}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={ItemSeparator}
      ListFooterComponent={footer}
      contentContainerStyle={contentContainerStyle}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.6}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
      drawDistance={estimatedItemSize * 4}
      removeClippedSubviews={false}
      getItemType={getItemTypeAdapter}
    />
  );
}
