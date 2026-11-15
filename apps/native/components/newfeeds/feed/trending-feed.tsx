import React from 'react';
import { FeedType, useTrendingFeed } from '@repo/shared';
import type { Emotion, FeedItem } from '@repo/shared';

import { PostCardFull } from '~/components/post/post-card-full';
import { SafeSpaceCard } from '~/components/newfeeds/feed/safe-space-card';
import { FeedList } from './feed-list';

type TrendingFeedProps = {
  mainEmotion?: Emotion;
  onScroll: any;
  scrollEnabled: boolean;
  contentContainerStyle: {
    paddingTop: number;
    paddingBottom: number;
    paddingHorizontal: number;
  };
};

export const TrendingFeed = React.memo(function TrendingFeed({
  mainEmotion,
  onScroll,
  scrollEnabled,
  contentContainerStyle,
}: TrendingFeedProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTrendingFeed({ mainEmotion, limit: 10 });

  const feedItems = data ?? [];

  const renderItem = React.useCallback(
    ({ item }: { item: FeedItem }) => {
      if (item.type === FeedType.INTERVENTION) {
        return <SafeSpaceCard data={item.data} />;
      }

      // Backend trending only returns POST | INTERVENTION
      if (item.type === FeedType.POST) {
        return <PostCardFull data={item.data} />;
      }

      return null;
    },
    [],
  );

  const keyExtractor = React.useCallback(
    (item: FeedItem) => item.id,
    [],
  );

  const getItemType = React.useCallback(
    (item: FeedItem) => item.type,
    [],
  );

  const handleLoadMore = React.useCallback(() => {
    fetchNextPage().catch((err: unknown) => {
      console.log('Load more trending failed:', err);
    });
  }, [fetchNextPage]);

  const handleRefresh = React.useCallback(async () => {
    try {
      await refetch({
        refetchPage: (_page: unknown, index: number) => index === 0,
      } as never);
    } catch (err: unknown) {
      console.log('Refresh trending failed:', err);
    }
  }, [refetch]);

  return (
    <FeedList
      items={feedItems}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error instanceof Error ? error.message : undefined}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={Boolean(hasNextPage)}
      onLoadMore={handleLoadMore}
      refreshing={isRefetching}
      onRefresh={handleRefresh}
      onScroll={onScroll}
      scrollEnabled={scrollEnabled}
      contentContainerStyle={contentContainerStyle}
      emptyText="Khong co bai viet xu huong nao."
      estimatedItemSize={380}
      getItemType={getItemType}
    />
  );
});
