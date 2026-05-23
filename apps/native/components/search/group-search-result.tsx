import React from 'react';
import { View, Keyboard } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSearchGroups, SearchGroupSortBy } from '@repo/shared';

import { EmptySearchState } from '~/components/search/empty-search-state';
import { SearchLoading } from '~/components/search/search-loading';
import { SearchGroupItem } from '~/components/search/search-group-item';
import type { FilterOrder } from '~/components/search/search-filter-sheet';

type Props = {
  query: string;
  sortBy: SearchGroupSortBy;
  sortOrder: FilterOrder;
};

export function GroupSearchResult({ query, sortBy, sortOrder }: Props) {
  const normalizedQuery = query.trim();
  const search = useSearchGroups({
    query: normalizedQuery,
    sortBy,
    sortOrder: sortOrder === 'ASC' ? 'ASC' : 'DESC',
  });

  const groups = React.useMemo(
    () => search.data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [search.data],
  );

  if (search.isLoading) {
    return <SearchLoading count={4} />;
  }

  if (!groups.length) {
    return (
      <EmptySearchState message="Không tìm thấy nhóm" icon="people-outline" />
    );
  }

  return (
    <FlashList
      data={groups}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SearchGroupItem group={item} />}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 40,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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

export default React.memo(GroupSearchResult);
