import React from 'react';
import { useTrendingFeed } from '@repo/shared';
import type { Emotion, PostSnapshotDTO } from '@repo/shared';
import { FeedList } from './feed-list';
import { PostCardFull } from '~/components/post/post-card-full';
import { View } from 'react-native';
import { MusicCarousel } from '~/components/newfeeds/feed-header/music-carousel';

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

  const posts = data ?? [];

  const renderItem = React.useCallback(
    ({ item }: { item: PostSnapshotDTO }) => <PostCardFull data={item} />,
    [],
  );

  const keyExtractor = React.useCallback(
    (item: PostSnapshotDTO) => item.postId,
    [],
  );

  const getItemType = React.useCallback(() => 'post', []);

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
      items={posts}
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
      listHeaderComponent={
        <View className="pb-2">
          <View className="mb-3">
            <MusicCarousel />
          </View>
          <View className="h-px bg-app-border/40 mx-2" />
        </View>
      }
      contentContainerStyle={contentContainerStyle}
      emptyText="Không có bài viết xu hướng nào."
      estimatedItemSize={380}
      getItemType={getItemType}
    />
  );
});
