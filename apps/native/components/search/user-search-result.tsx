import React from 'react';
import { View, Keyboard } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSearchUsers } from '@repo/shared';

import type { FilterOrder } from '~/components/search/search-filter-sheet';

import { EmptySearchState } from '~/components/search/empty-search-state';
import { SearchLoading } from '~/components/search/search-loading';
import { SearchUserItem } from '~/components/search/search-user-item';

type Props = {
  query: string;
  sortOrder: FilterOrder;
};

export function UserSearchResult({ query, sortOrder }: Props) {
  const normalizedQuery = query.trim();
  const search = useSearchUsers({
    query: normalizedQuery,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: sortOrder === 'ASC' ? 'ASC' : 'DESC',
  });

  const users = React.useMemo(
    () => search.data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [search.data],
  );

  if (search.isLoading) {
    return <SearchLoading count={4} />;
  }

  if (!users.length) {
    return (
      <EmptySearchState
        message="Không tìm thấy người dùng"
        icon="person-outline"
      />
    );
  }

  return (
    <FlashList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SearchUserItem user={item} />}
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

export default React.memo(UserSearchResult);
