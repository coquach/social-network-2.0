import React from 'react';
import { View, Keyboard } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { setItem, getItem } from '~/utils/storage';
import { SearchGroupSortBy } from '@repo/shared';

import { AppBackButton } from '~/components/ui/app-header';
import { AppScreen } from '~/components/ui/app-screen';
import { KeyboardAwareContainer } from '~/components/ui/keyboard-aware-container';

import SearchInput from '~/components/search/search-input';
import SearchTabs, { type Tab } from '~/components/search/search-tabs';

import SearchFilterSheet, {
  type UserFilter,
  type PostFilter,
  type GroupFilter,
} from '../../components/search/search-filter-sheet';

import { RecentSearchList } from '~/components/search/recent-search-list';
import { UserSearchResult } from '~/components/search/user-search-result';
import { PostSearchResult } from '~/components/search/post-search-result';
import { GroupSearchResult } from '~/components/search/group-search-result';

const RECENT_KEY = 'recent_searches_v1';

function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);

    return () => clearTimeout(t);
  }, [value, delay]);

  return v;
}

export default function SearchScreen() {
  const [query, setQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<Tab>('users');

  const [filterVisible, setFilterVisible] = React.useState(false);

  const [userFilter, setUserFilter] = React.useState<UserFilter>({
    sortOrder: 'DESC',
  });

  const [postFilter, setPostFilter] = React.useState<PostFilter>({
    sortOrder: 'DESC',
  });

  const [groupFilter, setGroupFilter] = React.useState<GroupFilter>({
    sortBy: SearchGroupSortBy.MEMBERS,
    order: 'DESC',
  });

  useFocusEffect(
    React.useCallback(() => {
      setFilterVisible(false);

      return () => {
        setFilterVisible(false);
      };
    }, []),
  );

  const debouncedQuery = useDebouncedValue(query, 300);

  const isEmptyQuery = debouncedQuery.trim().length === 0;

  const saveRecentSearch = React.useCallback(async (q: string) => {
    if (!q.trim()) return;

    try {
      const raw = (await getItem(RECENT_KEY)) ?? '[]';

      const parsed = JSON.parse(raw) as string[];

      const next = [q.trim(), ...parsed.filter((i) => i !== q.trim())].slice(
        0,
        12,
      );

      await setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      await setItem(RECENT_KEY, JSON.stringify([q.trim()]));
    }
  }, []);

  const handleSelectRecent = React.useCallback(
    (q: string) => {
      setQuery(q);

      saveRecentSearch(q);

      Keyboard.dismiss();
    },
    [saveRecentSearch],
  );

  return (
    <AppScreen className="px-0">
      {/* Header */}
      <View className="border-b border-app-border px-5 pt-10 pb-4 dark:border-app-border-dark">
        <View className="flex-row items-center gap-3 pb-1">
          <AppBackButton onPress={() => router.back()} />

          <SearchInput
            value={query}
            onChange={setQuery}
            onSubmit={() => {
              saveRecentSearch(query);

              Keyboard.dismiss();
            }}
            onFilterPress={() => {
              Keyboard.dismiss();

              requestAnimationFrame(() => {
                setFilterVisible(true);
              });
            }}
            onClear={() => setQuery('')}
            className="flex-1"
          />
        </View>
      </View>

      {/* Tabs */}
      <SearchTabs
        activeTab={activeTab}
        onTabChange={(t) => {
          setActiveTab(t);

          Keyboard.dismiss();
        }}
      />

      {/* Content */}
      <KeyboardAwareContainer withKeyboardHeightPadding className="flex-1">
        <View className="flex-1 px-0">
          {isEmptyQuery ? (
            <View className="px-0">
              <RecentSearchList onSelectRecent={handleSelectRecent} />
            </View>
          ) : activeTab === 'users' ? (
            <UserSearchResult
              query={debouncedQuery}
              sortOrder={userFilter.sortOrder}
            />
          ) : activeTab === 'posts' ? (
            <PostSearchResult
              query={debouncedQuery}
              emotion={postFilter.emotion}
              sortOrder={postFilter.sortOrder}
            />
          ) : (
            <GroupSearchResult
              query={debouncedQuery}
              sortBy={groupFilter.sortBy}
              sortOrder={groupFilter.order}
            />
          )}
        </View>
      </KeyboardAwareContainer>

      {/* Filter Sheet */}
      {filterVisible ? (
        <SearchFilterSheet
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          activeTab={activeTab}
          userFilter={userFilter}
          postFilter={postFilter}
          groupFilter={groupFilter}
          onUserFilterChange={setUserFilter}
          onPostFilterChange={setPostFilter}
          onGroupFilterChange={setGroupFilter}
        />
      ) : null}
    </AppScreen>
  );
}
