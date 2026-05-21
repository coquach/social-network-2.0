import React from 'react';
import { View, Keyboard } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSearchPosts, type Emotion } from '@repo/shared';

import { EmptySearchState } from '~/components/search/empty-search-state';
import type { FilterOrder } from '~/components/search/search-filter-sheet';
import { SearchLoading } from '~/components/search/search-loading';
import { SearchPostItem } from '~/components/search/search-post-item';

type Props = {
  query: string;
  emotion?: Emotion;
  sortOrder: FilterOrder;
};

export function PostSearchResult({ query, emotion, sortOrder }: Props) {
  const normalizedQuery = query.trim();
  const search = useSearchPosts({
    query: normalizedQuery,
    emotion,
    sortBy: 'createdAt',
    sortOrder: sortOrder === 'ASC' ? 'ASC' : 'DESC',
  });

  const posts = React.useMemo(
    () => search.data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [search.data],
  );

  if (search.isLoading) {
    return <SearchLoading count={3} />;
  }

  if (!posts.length) {
    return (
      <EmptySearchState
        message="Không tìm thấy bài viết"
        icon="document-outline"
      />
    );
  }

  return (
    <FlashList
      data={posts}
      keyExtractor={(item) => item.postId}
      renderItem={({ item }) => <SearchPostItem post={item} />}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 40,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      onEndReached={() => {
        if (search.hasNextPage) {
          search.fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.6}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={() => Keyboard.dismiss()}
    />
  );
}

export default React.memo(PostSearchResult);
