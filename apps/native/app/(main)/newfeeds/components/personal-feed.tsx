import React from 'react';
import { FeedType, useMyFeed } from '@repo/shared';
import type {
  Emotion,
  PersonalFeedItem,
  PostSnapshotDTO,
  SharePostSnapshotDTO,
} from '@repo/shared';
import { FeedList } from './feed-list';
import { PostCardFull } from '~/components/post/post-card-full';
import { SharePost } from '~/components/post/share-post';

type PersonalFeedProps = {
  mainEmotion?: Emotion;
  onScroll: any;
  scrollEnabled: boolean;
  listHeaderComponent?: React.ReactElement;
  contentContainerStyle: {
    paddingTop: number;
    paddingBottom: number;
    paddingHorizontal: number;
  };
};

export const PersonalFeed = React.memo(function PersonalFeed({
  mainEmotion,
  onScroll,
  scrollEnabled,
  listHeaderComponent,
  contentContainerStyle,
}: PersonalFeedProps) {
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
  } = useMyFeed({ mainEmotion, limit: 10 });

  const feedItems = data ?? [];

  const keyExtractor = React.useCallback(
    (item: PersonalFeedItem) => item.id,
    [],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: PersonalFeedItem }) => {
      if (item.type === FeedType.SHARE) {
        return <SharePost data={item.data as SharePostSnapshotDTO} />;
      }

      return <PostCardFull data={item.data as PostSnapshotDTO} />;
    },
    [],
  );

  const getItemType = React.useCallback(
    (item: PersonalFeedItem) => item.type,
    [],
  );

  const handleLoadMore = React.useCallback(() => {
    fetchNextPage().catch((err: unknown) => {
      console.log('Load more personal feed failed:', err);
    });
  }, [fetchNextPage]);

  const handleRefresh = React.useCallback(async () => {
    try {
      await refetch({
        refetchPage: (_page: unknown, index: number) => index === 0,
      } as never);
    } catch (err: unknown) {
      console.log('Refresh personal feed failed:', err);
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
      listHeaderComponent={listHeaderComponent}
      contentContainerStyle={contentContainerStyle}
      emptyText="Không có bài viết nào trong bảng tin."
      estimatedItemSize={420}
      getItemType={getItemType}
    />
  );
});
