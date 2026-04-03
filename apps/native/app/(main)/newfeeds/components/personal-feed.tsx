import React from 'react';
import { FeedType, useMyFeed } from '@repo/shared';
import type {
  FeedDTO,
  PostDTO,
  PostSnapshotDTO,
  SharePostDTO,
  SharePostSnapshotDTO,
} from '@repo/shared';
import { FeedList } from './feed-list';
import {
  isPostFeed,
  isShareFeed,
  toPostSnapshot,
  toShareSnapshot,
} from './feed-mappers';
import { PostCardFull } from '~/components/post/post-card-full';
import { SharePost } from '~/components/post/share-post';

type PersonalFeedProps = {
  onScroll: any;
  scrollEnabled: boolean;
  listHeaderComponent?: React.ReactElement;
  contentContainerStyle: {
    paddingTop: number;
    paddingBottom: number;
    paddingHorizontal: number;
  };
};

export function PersonalFeed({
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyFeed({ limit: 10 });

  console.log('🔥 useMyFeed data:', JSON.stringify(data, null, 2));

  const feedItems = React.useMemo<FeedDTO[]>(() => {
    return data?.pages.flatMap((page) => page.data as FeedDTO[]) ?? [];
  }, [data]);

  const keyExtractor = React.useCallback((item: FeedDTO) => item.id, []);

  const renderItem = React.useCallback(({ item }: { item: FeedDTO }) => {
    if (isPostFeed(item)) {
      const post = toPostSnapshot(item.item as PostSnapshotDTO | PostDTO);
      return <PostCardFull data={post} />;
    }

    if (isShareFeed(item) || item.type === FeedType.SHARE) {
      const share = toShareSnapshot(
        item.item as unknown as SharePostSnapshotDTO | SharePostDTO,
      );
      return <SharePost data={share} />;
    }

    return null;
  }, []);

  const handleLoadMore = React.useCallback(() => {
    fetchNextPage().catch((err: unknown) => {
      console.log('Load more personal feed failed:', err);
    });
  }, [fetchNextPage]);

  return (
    <FeedList
      data={feedItems}
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
      emptyText="Không có bài viết nào trong bảng tin."
    />
  );
}
