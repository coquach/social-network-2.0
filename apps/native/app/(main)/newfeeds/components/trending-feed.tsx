import React from 'react';
import { useTrendingFeed } from '@repo/shared';
import type { PostDTO, PostSnapshotDTO } from '@repo/shared';
import { FeedList } from './feed-list';
import { toPostSnapshot } from './feed-mappers';
import { PostCardFull } from '~/components/post/post-card-full';

type TrendingFeedProps = {
  onScroll: any;
  scrollEnabled: boolean;
  listHeaderComponent?: React.ReactElement;
  contentContainerStyle: {
    paddingTop: number;
    paddingBottom: number;
    paddingHorizontal: number;
  };
};

export function TrendingFeed({
  onScroll,
  scrollEnabled,
  listHeaderComponent,
  contentContainerStyle,
}: TrendingFeedProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTrendingFeed({ limit: 10 });

  const posts = React.useMemo<PostSnapshotDTO[]>(() => {
    const raw = data?.pages.flatMap((page) => page.data as PostDTO[]) ?? [];
    return raw.map((post) => toPostSnapshot(post));
  }, [data]);

  const renderItem = React.useCallback(
    ({ item }: { item: PostSnapshotDTO }) => <PostCardFull data={item} />,
    [],
  );

  const keyExtractor = React.useCallback(
    (item: PostSnapshotDTO) => item.postId,
    [],
  );

  const handleLoadMore = React.useCallback(() => {
    fetchNextPage().catch((err: unknown) => {
      console.log('Load more trending failed:', err);
    });
  }, [fetchNextPage]);

  return (
    <FeedList
      data={posts}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error instanceof Error ? error.message : undefined}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={Boolean(hasNextPage)}
      onLoadMore={handleLoadMore}
      onScroll={onScroll}
      scrollEnabled={scrollEnabled}
      listHeaderComponent={listHeaderComponent}
      contentContainerStyle={contentContainerStyle}
      emptyText="Không có bài viết xu hướng nào."
    />
  );
}
